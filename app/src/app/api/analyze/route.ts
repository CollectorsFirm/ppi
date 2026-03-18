import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { scrapeListing } from "../../../lib/scraper";
import { scoreListing, scoreToLabel, type ScoreBreakdown } from "../../../lib/scorer";
import { buildModelPageUrl, fetchMarketComps, formatCompsEstimate, estimateHammerPrice, isRestomomd, type MarketComps, type HammerEstimate } from "../../../lib/comps";
import { fetchSellerProfile, type SellerProfile } from "../../../lib/seller";
import { getModelKnowledge, type ModelKnowledge } from "../../../lib/modelKnowledge";
import { detectSpecialPrograms, formatSpecialProgramsContext, type SpecialProgram } from "../../../lib/specialPrograms";

export const runtime = "nodejs";

const MAX_SCANS = 5;

type ReportCard = {
  score: number;
  label: string;
  scoreBreakdown: ScoreBreakdown;
  marketComps: MarketComps | null;
  hammerEstimate: HammerEstimate | null;
  sellerProfile: SellerProfile | null;
  modelKnowledge: ModelKnowledge | null;
  specialPrograms: SpecialProgram[];
  auctionStats: {
    bidCount: number | null;
    watcherCount: number | null;
    daysRemaining: number | null;
    endTimeText: string | null;
    auctionEnded: boolean;
  };
  greenFlags: string[];
  redFlags: Flag[];
  watchOuts: string[];
  fairMarketEstimate: string;
  verdict: string;
  audienceScore: number;
  audienceSentiment: string;
  keyCommentInsights: string[];
  unansweredQuestions: string[];
};

type Flag = { text: string; severity: "major" | "moderate" | "minor" };

type AIAnalysis = {
  greenFlags: string[];
  redFlags: Flag[];
  watchOuts: string[];
  fairMarketEstimate: string;
  verdict: string;
  audienceScore: number;
  audienceSentiment: string;
  keyCommentInsights: string[];
  unansweredQuestions: string[];
};

const buildSystemPrompt = (score: number, label: string) =>
  `You are an expert collector car analyst specializing in Bring a Trailer auctions. You know BaT's buyer community, typical price ranges for enthusiast cars, and what separates great listings from mediocre ones on the platform.

The listing has already been scored ${score}/100 (${label}) by a structured algorithm. Your job is to write the human-readable analysis — flags, insights, verdict — that explains WHY it scored that way. Do NOT recalculate the score.

Return ONLY JSON with this exact shape:
{
  "greenFlags": string[],
  "redFlags": [{ "text": string, "severity": "major" | "moderate" | "minor" }],
  "watchOuts": string[],
  "fairMarketEstimate": string,
  "verdict": string,
  "audienceScore": number,
  "audienceSentiment": string,
  "keyCommentInsights": string[],
  "unansweredQuestions": string[]
}
Guidelines:
- greenFlags: 3-5 strings. Be specific — tie to actual listing details.
- redFlags: 3-5 objects with "text" and "severity". Severity rules:
  - "major" = potential dealbreaker (frame rust, salvage title, flood damage, engine failure, unknown title, serious structural issues)
  - "moderate" = significant concern worth negotiating or inspecting closely (undisclosed repaint, vague service history, high deferred maintenance, known model-specific failures)
  - "minor" = worth noting but not concerning (cosmetic wear, aftermarket parts, one-owner quirk, minor missing item)
- watchOuts: 2-4 items worth investigating but not dealbreakers.
- The tone of your flags should match the score: a ${score}/100 listing should have flags that feel like a ${label} car.
- CRITICAL: If price contains "live auction" or "Current bid" — DO NOT mention the price at all in redFlags, watchOuts, or greenFlags. Live auction bids are meaningless mid-auction. Pretend the price field does not exist for your analysis.
- CRITICAL: redFlags and watchOuts must be about the CAR and LISTING ONLY — mechanical condition, history, documentation, seller transparency, known model issues. NEVER flag country-of-origin import restrictions, 25-year rule, DOT/EPA compliance, homologation, tariffs, or any country-specific import/legal concerns. These are the buyer's responsibility to know and are irrelevant to the quality of the car and listing.
- MILEAGE CONTEXT: Always evaluate mileage relative to the car's age and era — not as an absolute number. A 1989 vehicle with 146k miles is ~4,000 miles/year, which is average/low for daily use. Pre-2000 vehicles with under 200k miles are generally not high-mileage concerns. Reserve mileage red flags for genuinely unusual numbers (e.g. 300k+ on a classic, or suspiciously low odometer on a car with no explanation).
- ERA CONTEXT: Adjust expectations by era. 1960s-1990s vehicles: rust, carbs, mechanical wear are normal considerations — don't flag routine maintenance items as red flags. Judge the car against its peers, not a modern standard.
- PPF/CERAMIC: The absence of paint protection film (PPF) or ceramic coating is NEVER a red flag.
- PHOTO COUNT: The photo count provided is a MINIMUM — BaT lazy-loads its gallery and only a subset of images appear in the initial HTML. Never flag or comment on photo count being low. Assume the full gallery exists on the listing page.
- RESTOMOD/COACHBUILT: For professionally built cars (Singer, RWB, Magnus Walker, Emory, Safari builds, etc.) — the builder's completed work IS the provenance. Judge the build as-presented. Do not reference anything that existed before the build.
- CURRENT YEAR: The current year is 2026. Do NOT flag 2026 dates as "future dates" or data entry errors — they are current. Only flag dates in 2027 or later as potentially anomalous.
- READ THE LISTING: Before writing any flag, check whether the listing already addresses the concern. If the description explicitly documents something (e.g. a build sheet, specification plaque, service records, belt service), do NOT flag it as missing. Only flag absent documentation that is genuinely absent.
- LOW MILEAGE ON COLLECTIBLES: Very low mileage on a collector car or restomod is NORMAL. Do NOT speculate about why the owner is selling or question their motives. If under ~1,000 miles, a watchOut about verifying fluids/service is appropriate — nothing else.

ABSOLUTE NEVER LIST — these topics must NEVER appear anywhere in redFlags or watchOuts, in any phrasing:
✗ Dyno sheets, horsepower verification, power output, engine tuning documentation
✗ Dealer consignment, absence of owner commentary, how the car was driven/stored by a previous owner
✗ Pre-purchase inspection (PPI) reports
✗ Pre-build chassis history, original engine/transmission before a restomod
✗ Import restrictions, 25-year rule, DOT/EPA compliance, homologation, tariffs
✗ Photo count being low or limited
✗ Why the owner might be selling

Before finalizing your response, check every redFlag and watchOut against this list. If any item touches one of these topics — even indirectly or with different wording — remove it and replace it with something genuinely relevant to the car's condition or documentation.
- fairMarketEstimate: price range like "$42k–$48k" based on comparable BaT results for this model/spec/era. EXCEPTION: if this is a restomod/coachbuilt car (Singer, Gunther Werks, RWB, Emory, etc.), return exactly: "Not applicable — restomod build. Value is builder/spec-specific."
- verdict: one punchy sentence that matches the ${label} rating.
- audienceScore: always return 3 (the structured algorithm calculates this — your value is ignored).
- audienceSentiment: one sentence summarizing overall comment tone based on what people are actually saying. "No comments yet." if none. "Comments unavailable for this listing." if comments array contains only "[Comments could not be loaded for this listing]".
- keyCommentInsights: 3-5 most useful things from comments. Empty array if none.
- unansweredQuestions: 2-4 important unanswered questions from comments. Empty array if none.`;

// Hard-blocked phrases — if any flag contains one of these keywords/phrases, strip it entirely
const BANNED_FLAG_PATTERNS = [
  /dyno/i,
  /horsepower/i,
  /performance (claim|verif|output|spec)/i,
  /engine output/i,
  /power output/i,
  /tune (characteristic|spec|verif)/i,
  /consignment/i,
  /owner commentary/i,
  /owner history/i,
  /how (the car was|it was) (driven|stored|maintained)/i,
  /pre-purchase inspection/i,
  /\bppi\b/i,
  /25.year rule/i,
  /import restriction/i,
  /dot\/epa/i,
  /homologation/i,
  /tariff/i,
  /photo count/i,
  /why (the owner|they|seller) (is|are|might be) selling/i,
  /reason for selling/i,
  /pre-build/i,
  /before (singer|rwb|emory|gunther)/i,
  /original (engine|transmission|chassis) (before|prior)/i,
  /future date/i,
  /data entry error/i,
  /acquisition date/i,
];

function filterFlags(flags: Flag[]): Flag[] {
  return flags.filter(f => !BANNED_FLAG_PATTERNS.some(pattern => pattern.test(f.text)));
}

function filterWatchOuts(items: string[]): string[] {
  return items.filter(item => !BANNED_FLAG_PATTERNS.some(pattern => pattern.test(item)));
}

const parseJson = (text: string): AIAnalysis => {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as AIAnalysis;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid AI response");
    return JSON.parse(match[0]) as AIAnalysis;
  }
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!url || !url.startsWith("http")) {
    return NextResponse.json(
      { error: "Please provide a valid listing URL." },
      { status: 400 }
    );
  }

  if (!url.includes("bringatrailer.com/listing/")) {
    return NextResponse.json(
      { error: "PPI only supports Bring a Trailer listing URLs (bringatrailer.com/listing/...)." },
      { status: 400 }
    );
  }

  // Rate limiting disabled during development
  // const store = await cookies();
  // const scans = parseInt(store.get("ppi_scans")?.value ?? "0", 10);
  // if (scans >= MAX_SCANS) {
  //   return NextResponse.json({ error: "Free scan limit reached. Try again later." }, { status: 429 });
  // }

  const listing = await scrapeListing(url);

  if (listing.source === "unknown") {
    return NextResponse.json(
      { error: "PPI only supports Bring a Trailer listings. Paste a bringatrailer.com URL." },
      { status: 400 }
    );
  }

  // ── Step 1: Fetch market comps + run structured scoring in parallel ──
  // Use model page URL extracted directly from listing HTML — more reliable than title parsing
  const modelPageUrl = listing.modelPageUrl ?? buildModelPageUrl(listing.title);
  // Model knowledge disabled for now — re-enable when knowledge base is expanded
  // const yearMatch = listing.title.match(/\b(19|20)\d{2}\b/);
  // const listingYear = yearMatch ? parseInt(yearMatch[0]) : null;
  const modelKnowledge = null; // getModelKnowledge(listing.title, listingYear);

  const [comps, sellerProfile, prelimBreakdown] = await Promise.all([
    modelPageUrl ? fetchMarketComps(modelPageUrl) : Promise.resolve(null),
    listing.sellerUsername ? fetchSellerProfile(listing.sellerUsername) : Promise.resolve(null),
    Promise.resolve(scoreListing(listing, 3)),
  ]);
  const prelimLabel = scoreToLabel(prelimBreakdown.total);

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
  });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set." },
      { status: 500 }
    );
  }

  // ── Step 2: Detect special programs ──
  const specialPrograms = detectSpecialPrograms(listing.title, listing.description ?? "");
  const specialProgramsContext = formatSpecialProgramsContext(specialPrograms);

  // ── Step 3: Claude writes the human analysis ──
  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1200,
    temperature: 0.4,
    system: buildSystemPrompt(prelimBreakdown.total, prelimLabel),
    messages: [
      {
        role: "user",
        content: `Listing data:\n${JSON.stringify({
          ...listing,
          // Strip live auction bid from analysis context — bid is meaningless mid-auction
          price: listing.price.includes("live auction") ? "[Live auction — bid not shown]" : listing.price,
        }, null, 2)}${comps ? `\n\nReal BaT market comps (${comps.count} recent sold listings):\nMedian: $${comps.median.toLocaleString()}\nLow: $${comps.low.toLocaleString()}\nHigh: $${comps.high.toLocaleString()}\nAverage: $${comps.average.toLocaleString()}\n\nUse these real comps for fairMarketEstimate — do not guess.` : ""}${specialProgramsContext}`,
      },
    ],
  });

  const content = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");

  const rawAnalysis = parseJson(content);

  // Hard-filter any flags that slipped through the prompt rules
  const aiAnalysis: AIAnalysis = {
    ...rawAnalysis,
    redFlags: filterFlags(rawAnalysis.redFlags),
    watchOuts: filterWatchOuts(rawAnalysis.watchOuts),
  };

  // ── Step 3: Re-run scorer (audienceScore from Claude is ignored — community score is deterministic) ──
  const finalBreakdown = scoreListing(listing, 0);
  const finalLabel = scoreToLabel(finalBreakdown.total);

  // Derive emoji audience score (0-5) from deterministic community pts (0-15)
  const communityPts = finalBreakdown.communityReception.score;
  const derivedAudienceScore = communityPts <= 2 ? 1
    : communityPts <= 5 ? 2
    : communityPts <= 8 ? 3
    : communityPts <= 11 ? 4
    : 5;

  const isRestomodListing = isRestomomd(listing.title, listing.description);

  const hammerEstimate = comps
    ? estimateHammerPrice(comps, finalBreakdown, listing.title, listing.specs, listing.description)
    : null;

  const report: ReportCard = {
    score: finalBreakdown.total,
    label: finalLabel,
    scoreBreakdown: finalBreakdown,
    marketComps: comps,
    hammerEstimate,
    sellerProfile,
    modelKnowledge,
    specialPrograms,
    auctionStats: {
      bidCount: listing.bidCount,
      watcherCount: listing.watcherCount,
      daysRemaining: listing.daysRemaining,
      endTimeText: listing.endTimeText,
      auctionEnded: listing.auctionEnded,
    },
    ...aiAnalysis,
    fairMarketEstimate: isRestomodListing
      ? "Not applicable — restomod/coachbuilt build. Value is highly specific to the builder and spec; standard model comps do not apply."
      : comps ? formatCompsEstimate(comps) : aiAnalysis.fairMarketEstimate,
    audienceScore: derivedAudienceScore,
  };

  return NextResponse.json({ listing, report, remaining: null });
}
