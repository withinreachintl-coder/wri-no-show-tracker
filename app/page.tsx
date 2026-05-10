export default function HomePage() {
  const buyLink =
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK &&
    !process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK.startsWith('__')
      ? process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK
      : '/login'

  return (
    <main className="min-h-screen bg-stone-900">
      <section className="px-6 pt-20 pb-16 max-w-3xl mx-auto text-center">
        <h1 className="font-playfair text-4xl md:text-6xl font-bold text-stone-100 mb-6 leading-tight">
          Track no-shows.
          <br />
          In one tap.
        </h1>
        <p className="font-dmsans text-base md:text-lg text-stone-300 mb-10 max-w-xl mx-auto">
          A pocket-sized log for restaurant managers. No-shows, lates, and walk-offs — captured in
          seconds, sortable forever.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/login"
            className="font-dmsans text-base font-semibold text-stone-900 bg-amber-600 rounded-lg px-8 py-4 inline-block min-h-[44px]"
          >
            Start free
          </a>
          <a
            href="#pricing"
            className="font-dmsans text-base font-semibold text-stone-100 border border-stone-700 rounded-lg px-8 py-4 inline-block min-h-[44px]"
          >
            See pricing
          </a>
        </div>
        <p className="font-dmsans text-sm text-stone-500 mt-4">
          10 free incidents. No card to start.
        </p>
      </section>

      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-stone-50 rounded-lg p-6">
            <div className="font-playfair text-2xl text-stone-900 font-bold mb-2">3 taps</div>
            <p className="font-dmsans text-sm text-stone-900">
              Pick the worker, pick the type, save. Designed for the back of the house.
            </p>
          </div>
          <div className="bg-stone-50 rounded-lg p-6">
            <div className="font-playfair text-2xl text-stone-900 font-bold mb-2">Per-worker counts</div>
            <p className="font-dmsans text-sm text-stone-900">
              See exactly how many times each worker has called out — over any range.
            </p>
          </div>
          <div className="bg-stone-50 rounded-lg p-6">
            <div className="font-playfair text-2xl text-stone-900 font-bold mb-2">Defensible</div>
            <p className="font-dmsans text-sm text-stone-900">
              Time-stamped, audit-ready record. The next conversation has receipts.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-16 max-w-3xl mx-auto text-center">
        <h2 className="font-playfair text-3xl font-bold text-stone-100 mb-2">Simple pricing</h2>
        <p className="font-dmsans text-base text-stone-400 mb-10">
          Free to start. Upgrade when you need more than 10 incidents.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
          <div className="bg-stone-50 rounded-lg p-8 text-left">
            <div className="font-playfair text-xl font-bold text-stone-900 mb-2">Free</div>
            <div className="font-dmsans text-3xl font-bold text-stone-900 mb-4">$0</div>
            <ul className="font-dmsans text-sm text-stone-900 space-y-2">
              <li>· 10 lifetime incidents</li>
              <li>· Unlimited workers</li>
              <li>· Full history view</li>
            </ul>
          </div>
          <div className="bg-amber-600 rounded-lg p-8 text-left">
            <div className="font-playfair text-xl font-bold text-stone-900 mb-2">Paid</div>
            <div className="font-dmsans text-3xl font-bold text-stone-900 mb-1">$19</div>
            <div className="font-dmsans text-sm text-stone-900 mb-4">/month · 14-day trial</div>
            <ul className="font-dmsans text-sm text-stone-900 space-y-2 mb-6">
              <li>· Unlimited incidents</li>
              <li>· Unlimited workers</li>
              <li>· Cancel anytime</li>
            </ul>
            <a
              href={buyLink}
              className="font-dmsans text-sm font-semibold text-amber-600 bg-stone-900 rounded px-6 py-3 inline-block min-h-[44px]"
            >
              Start trial
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
