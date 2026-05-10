import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('__')) {
    throw new Error('STRIPE_SECRET_KEY not configured')
  }
  _stripe = new Stripe(key)
  return _stripe
}

export function getWebhookSecret(): string {
  const s = process.env.STRIPE_WEBHOOK_SECRET
  if (!s || s.startsWith('__')) throw new Error('STRIPE_WEBHOOK_SECRET not configured')
  return s
}
