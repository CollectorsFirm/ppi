export type ListingData = {
  source: "bat" | "craigslist" | "unknown";
  url: string;
  title: string;
  price: string;
  description: string;
  specs: string[];
  images: string[];
  comments: string[];
  sellerUsername: string | null;
  photoCountProxy: number;
  modelPageUrl: string | null;
  bidCount: number | null;
  watcherCount: number | null;
  daysRemaining: number | null;
  endTimeText: string | null;
  auctionEnded: boolean;
};

const normalizeText = (value: string | null | undefined) =>
  (value || "").replace(/\s+/g, " ").trim();

// Extract text between two patterns
const extractBetween = (html: string, start: string, end: string): string => {
  const startIdx = html.indexOf(start);
  if (startIdx === -1) return "";
  const endIdx = html.indexOf(end, startIdx + start.length);
  if (endIdx === -1) return "";
  return html.slice(startIdx + start.length, endIdx);
};

// Strip HTML tags from a string
const stripTags = (html: string): string =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// Decode HTML entities
const decodeEntities = (html: string): string =>
  html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Cache-Control": "no-cache",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

async function scrapeBaT(url: string): Promise<ListingData> {
  const html = await fetchHtml(url);

  // --- TITLE ---
  let title = "";
  const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/) ||
    html.match(/content="([^"]+)"\s+property="og:title"/);
  if (ogTitle) title = decodeEntities(ogTitle[1]);

  // --- PRICE ---
  // Distinguish between current bid (live auction) vs sold price
  let price = "";
  const soldMatch = html.match(/Sold for \$([0-9,]+)/i);
  if (soldMatch) {
    price = `Sold: $${soldMatch[1]}`;
  } else {
    const bidMatch = html.match(/"price"\s*:\s*(\d+)/);
    if (bidMatch) price = `Current bid: $${parseInt(bidMatch[1]).toLocaleString()} (live auction)`;
  }

  // --- DESCRIPTION ---
  // BaT has the description twice in the HTML:
  //   1. In JSON-LD (truncated with \u2026 ellipsis)
  //   2. In the HTML body as a <p> tag (full text) — this is what we want
  // Strategy: find all occurrences of "This [year]" and take the LAST one (body, not JSON-LD)

  let description = "";

  // BaT puts the listing in <div class="post-excerpt"> with multiple <p> tags
  // Images are interspersed between paragraphs as their own <p><img/></p> blocks
  // Strategy: find the post-excerpt div start, then collect all text-bearing <p> tags
  const excerptStart = html.indexOf('<div class="post-excerpt"');
  if (excerptStart !== -1) {
    const chunk = html.slice(excerptStart, excerptStart + 15000);
    // Collect <p> text paragraphs
    const textParagraphs: string[] = [];
    const paraMatches = chunk.matchAll(/<p>([\s\S]*?)<\/p>/g);
    for (const match of paraMatches) {
      const stripped = normalizeText(decodeEntities(match[1].replace(/<[^>]+>/g, " ")));
      // Skip image captions and short nav text (e.g. "No Reserve: 15k-Mile...")
      // Real paragraphs start with "The " or "This " or have proper sentence structure
      if (stripped.length > 60) {
        textParagraphs.push(stripped);
      }
      if (textParagraphs.length >= 10) break;
    }

    // Also collect <ul> lists (option stickers, spec lists)
    const listTexts: string[] = [];
    const ulMatches = chunk.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/g);
    for (const match of ulMatches) {
      const items = [...match[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)]
        .map(li => normalizeText(decodeEntities(li[1].replace(/<[^>]+>/g, " "))))
        .filter(t => t.length > 2);
      if (items.length > 0) listTexts.push(items.join(", "));
    }

    const allText = [...textParagraphs, ...listTexts];
    if (allText.length > 0) {
      description = allText.join(" ");
    }
  }

  // Fallback: JSON-LD description (truncated but better than nothing)
  if (!description || description.length < 80) {
    const ldMatch = html.match(/"@type"\s*:\s*"Product"[\s\S]{0,300}"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (ldMatch) {
      description = decodeEntities(
        ldMatch[1].replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      ).replace(/…$/, "").trim();
    }
  }

  // Final fallback: meta description
  if (!description || description.length < 50) {
    const metaDesc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    if (metaDesc) description = decodeEntities(metaDesc[1]);
  }

  if (!description) description = "Description not available.";

  // --- SPECS: from BaT Essentials "Listing Details" ul (most reliable source) ---
  const specs: string[] = [];

  const essentialsIdx = html.indexOf("BaT Essentials");
  if (essentialsIdx !== -1) {
    const essentialsChunk = html.slice(essentialsIdx, essentialsIdx + 3000);
    const ulMatch = essentialsChunk.match(/<ul>([\s\S]*?)<\/ul>/);
    if (ulMatch) {
      const liMatches = ulMatch[1].matchAll(/<li>([\s\S]*?)<\/li>/g);
      for (const li of liMatches) {
        const text = normalizeText(decodeEntities(li[1].replace(/<[^>]+>/g, " ")));
        if (text && text.length > 2 && text.length < 120) {
          specs.push(text);
        }
      }
    }
    // Also grab seller location
    const locationMatch = essentialsChunk.match(/Location[^:]*:\s*<[^>]+>([^<]+)<\/a>/);
    if (locationMatch) specs.push(`Location: ${decodeEntities(locationMatch[1].trim())}`);
  }

  // Fallback specs from description if essentials not found
  if (specs.length === 0) {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) specs.push(`Year: ${yearMatch[0]}`);
    const milesMatch = description.match(/([0-9,]+)\s*(?:original\s+)?miles?/i);
    if (milesMatch) specs.push(`Mileage: ${milesMatch[1]} miles`);
    const colorMatch = description.match(/[Ff]inished in ([^,\.]{3,40})/);
    if (colorMatch) specs.push(`Color: ${colorMatch[1].trim()}`);
    const transMatch = description.match(/\b(automatic|manual|[3-7]-speed)\b/i);
    if (transMatch) specs.push(`Transmission: ${transMatch[1]}`);
    const ownerMatch = description.match(/\b(single|one|two|three|second|third)[\s-]owner\b/i);
    if (ownerMatch) specs.push(`Ownership: ${ownerMatch[0]}`);
  }

  const noReserve = /no[\s-]reserve/i.test(html.substring(0, 5000));
  if (noReserve) specs.push("No Reserve auction");

  // --- IMAGES: extract from BaT's embedded gallery JSON ---
  const images: string[] = [];

  // BaT embeds photo gallery data as JSON in the page
  // Look for the photo gallery array with full-size image URLs
  const galleryMatch = html.match(/"photos"\s*:\s*(\[[\s\S]{0,20000}?\])/);
  if (galleryMatch) {
    try {
      const photos = JSON.parse(galleryMatch[1]) as Array<{ full_url?: string; url?: string; src?: string }>;
      for (const p of photos) {
        const src = p.full_url || p.url || p.src || "";
        if (src && src.startsWith("http") && !images.includes(src)) {
          images.push(src);
        }
        if (images.length >= 12) break;
      }
    } catch {
      // JSON parse failed, fall through
    }
  }

  // Fallback: og:image only (single hero image)
  if (images.length === 0) {
    const ogImageMatch = html.match(/property="og:image"\s+content="([^"]+)"/);
    if (ogImageMatch) images.push(ogImageMatch[1].split("?")[0]);
  }

  // --- SELLER USERNAME: from parsely-author meta tag (needed before comments) ---
  const sellerMatch = html.match(/name="parsely-author"\s+content="([^"]+)"/);
  const sellerUsername = sellerMatch ? sellerMatch[1].toLowerCase().trim() : null;

  // --- COMMENTS: fetch via BaT's admin-ajax endpoint ---
  const comments: string[] = [];

  // Extract post ID and nonce from the page HTML
  const postIdMatch = html.match(/"post"\s*:\s*"(\d+)"/);
  const nonceMatch = html.match(/"ajaxCheckTimeNonce"\s*:\s*"([^"]+)"/);
  const postId = postIdMatch?.[1];
  const nonce = nonceMatch?.[1];

  // Check if comments are embedded directly in the HTML (some listings do this)
  const embeddedComments = html.match(/"comments":\s*(\[[\s\S]{0,100000}?\])\s*,\s*"checklist"/);
  if (embeddedComments) {
    try {
      type BaTComment = { content?: string; type?: string; authorName?: string };
      const data = JSON.parse(embeddedComments[1]) as BaTComment[];
      if (Array.isArray(data)) {
        for (const c of data) {
          if (c.type === "comment" && c.content && c.content.length > 5) {
            const author = (c.authorName ?? "").toLowerCase().replace(/\s*\(the seller\)/i, "").trim();
            const prefix = (sellerUsername && author === sellerUsername) ? "[SELLER] " : "";
            comments.push(prefix + normalizeText(c.content));
          }
          if (comments.length >= 40) break;
        }
      }
    } catch {
      // fall through to AJAX fetch
    }
  }

  if (comments.length === 0 && postId && nonce) {
    try {
      const commentRes = await fetch("https://bringatrailer.com/wp-admin/admin-ajax.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": url,
          "Origin": "https://bringatrailer.com",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "en-US,en;q=0.9",
        },
        body: `action=bat_theme_get_comments&post_id=${postId}&nonce=${nonce}&order=asc&page=1`,
        signal: AbortSignal.timeout(10000),
      });

      if (commentRes.ok) {
        type BaTComment = { content?: string; type?: string; bidAmount?: number; authorName?: string };
        const rawText = await commentRes.text();
        let data: BaTComment[] = [];
        try { data = JSON.parse(rawText) as BaTComment[]; } catch { /* not JSON */ }
        if (Array.isArray(data) && data.length > 0) {
          for (const c of data) {
            if (c.type === "comment" && c.content && c.content.length > 5) {
              // BaT appends " (The Seller)" to the seller's authorName — strip it before comparing
              const author = (c.authorName ?? "").toLowerCase().replace(/\s*\(the seller\)/i, "").trim();
              const prefix = (sellerUsername && author === sellerUsername) ? "[SELLER] " : "";
              comments.push(prefix + normalizeText(c.content));
            }
            if (comments.length >= 40) break;
          }
        } else if (Array.isArray(data) && data.length === 0) {
          // Empty array = no comments yet, that's fine
        } else {
          // AJAX returned something unexpected (auth failure, HTML, etc.)
          comments.push("[Comments could not be loaded for this listing]");
        }
      } else {
        comments.push("[Comments could not be loaded for this listing]");
      }
    } catch {
      comments.push("[Comments could not be loaded for this listing]");
    }
  }

  // --- PHOTO COUNT: count wp-content/uploads references as proxy ---
  // BaT loads the full gallery dynamically, but we can count unique upload URLs in HTML
  const uploadUrls = new Set<string>();
  const uploadMatches = html.matchAll(/https:\/\/bringatrailer\.com\/wp-content\/uploads\/[^"'\s?]+\.jpg/gi);
  for (const m of uploadMatches) {
    const src = m[0].split("?")[0];
    if (!src.includes("placeholder") && !src.includes("site-update")) {
      uploadUrls.add(src);
    }
  }
  // Real photo count is dynamic — use HTML count as lower bound, note it's partial
  const photoCountProxy = uploadUrls.size;

  // --- MODEL PAGE URL: extract directly from listing HTML ---
  // BaT embeds a link to the model page (e.g. /jeep/grand-wagoneer/) in every listing
  // This is far more reliable than constructing it from the title
  // --- AUCTION STATS ---
  const bidCountMatch = html.match(/class="listing-stats-value number-bids-value"[^>]*>(\d+)/);
  const bidCount = bidCountMatch ? parseInt(bidCountMatch[1]) : null;

  const watcherMatch = html.match(/(\d+)\s*watchers?/i);
  const watcherCount = watcherMatch ? parseInt(watcherMatch[1]) : null;

  const endsMatch = html.match(/data-auction-ends="([^"]+)"/);
  let daysRemaining: number | null = null;
  let endTimeText: string | null = null;
  if (endsMatch) {
    const endTimeTextMatch = html.match(/class="listing-end-time"[^>]*>([^<]+)</);
    endTimeText = endTimeTextMatch ? endTimeTextMatch[1].trim() : null;
    // Parse "2026-3-17-20-08-00" format
    const parts = endsMatch[1].split("-").map(Number);
    if (parts.length >= 3) {
      const endDate = new Date(parts[0], parts[1] - 1, parts[2], parts[3] ?? 0, parts[4] ?? 0);
      const now = new Date();
      const diffMs = endDate.getTime() - now.getTime();
      daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
    }
  }

  // Detect if auction has ended
  const auctionEnded = html.includes('class="listing-end-processing-notice"') === false &&
    /sold for/i.test(html);

  let modelPageUrl: string | null = null;
  const modelPagePattern = /href="(https:\/\/bringatrailer\.com\/[a-z0-9-]+\/[a-z0-9-]+\/)"/g;
  const seen = new Set<string>();
  for (const match of html.matchAll(modelPagePattern)) {
    const candidate = match[1];
    // Skip listing URLs, feed URLs, location URLs, search URLs
    if (
      !candidate.includes("/listing/") &&
      !candidate.includes("/location/") &&
      !candidate.includes("/search/") &&
      !candidate.includes("/auctions/") &&
      !candidate.includes("/account/") &&
      !candidate.includes("/member/") &&
      !seen.has(candidate)
    ) {
      seen.add(candidate);
      // Prefer the one that matches the make from title
      const titleLower = title.toLowerCase();
      const parts = candidate.replace("https://bringatrailer.com/", "").split("/").filter(Boolean);
      if (parts.length === 2 && titleLower.includes(parts[0].replace(/-/g, " "))) {
        modelPageUrl = candidate;
        break;
      }
    }
  }

  return {
    source: "bat",
    url,
    title: title || "BaT Listing",
    price: price || "Live Auction",
    description,
    specs: specs.filter(Boolean),
    images,
    comments,
    sellerUsername,
    photoCountProxy,
    modelPageUrl,
    bidCount,
    watcherCount,
    daysRemaining,
    endTimeText,
    auctionEnded,
  };
}

async function scrapeCraigslist(url: string): Promise<ListingData> {
  const html = await fetchHtml(url);

  // Title
  let title = "";
  const titleMatch = html.match(/id="titletextonly"[^>]*>([^<]+)</) ||
    html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) title = decodeEntities(titleMatch[1].replace(" - craigslist", "").trim());

  // Price
  let price = "";
  const priceMatch = html.match(/class="[^"]*price[^"]*"[^>]*>\s*(\$[0-9,]+)/);
  if (priceMatch) price = priceMatch[1];

  // Description
  let description = "";
  const descSection = extractBetween(html, 'id="postingbody"', '</section>') ||
    extractBetween(html, 'id="postingbody"', '</div>');
  if (descSection) {
    description = normalizeText(stripTags(descSection))
      .replace(/^QR Code Link to This Post\s*/i, "");
  }
  if (!description) description = "Description not available.";

  // Specs
  const specs: string[] = [];
  const attrMatches = html.matchAll(/class="[^"]*attrgroup[^"]*"[^>]*>([\s\S]*?)<\/p>/g);
  for (const match of attrMatches) {
    const spans = match[1].matchAll(/<span[^>]*>([^<]+)<\/span>/g);
    for (const span of spans) {
      const text = decodeEntities(span[1].trim());
      if (text && text.length < 80) specs.push(text);
    }
  }

  // Images
  const images: string[] = [];
  const imgMatches = html.matchAll(/https:\/\/images\.craigslist\.org\/[^"']+\.jpg/g);
  for (const match of imgMatches) {
    const src = match[0].replace(/\b(50x50c|300x300|600x450)\b/, "1200x900");
    if (!images.includes(src)) images.push(src);
    if (images.length >= 12) break;
  }

  return {
    source: "craigslist",
    url,
    title: title || "Craigslist Listing",
    price: price || "Price not listed",
    description,
    specs,
    images,
    comments: [],
    sellerUsername: null,
    photoCountProxy: images.length,
    modelPageUrl: null,
    bidCount: null,
    watcherCount: null,
    daysRemaining: null,
    endTimeText: null,
    auctionEnded: false,
  };
}

export async function scrapeListing(url: string): Promise<ListingData> {
  if (url.includes("bringatrailer.com")) return scrapeBaT(url);

  return {
    source: "unknown",
    url,
    title: "Unsupported listing",
    price: "N/A",
    description: "PPI is built exclusively for Bring a Trailer listings. Paste a bringatrailer.com URL to get started.",
    specs: [],
    images: [],
    comments: [],
    sellerUsername: null,
    photoCountProxy: 0,
    modelPageUrl: null,
    bidCount: null,
    watcherCount: null,
    daysRemaining: null,
    endTimeText: null,
    auctionEnded: false,
  };
}
