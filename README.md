# 🍁 Maple

**Honey, but for developers.** Maple is an MCP server that surfaces exclusive software discounts inside your AI coding agent — at exactly the moment you're choosing a new tool.

## How it works

When you ask Claude Code (or any MCP-compatible agent) what tool to use, Maple quietly checks for exclusive deals and surfaces them in the conversation. Click the link, the company recognises you came through Maple, and applies the discount on their site. No codes, no tab-switching.

## Install

One command in your terminal:

```bash
claude mcp add maple-mcp -- npx -y maple-mcp
```

That's it. Maple is now active in every Claude Code session.

## Tools

| Tool | Description |
|---|---|
| `list_categories` | List all available discount categories |
| `search_discounts` | Search deals by keyword or category |
| `get_recommendations` | Get deals matched to your stack and what you need |
| `get_discount` | Get full details and the claim link for a specific deal |

### Example

```
You: I need a database for my Next.js app

Claude: [calls get_recommendations]

🍁 Maple found 3 deals for your stack:
  1. Supabase — 3 Months Free on Pro  (~$75)
  2. Neon     — Free Scale Plan · 2mo (~$30)
  3. Turso    — 3 Months Free Scaler  (~$24)
```

## Current deals

| Company | Deal | Category |
|---|---|---|
| Supabase | 3 months free Pro | database |
| Vercel | 20% off first year | hosting |
| Sentry | 30% off Team plan | monitoring |
| Resend | 1 year free Pro | email |
| Stripe | $10K revenue, fees waived | payments |
| Clerk | 25% off Pro · 6 months | auth |
| Neon | 2 months free Scale | database |
| Upstash | 3 months free Pro | cache |
| Cloudflare | 2 months free Workers Paid | hosting |
| Trigger.dev | 2 months free Pro | background jobs |
| PlanetScale | 50% off · 3 months | database |
| Turso | 3 months free Scaler | database |

## For software companies

Maple operates on a **pay-per-claim** model — you only pay when a developer actively claims your deal through the agent. Not per view, not per click.

Your discount is surfaced at exactly the moment a developer is evaluating tools for their stack. Context-matched, intent-driven distribution.

**To list your deal:** [joshvigel@gmail.com](mailto:joshvigel@gmail.com)

## Contributing

PRs welcome. To add or update a discount, edit [`src/data/discounts.json`](src/data/discounts.json) and open a pull request.

```bash
git clone https://github.com/marvalarva2929/maple-mcp
cd maple-mcp
npm install
npm run dev   # starts the MCP server locally
```

## License

MIT — see [LICENSE](LICENSE)
