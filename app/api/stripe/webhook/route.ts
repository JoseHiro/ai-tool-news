import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { updateSubscription, getUserByStripeCustomerId, expireSubscription } from '@/lib/users'

// Stripe requires the raw body for signature verification
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret) {
    return Response.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = parseInt(session.metadata?.userId ?? '')
        if (!userId) break

        const subscription = await getStripe().subscriptions.retrieve(session.subscription as string, {
          expand: ['items'],
        })
        const periodEnd = subscription.items.data[0]?.current_period_end
          ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
        await updateSubscription(
          userId,
          session.customer as string,
          subscription.id,
          new Date(periodEnd * 1000),
        )
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const user = await getUserByStripeCustomerId(subscription.customer as string)
        if (!user) break

        const periodEnd = subscription.items.data[0]?.current_period_end
          ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
        await updateSubscription(
          user.id,
          subscription.customer as string,
          subscription.id,
          new Date(periodEnd * 1000),
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const user = await getUserByStripeCustomerId(subscription.customer as string)
        if (!user) break

        await expireSubscription(user.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error(`[stripe] payment failed — customer: ${invoice.customer}, invoice: ${invoice.id}`)
        break
      }
    }
  } catch (e) {
    console.error('Webhook handler error:', e)
    return Response.json({ error: 'Handler failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}
