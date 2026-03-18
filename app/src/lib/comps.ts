export type CompListing = {
  price: number;
  title: string;
  year: number | null;
  url: string;
  noReserve: boolean;
};

export type MarketComps = {
  count: number;
  median: number;
  low: number;
  high: number;
  average: number;
  listings: CompListing[];
  modelPageUrl: string;
};

// Build the BaT model page URL from a listing title
// e.g. "No Reserve: 1989 Jeep Grand Wagoneer" → "https://bringatrailer.com/jeep/grand-wagoneer/"
export function buildModelPageUrl(title: string): string | null {
  // Strip "No Reserve:" prefix and common noise
  const clean = title
    .replace(/^no reserve:\s*/i, "")
    .replace(/\bfor sale\b/i, "")
    .trim();

  // Extract year + make + model — e.g. "1989 Jeep Grand Wagoneer"
  const match = clean.match(/^(\d{4})\s+([A-Za-z]+)\s+(.+)/);
  if (!match) return null;

  const make = match[2].toLowerCase().replace(/[^a-z0-9]+/g, "-");
  // Model: take first 3-4 words, slugify
  const modelWords = match[3]
    .toLowerCase()
    .split(/\s+/)
    .slice(0, 4)
    .join("-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/-$/, "");

  return `https://bringatrailer.com/${make}/${modelWords}/`;
}

export async function fetchMarketComps(modelPageUrl: string): Promise<MarketComps | null> {
  try {
    const res = await fetch(`${modelPageUrl}?result=sold`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html",
        "Referer": "https://bringatrailer.com/",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Extract all listing JSON objects with current_bid
    const objects = html.matchAll(/\{[^{}]*"current_bid"[^{}]*\}/g);
    const sold: CompListing[] = [];

    for (const match of objects) {
      try {
        const d = JSON.parse(match[0]) as {
          active?: boolean;
          current_bid?: number;
          title?: string;
          year?: number | string;
          url?: string;
          noreserve?: boolean;
        };
        if (d.active === false && d.current_bid && d.current_bid > 0) {
          const t = (d.title ?? "").toLowerCase();
          // Exclude parts, accessories, wheels, engines, seats, etc.
          const isPartOrAccessory = [
            "wheel", "wheels", "rim", "rims", "tire", "tires",
            "seat", "seats", "engine", "motor", "transmission", "gearbox",
            "part", "parts", "accessory", "accessories", "body panel",
            "bumper", "hood", "door", "fender", "trunk lid", "decklid",
            "exhaust", "intake", "turbo", "supercharger",
            "instrument", "gauge", "cluster", "steering wheel",
          ].some(kw => t.includes(kw)) && !t.match(/^\d{4}\s/); // year prefix = full car

          if (!isPartOrAccessory) {
            sold.push({
              price: d.current_bid,
              title: d.title ?? "",
              year: d.year ? parseInt(String(d.year)) : null,
              url: d.url ?? "",
              noReserve: !!d.noreserve,
            });
          }
        }
      } catch {
        // skip malformed
      }
    }

    if (sold.length === 0) return null;

    const prices = sold.map((s) => s.price).sort((a, b) => a - b);
    const sum = prices.reduce((a, b) => a + b, 0);
    const median =
      prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];

    return {
      count: sold.length,
      median: Math.round(median),
      low: prices[0],
      high: prices[prices.length - 1],
      average: Math.round(sum / prices.length),
      listings: sold.slice(0, 10), // top 10 for reference
      modelPageUrl,
    };
  } catch {
    return null;
  }
}

export type HammerEstimate = {
  estimate: number;
  low: number;
  high: number;
  confidence: "high" | "medium" | "low";
  factors: string[];
};

// Known restomod/coachbuilt builders whose market is entirely separate from stock comps
const RESTOMOD_BUILDERS = [
  // Porsche
  "singer", "gunther werks", "guntherwerks", "rwb", "rauh-welt",
  "emory motorsports", "emory outlaw", "magnus walker", "urban outlaw",
  "theon design", "dp motorsport", "tuthill", "heritage motorsport",
  "450 motorsport", "canepa", "ruf", "bisimoto", "rothmans werks",
  "kaege retro", "paul stephens", "adventus", "9ff",
  // Ferrari / Italian
  "pogea racing", "ares design", "touring superleggera", "mansory",
  // Japanese
  "rocket bunny", "pandem", "liberty walk", "lb★works", "lb works",
  "tra kyoto",
  // American
  "icon 4x4", "kindig-it", "ringbrothers", "chip foose",
  "roadster shop", "speedkore", "salvaggio design", "galpin motors",
  // Resto-EV / Electrified
  "charge cars", "lunaz", "everrati", "zero labs",
  // Other coachbuilders
  "alfaholics", "totem automobili", "rml group", "kimera automobili",
  "redux", "backdraft",
];

export function isRestomomd(title: string, description: string): boolean {
  const haystack = (title + " " + description).toLowerCase();
  return RESTOMOD_BUILDERS.some(b => haystack.includes(b));
}

export function estimateHammerPrice(
  comps: MarketComps,
  scoreBreakdown: {
    documentation: { score: number; max: number };
    transparency: { score: number; max: number };
    condition: { score: number; max: number };
    listingQuality: { score: number; max: number };
    communityReception: { score: number; max: number };
  },
  listingTitle: string,
  listingSpecs: string[],
  listingDescription?: string
): HammerEstimate {
  // ── Restomod/coachbuilt: stock comps are meaningless ──
  if (isRestomomd(listingTitle, listingDescription ?? "")) {
    return {
      estimate: comps.median,
      low: comps.median,
      high: comps.median,
      confidence: "low",
      factors: ["Restomod/coachbuilt build detected — standard model comps do not apply. Value is build-specific and highly variable."],
    };
  }

  let base = comps.median;
  const factors: string[] = [];
  let multiplier = 1.0;

  // ── No Reserve: historically drives bids 8-12% higher on BaT ──
  const isNoReserve = listingSpecs.some(s => s.toLowerCase().includes("no reserve")) ||
    listingTitle.toLowerCase().includes("no reserve");
  if (isNoReserve) {
    multiplier += 0.08;
    factors.push("No reserve (+8% — competitive bidding expected)");
  } else {
    multiplier -= 0.04;
    factors.push("Reserve auction (−4% — reserve may cap bidding)");
  }

  // ── Documentation quality ──
  const docRatio = scoreBreakdown.documentation.score / scoreBreakdown.documentation.max;
  if (docRatio >= 0.8) {
    multiplier += 0.07;
    factors.push("Strong documentation (+7%)");
  } else if (docRatio >= 0.5) {
    multiplier += 0.03;
    factors.push("Moderate documentation (+3%)");
  } else {
    multiplier -= 0.05;
    factors.push("Thin documentation (−5%)");
  }

  // ── Condition signals ──
  const condRatio = scoreBreakdown.condition.score / scoreBreakdown.condition.max;
  if (condRatio >= 0.8) {
    multiplier += 0.06;
    factors.push("Strong condition signals (+6%)");
  } else if (condRatio >= 0.5) {
    // neutral
  } else {
    multiplier -= 0.06;
    factors.push("Condition concerns (−6%)");
  }

  // ── Community reception ──
  const commRatio = scoreBreakdown.communityReception.score / scoreBreakdown.communityReception.max;
  if (commRatio >= 0.8) {
    multiplier += 0.06;
    factors.push("High community interest (+6%)");
  } else if (commRatio >= 0.5) {
    multiplier += 0.02;
    factors.push("Moderate community interest (+2%)");
  }

  // ── Dealer vs private ──
  const isDealer = listingTitle.toLowerCase().includes("dealer") ||
    listingSpecs.some(s => s.toLowerCase().includes("dealer"));
  if (isDealer) {
    multiplier -= 0.04;
    factors.push("Dealer listing (−4%)");
  }

  const estimate = Math.round((base * multiplier) / 500) * 500; // round to nearest $500

  // ── Confidence based on comp count ──
  const confidence: "high" | "medium" | "low" =
    comps.count >= 15 ? "high" : comps.count >= 7 ? "medium" : "low";

  // ── Range: tighter with more comps ──
  const rangePct = confidence === "high" ? 0.12 : confidence === "medium" ? 0.18 : 0.25;
  const range = Math.round((estimate * rangePct) / 500) * 500;

  return {
    estimate,
    low: estimate - range,
    high: estimate + range,
    confidence,
    factors,
  };
}

export function formatCompsEstimate(comps: MarketComps): string {
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  // Use 25th-75th percentile as the "fair range"
  const prices = comps.listings.map((l) => l.price).sort((a, b) => a - b);
  const allPrices = prices; // already sorted
  const p25 = allPrices[Math.floor(allPrices.length * 0.25)];
  const p75 = allPrices[Math.floor(allPrices.length * 0.75)];

  if (p25 && p75 && p25 !== p75) {
    return `${fmt(p25)}–${fmt(p75)} (median ${fmt(comps.median)}, based on ${comps.count} BaT sales)`;
  }
  return `~${fmt(comps.median)} (median of ${comps.count} BaT sales)`;
}
