import { useState, useEffect } from "react";

export default function Tags() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    window.scrollTo(0, 0);
  }, []);

  const green = "#245424";
  const navy = "#243368";
  const blue = "#1E90FF";
  const tan = "#F0C270";
  const bg = "#FFFCF8";
  const openSans = "'Open Sans', sans-serif";

  const ZAPIER_WEBHOOK = "https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID/YOUR_HOOK_KEY/";
  const PAGE_URL = "https://recyclish.pet/tags";
  const SHARE_TEXT = "Just got my Mobi Tag™ 🐾 One of the first 1,000 ever made. Tag your tote. Carry the mission. #Recyclish #MobiTag #RecycleMore";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mobi Tag™ by Recyclish", text: SHARE_TEXT, url: PAGE_URL });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(SHARE_TEXT + " " + PAGE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(ZAPIER_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "mobi-tag-qr-scan" }),
      });
    } catch {
      // silent fail
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  const ecosystemSites = [
    { emoji: "🐾", name: "Find a Dog Rescue", desc: "9,000 shelters and rescues nationwide. Every life deserves a second chance.", url: "https://recyclish.pet", label: "recyclish.pet" },
    { emoji: "♻️", name: "Find a Recycling Center", desc: "Search by location or material type. Know exactly where to drop it off.", url: "https://recyclish.info", label: "recyclish.info" },
    { emoji: "📊", name: "Rate a Business", desc: "Commend or flag companies on their recycling practices. Accountability changes behavior.", url: "https://recyclish.report", label: "recyclish.report" },
    { emoji: "🛍️", name: "Get the Mobi Tote™", desc: "The next step. A purpose-built mobile recycling tote for the mission carrier.", url: "https://recyclish.com", label: "recyclish.com" },
  ];

  return (
    <div style={{ backgroundColor: bg, minHeight: "100vh", fontFamily: openSans, color: "#333333" }}>

      {/* LAYER 1: CELEBRATION */}
      <div style={{ backgroundColor: green, color: "white", padding: "48px 24px 40px", textAlign: "center" }}>
        <img src="/images/mobi-mascot.png" alt="Mobi the recycling pup" style={{ width: 88, height: 88, objectFit: "contain", display: "block", margin: "0 auto 18px" }} />
        <p style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7, margin: "0 0 12px", fontWeight: 600 }}>Collector’s Edition · One of the First 1,000</p>
        <h1 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 28, margin: "0 0 10px", lineHeight: 1.25, color: "white" }}>
          You’re holding something<br />that matters.
        </h1>
        <p style={{ fontFamily: openSans, fontWeight: 700, fontSize: 17, color: tan, margin: "0 0 12px" }}>Here’s what to do with it.</p>
        <p style={{ fontSize: 13, opacity: 0.82, margin: 0, lineHeight: 1.6 }}>Every life deserves a second chance —<br />whether it’s a bottle, a box, or a best friend.</p>
      </div>

      {/* LAYER 2: ACTIVATION */}
      <div style={{ backgroundColor: "white", padding: "28px 20px 24px", borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h2 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 19, color: navy, margin: "0 0 6px", textAlign: "center" }}>Tag your tote.</h2>
          <p style={{ fontSize: 14, color: "#666", textAlign: "center", margin: "0 0 22px", lineHeight: 1.55 }}>Hang it from any bag you already own.<br />That bag is now your recycling bag.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { num: "1", head: "Hang it", sub: "Loop it onto any tote, purse, or backpack you carry" },
              { num: "2", head: "Use it", sub: "That bag is now dedicated to collecting recyclables" },
              { num: "3", head: "Carry the mission", sub: "Every trip out is a statement. People will notice." },
            ].map((s) => (
              <div key={s.num} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 16px", backgroundColor: bg, borderRadius: 12, border: "1px solid #EBEBEB" }}>
                <div style={{ backgroundColor: green, color: "white", borderRadius: "50%", width: 34, height: 34, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: openSans, fontWeight: 800, fontSize: 15 }}>{s.num}</div>
                <div>
                  <p style={{ fontFamily: openSans, fontWeight: 700, fontSize: 14, color: navy, margin: "0 0 2px" }}>{s.head}</p>
                  <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.45 }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LAYER 3: AMBASSADOR */}
      <div style={{ backgroundColor: tan, padding: "28px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 22 }}>📣</p>
          <h2 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 19, color: navy, margin: "6px 0 8px" }}>You’re the first wave. Tell someone.</h2>
          <p style={{ fontSize: 13, color: "#555", margin: "0 0 18px", lineHeight: 1.6 }}>1,000 tags. 1,000 people who can start a conversation.<br />Every person who sees your tag hanging is a potential recruit.</p>
          <button onClick={handleShare} style={{ display: "block", width: "100%", backgroundColor: navy, color: "white", padding: "15px", borderRadius: 12, border: "none", fontSize: 15, fontFamily: openSans, fontWeight: 700, cursor: "pointer", marginBottom: 12, letterSpacing: 0.3 }}>
            {copied ? "✓ Caption copied to clipboard!" : "🔗 Share This Page"}
          </button>
          <div style={{ backgroundColor: "white", borderRadius: 12, padding: "14px 16px", textAlign: "left", marginBottom: 16 }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "#999", margin: "0 0 6px", fontWeight: 700 }}>Ready-to-post caption</p>
            <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.6 }}>Just got my Mobi Tag™ 🐾 One of the first 1,000 ever made. Tag your tote. Carry the mission. #Recyclish #MobiTag #RecycleMore</p>
          </div>
          <p style={{ fontSize: 12, color: "#666", margin: "0 0 10px" }}>Follow the mission</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { name: "TikTok", url: "https://www.tiktok.com/@recyclish" },
              { name: "Instagram", url: "https://www.instagram.com/recyclish" },
              { name: "recyclish.com", url: "https://recyclish.com" },
            ].map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "white", color: navy, padding: "8px 14px", borderRadius: 20, fontSize: 12, textDecoration: "none", fontFamily: openSans, fontWeight: 700, border: "1.5px solid #ddd" }}>{s.name}</a>
            ))}
          </div>
        </div>
      </div>

      {/* LAYER 4: ECOSYSTEM */}
      <div style={{ padding: "28px 20px", maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 19, color: navy, textAlign: "center", margin: "0 0 6px" }}>The world you just joined</h2>
        <p style={{ fontSize: 13, color: "#888", textAlign: "center", margin: "0 0 18px", lineHeight: 1.5 }}>Recyclish is bigger than a tag. Explore what’s here.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ecosystemSites.map((site) => (
            <a key={site.url} href={site.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px", backgroundColor: "white", borderRadius: 14, border: "1px solid #E8E8E8", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", textDecoration: "none" }}>
              <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{site.emoji}</span>
              <div>
                <p style={{ fontFamily: openSans, fontWeight: 700, fontSize: 14, color: navy, margin: "0 0 3px" }}>{site.name}</p>
                <p style={{ fontSize: 12, color: "#666", margin: "0 0 4px", lineHeight: 1.45 }}>{site.desc}</p>
                <p style={{ fontSize: 11, color: blue, margin: 0, fontWeight: 600 }}>{site.label} →</p>
              </div>
            </a>
          ))}
        </div>
        <a href="https://recyclish.com/products/mobis-adventures" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", backgroundColor: navy, borderRadius: 14, textDecoration: "none", marginTop: 10 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>📚</span>
          <div>
            <p style={{ fontFamily: openSans, fontWeight: 700, fontSize: 14, color: "white", margin: "0 0 3px" }}>Mobi’s Adventures</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", margin: "0 0 4px", lineHeight: 1.45 }}>A children’s digital book for ages 3–6. Recycling made fun with Mobi.</p>
            <p style={{ fontSize: 11, color: tan, margin: 0, fontWeight: 600 }}>recyclish.com →</p>
          </div>
        </a>
      </div>

      {/* LAYER 5: UPSELL */}
      <div style={{ padding: "4px 20px 20px", maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 17, color: navy, textAlign: "center", margin: "0 0 4px" }}>Complete your collection</h2>
        <p style={{ fontSize: 13, color: "#888", textAlign: "center", margin: "0 0 14px" }}>4 cards. 4 messages. First edition of 1,000.</p>
        <div style={{ backgroundColor: "white", borderRadius: 14, padding: "18px", textAlign: "center", marginBottom: 10, border: "1px solid #E8E8E8", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
          <p style={{ color: "#888", fontSize: 11, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Single Tag</p>
          <p style={{ fontFamily: openSans, fontWeight: 800, fontSize: 34, color: green, margin: "0 0 12px" }}>$8.99</p>
          <a href="https://recyclish.com/products/mobi-tag" style={{ display: "block", backgroundColor: blue, color: "white", padding: "13px", borderRadius: 10, fontSize: 15, textDecoration: "none", fontFamily: openSans, fontWeight: 700 }}>Add to Your Collection</a>
        </div>
        <div style={{ backgroundColor: navy, borderRadius: 14, padding: "18px", textAlign: "center", color: "white" }}>
          <p style={{ fontSize: 11, opacity: 0.7, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Full Collector’s Set — Best Value</p>
          <p style={{ fontFamily: openSans, fontWeight: 800, fontSize: 34, margin: "0 0 4px" }}>$24.99</p>
          <p style={{ fontSize: 12, opacity: 0.72, margin: "0 0 14px" }}>All 4 tags — A, B, C, and D</p>
          <a href="https://recyclish.com/products/mobi-tag-bundle" style={{ display: "block", backgroundColor: blue, color: "white", padding: "13px", borderRadius: 10, fontSize: 15, textDecoration: "none", fontFamily: openSans, fontWeight: 700 }}>Complete Your Set</a>
        </div>
      </div>

      {/* LAYER 6: EMAIL */}
      <div style={{ padding: "0 20px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ backgroundColor: "#F0F7F0", borderRadius: 14, padding: "22px 18px", textAlign: "center", border: "1px solid #C8DEC8" }}>
          <p style={{ fontFamily: openSans, fontWeight: 800, fontSize: 16, color: navy, margin: "0 0 5px" }}>Stay in the loop.</p>
          <p style={{ fontSize: 13, color: "#555", margin: "0 0 14px", lineHeight: 1.5 }}>New cards, recycling tips, and mission updates — straight to your inbox.</p>
          {submitted ? (
            <p style={{ fontFamily: openSans, fontWeight: 700, fontSize: 14, color: green, margin: 0 }}>✓ You’re in. Welcome to the mission.</p>
          ) : (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required style={{ flex: 1, minWidth: 170, padding: "11px 13px", borderRadius: 9, border: "1.5px solid #C8DEC8", fontSize: 14, fontFamily: openSans, outline: "none", backgroundColor: "white" }} />
              <button type="submit" disabled={submitting} style={{ backgroundColor: green, color: "white", padding: "11px 18px", borderRadius: 9, border: "none", fontSize: 14, fontFamily: openSans, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{submitting ? "..." : "I’m In"}</button>
            </form>
          )}
        </div>
      </div>

      {/* MISSION FOOTER */}
      <div style={{ padding: "16px 20px 56px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ borderTop: "2px solid #E8E8E8", paddingTop: 24 }}>
          <span style={{ fontSize: 28 }}>🐾</span>
          <h3 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 16, color: navy, margin: "10px 0 8px" }}>Every Tag Helps a Dog Find Home</h3>
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.65, margin: "0 0 12px" }}>A portion of every Mobi Tag sale supports dog rescue.<br />Because the best things in life find you when you’re not looking.</p>
          <p style={{ fontSize: 10, color: "#bbb", margin: 0, letterSpacing: 0.5 }}>RECYCLISH · Carry the mission everywhere</p>
        </div>
      </div>

    </div>
  );
}
