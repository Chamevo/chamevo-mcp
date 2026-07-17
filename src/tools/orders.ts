import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

/** Shared wording — the three order sources Chamevo reads designs from. */
const ORDER_TYPE_DESCRIPTION =
  'Order source: "wc" = WooCommerce order, "sc" = standalone shortcode order, "gf" = Gravity Forms entry.';

export const ORDER_TOOLS: Tool[] = [
  {
    name: 'list_orders',
    description:
      'List orders that carry a Chamevo design, newest first. Each row includes a print_file_url when a print-ready file has already been generated for it. Call this first to find an order id — get_order and export_order both need one. WooCommerce rows carry an order_items array; the design lives on the ITEM, so take item_id from there.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['wc', 'sc', 'gf'],
          description: `${ORDER_TYPE_DESCRIPTION} Defaults to "wc". Check get_system_info first — an inactive integration returns an error.`,
        },
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page, max 100 (default: 20)' },
        search: { type: 'string', description: 'Filter by customer, order number, or e-mail' },
      },
    },
  },
  {
    name: 'get_order',
    description:
      'Retrieve the Chamevo customization data attached to an order — the customer-submitted design (elements, images, options). For WooCommerce, omit item_id to list every item of the order, or pass one to fetch a single item.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Order ID (WooCommerce/shortcode) or Gravity Forms entry ID' },
        type: {
          type: 'string',
          enum: ['wc', 'sc', 'gf'],
          description: `${ORDER_TYPE_DESCRIPTION} Defaults to "wc".`,
        },
        item_key: {
          type: 'string',
          description: 'Meta key that stores the customization data (default: "_fpd_data")',
        },
        item_id: {
          type: 'number',
          description: 'WooCommerce only: a specific order item ID (omit to return all items)',
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
          enum: ['wc', 'sc', 'gf'],
          description: `${ORDER_TYPE_DESCRIPTION} Defaults to "wc".`,
        },
        item_id: {
          type: 'number',
          description: 'WooCommerce only: the order item ID to write the design data to',
        },
      },
    },
  },
  {
    name: 'delete_order',
    description:
      'Delete a shortcode order. Only shortcode orders ("sc") can be deleted — WooCommerce orders and Gravity Forms entries are owned by those plugins and must be deleted there.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Shortcode order ID to delete' },
        type: {
          type: 'string',
          enum: ['sc'],
          description: 'Order source — only "sc" (shortcode order) is deletable. Default: "sc".',
        },
      },
    },
  },
  {
    name: 'export_order',
    description:
      "Generate a print-ready file from an order's stored design and return its download URL. Output format and DPI default to the site's export settings unless overridden. This blocks while the file renders (up to ~3 minutes) and counts against the licence's monthly order quota, so call it once per order and reuse the returned file_url. The resulting print job is also retrievable via get_print_job / list_print_jobs.",
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Order ID (WooCommerce/shortcode) or Gravity Forms entry ID' },
        type: {
          type: 'string',
          enum: ['wc', 'sc', 'gf'],
          description: `${ORDER_TYPE_DESCRIPTION} Defaults to "wc".`,
        },
        item_id: {
          type: 'number',
          description:
            'WooCommerce only, REQUIRED: the order ITEM id holding the design. Get it from list_orders (order_items[].id) or get_order.',
        },
        output_format: {
          type: 'string',
          enum: ['svg-pdf', 'png', 'jpeg', 'svg'],
          description: "Override the site's configured output format",
        },
        dpi: { type: 'number', description: 'Override the raster output resolution (e.g. 300)' },
        include_font_files: {
          type: 'boolean',
          description: 'Bundle the fonts used by the design alongside the file',
        },
        summary_json: {
          type: 'boolean',
          description: 'Add the PDF summary sheet (PDF output only)',
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
    case 'list_orders':
      return client.listOrders({
        type: args.type as string | undefined,
        page: args.page as number | undefined,
        limit: args.limit as number | undefined,
        search: args.search as string | undefined,
      });

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

    case 'delete_order':
      return client.deleteOrder(args.id as number, (args.type as string | undefined) ?? 'sc');

    case 'export_order':
      return client.exportOrder(args.id as number, {
        type: args.type as string | undefined,
        item_id: args.item_id as number | undefined,
        output_format: args.output_format as string | undefined,
        dpi: args.dpi as number | undefined,
        include_font_files: args.include_font_files as boolean | undefined,
        summary_json: args.summary_json as boolean | undefined,
      });

    default:
      throw new Error(`Unknown order tool: ${name}`);
  }
}
