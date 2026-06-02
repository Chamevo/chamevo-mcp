import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const ORDER_TOOLS: Tool[] = [
  {
    name: 'get_order',
    description:
      'Retrieve Chamevo customization data for a WooCommerce order. Returns the customer-submitted design data (elements, images, options) attached to the order.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'WooCommerce order ID' },
        type: {
          type: 'string',
          description: 'Order type adapter (default: "wc" for WooCommerce)',
          enum: ['wc'],
        },
        item_key: {
          type: 'string',
          description: 'Meta key that stores the customization data (default: "_fpd_data")',
        },
        item_id: {
          type: 'number',
          description: 'Specific order item ID to retrieve (omit to return all items)',
        },
      },
    },
  },
  {
    name: 'update_order',
    description:
      'Update the customization data attached to an order. For WooCommerce ("wc"), the design data is stored per order item — pass item_id (or use the item id as the order id).',
    inputSchema: {
      type: 'object',
      required: ['id', 'order'],
      properties: {
        id: { type: 'number', description: 'Order ID (WooCommerce) or order/entry ID' },
        order: {
          type: 'object',
          description: 'The design data payload to persist (object or array)',
        },
        type: {
          type: 'string',
          description: 'Order type adapter (default: "wc")',
          enum: ['wc', 'sc', 'gf'],
        },
        item_id: {
          type: 'number',
          description: 'WooCommerce only: the order item ID to write the design data to',
        },
      },
    },
  },
];

export async function callOrderTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'get_order':
      return client.getOrder(args.id as number, {
        type: args.type as string | undefined,
        item_key: args.item_key as string | undefined,
        item_id: args.item_id as number | undefined,
      });

    case 'update_order':
      return client.updateOrder(args.id as number, {
        order: args.order,
        type: args.type as string | undefined,
        item_id: args.item_id as number | undefined,
      });

    default:
      throw new Error(`Unknown order tool: ${name}`);
  }
}
