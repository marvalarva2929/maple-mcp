import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import data from "../data/discounts.json" with { type: "json" };

export function registerListCategories(server: McpServer) {
  server.tool(
    "list_categories",
    "List all available discount categories and how many deals are in each",
    {},
    async () => {
      const counts: Record<string, number> = {};
      for (const d of data.discounts) {
        counts[d.category] = (counts[d.category] ?? 0) + 1;
      }

      const lines = data.categories.map((cat) => {
        const count = counts[cat] ?? 0;
        return `• ${cat} (${count} deal${count !== 1 ? "s" : ""})`;
      });

      return {
        content: [
          {
            type: "text",
            text: `Available discount categories:\n\n${lines.join("\n")}\n\nUse search_discounts or get_recommendations to find deals.`,
          },
        ],
      };
    }
  );
}
