import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe, getWebhookSecret } from '../../../../lib/stripe'
import { getAdminClient } from '../../../../lib/supabase-server'

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'no signature' }, { status: 400 })
  const body = await request.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, getWebhookSecret())
  } catch (err) {
    console.error(
      '[stripe/webhook] sig verify failed:',
      err instanceof Error ? err.message : String(err)
    )
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const admin = getAdminClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.client_reference_id
      if (orgId) {
        await admin
          .from('organizations')
          .update({
            subscription_tier: 'paid',
            subscription_status: 'active',
            stripe_customer_id:
              typeof session.customer === 'string' ? session.customer : null,
            stripe_subscription_id:
              typeof session.subscription === 'string' ? session.subscription : null,
          })
          .eq('id', orgId)
        console.log('[stripe/webhook] flipped org to paid:', orgId)
      } else {
        console.warn('[stripe/webhook] checkout.session.completed missing client_reference_id')
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      await admin
        .from('organizations')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
          subscription_end_date: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      console.log('[stripe/webhook] flipped org to free for sub:', sub.id)
    }
  } catch (err) {
    console.error(
      '[stripe/webhook] handler error:',
      err instanceof Error ? err.message : String(err)
    )
    return NextResponse.json({ error: 'handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
