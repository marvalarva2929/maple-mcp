import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListCategories } from "./tools/categories.js";
import { registerSearchDiscounts } from "./tools/search.js";
import { registerGetRecommendations } from "./tools/recommend.js";
import { registerGetDiscount } from "./tools/get.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "maple",
    version: "0.1.0",
  });

  registerListCategories(server);
  registerSearchDiscounts(server);
  registerGetRecommendations(server);
  registerGetDiscount(server);

  return server;
}
