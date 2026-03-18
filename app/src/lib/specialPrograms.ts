/**
 * Factory special programs, bespoke options, and limited designations
 * that significantly affect value and how a car should be evaluated.
 *
 * These are FACTORY-ORIGINAL cars — not restomods. A 993 with PTS
 * is still a stock Porsche, but its color alone can add $30K+.
 */

export type SpecialProgram = {
  name: string;          // Short display name, e.g. "Ferrari Tailor Made"
  brand: string;         // Lowercase brand for matching
  description: string;  // What it is, for Claude's context
  valuePremium: string; // Plain-English guidance on value impact
  indicators: string[]; // Keywords to detect in title/description (lowercase)
};

const SPECIAL_PROGRAMS: SpecialProgram[] = [

  // ─── FERRARI ──────────────────────────────────────────────────────────────

  {
    name: "Ferrari Tailor Made",
    brand: "ferrari",
    description:
      "Ferrari's bespoke personalization program. Full custom color, stitching, trim materials, and cabin spec chosen by the original owner at the factory. Every Tailor Made car is one-of-one. Documentation typically includes a Ferrari Classiche-style build sheet detailing exact specifications.",
    valuePremium:
      "Significant premium over standard spec — typically 20–40% depending on the model and the coherence of the spec. Tasteful specs (period-correct, complementary colors) command more than garish combinations. Tailor Made documentation is essential and should accompany the car.",
    indicators: ["tailor made", "taylor made", "su misura"],
  },
  {
    name: "Ferrari Atelier",
    brand: "ferrari",
    description:
      "Ferrari's in-house customization studio for one-off and special edition requests beyond the standard Tailor Made palette. Typically reserved for top-tier clients and involves direct factory collaboration.",
    valuePremium:
      "Premium above even Tailor Made — these are often unique one-off builds. Value is highly spec-specific.",
    indicators: ["ferrari atelier", "one-off ferrari", "special projects ferrari"],
  },
  {
    name: "Ferrari Classiche Certified",
    brand: "ferrari",
    description:
      "Ferrari's official authenticity certification for classic cars. A Classiche Red Book confirms the car matches its original factory build sheet — correct engine, gearbox, chassis, bodywork, and paint. It is the gold standard for Ferrari provenance.",
    valuePremium:
      "A certified car commands a meaningful premium (often $10K–$30K+ depending on model). An uncertified car of the same model will sell for less. The Red Book should always accompany a Classiche-certified car.",
    indicators: ["classiche", "classiche certified", "red book", "ferrari red book"],
  },
  {
    name: "Ferrari PTS (Paint-to-Sample)",
    brand: "ferrari",
    description:
      "Factory paint-to-sample — a non-catalog color chosen by the original buyer and applied at Maranello. Not as comprehensive as Tailor Made but still a significant factory option. Common on modern Ferraris (488, F8, Roma, SF90, etc.).",
    valuePremium:
      "Desirable colors (Rosso Dino, Blu Pozzi, Verde Abetone, Argento Nürburgring) can add $10K–$30K+ on modern models. Neutral or common-looking PTS colors add less. Original PTS documentation from the factory order sheet is important.",
    indicators: ["pts", "paint to sample", "paint-to-sample", "special color", "su ordinazione"],
  },
  {
    name: "Ferrari Fiorano Package",
    brand: "ferrari",
    description:
      "A factory performance package available on select models (e.g. 458, 488) that includes suspension upgrades, Michelin Cup tires, and weight reduction options. Named after Ferrari's test track.",
    valuePremium: "Adds premium for track-focused buyers. More important for condition and provenance than raw value uplift.",
    indicators: ["fiorano package", "fiorano option"],
  },
  {
    name: "Ferrari XX Program",
    brand: "ferrari",
    description:
      "Ferrari's track-only XX program cars (FXX, 599XX, FXX-K, FXX-K Evo). These are not road-legal factory race cars that remain in Ferrari's care between events. Ownership is highly restricted — Ferrari must approve any sale.",
    valuePremium:
      "Extremely rare. Value is entirely event/provenance-driven and not comparable to any production car. Buyer should have a direct relationship with Ferrari.",
    indicators: ["fxx", "599xx", "fxx-k", "fxx evo"],
  },

  // ─── PORSCHE ──────────────────────────────────────────────────────────────

  {
    name: "Porsche PTS (Paint-to-Sample)",
    brand: "porsche",
    description:
      "Factory paint-to-sample — a special color ordered from Porsche's individual color library or a fully custom color matched at the factory. Available throughout Porsche's history. Common on GT cars and 911s ordered through PCNA or direct factory.",
    valuePremium:
      "One of the most significant value drivers for modern Porsches. Rare, historically-significant colors (Voodoo Blue, Aventurine Green, Tangerine, Mint Green, Brewster Green) can add $20K–$60K+ on GT3s and GT2s. Documentation (window sticker showing PTS) is essential. On 991/992 GT cars, PTS can be the difference between auction value and listing price.",
    indicators: ["pts", "paint to sample", "paint-to-sample", "sonderfarbe", "special color order", "individual color"],
  },
  {
    name: "Porsche Exclusive Manufaktur",
    brand: "porsche",
    description:
      "Porsche's in-house personalization division (formerly Porsche Exclusive). Covers bespoke interior options, special exterior finishes, two-tone paint, extended leather, and special mechanical options ordered directly at the factory. The Exclusive designation appears on the window sticker.",
    valuePremium:
      "Adds meaningful premium when the spec is coherent and desirable. Exclusive Manufaktur options should be documented on the Porsche Certificate of Authenticity (CoA). Rare Exclusive specs can be significant — e.g. Exclusive Sport Chrono, Exclusive bucket seats, sport exhaust combos.",
    indicators: ["exclusive manufaktur", "porsche exclusive", "manufaktur", "exclusive package"],
  },
  {
    name: "Porsche Weissach Package",
    brand: "porsche",
    description:
      "A factory lightweight package available on select GT cars (GT2 RS, 918, Cayenne Turbo S-E Hybrid). Deletes heavy components and adds magnesium wheels, carbon fiber roof, and other weight-saving measures. Named after Porsche's R&D center.",
    valuePremium:
      "Significant premium — can add $30K–$80K+ on GT2 RS. A Weissach-equipped car commands more than a non-Weissach of the same spec. Verify with window sticker and CoA.",
    indicators: ["weissach package", "weissach option", "weissach pkg"],
  },
  {
    name: "Porsche GT Silver Program / Special Wishes",
    brand: "porsche",
    description:
      "Porsche GT cars (GT3, GT3 RS, GT2 RS, Spyder) can be ordered with factory 'Special Wishes' — specific color combinations, interior options, or unique build specs that go beyond the standard Exclusive Manufaktur catalog.",
    valuePremium: "Highly spec-dependent. Unusual GT color combos (PTS + clubsport + specific seat combo) can command significant premiums at auction.",
    indicators: ["special wishes", "sonderwunsch", "gt special"],
  },
  {
    name: "Porsche Certificate of Authenticity (CoA)",
    brand: "porsche",
    description:
      "Porsche's official factory build record — lists every option the car was built with at the factory. Not a modification program per se, but the CoA is the definitive documentation for any Porsche's spec. Essential for PTS and Exclusive verification.",
    valuePremium:
      "A car with CoA is fully documented and commands more trust (and usually more money) than one without. A matching CoA + window sticker + Porsche Passport is the gold standard.",
    indicators: ["certificate of authenticity", "coa", "porsche passport", "window sticker"],
  },
  {
    name: "Porsche Classic Series",
    brand: "porsche",
    description:
      "Factory-authorized restoration and part programs for classic Porsches through Porsche Classic. A car with Porsche Classic restoration documentation or parts carries factory blessing.",
    valuePremium: "Adds credibility and some value premium for collector-grade cars — especially 356, 911 SC, and early 964.",
    indicators: ["porsche classic", "classic series", "porsche restoration"],
  },

  // ─── MERCEDES-BENZ ────────────────────────────────────────────────────────

  {
    name: "Mercedes-AMG Manufaktur",
    brand: "mercedes",
    description:
      "Mercedes' bespoke personalization division for AMG models. Custom paint, leather, trim, and unique color combinations ordered at the factory. Similar in concept to Porsche Exclusive Manufaktur.",
    valuePremium: "Adds premium for coherent, desirable specs. AMG Black Series and GT R Manufaktur builds are particularly notable.",
    indicators: ["amg manufaktur", "mercedes manufaktur"],
  },
  {
    name: "Mercedes Maybach",
    brand: "mercedes",
    description:
      "Mercedes-Benz's ultra-luxury sub-brand. Maybach-branded S-Class, GLS, and special edition models carry factory coachbuilt-level interior and equipment packages.",
    valuePremium: "Carries significant luxury premium. Value is driven by spec, condition, and provenance.",
    indicators: ["maybach"],
  },

  // ─── BMW ──────────────────────────────────────────────────────────────────

  {
    name: "BMW Individual",
    brand: "bmw",
    description:
      "BMW's factory personalization program — paint-to-sample, bespoke leather, special wood trims, and unique build options ordered through BMW Individual. Available across most model lines.",
    valuePremium:
      "Rare and desirable Individual specs (metallic two-tones, Sternenhimmel starlight headliner, unusual colors) command meaningful premiums, especially on M cars and 7-series.",
    indicators: ["bmw individual", "individual color", "individual leather", "bmw pts"],
  },
  {
    name: "BMW M Performance / CSL",
    brand: "bmw",
    description:
      "BMW M's homologation and special edition programs — M3 CSL, M4 CSL, 1M, M2 CS/CSL. These are factory-lightweight track-focused limited editions with specific production numbers.",
    valuePremium: "Significant premium over standard M cars. Production numbers matter — 1M, M3 CSL (E46) are the most collectible. Verify production number with BMW COA.",
    indicators: ["csl", "1m", "m2 cs", "m3 cs", "m4 csl", "m cs"],
  },

  // ─── ASTON MARTIN ─────────────────────────────────────────────────────────

  {
    name: "Aston Martin Q Division",
    brand: "aston martin",
    description:
      "Aston Martin's bespoke personalization division — custom paint, leather, trim, mechanical options, and fully bespoke one-off builds. Q cars carry unique factory documentation.",
    valuePremium: "Premium over standard builds; highly spec-dependent. Full Q documentation essential.",
    indicators: ["q division", "q by aston", "aston q"],
  },

  // ─── ROLLS-ROYCE ──────────────────────────────────────────────────────────

  {
    name: "Rolls-Royce Bespoke",
    brand: "rolls-royce",
    description:
      "Rolls-Royce's factory coachbuilding program — virtually every Rolls-Royce is bespoke to some degree, but the Bespoke designation covers unique one-off builds from the coachbuild division including Boat Tail, Droptail, La Rose Noire, and Sweptail.",
    valuePremium: "These cars are priceless in the traditional sense — resale value is entirely relationship and provenance-driven.",
    indicators: ["rolls-royce bespoke", "bespoke coachbuild", "boat tail", "droptail", "sweptail"],
  },

  // ─── LAMBORGHINI ──────────────────────────────────────────────────────────

  {
    name: "Lamborghini Ad Personam",
    brand: "lamborghini",
    description:
      "Lamborghini's factory personalization program — custom paint, leather, Alcantara, special colors, and unique build specs applied at Sant'Agata. Every Ad Personam car comes with factory documentation.",
    valuePremium: "Desirable color specs (unique metallics, two-tones, rare Alcantara combos) add premium over standard builds.",
    indicators: ["ad personam", "lamborghini personam"],
  },
  {
    name: "Lamborghini Squadra Corse",
    brand: "lamborghini",
    description:
      "Lamborghini's motorsport and limited-run performance division — responsible for the Essenza SCV12, Super Trofeo, and special limited series homologation cars.",
    valuePremium: "Extremely rare. Comparable to Ferrari XX program in exclusivity for track-spec cars.",
    indicators: ["squadra corse", "essenza scv12"],
  },

  // ─── McLAREN ──────────────────────────────────────────────────────────────

  {
    name: "McLaren MSO (McLaren Special Operations)",
    brand: "mclaren",
    description:
      "McLaren's bespoke division — custom paint, carbon fiber, interior options, and one-off builds. MSO-spec cars include special edition models (MSO Carbon Series, MSO HS, etc.) and customer-ordered bespoke builds.",
    valuePremium: "Carbon MSO packages add meaningful premium. One-off MSO builds are highly collectible.",
    indicators: ["mso", "mclaren special operations", "mso carbon", "mso hs"],
  },

  // ─── BENTLEY ──────────────────────────────────────────────────────────────

  {
    name: "Bentley Mulliner",
    brand: "bentley",
    description:
      "Bentley's bespoke coachbuilding division — the oldest coachbuilder name still in active use. Mulliner builds special commissions, limited editions (Bacalar, Batur), and bespoke customer orders.",
    valuePremium: "Significant. Mulliner documentation should accompany the car; without it, provenance is difficult to verify.",
    indicators: ["mulliner", "bentley mulliner", "bacalar", "batur"],
  },

  // ─── BUGATTI ──────────────────────────────────────────────────────────────

  {
    name: "Bugatti Sur Mesure",
    brand: "bugatti",
    description:
      "Bugatti's personalization and bespoke program — custom paint, leather, carbon, and unique commissions including one-off models like the La Voiture Noire.",
    valuePremium: "Every Bugatti is already rare; Sur Mesure documentation confirms factory origin of any unique spec.",
    indicators: ["sur mesure", "bugatti bespoke", "la voiture noire"],
  },

  // ─── PAGANI ───────────────────────────────────────────────────────────────

  {
    name: "Pagani Bespoke / One-Off",
    brand: "pagani",
    description:
      "Every Pagani is effectively bespoke, but the manufacturer also creates official one-off commissions (Zonda 760 series, Huayra BC Roadster, etc.). Documentation from Pagani directly is the standard.",
    valuePremium: "All Paganis are collectible. One-off commissions are among the most valuable modern cars in existence.",
    indicators: ["pagani one-off", "zonda 760", "huayra bc", "imola pagani"],
  },

  // ─── HONDA / ACURA ────────────────────────────────────────────────────────

  {
    name: "Honda S2000 CR (Club Racer)",
    brand: "honda",
    description:
      "Factory-built track-focused package for the S2000, introduced in 2008. Includes aero hardtop with wind deflector, forged aluminum Enkei wheels, 17-inch front / 18-inch rear staggered setup, stiffer springs, and deletion of air conditioning and audio for weight savings. Only available in New Formula Red, Berlina Black, and Grand Prix White.",
    valuePremium:
      "Significant premium over standard AP2 — typically $5K–$15K at auction. A CR with original hardtop, wheels, and correct CR-specific options is worth substantially more than an AP2 with aftermarket CR parts added. Verify with VIN decoder (FY prefix = CR) and confirm original equipment.",
    indicators: ["s2000 cr", "club racer", "cr model", "fy1", "fy2"],
  },
  {
    name: "Honda NSX Type R / NSX-R",
    brand: "honda",
    description:
      "The factory lightweight version of the NSX — produced in 1992 and 2002 for the JDM market. The NSX-R features stripped interior, forged lightweight wheels, stiffer suspension, and a focus on driver engagement over comfort. Never officially sold new in the US — all US examples are gray market imports.",
    valuePremium:
      "Commanding premium over standard NSX — often 2–3x the value of a comparable base car. Authenticity verification is critical (VIN, engine, interior details). Beware of standard NSX cars converted to NSX-R appearance.",
    indicators: ["nsx type r", "nsx-r", "nsxr", "nsx r"],
  },
];

/**
 * Detect any special programs mentioned in a listing title or description.
 * Returns all matching programs — a car could have multiple (e.g. PTS + Exclusive Manufaktur).
 */
export function detectSpecialPrograms(title: string, description: string): SpecialProgram[] {
  const haystack = (title + " " + description).toLowerCase();
  return SPECIAL_PROGRAMS.filter(program =>
    program.indicators.some(indicator => haystack.includes(indicator))
  );
}

/**
 * Format detected programs into a block for Claude's context prompt.
 */
export function formatSpecialProgramsContext(programs: SpecialProgram[]): string {
  if (programs.length === 0) return "";

  const lines = programs.map(p =>
    `- ${p.name}: ${p.description} VALUE PREMIUM: ${p.valuePremium}`
  );

  return `
SPECIAL FACTORY PROGRAMS DETECTED:
This listing appears to involve one or more factory special programs or bespoke designations:
${lines.join("\n")}

Factor these programs into your analysis:
- Acknowledge them as significant positive attributes in greenFlags if well-documented
- Flag missing documentation as a watchOut (e.g., missing CoA, no PTS documentation, no Classiche Red Book)
- Adjust fairMarketEstimate to reflect the program premium — these cars do not trade at standard spec prices
- In your verdict, note that this is a special-program car and what makes it notable
`;
}
