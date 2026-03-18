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

  // ── LAMBORGHINI MIURA (1966–1973) ───────────────────────────────────────
  {
    makes: ["lamborghini"],
    models: ["miura", "p400"],
    yearStart: 1966,
    yearEnd: 1973,
    knowledge: {
      knownIssues: [
        { issue: "Shared engine/gearbox oil sump (P400 and P400 S, and first 54 SVs) — engine and transmission share a single oil sump, meaning EP gear oil additives fight with engine dispersants. Accelerates cam follower and main bearing wear. Confirm whether the sump has been separated (a standard restoration step). SVs from chassis ~5084 onward were factory split-sump.", severity: "critical", yearsAffected: "1966–1971 (P400 and P400 S); first 54 SVs" },
        { issue: "Cooling system marginality — the Miura's cooling is adequate for European touring but stressed in traffic, hot climates, or sustained high speed. Confirm radiator condition, fresh hoses, and thermostat function. Many restorations add electric fan assist.", severity: "critical" },
        { issue: "Chassis rust in sills, floor, and inner wheel arches — the steel monocoque is a known rust point, particularly on cars from non-dry climates. Full underside inspection with a lift is mandatory. Rotted sills are expensive structural repairs.", severity: "critical" },
        { issue: "Engine access and service complexity — the V12 is transversely mounted and upside-down relative to a conventional installation. Valve adjustment, oil changes, and carburetor service all require specialist knowledge. Deferred valve service leads to cam lobe and follower wear.", severity: "watch" },
        { issue: "Weber carburetor tuning — four triple-choke Webers require expert synchronization. Out-of-tune carbs produce rough idle, hesitation, and poor fuel economy. Confirm last carburetor service.", severity: "watch" },
        { issue: "Front-end aerodynamic lift at speed — the low nose generates lift above ~240 km/h, especially on early P400 cars. Some cars have been fitted with chin spoilers. Ask about high-speed stability.", severity: "watch", yearsAffected: "P400 (most pronounced on early examples)" },
        { issue: "Matching numbers — engine stampings and gearbox numbers should correspond to factory build records. The Lamborghini Polo Storico registry can verify. Non-matching cars trade at steep discounts; discrepancies should be fully documented and explained.", severity: "watch" },
      ],
      funFacts: [
        "The Miura was designed in secret by three Lamborghini engineers — Dallara, Stanzani, and Wallace — working evenings without Ferruccio's authorization. When the rolling chassis debuted at Turin in 1965, the crowd placed orders before a body even existed.",
        "When the completed Miura debuted at Geneva in 1966, the engine bay was kept locked — because the engineers hadn't yet confirmed the engine would actually fit. The hood contained ballast.",
        "The name 'Miura' comes from the Miura fighting bull ranch in Andalusia, Spain — continuing Lamborghini's tradition of bull-themed names (Countach, Diablo, Murciélago, Gallardo all follow).",
        "The P400 SV is the most desirable production Miura: wider rear arches, revised suspension with separate rear uprights, and (on the last 96 SVs) a factory-split engine/gearbox sump. Only 150 SVs were built.",
        "Giampaolo Dallara, who secretly designed the Miura chassis, later founded Dallara Automobili — which now builds chassis for IndyCar, Formula 2, and Formula 3.",
        "The Miura's transverse mid-engine layout was borrowed conceptually from the Morris Mini — a front-drive economy car. Dallara and Stanzani scaled it up to a 3.9-litre V12 and put it in the rear.",
      ],
    },
  },

  // ── LAMBORGHINI MURCIÉLAGO (2001–2010) ──────────────────────────────────
  {
    makes: ["lamborghini"],
    models: ["murciélago", "murcielago"],
    yearStart: 2001,
    yearEnd: 2010,
    knowledge: {
      knownIssues: [
        { issue: "Clutch wear on manual cars — the Murciélago's manual transmission uses a heavy clutch that wears quickly in traffic or if slipped excessively. Budget $3,000–$6,000 for replacement on a high-mileage manual.", severity: "watch" },
        { issue: "E-gear (automated manual) transmission issues — the single-clutch e-gear gearbox is notoriously jerky at low speeds and can develop actuator failures and solenoid issues. Repairs are expensive and parts availability is decreasing.", severity: "critical" },
        { issue: "Cooling and overheating in traffic — the Murciélago's V12 runs hot and the cooling system is marginal at low speeds or in traffic. Many cars have been overheated. Confirm no head gasket issues and check for white exhaust on startup.", severity: "watch" },
        { issue: "Rear clamshell hinge wear — the distinctive rear clamshell engine cover can develop hinge issues. Confirm it opens and closes properly.", severity: "minor" },
        { issue: "Interior quality and aging — the Murciélago's leather and plastics age poorly; the e-gear display and infotainment electronics are fragile and increasingly difficult to source. Budget for interior refurbishment on older examples.", severity: "watch" },
        { issue: "LP640 and LP670 differential and drivetrain stress — the top-spec variants push the AWD system hard. Confirm no clunking from the front differential or driveshafts.", severity: "watch", yearsAffected: "LP640 (2006–2010), LP670-4 SV (2009–2010)" },
        { issue: "Service history is critical — the Murciélago requires specialist service. General exotic shops often lack proper tooling. A dealer-maintained car with documented service history is worth meaningfully more.", severity: "watch" },
      ],
      funFacts: [
        "The Murciélago is named after a famous fighting bull that survived 24 sword strikes in an 1879 fight — the matador was so impressed he spared it. Lamborghini boss Audi purchased the naming rights.",
        "The LP670-4 SuperVeloce (2009) is the rarest and most powerful production Murciélago: 670hp, stripped interior, carbon fiber everywhere, and only 186 examples built.",
        "The Murciélago was the first Lamborghini developed under Audi ownership — the improvement in build quality over the Diablo was immediately apparent.",
        "At 6.5 litres, the Murciélago's V12 is one of the largest production supercar engines ever built — and Lamborghini squeezed 670hp from it in final SV form without forced induction.",
        "The LP670-4 SV was the last of the scissor-door V12 Lamborghinis — the Aventador that replaced it uses a completely different carbon monocoque platform.",
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

  // ── PORSCHE 930 TURBO (1976–1989) ───────────────────────────────────────
  {
    makes: ["porsche"],
    models: ["930", "911 turbo"],
    yearStart: 1976,
    yearEnd: 1989,
    knowledge: {
      knownIssues: [
        { issue: "Turbo lag and lift-off oversteer — the 930's turbo delivers power in a sudden, violent rush at ~4,000 rpm with minimal boost below. The abrupt power surge combined with rear-engine weight bias created the car's 'widow-maker' reputation. Lift-off in a corner mid-boost unloads the front and snaps the rear. This is a feature of every 930 — new buyers should be experienced.", severity: "watch" },
        { issue: "Turbocharger heat soak and bearing wear — the KKK turbocharger runs extremely hot. Let the car idle for 2–3 minutes before shutdown to cool the bearings. Cars that weren't given cool-down time develop bearing wear and shaft play. Have a PPI mechanic check for turbo play.", severity: "critical" },
        { issue: "Intercooler and boost plumbing leaks — the 3.3L cars (1978+) use an intercooler under the rear spoiler. Boost hoses crack with age and heat cycling. Confirm no boost leaks.", severity: "watch", yearsAffected: "1978–1989 (3.3L cars only)" },
        { issue: "CIS fuel injection maintenance — the Bosch K-Jetronic (CIS) fuel injection is reliable when properly maintained but sensitive to neglect. Confirm last injector service and warm/cold running quality.", severity: "watch" },
        { issue: "Flatnose/Slantnose (M505/M506) retractable headlight mechanisms — the pop-up headlights on factory flachnose cars are electrically operated and prone to motor failure. Confirm both headlights extend and retract fully.", severity: "watch", yearsAffected: "930 Flatnose (M505/M506 option only)" },
      ],
      funFacts: [
        "The 930's turbo lag was so dramatic that the car earned the nickname 'The Widowmaker' — its sudden power delivery caught many experienced drivers off guard, leading to a spate of fatal accidents.",
        "The 1976 930 was the first turbocharged production Porsche — and at the time, one of the fastest road cars in Europe with a 0-60 time under 5 seconds.",
        "The 1989 final-year 930 used a 5-speed G50 gearbox (replacing the old 4-speed), making it the most usable and desirable 930 for driving.",
        "Factory flachnose (Slantnose) cars were the ultimate 930 option — Porsche built them to customer order with retractable headlights, an option that added roughly $25,000 to the base price in 1985 dollars.",
        "The 930 Turbo was banned from sale in the United States from 1980 to 1986 due to emissions regulations — making US-spec 1980–85 cars technically non-existent from the factory.",
      ],
    },
  },

  // ── PORSCHE 356 (1950–1965) ──────────────────────────────────────────────
  {
    makes: ["porsche"],
    models: ["356"],
    yearStart: 1950,
    yearEnd: 1965,
    knowledge: {
      knownIssues: [
        { issue: "Rust throughout — 356s rust aggressively in all the typical places: floor pans, battery tray, sills, door bottoms, and particularly the front trunk floor and under the windshield. A car from a dry climate (Arizona, California) is worth a significant premium. Full underfloor inspection is mandatory.", severity: "critical" },
        { issue: "Engine rebuild status — the 356's pushrod 4-cylinder is durable but most cars are now 60+ years old. Confirm last engine rebuild, oil pressure at idle and redline, and any blue smoke under acceleration. A fresh rebuild by a 356 specialist is a strong positive.", severity: "watch" },
        { issue: "Transmission gear and synchro wear — the 356's gearboxes, particularly early crash-gearbox cars and later 4-speed units, wear synchros on 2nd and 3rd. Confirm clean, smooth shifting through all gears.", severity: "watch" },
        { issue: "Carrera engine (Type 547) complexity — if the car has a Carrera engine (DOHC Type 547), this is a museum-quality unit. The 547 requires specialist care — general Porsche shops often lack the expertise. Confirm last service by a 356 Carrera specialist. Budget $15,000–$30,000 for a full 547 rebuild.", severity: "critical", yearsAffected: "356 Carrera only" },
        { issue: "Body panel patina and authenticity — 356 bodies are steel with some aluminum components. Panel replacement and repair work is common; confirm any major bodywork. Original panel stamps and numbers are important for serious collectors.", severity: "watch" },
      ],
      funFacts: [
        "The 356 was the first car Porsche ever built — Ferdinand Porsche Jr. designed it in a sawmill in Gmünd, Austria in 1948 using many VW Beetle components.",
        "The iconic 356 Speedster was designed specifically for the American market at the request of Porsche's US importer Max Hoffman — who told Ferry Porsche that Americans wanted a cheaper, more sporting version.",
        "The 356 Carrera's Type 547 engine was designed by Ernst Fuhrmann and originally developed for racing. It features four overhead camshafts driven by a complex shaft-and-bevel-gear system — a 1.5-litre engine that produces ~100hp in road trim.",
        "Only 3,918 Speedsters were built across all 356 generations — making them among the most collectible postwar Porsches and commanding prices 60–70% above equivalent coupes.",
        "The 356 was produced in three major variants: the 356A (1955–1959), 356B (1959–1963), and 356C (1963–1965) — each with progressive improvements to the engine, suspension, and braking.",
      ],
    },
  },

  // ── PORSCHE 914 (1969–1976) ──────────────────────────────────────────────
  {
    makes: ["porsche"],
    models: ["914"],
    yearStart: 1969,
    yearEnd: 1976,
    knowledge: {
      knownIssues: [
        { issue: "Rust — the 914 rusts badly. The rocker panels, sills, floor pans, battery tray, and A-pillar bases are classic failure points. Targa roof seals also allow water intrusion. A clean, rust-free 914 from a dry climate is rare and worth a premium.", severity: "critical" },
        { issue: "Targa roof seal deterioration — the removable targa panel's rubber seals harden and shrink with age, allowing water to pool in the sill and accelerate the floor rust problem. Confirm the seals are in good condition or recently replaced.", severity: "watch" },
        { issue: "914/4 fuel injection issues — later 914/4s use CIS (Bosch K-Jetronic) injection that requires calibration and maintenance. Rough running, hard starts, and fuel smell can indicate injection problems.", severity: "watch", yearsAffected: "1973–1976 (fuel-injected 914/4)" },
        { issue: "914/6 rarity and parts cost — the flat-six 914/6 is far more valuable than the 914/4 but parts are expensive and less available. Confirm the flat-six is indeed original (matching numbers) and not a 914/4-to-6 conversion, which does exist.", severity: "watch", yearsAffected: "914/6 only (1969–1972)" },
      ],
      funFacts: [
        "The 914 was a joint project between Porsche and Volkswagen — the 914/4 was sold as a VW-Porsche in Europe, while the 914/6 was sold exclusively as a Porsche.",
        "The 914/6 GT was a factory competition version — only about 16 were built, using a 911S engine and race-prepared chassis. One won its class at Le Mans in 1970. Examples are worth ~$500,000+ today.",
        "The 914 was Porsche's first mid-engine production car, giving it handling characteristics closer to a racing car than any previous Porsche.",
        "Porsche Ferdinand Piëch drove a 914/6 in the 1970 Monte Carlo Rally, finishing sixth overall — demonstrating the car's performance potential.",
        "The 914/6 is now considered a sleeper — 3,300 were built, it shares many components with the 911T of the era, and well-documented examples have appreciated 300% since 2010.",
      ],
    },
  },

  // ── PORSCHE 968 (1992–1995) ──────────────────────────────────────────────
  {
    makes: ["porsche"],
    models: ["968"],
    yearStart: 1992,
    yearEnd: 1995,
    knowledge: {
      knownIssues: [
        { issue: "Tiptronic transmission valve body failures — the optional Tiptronic on the 968 can develop valve body issues. Manual cars are preferred by enthusiasts and command a significant premium.", severity: "watch" },
        { issue: "Engine oil consumption — the 968's 3.0L inline-four can develop ring wear and consume oil on high-mileage examples. Check dipstick and confirm oil change intervals.", severity: "watch" },
        { issue: "Interior wear — the 968's cloth and leather interior components age and wear. Replacement parts are increasingly scarce. Budget for interior refurbishment on high-mileage cars.", severity: "minor" },
        { issue: "Rust on battery tray and underneath — not as prone as older Porsches but still worth inspecting. Battery acid damage to the tray is common.", severity: "watch" },
      ],
      funFacts: [
        "The 968 was Porsche's last front-engine sports car until the Cayman's introduction — and arguably the most refined evolution of the 924/944/968 lineage.",
        "The 968 Club Sport (CS) is the benchmark — it weighed 200 lbs less than the standard 968, deleted the rear seats, A/C, and sound deadening, and used a retuned suspension. Only a few hundred were sold in the US.",
        "The 968's VarioCam variable valve timing was one of the first systems of its kind on a production sports car, giving it 240hp from a 3.0L four-cylinder.",
        "The 968 debuted the same year as the 993 and was quietly discontinued in 1995 — a car ahead of its time that was largely overlooked until the collector car market re-evaluated it.",
        "Road & Track named the 968 CS one of the '10 best cars in the world' in 1993 — yet it was discontinued two years later due to poor sales.",
      ],
    },
  },

  // ── FERRARI 308 / 328 (1975–1989) ───────────────────────────────────────
  {
    makes: ["ferrari"],
    models: ["308", "328"],
    yearStart: 1975,
    yearEnd: 1989,
    knowledge: {
      knownIssues: [
        { issue: "Belt service — the 308/328 V8 requires timing belt changes every 3 years or 30,000 miles, whichever comes first. A missed belt service is a potential engine failure. Always confirm the last belt service date and mileage.", severity: "critical" },
        { issue: "Carbureted 308 (pre-1980) carburetor maintenance — the early carbed 308 uses four Weber 40DCNF carburetors that require expert synchronization. Out-of-tune carbs cause rough running and rich mixture. Confirm last carb service.", severity: "watch", yearsAffected: "308 GT4 and early 308 GTB/GTS (1975–1980)" },
        { issue: "Cam belt and cam cover oil leaks — cam cover gaskets weep oil on most examples. Not a dealbreaker but confirm no serious leakage pooling.", severity: "watch" },
        { issue: "Cooling system neglect — the 308/328 requires periodic coolant changes. Neglected cooling systems develop corrosion in the passages. Confirm last coolant flush.", severity: "watch" },
        { issue: "Fiberglass body (Vetroresina 308 GTB, 1975–1977) — the earliest 308 GTBs have fiberglass bodies. Cracks, delamination, and amateur repair work are common. A genuine unrestored vetroresina is rare; confirm body originality.", severity: "watch", yearsAffected: "1975–1977 (308 GTB Vetroresina only)" },
        { issue: "Catalytic converter failures on US-spec cars — cats can deteriorate and contaminate the engine. Confirm cat condition or confirm they have been responsibly deleted.", severity: "watch", yearsAffected: "US-spec 308/328 with cats" },
      ],
      funFacts: [
        "The 308 GTB was Ferrari's most successful sports car of the 1970s — the company sold more 308s than any previous model, making it the car that kept Ferrari financially viable.",
        "Tom Selleck's Magnum P.I. TV series (1980–1988) made the 308 GTS globally iconic. Ferrari reportedly provided the car as product placement, launching the model to mainstream fame.",
        "The 308 GTB Vetroresina (fiberglass body) was produced for only two years (1975–1977), with approximately 712 cars built. Its fiberglass body is lighter and now highly collectible — it commands an 80% premium over the steel-bodied cars.",
        "The 328 GTS was the final evolution, adding 3.2 litres and 270hp in 1985 — a significant improvement over the 308's 255hp and the car many consider the best all-around of the family.",
        "Pininfarina designed the 308 body — and it remains in production at least in spirit: the current Ferrari Roma uses many of the same design proportions.",
      ],
    },
  },

  // ── FERRARI TESTAROSSA / 512 TR / F512 M (1984–1996) ────────────────────
  {
    makes: ["ferrari"],
    models: ["testarossa", "512 tr", "f512 m", "512tr", "f512m"],
    yearStart: 1984,
    yearEnd: 1996,
    knowledge: {
      knownIssues: [
        { issue: "Belt service — all Testarossa family cars require timing belt changes every 3 years regardless of mileage. The flat-12 engine has two separate cam belt systems that must be done together. Confirm last belt service date and mileage.", severity: "critical" },
        { issue: "Clutch wear — the Testarossa's heavy clutch (especially the original) is not designed for city driving. High-mileage cars in urban environments wear clutches quickly. Budget $3,000–$5,000 for replacement.", severity: "watch" },
        { issue: "Fuel injection issues on later cars — the 512 TR and F512 M use Bosch Motronic injection. Injector clogs and lambda sensor failures cause rough running. Confirm last fuel system service.", severity: "watch", yearsAffected: "512 TR (1991–1994) and F512 M (1994–1996)" },
        { issue: "Heat soak and engine bay temperatures — the flat-12 generates enormous heat. Components in the engine bay (wiring, hoses, sensors) degrade faster than typical sports cars. Inspect for brittle hoses and heat-damaged wiring.", severity: "watch" },
        { issue: "Early Testarossa rear window seal — the black trim on the side strakes and rear window can shrink and crack. Not mechanical but expensive to source OEM.", severity: "minor", yearsAffected: "1984–1991 (original Testarossa)" },
        { issue: "Single-mirror (Monospecchio) Testarossa legality — the very earliest Testarossas were delivered with a single center-mounted rear mirror. This was not legal in many markets and most have had a second mirror added. A true single-mirror car is rare and valuable.", severity: "minor", yearsAffected: "1984 (approximately the first 50 production cars)" },
      ],
      funFacts: [
        "The Testarossa name means 'red head' in Italian — referring to the red-painted cam covers of the flat-12 engine, continuing a tradition from the 1950s Ferrari Testa Rossa race cars.",
        "The Testarossa's distinctive side strakes were functional — they channeled air to the mid-mounted radiators, which Ferrari relocated from the front to free up nose space.",
        "The F512 M is the rarest of the family with only 501 built (1994–1996) — making it worth roughly 70% more than a 512 TR and over twice a standard Testarossa.",
        "Miami Vice's use of the Testarossa in 1984 created one of the most successful automotive product placements in history. The show used a white prototype before production cars were even available.",
        "The flat-12 engine in the Testarossa displaces 4.9 litres and makes 390hp — the same basic architecture that powered Ferrari's 312B Formula 1 cars in the early 1970s.",
      ],
    },
  },

  // ── MERCEDES-BENZ 300SL (1954–1963) ─────────────────────────────────────
  {
    makes: ["mercedes", "mercedes-benz"],
    models: ["300sl", "300 sl"],
    yearStart: 1954,
    yearEnd: 1963,
    knowledge: {
      knownIssues: [
        { issue: "Frame tube rust — the 300SL uses a lightweight tubular space frame. Rust in the frame tubes is difficult to detect and expensive to repair. A borescope inspection of the inner tubes is standard practice on serious inspections.", severity: "critical" },
        { issue: "Fuel injection maintenance (Gullwing and early Roadster) — the 300SL uses the world's first production mechanical fuel injection (Bosch direct injection). It requires specialist calibration and is sensitive to fuel quality. Cold-start enrichment issues and rough running trace here.", severity: "watch", yearsAffected: "All 300SL (1954–1963)" },
        { issue: "Gullwing door hinge wear — the iconic gullwing doors use a complex hinge mechanism that wears over 70 years of use. Doors that sag or don't close flush indicate worn hinges. Inspection and adjustment or replacement is a known maintenance item.", severity: "watch", yearsAffected: "Gullwing (1954–1957) only" },
        { issue: "Roadster soft top condition — the convertible top ages, shrinks, and tears. OEM replacement tops are available from specialists but cost $2,000–$4,000 installed.", severity: "minor", yearsAffected: "Roadster (1957–1963) only" },
        { issue: "Matching numbers and documentation — the 300SL market is extremely sensitive to numbers-matching. Engine stampings, chassis plate, and factory build records (from Daimler-Benz Classic) should all be verified. Non-matching cars trade at 20–40% discounts.", severity: "critical" },
      ],
      funFacts: [
        "The 300SL Gullwing was the fastest production car in the world when it launched in 1954 — its 215 km/h (134 mph) top speed came from the world's first production direct fuel injection system.",
        "The gullwing doors weren't a styling exercise — the tubular space frame left no room for conventional doors, so Mercedes engineer Rudolf Uhlenhaut designed the distinctive swing-up doors as the only solution.",
        "Only 1,400 Gullwings were built (1954–1957), followed by 1,858 Roadsters (1957–1963). Today they are among the most valuable postwar automobiles, with Gullwings regularly exceeding $1.5M and exceptional examples breaking $3M.",
        "The 300SL was conceived largely at the insistence of Maximilian Hoffman, the Austrian-American Mercedes importer, who convinced Stuttgart that American buyers would pay for a road-going version of the 300SL race car.",
        "Rudolf Uhlenhaut, the 300SL's chief engineer, was reportedly the fastest driver at Daimler-Benz — capable of lapping the Nürburgring faster than most professional drivers of the era.",
      ],
    },
  },

  // ── MERCEDES-BENZ PAGODA SL (1963–1971) ─────────────────────────────────
  {
    makes: ["mercedes", "mercedes-benz"],
    models: ["pagoda", "230sl", "250sl", "280sl"],
    yearStart: 1963,
    yearEnd: 1971,
    knowledge: {
      knownIssues: [
        { issue: "Rust in sills, floor pans, and battery area — the Pagoda rusts in predictable places. The sills are particularly vulnerable because they trap water. Cars from Germany or the US East Coast are higher risk than California or Arizona examples.", severity: "critical" },
        { issue: "Fuel injection (Bosch D-Jetronic on 250SL and 280SL) — the electronic injection is reliable when properly maintained but sensitive to vacuum leaks and cold-start enrichment problems. Confirm it runs cleanly cold and hot.", severity: "watch", yearsAffected: "250SL (1966–1968) and 280SL (1967–1971)" },
        { issue: "Soft top and hardtop condition — both tops are desirable on Pagodas. The soft top deteriorates with UV exposure; the hardtop is a separate item that commands a premium when present. Confirm condition of whichever is included.", severity: "minor" },
        { issue: "280SL carburetor cars (some markets) — some 280SLs were delivered with carburetors rather than injection, particularly outside the US. These are mechanically simpler but may require carburetor rebuild.", severity: "minor", yearsAffected: "Some non-US 280SL" },
        { issue: "Chrome and trim patina — the Pagoda's extensive chrome ages and pits. Full chrome restoration is expensive ($3,000–$6,000 for exterior chrome). Assess condition carefully if originality matters.", severity: "minor" },
      ],
      funFacts: [
        "The 'Pagoda' nickname comes from the concave hardtop roof — designed by Paul Bracq to give drivers more headroom while keeping the roofline low.",
        "The 280SL is the most desirable Pagoda: more power, more refined, and the last of the line (1967–1971). It commands a roughly 40% premium over the 230SL despite using the same body.",
        "Only 48,912 Pagodas were built across all three variants — with 23,885 being 280SLs, making the 230SL (19,831) and 250SL (5,196) the rarer models despite their lower values.",
        "The Pagoda succeeded the Gullwing as Mercedes' sports car but was a completely different philosophy — more comfortable grand tourer than sports car, though it handled respectably.",
        "The Pagoda was one of the first cars to be designed from the start to be easy to service — Mercedes specifically engineered wide access to the engine bay after feedback from owners.",
      ],
    },
  },

  // ── MERCEDES-BENZ 190E COSWORTH (1984–1993) ──────────────────────────────
  {
    makes: ["mercedes", "mercedes-benz"],
    models: ["190e", "190 e"],
    yearStart: 1984,
    yearEnd: 1993,
    knowledge: {
      knownIssues: [
        { issue: "Cosworth head gasket and head bolt stretch — the 16-valve Cosworth engine (2.3-16 and 2.5-16) can develop head gasket failures, particularly on high-mileage cars or those that were overheated. Confirm coolant temperature stability and no white exhaust smoke.", severity: "critical", yearsAffected: "190E 2.3-16 and 2.5-16 Cosworth only" },
        { issue: "Rust in rear wheel arches and sills — the W201 190E rusts predictably in the rear arch lips, sills, and lower door edges. Inspect carefully.", severity: "watch" },
        { issue: "Leather and interior wear — the 190E's interior ages: leather cracks, door panel stitching fails, and the dashboard can warp in hot climates. Budget for interior refurbishment on high-mileage examples.", severity: "minor" },
        { issue: "Fuel injection system on base 190E models — the standard 190E 2.3 and 2.6 use CIS injection that requires periodic calibration. Confirm warm and cold running quality.", severity: "minor", yearsAffected: "Base 190E only (non-Cosworth)" },
      ],
      funFacts: [
        "The 190E 2.3-16 Cosworth was developed by Cosworth Engineering specifically to be the basis of the DTM racing series — Mercedes wanted a homologation special and Cosworth designed a DOHC 16-valve head for the slab-sided 190E body.",
        "The launch race at the new Nürburgring in 1984 featured a grid of identical 190E 2.3-16s driven by legends including Ayrton Senna, Carlos Reutemann, Stirling Moss, and Juan Manuel Fangio. Senna won.",
        "Only 5,000 of the 2.3-16 were built for homologation — the 2.5-16 Evolution I and II are even rarer and are now among the most collectible 1980s performance sedans, commanding 3–5× the base 2.3-16's value.",
        "The 190E Cosworth's development was completely secret — Mercedes gave Cosworth the project under strict NDA, and even many Mercedes employees didn't know it was coming until the 1983 Frankfurt show reveal.",
        "The 2.5-16 Evolution II (1990) produced 272hp from a 2.5L four-cylinder — equivalent specific output to a Ferrari 308 of the same era.",
      ],
    },
  },

  // ── BMW 2002 / 2002 TII / 2002 TURBO (1966–1976) ─────────────────────────
  {
    makes: ["bmw"],
    models: ["2002"],
    yearStart: 1966,
    yearEnd: 1976,
    knowledge: {
      knownIssues: [
        { issue: "Rust — the 2002 rusts aggressively: floor pans, sill ends, rear wheel arches, front strut towers, and behind the rear tail lights are classic failure points. A rust-free California or Arizona car commands a significant premium. Full inspection underneath is mandatory.", severity: "critical" },
        { issue: "2002tii Kugelfischer mechanical injection maintenance — the rare and complex Kugelfischer pump-and-injector fuel injection on the tii requires specialist knowledge to calibrate. Running issues nearly always trace here. A well-calibrated tii runs smoothly; a neglected one is frustrating.", severity: "watch", yearsAffected: "2002tii only (1971–1974)" },
        { issue: "2002 Turbo boost pressure and KKK turbocharger — the turbocharged 2002 was the first production turbocharged car from a European manufacturer. The KKK turbo and associated plumbing are 50+ years old. Check for boost leaks, turbo play, and oil leaks around the turbo.", severity: "critical", yearsAffected: "2002 Turbo only (1973–1974)" },
        { issue: "Carburetor synchronization on base 2002 — the standard 2002 uses twin Solex or Zenith carbs that require periodic synchronization. Rough idle and hesitation trace here.", severity: "minor", yearsAffected: "Base 2002 (non-tii)" },
      ],
      funFacts: [
        "The BMW 2002 is the car that saved BMW — in the late 1960s, BMW was struggling financially until the 2002's combination of performance, practicality, and affordability created an entirely new market for sports sedans.",
        "The 2002 Turbo was the first turbocharged production car from a European manufacturer, launched in 1973. Despite producing only 170hp, it could reach 130 mph and was considered exotic for its era.",
        "The 2002tii's Kugelfischer mechanical fuel injection was the same system used on BMW's Formula 2 racing cars — a remarkable piece of technology for a production street car.",
        "The 2002 is widely considered the spiritual predecessor to the entire modern 3-series line — BMW intentionally positioned the 3-series as its successor when it launched in 1975.",
        "Paul Bracq, who designed the Mercedes Pagoda SL, also contributed to the 2002's visual language — though the production car was primarily the work of BMW designer Wilhelm Hofmeister.",
      ],
    },
  },

  // ── BMW E30 M3 (1986–1991) ────────────────────────────────────────────────
  {
    makes: ["bmw"],
    models: ["e30 m3", "m3"],
    yearStart: 1986,
    yearEnd: 1991,
    knowledge: {
      knownIssues: [
        { issue: "S14 engine rod bearing wear — the high-revving S14 four-cylinder requires oil changes every 5,000 miles maximum. Neglected oil changes accelerate rod bearing wear. Confirm oil change intervals and listen for any bottom-end knock.", severity: "critical" },
        { issue: "S14 throttle body and VANOS equivalent (valve timing) — the S14 uses a simple but precise throttle body arrangement. Confirm all four throttle bodies are balanced and the car idles cleanly.", severity: "watch" },
        { issue: "Rust at rear subframe mounts — E30 M3s rust at the rear subframe mounting points, which is both a structural and safety issue. A PPI should include inspection of the subframe mounts.", severity: "critical" },
        { issue: "High-mileage M3 vs preserved low-mileage — used hard on track vs. pampered street car is a massive quality gap. Confirm track history and any frame/suspension repairs.", severity: "watch" },
        { issue: "Sport Evolution rarity — if a car is presented as a Sport Evo, confirm the VIN and build documentation. Sport Evos command a 40% premium and attract forgeries/misrepresentation.", severity: "watch", yearsAffected: "Sport Evolution (1990) only" },
      ],
      funFacts: [
        "The E30 M3 was a homologation special built for Group A touring car racing — BMW needed to build 5,000 examples to qualify for the series. They ended up building over 17,000.",
        "The S14 four-cylinder engine was derived directly from BMW's Formula 2 engine — the first time a road car had received such direct racing technology from BMW Motorsport.",
        "The E30 M3 won the European Touring Car Championship three consecutive years (1987, 1988, 1989) — plus the WTCC, BTCC, and DTM — making it one of the most successful touring cars ever.",
        "The Sport Evolution (1990) was a limited homologation special with 238hp, larger front spoiler, adjustable rear wing, and revised suspension — only 600 were built and they're now worth 3–4× a standard E30 M3.",
        "Despite being replaced by the far more powerful E36 M3 in 1992, the E30 M3 is widely considered the 'purest' M3 and the benchmark by which all subsequent M3s are judged.",
      ],
    },
  },

  // ── BMW 8-SERIES (1990–1999) ──────────────────────────────────────────────
  {
    makes: ["bmw"],
    models: ["8 series", "8-series", "850", "840", "850csi", "850ci"],
    yearStart: 1990,
    yearEnd: 1999,
    knowledge: {
      knownIssues: [
        { issue: "E-gas throttle system failures — the 8-series uses a fully electronic throttle (drive-by-wire) that was cutting-edge in 1990 but is now 30+ years old. E-gas failures cause stalling, reduced power, or complete throttle unresponsiveness. This is the most common and expensive failure point.", severity: "critical" },
        { issue: "V12 cooling system on 850i/850Ci/850CSi — the M70/M73 V12 runs hot and the cooling system must be maintained. Cracked coolant expansion tanks, aging hoses, and failed thermostats are common. Overheating damage on a V12 is catastrophic.", severity: "critical", yearsAffected: "V12-powered 8-series (850i, 850Ci, 850CSi)" },
        { issue: "Active suspension electrical failures — the optional active rear suspension uses electronic control modules that fail with age. Replacement modules are scarce and expensive.", severity: "watch" },
        { issue: "Interior electronics aging — the 8-series was packed with 1990s electronics including the MBC (multi-function board computer), door control modules, and seat memory. Faults are common and CAN bus diagnostics require specialist tools.", severity: "watch" },
        { issue: "850CSi S70 V12 specialist requirement — the 850CSi uses a unique S70 engine (the basis of the McLaren F1's engine) that differs significantly from the M70/M73. Service requires a specialist; general BMW shops often lack knowledge.", severity: "watch", yearsAffected: "850CSi (1992–1996) only" },
      ],
      funFacts: [
        "The BMW 850CSi was powered by an S70 V12 — the same engine, significantly detuned, that Gordon Murray chose for the McLaren F1. Paul Rosche designed both.",
        "The 8-series was intended to be BMW's technology showcase for the 1990s: fully electronic throttle, active suspension, traction control, and a body made partially from carbon fiber were all firsts for BMW.",
        "Only 1,510 850CSis were ever built — making it the rarest production 8-series and the most collectible, with values now exceeding $100,000 for well-documented examples.",
        "The 8-series took 10 years to develop and reportedly cost BMW over $1 billion — contributing to a financial crisis at the company and ultimately leading to BMW's cost-cutting measures of the mid-1990s.",
        "Despite its high price and advanced technology, the 8-series was a commercial disappointment — BMW had hoped to sell 10,000 per year but rarely exceeded 4,000.",
      ],
    },
  },

  // ── JAGUAR E-TYPE (1961–1975) ─────────────────────────────────────────────
  {
    makes: ["jaguar"],
    models: ["e-type", "e type", "xke"],
    yearStart: 1961,
    yearEnd: 1975,
    knowledge: {
      knownIssues: [
        { issue: "Rust throughout — the E-Type's steel body rusts aggressively: floor pans, sills, inner sills, front cross-members, A-pillars, and particularly the complex front sub-frame structure. A rust-free, dry-climate car is genuinely rare and worth a significant premium.", severity: "critical" },
        { issue: "Cooling system — the XK inline-six's cooling is marginal in the E-Type's tight body. Overheat the engine and you risk head gasket failure, warped head, or worse. Confirm a full cooling system service and steady operating temperature.", severity: "critical" },
        { issue: "XK engine oil leaks — the twin-cam XK engine leaks from cam covers, sump gaskets, and front covers. Some weepage is normal on a vintage car; heavy leaking warrants investigation.", severity: "watch" },
        { issue: "Series 1 vs 2 vs 3 differences — the three series are mechanically and legally quite different. Confirm the car is correctly documented as its presented series. S1 3.8 cars (1961–1964) are the most valuable; Series 3 V12 cars are the most powerful but least collectible.", severity: "watch" },
        { issue: "V12 Series 3 cooling — the Series 3's 5.3L V12 generates significant heat and the cooling system works hard. Overheating issues are more common on V12 cars.", severity: "watch", yearsAffected: "Series 3 (1971–1975) only" },
        { issue: "Leather and interior restoration costs — E-Type interiors age badly: the leather cracks, the woodwork warps, and the Smiths instruments develop faults. A full interior restoration can cost $8,000–$15,000.", severity: "minor" },
      ],
      funFacts: [
        "Enzo Ferrari reportedly called the E-Type 'the most beautiful car ever made' — a quote that has followed the car for 60 years, though the exact wording and context are debated.",
        "The E-Type debuted at the 1961 Geneva Motor Show in two cars driven overnight from the factory — one roadster, one coupe — arriving just in time for the show opening. Jaguar test driver Norman Dewis drove one through the night at an average speed of over 100 mph.",
        "The E-Type was priced at $5,595 when it launched in the US in 1961 — roughly a third of the cost of comparable Italian exotica. This made it the most accessible high-performance sports car of its era.",
        "The Series 1 3.8-litre Fixed Head Coupe (FHC) is considered the most collectible E-Type — the pure, early form with covered headlights, 265hp, and a claimed 150 mph top speed.",
        "The E-Type Series 3 introduced a 5.3L V12 that was later used in the XJ12 sedan — Jaguar's first production V12 engine since the legendary D-Type racing car.",
      ],
    },
  },

  // ── SHELBY GT350 / GT500 (1965–1970) ─────────────────────────────────────
  {
    makes: ["ford", "shelby"],
    models: ["gt350", "gt500", "shelby mustang"],
    yearStart: 1965,
    yearEnd: 1970,
    knowledge: {
      knownIssues: [
        { issue: "Numbers matching is everything — Shelby documentation includes the Shelby certificate, door tag, SAAC registry entry, and matching VIN/engine stampings. The Shelby registry (SAAC) maintains detailed build records. Non-documented or non-matching Shelbys trade at severe discounts versus the fully documented cars.", severity: "critical" },
        { issue: "1965 GT350 rear axle tramp — the early GT350 uses a rear suspension with solid axle traction bars that can produce violent axle tramp under hard acceleration. Period modifications are common and acceptable; confirm suspension history.", severity: "watch", yearsAffected: "1965–1966 (early GT350)" },
        { issue: "GT350R authenticity — the competition GT350R commands a 30%+ premium and has been subject to fraud. Only about 36 were built; confirm SAAC documentation and provenance in detail before any transaction.", severity: "critical", yearsAffected: "GT350R (1965) only" },
        { issue: "Big-block GT500 engine oil consumption — the 428 Cobra Jet in the GT500 can consume oil on high-mileage examples. Confirm oil condition and check for blue smoke.", severity: "watch", yearsAffected: "GT500 (1967–1970)" },
        { issue: "Fastback body rust — rust at the rear wheel arches, lower quarters, and trunk floor is common on 55+ year old Mustang-based cars. Inspect carefully.", severity: "watch" },
      ],
      funFacts: [
        "The original 1965 GT350 was built by Shelby American in just 562 units — Carroll Shelby transformed the standard Mustang fastback with a Paxton supercharger option, racing suspension, and a high-winding 289 Hi-Po to create one of America's first true sports cars.",
        "The 1965 GT350R (competition version) was the first American sports car to win a major SCCA championship — Ken Miles and Jerry Titus dominated the B-Production class in 1965 and 1966.",
        "Hertz famously rented GT350s in 1966 — the 'Hertz Shelby GT350H' was available at airport locations. Renters reportedly returned many cars with racing modifications installed during the weekend rental.",
        "The GT500 KR ('King of the Road') in 1968 featured the 428 Cobra Jet engine — the most powerful production Shelby ever offered, though exact output was conservatively rated at 335hp.",
        "Carroll Shelby's relationship with Ford was born from necessity — he needed Ford's engines after AC Cars couldn't source a suitable powerplant. The resulting Cobra and GT350 defined American performance cars for a generation.",
      ],
    },
  },

  // ── CORVETTE C2 (1963–1967) ────────────────────────────────────────────────
  {
    makes: ["chevrolet", "chevy"],
    models: ["corvette c2", "c2 corvette"],
    yearStart: 1963,
    yearEnd: 1967,
    knowledge: {
      knownIssues: [
        { issue: "Documentation and numbers matching — the C2 Corvette has an extremely active authentication community. The tank sticker, door tag, partial VIN stamps on the engine block and transmission, and broadcast sheet (if present) are all critical. NCRS judges and Bloomington Gold certification provide verification services.", severity: "critical" },
        { issue: "Rust in frame and body mounts — the C2's fiberglass body sits on a steel ladder frame. Frame rust, particularly at the body mounts and crossmembers, is common on non-Southwest cars. Inspect the frame carefully.", severity: "critical" },
        { issue: "Rochester fuel injection (Fuelie) service — the mechanical Rochester fuel injection on the 327 and 427 engines is a rare and complex system. Calibration requires a specialist; a properly running Fuelie is a strong positive.", severity: "watch", yearsAffected: "Fuel-injected 327 and 427 (1963–1965 available; 1963 last year of Fuelie availability)" },
        { issue: "Big-block oil consumption (427 Mark IV) — the 427 big-block can consume oil, particularly on high-mileage examples. Confirm oil condition and no blue smoke.", severity: "watch", yearsAffected: "427-equipped C2 (1966–1967)" },
      ],
      funFacts: [
        "The 1963 'Split Window' Coupe is the most iconic C2 — the split rear window was Zora Arkus-Duntov's vision, though Chevy chief designer Bill Mitchell lobbied to remove it in 1964. It was only offered for one year, making it among the most desirable production Corvettes.",
        "The C2 was the first Corvette to offer independent rear suspension — a massive upgrade from the solid axle of the C1 and something that finally matched European sports car handling.",
        "The fuel-injected 327 (L84) producing 375hp was the most powerful small-block ever offered in a C2 — and at $538 optional price, it was a factory option that's now worth a 20% premium on the resale market.",
        "Zora Arkus-Duntov, the legendary 'Father of the Corvette,' personally pushed for the C2's improved chassis and independent rear suspension — he wanted the Corvette to be a world-class sports car, not just a cruiser.",
        "The 1967 L88 427 (435hp) is the most valuable production C2 — only 20 were built, intended for racing use, and they now sell for $1M–$3M depending on provenance.",
      ],
    },
  },

  // ── 1969 CAMARO Z/28 / COPO (1967–1969) ──────────────────────────────────
  {
    makes: ["chevrolet", "chevy"],
    models: ["camaro"],
    yearStart: 1967,
    yearEnd: 1969,
    knowledge: {
      knownIssues: [
        { issue: "Documentation and numbers matching — the first-gen Camaro's authentication depends on the trim tag (Norwood vs Van Nuys assembly), partial VIN on the engine block, Protect-O-Plate, and build sheet if present. COPO cars require factory COPO documentation; Z/28 cars require engine code confirmation.", severity: "critical" },
        { issue: "Rust at cowl, frame rails, and floor pans — 55+ year old cars from rust-belt states can have significant metal issues. The cowl is particularly notorious for trapping water.", severity: "critical" },
        { issue: "DZ 302 high-rev engine wear on Z/28 — the Z/28's solid-lifter 302 was designed to rev to 7,000 rpm for Trans-Am homologation. Heavy track use accelerates cam and lifter wear. Confirm last valve adjustment and cam inspection.", severity: "watch", yearsAffected: "Z/28 (1967–1969) only" },
        { issue: "COPO 427/454 big-block provenance — COPO cars were ordered through the Central Office Production Order system and have no standard factory documentation. Authentication requires the COPO number on the trim tag and expert verification.", severity: "critical", yearsAffected: "COPO Camaro only" },
      ],
      funFacts: [
        "The COPO (Central Office Production Order) Camaro was a backdoor system Vince Piggins at Chevrolet designed to get big-block engines into the Camaro, which officially couldn't have one due to GM's 400ci engine limit for intermediate cars.",
        "Only 1,015 COPO 427 Camaros were built in 1969 (COPO #9561) — plus 69 with the ZL1 all-aluminum 427 (COPO #9560). A documented ZL1 COPO is worth $500,000–$1,000,000+.",
        "The 1969 Z/28 was built specifically to qualify for SCCA Trans-Am racing, which required a 305ci limit. Chevrolet created the 302 by putting a 327 crank in a 283 block — technically meeting the letter but not the spirit of the rule.",
        "The 1969 Camaro is considered the pinnacle of the first generation — more powerful options, revised styling, and a wider range of packages than any other first-gen year.",
        "Penske Racing's Mark Donohue dominated the 1968 Trans-Am season in a Z/28, winning 10 of 13 races — cementing the Z/28's performance reputation and driving demand for the street cars.",
      ],
    },
  },

  // ── HONDA NSX / ACURA NSX (1990–2005) ─────────────────────────────────────
  {
    makes: ["honda", "acura"],
    models: ["nsx"],
    yearStart: 1990,
    yearEnd: 2005,
    knowledge: {
      knownIssues: [
        { issue: "Timing belt replacement — the NSX's C30A/C32B V6 requires timing belt changes every 3 years or 60,000 miles. A missed belt service is an engine failure waiting to happen. Confirm last belt date and mileage.", severity: "critical" },
        { issue: "Transmission bearing wear on high-mileage manual cars — the NSX's close-ratio 5-speed (NA1) or 6-speed (late NA1/NA2) transmissions are robust but develop bearing noise on high-mileage examples. Listen for transmission whine.", severity: "watch" },
        { issue: "Rust on early cars from humid climates — the all-aluminum body resists rust, but the steel sub-frames at the front and rear do not. Inspect the subframe mounting points on cars from non-dry climates.", severity: "watch", yearsAffected: "1990–1996 (early NA1)" },
        { issue: "Power steering pump failures — a common failure point, particularly on early NA1 cars. Confirm there is no whine or hesitation in the steering.", severity: "watch", yearsAffected: "1990–1997 (early NA1)" },
        { issue: "NSX-R authenticity — the NSX-R commands a 150%+ premium and has been misrepresented. Confirm the VIN and documentation carefully. True NSX-Rs (JDM only) have a specific VIN format and factory documentation.", severity: "critical", yearsAffected: "NSX-R / Type R (1992–1995 and 2002–2005) only" },
      ],
      funFacts: [
        "Ayrton Senna drove multiple development prototypes of the NSX at Honda's test track in Tochigi, Japan in 1989. He reported the car was too twitchy and Honda stiffened the chassis significantly based on his feedback.",
        "The NSX was the world's first all-aluminum production car body — Honda developed new welding and forming techniques to make it commercially viable.",
        "The NSX's VTEC V6 was the first high-performance engine Honda produced in the US (at the Marysville, Ohio plant) — a symbolic achievement for the company.",
        "Formula 1 champion Nelson Piquet reportedly tested the NSX and called it 'a supercar for every day' — a testament to its usability relative to contemporary Ferraris.",
        "The NSX-R (1992) weighed 270 lbs less than a standard NSX — achieved by removing power steering, A/C, sound deadening, and rear seats, plus using lighter forged wheels and a titanium exhaust.",
      ],
    },
  },

  // ── TOYOTA SUPRA MKIV (1993–2002) ─────────────────────────────────────────
  {
    makes: ["toyota"],
    models: ["supra", "mkiv", "mk4"],
    yearStart: 1993,
    yearEnd: 2002,
    knowledge: {
      knownIssues: [
        { issue: "Modification history and turbo tuning — the Supra's 2JZ-GTE engine is legendary for its modification potential but almost every car on the market has been modified to some degree. Confirm modification history: turbo upgrades, ECU tunes, fuel system changes. Aggressive tunes without supporting modifications lead to early failure.", severity: "critical" },
        { issue: "Transmission wear on high-power builds — the stock W58 and Getrag V160 transmissions are not designed for 500hp+. High-power builds without transmission upgrades wear or destroy gearboxes quickly. Confirm gearbox condition on any modified car.", severity: "watch" },
        { issue: "Turbo seals and bearing wear — the twin turbos (CT20As) wear seal and bearings with age and abuse. Confirm clean startup (no oil smoke), no turbo play, and boost building correctly. Rebuilt or aftermarket turbos are acceptable with documentation.", severity: "watch", yearsAffected: "Twin-turbo cars (JZA80) only" },
        { issue: "Head gasket on NA (naturally aspirated) cars pushed hard — the single-cam 2JZ-GE in the NA Supra is durable but head gaskets can fail on high-mileage examples or those pushed beyond stock power. Confirm no coolant loss.", severity: "watch", yearsAffected: "Naturally aspirated Supra only" },
        { issue: "Interior wear and aged plastics — the Supra's interior plastics and leather age and crack badly. Budget for dashboard refurbishment on high-mileage or sun-exposed cars.", severity: "minor" },
      ],
      funFacts: [
        "The 2JZ-GTE engine was so overbuilt from the factory that stock internals routinely support 600–800hp with supporting modifications — an engineering margin that's extraordinary for a production engine.",
        "The Supra MKIV is perhaps the only collector car where a manual transmission is worth meaningfully more than an automatic — roughly 25% premium on current market — because Toyota sold far more automatics in the US market.",
        "Paul Walker's orange Supra in The Fast and the Furious (2001) catalyzed the modern JDM tuner car market and drove Supra values from $20,000 to over $100,000 for good examples.",
        "The Supra's 2JZ engine was born from Toyota's racing program — it was designed to be raced in the JGTC (now Super GT) series and the internals were spec'd accordingly.",
        "Top Gear's Richard Hammond famously said the Supra's 2JZ was 'an engine so strong you could use it as a load-bearing wall' — an exaggeration, but not entirely wrong.",
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
