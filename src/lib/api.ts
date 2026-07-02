import discountsFallback from '../data/discounts.json' with { type: 'json' }

export interface Discount {
  id: string
  company: string
  title: string
  description: string
  category: string
  tags: string[]
  discount_value: string
  tracking_url: string
  is_featured: boolean
  expires_at: string | null
}

const API_URL = process.env.MAPLE_API_URL ?? 'https://maple-mcp.vercel.app/'

let cache: { discounts: Discount[]; fetchedAt: number } | null = null
const TTL = 10 * 60 * 1000 // 10 minutes

export async function getDiscounts(): Promise<Discount[]> {
  if (cache && Date.now() - cache.fetchedAt < TTL) {
    return cache.discounts
  }

  try {
    const res = await fetch(`${API_URL}/api/discounts`, { signal: AbortSignal.timeout(4000) })
    if (res.ok) {
      const { discounts } = await res.json()
      cache = { discounts, fetchedAt: Date.now() }
      return discounts
    }
  } catch {
    // Fall through to bundled fallback
  }

  // Fallback: bundled JSON (works offline / before API is deployed)
  return discountsFallback.discounts.map(d => ({
    id: d.id,
    company: d.company,
    title: d.title,
    description: d.description,
    category: d.category,
    tags: d.tags,
    discount_value: d.discount_value,
    tracking_url: d.tracking_url,
    is_featured: d.is_featured,
    expires_at: d.expires_at,
  }))
}

export async function logClaim(discountId: string): Promise<void> {
  try {
    await fetch(`${API_URL}/api/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discount_id: discountId }),
      signal: AbortSignal.timeout(3000),
    })
  } catch {
    // Best-effort — don't block the tool response
  }
}
