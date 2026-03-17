import type { ListingData } from "./scraper";

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

  // Title status
  if (contains(fullText, [
    "clean title", "clear title", "lien-free", "lien free",
    "free and clear", "title in hand", "clean and clear",
  ])) {
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
    transScore += 8; transSignals.push("No reserve — seller confident in market");
  } else {
    transScore += 2; transSignals.push("Reserve auction");
  }

  // Seller replies — match against actual seller username from listing
  const sellerReplies = listing.comments.filter(c => c.startsWith("[SELLER]")).length;

  if (sellerReplies >= 3) {
    transScore += 6; transSignals.push("Seller actively answering questions");
  } else if (sellerReplies >= 1) {
    transScore += 3; transSignals.push("Seller present in comments");
  } else if (listing.comments.length > 0) {
    transSignals.push("⚠️ Seller not participating in comments");
  } else {
    transSignals.push("No comments yet to assess seller engagement");
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
    ];
    for (const pattern of mileagePatterns) {
      const m = fullText.match(pattern);
      if (m) {
        const val = parseInt(m[1].replace(/,/g, ""));
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

  // Accident/damage history
  if (contains(fullText, ["accident", "collision", "flood", "fire damage", "salvage"])) {
    condScore -= 7; condSignals.push("⚠️ Accident or damage history mentioned");
  }

  // Repaint isn't necessarily bad, but worth noting
  if (contains(fullText, ["repainted", "resprayed", "respray", "repaint"])) {
    condScore -= 2; condSignals.push("Repainted — verify quality and reason");
  }

  // ── 4. LISTING QUALITY (20 pts) ────────────────────────────────────────────
  let qualScore = 0;
  const qualSignals: string[] = [];

  // Description length — longer = more transparent
  const descWords = listing.description.split(/\s+/).length;
  if (descWords >= 300) { qualScore += 8; qualSignals.push(`Detailed description (${descWords} words)`); }
  else if (descWords >= 150) { qualScore += 5; qualSignals.push(`Moderate description (${descWords} words)`); }
  else if (descWords >= 75) { qualScore += 2; qualSignals.push(`Brief description (${descWords} words)`); }
  else { qualScore -= 2; qualSignals.push(`⚠️ Very short description (${descWords} words)`); }

  // Photo count — BaT loads gallery dynamically, HTML proxy is always an undercount
  // Score generously and never show a specific number (it will be wrong)
  const photoCount = listing.photoCountProxy;
  if (photoCount >= 20) { qualScore += 6; qualSignals.push("Extensive photo documentation"); }
  else if (photoCount >= 10) { qualScore += 5; qualSignals.push("Good photo coverage"); }
  else if (photoCount >= 4) { qualScore += 4; qualSignals.push("Photos present — view full gallery on listing"); }
  else { qualScore += 4; qualSignals.push("Gallery loads dynamically — view on listing"); }

  // Comment engagement — active BaT listings attract knowledgeable buyers
  const commentCount = listing.comments.length;
  if (commentCount >= 20) { qualScore += 6; qualSignals.push(`High community engagement (${commentCount} comments)`); }
  else if (commentCount >= 10) { qualScore += 4; qualSignals.push(`Active comments (${commentCount} comments)`); }
  else if (commentCount >= 3) { qualScore += 2; qualSignals.push(`Some community activity (${commentCount} comments)`); }
  else { qualSignals.push("Low comment activity"); }

  // ── 5. COMMUNITY RECEPTION (15 pts) ────────────────────────────────────────
  // Fully deterministic — no AI scoring here. Claude only writes the summary sentence.
  let commScore = 0;
  const commSignals: string[] = [];

  const totalComments = listing.comments.length;
  const sellerCommentCount = listing.comments.filter(c => c.startsWith("[SELLER]")).length;
  const nonSellerComments = listing.comments.filter(c => !c.startsWith("[SELLER]"));

  if (totalComments === 0) {
    commScore = 5; // neutral baseline, no data yet
    commSignals.push("No comments yet — neutral baseline");
  } else {
    // ── Engagement volume (0-4 pts) ──
    if (totalComments >= 30) { commScore += 4; commSignals.push(`High engagement: ${totalComments} comments`); }
    else if (totalComments >= 15) { commScore += 3; commSignals.push(`Good engagement: ${totalComments} comments`); }
    else if (totalComments >= 7) { commScore += 2; commSignals.push(`Moderate engagement: ${totalComments} comments`); }
    else { commScore += 1; commSignals.push(`Low engagement: ${totalComments} comments`); }

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
