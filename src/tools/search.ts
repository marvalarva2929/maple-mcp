import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getDiscounts, type Discount } from '../lib/api.js'

function matches(d: Discount, query: string): boolean {
  const q = query.toLowerCase()
  return (
    d.company.toLowerCase().includes(q) ||
    d.title.toLowerCase().includes(q) ||
    d.description.toLowerCase().includes(q) ||
    d.tags.some(t => t.toLowerCase().includes(q))
  )
}

function format(d: Discount): string {
  return [
    `**${d.company}** — ${d.title}`,
    `  ID: ${d.id}`,
    `  Category: ${d.category}`,
    `  Discount: ${d.discount_value}`,
    `  ${d.description.slice(0, 100)}...`,
  ].join('\n')
}

export function registerSearchDiscounts(server: McpServer) {
  server.tool(
    'search_discounts',
    'Search for developer tool discounts by keyword or category',
    {
      query: z.string().optional().describe("Search term, e.g. 'postgres', 'email', 'monitoring'"),
      category: z.string().optional().describe('Filter by category'),
    },
    async ({ query, category }) => {
      let results = await getDiscounts()

      if (category) results = results.filter(d => d.category === category)
      if (query) results = results.filter(d => matches(d, query))

      if (!results.length) {
        return { content: [{ type: 'text', text: 'No discounts found. Try list_categories to see what\'s available.' }] }
      }

      return {
        content: [{
          type: 'text',
          text: `Found ${results.length} discount${results.length !== 1 ? 's' : ''}:\n\n${results.map(format).join('\n\n')}\n\nUse get_discount with an ID to claim a deal.`,
        }],
      }
    }
  )
}
