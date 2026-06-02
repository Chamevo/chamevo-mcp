import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const CATEGORY_TOOLS: Tool[] = [
  {
    name: 'list_categories',
    description: 'List product categories that group Chamevo design products.',
    inputSchema: {
      type: 'object',
      properties: {
        include_products: {
          type: 'boolean',
          description: 'Include the assigned product IDs for each category (default: false)',
        },
      },
    },
  },
  {
    name: 'get_category',
    description: 'Get a single product category by ID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Category ID' },
        include_products: {
          type: 'boolean',
          description: 'Include the assigned product IDs (default: true)',
        },
      },
    },
  },
  {
    name: 'create_category',
    description: 'Create a new product category.',
    inputSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', description: 'Category title' },
      },
    },
  },
  {
    name: 'update_category',
    description:
      'Update a product category — rename it, or replace the set of products assigned to it.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Category ID' },
        title: { type: 'string', description: 'New category title' },
        products: {
          type: 'array',
          description: 'Replace assigned products with this list of product IDs',
          items: { type: 'number' },
        },
      },
    },
  },
  {
    name: 'delete_category',
    description: 'Delete a product category (does not delete the products in it).',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Category ID to delete' } },
    },
  },
  {
    name: 'clear_category',
    description: 'Remove all products from a category while keeping the category itself.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Category ID to clear' } },
    },
  },
];

export async function callCategoryTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_categories':
      return client.listCategories(args.include_products as boolean | undefined);

    case 'get_category':
      return client.getCategory(args.id as number, args.include_products as boolean | undefined);

    case 'create_category':
      return client.createCategory(args.title as string);

    case 'update_category':
      return client.updateCategory(args.id as number, {
        title: args.title as string | undefined,
        products: args.products as number[] | undefined,
      });

    case 'delete_category':
      return client.deleteCategory(args.id as number);

    case 'clear_category':
      return client.clearCategory(args.id as number);

    default:
      throw new Error(`Unknown category tool: ${name}`);
  }
}
