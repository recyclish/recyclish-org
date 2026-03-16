import { useEffect } from "react";

export default function Tags() {
  useEffect(() => {
    // Load Fredoka One font
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ fontFamily: "'Fredoka One', cursive", backgroundColor: "#FAF3E0", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ backgroundColor: "#2D6A4F", color: "white", padding: "48px 24px", textAlign: "center" }}>
        <img
          src="/images/mobi-mascot.png"
          alt="Mobi"
          style={{ width: 96, height: 96, objectFit: "contain", margin: "0 auto 16px", display: "block" }}
        />
        <h1 style={{ fontSize: 28, margin: "0 0 10px", letterSpacing: 0.5 }}>
          You're holding something rare.
        </h1>
        <p style={{ fontSize: 17, margin: "0 0 6px", opacity: 0.9 }}>
          The Mobi Tag‚Ñ¢ Collector's Edition
        </p>
        <p style={{ fontSize: 13, margin: 0, opacity: 0.7 }}>
          4 cards. 1 mission. Your move.
        </p>
      </div>

      {/* Cards */}
      <div style={{ padding: "36px 20px 0", maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 20, color: "#2D6A4F", marginBottom: 20 }}>
          Meet the Series
        </h2>

        {/* Card B ‚Äî lead emotionally */}
        <div style={{
          backgroundColor: "#2D6A4F", color: "white",
          borderRadius: 20, padding: "24px 20px", marginBottom: 14,
          boxShadow: "0 4px 16px rgba(45,106,79,0.3)"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{
              backgroundColor: "white", color: "#2D6A4F",
              borderRadius: "50%", width: 42, height: 42, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: "bold"
            }}>B</div>
            <div>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.7, margin: "0 0 4px" }}>Card B</p>
              <h3 style={{ fontSize: 20, margin: "0 0 8px" }}>The Anchor</h3>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0, lineHeight: 1.5 }}>
                When everything pulls you off course, this is what holds.
              </p>
            </div>
          </div>
        </div>

        {/* Cards A, C, D */}
        {[
          { letter: "A", name: "The Signal", desc: "You were built to stand out. Act like it." },
          { letter: "C", name: "The Conviction", desc: "The world changes when you stop asking for permission." },
          { letter: "D", name: "The Badge", desc: "You earned this. Wear it." },
        ].map((card) => (
          <div key={card.letter} style={{
            backgroundColor: "white", borderRadius: 20, padding: "20px",
            marginBottom: 12, border: "1px solid #e8e0d0"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                backgroundColor: "#2D6A4F", color: "white",
                borderRadius: "50%", width: 42, height: 42, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18
              }}>{card.letter}</div>
              <div>
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#999", margin: "0 0 4px" }}>Card {card.letter}</p>
                <h3 style={{ fontSize: 18, color: "#2D6A4F", margin: "0 0 6px" }}>{card.name}</h3>
                <p style={{ fontSize: 14, color: "#555", margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buy Section */}
      <div style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>

        {/* Single */}
        <div style={{
          backgroundColor: "white", borderRadius: 20, padding: "24px",
          textAlign: "center", marginBottom: 14, border: "1px solid #e8e0d0"
        }}>
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 4px" }}>Single Card</p>
          <p style={{ fontSize: 36, color: "#2D6A4F", margin: "0 0 16px" }}>$8.99</p>
          <a
            href="https://recyclish.com/products/mobi-tag"
            style={{
              display: "block", backgroundColor: "#2D6A4F", color: "white",
              padding: "16px", borderRadius: 14, fontSize: 17,
              textDecoration: "none", fontFamily: "'Fredoka One', cursive"
            }}
          >
            Get Your Card
          </a>
        </div>

        {/* Bundle */}
        <div style={{
          backgroundColor: "#2D6A4F", borderRadius: 20, padding: "24px",
          textAlign: "center", color: "white"
        }}>
          <p style={{ fontSize: 12, opacity: 0.75, margin: "0 0 4px", letterSpacing: 1 }}>FULL COLLECTOR'S SET ‚Äî BEST VALUE</p>
          <p style={{ fontSize: 36, margin: "0 0 4px" }}>$24.99</p>
          <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 18px" }}>All 4 cards ‚Äî A, B, C &amp; D</p>
          <a
            href="https://recyclish.com/products/mobi-tag-bundle"
            style={{
              display: "block", backgroundColor: "#FAF3E0", color: "#2D6A4F",
              padding: "16px", borderRadius: 14, fontSize: 17,
              textDecoration: "none", fontFamily: "'Fredoka One', cursive"
            }}
          >
            Get the Full Set
          </a>
        </div>
      </div>

      {/* Mission */}
      <div style={{ padding: "24px 20px 60px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ borderTop: "1px solid #ddd6c8", paddingTop: 28 }}>
          <img
            src="/images/mobi-mascot.png"
            alt="Mobi"
            style={{ width: 56, height: 56, objectFit: "contain", margin: "0 auto 12px", display: "block", opacity: 0.85 }}
          />
          <h3 style={{ fontSize: 18, color: "#2D6A4F", margin: "0 0 10px" }}>
            Every Tag Helps a Dog Find Home
          </h3>
          <p style={{ fontSize: 14, color: "#777", lineHeight: 1.6, margin: "0 0 12px" }}>
            A portion of every Mobi Tag sale supports dog rescue.
            Because the best things in life find you when you're not looking.
          </p>
          <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>recyclish.com ¬∑ Turning Knowledge into Action</p>
        </div>
      </div>

    </div>
  );
}
