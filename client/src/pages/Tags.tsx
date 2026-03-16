export default function Tags() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#2D6A27] text-white px-6 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-5xl mb-4">🐾</div>
          <h1 className="text-3xl font-bold mb-3">You're holding something rare.</h1>
          <p className="text-lg opacity-90">The Mobi Tag™ Collector's Edition</p>
          <p className="text-sm opacity-75 mt-1">4 cards. 1 mission. Your move.</p>
        </div>
      </div>

      {/* Cards */}
      <div className="px-6 py-10 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Meet the Series</h2>

        {/* Card B — lead emotionally */}
        <div className="bg-[#2D6A27] text-white rounded-2xl p-6 mb-4 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white text-[#2D6A27] rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">B</div>
            <div>
              <p className="text-xs uppercase tracking-wider opacity-75 mb-1">Card B</p>
              <h3 className="text-xl font-bold mb-2">The Anchor</h3>
              <p className="opacity-90 text-sm">When everything pulls you off course, this is what holds.</p>
            </div>
          </div>
        </div>

        {[
          { letter: "A", name: "The Signal", desc: "You were built to stand out. Act like it." },
          { letter: "C", name: "The Conviction", desc: "The world changes when you stop asking for permission." },
          { letter: "D", name: "The Badge", desc: "You earned this. Wear it." },
        ].map((card) => (
          <div key={card.letter} className="bg-gray-50 rounded-2xl p-5 mb-3 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-[#2D6A27] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">{card.letter}</div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Card {card.letter}</p>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{card.name}</h3>
                <p className="text-gray-600 text-sm">{card.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buy Section */}
      <div className="px-6 pb-6 max-w-md mx-auto">
        <div className="bg-gray-50 rounded-2xl p-6 mb-4 text-center">
          <p className="text-gray-500 text-sm mb-1">Single Card</p>
          <p className="text-3xl font-bold text-gray-900 mb-4">$8.99</p>
          <a href="https://recyclish.com/products/mobi-tag" className="block bg-[#2D6A27] text-white text-center py-4 rounded-xl font-bold text-lg">Get Your Card</a>
        </div>
        <div className="bg-[#2D6A27] rounded-2xl p-6 text-center text-white">
          <p className="text-green-200 text-sm mb-1">Full Collector's Set — Best Value</p>
          <p className="text-3xl font-bold mb-1">$24.99</p>
          <p className="text-green-200 text-sm mb-4">All 4 cards — A, B, C &amp; D</p>
          <a href="https://recyclish.com/products/mobi-tag-bundle" className="block bg-white text-[#2D6A27] text-center py-4 rounded-xl font-bold text-lg">Get the Full Set</a>
        </div>
      </div>

      {/* Mission */}
      <div className="px-6 pb-12 max-w-md mx-auto">
        <div className="border-t border-gray-100 pt-8 text-center">
          <h3 className="font-bold text-gray-800 mb-2">Every Tag Helps a Dog Find Home</h3>
          <p className="text-gray-600 text-sm leading-relaxed">A portion of every Mobi Tag sale supports dog rescue. Because the best things in life find you when you're not looking.</p>
          <p className="mt-4 text-xs text-gray-400">recyclish.com · Built for good.</p>
        </div>
      </div>
    </div>
  );
}
