import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const PRODUCT_TOOLS: Tool[] = [
  {
    name: 'list_products',
    description:
      'List Chamevo design products with optional pagination, search, and category filter.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page, max 100 (default: 20)' },
        search: { type: 'string', description: 'Filter by product title' },
        category_id: { type: 'number', description: 'Filter by category ID' },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get a single Chamevo product by ID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Product ID' },
        include_views: {
          type: 'boolean',
          description: 'Include product views in the response (default: false)',
        },
      },
    },
  },
  {
    name: 'create_product',
    description:
      'Create a new Chamevo product — blank, duplicated from an existing product, or from a template.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Product title (required for blank products)' },
        type: {
          type: 'string',
          enum: ['catalog', 'template'],
          description: 'Product type (default: catalog)',
        },
        thumbnail: { type: 'string', description: 'URL of the product thumbnail image' },
        duplicate_product_id: {
          type: 'number',
          description: 'Clone an existing product by its ID',
        },
        template_id: {
          type: 'number',
          description: 'Create product from a saved template by its ID',
        },
      },
    },
  },
  {
    name: 'update_product',
    description:
      'Update a product — title, thumbnail, options, or view sort order. Send only the fields to change.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Product ID' },
        title: { type: 'string', description: 'New product title' },
        thumbnail: { type: 'string', description: 'URL of the new thumbnail image' },
        options: { type: 'object', description: 'Product options object (merged server-side)' },
        sorted_views: {
          type: 'array',
          description: 'Reorder views — array of {id} objects in desired order',
          items: {
            type: 'object',
            required: ['id'],
            properties: { id: { type: 'number' } },
          },
        },
      },
    },
  },
  {
    name: 'delete_product',
    description: 'Permanently delete a Chamevo product and all its views.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Product ID to delete' },
      },
    },
  },
  {
    name: 'list_product_views',
    description: 'List all views (print sides/angles) for a product.',
    inputSchema: {
      type: 'object',
      required: ['product_id'],
      properties: {
        product_id: { type: 'number', description: 'Product ID' },
      },
    },
  },
  {
    name: 'add_product_view',
    description: 'Add a new view (print side/angle) to a product.',
    inputSchema: {
      type: 'object',
      required: ['product_id', 'title'],
      properties: {
        product_id: { type: 'number', description: 'Product ID' },
        title: { type: 'string', description: 'View label, e.g. "Front", "Back"' },
        thumbnail: { type: 'string', description: 'URL of the background image for this view' },
        order: { type: 'number', description: 'Sort position among views' },
        options: { type: 'object', description: 'View-level options' },
        elements: { type: 'array', description: 'Initial element definitions' },
      },
    },
  },
  {
    name: 'get_view',
    description: 'Get a single product view by ID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'View ID' },
      },
    },
  },
  {
    name: 'update_view',
    description:
      'Update a view — title, thumbnail, options, elements, or move it to a different product.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'View ID' },
        title: { type: 'string', description: 'New view label' },
        thumbnail: { type: 'string', description: 'URL of the new background image' },
        options: { type: 'object', description: 'View-level options' },
        elements: { type: 'array', description: 'Element definitions' },
        product_id: { type: 'number', description: 'Move view to this product ID' },
      },
    },
  },
  {
    name: 'delete_view',
    description: 'Permanently delete a product view.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'View ID to delete' },
      },
    },
  },
];

export async function callProductTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_products':
      return client.listProducts({
        page: args.page as number | undefined,
        limit: args.limit as number | undefined,
        search: args.search as string | undefined,
        category_id: args.category_id as number | undefined,
      });

    case 'get_product':
      return client.getProduct(
        args.id as number,
        args.include_views as boolean | undefined
      );

    case 'create_product':
      return client.createProduct({
        title: args.title as string | undefined,
        type: args.type as string | undefined,
        thumbnail: args.thumbnail as string | undefined,
        duplicate_product_id: args.duplicate_product_id as number | undefined,
        template_id: args.template_id as number | undefined,
      });

    case 'update_product':
      return client.updateProduct(args.id as number, {
        title: args.title as string | undefined,
        thumbnail: args.thumbnail as string | undefined,
        options: args.options as Record<string, unknown> | undefined,
        sorted_views: args.sorted_views as Array<{ id: number }> | undefined,
      });

    case 'delete_product':
      return client.deleteProduct(args.id as number);

    case 'list_product_views':
      return client.listProductViews(args.product_id as number);

    case 'add_product_view':
      return client.addProductView(args.product_id as number, {
        title: args.title as string,
        thumbnail: args.thumbnail as string | undefined,
        elements: args.elements as unknown[] | undefined,
        order: args.order as number | undefined,
        options: args.options as Record<string, unknown> | undefined,
      });

    case 'get_view':
      return client.getView(args.id as number);

    case 'update_view':
      return client.updateView(args.id as number, {
        title: args.title as string | undefined,
        thumbnail: args.thumbnail as string | undefined,
        options: args.options as Record<string, unknown> | undefined,
        elements: args.elements as unknown[] | undefined,
        product_id: args.product_id as number | undefined,
      });

    case 'delete_view':
      return client.deleteView(args.id as number);

    default:
      throw new Error(`Unknown product tool: ${name}`);
  }
}
