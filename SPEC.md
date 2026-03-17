# PPI — Pre-Purchase Intelligence
## Product Spec v1.0

### Overview
A mobile-responsive web app that lets users paste any car listing URL and receive an instant AI-powered analysis — score, green flags, red flags, fair market estimate, and a verdict.

### Core User Flow
1. User lands on homepage → sees a single input field: "Paste a listing URL"
2. User pastes a URL (BaT, Craigslist, Facebook Marketplace to start)
3. App scrapes the listing (title, price, description, photos, specs)
4. AI analyzes the listing and generates a report card
5. User sees the report card — clean, single-page result

### Report Card Output
- **Score: 0-100** with label (Strong Buy / Good / Proceed with Caution / Walk Away)
- **Green Flags (3-5)** — specific positives pulled from the listing with brief explanations
- **Red Flags (3-5)** — concerns or risks with why they matter
- **Watch-Outs** — things that aren't dealbreakers but worth asking about
- **Fair Market Estimate** — price range based on comparable recent sales
- **One-Line Verdict** — plain English summary of the car

### Supported Platforms (V1)
- Bring a Trailer (bringatrailer.com)
- Craigslist (*.craigslist.org)
- Facebook Marketplace (facebook.com/marketplace)

### Business Model
- **Free:** 5 scans total (no account needed, cookie/fingerprint based)
- **Premium:** $10/month — unlimited scans + 5 deep scans/month
- **Deep Scan:** VIN decode, auction history, enhanced comps (included with premium, 5/month)

### Tech Stack (Recommended)
- **Frontend:** Next.js (React) — mobile-first responsive design
- **Backend:** Next.js API routes or Express
- **Scraping:** Playwright or Cheerio depending on source
- **AI Analysis:** Anthropic Claude API (Haiku for speed, Sonnet for deep scans)
- **Database:** SQLite or Postgres for user scans, rate limiting
- **Auth:** Simple — email + magic link or OAuth (Google)
- **Hosting:** Vercel (frontend) + Railway or Fly.io (scraping backend)
- **Payments:** Stripe

### Design Direction
- Clean, modern, dark mode default
- Car-enthusiast energy but not tacky — think sophisticated, not Fast & Furious
- The report card should feel like getting results from a trusted expert
- Mobile-first — most users will be on phones browsing listings

### V1 Scope (This Week)
- [ ] Landing page with URL input
- [ ] Scraper for BaT + Craigslist (FB Marketplace can wait)
- [ ] AI analysis pipeline (listing → structured data → score + flags)
- [ ] Report card UI
- [ ] Free tier rate limiting (5 scans, cookie-based)
- [ ] Mobile-responsive design
- [ ] Basic loading/progress state while analyzing

### NOT in V1
- User accounts / auth
- Payment / subscription
- Deep scan / VIN lookup
- Photo analysis
- Saved scan history
- Native mobile app
- Cars.com, AutoTrader, PCarMarket, Cars & Bids support

### Success Criteria
- A real person can paste a BaT or Craigslist listing and get a useful, accurate report card
- The analysis feels genuinely helpful — not generic AI slop
- Loads fast, looks great on mobile
- Truman tests it against cars he knows and the scores make sense
