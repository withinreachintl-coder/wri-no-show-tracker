export default function HomePage() {
  const buyLink =
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK &&
    !process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK.startsWith('__')
      ? process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK
      : '/login'

  const steps = [
    {
      title: 'Pick the worker',
      desc: 'Tap the name on your active roster. No lookups, no scrolling lists of inactive staff.',
    },
    {
      title: 'Tap the type',
      desc: 'No-show, late, or left early. Three buttons. Make the call in under a second.',
    },
    {
      title: 'Save the record',
      desc: 'Add a note if you need to, hit save, get on with service. Time-stamped, defensible, kept forever.',
    },
  ]

  const planFeatures = [
    'Unlimited incidents',
    'Unlimited workers',
    'Full history view',
    'CSV-ready records',
    'Cancel anytime',
  ]

  const mockRows = [
    { name: 'Maria S.', type: 'No-show', when: '2 days ago' },
    { name: 'Carlos R.', type: 'Late', when: '5 days ago' },
    { name: 'Devon T.', type: 'Left early', when: '1 week ago' },
    { name: 'Maria S.', type: 'No-show', when: '1 week ago' },
  ]

  return (
    <main className="bg-stone-900 text-[#F5F0E8] font-dmsans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-stone-900/95 backdrop-blur-[10px]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-600 rounded-md flex items-center justify-center text-base text-white">
            ✓
          </div>
          <span className="font-playfair text-lg font-bold">No-Show Tracker</span>
        </div>
        <a
          href="/login"
          className="border border-[#F5F0E8] py-2 px-5 rounded-md text-[#F5F0E8] text-[15px] min-h-[44px] inline-flex items-center"
        >
          Sign In
        </a>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 max-w-3xl mx-auto">
        <p className="text-amber-600 text-xs font-semibold tracking-[0.12em] uppercase mb-6">
          For Restaurant Managers
        </p>
        <h1 className="font-playfair text-[clamp(32px,7vw,52px)] leading-[1.1] font-bold mb-6">
          Stop guessing{' '}
          <span className="text-amber-600">who&apos;s calling out.</span>
        </h1>
        <p className="text-lg text-stone-400 leading-[1.6] mb-10 max-w-[560px]">
          Log no-shows, lates, and walk-offs in three taps. Build a defensible record so the
          next conversation has receipts — not your memory.
        </p>
      </section>

      {/* Product mockup card */}
      <section className="px-6 max-w-3xl mx-auto pb-20">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 md:p-10 min-h-[480px] md:min-h-[560px]">
          <div className="bg-stone-50 rounded-lg p-6 md:p-8 h-full">
            <div className="flex justify-between items-baseline mb-6 flex-wrap gap-2">
              <h3 className="font-playfair text-xl md:text-2xl font-bold text-stone-900">
                Recent incidents
              </h3>
              <span className="font-dmsans text-sm text-stone-900">This week</span>
            </div>
            <ul className="space-y-3">
              {mockRows.map((row, i) => (
                <li
                  key={i}
                  className="bg-white rounded-lg px-4 py-3 font-dmsans text-base text-stone-900 flex justify-between items-center gap-3 flex-wrap"
                >
                  <span>
                    <span className="font-semibold">{row.name}</span> · {row.type}
                  </span>
                  <span className="text-sm text-stone-900">{row.when}</span>
                </li>
              ))}
            </ul>
            <p className="font-dmsans text-sm text-stone-900 mt-6">
              Maria S. — <span className="font-semibold">2 incidents</span> in the last 30 days.
            </p>
          </div>
        </div>
      </section>

      {/* Primary CTA */}
      <section className="px-6 max-w-3xl mx-auto pb-20">
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={buyLink}
            className="bg-amber-600 text-white py-3.5 px-7 rounded-lg font-semibold text-base min-h-[44px] inline-flex items-center"
          >
            Start Free Trial
          </a>
          <span className="text-stone-500 text-sm font-dmsans">
            No credit card required · $19/mo after trial
          </span>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
        <p className="text-amber-600 text-xs font-semibold tracking-[0.12em] uppercase mb-4">
          How It Works
        </p>
        <h2 className="font-playfair text-4xl font-bold mb-12 leading-[1.1]">
          Built for the way restaurants actually run.
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          {steps.map((s, idx) => (
            <div key={s.title} className="bg-stone-800 rounded-xl p-7">
              <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center font-playfair text-xl text-amber-600 mb-5 font-bold">
                {idx + 1}
              </div>
              <h3 className="font-playfair text-lg font-semibold mb-3">{s.title}</h3>
              <p className="text-stone-400 text-sm leading-[1.6]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
        <p className="text-amber-600 text-xs font-semibold tracking-[0.12em] uppercase mb-4">
          Pricing
        </p>
        <h2 className="font-playfair text-4xl font-bold mb-12 leading-[1.1]">
          Simple, honest pricing.
        </h2>
        <div className="bg-stone-800 rounded-xl p-10 border border-amber-600 max-w-[420px] mx-auto">
          <p className="font-playfair text-[56px] font-bold leading-none mb-2">
            $19
            <span className="text-lg text-stone-400 font-dmsans font-normal">/mo</span>
          </p>
          <p className="text-stone-500 text-sm mb-8">
            14-day free trial. No credit card required.
          </p>
          {planFeatures.map((item) => (
            <p key={item} className="text-stone-400 text-sm mb-3">
              ✓ {item}
            </p>
          ))}
          <a
            href={buyLink}
            className="block text-center mt-8 bg-amber-600 p-3.5 rounded-lg text-white text-[15px] font-semibold min-h-[44px]"
          >
            Start Free Trial
          </a>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 px-6 text-center max-w-3xl mx-auto">
        <h2 className="font-playfair text-4xl font-bold mb-4 leading-[1.1]">
          Ready to track what your floor isn&apos;t telling you?
        </h2>
        <p className="text-stone-400 text-base mb-8">
          Start your free trial. No credit card. Cancel anytime.
        </p>
        <a
          href={buyLink}
          className="bg-amber-600 text-white py-4 px-9 rounded-lg font-semibold text-base min-h-[44px] inline-flex items-center"
        >
          Start Free Trial
        </a>
      </section>
    </main>
  )
}
