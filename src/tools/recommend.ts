import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import data from "../data/discounts.json" with { type: "json" };

type Discount = (typeof data.discounts)[number];

function scoreDiscount(d: Discount, terms: string[]): number {
  return terms.reduce((score, term) => {
    const t = term.toLowerCase();
    const tagHit = d.tags.filter((tag) => tag.toLowerCase().includes(t) || t.includes(tag.toLowerCase())).length;
    const titleHit = d.title.toLowerCase().includes(t) ? 1 : 0;
    const companyHit = d.company.toLowerCase().includes(t) ? 1 : 0;
    return score + tagHit * 2 + titleHit + companyHit;
  }, 0);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function registerGetRecommendations(server: McpServer) {
  server.tool(
    "get_recommendations",
    "Get tool recommendations with exclusive discounts based on your project stack and what you need to solve",
    {
      stack: z
        .string()
        .describe("Your tech stack, e.g. 'Next.js, TypeScript, PostgreSQL' or 'React Native, Expo'"),
      problem: z
        .string()
        .describe("What you need, e.g. 'need user authentication', 'want to send transactional emails', 'need a database'"),
    },
    async ({ stack, problem }) => {
      const terms = [...tokenize(stack), ...tokenize(problem)];

      const scored = (data.discounts as Discount[])
        .map((d) => ({ discount: d, score: scoreDiscount(d, terms) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      if (scored.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No strong matches found for your stack. Try search_discounts with a keyword, or list_categories to browse everything.",
            },
          ],
        };
      }

      const lines = scored.map(({ discount: d, score }) => {
        const relevance = score >= 6 ? "Strong match" : score >= 3 ? "Good match" : "Relevant";
        return [
          `**${d.company}** — ${d.title} [${relevance}]`,
          `  ID: ${d.id}`,
          `  Discount: ${d.discount_value}`,
          `  ${d.description.slice(0, 120)}...`,
        ].join("\n");
      });

      return {
        content: [
          {
            type: "text",
            text: `Top ${scored.length} recommendations for your project:\n\n${lines.join("\n\n")}\n\nUse get_discount with an ID to claim any of these deals.`,
          },
        ],
      };
    }
  );
}
