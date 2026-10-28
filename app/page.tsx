import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Full-screen background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image1.jpg')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4">
          <span className="text-2xl font-bold text-white drop-shadow">🍽 SmartX Foods</span>
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 hover:text-white border border-white/30 px-4 py-1.5 rounded-full transition-colors hover:bg-white/10"
          >
            Staff Login
          </Link>
        </nav>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 gap-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg max-w-2xl">
            Delicious food,{" "}
            <span className="text-orange-400">delivered fast</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-lg drop-shadow">
            Browse our menu and order fresh meals with cash on delivery — no account needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href="/menu"
              className="bg-orange-500 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-lg hover:bg-orange-600 transition-colors"
            >
              View Menu →
            </Link>
            <Link
              href="/login"
              className="bg-white/15 backdrop-blur text-white font-semibold text-lg px-10 py-4 rounded-2xl border border-white/30 hover:bg-white/25 transition-colors"
            >
              Staff / Manager Login
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="relative z-10 max-w-4xl mx-auto w-full px-6 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "🚀", title: "Fast Delivery", desc: "Hot food at your doorstep" },
            { icon: "💵", title: "Cash on Delivery", desc: "Pay when your order arrives" },
            { icon: "🥗", title: "Fresh Daily", desc: "Made from quality ingredients" },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 text-center text-white"
            >
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className="font-bold text-base mb-1">{title}</h3>
              <p className="text-sm text-white/70">{desc}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
