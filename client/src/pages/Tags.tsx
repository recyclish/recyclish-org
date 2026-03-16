import { useEffect } from "react";

export default function Tags() {
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

  return (
    <div style={{ backgroundColor: bg, minHeight: "100vh", fontFamily: openSans, color: "#333333" }}>

      {/* Hero */}
      <div style={{ backgroundColor: green, color: "white", padding: "48px 24px 40px", textAlign: "center" }}>
        <img
          src="/images/mobi-mascot.png"
          alt="Mobi the recycling pup"
          style={{ width: 100, height: 100, objectFit: "contain", display: "block", margin: "0 auto 16px" }}
        />
        <h1 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 28, margin: "0 0 10px", letterSpacing: 0.3, color: "white" }}>
          You are holding something rare.
        </h1>
        <p style={{ fontSize: 16, margin: "0 0 6px", opacity: 0.92 }}>
          The Mobi Tag Collector Edition
        </p>
        <p style={{ fontSize: 13, margin: 0, opacity: 0.72 }}>
          4 cards. 1 mission. Your move.
        </p>
      </div>

      {/* Tagline strip */}
      <div style={{ backgroundColor: tan, padding: "10px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: openSans, fontWeight: 700, color: navy, fontSize: 14, margin: 0, letterSpacing: 0.3 }}>
          Turning Knowledge into Action
        </p>
      </div>

      {/* Cards Section */}
      <div style={{ padding: "32px 20px 0", maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 22, color: navy, textAlign: "center", marginBottom: 20 }}>
          Meet the Series
        </h2>

        {/* Card B - emotional lead */}
        <div style={{
          backgroundColor: green, color: "white",
          borderRadius: 16, padding: "22px 20px", marginBottom: 12,
          boxShadow: "0 4px 16px rgba(36,84,36,0.25)"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              backgroundColor: tan, color: navy,
              borderRadius: "50%", width: 44, height: 44, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: openSans, fontWeight: 800, fontSize: 20
            }}>B</div>
            <div>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.7, margin: "0 0 4px", fontWeight: 600 }}>Card B</p>
              <h3 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 20, margin: "0 0 8px", color: "white" }}>The Anchor</h3>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0, lineHeight: 1.55 }}>
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
            backgroundColor: "white", borderRadius: 16, padding: "18px 20px",
            marginBottom: 10, border: "1px solid #E8E8E8",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                backgroundColor: green, color: "white",
                borderRadius: "50%", width: 44, height: 44, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: openSans, fontWeight: 800, fontSize: 20
              }}>{card.letter}</div>
              <div>
                <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#888", margin: "0 0 4px", fontWeight: 600 }}>Card {card.letter}</p>
                <h3 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 18, color: navy, margin: "0 0 6px" }}>{card.name}</h3>
                <p style={{ fontSize: 14, color: "#555", margin: 0, lineHeight: 1.55 }}>{card.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buy Section */}
      <div style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>

        {/* Single Card */}
        <div style={{
          backgroundColor: "white", borderRadius: 16, padding: "22px",
          textAlign: "center", marginBottom: 12,
          border: "1px solid #E8E8E8", boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
        }}>
          <p style={{ color: "#888", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Single Card</p>
          <p style={{ fontFamily: openSans, fontWeight: 800, fontSize: 38, color: green, margin: "0 0 16px" }}>$8.99</p>
          <a
            href="https://recyclish.com/products/mobi-tag"
            style={{
              display: "block", backgroundColor: blue, color: "white",
              padding: "15px", borderRadius: 12, fontSize: 16,
              textDecoration: "none", fontFamily: openSans, fontWeight: 700, letterSpacing: 0.3
            }}
          >
            Get Your Card
          </a>
        </div>

        {/* Bundle */}
        <div style={{
          backgroundColor: navy, borderRadius: 16, padding: "22px",
          textAlign: "center", color: "white"
        }}>
          <p style={{ fontSize: 11, opacity: 0.7, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
            Full Collectors Set - Best Value
          </p>
          <p style={{ fontFamily: openSans, fontWeight: 800, fontSize: 38, margin: "0 0 4px" }}>$24.99</p>
          <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 18px" }}>All 4 cards - A, B, C and D</p>
          <a
            href="https://recyclish.com/products/mobi-tag-bundle"
            style={{
              display: "block", backgroundColor: blue, color: "white",
              padding: "15px", borderRadius: 12, fontSize: 16,
              textDecoration: "none", fontFamily: openSans, fontWeight: 700, letterSpacing: 0.3
            }}
          >
            Get the Full Set
          </a>
        </div>
      </div>

      {/* Mission */}
      <div style={{ padding: "20px 20px 60px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ borderTop: "2px solid #E8E8E8", paddingTop: 28 }}>
          <span style={{ fontSize: 32 }}>🐾</span>
          <h3 style={{ fontFamily: openSans, fontWeight: 800, fontSize: 18, color: navy, margin: "12px 0 10px" }}>
            Every Tag Helps a Dog Find Home
          </h3>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, margin: "0 0 14px" }}>
            A portion of every Mobi Tag sale supports dog rescue.
            Because the best things in life find you when you are not looking.
          </p>
          <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>
            recyclish.com - Turning Knowledge into Action
          </p>
        </div>
      </div>

    </div>
  );
}
