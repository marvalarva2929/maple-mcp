import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getDiscounts, type Discount } from '../lib/api.js'

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(t => t.length > 2)
}

function score(d: Discount, terms: string[]): number {
  return terms.reduce((n, term) => {
    const tagHits = d.tags.filter(t => t.includes(term) || term.includes(t)).length
    const titleHit = d.title.toLowerCase().includes(term) ? 1 : 0
    const companyHit = d.company.toLowerCase().includes(term) ? 1 : 0
    return n + tagHits * 2 + titleHit + companyHit
  }, 0)
}

export function registerGetRecommendations(server: McpServer) {
  server.tool(
    'get_recommendations',
    'Get tool recommendations with exclusive discounts based on your project stack and what you need to solve',
    {
      stack: z.string().describe("Your tech stack, e.g. 'Next.js, TypeScript, PostgreSQL'"),
      problem: z.string().describe("What you need, e.g. 'need user authentication', 'want to send transactional emails'"),
    },
    async ({ stack, problem }) => {
      const discounts = await getDiscounts()
      const terms = [...tokenize(stack), ...tokenize(problem)]

      const ranked = discounts
        .map(d => ({ d, s: score(d, terms) }))
        .filter(({ s }) => s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 5)

      if (!ranked.length) {
        return { content: [{ type: 'text', text: 'No strong matches found. Try search_discounts with a keyword, or list_categories to browse everything.' }] }
      }

      const lines = ranked.map(({ d, s }) => {
        const relevance = s >= 6 ? 'Strong match' : s >= 3 ? 'Good match' : 'Relevant'
        return [
          `**${d.company}** — ${d.title} [${relevance}]`,
          `  ID: ${d.id}`,
          `  Discount: ${d.discount_value}`,
          `  ${d.description.slice(0, 120)}...`,
        ].join('\n')
      })

      return {
        content: [{
          type: 'text',
          text: `Top ${ranked.length} recommendations for your project:\n\n${lines.join('\n\n')}\n\nUse get_discount with an ID to claim any of these deals.`,
        }],
      }
    }
  )
}
