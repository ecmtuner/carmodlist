import Link from 'next/link'

const sampleBuilds = [
  {
    id: '1',
    username: 'bmwfanatic',
    title: 'F80 M3 Stage 2 Build',
    year: 2018,
    make: 'BMW',
    model: 'M3',
    hpStock: 425,
    hpTuned: 520,
    totalCost: 14500,
    mods: 12,
    likes: 47,
    fuel: 'E30',
  },
  {
    id: '2',
    username: 'porschepete',
    title: 'GT3 RS Track Weapon',
    year: 2022,
    make: 'Porsche',
    model: '911 GT3 RS',
    hpStock: 518,
    hpTuned: 518,
    totalCost: 32000,
    mods: 8,
    likes: 93,
    fuel: 'Pump',
  },
  {
    id: '3',
    username: 'mbahammar',
    title: 'C63 AMG Daily Warrior',
    year: 2020,
    make: 'Mercedes',
    model: 'C63 AMG',
    hpStock: 469,
    hpTuned: 580,
    totalCost: 18200,
    mods: 15,
    likes: 61,
    fuel: 'E40',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-red-500">🔧</span> CarModList
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/discover" className="text-gray-400 hover:text-white transition-colors text-sm">
            Discover
          </Link>
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 text-red-400 px-4 py-1.5 rounded-full text-sm mb-6">
          🔧 Built for car enthusiasts
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Your car build.{' '}
          <span className="text-red-500">Shared.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Log every mod, share your build, discover what others are running.
          The PCPartPicker for your car.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition-colors"
          >
            Start Your Build →
          </Link>
          <Link
            href="/discover"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 px-8 py-4 rounded-xl text-lg font-medium transition-colors"
          >
            Browse Builds
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to track your build</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '📋',
              title: 'Build Tracker',
              desc: 'Log every mod with details: brand, vendor, price, install date. Never forget what you ran.'
            },
            {
              icon: '🔗',
              title: 'Shareable Page',
              desc: 'Your build gets a public URL. Share it on Instagram, forums, or with your tuner.'
            },
            {
              icon: '🏁',
              title: 'Community Discover',
              desc: "Browse builds by make, sort by most liked or most expensive. Get inspired."
            },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Add your car', desc: 'Enter your year, make, model, and baseline specs.' },
              { step: '02', title: 'Log your mods', desc: 'Add every part, tune, and upgrade with full details.' },
              { step: '03', title: 'Share your link', desc: 'Get a public page at carmodlist.com/you/your-build.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-5xl font-black text-red-600/30 mb-3">{s.step}</div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Builds */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Recent Builds</h2>
        <p className="text-gray-400 text-center mb-12">See what the community is building</p>
        <div className="grid md:grid-cols-3 gap-6">
          {sampleBuilds.map((build) => (
            <div key={build.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">{build.title}</h3>
                  <p className="text-gray-400 text-sm">{build.year} {build.make} {build.model}</p>
                </div>
                <span className="bg-red-600/20 text-red-400 text-xs px-2 py-1 rounded-lg">{build.fuel}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{build.hpStock}</div>
                  <div className="text-xs text-gray-500">Stock HP</div>
                </div>
                <div className="text-red-500 text-xl">→</div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{build.hpTuned}</div>
                  <div className="text-xs text-gray-500">Tuned HP</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-800">
                <span>{build.mods} mods</span>
                <span>${build.totalCost.toLocaleString()}</span>
                <span>❤️ {build.likes}</span>
              </div>
              <div className="mt-3 text-xs text-gray-500">@{build.username}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-4xl font-black mb-4">Ready to build your list?</h2>
        <p className="text-gray-400 mb-8">Free forever. No credit card required.</p>
        <Link
          href="/signup"
          className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-xl text-lg font-bold transition-colors inline-block"
        >
          Start Your Build — It's Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm">
        <p>
          Built for car enthusiasts by{' '}
          <a href="https://ecmtuner.com" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
            ECMTuner
          </a>
        </p>
        <p className="mt-2">© {new Date().getFullYear()} CarModList. All rights reserved.</p>
      </footer>
    </div>
  )
}
