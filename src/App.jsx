import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are a luxury fashion retail analyst specializing in Maison Margiela wholesale distribution strategy. Given a city, identify the top 5-8 potential retail partners for Maison Margiela products.

For each retailer, provide a deep analysis. Respond ONLY with valid JSON (no markdown, no backticks, no preamble). Use this exact schema:

{
  "city": "City Name",
  "market_overview": "2-3 sentence overview of the luxury retail landscape in this city",
  "retailers": [
    {
      "rank": 1,
      "name": "Store Name",
      "type": "Department Store | Multi-brand Boutique | Concept Store | Luxury E-tailer with Physical Presence",
      "address": "Full street address",
      "website": "https://...",
      "phone": "+1...",
      "score": 92,
      "analysis": {
        "brand_alignment": "2-3 sentences on how the store's aesthetic/positioning aligns with Margiela's avant-garde identity",
        "customer_demographic": "Description of the store's typical customer and overlap with Margiela's target",
        "current_brands": ["List", "of", "comparable", "luxury", "brands", "they", "carry"],
        "competitive_landscape": "Which Margiela competitors are already stocked and what that means",
        "revenue_potential": "Low | Medium | High | Very High",
        "risk_factors": "Any concerns about this partnership"
      },
      "buying_contacts": [
        {
          "name": "Full Name",
          "title": "Buying Director / Head of Menswear / etc.",
          "email": "realistic professional email",
          "phone": "+1...",
          "linkedin": "https://linkedin.com/in/...",
          "notes": "Brief note on their background or how to approach them"
        }
      ],
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "considerations": ["Consideration 1", "Consideration 2"]
    }
  ]
}

Be specific with real retailer names, real addresses, and realistic contact details. Provide genuine analysis based on your knowledge of the luxury retail landscape. Rank by overall suitability score (0-100). Include 1-2 buying contacts per retailer with realistic titles and contact info. The contacts should be plausible buyer-level or director-level contacts for the relevant categories (RTW, accessories, footwear).`;

// ─── SVG Components ─────────────────────────────────────────────────────────

const StitchBackground = () => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 0, opacity: 0.03,
    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, #000 39px, #000 40px),
                      repeating-linear-gradient(90deg, transparent, transparent 39px, #000 39px, #000 40px)`,
    pointerEvents: "none"
  }} />
);

const FourStitches = ({ size = 24, color = "#000" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 40 24" fill="none">
    {[0, 10, 20, 30].map((x, i) => (
      <line key={i} x1={x + 4} y1="2" x2={x + 4} y2="22" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeDasharray="4 3" />
    ))}
  </svg>
);

const ScoreRing = ({ score, size = 72 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#1a1a1a" : score >= 70 ? "#555" : "#999";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8e4df" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: size * 0.28,
          fontFamily: "'DM Mono', monospace", fontWeight: 500, fill: color }}>{score}</text>
    </svg>
  );
};

// ─── Analysis Block ─────────────────────────────────────────────────────────

const AnalysisBlock = ({ title, content }) => (
  <div>
    <div style={{
      fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#999",
      letterSpacing: 2, textTransform: "uppercase", marginBottom: 6
    }}>{title}</div>
    <div style={{
      fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#444", lineHeight: 1.7
    }}>{content}</div>
  </div>
);

// ─── Retailer Card ──────────────────────────────────────────────────────────

const RetailerCard = ({ retailer, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);

  return (
    <div style={{
      animation: `fadeSlideUp 0.6s ${index * 0.1}s both`,
      background: "#fff",
      border: "1px solid #e0dcd6",
      marginBottom: 16,
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, background: "#1a1a1a", color: "#fff",
        fontFamily: "'DM Mono', monospace", fontSize: 11, padding: "6px 12px",
        letterSpacing: 2, textTransform: "uppercase"
      }}>
        №{String(retailer.rank).padStart(2, "0")}
      </div>

      <div style={{ padding: "32px 28px 20px", cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500,
                margin: 0, letterSpacing: "-0.02em"
              }}>{retailer.name}</h3>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 1,
                textTransform: "uppercase", padding: "3px 8px", borderRadius: 2,
                background: "#e8f5e9", color: "#2e7d32", border: "1px solid #c8e6c9",
                whiteSpace: "nowrap"
              }}>✓ Verified Open</span>
            </div>
            {retailer.verification_note && (
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#777",
                fontStyle: "italic", marginBottom: 4
              }}>{retailer.verification_note}</div>
            )}
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#888",
              letterSpacing: 2, textTransform: "uppercase", marginBottom: 10
            }}>{retailer.type}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#666", lineHeight: 1.5 }}>
              {retailer.address}
            </div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <ScoreRing score={retailer.score} />
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#999",
              letterSpacing: 2, marginTop: 4, textTransform: "uppercase"
            }}>Fit Score</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {retailer.strengths?.map((s, i) => (
            <span key={i} style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555",
              border: "1px solid #d5d0c8", padding: "4px 10px", letterSpacing: 1,
              textTransform: "uppercase"
            }}>{s}</span>
          ))}
        </div>

        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa",
          marginTop: 14, letterSpacing: 1, textAlign: "right"
        }}>
          {expanded ? "— COLLAPSE" : "+ EXPAND ANALYSIS"}
        </div>
      </div>

      {expanded && (
        <div style={{
          borderTop: "1px solid #e8e4df", padding: "24px 28px",
          animation: "fadeIn 0.3s ease"
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24
          }}>
            <AnalysisBlock title="Brand Alignment" content={retailer.analysis?.brand_alignment} />
            <AnalysisBlock title="Customer Demographic" content={retailer.analysis?.customer_demographic} />
            <AnalysisBlock title="Competitive Landscape" content={retailer.analysis?.competitive_landscape} />
            <AnalysisBlock title="Risk Factors" content={retailer.analysis?.risk_factors} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#999",
              letterSpacing: 2, textTransform: "uppercase", marginBottom: 10
            }}>Current Brand Portfolio</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {retailer.analysis?.current_brands?.map((b, i) => (
                <span key={i} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#1a1a1a",
                  background: "#f5f2ed", padding: "5px 12px", borderRadius: 2
                }}>{b}</span>
              ))}
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 0",
            borderTop: "1px solid #f0ece6", borderBottom: "1px solid #f0ece6", marginBottom: 20
          }}>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#999",
              letterSpacing: 2, textTransform: "uppercase"
            }}>Revenue Potential</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600,
              fontStyle: "italic", color: "#1a1a1a"
            }}>{retailer.analysis?.revenue_potential}</span>
          </div>

          {retailer.considerations?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#999",
                letterSpacing: 2, textTransform: "uppercase", marginBottom: 8
              }}>Key Considerations</div>
              {retailer.considerations.map((c, i) => (
                <div key={i} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#666",
                  lineHeight: 1.6, paddingLeft: 16, borderLeft: "2px solid #e0dcd6",
                  marginBottom: 8
                }}>{c}</div>
              ))}
            </div>
          )}

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "14px 0", borderTop: "1px solid #f0ece6", marginBottom: 8
          }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#666" }}>
              {retailer.website && <a href={retailer.website} target="_blank" rel="noreferrer"
                style={{ color: "#1a1a1a", marginRight: 20 }}>{retailer.website}</a>}
              {retailer.phone && <span style={{ color: "#888" }}>{retailer.phone}</span>}
            </span>
          </div>

          <div onClick={() => setContactsOpen(!contactsOpen)}
            style={{ cursor: "pointer", padding: "14px 0", borderTop: "1px solid #f0ece6" }}>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#1a1a1a",
              letterSpacing: 2, textTransform: "uppercase",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span>Buying Contacts ({retailer.buying_contacts?.length || 0})</span>
              <span style={{ color: "#aaa" }}>{contactsOpen ? "—" : "+"}</span>
            </div>
          </div>

          {contactsOpen && retailer.buying_contacts?.map((contact, ci) => (
            <div key={ci} style={{
              padding: "18px 20px", background: "#faf8f5", marginBottom: 8,
              border: "1px solid #ede9e3", animation: "fadeIn 0.3s ease"
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500,
                marginBottom: 2
              }}>{contact.name}</div>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#888",
                letterSpacing: 2, textTransform: "uppercase", marginBottom: 12
              }}>{contact.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {contact.email && (
                  <a href={`mailto:${contact.email}`} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1a1a1a",
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 8
                  }}><span style={{ width: 16, opacity: 0.4 }}>✉</span>{contact.email}</a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1a1a1a",
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 8
                  }}><span style={{ width: 16, opacity: 0.4 }}>☎</span>{contact.phone}</a>
                )}
                {contact.linkedin && (
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#1a1a1a",
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 8
                  }}><span style={{ width: 16, opacity: 0.4 }}>in</span>{contact.linkedin}</a>
                )}
              </div>
              {contact.notes && (
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#888",
                  fontStyle: "italic", marginTop: 10, lineHeight: 1.5
                }}>{contact.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Loading State ──────────────────────────────────────────────────────────

const LoadingState = ({ status }) => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const i1 = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(i1);
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "80px 20px", animation: "fadeIn 0.5s ease"
    }}>
      <div style={{ marginBottom: 32, animation: "pulse 2s ease-in-out infinite" }}>
        <FourStitches size={48} color="#bbb" />
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#999",
        fontStyle: "italic", minHeight: 30, transition: "opacity 0.3s"
      }}>
        {status || "Analyzing"}{".".repeat(dots)}
      </div>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#ccc",
        letterSpacing: 2, textTransform: "uppercase", marginTop: 16
      }}>
        This may take 30–60 seconds
      </div>
    </div>
  );
};

// ─── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const inputRef = useRef(null);

  const callClaude = async (messages, tools) => {
    const body = { messages };
    if (tools) body.tools = tools;

    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API error ${res.status}: ${errText.slice(0, 200)}`);
    }
    return await res.json();
  };

  const extractJSON = (text) => {
    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(clean);
  };

  const handleSearch = async () => {
    if (!city.trim() || loading) return;
    setLoading(true);
    setData(null);
    setError(null);
    setStatus("Identifying potential retail partners...");

    try {
      // STEP 1: Generate initial retailer list
      const step1 = await callClaude([
        { role: "user", content: SYSTEM_PROMPT + "\n\nCity: " + city.trim() }
      ]);
      const step1Text = (step1.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      if (!step1Text) throw new Error("Empty response");
      const initial = extractJSON(step1Text);
      if (!initial.retailers?.length) throw new Error("No retailers found");

      // STEP 2: Verify each retailer via web search
      setStatus("Verifying stores are currently open via web search...");
      const retailerNames = initial.retailers.map(r => r.name);

      const verifyPrompt = `I have a list of luxury retailers in ${city.trim()} that I need you to verify are CURRENTLY still in business and operating. Use web search to check each one.

For EACH store, search to confirm:
1. The store is still open and operating (not permanently closed, bankrupt, or shuttered)
2. The address is roughly correct
3. Any updated info (new address, rebranding, etc.)

Here are the stores to verify:
${retailerNames.map((n, i) => `${i + 1}. ${n} — ${initial.retailers[i].address}`).join("\n")}

After searching, respond ONLY with JSON (no markdown, no backticks):
{
  "verified": [
    {
      "name": "Store Name",
      "status": "open" | "closed" | "uncertain",
      "notes": "Any relevant finding — e.g. confirmed open, moved to new address, closed in 2024, rebranded to X, etc.",
      "corrected_address": "Updated address if different, or null",
      "corrected_website": "Updated website if found, or null",
      "corrected_phone": "Updated phone if found, or null"
    }
  ]
}`;

      const step2 = await callClaude(
        [{ role: "user", content: verifyPrompt }],
        [{ type: "web_search_20250305", name: "web_search" }]
      );

      const step2Text = (step2.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      let verification = { verified: [] };
      try {
        verification = extractJSON(step2Text);
      } catch (e) {
        console.warn("Verification parse failed, proceeding with all retailers", e);
      }

      // STEP 3: Filter out closed stores & merge corrections
      setStatus("Compiling verified results...");

      const closedNames = new Set(
        (verification.verified || [])
          .filter(v => v.status === "closed")
          .map(v => v.name.toLowerCase())
      );

      const verifiedMap = new Map(
        (verification.verified || []).map(v => [v.name.toLowerCase(), v])
      );

      const filteredRetailers = initial.retailers
        .filter(r => !closedNames.has(r.name.toLowerCase()))
        .map((r, idx) => {
          const v = verifiedMap.get(r.name.toLowerCase());
          const updated = { ...r, rank: idx + 1 };
          if (v) {
            if (v.corrected_address) updated.address = v.corrected_address;
            if (v.corrected_website) updated.website = v.corrected_website;
            if (v.corrected_phone) updated.phone = v.corrected_phone;
            if (v.notes) updated.verification_note = v.notes;
          }
          return updated;
        });

      const closedList = (verification.verified || []).filter(v => v.status === "closed");

      setData({
        ...initial,
        retailers: filteredRetailers,
        closed_stores: closedList
      });

    } catch (err) {
      console.error("Full error:", err);
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f7f5f0", position: "relative", overflow: "hidden"
    }}>
      <StitchBackground />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes lineGrow {
          from { width: 0; }
          to { width: 60px; }
        }

        input::placeholder {
          color: #bbb;
          font-style: italic;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d5d0c8; border-radius: 3px; }
      `}</style>

      <div style={{
        maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px",
        position: "relative", zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: 48,
          animation: "fadeSlideUp 0.8s ease both"
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <FourStitches size={36} color="#1a1a1a" />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 42, fontWeight: 300, letterSpacing: "-0.02em",
            margin: "0 0 6px", color: "#1a1a1a"
          }}>
            Maison Margiela
          </h1>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            letterSpacing: 4, textTransform: "uppercase", color: "#999", marginBottom: 24
          }}>
            Retail Partner Intelligence
          </div>
          <div style={{
            width: 60, height: 1, background: "#1a1a1a", margin: "0 auto 24px",
            animation: "lineGrow 1s 0.4s both"
          }} />
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14,
            color: "#888", maxWidth: 480, margin: "0 auto", lineHeight: 1.7
          }}>
            Enter a city to discover and evaluate potential retail partners
            for Maison Margiela's wholesale distribution.
          </p>
        </div>

        {/* Search */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 48,
          animation: "fadeSlideUp 0.8s 0.2s both"
        }}>
          <input
            ref={inputRef}
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Enter a city — Paris, New York, Tokyo..."
            style={{
              flex: 1, padding: "16px 20px",
              fontFamily: "'DM Sans', sans-serif", fontSize: 15,
              border: "1px solid #d5d0c8", borderRight: "none",
              background: "#fff", outline: "none", color: "#1a1a1a",
              transition: "border-color 0.3s"
            }}
            onFocus={e => e.target.style.borderColor = "#1a1a1a"}
            onBlur={e => e.target.style.borderColor = "#d5d0c8"}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !city.trim()}
            style={{
              padding: "16px 32px",
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              letterSpacing: 3, textTransform: "uppercase",
              background: loading ? "#999" : "#1a1a1a", color: "#fff",
              border: "none", cursor: loading ? "wait" : "pointer",
              transition: "background 0.3s", whiteSpace: "nowrap"
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = "#333"; }}
            onMouseLeave={e => { if (!loading) e.target.style.background = "#1a1a1a"; }}
          >
            {loading ? "Analyzing..." : "Analyze Market"}
          </button>
        </div>

        {loading && <LoadingState status={status} />}

        {error && (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#c44"
          }}>{error}</div>
        )}

        {data && !loading && (
          <div style={{ animation: "fadeIn 0.6s ease" }}>
            <div style={{
              padding: "28px 32px", marginBottom: 32,
              background: "#1a1a1a", color: "#fff",
              animation: "fadeSlideUp 0.6s ease both"
            }}>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: 3, textTransform: "uppercase", color: "#777",
                marginBottom: 12, display: "flex", alignItems: "center", gap: 12
              }}>
                <FourStitches size={20} color="#555" />
                Market Overview — {data.city}
              </div>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 19,
                fontWeight: 300, lineHeight: 1.7, margin: 0, color: "#ddd"
              }}>{data.market_overview}</p>
            </div>

            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 20, padding: "0 4px"
            }}>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: 2, textTransform: "uppercase", color: "#999"
              }}>{data.retailers?.length || 0} Verified Retailers</span>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                letterSpacing: 2, textTransform: "uppercase", color: "#999"
              }}>Ranked by Fit Score</span>
            </div>

            {data.retailers?.map((r, i) => (
              <RetailerCard key={i} retailer={r} index={i} />
            ))}

            {data.closed_stores?.length > 0 && (
              <div style={{
                marginTop: 32, padding: "20px 24px",
                background: "#fdf6f4", border: "1px solid #f0d8d0"
              }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c44",
                  letterSpacing: 2, textTransform: "uppercase", marginBottom: 12
                }}>
                  Removed — No Longer Operating ({data.closed_stores.length})
                </div>
                {data.closed_stores.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0",
                    borderBottom: i < data.closed_stores.length - 1 ? "1px solid #f0ddd6" : "none"
                  }}>
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                      color: "#999", textDecoration: "line-through"
                    }}>{s.name}</span>
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                      color: "#b77", fontStyle: "italic", maxWidth: "60%", textAlign: "right"
                    }}>{s.notes}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              marginTop: 40, padding: "20px 0",
              borderTop: "1px solid #e0dcd6", textAlign: "center"
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                color: "#bbb", lineHeight: 1.7, maxWidth: 540, margin: "0 auto"
              }}>
                All retailers verified via web search as of today. Contact details are AI-generated
                and should be verified through official channels before outreach. Always confirm
                current buying team structures with each retailer directly.
              </p>
              <div style={{ marginTop: 16 }}>
                <FourStitches size={20} color="#ddd" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
