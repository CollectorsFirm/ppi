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

// Special program premium multipliers — applied on top of base comp median
const SPECIAL_PROGRAM_PREMIUMS: Record<string, { pct: number; label: string }> = {
  // Ferrari
  "Ferrari Tailor Made":          { pct: 0.25, label: "Tailor Made (+25% — fully bespoke factory spec)" },
  "Ferrari Atelier":              { pct: 0.40, label: "Ferrari Atelier one-off (+40%)" },
  "Ferrari Classiche Certified":  { pct: 0.12, label: "Classiche Certified (+12% — factory-authenticated provenance)" },
  "Ferrari PTS (Paint-to-Sample)":{ pct: 0.12, label: "Ferrari PTS (+12% — rare factory color)" },
  "Ferrari Fiorano Package":      { pct: 0.06, label: "Fiorano Package (+6%)" },
  "Ferrari XX Program":           { pct: 0.00, label: "XX Program — comps not applicable" },
  // Porsche
  "Porsche PTS (Paint-to-Sample)":           { pct: 0.18, label: "Porsche PTS (+18% — rare factory color)" },
  "Porsche Exclusive Manufaktur":            { pct: 0.10, label: "Exclusive Manufaktur (+10%)" },
  "Porsche Weissach Package":                { pct: 0.20, label: "Weissach Package (+20%)" },
  "Porsche GT Silver Program / Special Wishes": { pct: 0.08, label: "GT Special Wishes (+8%)" },
  "Porsche Certificate of Authenticity (CoA)":  { pct: 0.04, label: "CoA documented (+4%)" },
  // BMW
  "BMW Individual":               { pct: 0.08, label: "BMW Individual (+8%)" },
  "BMW M Performance / CSL":      { pct: 0.15, label: "M CSL/CS (+15% — limited production)" },
  // McLaren
  "McLaren MSO (McLaren Special Operations)": { pct: 0.12, label: "MSO (+12%)" },
  // Lamborghini
  "Lamborghini Ad Personam":      { pct: 0.08, label: "Ad Personam (+8%)" },
  // Bentley
  "Bentley Mulliner":             { pct: 0.15, label: "Mulliner (+15%)" },
  // Mercedes
  "Mercedes-AMG Manufaktur":      { pct: 0.08, label: "AMG Manufaktur (+8%)" },
  // Honda
  "Honda S2000 CR (Club Racer)":  { pct: 0.20, label: "S2000 CR (+20%)" },
  "Honda NSX Type R / NSX-R":     { pct: 1.50, label: "NSX-R (+150% — 2–3× standard NSX value)" },
};

// Variant-specific premiums — when title/description indicates a rarer sub-model
// brands: array of strings that must appear in the listing (any one match is sufficient)
// Empty brands array = applies to any make
// Source: Grant — Director of Market Intelligence, Collectors Firm (2026-03-17)
// Based on Hagerty valuations, BaT auction data, and market consensus
const VARIANT_PREMIUMS: Array<{ keywords: string[]; brands: string[]; pct: number; label: string }> = [
  // ── PORSCHE body style adjustments ───────────────────────────────────────
  // Targa: sliding roof mechanism, structural compromise vs coupe (Grant: -5%, HIGH confidence)
  {
    keywords: ["targa"],
    brands: ["porsche"],
    pct: -0.05,
    label: "Targa (−5% vs coupe — roof mechanism and structural compromise)",
  },
  // Cabriolet: heavier, softer, less desirable to enthusiasts
  // Air-cooled (964/993): -10% | Water-cooled (996+): -5% (Grant: HIGH confidence)
  {
    keywords: ["cabriolet", "convertible"],
    brands: ["porsche"],
    pct: -0.05,
    label: "Cabriolet (−5% vs coupe — less desirable to Porsche enthusiasts)",
  },

  // ── PORSCHE GT variants (premiums vs base comp median) ────────────────────
  // GT3 RS: +30% over GT3, GT3 is ~80% over base Carrera — combined ~25% over median comp
  { keywords: ["gt3 rs"],          brands: ["porsche"], pct: 0.30, label: "GT3 RS (+30% over base GT3 — Grant/BaT data)" },
  // GT2 RS: 150-200% over base Carrera — comps will be Carrera-based, apply large multiplier
  { keywords: ["gt2 rs"],          brands: ["porsche"], pct: 0.60, label: "GT2 RS (+60% over comp median — Grant: 150-200% vs base Carrera)" },
  // GT3: ~80% over base Carrera on 991 gen (Grant: HIGH confidence)
  { keywords: ["gt3"],             brands: ["porsche"], pct: 0.25, label: "GT3 (+25% over comp median — Grant: ~80% over base Carrera)" },
  { keywords: ["gt4"],             brands: ["porsche"], pct: 0.12, label: "GT4 (+12% over base Cayman)" },
  // Carrera RS 2.7: +80% over base (Grant: HIGH)
  { keywords: ["rs 2.7", "rs2.7"], brands: ["porsche"], pct: 0.80, label: "Carrera RS 2.7 (+80% — Grant: most collectible 911s, HIGH confidence)" },
  // Carrera RS (generic, covers 964 RS +80%, 993 RS +100% — use 80% as floor)
  { keywords: ["carrera rs"],      brands: ["porsche"], pct: 0.80, label: "Carrera RS (+80% — Grant: 964 RS 80%, 993 RS 100%, HIGH confidence)" },

  // ── FERRARI variants ──────────────────────────────────────────────────────
  // GTS / Spider: +12-15% over coupe (Grant: 458 Spider ~12%, HIGH-MEDIUM confidence)
  {
    keywords: ["gts", "spider", "spyder"],
    brands: ["ferrari"],
    pct: 0.12,
    label: "Ferrari open-top (+12% — Spider/GTS premium, Grant/BaT data)",
  },
  // Challenge Stradale: 2-3x base 360 — use 150% (Grant: HIGH confidence)
  { keywords: ["challenge stradale"], brands: ["ferrari"], pct: 1.50, label: "Challenge Stradale (+150% — Grant: 2-3x base 360, HIGH confidence)" },
  // Scuderia: +60% over base 430 (Grant: HIGH confidence)
  { keywords: ["scuderia"],           brands: ["ferrari"], pct: 0.60, label: "Ferrari Scuderia (+60% — Grant: HIGH confidence)" },
  // Pista: +80% over base 488 (Grant: HIGH confidence)
  { keywords: ["pista"],              brands: ["ferrari"], pct: 0.80, label: "Ferrari Pista (+80% — Grant: HIGH confidence)" },
  // Speciale: +90% over base 458 (Grant: HIGH confidence)
  { keywords: ["speciale"],           brands: ["ferrari"], pct: 0.90, label: "Ferrari Speciale (+90% — Grant: HIGH confidence)" },
  // Aperta: +35% over hardtop equivalent (Grant: MEDIUM confidence)
  { keywords: ["aperta"],             brands: ["ferrari"], pct: 0.35, label: "Ferrari Aperta (+35% — Grant: MEDIUM confidence)" },

  // ── LAMBORGHINI variants ──────────────────────────────────────────────────
  // GTS/Spider/Spyder: +5-10% (Gallardo Spyder ~parity; Huracán Spyder slight premium)
  {
    keywords: ["spyder", "roadster"],
    brands: ["lamborghini"],
    pct: 0.05,
    label: "Lamborghini open-top (+5% — Grant: Spyder holds slight premium)",
  },
  // SVJ: +80% over base Aventador (Grant: HIGH confidence)
  { keywords: ["svj"],              brands: ["lamborghini"], pct: 0.80, label: "Aventador SVJ (+80% — Grant: HIGH confidence)" },
  // SV: +40% over base (Grant: HIGH confidence)
  { keywords: ["sv", "superveloce"], brands: ["lamborghini"], pct: 0.40, label: "Superveloce (+40% — Grant: HIGH confidence)" },
  // STO: +50% over LP610-4 (Grant: HIGH confidence)
  { keywords: ["sto"],              brands: ["lamborghini"], pct: 0.50, label: "Huracán STO (+50% — Grant: HIGH confidence)" },
  // Performante: +30% over LP610-4 (Grant: HIGH confidence)
  { keywords: ["performante"],      brands: ["lamborghini"], pct: 0.30, label: "Performante (+30% — Grant: HIGH confidence)" },
  // Superleggera (Gallardo): +25% (Grant: MEDIUM confidence)
  { keywords: ["superleggera"],     brands: ["lamborghini"], pct: 0.25, label: "Superleggera (+25% — Grant: MEDIUM confidence)" },

  // ── BMW M variants ────────────────────────────────────────────────────────
  // M3/M4 CSL: +40% (Grant: HIGH confidence — homologation special)
  { keywords: ["m3 csl", "m4 csl"],  brands: ["bmw"], pct: 0.40, label: "CSL (+40% — Grant: homologation special, HIGH confidence)" },
  // 1M: +30% (Grant: HIGH confidence)
  { keywords: ["1m coupe", "1m "],   brands: ["bmw"], pct: 0.30, label: "1M (+30% — Grant: HIGH confidence)" },
  // M2 CS: +20% (Grant: HIGH confidence)
  { keywords: ["m2 cs"],             brands: ["bmw"], pct: 0.20, label: "M2 CS (+20% — Grant: HIGH confidence)" },
  // M3/M4 Competition: +5% (Grant: MEDIUM confidence)
  { keywords: ["m3 competition", "m4 competition"], brands: ["bmw"], pct: 0.05, label: "M Competition (+5%)" },

  // ── MERCEDES-AMG variants ─────────────────────────────────────────────────
  { keywords: ["black series"],      brands: ["mercedes"], pct: 0.40, label: "Black Series (+40%)" },
  { keywords: ["gt r", "gtr"],       brands: ["mercedes"], pct: 0.25, label: "AMG GT R (+25%)" },
  { keywords: ["gt black"],          brands: ["mercedes"], pct: 0.50, label: "AMG GT Black Series (+50%)" },

  // ── HONDA variants ────────────────────────────────────────────────────────
  // S2000 CR: +20% (Grant confirms, MEDIUM-HIGH confidence)
  { keywords: ["club racer", "s2000 cr"], brands: ["honda"], pct: 0.20, label: "S2000 CR (+20% — Grant: MEDIUM-HIGH confidence)" },
  { keywords: ["type r"],                 brands: ["honda", "acura"], pct: 0.20, label: "Type R (+20%)" },

  // ── LAMBORGHINI Miura variants (Grant research, 2026-03-17) ──────────────
  // Baseline: P400 coupe
  { keywords: ["p400sv", "miura sv"],       brands: ["lamborghini"], pct: 0.45,  label: "Miura SV (+45% — Grant: most desirable production Miura, HIGH)" },
  { keywords: ["p400s", "miura s"],         brands: ["lamborghini"], pct: 0.12,  label: "Miura S (+12% — Grant: improved over P400, HIGH)" },
  { keywords: ["miura jota", "svj"],        brands: ["lamborghini"], pct: 6.00,  label: "Miura Jota/SVJ (+600% — Grant: effectively untradeable at standard benchmarks)" },

  // ── LAMBORGHINI Countach variants (Grant research, 2026-03-17) ───────────
  // Baseline: LP400S Series 3
  { keywords: ["lp400", "periscopio"],           brands: ["lamborghini"], pct:  0.85,  label: "Countach LP400 Periscopio (+85% — Grant: narrow body, purist's choice, HIGH)" },
  { keywords: ["quattrovalvole", "qv"],          brands: ["lamborghini"], pct: -0.18,  label: "Countach QV (−18% — Grant: most produced, supply depresses value, HIGH)" },
  { keywords: ["25th anniversary"],              brands: ["lamborghini"], pct: -0.12,  label: "Countach 25th Anniversary (−12% — Grant: divisive styling, HIGH)" },

  // ── LAMBORGHINI Diablo variants (Grant research, 2026-03-17) ─────────────
  // Baseline: Diablo VT coupe
  { keywords: ["diablo gtr", "diablo gt r"],     brands: ["lamborghini"], pct:  2.50,  label: "Diablo GTR (+250% — Grant: 30 built, track-only, HIGH)" },
  { keywords: ["se30 jota"],                     brands: ["lamborghini"], pct:  1.10,  label: "Diablo SE30 Jota (+110% — Grant: ~12 built, HIGH)" },
  { keywords: ["diablo gt "],                    brands: ["lamborghini"], pct:  1.85,  label: "Diablo GT (+185% — Grant: 80 built, pinnacle Diablo, HIGH)" },
  { keywords: ["se30"],                          brands: ["lamborghini"], pct:  0.65,  label: "Diablo SE30 (+65% — Grant: 30th anniversary, 150 built, HIGH)" },
  { keywords: ["diablo sv"],                     brands: ["lamborghini"], pct:  0.20,  label: "Diablo SV (+20% — Grant: driver's car, gaining momentum, HIGH)" },
  { keywords: ["vt 6.0", "6.0 se"],             brands: ["lamborghini"], pct:  0.35,  label: "Diablo VT 6.0 (+35% — Grant: Audi-era final evolution, HIGH)" },

  // ── LAMBORGHINI Murciélago variants (Grant research, 2026-03-17) ─────────
  // Baseline: Murciélago base coupe
  { keywords: ["lp670", "murci\u00e9lago sv", "murcielago sv"], brands: ["lamborghini"], pct: 0.80, label: "Murciélago LP670-4 SV (+80% — Grant: pinnacle Murciélago)" },
  { keywords: ["lp650"],                         brands: ["lamborghini"], pct:  0.80,  label: "Murciélago LP650-4 Roadster (+80% — Grant: final roadster, 50 built)" },
  { keywords: ["lp640"],                         brands: ["lamborghini"], pct:  0.25,  label: "Murciélago LP640 (+25% — Grant: 640hp, preferred over base, HIGH)" },
  { keywords: ["murci\u00e9lago roadster", "murcielago roadster"], brands: ["lamborghini"], pct: 0.20, label: "Murciélago Roadster (+20% — Grant: open-top premium, HIGH)" },

  // ── PORSCHE 930 variants (Grant research, 2026-03-17) ─────────────────────
  // Baseline: mid-run 930 Turbo
  { keywords: ["flachbau", "slant nose", "slantnose", "flat nose", "flatnose"], brands: ["porsche"], pct: 0.60, label: "930 Flatnose/Slantnose (+60% — Grant: factory M505/M506 option, HIGH)" },

  // ── PORSCHE 356 variants (Grant research, 2026-03-17) ─────────────────────
  // Baseline: 356 coupe
  { keywords: ["speedster"],                 brands: ["porsche"], pct: 0.70, label: "356 Speedster (+70% vs coupe — Grant: most desirable body style, HIGH)" },
  { keywords: ["356 cabriolet", "356 cab"],  brands: ["porsche"], pct: 0.25, label: "356 Cabriolet (+25% vs coupe — Grant: HIGH)" },
  { keywords: ["carrera 2.0", "carrera gt", "type 547", "carrera engine", "356 carrera"], brands: ["porsche"], pct: 1.50, label: "356 Carrera engine (+150% — Grant: DOHC Type 547, stratospheric premium, HIGH)" },
  { keywords: ["super 90", "super90"],       brands: ["porsche"], pct: 0.15, label: "356 Super 90 (+15% — Grant: MEDIUM)" },

  // ── PORSCHE 914 variants (Grant research, 2026-03-17) ─────────────────────
  { keywords: ["914/6", "914-6"],            brands: ["porsche"], pct: 0.80, label: "914/6 (+80% vs 914/4 — Grant: 3,300 built, flat-six, HIGH)" },
  { keywords: ["914/6 gt", "914-6 gt"],      brands: ["porsche"], pct: 5.00, label: "914/6 GT (+500% — Grant: 16 works cars, ~$1M, HIGH)" },

  // ── PORSCHE 968 variants (Grant research, 2026-03-17) ─────────────────────
  { keywords: ["968 cs", "968 club sport"],  brands: ["porsche"], pct: 0.55, label: "968 Club Sport (+55% — Grant: 200 lbs lighter, HIGH)" },

  // ── FERRARI 308/328 variants (Grant research, 2026-03-17) ────────────────
  // Baseline: 308 GTBi/GTSi (injection)
  { keywords: ["vetroresina"],               brands: ["ferrari"], pct: 0.80, label: "308 Vetroresina (+80% — Grant: fiberglass body, ~712 built, HIGH)" },
  { keywords: ["308 gtb"],                   brands: ["ferrari"], pct: 0.08, label: "308 GTB (+8% vs GTS — Grant: coupe rarer than targa, MEDIUM)" },

  // ── FERRARI Testarossa family (Grant research, 2026-03-17) ───────────────
  // Baseline: Testarossa
  { keywords: ["f512 m", "512 m"],           brands: ["ferrari"], pct: 0.70, label: "F512 M (+70% vs 512 TR — Grant: 501 built, last and rarest, HIGH)" },
  { keywords: ["512 tr"],                    brands: ["ferrari"], pct: 0.35, label: "512 TR (+35% vs Testarossa — Grant: better dynamics, HIGH)" },
  { keywords: ["monospecchio"],              brands: ["ferrari"], pct: 0.20, label: "Testarossa Monospecchio (+20% — Grant: single-mirror early cars, MEDIUM)" },

  // ── FERRARI F355 variants (Grant research, 2026-03-17) ───────────────────
  // Baseline: F355 Spider F1
  { keywords: ["f355 gts", "355 gts"],       brands: ["ferrari"], pct: 0.48, label: "F355 GTS (+48% vs Spider — Grant: rarest body style, MEDIUM)" },
  { keywords: ["f355 berlinetta", "355 berlinetta"], brands: ["ferrari"], pct: 0.10, label: "F355 Berlinetta (+10% vs Spider — Grant: HIGH)" },

  // ── MERCEDES 300SL (Grant research, 2026-03-17) ───────────────────────────
  { keywords: ["gullwing", "300 sl gullwing", "300sl gullwing"], brands: ["mercedes"], pct: 0.40, label: "300SL Gullwing (+40% vs Roadster — Grant: iconic, museum piece, HIGH)" },

  // ── MERCEDES Pagoda (Grant research, 2026-03-17) ──────────────────────────
  // Baseline: 280SL
  { keywords: ["230sl", "230 sl"],           brands: ["mercedes"], pct: -0.41, label: "230SL (−41% vs 280SL — Grant: least powerful, HIGH)" },
  { keywords: ["250sl", "250 sl"],           brands: ["mercedes"], pct: -0.37, label: "250SL (−37% vs 280SL — Grant: rarer but less refined, HIGH)" },
];

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
  listingDescription?: string,
  specialPrograms?: Array<{ name: string }>
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

  // ── Special factory programs — applied first as foundational premium ──
  if (specialPrograms && specialPrograms.length > 0) {
    for (const program of specialPrograms) {
      const premium = SPECIAL_PROGRAM_PREMIUMS[program.name];
      if (premium && premium.pct > 0) {
        multiplier += premium.pct;
        factors.push(premium.label);
      }
    }
  }

  // ── Variant premium — GTS, Spider, RS, CS, etc. command more than base model comps ──
  // Only applies when the open-top body style is a SUB-VARIANT of a model that also came closed.
  // Exclude models that were roadster/convertible-only from the factory — no coupe baseline exists.
  const ROADSTER_ONLY_MODELS = [
    "z8", "z3 m roadster", "z3 roadster", "z4 m roadster",
    "boxster", // base Boxster is always open; Cayman is the coupe
    "s2000",   // always a roadster
    "miata", "mx-5", "mx5",
    "lotus elise", "lotus exige", "lotus evora", // open by default
    "ferrari barchetta",
    "lamborghini murcielago roadster",
    "mc12", // always open
  ];
  const haystack = (listingTitle + " " + (listingDescription ?? "")).toLowerCase();
  const isRoadsterOnly = ROADSTER_ONLY_MODELS.some(m => haystack.includes(m));

  if (!isRoadsterOnly) {
    let appliedPositiveVariant = false;
    for (const variant of VARIANT_PREMIUMS) {
      // Brand must match if specified
      if (variant.brands.length > 0 && !variant.brands.some(b => haystack.includes(b))) continue;
      if (variant.keywords.some(kw => haystack.includes(kw))) {
        if (variant.pct < 0) {
          // Penalties always apply regardless of other matches
          multiplier += variant.pct;
          factors.push(variant.label);
        } else if (!appliedPositiveVariant) {
          // Only apply the first (highest) positive variant premium
          const alreadyCovered = specialPrograms?.some(p =>
            SPECIAL_PROGRAM_PREMIUMS[p.name]?.pct >= variant.pct
          );
          if (!alreadyCovered) {
            multiplier += variant.pct;
            factors.push(variant.label);
            appliedPositiveVariant = true;
          }
        }
      }
    }
  }

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

  // ── Notable previous owner provenance ──
  const hasNotableOwner =
    /^(no reserve:\s*)?ex-/i.test(listingTitle) ||
    /(previously owned by|former owner|originally owned by|originally purchased by|acquired new by|delivered new to|celebrity|race driver|racing driver|nascar|formula 1|f1 driver|indycar|professional athlete|nfl|nba|mlb)/i.test(haystack);
  if (hasNotableOwner) {
    multiplier += 0.10;
    factors.push("Notable previous owner (+10% provenance premium)");
  }

  // ── Tiptronic penalty on air-cooled Porsches (964, 993) ──
  // Manual is strongly preferred; Tiptronic commands ~10% less on these generations
  // ── Transmission adjustments (Grant research, 2026-03-17) ──────────────────

  // Porsche Tiptronic — manual strongly preferred across all generations
  // 964: -12%, 993: -10%, 996/997: -8% (use -10% as general Porsche penalty)
  if (/porsche/i.test(listingTitle) && /tiptronic/i.test(haystack)) {
    multiplier -= 0.10;
    factors.push("Tiptronic transmission (−10% — Grant: manual strongly preferred, HIGH confidence)");
  }

  // Ferrari manual vs F1 paddle shift
  // 360 manual: +20%, 430 manual: +15% (Grant: HIGH confidence)
  const isFerrari = /ferrari/i.test(listingTitle);
  const hasManual = /\b(manual|gated|6.speed|5.speed|stick.shift)\b/i.test(haystack);
  const hasF1Shift = /\bf1.?(transmission|gearbox|paddle|shift|gear)\b/i.test(haystack);
  if (isFerrari && hasManual && /(360|430)/i.test(listingTitle)) {
    multiplier += 0.18;
    factors.push("Ferrari manual gearbox (+18% — Grant: manual 360/430 commands ~15-20% premium over F1, HIGH confidence)");
  }

  // BMW E46 M3 SMG discount (Grant: -10%, HIGH confidence)
  if (/bmw/i.test(listingTitle) && /m3/i.test(listingTitle) && /\bsmg\b/i.test(haystack)) {
    multiplier -= 0.10;
    factors.push("SMG transmission (−10% — Grant: aging sequential gearbox, manual preferred, HIGH confidence)");
  }

  // Lamborghini Gallardo manual — commands ~40% premium over e-gear (Grant: MEDIUM confidence)
  const isGallardo = /gallardo/i.test(listingTitle);
  const hasEGear = /e.gear|egear/i.test(haystack);
  const hasGatedManual = /\bgated\b/i.test(haystack) || (/\bmanual\b/i.test(haystack) && isGallardo);
  if (isGallardo && hasGatedManual && !hasEGear) {
    multiplier += 0.40;
    factors.push("Gallardo gated manual (+40% — Grant: factory manual extremely rare, commands large premium, MEDIUM confidence)");
  }

  // 930 Turbo 1989 (final year, G50 gearbox) commands ~20% over mid-run cars
  if (/porsche/i.test(listingTitle) && /930/i.test(listingTitle)) {
    const yr = listingTitle.match(/\b(19\d{2})\b/);
    if (yr && parseInt(yr[1]) === 1989) {
      multiplier += 0.20;
      factors.push("930 Turbo 1989 (+20% — Grant: final year, G50 gearbox, most desirable, HIGH)");
    }
  }

  // Toyota Supra MKIV manual vs auto (Grant: HIGH confidence)
  if (/supra/i.test(listingTitle) && /\bmanual\b/i.test(haystack)) {
    multiplier += 0.25;
    factors.push("Supra MKIV manual (+25% — Grant: manual commands significant premium over auto, HIGH)");
  }

  // NSX manual vs auto (NA1 era — Grant: HIGH confidence)
  if (/\bnsx\b/i.test(listingTitle) && /\bmanual\b/i.test(haystack) && !/type.?r/i.test(haystack)) {
    multiplier += 0.15;
    factors.push("NSX manual (+15% — Grant: manual preferred over auto, HIGH)");
  }

  // E30 M3 Sport Evolution (Grant: +40% over standard E30 M3, HIGH)
  if (/e30/i.test(haystack) && /m3/i.test(listingTitle) && /sport.?evo/i.test(haystack)) {
    multiplier += 0.40;
    factors.push("E30 M3 Sport Evolution (+40% — Grant: homologation special, most valuable E30 M3, HIGH)");
  }

  // BMW 850CSi vs 840/850i (Grant: +35% premium, HIGH)
  if (/bmw/i.test(listingTitle) && /850csi/i.test(haystack)) {
    multiplier += 0.35;
    factors.push("850CSi (+35% vs 840/850i — Grant: M70 V12, rarest 8-series, HIGH)");
  }

  // C2 Corvette fuel injection premium (Grant: +20%, HIGH)
  if (/corvette/i.test(listingTitle) && /(fuel.inject|fuelie)/i.test(haystack)) {
    multiplier += 0.20;
    factors.push("C2 Corvette fuel injection (+20% — Grant: 'Fuelie' premium, HIGH)");
  }

  // Shelby GT350R vs GT350 (Grant: +30%, HIGH)
  if (/shelby/i.test(listingTitle) && /gt350r/i.test(haystack)) {
    multiplier += 0.30;
    factors.push("GT350R (+30% vs GT350 — Grant: race-prepared, track-only option, HIGH)");
  }

  // 1969 Camaro COPO (Grant: +80-200% over base, HIGH)
  if (/camaro/i.test(listingTitle) && /copo/i.test(haystack)) {
    multiplier += 1.20;
    factors.push("COPO Camaro (+120% — Grant: central office production order, HIGH)");
  }

  // Honda 190E Cosworth (Grant: +40% over base 190E, HIGH)
  if (/190e/i.test(listingTitle) && /(cosworth|2\.3.16|2\.5.16)/i.test(haystack)) {
    multiplier += 0.40;
    factors.push("190E Cosworth (+40% vs base 190E — Grant: HIGH)");
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
