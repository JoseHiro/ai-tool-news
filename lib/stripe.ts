import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.NODE_ENV === 'development'
      ? (process.env.STRIPE_TEST_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY)
      : process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
  }
  return _stripe
}

export function getBaseUrl(req: Request): string {
  const url = new URL(req.url)
  return `${url.protocol}//${url.host}`
}
