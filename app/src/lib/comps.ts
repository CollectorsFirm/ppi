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
  // Targa: sliding roof mechanism, structural compromise vs coupe (Grant: -5%)
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
  { keywords: ["gt3 rs"],          brands: ["porsche"], pct: 0.30, label: "GT3 RS (+30% over base GT3)" },
  // GT2 RS: 150-200% over base Carrera — comps will be Carrera-based, apply large multiplier
  { keywords: ["gt2 rs"],          brands: ["porsche"], pct: 0.60, label: "GT2 RS (+60% — 150-200% over base Carrera)" },
  // GT3: ~80% over base Carrera on 991 gen (Grant: HIGH confidence)
  { keywords: ["gt3"],             brands: ["porsche"], pct: 0.25, label: "GT3 (+25% over comp median)" },
  { keywords: ["gt4"],             brands: ["porsche"], pct: 0.12, label: "GT4 (+12% over base Cayman)" },
  // Carrera RS 2.7: +80% over base (Grant: HIGH)
  { keywords: ["rs 2.7", "rs2.7"], brands: ["porsche"], pct: 0.80, label: "Carrera RS 2.7 (+80% — most collectible 911s)" },
  // Carrera RS (generic, covers 964 RS +80%, 993 RS +100% — use 80% as floor)
  { keywords: ["carrera rs"],      brands: ["porsche"], pct: 0.80, label: "Carrera RS (+80% — generation-specific keywords above take priority)" },

  // ── FERRARI variants ──────────────────────────────────────────────────────
  // GTS / Spider: +12-15% over coupe
  {
    keywords: ["gts", "spider", "spyder"],
    brands: ["ferrari"],
    pct: 0.12,
    label: "Ferrari open-top (+12% — Spider/GTS premium)",
  },
  // Challenge Stradale: 2-3x base 360
  { keywords: ["challenge stradale"], brands: ["ferrari"], pct: 1.50, label: "360 Challenge Stradale (+150% — 2-3x base 360, 399 built)" },
  // NOTE: Scuderia, Pista, Speciale, Aperta are model-specific — handled in dynamic logic below

  // ── LAMBORGHINI variants ──────────────────────────────────────────────────
  // GTS/Spider/Spyder: +5-10% (Gallardo Spyder ~parity; Huracán Spyder slight premium)
  {
    keywords: ["spyder", "roadster"],
    brands: ["lamborghini"],
    pct: 0.05,
    label: "Lamborghini open-top (+5% — Spyder premium)",
  },
  // SVJ: +80% over base Aventador (Grant: HIGH confidence)
  { keywords: ["svj"],              brands: ["lamborghini"], pct: 0.80, label: "Aventador SVJ (+80%)" },
  // SV: +40% over base (Grant: HIGH confidence)
  { keywords: ["sv", "superveloce"], brands: ["lamborghini"], pct: 0.40, label: "Superveloce (+40%)" },
  // STO: +50% over LP610-4 (Grant: HIGH confidence)
  { keywords: ["sto"],              brands: ["lamborghini"], pct: 0.50, label: "Huracán STO (+50%)" },
  // Performante: +30% over LP610-4 (Grant: HIGH confidence)
  { keywords: ["performante"],      brands: ["lamborghini"], pct: 0.30, label: "Performante (+30%)" },
  // Superleggera (Gallardo): +25% (Grant: MEDIUM confidence)
  { keywords: ["superleggera"],     brands: ["lamborghini"], pct: 0.25, label: "Superleggera (+25%)" },

  // ── BMW M variants ────────────────────────────────────────────────────────
  // M3/M4 CSL: +40% (Grant: HIGH confidence — homologation special)
  { keywords: ["m3 csl", "m4 csl"],  brands: ["bmw"], pct: 0.40, label: "CSL (+40% — homologation special)" },
  // 1M: +30% (Grant: HIGH confidence)
  { keywords: ["1m coupe", "1m "],   brands: ["bmw"], pct: 0.30, label: "1M (+30%)" },
  // M2 CS: +20% (Grant: HIGH confidence)
  { keywords: ["m2 cs"],             brands: ["bmw"], pct: 0.20, label: "M2 CS (+20%)" },
  // M3/M4 Competition: +5% (Grant: MEDIUM confidence)
  { keywords: ["m3 competition", "m4 competition"], brands: ["bmw"], pct: 0.05, label: "M Competition (+5%)" },

  // ── MERCEDES-AMG variants ─────────────────────────────────────────────────
  { keywords: ["black series"],      brands: ["mercedes"], pct: 0.40, label: "Black Series (+40%)" },
  { keywords: ["gt r", "gtr"],       brands: ["mercedes"], pct: 0.25, label: "AMG GT R (+25%)" },
  { keywords: ["gt black"],          brands: ["mercedes"], pct: 0.50, label: "AMG GT Black Series (+50%)" },

  // ── HONDA variants ────────────────────────────────────────────────────────
  // S2000 CR: +20% (Grant confirms, MEDIUM-HIGH confidence)
  { keywords: ["club racer", "s2000 cr"], brands: ["honda"], pct: 0.20, label: "S2000 CR (+20%)" },
  { keywords: ["type r"],                 brands: ["honda", "acura"], pct: 0.20, label: "Type R (+20%)" },

  // ── LAMBORGHINI Miura variants (Grant research, 2026-03-17) ──────────────
  // Baseline: P400 coupe
  { keywords: ["p400sv", "miura sv"],       brands: ["lamborghini"], pct: 0.45,  label: "Miura SV (+45% — most desirable production Miura)" },
  { keywords: ["p400s", "miura s"],         brands: ["lamborghini"], pct: 0.12,  label: "Miura S (+12%)" },
  { keywords: ["miura jota", "svj"],        brands: ["lamborghini"], pct: 6.00,  label: "Miura Jota/SVJ (+600% — effectively untradeable at standard benchmarks)" },

  // ── LAMBORGHINI Countach variants (Grant research, 2026-03-17) ───────────
  // Baseline: LP400S Series 3
  { keywords: ["lp400", "periscopio"],           brands: ["lamborghini"], pct:  0.85,  label: "Countach LP400 Periscopio (+85% — narrow body, purist's choice)" },
  { keywords: ["quattrovalvole", "qv"],          brands: ["lamborghini"], pct: -0.18,  label: "Countach QV (−18% — most produced, highest supply)" },
  { keywords: ["25th anniversary"],              brands: ["lamborghini"], pct: -0.12,  label: "Countach 25th Anniversary (−12% — divisive styling)" },

  // ── LAMBORGHINI Diablo variants (Grant research, 2026-03-17) ─────────────
  // Baseline: Diablo VT coupe
  { keywords: ["diablo gtr", "diablo gt r"],     brands: ["lamborghini"], pct:  2.50,  label: "Diablo GTR (+250% — 30 built, track-only)" },
  { keywords: ["se30 jota"],                     brands: ["lamborghini"], pct:  1.10,  label: "Diablo SE30 Jota (+110% — ~12 built)" },
  { keywords: ["diablo gt "],                    brands: ["lamborghini"], pct:  1.85,  label: "Diablo GT (+185% — 80 built, pinnacle Diablo)" },
  { keywords: ["se30"],                          brands: ["lamborghini"], pct:  0.65,  label: "Diablo SE30 (+65% — 30th anniversary, 150 built)" },
  { keywords: ["diablo sv"],                     brands: ["lamborghini"], pct:  0.20,  label: "Diablo SV (+20%)" },
  { keywords: ["vt 6.0", "6.0 se"],             brands: ["lamborghini"], pct:  0.35,  label: "Diablo VT 6.0 (+35% — Audi-era final evolution)" },

  // ── LAMBORGHINI Murciélago variants (Grant research, 2026-03-17) ─────────
  // Baseline: Murciélago base coupe
  { keywords: ["lp670", "murci\u00e9lago sv", "murcielago sv"], brands: ["lamborghini"], pct: 0.80, label: "Murciélago LP670-4 SV (+80% — pinnacle Murciélago)" },
  { keywords: ["lp650"],                         brands: ["lamborghini"], pct:  0.80,  label: "Murciélago LP650-4 Roadster (+80% — final roadster, 50 built)" },
  { keywords: ["lp640"],                         brands: ["lamborghini"], pct:  0.25,  label: "Murciélago LP640 (+25%)" },
  { keywords: ["murci\u00e9lago roadster", "murcielago roadster"], brands: ["lamborghini"], pct: 0.20, label: "Murciélago Roadster (+20%)" },

  // ── PORSCHE 930 variants (Grant research, 2026-03-17) ─────────────────────
  // Baseline: mid-run 930 Turbo
  { keywords: ["flachbau", "slant nose", "slantnose", "flat nose", "flatnose"], brands: ["porsche"], pct: 0.60, label: "930 Flatnose/Slantnose (+60% — factory M505/M506 option)" },

  // ── PORSCHE 356 variants (Grant research, 2026-03-18 expanded) ─────────────
  // Baseline: 356B coupe
  { keywords: ["speedster"],                                                            brands: ["porsche"], pct:  0.70, label: "356 Speedster (+70% — most desirable body style)" },
  { keywords: ["356 cabriolet", "356 cab"],                                             brands: ["porsche"], pct:  0.25, label: "356 Cabriolet (+25%)" },
  { keywords: ["carrera 2.0", "carrera gt", "type 547", "carrera engine", "356 carrera"], brands: ["porsche"], pct: 1.50, label: "356 Carrera engine (+150% — DOHC Type 547)" },
  { keywords: ["super 90", "super90"],                                                  brands: ["porsche"], pct:  0.15, label: "356 Super 90 (+15%)" },
  { keywords: ["pre-a", "pre a", "gmünd", "gmund"],                                    brands: ["porsche"], pct:  0.60, label: "356 Pre-A (+60% — earliest Porsches, extreme rarity)" },
  { keywords: ["356a", "356 a"],                                                        brands: ["porsche"], pct:  0.10, label: "356A generation (+10% — curved windshield era)" },
  { keywords: ["356c", "356 c", "356sc", "356 sc"],                                    brands: ["porsche"], pct: -0.05, label: "356C/SC (−5% — most refined but highest survival rate)" },
  { keywords: ["roadster", "convertible d", "convertible-d"],                           brands: ["porsche"], pct:  0.40, label: "356 Roadster/Convertible D (+40% — ~1,300 built, rarer than Cabriolet)" },
  { keywords: ["1600s", "1600 s", "super 75", "super75"],                              brands: ["porsche"], pct:  0.10, label: "356 1600S/Super 75 (+10% — 75hp sport engine)" },
  { keywords: ["carrera 2", "carrera2", "2000gs", "2000 gs"],                          brands: ["porsche"], pct:  2.00, label: "356 Carrera 2/2000GS (+200% — 2.0L quad-cam, <130 built)" },

  // ── PORSCHE 912 variants (Grant research, 2026-03-18) ──────────────────────
  // NOTE: 912 comp pool is 912-specific; this discount only applies if accidentally matched to 911 comps
  { keywords: ["912 targa"],                                                             brands: ["porsche"], pct:  0.05, label: "912 Targa (+5%)" },
  { keywords: ["912/5", "912 five speed", "912 5-speed"],                               brands: ["porsche"], pct:  0.10, label: "912/5 five-speed (+10% — rare 1969 variant)" },
  { keywords: ["912e", "912 e"],                                                         brands: ["porsche"], pct: -0.15, label: "912E (−15% — 1976 US-only, 86hp)" },

  // ── PORSCHE Early 911 / F-series (1965–1973) (Grant research, 2026-03-18) ──
  // Baseline: 911T
  { keywords: ["911s", "911 s"],                                                         brands: ["porsche"], pct:  0.35, label: "Early 911S (+35% — top-spec F-series, 160-190hp)" },
  { keywords: ["911e", "911 e"],                                                         brands: ["porsche"], pct:  0.15, label: "Early 911E (+15%)" },
  { keywords: ["911l", "911 l", "911 luxe"],                                             brands: ["porsche"], pct:  0.10, label: "Early 911L/Luxe (+10% — US-only 1967-68)" },
  { keywords: ["swb", "short wheelbase", "short-wheelbase"],                             brands: ["porsche"], pct:  0.20, label: "Early 911 SWB (+20% — 1965-68, purist's 911)" },
  { keywords: ["rs 2.7 lightweight", "rs2.7 lightweight", "carrera rs lightweight", "rs lightweight"], brands: ["porsche"], pct: 1.60, label: "Carrera RS 2.7 Lightweight (+160% — M471, 75kg lighter, 200 built)" },
  { keywords: ["rs 2.7 touring", "rs2.7 touring", "carrera rs touring", "rs touring"],  brands: ["porsche"], pct:  0.80, label: "Carrera RS 2.7 Touring (+80%)" },
  { keywords: ["oil filler flap", "oil flap"],                                           brands: ["porsche"], pct:  0.08, label: "1972 911 oil-filler flap (+8% — outside filler, collector curiosity)" },
  { keywords: ["carrera 2.7", "carrera2.7"],                                             brands: ["porsche"], pct:  0.20, label: "G-body Carrera 2.7 (+20% — 1974-77 ducktail)" },

  // ── PORSCHE G-body 911 (1974–1989) (Grant research, 2026-03-18) ────────────
  // Baseline: 911 SC coupe
  { keywords: ["3.2 carrera", "carrera 3.2"],                                            brands: ["porsche"], pct:  0.15, label: "3.2 Carrera (+15% over SC)" },
  { keywords: ["g50", "g50 gearbox", "g50 transmission"],                                brands: ["porsche"], pct:  0.12, label: "3.2 Carrera G50 gearbox (+12% — 1987-89, smoother shifts)" },
  { keywords: ["club sport", "clubsport", "m637"],                                       brands: ["porsche"], pct:  0.90, label: "3.2 Carrera Club Sport (+90% — M637 option, ~340 built)" },
  { keywords: ["turbo look", "turbo-look"],                                              brands: ["porsche"], pct:  0.25, label: "Turbo Look (+25% — wide body factory option)" },
  // G-body SC/3.2 body variants
  { keywords: ["sc targa", "911sc targa", "911 sc targa"],                               brands: ["porsche"], pct: -0.05, label: "911 SC Targa (−5% vs coupe — structural compromise, enthusiasts prefer coupe)" },
  { keywords: ["sc cabriolet", "911sc cabriolet", "sc cab", "1983 cabriolet", "first cabriolet"], brands: ["porsche"], pct: -0.08, label: "911 SC Cabriolet (−8% vs coupe — first-ever 911 cab, 1983 only, ~4,200 built)" },
  { keywords: ["3.2 cabriolet", "carrera cabriolet", "carrera 3.2 cabriolet"],           brands: ["porsche"], pct: -0.08, label: "3.2 Carrera Cabriolet (−8% vs coupe — G-body cabs consistently discount vs coupes)" },
  { keywords: ["weissach edition", "sc weissach"],                                        brands: ["porsche"], pct:  0.12, label: "911 SC Weissach Edition (+12% — factory option, 436 US units, 1980 only)" },
  { keywords: ["america roadster", "sc america roadster", "911sc roadster"],              brands: ["porsche"], pct:  0.90, label: "911 SC America Roadster (+90% — ~16 pre-production units, extreme rarity, flag for manual appraisal)" },
  // 3.2 Speedster — two tiers
  { keywords: ["speedster turbo look", "wide body speedster", "speedster widebody"],      brands: ["porsche"], pct:  2.40, label: "3.2 Speedster Wide Body (+240% vs 3.2 coupe — 823 built, Turbo Look body on Speedster)" },
  { keywords: ["3.2 speedster", "carrera speedster", "911 speedster 1988", "911 speedster 1989"], brands: ["porsche"], pct: 1.80, label: "3.2 Carrera Speedster (+180% vs 3.2 coupe — 2,103 total built, $170-350k+ range)" },

  // ── PORSCHE 964 (1989–1994) — Baseline: C2 coupe ~$85k ────────────────────
  // ── PORSCHE 964 (1989–1994) — Baseline: C2 coupe ~$85k ────────────────────
  { keywords: ["964 c4", "964 carrera 4", "c4 coupe"],                                     brands: ["porsche"], pct: -0.10, label: "964 Carrera 4 (−10% vs C2 — RWD purity preferred, AWD adds weight/complexity)" },
  { keywords: ["carrera 4 lightweight", "964 lightweight", "c4 lightweight", "leichtbau"], brands: ["porsche"], pct:  6.00, label: "964 Carrera 4 Lightweight (+600% — ~22 built, $600k-$1M+ — flag for specialist appraisal)" },
  { keywords: ["rs america", "carrera rs america", "964 rs america", "911 rs america"],    brands: ["porsche"], pct:  0.40, label: "964 RS America (+40% — 701 built, US-only lightweight, $120-150k typical)" },
  { keywords: ["rs 3.8", "carrera rs 3.8", "3.8 rs"],                                     brands: ["porsche"], pct:  4.00, label: "964 Carrera RS 3.8 (+400% — ~55 built, homologation for RSR, $400-600k+ range)" },
  { keywords: ["964 carrera rs", "964 rs", "rs 3.6", "rs sport", "rs lightweight"],       brands: ["porsche"], pct:  0.80, label: "964 Carrera RS 3.6 (+80% — ~1,955 built, track-focused lightweight)" },
  { keywords: ["rs touring", "964 rs touring"],                                            brands: ["porsche"], pct:  0.60, label: "964 Carrera RS Touring (+60% — ~290 built, interior retained)" },
  { keywords: ["964 speedster", "911 speedster 1993", "911 speedster 1994"],               brands: ["porsche"], pct:  0.70, label: "964 Speedster (+70% — ~930 US built, $150-200k typical clean range)" },
  { keywords: ["964 america roadster", "911 america roadster 3.6"],                        brands: ["porsche"], pct:  3.00, label: "964 America Roadster (+300% — ~20 built, ultra-rare — flag for manual appraisal)" },
  { keywords: ["964 turbo 3.6", "turbo 3.6"],                                              brands: ["porsche"], pct:  2.00, label: "964 Turbo 3.6 (+200% vs C2 — 360hp, rarest non-S 964 Turbo, $250-400k typical)" },
  { keywords: ["964 turbo 3.3", "turbo 3.3"],                                              brands: ["porsche"], pct:  1.10, label: "964 Turbo 3.3 (+110% vs C2 — 320hp, $130-200k typical)" },
  { keywords: ["turbo s 3.6", "964 turbo s 3.6"],                                          brands: ["porsche"], pct: 10.00, label: "964 Turbo S 3.6 (+1000% — ~16 built, Classic.com avg ~$1M — flag for specialist appraisal)" },
  { keywords: ["964 turbo s", "turbo s 3.3", "turbo s leichtbau", "turbo s lightweight"], brands: ["porsche"], pct:  7.00, label: "964 Turbo S 3.3 Leichtbau (+700% — ~86 built, Classic.com low $770k, BaT record $1.27M)" },
  { keywords: ["964 targa"],                                                                brands: ["porsche"], pct: -0.05, label: "964 Targa (−5%)" },
  { keywords: ["964 cabriolet", "964 cab", "carrera 2 cabriolet", "c2 cabriolet"],         brands: ["porsche"], pct: -0.12, label: "964 Cabriolet C2 (−12%)" },
  { keywords: ["carrera 4 cabriolet", "c4 cabriolet", "c4 cab"],                           brands: ["porsche"], pct: -0.20, label: "964 Cabriolet C4 (−20% — AWD + soft-top compound discount)" },

  // ── PORSCHE 993 (1994–1998) — Baseline: C2 coupe ~$90k ────────────────────
  { keywords: ["993 c4", "993 carrera 4"],                                                 brands: ["porsche"], pct: -0.05, label: "993 Carrera 4 (−5% vs C2 — AWD gap narrower than 964, more refined system)" },
  { keywords: ["carrera s", "c2s", "993 s"],                                               brands: ["porsche"], pct:  1.50, label: "993 Carrera S wide body (+150% — RWD wide body, 1997+ MY, $200-300k range)" },
  { keywords: ["carrera 4s", "c4s", "993 4s"],                                             brands: ["porsche"], pct:  1.10, label: "993 Carrera 4S wide body (+110% — AWD wide body, $150-250k typical)" },
  { keywords: ["993 targa"],                                                                brands: ["porsche"], pct:  0.20, label: "993 Targa (+20% — unique retractable glass roof, positive premium vs coupe)" },
  { keywords: ["993 cabriolet", "993 cab", "993 convertible"],                             brands: ["porsche"], pct: -0.08, label: "993 Cabriolet (−8%)" },
  { keywords: ["993 c4 cabriolet", "carrera 4 cabriolet 993"],                             brands: ["porsche"], pct: -0.15, label: "993 Carrera 4 Cabriolet (−15% — AWD + cab compound)" },
  { keywords: ["993 turbo"],                                                                brands: ["porsche"], pct:  1.30, label: "993 Turbo (+130% — twin-turbo AWD, 408hp, $175-280k typical)" },
  { keywords: ["993 turbo s", "turbo s 993"],                                              brands: ["porsche"], pct:  5.00, label: "993 Turbo S (+500% — ~183 built, 450hp, Classic.com avg $556k)" },
  { keywords: ["993 gt2", "gt2 993"],                                                       brands: ["porsche"], pct: 20.00, label: "993 GT2 (+2000% — ~57 street cars, $2.4M+ at RM — flag for specialist appraisal)" },
  { keywords: ["993 rs clubsport", "carrera rs clubsport"],                                brands: ["porsche"], pct:  2.00, label: "993 Carrera RS Clubsport (+200% vs C2 — ~172 built, race-prepped)" },
  { keywords: ["993 carrera rs", "993 rs"],                                                brands: ["porsche"], pct:  1.10, label: "993 Carrera RS (+110% — ~1,014 built EU spec, $200-350k typical)" },

  // ── PORSCHE 914 variants (Grant research, 2026-03-17) ─────────────────────
  { keywords: ["914/6", "914-6"],            brands: ["porsche"], pct: 0.80, label: "914/6 (+80% vs 914/4 — 3,300 built, flat-six)" },
  { keywords: ["914/6 gt", "914-6 gt"],      brands: ["porsche"], pct: 5.00, label: "914/6 GT (+500% — ~16 works cars, ~$1M)" },

  // ── PORSCHE 968 variants (Grant research, 2026-03-17) ─────────────────────
  { keywords: ["968 cs", "968 club sport"],  brands: ["porsche"], pct: 0.55, label: "968 Club Sport (+55% — 200 lbs lighter)" },

  // ── FERRARI 308/328 variants (Grant research, 2026-03-17) ────────────────
  // Baseline: 308 GTBi/GTSi (injection)
  { keywords: ["vetroresina"],               brands: ["ferrari"], pct: 0.80, label: "308 Vetroresina (+80% — fiberglass body, ~712 built)" },
  { keywords: ["308 gtb"],                   brands: ["ferrari"], pct: 0.08, label: "308 GTB (+8% vs GTS — coupe rarer than targa)" },

  // ── FERRARI Testarossa family (Grant research, 2026-03-17) ───────────────
  // Baseline: Testarossa
  { keywords: ["f512 m", "512 m"],           brands: ["ferrari"], pct: 0.70, label: "F512 M (+70% vs 512 TR — 501 built, last and rarest)" },
  { keywords: ["512 tr"],                    brands: ["ferrari"], pct: 0.35, label: "512 TR (+35% vs Testarossa — better dynamics)" },
  { keywords: ["monospecchio"],              brands: ["ferrari"], pct: 0.20, label: "Testarossa Monospecchio (+20% — single-mirror early cars)" },

  // ── FERRARI F355 variants (Grant research, 2026-03-17) ───────────────────
  // Baseline: F355 Spider F1
  { keywords: ["f355 gts", "355 gts"],       brands: ["ferrari"], pct: 0.48, label: "F355 GTS (+48% vs Spider — rarest body style)" },
  { keywords: ["f355 berlinetta", "355 berlinetta"], brands: ["ferrari"], pct: 0.10, label: "F355 Berlinetta (+10% vs Spider )" },

  // ── MERCEDES 300SL (Grant research, 2026-03-17) ───────────────────────────
  { keywords: ["gullwing", "300 sl gullwing", "300sl gullwing"], brands: ["mercedes"], pct: 0.40, label: "300SL Gullwing (+40% vs Roadster — iconic, museum piece)" },

  // ── MERCEDES Pagoda (Grant research, 2026-03-17) ──────────────────────────
  // Baseline: 280SL
  { keywords: ["230sl", "230 sl"],           brands: ["mercedes"], pct: -0.41, label: "230SL (−41% vs 280SL — least powerful)" },
  { keywords: ["250sl", "250 sl"],           brands: ["mercedes"], pct: -0.37, label: "250SL (−37% vs 280SL — rarer but less refined)" },
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
    factors.push("Tiptronic transmission (−10% — manual strongly preferred)");
  }

  // ── Ferrari model-specific variants (model-gated to prevent cross-model contamination) ──
  const isFerrari = /ferrari/i.test(listingTitle);
  if (isFerrari) {
    if (/\b430\b|f430/i.test(listingTitle) && /scuderia/i.test(haystack)) {
      multiplier += 0.60;
      factors.push("430 Scuderia (+60% — track-focused homologation, 1,000 built)");
    }
    if (/\b488\b/i.test(listingTitle) && /\bpista\b/i.test(haystack)) {
      multiplier += 0.80;
      factors.push("488 Pista (+80% — track-focused variant, 530hp)");
    }
    if (/\b458\b/i.test(listingTitle) && /speciale/i.test(haystack)) {
      multiplier += 0.90;
      factors.push("458 Speciale (+90% — limited production, 597hp)");
    }
    if (/(458|488)/i.test(listingTitle) && /aperta/i.test(haystack)) {
      multiplier += 0.35;
      factors.push("Ferrari Aperta (+35% — open-top limited production)");
    }
  }

  // Ferrari manual vs F1 paddle shift
  const hasManual = /\b(manual|gated|6.speed|5.speed|stick.shift)\b/i.test(haystack);
  const hasF1Shift = /\bf1.?(transmission|gearbox|paddle|shift|gear)\b/i.test(haystack);
  if (isFerrari && hasManual && /(360|430)/i.test(listingTitle)) {
    multiplier += 0.18;
    factors.push("Ferrari manual gearbox (+18% — manual 360/430 premium over F1 paddle shift)");
  }

  // BMW E46 M3 SMG discount (Grant: -10%)
  if (/bmw/i.test(listingTitle) && /m3/i.test(listingTitle) && /\bsmg\b/i.test(haystack)) {
    multiplier -= 0.10;
    factors.push("SMG transmission (−10% — aging sequential gearbox, manual preferred)");
  }

  // Lamborghini Gallardo manual — commands ~40% premium over e-gear (Grant: MEDIUM confidence)
  const isGallardo = /gallardo/i.test(listingTitle);
  const hasEGear = /e.gear|egear/i.test(haystack);
  const hasGatedManual = /\bgated\b/i.test(haystack) || (/\bmanual\b/i.test(haystack) && isGallardo);
  if (isGallardo && hasGatedManual && !hasEGear) {
    multiplier += 0.40;
    factors.push("Gallardo gated manual (+40% — factory manual extremely rare)");
  }

  // 930 Turbo 1989 (final year, G50 gearbox) commands ~20% over mid-run cars
  if (/porsche/i.test(listingTitle) && /930/i.test(listingTitle)) {
    const yr = listingTitle.match(/\b(19\d{2})\b/);
    if (yr && parseInt(yr[1]) === 1989) {
      multiplier += 0.20;
      factors.push("930 Turbo 1989 (+20% — final year, G50 gearbox)");
    }
  }

  // Toyota Supra MKIV manual vs auto (Grant: HIGH confidence)
  if (/supra/i.test(listingTitle) && /\bmanual\b/i.test(haystack)) {
    multiplier += 0.25;
    factors.push("Supra MKIV manual (+25%)");
  }

  // NSX manual vs auto (NA1 era  confidence)
  if (/\bnsx\b/i.test(listingTitle) && /\bmanual\b/i.test(haystack) && !/type.?r/i.test(haystack)) {
    multiplier += 0.15;
    factors.push("NSX manual (+15%)");
  }

  // E30 M3 Sport Evolution (Grant: +40% over standard E30 M3)
  if (/e30/i.test(haystack) && /m3/i.test(listingTitle) && /sport.?evo/i.test(haystack)) {
    multiplier += 0.40;
    factors.push("E30 M3 Sport Evolution (+40% — homologation special)");
  }

  // BMW 850CSi vs 840/850i (Grant: +35% premium)
  if (/bmw/i.test(listingTitle) && /850csi/i.test(haystack)) {
    multiplier += 0.35;
    factors.push("850CSi (+35% — rarest 8-series)");
  }

  // C2 Corvette fuel injection premium (Grant: +20%)
  if (/corvette/i.test(listingTitle) && /(fuel.inject|fuelie)/i.test(haystack)) {
    multiplier += 0.20;
    factors.push("C2 Corvette fuel injection (+20% — 'Fuelie' premium)");
  }

  // Shelby GT350R vs GT350 (Grant: +30%)
  if (/shelby/i.test(listingTitle) && /gt350r/i.test(haystack)) {
    multiplier += 0.30;
    factors.push("GT350R (+30% vs GT350 — race-prepared)");
  }

  // 1969 Camaro COPO (Grant: +80-200% over base)
  if (/camaro/i.test(listingTitle) && /copo/i.test(haystack)) {
    multiplier += 1.20;
    factors.push("COPO Camaro (+120%)");
  }

  // Honda 190E Cosworth (Grant: +40% over base 190E)
  if (/190e/i.test(listingTitle) && /(cosworth|2\.3.16|2\.5.16)/i.test(haystack)) {
    multiplier += 0.40;
    factors.push("190E Cosworth (+40% vs base 190E)");
  }

  // ── G-body 2.7 era year logic (1974-1977 discount vs SC baseline) ──
  // Only apply to non-Carrera 2.7 G-body cars (Carrera 2.7 already caught by keyword)
  if (/\b911\b/i.test(listingTitle) && !/carrera|turbo|930/i.test(listingTitle)) {
    const gbYearMatch = listingTitle.match(/\b(197[4-7])\b/);
    if (gbYearMatch) {
      const gbY = parseInt(gbYearMatch[1]);
      const gbDiscount = gbY === 1974 ? -0.12 : gbY === 1975 ? -0.10 : gbY === 1976 ? -0.10 : -0.08;
      multiplier += gbDiscount;
      factors.push(`${gbY} 911 2.7 G-body (${gbDiscount*100}% — impact-bumper era, reliability concerns vs SC)`);
    }
  }

  // ── 993 Targa override — positive premium, not the generic -5% Targa penalty ──
  // The generic Targa rule fires first on "targa" keyword; override it for 993
  if (/993/i.test(listingTitle) && /targa/i.test(haystack)) {
    // Find and undo the generic Targa penalty if it was applied
    const tIdx = factors.findIndex(f => f.includes("Targa") && f.includes("−5%") && !f.includes("993"));
    if (tIdx !== -1) {
      multiplier += 0.05; // reverse the generic penalty
      factors.splice(tIdx, 1);
      factors.push("993 Targa (+20% — unique retractable glass roof, commands premium over coupe)");
      multiplier += 0.20;
    }
  }

  // ── 993 1998 final year premium ──
  if (/993/i.test(listingTitle) && /\b1998\b/.test(listingTitle)) {
    multiplier += 0.12;
    factors.push("1998 993 (+12% — final year of air-cooled production, documented premium across all variants)");
  }

  // ── 964 Turbo year logic (3.3 vs 3.6 split) ──
  if (/\b964\b|911.*turbo/i.test(listingTitle) && /turbo/i.test(listingTitle)) {
    const t964Year = listingTitle.match(/\b(199[1-4])\b/);
    if (t964Year && !/3\.6|3\.3/i.test(haystack)) {
      const ty = parseInt(t964Year[1]);
      if (ty === 1991 || ty === 1992) {
        multiplier += 1.10;
        factors.push(`${ty} 964 Turbo 3.3 (+110% — 320hp, $130-200k typical)`);
      } else if (ty === 1993 || ty === 1994) {
        multiplier += 2.00;
        factors.push(`${ty} 964 Turbo 3.6 (+200% — 360hp, rarest non-S 964 Turbo, $250-400k typical)`);
      }
    }
  }

  // ── Early 911 Sportomatic transmission penalty ──
  if (/\b911\b/i.test(listingTitle) && /sportomatic/i.test(haystack)) {
    multiplier -= 0.25;
    factors.push("Sportomatic transmission (−25% — major collector discount)");
  }

  // ── Early 911 year premiums (SWB era / last long-hood) ──
  if (/\b911\b/i.test(listingTitle) || /early.*911|long.?hood/i.test(haystack)) {
    const yearMatch911 = listingTitle.match(/\b(196[5-9]|197[0-3])\b/);
    const y = yearMatch911 ? parseInt(yearMatch911[1]) : null;
    if (y === 1965 || y === 1966) {
      multiplier += 0.30;
      factors.push(`${y} 911 earliest production (+30% — 300-series SWB, foundational rarity)`);
    } else if (y === 1973) {
      multiplier += 0.15;
      factors.push("1973 911 last pre-impact bumper (+15% — 2.4L at peak, last pre-bumper year)");
    }
  }

  // ── G-body 911 SC vs 3.2 Carrera year premium (G50 gearbox era 1987-89) ──
  // Already handled in VARIANT_PREMIUMS (G50 keyword), but catch year-only cases
  if (/\b911\b/i.test(listingTitle) && /carrera/i.test(listingTitle)) {
    const gYearMatch = listingTitle.match(/\b(198[7-9])\b/);
    if (gYearMatch && !/g50|g50\b/i.test(haystack)) {
      multiplier += 0.08;
      factors.push(`${gYearMatch[1]} 3.2 Carrera (+8% — late G-body, likely G50 era)`);
    }
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
