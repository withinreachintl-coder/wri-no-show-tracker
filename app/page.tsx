export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-900 px-6 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-stone-100 mb-4">
          No-Show Tracker
        </h1>
        <p className="font-dmsans text-base text-stone-300 mb-10">
          Track no-shows, lates, and walk-offs in one tap. Coming live at tracker.wireach.tools.
        </p>
        <a
          href="/login"
          className="font-dmsans text-sm font-semibold text-stone-900 bg-amber-600 rounded px-6 py-3 inline-block min-h-[44px]"
        >
          Sign in
        </a>
      </div>
    </main>
  )
}
