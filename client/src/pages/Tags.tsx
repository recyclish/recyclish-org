import { useState, useEffect } from "react";

export default function Tags() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Replace with your Zapier webhook URL when ready
  const ZAPIER_WEBHOOK = "https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID/YOUR_HOOK_KEY/";

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
      // Silent fail
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: bg, minHeight: "100vh", fontFamily: openSans, color: "#333333" }}>

      {/* Hero */}
      <div style={{ backgroundColor: green, color: "white", padding: "48px 24px 36px", textAlign: "center" }}>
        <img
          src="/images/mobi-mascot.png"
          alt="Mobi the recycling pup"
          style={{ width: 90, height: 90, objectFit: "contain", display: "block", margin: "0 auto 16px" }}
        />
        <h1 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 30, margin: "0 0 8px", letterSpacing: 0.3, color: "white" }}>
          Tag your tote.
        </h1>
        <p style={{ fontFamily: openSans, fontWeight: 700, fontSize: 18, margin: "0 0 14px", color: tan }}>
          Never forget to recycle again.
        </p>
        <p style={{ fontSize: 14, margin: 0, opacity: 0.88, lineHeight: 1.6 }}>
          Hang it from any tote you already own.<br />
          That bag is now your recycling bag.
        </p>
      </div>

      {/* How it works */}
      <div style={{ backgroundColor: "white", padding: "24px 20px", borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h2 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 13, color: navy, textAlign: "center", margin: "0 0 18px", textTransform: "uppercase", letterSpacing: 1.2 }}>
            Three steps. That's it.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { num: "1", text: "Hang your Mobi Tag on any tote you already own" },
              { num: "2", text: "That bag is now dedicated to recycling" },
              { num: "3", text: "Fill it. Drop it off. Start again." },
            ].map((step) => (
              <div key={step.num} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ backgroundColor: green, color: "white", borderRadius: "50%", width: 36, height: 36, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: openSans, fontWeight: 800, fontSize: 16 }}>{step.num}</div>
                <p style={{ fontSize: 15, color: "#444", margin: 0, lineHeight: 1.45 }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: "28px 20px 0", maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 20, color: navy, textAlign: "center", margin: "0 0 4px" }}>
          The Mobi Tag™ Collector Series
        </h2>
        <p style={{ fontSize: 13, color: "#999", textAlign: "center", margin: "0 0 18px" }}>
          4 limited edition cards · 1,000 in circulation
        </p>
        <div style={{ backgroundColor: green, color: "white", borderRadius: 16, padding: "22px 20px", marginBottom: 12, boxShadow: "0 4px 16px rgba(36,84,36,0.25)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ backgroundColor: tan, color: navy, borderRadius: "50%", width: 44, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: openSans, fontWeight: 800, fontSize: 20 }}>B</div>
            <div>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.7, margin: "0 0 4px", fontWeight: 600 }}>Card B — Most Popular</p>
              <h3 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 20, margin: "0 0 8px", color: "white" }}>The Anchor</h3>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0, lineHeight: 1.55 }}>When everything pulls you off course, this is what holds.</p>
            </div>
          </div>
        </div>
        {[
          { letter: "A", name: "The Signal", desc: "You were built to stand out. Act like it." },
          { letter: "C", name: "The Conviction", desc: "The world changes when you stop asking for permission." },
          { letter: "D", name: "The Badge", desc: "You earned this. Wear it." },
        ].map((card) => (
          <div key={card.letter} style={{ backgroundColor: "white", borderRadius: 16, padding: "18px 20px", marginBottom: 10, border: "1px solid #E8E8E8", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ backgroundColor: green, color: "white", borderRadius: "50%", width: 44, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: openSans, fontWeight: 800, fontSize: 20 }}>{card.letter}</div>
              <div>
                <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#888", margin: "0 0 4px", fontWeight: 600 }}>Card {card.letter}</p>
                <h3 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 18, color: navy, margin: "0 0 6px" }}>{card.name}</h3>
                <p style={{ fontSize: 14, color: "#555", margin: 0, lineHeight: 1.55 }}>{card.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buy */}
      <div style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ backgroundColor: "white", borderRadius: 16, padding: "22px", textAlign: "center", marginBottom: 12, border: "1px solid #E8E8E8", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#888", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Single Tag</p>
          <p style={{ fontFamily: openSans, fontWeight: 800, fontSize: 38, color: green, margin: "0 0 16px" }}>$8.99</p>
          <a href="https://recyclish.com/products/mobi-tag" style={{ display: "block", backgroundColor: blue, color: "white", padding: "15px", borderRadius: 12, fontSize: 16, textDecoration: "none", fontFamily: openSans, fontWeight: 700, letterSpacing: 0.3 }}>Get Your Tag</a>
        </div>
        <div style={{ backgroundColor: navy, borderRadius: 16, padding: "22px", textAlign: "center", color: "white" }}>
          <p style={{ fontSize: 11, opacity: 0.7, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Full Collector's Set — Best Value</p>
          <p style={{ fontFamily: openSans, fontWeight: 800, fontSize: 38, margin: "0 0 4px" }}>$24.99</p>
          <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 18px" }}>All 4 tags — A, B, C, and D</p>
          <a href="https://recyclish.com/products/mobi-tag-bundle" style={{ display: "block", backgroundColor: blue, color: "white", padding: "15px", borderRadius: 12, fontSize: 16, textDecoration: "none", fontFamily: openSans, fontWeight: 700, letterSpacing: 0.3 }}>Complete Your Set</a>
        </div>
      </div>

      {/* Email Capture */}
      <div style={{ padding: "4px 20px 8px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ backgroundColor: tan, borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
          <p style={{ fontFamily: openSans, fontWeight: 800, fontSize: 17, color: navy, margin: "0 0 6px" }}>Be the first to know what's next.</p>
          <p style={{ fontSize: 13, color: "#555", margin: "0 0 16px", lineHeight: 1.55 }}>New cards, launch updates, and recycling tips — straight to your inbox.</p>
          {submitted ? (
            <p style={{ fontFamily: openSans, fontWeight: 700, fontSize: 15, color: green, margin: 0 }}>✓ You're in. Welcome to the mission.</p>
          ) : (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required style={{ flex: 1, minWidth: 180, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, fontFamily: openSans, outline: "none", backgroundColor: "white" }} />
              <button type="submit" disabled={submitting} style={{ backgroundColor: green, color: "white", padding: "12px 20px", borderRadius: 10, border: "none", fontSize: 14, fontFamily: openSans, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{submitting ? "..." : "I'm In"}</button>
            </form>
          )}
        </div>
      </div>

      {/* Mission */}
      <div style={{ padding: "20px 20px 60px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ borderTop: "2px solid #E8E8E8", paddingTop: 28 }}>
          <span style={{ fontSize: 32 }}>🐾</span>
          <h3 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 18, color: navy, margin: "12px 0 10px" }}>Every Tag Helps a Dog Find Home</h3>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, margin: "0 0 14px" }}>A portion of every Mobi Tag sale supports dog rescue. Because the best things in life find you when you're not looking.</p>
          <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>recyclish.com · Carry the mission everywhere</p>
        </div>
      </div>

    </div>
  );
}
