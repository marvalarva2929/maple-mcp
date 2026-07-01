import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getDiscounts } from '../lib/api.js'

export function registerListCategories(server: McpServer) {
  server.tool(
    'list_categories',
    'List all available discount categories and how many deals are in each',
    {},
    async () => {
      const discounts = await getDiscounts()
      const counts: Record<string, number> = {}
      for (const d of discounts) {
        counts[d.category] = (counts[d.category] ?? 0) + 1
      }

      const categories = [...new Set(discounts.map(d => d.category))].sort()
      const lines = categories.map(cat => {
        const count = counts[cat] ?? 0
        return `• ${cat} (${count} deal${count !== 1 ? 's' : ''})`
      })

      return {
        content: [{
          type: 'text',
          text: `Available discount categories:\n\n${lines.join('\n')}\n\nUse search_discounts or get_recommendations to find deals.`,
        }],
      }
    }
  )
}
