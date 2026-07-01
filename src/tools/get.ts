import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import data from "../data/discounts.json" with { type: "json" };
import { logClaim } from "../lib/claims.js";

export function registerGetDiscount(server: McpServer) {
  server.tool(
    "get_discount",
    "Get full details and the claim link for a specific discount. Calling this logs a claim.",
    {
      discount_id: z
        .string()
        .describe("The discount ID from search_discounts or get_recommendations, e.g. 'supabase-3mo-free'"),
    },
    async ({ discount_id }) => {
      const discount = data.discounts.find((d) => d.id === discount_id);

      if (!discount) {
        const ids = data.discounts.map((d) => d.id).join(", ");
        return {
          content: [
            {
              type: "text",
              text: `Discount '${discount_id}' not found. Available IDs: ${ids}`,
            },
          ],
        };
      }

      await logClaim(discount_id);

      const lines = [
        `## ${discount.company} — ${discount.title}`,
        "",
        discount.description,
        "",
        `**Discount:** ${discount.discount_value}`,
        `**Category:** ${discount.category}`,
        discount.expires_at ? `**Expires:** ${discount.expires_at}` : "**Expires:** Never",
        "",
        `**Claim this deal:** ${discount.tracking_url}`,
        "",
        `Click that link — ${discount.company} will recognise you came through Maple and apply the deal automatically on their site.`,
        "",
        `_Brought to you by Maple — exclusive developer discounts inside your coding agent._`,
      ];

      return {
        content: [
          {
            type: "text",
            text: lines.join("\n"),
          },
        ],
      };
    }
  );
}
