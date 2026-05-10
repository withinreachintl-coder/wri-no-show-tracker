'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-stone-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-2xl font-bold text-stone-900 mx-auto mb-4">
            ⏱
          </div>
          <h1 className="font-playfair text-3xl font-bold text-stone-100 mb-2">No-Show Tracker</h1>
          <p className="font-dmsans text-sm text-amber-600">Manager sign in</p>
        </div>

        {!sent ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <form onSubmit={handleLogin}>
              <label className="block font-dmsans text-sm font-medium text-stone-100 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@restaurant.com"
                className="w-full font-dmsans text-sm text-stone-100 bg-white/5 border border-white/10 rounded px-4 py-3 mb-5 outline-none focus:border-amber-600 min-h-[44px]"
              />
              {error && (
                <p className="font-dmsans text-sm text-red-400 mb-4">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full font-dmsans text-sm font-semibold text-stone-900 bg-amber-600 disabled:bg-stone-600 rounded py-3 min-h-[44px] disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-10 text-center">
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="font-playfair text-xl font-bold text-stone-100 mb-2">Check your email</h2>
            <p className="font-dmsans text-sm text-stone-100 mb-6">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <button
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              className="font-dmsans text-sm text-amber-600 bg-transparent border-0 cursor-pointer min-h-[44px]"
            >
              ← Use a different email
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
