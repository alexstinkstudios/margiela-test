# Maison Margiela — Retail Partner Intelligence

A luxury-branded AI-powered tool that identifies, analyzes, and ranks potential retail partners for Maison Margiela wholesale distribution in any city worldwide.

![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20API-black?style=flat-square)

## Features

- **City-based retail analysis** — Enter any city to discover top luxury retailers suited for Margiela
- **Deep partner scoring** — Each retailer is scored 0–100 on brand alignment, customer overlap, and revenue potential
- **Web-verified results** — Every store is checked via live web search to confirm it's currently operating
- **Buying contacts** — AI-generated buyer-level contacts with titles, emails, and LinkedIn profiles
- **Competitive intelligence** — Analysis of which Margiela competitors are already stocked at each location
- **Closed store filtering** — Stores that have shut down are flagged and removed from the active list

## How It Works

The app runs a **3-step AI pipeline**:

1. **Generate** — Claude identifies 5–8 potential retail partners with full analysis
2. **Verify** — Each store is checked via web search to confirm it's currently open
3. **Filter & Rank** — Closed stores are removed; addresses/details are corrected from live data

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/maison-margiela-retail-prospector.git
git push -u origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect the Vite framework — no changes needed

### 3. Add your API key (one time)

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-api03-...` (your full Anthropic API key)
   - **Environments:** Production, Preview, Development (check all three)
3. Click **Save**
4. **Redeploy** your project (go to Deployments → click ··· on the latest → Redeploy)

That's it. The app will now use your key automatically — no prompt, no exposure to the browser.

### How it stays secure

Your API key never touches the browser. The architecture:

```
Browser  →  /api/claude  →  Anthropic API
              (Vercel serverless function
               reads key from env var)
```

The frontend calls `/api/claude`, which is a serverless function running on Vercel's servers. It reads `ANTHROPIC_API_KEY` from the environment and proxies the request. The key is never sent to or visible in the client.

## Local Development

```bash
git clone https://github.com/YOUR_USERNAME/maison-margiela-retail-prospector.git
cd maison-margiela-retail-prospector
npm install
```

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Then run:

```bash
npx vercel dev
```

> **Note:** Use `vercel dev` (not `npm run dev`) locally so the `/api/claude` serverless function works. Plain `vite dev` won't have the API route.

## Project Structure

```
maison-margiela-retail-prospector/
├── api/
│   └── claude.js           # Vercel serverless proxy (reads API key from env)
├── src/
│   ├── App.jsx             # Full application
│   ├── main.jsx            # React mount point
│   └── index.css           # Global reset
├── public/
│   └── favicon.svg         # Four-stitch favicon
├── index.html              # Entry HTML
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel routing & function config
└── .gitignore
```

## Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool
- **Vercel Serverless Functions** — Secure API proxy
- **Anthropic Claude API** — AI analysis + web search verification
- **Google Fonts** — Cormorant Garamond, DM Mono, DM Sans

## Important Notes

- **Contact details** are AI-generated and illustrative. Always verify through official channels before outreach.
- **Rate limits**: Each city search makes 2 API calls. Be mindful of your Anthropic usage limits.
- **Function timeout**: Set to 60s in `vercel.json` to allow time for the web-search verification step.

## License

MIT
