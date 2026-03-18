import type { ListingData } from "./scraper";
import { detectSpecialPrograms } from "./specialPrograms";

export type ScoreBreakdown = {
  total: number;
  documentation: { score: number; max: number; signals: string[] };
  transparency: { score: number; max: number; signals: string[] };
  condition: { score: number; max: number; signals: string[] };
  listingQuality: { score: number; max: number; signals: string[] };
  communityReception: { score: number; max: number; signals: string[] };
};

const contains = (text: string, terms: string[]): boolean =>
  terms.some((t) => text.toLowerCase().includes(t.toLowerCase()));

const countMatches = (text: string, terms: string[]): number =>
  terms.filter((t) => text.toLowerCase().includes(t.toLowerCase())).length;

export function scoreListing(listing: ListingData, audienceScore: number): ScoreBreakdown {
  const desc = listing.description.toLowerCase();
  const fullText = `${listing.title} ${listing.description} ${listing.specs.join(" ")} ${listing.comments.join(" ")}`.toLowerCase();

  // ── 1. DOCUMENTATION (25 pts) ──────────────────────────────────────────────
  let docScore = 0;
  const docSignals: string[] = [];

  // Service / maintenance records — broad BaT seller language
  if (contains(fullText, [
    "service record", "service history", "maintenance record", "maintenance history",
    "accompanied by", "comes with", "included with", "includes records",
    "binder of", "folder of", "stack of", "collection of records",
    "documented", "well-documented", "fully documented",
    "receipts for", "invoices for", "paperwork",
  ])) {
    docScore += 8; docSignals.push("Service records / documentation mentioned");
  }

  // Original paperwork & collectibles
  if (contains(fullText, [
    "original manual", "owner's manual", "owner manual", "window sticker",
    "build sheet", "monroney", "original books", "original paperwork",
    "original window", "manufacturer sticker", "data plate",
  ])) {
    docScore += 5; docSignals.push("Original documentation present");
  }

  // Title status — handle "clean Florida title", "clean California title", etc.
  const hasClearTitle = contains(fullText, [
    "clean title", "clear title", "lien-free", "lien free",
    "free and clear", "title in hand", "clean and clear",
  ]) || /clean\s+\w+\s+title/.test(fullText); // "clean Florida title", "clean Texas title", etc.
  if (hasClearTitle) {
    docScore += 6; docSignals.push("Clean title confirmed");
  }

  // Vehicle history reports
  if (contains(fullText, [
    "carfax", "autocheck", "vehicle history", "history report",
    "one owner", "1 owner", "single owner", "two owner", "2 owner",
  ])) {
    docScore += 4; docSignals.push("Vehicle history / ownership documented");
  }

  // General receipts/invoices
  if (contains(fullText, [
    "receipts", "invoices", "records on hand", "records available",
    "have records", "has records", "maintenance done", "recent work done",
  ])) {
    docScore += 3; docSignals.push("Receipts or maintenance records on hand");
  }

  // Notable previous owner provenance — celebrity, athlete, racing driver, etc.
  // BaT commonly uses "Ex-[Name]" in the title; descriptions elaborate with who they are
  const hasNotableOwner =
    /^(no reserve:\s*)?ex-/i.test(listing.title) ||
    contains(fullText, [
      "previously owned by", "former owner", "originally owned by",
      "originally purchased by", "acquired new by", "delivered new to",
      "celebrity", "race driver", "racing driver", "nascar", "formula 1", "f1 driver",
      "indycar", "imsa", "le mans driver", "factory driver",
      "nfl", "nba", "mlb", "professional athlete",
    ]);
  if (hasNotableOwner) {
    docScore += 4; docSignals.push("Notable previous owner — adds provenance and collectibility");
  }

  // Special program documentation — confirms authenticity of bespoke factory programs
  const detectedPrograms = detectSpecialPrograms(listing.title, listing.description);
  if (detectedPrograms.length > 0) {
    const programNames = detectedPrograms.map(p => p.name).join(", ");
    // Check if documentation for the program is confirmed in the listing
    const hasProgramDocs = contains(fullText, [
      "specification plaque", "personalization plaque", "personalization specifications plaque",
      "tailor made plaque", "tailor made equipment", "tailor made documentation",
      "classiche", "red book", "coa", "certificate of authenticity",
      "porsche passport", "window sticker", "build sheet", "order sheet",
      "ad personam", "exclusive manufaktur documentation", "mso certificate",
      "factory colors", "factory options", "factory specification",
    ]);
    if (hasProgramDocs) {
      docScore += 5; docSignals.push(`${programNames} documentation confirmed`);
    } else {
      docScore += 2; docSignals.push(`${programNames} detected — verify documentation`);
    }
  }

  // Negative signals
  if (contains(fullText, [
    "unknown history", "unknown mileage", "no records", "no history",
    "unknown title", "records unavailable", "no documentation",
    "no paperwork", "don't have records",
  ])) {
    docScore -= 8; docSignals.push("⚠️ Unknown/missing history");
  }
  if (contains(fullText, ["as-is", "as is", "sold as-is"])) {
    docScore -= 4; docSignals.push("⚠️ Sold as-is");
  }

  // ── 2. SELLER TRANSPARENCY (20 pts) ────────────────────────────────────────
  let transScore = 0;
  const transSignals: string[] = [];

  // No-reserve is a strong positive signal on BaT
  if (contains(`${listing.title} ${fullText}`, ["no reserve", "no-reserve"])) {
    transScore += 6; transSignals.push("No reserve — seller confident in market");
  } else {
    transScore += 2; transSignals.push("Reserve auction");
  }

  // Seller replies — only penalize if auction is mature (has meaningful comment activity)
  // Early auctions (few comments, days remaining) shouldn't be penalized for seller silence
  const sellerReplies = listing.comments.filter(c => c.startsWith("[SELLER]")).length;
  const isEarlyAuction = (listing.daysRemaining !== null && listing.daysRemaining >= 6) ||
    listing.comments.length <= 5;

  if (sellerReplies >= 3) {
    transScore += 8; transSignals.push("Seller actively answering questions");
  } else if (sellerReplies >= 1) {
    transScore += 5; transSignals.push("Seller present in comments");
  } else if (isEarlyAuction) {
    transScore += 3; transSignals.push("Early auction — seller engagement not yet expected");
  } else if (listing.comments.length > 0) {
    transSignals.push("⚠️ Seller not participating in comments");
  } else {
    transScore += 3; transSignals.push("No comments yet");
  }

  // Penalize vague or evasive language
  const vagueCount = countMatches(desc, ["believed to be", "appears to be", "seems to", "may have", "possibly", "we think", "not sure"]);
  if (vagueCount >= 3) {
    transScore -= 6; transSignals.push(`⚠️ ${vagueCount} vague/hedged claims in description`);
  } else if (vagueCount >= 1) {
    transScore -= 2; transSignals.push(`${vagueCount} hedged claim(s) in description`);
  }

  // Reward specific disclosures (known issues = honest seller)
  if (contains(desc, ["known issue", "minor issue", "small crack", "needs", "deferred", "will need"])) {
    transScore += 4; transSignals.push("Seller discloses known issues — honest");
  }

  // ── 3. CONDITION SIGNALS (20 pts) ──────────────────────────────────────────
  // Start at neutral (10/20) — unknown condition is not a red flag
  let condScore = 10;
  const condSignals: string[] = [];

  // Mileage scoring — check specs first, then scrape from full text
  const mileageSpec = listing.specs.find(s => s.toLowerCase().includes("mileage"));
  let mileage: number | null = null;

  if (mileageSpec) {
    const mMatch = mileageSpec.match(/([0-9,]+)/);
    if (mMatch) mileage = parseInt(mMatch[1].replace(/,/g, ""));
  }

  // Fallback: extract mileage from description or title
  if (mileage === null) {
    const mileagePatterns = [
      /(\d{1,3}(?:,\d{3})*)\s*(?:original\s+)?miles?\b/i,
      /(\d{1,3}(?:,\d{3})*)-mile\b/i,
      /odometer[^0-9]*(\d{1,3}(?:,\d{3})*)/i,
      // Handle shorthand: "18k-mile", "18k miles", "18K miles"
      /(\d+(?:\.\d+)?)[kK]-?miles?\b/i,
      /(\d+(?:\.\d+)?)[kK]\s+miles?\b/i,
    ];
    for (const pattern of mileagePatterns) {
      const m = fullText.match(pattern);
      if (m) {
        let val: number;
        // k-suffix patterns — multiply by 1000
        if (pattern.source.includes('[kK]')) {
          val = Math.round(parseFloat(m[1]) * 1000);
        } else {
          val = parseInt(m[1].replace(/,/g, ""));
        }
        if (val > 100 && val < 999999) { mileage = val; break; }
      }
    }
  }

  // Mileage thresholds are relative — extract year from title to contextualize
  const yearMatch2 = listing.title.match(/\b(19|20)(\d{2})\b/);
  const carYear = yearMatch2 ? parseInt(yearMatch2[0]) : null;
  const currentYear = new Date().getFullYear();
  const carAge = carYear ? currentYear - carYear : null;

  if (mileage !== null) {
    const milesPerYear = carAge && carAge > 0 ? mileage / carAge : null;

    if (milesPerYear !== null) {
      // Judge by miles/year relative to age — ~8k-12k/yr is average
      if (milesPerYear < 3000) { condScore += 7; condSignals.push(`Very low use: ${Math.round(milesPerYear).toLocaleString()} mi/yr avg`); }
      else if (milesPerYear < 7000) { condScore += 4; condSignals.push(`Below-average use: ${Math.round(milesPerYear).toLocaleString()} mi/yr avg`); }
      else if (milesPerYear < 12000) { condScore += 1; condSignals.push(`Average use: ${mileage.toLocaleString()} miles`); }
      else if (milesPerYear < 18000) { condScore -= 2; condSignals.push(`Above-average use: ${Math.round(milesPerYear).toLocaleString()} mi/yr avg`); }
      else { condScore -= 4; condSignals.push(`⚠️ Heavy use: ${Math.round(milesPerYear).toLocaleString()} mi/yr avg`); }
    } else {
      // No year context — use absolute thresholds conservatively
      if (mileage < 50000) { condScore += 5; condSignals.push(`Low mileage: ${mileage.toLocaleString()} miles`); }
      else if (mileage < 150000) { condScore += 1; condSignals.push(`Moderate mileage: ${mileage.toLocaleString()} miles`); }
      else { condScore -= 1; condSignals.push(`Higher mileage: ${mileage.toLocaleString()} miles`); }
    }
  } else {
    condSignals.push("Mileage not specified");
  }

  // Rust signals
  if (contains(fullText, ["rust-free", "rust free", "no rust", "solid body", "dry climate", "arizona", "california", "nevada", "southwest", "texas"])) {
    condScore += 3; condSignals.push("Rust-free / favorable climate history");
  }
  if (contains(fullText, ["surface rust", "some rust", "rust present", "rust on", "rust in", "minor rust"])) {
    condScore -= 3; condSignals.push("⚠️ Rust mentioned");
  }
  if (contains(fullText, ["significant rust", "heavy rust", "frame rust", "floor rust", "structural rust"])) {
    condScore -= 7; condSignals.push("⚠️ Significant rust disclosed");
  }

  // Recent mechanical work (positive — maintained/refreshed)
  if (contains(fullText, ["recently rebuilt", "freshly rebuilt", "new engine", "rebuilt engine", "overhauled", "refreshed", "fuel injection", "new suspension", "brake overhaul", "restored"])) {
    condScore += 3; condSignals.push("Recent mechanical work / restoration");
  }

  // Aftermarket ECU tune — legitimate concern on any high-value car
  if (contains(fullText, ["ecu tune", "ecu remap", "aftermarket tune", "aftermarket ecu", "engine tune", "remapped", "chipped", "performance tune"])) {
    condScore -= 2; condSignals.push("⚠️ Aftermarket ECU tune — warranty, reliability, and resale implications");
  }

  // Accident/damage history — check for positive mentions only (not "free of accidents", "no accidents", etc.)
  const hasAccident = /(accident|collision|flood damage|fire damage|\bsalvage\b)/.test(fullText) &&
    !/(free of accidents?|no accidents?|accident.free|no collision|no flood|clean carfax|carfax.*free|free.*carfax)/.test(fullText);
  if (hasAccident) {
    condScore -= 7; condSignals.push("⚠️ Accident or damage history mentioned");
  }

  // Repaint isn't necessarily bad, but worth noting
  if (contains(fullText, ["repainted", "resprayed", "respray", "repaint"])) {
    condScore -= 2; condSignals.push("Repainted — verify quality and reason");
  }

  // ── 4. LISTING QUALITY (20 pts) ────────────────────────────────────────────
  // This measures information completeness — how much does the listing answer before
  // a buyer has to ask? A 20/20 listing leaves no obvious questions on the table.
  let qualScore = 0;
  const qualSignals: string[] = [];

  // ── Mechanical spec completeness (0-5 pts) ──
  // Does the listing tell you exactly what's under the hood?
  let mechPts = 0;
  if (contains(fullText, ["engine", "motor", "cylinder", "displacement", "cubic", "liter", "cc", "v8", "v6", "v12", "flat-six", "inline-six", "boxer"])) mechPts++;
  if (contains(fullText, ["transmission", "gearbox", "manual", "automatic", "dual-clutch", "dct", "pdk", "f1", "tiptronic", "transaxle"])) mechPts++;
  if (contains(fullText, ["miles", "mileage", "kilometer", "odometer"])) mechPts++;
  if (contains(fullText, ["vin", "chassis", "serial number", "zff", "wp0", "jh4"])) mechPts++;
  if (contains(fullText, ["options", "equipped with", "features", "includes", "spec sheet", "specification"])) mechPts++;
  qualScore += mechPts;
  if (mechPts >= 4) qualSignals.push("Full mechanical spec disclosed");
  else if (mechPts >= 2) qualSignals.push(`Partial mechanical spec (${mechPts}/5 elements)`);
  else qualSignals.push("⚠️ Limited mechanical information");

  // ── Condition disclosure completeness (0-5 pts) ──
  // Does the seller tell you about paint, interior, known flaws, and recent work?
  let condDiscPts = 0;
  if (contains(fullText, ["paint", "exterior", "finish", "bodywork", "body work"])) condDiscPts++;
  if (contains(fullText, ["interior", "cabin", "upholstery", "leather", "seats", "carpet"])) condDiscPts++;
  if (contains(fullText, ["mechanical", "runs", "drives", "engine", "recently serviced", "fresh service", "just serviced"])) condDiscPts++;
  // Bonus: proactive flaw disclosure (honest seller)
  if (contains(fullText, ["imperfect", "scratch", "scuff", "wear", "crack", "chip", "ding", "dent", "blemish", "noted in gallery", "highlighted in gallery"])) {
    condDiscPts += 2; qualSignals.push("Seller proactively discloses imperfections");
  }
  qualScore += Math.min(condDiscPts, 5);
  if (condDiscPts >= 3 && !qualSignals.some(s => s.includes("discloses"))) qualSignals.push("Paint, interior, and mechanical condition described");
  else if (condDiscPts < 2) qualSignals.push("⚠️ Condition details sparse");

  // ── History completeness (0-4 pts) ──
  let histPts = 0;
  if (contains(fullText, ["one owner", "1 owner", "two owner", "single owner", "owned since", "purchased new", "bought new", "original owner"])) histPts++;
  if (contains(fullText, ["carfax", "autocheck", "vehicle history", "clean history", "accident-free", "accident free", "no accidents"])) histPts++;
  if (contains(fullText, ["california", "arizona", "nevada", "texas", "florida", "dry climate", "southwestern", "west coast", "southeast"])) histPts++; // climate provenance
  if (contains(fullText, ["acquired", "purchased", "bought", "previously owned", "prior owner", "from new"])) histPts++;
  qualScore += Math.min(histPts, 4);
  if (histPts >= 3) qualSignals.push("Strong ownership and history context");
  else if (histPts >= 1) qualSignals.push("Some ownership history provided");
  else qualSignals.push("⚠️ Ownership history not established");

  // ── Special program / provenance documentation (0-3 pts) ──
  // Does the listing document the things that matter most for this specific car?
  if (contains(fullText, ["window sticker", "monroney", "build sheet", "spec sheet", "order sheet", "coa", "certificate of authenticity"])) {
    qualScore += 3; qualSignals.push("Window sticker / factory build documentation confirmed");
  } else if (contains(fullText, [
    "specification plaque", "personalization plaque", "personalization specifications plaque",
    "tailor made plaque", "tailor made equipment", "factory colors", "factory options",
    "classiche", "red book", "porsche passport",
  ])) {
    qualScore += 3; qualSignals.push("Factory personalization / provenance documentation confirmed");
  } else if (contains(fullText, ["tailor made", "paint to sample", "pts", "exclusive manufaktur", "ad personam", "bmw individual", "q division", "mso"])) {
    qualScore += 1; qualSignals.push("Special program mentioned — documentation pending");
  }

  // ── Unanswered question penalty (−3 pts) ──
  // If comments are full of basic questions the listing should have answered, dock it
  const unansweredBasics = listing.comments.filter(c =>
    !c.startsWith("[SELLER]") && c.includes("?") &&
    contains(c, ["window sticker", "mileage", "service", "how many", "where is", "what color", "vin", "carfax", "history"])
  ).length;
  if (unansweredBasics >= 3) {
    qualScore -= 3; qualSignals.push(`⚠️ Buyers asking basic questions the listing should answer (${unansweredBasics} instances)`);
  }

  // ── 5. COMMUNITY RECEPTION (15 pts) ────────────────────────────────────────
  // Fully deterministic — no AI scoring here. Claude only writes the summary sentence.
  let commScore = 0;
  const commSignals: string[] = [];

  // ── Watcher count — strong demand signal (0-4 pts) ──
  // Normalize relative to what's typical on BaT (50 = decent, 150 = hot, 300+ = exceptional)
  if (listing.watcherCount !== null) {
    if (listing.watcherCount >= 300) { commScore += 4; commSignals.push(`Exceptional demand: ${listing.watcherCount} watchers`); }
    else if (listing.watcherCount >= 150) { commScore += 3; commSignals.push(`High demand: ${listing.watcherCount} watchers`); }
    else if (listing.watcherCount >= 75) { commScore += 2; commSignals.push(`Good interest: ${listing.watcherCount} watchers`); }
    else if (listing.watcherCount >= 25) { commScore += 1; commSignals.push(`${listing.watcherCount} watchers`); }
    else { commSignals.push(`Low watcher count: ${listing.watcherCount}`); }
  }

  const totalComments = listing.comments.length;
  const sellerCommentCount = listing.comments.filter(c => c.startsWith("[SELLER]")).length;
  const nonSellerComments = listing.comments.filter(c => !c.startsWith("[SELLER]"));

  if (totalComments === 0) {
    commSignals.push("No comments yet");
  } else {
    // ── Engagement volume (0-3 pts) ──
    if (totalComments >= 30) { commScore += 3; commSignals.push(`High engagement: ${totalComments} comments`); }
    else if (totalComments >= 15) { commScore += 2; commSignals.push(`Good engagement: ${totalComments} comments`); }
    else if (totalComments >= 7) { commScore += 1; commSignals.push(`Moderate engagement: ${totalComments} comments`); }
    else { commSignals.push(`Early activity: ${totalComments} comments`); }

    // ── Seller responsiveness (0-4 pts) ──
    if (totalComments > 0) {
      const responseRate = sellerCommentCount / totalComments;
      if (sellerCommentCount >= 5) { commScore += 4; commSignals.push(`Seller very responsive: ${sellerCommentCount} replies`); }
      else if (sellerCommentCount >= 3) { commScore += 3; commSignals.push(`Seller responsive: ${sellerCommentCount} replies`); }
      else if (sellerCommentCount >= 1) { commScore += 1; commSignals.push(`Seller replied ${sellerCommentCount} time(s)`); }
      else { commSignals.push("⚠️ Seller has not replied to any comments"); }
    }

    // ── Positive sentiment keywords (0-4 pts) ──
    const positiveTerms = [
      "beautiful", "gorgeous", "stunning", "love this", "love it", "want this",
      "glwts", "glws", "good luck", "fantastic", "excellent", "perfect",
      "well done", "nicely done", "impressive", "clean", "solid", "great find",
      "wish i could", "tempting", "amazing", "dream car", "rare find",
    ];
    const negativeTerms = [
      "pass", "overpriced", "too much", "way too much", "hard pass",
      "worried about", "concerned about", "sketchy", "suspicious",
      "red flag", "walk away", "avoid", "run away", "not worth",
      "disappointing", "poor", "terrible", "worst", "scam",
    ];

    const positiveHits = nonSellerComments.filter(c => contains(c, positiveTerms)).length;
    const negativeHits = nonSellerComments.filter(c => contains(c, negativeTerms)).length;
    const sentimentNet = positiveHits - negativeHits;

    if (sentimentNet >= 5) { commScore += 4; commSignals.push(`Strong positive sentiment (${positiveHits} enthusiastic comments)`); }
    else if (sentimentNet >= 2) { commScore += 3; commSignals.push(`Positive sentiment (${positiveHits} positive vs ${negativeHits} negative)`); }
    else if (sentimentNet >= 0) { commScore += 2; commSignals.push(`Neutral-positive community reaction`); }
    else if (sentimentNet >= -2) { commScore += 1; commSignals.push(`Mixed community reaction`); }
    else { commScore -= 2; commSignals.push(`⚠️ Negative community sentiment (${negativeHits} skeptical comments)`); }

    // ── Question/concern ratio (0-3 pts) ──
    const questionComments = nonSellerComments.filter(c => c.includes("?")).length;
    const answeredQuestions = nonSellerComments.filter(c => c.includes("?") && 
      listing.comments.some(r => r.startsWith("[SELLER]"))).length;

    if (questionComments === 0) {
      commScore += 3; commSignals.push("No outstanding questions raised");
    } else if (sellerCommentCount > 0 && sellerCommentCount >= questionComments * 0.5) {
      commScore += 2; commSignals.push(`Seller addressing questions (${sellerCommentCount} replies to ${questionComments} questions)`);
    } else if (questionComments <= 3) {
      commScore += 1; commSignals.push(`${questionComments} question(s) in comments`);
    } else {
      commSignals.push(`⚠️ ${questionComments} questions — verify seller responses`);
    }
  }

  // ── TOTALS ──────────────────────────────────────────────────────────────────
  // Clamp each category to its max
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const docFinal = clamp(docScore, 0, 25);
  const transFinal = clamp(transScore, 0, 20);
  const condFinal = clamp(condScore, 0, 20);
  const qualFinal = clamp(qualScore, 0, 20);
  const commFinal = clamp(commScore, 0, 15);

  const total = docFinal + transFinal + condFinal + qualFinal + commFinal;

  return {
    total,
    documentation: { score: docFinal, max: 25, signals: docSignals },
    transparency: { score: transFinal, max: 20, signals: transSignals },
    condition: { score: condFinal, max: 20, signals: condSignals },
    listingQuality: { score: qualFinal, max: 20, signals: qualSignals },
    communityReception: { score: commFinal, max: 15, signals: commSignals },
  };
}

export function scoreToLabel(score: number): string {
  if (score >= 80) return "Strong Buy";
  if (score >= 65) return "Good";
  if (score >= 45) return "Proceed with Caution";
  return "Walk Away";
}
