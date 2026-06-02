import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const SYSTEM_TOOLS: Tool[] = [
  {
    name: 'get_system_info',
    description:
      'Get a snapshot of the Chamevo installation: plugin version, active integrations (WooCommerce, Gravity Forms, Elementor, Printful), content counts, and which optional API controllers are enabled. Call this first to discover capabilities before using other tools.',
    inputSchema: { type: 'object', properties: {} },
  },
];

export async function callSystemTool(
  name: string,
  _args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'get_system_info':
      return client.getSystem();

    default:
      throw new Error(`Unknown system tool: ${name}`);
  }
}
