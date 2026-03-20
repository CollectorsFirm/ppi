"use client";

import { useMemo, useState, useEffect } from "react";

const steps = [
  "Scraping listing data",
  "Analyzing market context",
  "Generating report card",
];

const carFacts = [
  "The Ferrari 250 GTO is considered the holy grail of collector cars — one sold for $70M in 2018.",
  "BaT was founded in 2007 and has facilitated over $3 billion in collector car sales.",
  "The Honda S2000 was engineered to celebrate Honda's 50th anniversary in 1999.",
  "A stock Porsche 993 GT2 produced 430hp — making it the most powerful air-cooled 911 ever made.",
  "The Ferrari F40 was the last car personally approved by Enzo Ferrari before his death in 1988.",
  "Bring a Trailer listings with 'no reserve' statistically attract 40% more bidders.",
  "The McLaren F1 held the record for fastest production car for 12 years — from 1994 to 2005.",
  "Only 399 Ferrari 360 Challenge Stradales were built for road use.",
  "The Porsche 917 was so dominant at Le Mans that the FIA changed the rules specifically to slow it down.",
  "A pre-purchase inspection (PPI) can uncover issues that reduce a car's value by 20-30%.",
  "The Lamborghini Miura is widely credited as the world's first supercar, introduced in 1966.",
  "Collector car values have outperformed the S&P 500 over the last 20 years.",
  "The Toyota 2000GT was so rare that only 351 were ever built.",
  "Mileage matters less than maintenance history on cars over 30 years old.",
  "The air-cooled Porsche 911 engine runs at up to 260°F — nearly twice a water-cooled engine.",
];

type ListingData = {
  source: string;
  url: string;
  title: string;
  price: string;
  description: string;
  specs: string[];
  images: string[];
};

type ScoreCategory = { score: number; max: number; signals: string[] };
type RedFlag = { text: string; severity: "major" | "moderate" | "minor" };

type CompListing = { price: number; title: string; year: number | null; url: string; noReserve: boolean };
type MarketComps = { count: number; median: number; low: number; high: number; average: number; listings: CompListing[]; modelPageUrl: string };
type HammerEstimate = { estimate: number; low: number; high: number; confidence: "high" | "medium" | "low"; factors: string[] };

type AuctionStats = { bidCount: number | null; watcherCount: number | null; daysRemaining: number | null; endTimeText: string | null; auctionEnded: boolean };
type SellerProfile = { username: string; profileUrl: string; memberSince: string | null; totalLikes: number | null; totalListings: number | null; totalBids: number | null; totalComments: number | null; liveAuctions: number | null; isLocalPartner: boolean; location: string | null };
type KnownIssue = { issue: string; severity: "critical" | "watch" | "minor"; yearsAffected?: string };
type ModelKnowledge = { matchedModel: string; knownIssues: KnownIssue[]; funFacts: string[] };
type SpecialProgram = { name: string; brand: string; description: string; valuePremium: string; indicators: string[] };

type ReportCard = {
  score: number;
  label: string;
  auctionStats: AuctionStats;
  sellerProfile: SellerProfile | null;
  modelKnowledge: ModelKnowledge | null;
  specialPrograms: SpecialProgram[];
  marketComps: MarketComps | null;
  hammerEstimate: HammerEstimate | null;
  scoreBreakdown: {
    total: number;
    documentation: ScoreCategory;
    transparency: ScoreCategory;
    condition: ScoreCategory;
    listingQuality: ScoreCategory;
    communityReception: ScoreCategory;
  };
  greenFlags: string[];
  redFlags: RedFlag[];
  watchOuts: string[];
  fairMarketEstimate: string;
  verdict: string;
  audienceScore: number;
  audienceSentiment: string;
  keyCommentInsights: string[];
  unansweredQuestions: string[];
};

type ApiResponse = {
  listing: ListingData;
  report: ReportCard;
  remaining: number;
  error?: string;
};

const scoreColor = (score: number) => {
  if (score >= 85) return "text-[#27AE60]";
  if (score >= 70) return "text-[#F1C40F]";
  if (score >= 55) return "text-[#E67E22]";
  return "text-[#C0392B]";
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dark, setDark] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);



  useEffect(() => {
    if (!loading) {
      if (!loading && data) setProgress(100);
      return;
    }
    setStepIndex(0);
    setProgress(0);
    setFactIndex(Math.floor(Math.random() * carFacts.length));

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);

    const factInterval = setInterval(() => {
      setFactIndex(Math.floor(Math.random() * carFacts.length));
    }, 5000);

    // Progress bar: crawls to 85% over ~14s, then waits for real completion
    let current = 0;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) { clearInterval(progressInterval); return prev; }
        // Fast early, slow near 85%
        const increment = prev < 30 ? 3 : prev < 60 ? 1.5 : 0.5;
        return Math.min(85, prev + increment);
      });
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(factInterval);
      clearInterval(progressInterval);
    };
  }, [loading]);

  const canSubmit = url.trim().length > 5 && !loading;

  const formattedSpecs = useMemo(() => {
    if (!data?.listing?.specs?.length) return [];
    return data.listing.specs.slice(0, 8);
  }, [data]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong.");
      }
      setProgress(100);
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0b0b0f] text-white" : "bg-[#F5F2ED] text-[#1A1A1A]"}`}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-5 py-12 sm:px-8">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.35em] text-white shadow-sm ${dark ? "border-[#E8A020]/40 bg-[#E8A020]" : "border-[#C0392B]/40 bg-[#C0392B]"}`}>
                PPI
              </div>
              <div className={`text-xs uppercase tracking-[0.35em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>
                Pre-Purchase Intelligence
              </div>
            </div>
            <button
              onClick={() => setDark(d => !d)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${dark ? "border-white/20 bg-white/10 text-white/70 hover:bg-white/20" : "border-black/10 bg-white text-[#4E4A45] hover:bg-[#ECEAE5] shadow-sm"}`}
              aria-label="Toggle dark mode"
            >
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Know Before You Bid.
          </h1>
          <p className={`max-w-2xl text-base sm:text-lg ${dark ? "text-white/70" : "text-[#4E4A45]"}`}>
            Paste any Bring a Trailer listing and get an expert-grade analysis in seconds — score, green flags, red flags, fair market estimate, and a verdict.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className={`flex flex-col gap-4 rounded-2xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-[0_18px_40px_rgba(19,19,19,0.08)]"}`}
        >
          <label className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>
            Listing URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://bringatrailer.com/listing/your-listing-here/"
              className={`w-full flex-1 rounded-xl border px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#C0392B]/30 ${dark ? "border-white/10 bg-black/60 text-white focus:ring-[#E8A020]/30" : "border-black/10 bg-[#F9F6F1] text-[#1A1A1A]"}`}
            />
            <button
              type="submit"
              disabled={!canSubmit}
              className={`rounded-xl px-6 py-3 text-sm font-semibold uppercase tracking-widest transition disabled:cursor-not-allowed ${dark ? "bg-[#E8A020] text-black hover:bg-[#D18F1B] disabled:bg-white/10 disabled:text-white/30" : "bg-[#C0392B] text-white hover:bg-[#A93226] disabled:bg-black/10 disabled:text-black/40"}`}
            >
              Analyze
            </button>
          </div>
          <div className={`text-xs ${dark ? "text-white/50" : "text-[#8A847C]"}`}>
            Free to use · No account required · Bring a Trailer listings only.
          </div>
        </form>

        {loading && (
          <section className={`rounded-2xl border p-8 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
            <div className="flex flex-col gap-3">
              <p className={`text-xs uppercase tracking-[0.3em] ${dark ? "text-white/50" : "text-[#8A847C]"}`}>
                Processing
              </p>
              <h2 className={`text-2xl font-semibold ${dark ? "text-white" : "text-[#1A1A1A]"}`}>{steps[stepIndex]}</h2>
              <div className={`h-2 w-full overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-[#E7E0D8]"}`}>
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${dark ? "bg-[#E8A020]" : "bg-[#C0392B]"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className={`text-xs ${dark ? "text-white/50" : "text-[#8A847C]"}`}>{Math.round(progress)}%</p>
              <p className={`mt-4 text-xs italic ${dark ? "text-white/50" : "text-[#6B6864]"}`}>💡 {carFacts[factIndex]}</p>
            </div>
          </section>
        )}

        {error && (
          <section className={`rounded-2xl border p-6 text-sm ${dark ? "border-rose-400/30 bg-rose-400/10 text-rose-300" : "border-[#C0392B]/30 bg-[#C0392B]/10 text-[#7A1E16]"}`}>
            {error}
          </section>
        )}

        {data && (
          <section className="flex flex-col gap-6">
            <p className={`w-fit rounded-full px-3 py-1 text-xs ${dark ? "bg-amber-400/10 text-amber-200" : "bg-amber-100 text-[#8A847C]"}`}>
              AI-generated analysis — always verify before bidding.
            </p>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className={`rounded-2xl border p-8 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
                {data.listing.images[0] && (
                  <div className={`mb-6 overflow-hidden rounded-xl border ${dark ? "border-white/10" : "border-black/10"}`}>
                    <img src={data.listing.images[0]} alt={data.listing.title} className="max-h-72 w-full object-cover" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.3em] ${dark ? "text-white/50" : "text-[#8A847C]"}`}>
                      Report Card
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      {data.listing.title}
                    </h2>
                    <p className={`mt-1 text-sm ${dark ? "text-white/50" : "text-[#6B6864]"}`}>
                      {data.listing.price} • {data.listing.source.toUpperCase()}
                    </p>
                  </div>
                  <div className={`rounded-2xl border px-6 py-4 text-center ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-[#F9F6F1] shadow-sm"}`}>
                    <p className={`text-xs uppercase tracking-[0.2em] mb-1 ${dark ? "text-white/50" : "text-[#6B6864]"}`}>PPI Score</p>
                    <p className={`text-6xl font-bold leading-none ${scoreColor(data.report.score)} font-serif`}>
                      {data.report.score}
                    </p>
                    <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-[#9B9693]"}`}>out of 100</p>
                    <p className={`mt-1 text-xs uppercase tracking-[0.3em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>
                      {data.report.label}
                    </p>
                  </div>
                </div>

                {data.report.auctionStats && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {data.report.auctionStats.bidCount !== null && (
                      <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${dark ? "border-white/10 bg-white/10" : "border-black/10 bg-[#EEE8E0]"}`}>
                        <span>🔨</span>
                        <span className={`font-semibold ${dark ? "text-white" : "text-[#1A1A1A]"}`}>{data.report.auctionStats.bidCount}</span>
                        <span className={dark ? "text-white/50" : "text-[#6B6864]"}>bids</span>
                      </div>
                    )}
                    {data.report.auctionStats.watcherCount !== null && (
                      <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${dark ? "border-white/10 bg-white/10" : "border-black/10 bg-[#EEE8E0]"}`}>
                        <span>👀</span>
                        <span className={`font-semibold ${dark ? "text-white" : "text-[#1A1A1A]"}`}>{data.report.auctionStats.watcherCount.toLocaleString()}</span>
                        <span className={dark ? "text-white/50" : "text-[#6B6864]"}>watchers</span>
                      </div>
                    )}
                    {data.report.auctionStats.auctionEnded ? (
                      <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${dark ? "border-white/10 bg-white/10 text-white/50" : "border-black/10 bg-[#EEE8E0] text-[#6B6864]"}`}>
                        🏁 Auction ended
                      </div>
                    ) : data.report.auctionStats.daysRemaining !== null && (
                      <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                        data.report.auctionStats.daysRemaining <= 1
                          ? dark ? "border-[#E8A020]/40 bg-[#E8A020]/10 text-[#E8A020]" : "border-[#C0392B]/30 bg-[#C0392B]/10 text-[#7A1E16]"
                          : dark ? "border-white/10 bg-white/10 text-white/70" : "border-black/10 bg-[#EEE8E0] text-[#4E4A45]"
                      }`}>
                        <span>⏱</span>
                        <span>
                          {data.report.auctionStats.daysRemaining === 0
                            ? "Ending today"
                            : `${data.report.auctionStats.daysRemaining}d left`}
                        </span>
                        {data.report.auctionStats.endTimeText && (
                          <span className={dark ? "text-white/40" : "text-[#8A847C]"}>· {data.report.auctionStats.endTimeText}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {data.report.scoreBreakdown && (
                  <div className="mt-6 space-y-2">
                    <h3 className={`text-xs font-semibold uppercase tracking-widest ${dark ? "text-white/50" : "text-[#6B6864]"}`}>Score Breakdown</h3>
                    {([
                      ["Documentation", data.report.scoreBreakdown.documentation],
                      ["Seller Transparency", data.report.scoreBreakdown.transparency],
                      ["Condition", data.report.scoreBreakdown.condition],
                      ["Listing Quality", data.report.scoreBreakdown.listingQuality],
                      ["Community", data.report.scoreBreakdown.communityReception],
                    ] as [string, ScoreCategory][]).map(([label, cat]) => (
                      <div key={label}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className={dark ? "text-white/50" : "text-[#6B6864]"}>{label}</span>
                          <span className={`font-medium ${dark ? "text-white" : "text-[#1A1A1A]"}`}>{cat.score}/{cat.max}</span>
                        </div>
                        <div className={`h-1.5 w-full overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-[#E7E0D8]"}`}>
                          <div
                            className={`h-full rounded-full transition-all ${dark ? "bg-[#E8A020]" : "bg-[#C0392B]"}`}
                            style={{ width: `${(cat.score / cat.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className={`text-sm font-semibold ${dark ? "text-emerald-400" : "text-[#27AE60]"}`}>Green Flags</h3>
                    <ul className={`mt-3 space-y-2 text-sm ${dark ? "text-white/70" : "text-[#3F4A43]"}`}>
                      {data.report.greenFlags.map((item, index) => (
                        <li key={`green-${index}`} className={`rounded-xl border px-3 py-2 ${dark ? "border-emerald-400/30 bg-emerald-400/10" : "border-[#27AE60]/20 bg-[#27AE60]/10"}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${dark ? "text-rose-400" : "text-[#C0392B]"}`}>Red Flags</h3>
                    <ul className={`mt-3 space-y-2 text-sm ${dark ? "text-white/70" : "text-[#3F4A43]"}`}>
                      {data.report.redFlags.map((flag, index) => {
                        const f = typeof flag === "string" ? { text: flag, severity: "moderate" as const } : flag;
                        const severityConfig = dark ? {
                          major: { bg: "bg-rose-400/10", border: "border-rose-400/30", badge: "bg-rose-400 text-black", label: "MAJOR" },
                          moderate: { bg: "bg-rose-400/10", border: "border-rose-400/30", badge: "bg-rose-400/30 text-rose-100", label: "MODERATE" },
                          minor: { bg: "bg-white/5", border: "border-white/10", badge: "bg-white/10 text-white/60", label: "MINOR" },
                        }[f.severity] : {
                          major: { bg: "bg-[#C0392B]/10", border: "border-[#C0392B]/30", badge: "bg-[#C0392B] text-white", label: "MAJOR" },
                          moderate: { bg: "bg-[#E67E22]/10", border: "border-[#E67E22]/25", badge: "bg-[#E67E22]/20 text-[#7A4517]", label: "MODERATE" },
                          minor: { bg: "bg-black/5", border: "border-black/10", badge: "bg-black/10 text-[#5A5651]", label: "MINOR" },
                        }[f.severity];
                        return (
                          <li key={`red-${index}`} className={`rounded-xl border px-3 py-2 ${severityConfig.bg} ${severityConfig.border}`}>
                            <div className="flex items-start gap-2">
                              <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-bold tracking-wide ${severityConfig.badge}`}>
                                {severityConfig.label}
                              </span>
                              <span>{f.text}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className={`text-sm font-semibold ${dark ? "text-amber-300" : "text-[#8E5A1B]"}`}>Watch-Outs</h3>
                  <ul className={`mt-3 space-y-2 text-sm ${dark ? "text-white/70" : "text-[#4E4A45]"}`}>
                    {data.report.watchOuts.map((item, index) => (
                      <li key={`watch-${index}`} className={`rounded-xl border px-3 py-2 ${dark ? "border-amber-300/20 bg-amber-400/10" : "border-[#E3D2B8] bg-[#F7EFE4]"}`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className={`rounded-2xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>Fair Market Estimate</h3>
                    {data.report.marketComps && (
                      <a href={data.report.marketComps.modelPageUrl} target="_blank" rel="noopener noreferrer" className={`text-xs transition-colors ${dark ? "text-[#E8A020] hover:text-[#F0B94A]" : "text-[#C0392B] hover:text-[#A93226]"}`}>
                        View all BaT sales →
                      </a>
                    )}
                  </div>
                  <p className={`mt-3 text-2xl font-semibold ${dark ? "text-[#E8A020]" : "text-[#C0392B]"}`}>
                    {data.report.fairMarketEstimate}
                  </p>
                  {data.report.marketComps && (
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Low", value: data.report.marketComps.low },
                        { label: "Median", value: data.report.marketComps.median },
                        { label: "High", value: data.report.marketComps.high },
                      ].map(({ label, value }) => (
                        <div key={label} className={`rounded-xl border px-2 py-2 ${dark ? "border-white/10 bg-white/10" : "border-black/10 bg-[#F7F3ED]"}`}>
                          <p className={`text-xs ${dark ? "text-white/50" : "text-[#8A847C]"}`}>{label}</p>
                          <p className={`text-sm font-semibold ${dark ? "text-white" : "text-[#1A1A1A]"}`}>${Math.round(value / 1000)}k</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className={`mt-2 text-xs ${dark ? "text-white/50" : "text-[#8A847C]"}`}>
                    {data.report.marketComps ? `Based on ${data.report.marketComps.count} recent BaT sales` : "Based on comparable auction results"}
                  </p>
                </div>

                {data.report.hammerEstimate && (
                  <div className={`rounded-2xl border p-6 ${dark ? "border-[#E8A020]/30 bg-[#E8A020]/10" : "border-[#C0392B]/20 bg-[#FFF7F5] shadow-sm"}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold ${dark ? "text-[#E8A020]" : "text-[#C0392B]"}`}>🔨 PPI Hammer Estimate</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        data.report.hammerEstimate.confidence === "high" ? dark ? "bg-emerald-400/20 text-emerald-300" : "bg-[#27AE60]/15 text-[#27AE60]" :
                        data.report.hammerEstimate.confidence === "medium" ? dark ? "bg-amber-400/20 text-amber-200" : "bg-[#E67E22]/20 text-[#8A4B1E]" :
                        dark ? "bg-white/10 text-white/60" : "bg-black/10 text-[#6B6864]"
                      }`}>
                        {data.report.hammerEstimate.confidence} confidence
                      </span>
                    </div>
                    <p className={`mt-3 text-3xl font-bold ${dark ? "text-white" : "text-[#1A1A1A]"}`}>
                      ${data.report.hammerEstimate.estimate.toLocaleString()}
                    </p>
                    <p className={`mt-1 text-sm ${dark ? "text-white/50" : "text-[#6B6864]"}`}>
                      Range: ${data.report.hammerEstimate.low.toLocaleString()} – ${data.report.hammerEstimate.high.toLocaleString()}
                    </p>
                    <div className="mt-4 space-y-1">
                      {data.report.hammerEstimate.factors.map((f, i) => (
                        <p key={i} className={`text-xs ${dark ? "text-white/50" : "text-[#6B6864]"}`}>{f}</p>
                      ))}
                    </div>
                    <p className={`mt-3 text-xs ${dark ? "text-white/40" : "text-[#9B948B]"}`}>Not a guarantee — based on the latest {data.report.marketComps?.count ?? 24} BaT sales and listing signals.</p>
                  </div>
                )}

                <div className={`rounded-2xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
                  <h3 className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>Verdict</h3>
                  <p className={`mt-3 text-lg ${dark ? "text-white" : "text-[#1A1A1A]"}`}>{data.report.verdict}</p>
                </div>

                {data.report.sellerProfile && (
                  <div className={`rounded-2xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>Seller</h3>
                      {data.report.sellerProfile.isLocalPartner && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${dark ? "bg-emerald-400/20 text-emerald-300" : "bg-[#27AE60]/15 text-[#27AE60]"}`}>
                          ✓ BaT Local Partner
                        </span>
                      )}
                    </div>
                    <a
                      href={data.report.sellerProfile.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-base font-semibold transition-colors ${dark ? "text-white hover:text-[#E8A020]" : "text-[#1A1A1A] hover:text-[#C0392B]"}`}
                    >
                      {data.report.sellerProfile.username}
                    </a>
                    {data.report.sellerProfile.location && (
                      <p className={`mt-0.5 text-xs ${dark ? "text-white/50" : "text-[#8A847C]"}`}>{data.report.sellerProfile.location}</p>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {[
                        { label: "Member since", value: data.report.sellerProfile.memberSince },
                        { label: "👍 Likes", value: data.report.sellerProfile.totalLikes?.toLocaleString() },
                        { label: "Listings", value: data.report.sellerProfile.totalListings?.toLocaleString() },
                        { label: "Bids placed", value: data.report.sellerProfile.totalBids?.toLocaleString() },
                      ].filter(s => s.value).map(({ label, value }) => (
                        <div key={label} className={`rounded-xl border px-3 py-2 ${dark ? "border-white/10 bg-white/10" : "border-black/10 bg-[#F7F3ED]"}`}>
                          <p className={`text-xs ${dark ? "text-white/50" : "text-[#8A847C]"}`}>{label}</p>
                          <p className={`text-sm font-medium ${dark ? "text-white" : "text-[#1A1A1A]"}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {data.report.sellerProfile.liveAuctions !== null && data.report.sellerProfile.liveAuctions > 0 && (
                      <p className={`mt-3 text-xs ${dark ? "text-emerald-400" : "text-[#27AE60]"}`}>{data.report.sellerProfile.liveAuctions} live auction{data.report.sellerProfile.liveAuctions > 1 ? "s" : ""} currently</p>
                    )}
                  </div>
                )}

                {data.report.audienceScore !== undefined && (
                  <div className={`rounded-2xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
                    <h3 className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>BaT Audience</h3>
                    <div className="mt-2 flex items-center gap-1 text-2xl">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < data.report.audienceScore ? "opacity-100" : "opacity-20"}>
                          {data.report.audienceScore === 5 ? "🤩" :
                           data.report.audienceScore === 4 ? "😄" :
                           data.report.audienceScore === 3 ? "🙂" :
                           data.report.audienceScore === 2 ? "😕" : "😬"}
                        </span>
                      ))}
                      <span className={`ml-2 text-sm ${dark ? "text-white/50" : "text-[#8A847C]"}`}>{data.report.audienceScore}/5</span>
                    </div>
                    <p className={`mt-2 text-sm ${dark ? "text-white/50" : "text-[#6B6864]"}`}>{data.report.audienceSentiment}</p>
                  </div>
                )}

                {formattedSpecs.length > 0 && (
                  <div className={`rounded-2xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
                    <h3 className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>Key Specs</h3>
                    <ul className={`mt-3 space-y-2 text-sm ${dark ? "text-white/70" : "text-[#4E4A45]"}`}>
                      {formattedSpecs.map((spec, index) => (
                        <li key={`spec-${index}`} className={`rounded-xl border px-3 py-2 ${dark ? "border-white/10 bg-white/10" : "border-black/10 bg-[#F7F3ED]"}`}>
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {(data.report.keyCommentInsights?.length > 0 || data.report.unansweredQuestions?.length > 0) && (
              <div className="grid gap-6 sm:grid-cols-2">
                {data.report.keyCommentInsights?.length > 0 && (
                  <div className={`rounded-2xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
                    <h3 className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>💬 Comment Insights</h3>
                    <ul className={`mt-3 space-y-2 text-sm ${dark ? "text-white/70" : "text-[#4E4A45]"}`}>
                      {data.report.keyCommentInsights.map((item, index) => (
                        <li key={`insight-${index}`} className={`rounded-xl border px-3 py-2 ${dark ? "border-white/10 bg-white/10" : "border-black/10 bg-[#F7F3ED]"}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.report.unansweredQuestions?.length > 0 && (
                  <div className={`rounded-2xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-black/10 bg-white shadow-sm"}`}>
                    <h3 className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#6B6864]"}`}>❓ Unanswered Questions</h3>
                    <ul className={`mt-3 space-y-2 text-sm ${dark ? "text-white/70" : "text-[#4E4A45]"}`}>
                      {data.report.unansweredQuestions.map((item, index) => (
                        <li key={`unanswered-${index}`} className={`rounded-xl border px-3 py-2 ${dark ? "border-white/10 bg-white/10" : "border-black/10 bg-[#F7F3ED]"}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}


            {data.report.specialPrograms && data.report.specialPrograms.length > 0 && (
              <div className={`rounded-2xl border p-6 ${dark ? "border-amber-400/30 bg-amber-400/5" : "border-amber-500/30 bg-amber-50 shadow-sm"}`}>
                <h3 className={`mb-1 text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-amber-400/80" : "text-amber-700"}`}>✨ Special Factory Program{data.report.specialPrograms.length > 1 ? "s" : ""} Detected</h3>
                <p className={`mb-4 text-xs ${dark ? "text-white/40" : "text-amber-700/70"}`}>This listing involves factory bespoke or limited programs that affect value and documentation requirements.</p>
                <div className="space-y-4">
                  {data.report.specialPrograms.map((program, i) => (
                    <div key={i} className={`rounded-xl border px-4 py-3 ${dark ? "border-amber-400/20 bg-amber-400/10" : "border-amber-500/20 bg-white"}`}>
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${dark ? "bg-amber-400/20 text-amber-300" : "bg-amber-100 text-amber-800"}`}>{program.name}</span>
                      </div>
                      <p className={`mb-2 text-xs ${dark ? "text-white/60" : "text-[#4E4A45]"}`}>{program.description}</p>
                      <p className={`text-xs font-medium ${dark ? "text-amber-300/80" : "text-amber-700"}`}>💰 {program.valuePremium}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}





          </section>
        )}
      </div>

      <footer className={`mt-10 border-t px-5 py-6 text-center text-xs ${dark ? "border-white/10 text-white/20" : "border-black/10 text-[#8A847C]"}`}>
        PPI analyses are generated by AI and may contain errors or omissions. Results are for informational purposes only and do not constitute financial or purchasing advice. Always conduct independent research before placing a bid.
      </footer>
    </div>
  );
}
