import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PRODUCT_TOOLS, callProductTool } from './tools/products.js';
import { ORDER_TOOLS, callOrderTool } from './tools/orders.js';
import { ASSET_TOOLS, callAssetTool } from './tools/assets.js';
import { DESIGN_RULES } from './rules/design-rules.js';
import { SCHEMA_REFERENCE } from './rules/schema-reference.js';

const ALL_TOOLS = [...PRODUCT_TOOLS, ...ORDER_TOOLS, ...ASSET_TOOLS];

const server = new Server(
  { name: 'chamevo-mcp', version: '0.1.0' },
  { capabilities: { tools: {}, prompts: {}, resources: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: ALL_TOOLS }));

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    { name: 'design-rules', description: 'Chamevo product/view/element composition conventions and best practices' },
  ],
}));

server.setRequestHandler(GetPromptRequestSchema, async (req) => {
  if (req.params.name === 'design-rules') {
    return { messages: [{ role: 'user' as const, content: { type: 'text' as const, text: DESIGN_RULES } }] };
  }
  throw new Error(`Unknown prompt: ${req.params.name}`);
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'chamevo://schema',
      name: 'Chamevo Data Schema Reference',
      mimeType: 'text/markdown',
      description: 'Type definitions for CVProduct, CVView, CVElementData, ElementType, and all parameter types',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  if (req.params.uri === 'chamevo://schema') {
    return { contents: [{ uri: 'chamevo://schema', mimeType: 'text/markdown', text: SCHEMA_REFERENCE }] };
  }
  throw new Error(`Unknown resource: ${req.params.uri}`);
});

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
