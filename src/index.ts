import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { PRODUCT_TOOLS, callProductTool } from './tools/products.js';
import { ORDER_TOOLS, callOrderTool } from './tools/orders.js';
import { ASSET_TOOLS, callAssetTool } from './tools/assets.js';

const ALL_TOOLS = [...PRODUCT_TOOLS, ...ORDER_TOOLS, ...ASSET_TOOLS];

const server = new Server(
  { name: 'chamevo-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: ALL_TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let result: unknown;

    if (PRODUCT_TOOLS.some((t) => t.name === name)) {
      result = await callProductTool(name, args as Record<string, unknown>);
    } else if (ORDER_TOOLS.some((t) => t.name === name)) {
      result = await callOrderTool(name, args as Record<string, unknown>);
    } else if (ASSET_TOOLS.some((t) => t.name === name)) {
      result = await callAssetTool(name, args as Record<string, unknown>);
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error starting chamevo-mcp server:', error);
  process.exit(1);
});
