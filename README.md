# Maison Margiela — Retail Partner Intelligence

A luxury-branded AI-powered tool that identifies, analyzes, and ranks potential retail partners for Maison Margiela wholesale distribution in any city worldwide.

![Maison Margiela Retail Prospector](https://img.shields.io/badge/Powered%20by-Claude%20API-black?style=flat-square)

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

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/maison-margiela-retail-prospector.git
cd maison-margiela-retail-prospector
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You'll be prompted to enter your Anthropic API key on first load. The key is stored in `sessionStorage` (browser tab only, never persisted to disk).

### Build for Production

```bash
npm run build
```

The built files will be in `dist/`. Deploy to any static hosting (Vercel, Netlify, GitHub Pages, etc.).

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# drag & drop the `dist` folder to netlify.com, or use the CLI:
npx netlify-cli deploy --prod --dir=dist
```

## Project Structure

```
maison-margiela-retail-prospector/
├── index.html              # Entry HTML
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── public/
│   └── favicon.svg         # Four-stitch favicon
└── src/
    ├── main.jsx            # React mount point
    ├── index.css           # Global reset
    └── App.jsx             # Full application
```

## Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool
- **Anthropic Claude API** — AI analysis + web search verification
- **Google Fonts** — Cormorant Garamond, DM Mono, DM Sans

## Important Notes

- **API key security**: The key is sent directly from the browser using Anthropic's `anthropic-dangerous-direct-browser-access` header. For production use, consider proxying API calls through a backend server.
- **Contact details**: Buying contacts are AI-generated and illustrative. Always verify through official channels (LinkedIn Sales Navigator, industry directories, trade shows) before outreach.
- **Rate limits**: Each search makes 2 API calls. Be mindful of your Anthropic API usage limits.

## License

MIT
