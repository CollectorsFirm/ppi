export type ModelKnowledge = {
  matchedModel: string;
  knownIssues: { issue: string; severity: "critical" | "watch" | "minor"; yearsAffected?: string }[];
  funFacts: string[];
};

type KnowledgeEntry = {
  makes: string[];
  models: string[];
  yearStart?: number;
  yearEnd?: number;
  knowledge: Omit<ModelKnowledge, "matchedModel">;
};

const knowledgeBase: KnowledgeEntry[] = [
  // ── PORSCHE 993 (1994–1998) ──────────────────────────────────────────────
  {
    makes: ["porsche"],
    models: ["993", "911"],
    yearStart: 1994,
    yearEnd: 1998,
    knowledge: {
      knownIssues: [
        { issue: "IMS bearing failure — not applicable on 993 (air-cooled). The IMS issue only affects water-cooled 996/997. Ask about this only to confirm the buyer isn't confusing generations.", severity: "minor" },
        { issue: "Varioram intake system failures — the variable intake system on 3.6L Carrera engines can develop leaks or actuator failures. Listen for rough idle.", severity: "watch" },
        { issue: "Rear main seal oil leaks — common on high-mileage examples. Check for oil seepage around the transaxle bell housing.", severity: "watch" },
        { issue: "Chain tensioner wear on high-mileage cars (90k+) — ask for service history confirming chain/tensioner replacement.", severity: "watch", yearsAffected: "All 993 (high mileage)" },
        { issue: "Heater box failures — the heat exchangers can crack, causing exhaust fumes to enter the cabin. Have PPI inspector check.", severity: "critical" },
        { issue: "Throttle body microswitch failures — can cause rough running and throttle hesitation.", severity: "minor" },
        { issue: "Rust in rear quarter panels around the wheel arches — common in non-dry climate cars.", severity: "watch" },
      ],
      funFacts: [
        "The 993 was the last air-cooled 911, produced from 1994–1998. Its successor, the 996, switched to water cooling — making the 993 the end of an era.",
        "The 993 Turbo was the first production Porsche with all-wheel drive and twin turbochargers, producing 408hp.",
        "Only 3,508 GT2s were built across all 993 variants — making it one of the rarest 911s ever made.",
        "The 993 C2S featured wider bodywork from the Turbo, making it visually one of the most dramatic Carreras.",
        "Porsche engineers considered the 993 the most driver-focused 911 due to its analog feel and perfect weight balance.",
      ],
    },
  },

  // ── PORSCHE 996 (1999–2004) ──────────────────────────────────────────────
  {
    makes: ["porsche"],
    models: ["996", "911"],
    yearStart: 1999,
    yearEnd: 2004,
    knowledge: {
      knownIssues: [
        { issue: "IMS (Intermediate Shaft) bearing failure — the single most critical issue on 996s. The IMS bearing can fail catastrophically, destroying the engine. Verify if the IMS bearing has been upgraded (LN Engineering retrofit is the gold standard).", severity: "critical", yearsAffected: "1999–2004 (all 996)" },
        { issue: "RMS (Rear Main Seal) leaks — commonly found alongside IMS issues. Check for oil weeping at the bell housing.", severity: "watch" },
        { issue: "Coolant pipe failure behind the engine — the plastic coolant distribution pipes degrade and can cause sudden overheating. Often replaced preventively.", severity: "critical", yearsAffected: "1999–2001 (early 996)" },
        { issue: "Bore scoring on Carrera engines — the M96 engine's Lokasil cylinder bore coating can score, causing oil consumption and blue smoke.", severity: "critical" },
        { issue: "\"Fried egg\" headlights — the oval headlights are a polarizing design point. OEM lenses are discontinued; aftermarket options vary in quality.", severity: "minor" },
        { issue: "AOS (Air-Oil Separator) failure — causes excessive crankcase pressure and oil consumption. Inexpensive fix but common.", severity: "watch" },
      ],
      funFacts: [
        "The 996 was the first water-cooled 911, launched in 1999. Purists were outraged; engineers argued it was the right move for emissions and reliability.",
        "The 996 GT3 was developed with input from Le Mans racing and is now widely considered one of the greatest driver's cars of its era.",
        "Despite its controversial design, the 996 is the most affordable entry point into air-cooled-era 911 values — often seen as undervalued relative to the 993 and 997.",
      ],
    },
  },

  // ── PORSCHE 997.1 (2005–2008) ──────────────────────────────────────────
  {
    makes: ["porsche"],
    models: ["997", "911"],
    yearStart: 2005,
    yearEnd: 2008,
    knowledge: {
      knownIssues: [
        { issue: "IMS bearing failure — still present on 997.1 (2005–2008) M97 engines. Less common than the 996 but still a concern. Verify IMS upgrade status.", severity: "critical", yearsAffected: "2005–2008 (997.1 only)" },
        { issue: "RMS (Rear Main Seal) oil leaks — ask seller and PPI inspector to check.", severity: "watch" },
        { issue: "Bore scoring / cylinder scoring on early cars — Porsche issued a technical bulletin; affected engines may have been rebuilt under warranty.", severity: "critical", yearsAffected: "2005–2008" },
        { issue: "IMAP (Intake Manifold Actuator) failure — causes rough idle and engine codes. Common and relatively inexpensive to repair.", severity: "minor" },
      ],
      funFacts: [
        "The 997.1 reintroduced the round headlight design after the controversial 996 'fried egg' units — widely considered a return to form.",
        "The 997 GT3 RS 4.0 is considered by many to be the greatest naturally aspirated road car Porsche ever built.",
        "The 997.2 (2009–2012) fixed the IMS bearing issue by switching to a new bearing design — making the generational split significant for buyers.",
      ],
    },
  },

  // ── PORSCHE 997.2 (2009–2012) ──────────────────────────────────────────
  {
    makes: ["porsche"],
    models: ["997", "911"],
    yearStart: 2009,
    yearEnd: 2012,
    knowledge: {
      knownIssues: [
        { issue: "Direct Injection (DFI) carbon buildup on intake valves — the 9A1 engine's direct injection doesn't wash the intake valves. Walnut blasting at ~60k miles is recommended.", severity: "watch", yearsAffected: "2009–2012 (997.2)" },
        { issue: "Coolant reservoir cracking — known to crack and cause sudden coolant loss. Inexpensive preventive replacement.", severity: "watch" },
        { issue: "PDK (dual-clutch) mechatronic unit failures on high-mileage examples — rare but expensive if it occurs.", severity: "watch" },
      ],
      funFacts: [
        "The 997.2 fixed the IMS bearing issue that plagued the 996 and 997.1 — making it a significantly more reliable choice.",
        "The 997.2 GT3 RS 4.0 (2011) produced 500hp from a naturally aspirated flat-six and is one of the most sought-after modern Porsches.",
        "The 997.2 was the last 911 generation without turbocharging on the base Carrera — the 991.2 switched all Carreras to turbos in 2016.",
      ],
    },
  },

  // ── FERRARI 360 (1999–2005) ──────────────────────────────────────────────
  {
    makes: ["ferrari"],
    models: ["360", "modena", "spider", "challenge stradale"],
    yearStart: 1999,
    yearEnd: 2005,
    knowledge: {
      knownIssues: [
        { issue: "F1 paddle shift pump failures — the hydraulic pump for the automated manual gearbox fails regularly. A working pump is essential; budget $1,500–$3,000 for replacement.", severity: "critical" },
        { issue: "RMS (Rear Main Seal) leaks — very common on the 360. Blue smoke under hard acceleration is a sign. Budget $3,000–$5,000 for the repair (major job).", severity: "critical" },
        { issue: "Cam cover / valve cover gasket leaks — common oil weepage. Less serious than RMS but worth noting.", severity: "watch" },
        { issue: "Coolant system neglect — the 360 requires coolant changes every 2 years. Neglect leads to corroded passages. Ask for coolant service history.", severity: "watch" },
        { issue: "Carbon fiber structural components — the 360 uses CF for structural members. Have a PPI check for any accident damage carefully.", severity: "critical" },
        { issue: "Belt service — timing belt changes are required every 3 years or 30k miles. Confirm the last belt service date and mileage.", severity: "critical" },
      ],
      funFacts: [
        "The 360 Modena was Ferrari's first car to use an all-aluminum space frame, reducing weight by 28% compared to the F355.",
        "Only 399 Challenge Stradales were built for road use, making it one of the rarest modern Ferraris.",
        "The Challenge Stradale's 420hp V8 revs to 8,500 rpm and was derived directly from Ferrari's Challenge racing series.",
        "The 360 Spider was the first Ferrari convertible with an aluminum body — setting the template for modern Ferrari open cars.",
        "Michael Schumacher drove a 360 Modena pace car at the 2000 F1 season opener.",
      ],
    },
  },

  // ── HONDA S2000 AP1 (2000–2003) ──────────────────────────────────────────
  {
    makes: ["honda"],
    models: ["s2000"],
    yearStart: 2000,
    yearEnd: 2003,
    knowledge: {
      knownIssues: [
        { issue: "Valve float and engine damage above 9,000 RPM without VTEC engagement — AP1 owners who rev the F20C hard without warming up the oil can cause damage. Ask about engine health.", severity: "watch", yearsAffected: "2000–2003 (AP1)" },
        { issue: "Rear subframe cracking — a known structural weakness on early AP1s, especially those driven hard or on track. Have a PPI inspect the rear subframe.", severity: "critical", yearsAffected: "2000–2003" },
        { issue: "Soft top degradation — the cloth top deteriorates with age and UV exposure. Budget $600–$1,200 for OEM replacement.", severity: "minor" },
        { issue: "Rust on frame rails and floor pans — especially on cars from non-dry climates. Inspect underneath carefully.", severity: "watch" },
        { issue: "Differential wear on high-mileage cars — the open diff on base models wears predictably; LSD-equipped cars hold up better.", severity: "minor" },
      ],
      funFacts: [
        "The Honda S2000's F20C engine produces 240hp from 2.0 liters — a specific output of 120hp/liter that was unmatched by any naturally aspirated production car when launched in 1999.",
        "Honda engineered the S2000 to celebrate its 50th anniversary as a company.",
        "The F20C's 9,000 RPM redline was the highest of any mass-produced naturally aspirated engine at the time of launch.",
        "The AP1 and AP2 share the same chassis but the AP2 (2004–2009) switched to a larger 2.2L F22C engine with a lower redline (8,200 rpm) but more torque.",
      ],
    },
  },

  // ── HONDA S2000 AP2 (2004–2009) ──────────────────────────────────────────
  {
    makes: ["honda"],
    models: ["s2000"],
    yearStart: 2004,
    yearEnd: 2009,
    knowledge: {
      knownIssues: [
        { issue: "Soft top deterioration — especially on cars stored outdoors. Check the rear window for delamination and the top fabric for tears.", severity: "minor" },
        { issue: "Rust on frame rails and floor pans on non-dry climate cars — inspect underneath carefully.", severity: "watch" },
        { issue: "F22C oil consumption on high-mileage cars (100k+) — some examples develop consumption. Ask about oil change intervals.", severity: "watch", yearsAffected: "2004–2009 (AP2)" },
        { issue: "TPMS sensor failures — common on older AP2s. Minor but worth noting.", severity: "minor" },
      ],
      funFacts: [
        "The AP2 S2000 switched to a 2.2L F22C engine in 2004, trading the AP1's screaming 9,000 RPM redline for more torque and a smoother power delivery.",
        "The S2000 CR (Club Racer) was introduced in 2008 with a wind deflector, forged wheels, and stiffer suspension — the ultimate factory S2000.",
        "Grand Prix White (GPW) is the most sought-after color for S2000 collectors, originally exclusive to the Japanese market before becoming available in the US.",
        "The S2000 was in continuous production for 10 years (1999–2009) with remarkably few changes — a testament to how right Honda got it from the start.",
      ],
    },
  },

  // ── JEEP GRAND WAGONEER (1984–1991) ─────────────────────────────────────
  {
    makes: ["jeep"],
    models: ["grand wagoneer", "wagoneer"],
    yearStart: 1984,
    yearEnd: 1991,
    knowledge: {
      knownIssues: [
        { issue: "AMC 360ci V8 carb/fuel system issues — the carburetor-equipped 360 is reliable but sensitive to neglect. EFI conversions (Edelbrock, Holley) address this and improve reliability.", severity: "watch" },
        { issue: "Rust in the body seams, floor pans, and frame — especially on non-Southwest/dry climate cars. These are 35+ year old trucks; rust is the #1 killer.", severity: "critical" },
        { issue: "Quadra-Trac transfer case — the original Quadra-Trac is a full-time AWD system with limited part availability. Servicing it requires a specialist.", severity: "watch" },
        { issue: "Woodgrain paneling delamination and fading — the vinyl woodgrain ages poorly. Replacement panels are available but expensive.", severity: "minor" },
        { issue: "Electrical gremlins — 35+ year old wiring harnesses develop issues. Inspect for non-factory wiring or signs of electrical repairs.", severity: "watch" },
        { issue: "Power window and lock actuator failures — common on high-mileage examples. Budget for replacements.", severity: "minor" },
      ],
      funFacts: [
        "The Jeep Grand Wagoneer was in continuous production from 1963 to 1991 — a remarkable 29-year run with only minor updates.",
        "The Grand Wagoneer was the first mass-market SUV to offer standard four-wheel drive and a wood-paneled body — defining the luxury SUV segment.",
        "Ralph Lauren is famously devoted to the Grand Wagoneer — he owns dozens and has said it represents the perfect American aesthetic.",
        "Despite being discontinued in 1991, the Grand Wagoneer has appreciated significantly — good examples now sell for $40,000–$80,000+.",
        "The SJ-generation Wagoneer used a body-on-frame design derived from the original 1963 Wagoneer, making it one of the longest-running unchanged platforms in automotive history.",
      ],
    },
  },

  // ── PORSCHE 964 (1989–1994) ──────────────────────────────────────────────
  {
    makes: ["porsche"],
    models: ["964", "911"],
    yearStart: 1989,
    yearEnd: 1994,
    knowledge: {
      knownIssues: [
        { issue: "Chain tensioner rattle on cold starts — the 964's engine uses a known tensioner design that can rattle until oil pressure builds. Ask about service history.", severity: "watch" },
        { issue: "Oil leaks — the 964 3.6L engine has multiple potential leak points including the cam covers and the rocker arm shaft plugs. A clean underside is a green flag.", severity: "watch" },
        { issue: "Tiptronic transmission failures — if equipped with Tiptronic, the valve body can fail. Verify smooth shifting through all gears.", severity: "watch", yearsAffected: "964 Tiptronic only" },
        { issue: "G50 transmission synchro wear — the manual G50 gearbox is robust but synchros wear on high-mileage cars, especially 2nd gear.", severity: "watch" },
        { issue: "Rust at the lower windshield corners and door bottoms — common failure points on European and East Coast cars.", severity: "watch" },
      ],
      funFacts: [
        "The 964 was the first major redesign of the 911 since 1963, with 87% new components — yet it looked almost identical to its predecessor.",
        "The 964 Carrera RS (1992) is one of the most collectible 911s ever made, with lightweight panels, deleted rear seats, and a power boost to 260hp.",
        "The 964 Turbo 3.6 (1993–1994) was the most powerful 911 of its era, producing 360hp from an updated flat-six.",
        "The 964 was the first 911 to offer coil springs and a proper suspension overhaul, replacing the torsion bar setup used since 1963.",
      ],
    },
  },

  // ── FERRARI F355 (1994–1999) ─────────────────────────────────────────────
  {
    makes: ["ferrari"],
    models: ["f355", "355"],
    yearStart: 1994,
    yearEnd: 1999,
    knowledge: {
      knownIssues: [
        { issue: "Belt service — the F355's timing belts must be changed every 3 years regardless of mileage. Missed services can cause catastrophic engine failure. Always confirm the last belt date.", severity: "critical" },
        { issue: "F1 paddle shift system failures — hydraulic pump, accumulator, and solenoid failures are common and expensive ($1,500–$4,000).", severity: "critical" },
        { issue: "Pinched fuel filler neck — a known issue that can cause the car to stall or run rough. Relatively minor fix.", severity: "minor" },
        { issue: "Cam cover gasket and oil leaks — common and expected on high-mileage examples. Not a dealbreaker but worth noting.", severity: "watch" },
        { issue: "Catalytic converter failures — the F355's cats run very hot and deteriorate. Core damage causes rattling and potential engine contamination.", severity: "watch" },
      ],
      funFacts: [
        "The F355's 3.5L V8 produces 375hp at 8,250 RPM — Ferrari claimed it was the most powerful naturally aspirated production engine per liter at launch.",
        "The F355 was the first road car to use a five-valve-per-cylinder layout in production (5 valves × 8 cylinders = 40 valves total).",
        "Michael Schumacher drove a modified F355 during development, contributing feedback that shaped the car's handling balance.",
        "The F355 Spider was the first Ferrari convertible with a fully retractable electric top — it could be raised or lowered in 14 seconds.",
      ],
    },
  },

  // ── LAMBORGHINI DIABLO (1990–2001) ──────────────────────────────────────
  {
    makes: ["lamborghini"],
    models: ["diablo"],
    yearStart: 1990,
    yearEnd: 2001,
    knowledge: {
      knownIssues: [
        { issue: "Electrical failures — the Diablo's Italian electronics from the 1990s are notoriously fragile. Budget for rewiring and finding specialists who know the car.", severity: "critical" },
        { issue: "Cooling system issues — the mid-engine layout makes the Diablo prone to overheating if coolant system is neglected. Confirm recent coolant flush and hose inspection.", severity: "critical" },
        { issue: "Persnickety gearbox — the Diablo's gearbox requires precise throttle blipping for smooth shifts. 'Notchy' is normal; crunching is not.", severity: "watch" },
        { issue: "Interior leather cracking and door card delamination — these are 30+ year old Italian interiors. Restoration costs can be significant.", severity: "minor" },
        { issue: "Clutch wear — the heavy clutch wears faster on early Diablos. Ask about last clutch replacement.", severity: "watch" },
        { issue: "Find a specialist — the Diablo requires a Lamborghini specialist for any major service. General exotic shops often lack the tooling and knowledge.", severity: "critical" },
      ],
      funFacts: [
        "The Diablo was the first Lamborghini to exceed 200 mph, with the VT hitting 202 mph in factory testing.",
        "The name 'Diablo' means 'devil' in Spanish — continuing Lamborghini's tradition of naming cars after famous fighting bulls.",
        "The Diablo was designed by Marcello Gandini, the same designer behind the Countach and Miura.",
        "When Audi acquired Lamborghini in 1998, they immediately improved the Diablo's build quality and reliability for the remaining years of production.",
        "Only 2,903 Diablos were built across all variants over 11 years of production.",
      ],
    },
  },

  // ── LAMBORGHINI COUNTACH (1974–1990) ────────────────────────────────────
  {
    makes: ["lamborghini"],
    models: ["countach"],
    yearStart: 1974,
    yearEnd: 1990,
    knowledge: {
      knownIssues: [
        { issue: "Carburettor synchronisation — the Countach uses 6 side-draft Weber carburettors that require expert synchronization. Out-of-tune carbs cause rough running and poor fuel economy.", severity: "watch" },
        { issue: "Rear visibility — the Countach has virtually no rear visibility. The external mirrors are decorative. This is a feature, not a bug.", severity: "minor" },
        { issue: "Cooling system fragility — the mid-engine layout and radiator placement make it prone to overheating in traffic. Not a daily driver.", severity: "watch" },
        { issue: "Chassis rust — aluminum body panels on a steel spaceframe. The frame can rust while the panels look perfect. Inspect the spaceframe carefully.", severity: "critical" },
        { issue: "LP400 and LP400S clutch — the early Countach's clutch requires significant leg strength. Not suitable for traffic driving.", severity: "minor" },
        { issue: "Parts availability — some mechanical components are extremely rare and expensive. Confirm availability of any known needed parts.", severity: "watch" },
      ],
      funFacts: [
        "The name 'Countach' is a Piedmontese Italian exclamation of astonishment — reportedly the word uttered by Bertone workers when they first saw the prototype.",
        "The Countach's scissor doors were designed by Marcello Gandini specifically because the low roofline made conventional doors impractical.",
        "A poster of the Countach was the best-selling automotive poster of the 1970s and 80s — it's estimated to have hung in more bedrooms than any other car image.",
        "The LP400 (1974–1978) is considered the purest Countach — the wide-arch later models added visual drama but weight.",
        "Only 1,999 Countachs were built across all variants — making any well-documented example highly collectible.",
      ],
    },
  },
];

export function getModelKnowledge(title: string, year: number | null): ModelKnowledge | null {
  const titleLower = title.toLowerCase();
  const carYear = year ?? extractYear(title);

  for (const entry of knowledgeBase) {
    // Check make match
    const makeMatch = entry.makes.some(make => titleLower.includes(make));
    if (!makeMatch) continue;

    // Check model match
    const modelMatch = entry.models.some(model => titleLower.includes(model));
    if (!modelMatch) continue;

    // Check year range if specified
    if (carYear !== null) {
      if (entry.yearStart && carYear < entry.yearStart) continue;
      if (entry.yearEnd && carYear > entry.yearEnd) continue;
    }

    return {
      matchedModel: `${entry.makes[0]} ${entry.models[0]} (${entry.yearStart}–${entry.yearEnd})`,
      ...entry.knowledge,
    };
  }

  return null;
}

function extractYear(title: string): number | null {
  const match = title.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0]) : null;
}
