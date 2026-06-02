import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const SHORTCODE_ORDER_TOOLS: Tool[] = [
  {
    name: 'list_shortcode_orders',
    description:
      'List standalone shortcode orders — customizations submitted outside WooCommerce via the Chamevo shortcode flow.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page, max 100 (default: 20)' },
        include_data: {
          type: 'boolean',
          description: 'Embed the full customized views for each order (default: false)',
        },
      },
    },
  },
  {
    name: 'get_shortcode_order',
    description: 'Get a single shortcode order with its customized views.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Shortcode order ID' } },
    },
  },
  {
    name: 'create_shortcode_order',
    description: 'Create a shortcode order from one or more customized views.',
    inputSchema: {
      type: 'object',
      required: ['views'],
      properties: {
        customer_name: { type: 'string', description: 'Customer name' },
        customer_mail: { type: 'string', description: 'Customer email' },
        views: { type: 'array', description: 'Array of customized view objects' },
      },
    },
  },
  {
    name: 'update_shortcode_order',
    description: 'Update a shortcode order — views and/or customer details.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Shortcode order ID' },
        views: { type: 'array', description: 'Replace the customized views' },
        customer_name: { type: 'string', description: 'New customer name' },
        customer_mail: { type: 'string', description: 'New customer email' },
      },
    },
  },
  {
    name: 'delete_shortcode_order',
    description: 'Delete a shortcode order.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Shortcode order ID to delete' } },
    },
  },
];

export async function callShortcodeOrderTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_shortcode_orders':
      return client.listShortcodeOrders({
        page: args.page as number | undefined,
        limit: args.limit as number | undefined,
        include_data: args.include_data as boolean | undefined,
      });

    case 'get_shortcode_order':
      return client.getShortcodeOrder(args.id as number);

    case 'create_shortcode_order':
      return client.createShortcodeOrder({
        customer_name: args.customer_name as string | undefined,
        customer_mail: args.customer_mail as string | undefined,
        views: args.views as unknown[],
      });

    case 'update_shortcode_order':
      return client.updateShortcodeOrder(args.id as number, {
        views: args.views as unknown[] | undefined,
        customer_name: args.customer_name as string | undefined,
        customer_mail: args.customer_mail as string | undefined,
      });

    case 'delete_shortcode_order':
      return client.deleteShortcodeOrder(args.id as number);

    default:
      throw new Error(`Unknown shortcode order tool: ${name}`);
  }
}
