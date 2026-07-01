export const CATEGORIES = [
  'database', 'hosting', 'auth', 'email', 'monitoring',
  'ci-cd', 'payments', 'ai', 'testing', 'storage',
] as const

export type Category = typeof CATEGORIES[number]

export interface Company {
  id: string
  name: string
  email: string
  website: string | null
  logo_url: string | null
  stripe_customer_id: string | null
  approved_at: string | null
  created_at: string
}

export interface Deal {
  id: string
  company_id: string
  title: string
  description: string
  category: Category
  tags: string[]
  value_description: string
  landing_url: string
  cost_per_claim: number
  budget_cap: number | null
  is_active: boolean
  is_featured: boolean
  submitted_at: string
  approved_at: string | null
  expires_at: string | null
  companies?: { name: string; logo_url: string | null }
}

export interface Claim {
  id: string
  deal_id: string
  claimed_at: string
  redirected_at: string | null
  charged_at: string | null
  amount_charged: number | null
}

// Shape returned by GET /api/discounts — consumed by the MCP server
export interface ApiDiscount {
  id: string
  company: string
  title: string
  description: string
  category: Category
  tags: string[]
  discount_value: string
  tracking_url: string
  is_featured: boolean
  expires_at: string | null
}
