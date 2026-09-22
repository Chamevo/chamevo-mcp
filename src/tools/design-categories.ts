import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const DESIGN_CATEGORY_TOOLS: Tool[] = [
  {
    name: 'list_design_categories',
    description:
      'List design / clipart library categories — the ready-made graphics customers can drop onto a product. Supports nesting via parent_id.',
    inputSchema: {
      type: 'object',
      properties: {
        only_roots: { type: 'boolean', description: 'Return only top-level categories' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page (default: 20; -1 for all)' },
        search: { type: 'string', description: 'Filter by title' },
      },
    },
  },
  {
    name: 'get_design_category',
    description: 'Get a single design category together with its designs.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Design category ID' } },
    },
  },
  {
    name: 'create_design_category',
    description: 'Create a design category with optional initial designs.',
    inputSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', description: 'Category title' },
        options: { type: 'object', description: 'Category-level option overrides' },
        thumbnail: { type: 'string', description: 'Category thumbnail URL' },
        designs: {
          type: 'array',
          description:
            'Design items of the category (the WHOLE list). Each item is either a static graphic { id, title, image, thumbnail, parameters } or a graphic block — a template made of several editable layers — { id, title, elements: [{ type, title, source, parameters }], thumbnail, parameters, width, height }. An item carries `image` OR `elements`, never both.',
        },
        parent_id: { type: 'number', description: 'Parent category ID (0 = root)' },
        order: { type: 'number', description: 'Sort position' },
      },
    },
  },
  {
    name: 'update_design_category',
    description: 'Update a design category — fields, re-parent, or reorder.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Design category ID' },
        title: { type: 'string', description: 'New title' },
        options: { type: 'object', description: 'Category-level option overrides' },
        thumbnail: { type: 'string', description: 'Category thumbnail URL' },
        parent_id: { type: 'number', description: 'New parent category ID (0 = root)' },
        designs: {
          type: 'array',
          description:
            'Replaces ALL design items — send every item you want to keep. Design items of the category (the WHOLE list). Each item is either a static graphic { id, title, image, thumbnail, parameters } or a graphic block — a template made of several editable layers — { id, title, elements: [{ type, title, source, parameters }], thumbnail, parameters, width, height }. An item carries `image` OR `elements`, never both.',
        },
        order: { type: 'number', description: 'Sort position' },
      },
    },
  },
  {
    name: 'delete_design_category',
    description: 'Delete a design category and its designs.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Design category ID to delete' } },
    },
  },
];

export async function callDesignCategoryTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_design_categories':
      return client.listDesignCategories({
        only_roots: args.only_roots as boolean | undefined,
        page: args.page as number | undefined,
        limit: args.limit as number | undefined,
        search: args.search as string | undefined,
      });

    case 'get_design_category':
      return client.getDesignCategory(args.id as number);

    case 'create_design_category':
      return client.createDesignCategory({
        title: args.title as string,
        options: args.options as Record<string, unknown> | undefined,
        thumbnail: args.thumbnail as string | undefined,
        designs: args.designs as unknown[] | undefined,
        parent_id: args.parent_id as number | undefined,
        order: args.order as number | undefined,
      });

    case 'update_design_category':
      return client.updateDesignCategory(args.id as number, {
        title: args.title as string | undefined,
        options: args.options as Record<string, unknown> | undefined,
        thumbnail: args.thumbnail as string | undefined,
        parent_id: args.parent_id as number | undefined,
        designs: args.designs as unknown[] | undefined,
        order: args.order as number | undefined,
      });

    case 'delete_design_category':
      return client.deleteDesignCategory(args.id as number);

    default:
      throw new Error(`Unknown design category tool: ${name}`);
  }
}
