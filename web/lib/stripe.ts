import Stripe from 'stripe'

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })
  }
  return _stripe
}

export async function chargeCompany(
  stripeCustomerId: string,
  amount: number,  // in dollars
  description: string
): Promise<{ charged: boolean; chargeId?: string; error?: string }> {
  try {
    const paymentMethods = await getStripe().paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    })

    if (!paymentMethods.data.length) {
      return { charged: false, error: 'No payment method on file' }
    }

    const intent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethods.data[0].id,
      confirm: true,
      off_session: true,
      description,
    })

    return { charged: true, chargeId: intent.id }
  } catch (err) {
    return { charged: false, error: err instanceof Error ? err.message : 'Charge failed' }
  }
}

export async function createStripeCustomer(email: string, name: string): Promise<string> {
  const customer = await getStripe().customers.create({ email, name })
  return customer.id
}
