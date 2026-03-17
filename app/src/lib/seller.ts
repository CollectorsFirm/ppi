export type SellerProfile = {
  username: string;
  profileUrl: string;
  memberSince: string | null;
  totalLikes: number | null;
  totalListings: number | null;
  totalBids: number | null;
  totalComments: number | null;
  liveAuctions: number | null;
  isLocalPartner: boolean;
  location: string | null;
};

export async function fetchSellerProfile(username: string): Promise<SellerProfile | null> {
  if (!username) return null;

  const profileUrl = `https://bringatrailer.com/member/${username}/`;

  try {
    const res = await fetch(profileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Member since
    const memberSinceMatch = html.match(/class="member-since"[^>]*>\s*Member since ([^<]+)</);
    const memberSince = memberSinceMatch ? memberSinceMatch[1].trim() : null;

    // Total likes (community reputation signal)
    const likesMatch = html.match(/class="total-likes"[^>]*>[\s\S]*?(\d[\d,]+)\s*</);
    const totalLikes = likesMatch ? parseInt(likesMatch[1].replace(/,/g, "")) : null;

    // Nav counts: Listings, Bids, Comments
    const navCounts: Record<string, number> = {};
    const navMatches = html.matchAll(/href="#(\w+)">(\w+)\s*<span[^>]*>\((\d+)\)/g);
    for (const m of navMatches) {
      navCounts[m[1]] = parseInt(m[3]);
    }

    // Live auctions
    const liveMatch = html.match(/(\d+)\s*Auction[s]?\s*Live/i);
    const liveAuctions = liveMatch ? parseInt(liveMatch[1]) : 0;

    // BaT Local Partner badge — only true if the specific badge text is present
    const isLocalPartner = html.includes("This Local Partner can assist you with BaT listing preparation");

    // Location from partner badge or profile
    const locationMatch = html.match(/local-partner-badge-wrapper[\s\S]{0,200}<p>([^<]+)<\/p>/);
    const location = locationMatch ? locationMatch[1].trim() : null;

    return {
      username,
      profileUrl,
      memberSince,
      totalLikes,
      totalListings: navCounts["listings"] ?? null,
      totalBids: navCounts["bids"] ?? null,
      totalComments: navCounts["comments"] ?? null,
      liveAuctions,
      isLocalPartner,
      location,
    };
  } catch {
    return null;
  }
}
