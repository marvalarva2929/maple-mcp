import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import data from "../data/discounts.json" with { type: "json" };

type Discount = (typeof data.discounts)[number];

function matches(d: Discount, query: string): boolean {
  const q = query.toLowerCase();
  return (
    d.company.toLowerCase().includes(q) ||
    d.title.toLowerCase().includes(q) ||
    d.description.toLowerCase().includes(q) ||
    d.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function formatDiscount(d: Discount): string {
  return [
    `**${d.company}** — ${d.title}`,
    `  ID: ${d.id}`,
    `  Category: ${d.category}`,
    `  Discount: ${d.discount_value}`,
    `  ${d.description.slice(0, 100)}...`,
  ].join("\n");
}

export function registerSearchDiscounts(server: McpServer) {
  server.tool(
    "search_discounts",
    "Search for developer tool discounts by keyword or category",
    {
      query: z.string().optional().describe("Search term, e.g. 'postgres', 'email', 'monitoring'"),
      category: z
        .enum([
          "database",
          "hosting",
          "auth",
          "email",
          "monitoring",
          "ci-cd",
          "payments",
          "ai",
          "testing",
          "storage",
        ])
        .optional()
        .describe("Filter by category"),
    },
    async ({ query, category }) => {
      let results = data.discounts as Discount[];

      if (category) {
        results = results.filter((d) => d.category === category);
      }

      if (query) {
        results = results.filter((d) => matches(d, query));
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No discounts found matching your search. Try list_categories to see what's available.",
            },
          ],
        };
      }

      const formatted = results.map(formatDiscount).join("\n\n");
      return {
        content: [
          {
            type: "text",
            text: `Found ${results.length} discount${results.length !== 1 ? "s" : ""}:\n\n${formatted}\n\nUse get_discount with an ID to claim a deal.`,
          },
        ],
      };
    }
  );
}
