#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PRODUCT_TOOLS, callProductTool } from './tools/products.js';
import { ORDER_TOOLS, callOrderTool } from './tools/orders.js';
import { ASSET_TOOLS, callAssetTool } from './tools/assets.js';
import { CATEGORY_TOOLS, callCategoryTool } from './tools/categories.js';
import { DESIGN_CATEGORY_TOOLS, callDesignCategoryTool } from './tools/design-categories.js';
import { PRICING_RULE_TOOLS, callPricingRuleTool } from './tools/pricing-rules.js';
import { PRINT_PROFILE_TOOLS, callPrintProfileTool } from './tools/print-profiles.js';
import { USER_INTERFACE_TOOLS, callUserInterfaceTool } from './tools/user-interfaces.js';
import { SHORTCODE_ORDER_TOOLS, callShortcodeOrderTool } from './tools/shortcode-orders.js';
import { PRINT_JOB_TOOLS, callPrintJobTool } from './tools/print-jobs.js';
import { SETTINGS_TOOLS, callSettingsTool } from './tools/settings.js';
import { FONT_TOOLS, callFontTool } from './tools/fonts.js';
import { TEXT_TEMPLATE_TOOLS, callTextTemplateTool } from './tools/text-templates.js';
import { COLOR_LIBRARY_TOOLS, callColorLibraryTool } from './tools/color-library.js';
import { SYSTEM_TOOLS, callSystemTool } from './tools/system.js';
import { DESIGN_RULES } from './rules/design-rules.js';
import { SCHEMA_REFERENCE } from './rules/schema-reference.js';

type ToolHandler = (name: string, args: Record<string, unknown>) => Promise<unknown>;

/**
 * Tool registry — one entry per domain module. Each entry pairs a tool
 * definition list with the handler that dispatches its calls. To add a new
 * domain, append one entry here.
 */
const TOOL_GROUPS: Array<{ tools: Tool[]; call: ToolHandler }> = [
  { tools: SYSTEM_TOOLS, call: callSystemTool },
  { tools: PRODUCT_TOOLS, call: callProductTool },
  { tools: CATEGORY_TOOLS, call: callCategoryTool },
  { tools: DESIGN_CATEGORY_TOOLS, call: callDesignCategoryTool },
  { tools: PRICING_RULE_TOOLS, call: callPricingRuleTool },
  { tools: PRINT_PROFILE_TOOLS, call: callPrintProfileTool },
  { tools: USER_INTERFACE_TOOLS, call: callUserInterfaceTool },
  { tools: ORDER_TOOLS, call: callOrderTool },
  { tools: SHORTCODE_ORDER_TOOLS, call: callShortcodeOrderTool },
  { tools: PRINT_JOB_TOOLS, call: callPrintJobTool },
  { tools: ASSET_TOOLS, call: callAssetTool },
  { tools: FONT_TOOLS, call: callFontTool },
  { tools: TEXT_TEMPLATE_TOOLS, call: callTextTemplateTool },
  { tools: COLOR_LIBRARY_TOOLS, call: callColorLibraryTool },
  { tools: SETTINGS_TOOLS, call: callSettingsTool },
];

const ALL_TOOLS: Tool[] = TOOL_GROUPS.flatMap((g) => g.tools);

const server = new Server(
  { name: 'chamevo-mcp', version: '0.3.0' },
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
    const group = TOOL_GROUPS.find((g) => g.tools.some((t) => t.name === name));
    if (!group) {
      throw new Error(`Unknown tool: ${name}`);
    }

    const result = await group.call(name, args as Record<string, unknown>);

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
