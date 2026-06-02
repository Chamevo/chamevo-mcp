import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const PRICING_RULE_TOOLS: Tool[] = [
  {
    name: 'list_pricing_rules',
    description:
      'List dynamic pricing rules — conditional price adjustments applied based on the customer\'s customization choices.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Filter by rule name' },
        limit: { type: 'number', description: 'Max results' },
        offset: { type: 'number', description: 'Pagination offset' },
        order_by: { type: 'string', description: 'Order clause, e.g. "name ASC"' },
      },
    },
  },
  {
    name: 'get_pricing_rule',
    description: 'Get a single pricing rule by ID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Pricing rule ID' } },
    },
  },
  {
    name: 'create_pricing_rule',
    description: 'Create a pricing rule with a name and a data payload describing its conditions and price effects.',
    inputSchema: {
      type: 'object',
      required: ['name', 'data'],
      properties: {
        name: { type: 'string', description: 'Rule name' },
        data: { type: 'object', description: 'Rule definition (conditions and price effects)' },
      },
    },
  },
  {
    name: 'update_pricing_rule',
    description: 'Update a pricing rule — name and/or data.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Pricing rule ID' },
        name: { type: 'string', description: 'New rule name' },
        data: { type: 'object', description: 'New rule definition' },
      },
    },
  },
  {
    name: 'delete_pricing_rule',
    description: 'Delete a pricing rule.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Pricing rule ID to delete' } },
    },
  },
];

export async function callPricingRuleTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_pricing_rules':
      return client.listPricingRules({
        search: args.search as string | undefined,
        limit: args.limit as number | undefined,
        offset: args.offset as number | undefined,
        order_by: args.order_by as string | undefined,
      });

    case 'get_pricing_rule':
      return client.getPricingRule(args.id as number);

    case 'create_pricing_rule':
      return client.createPricingRule(
        args.name as string,
        args.data as Record<string, unknown>
      );

    case 'update_pricing_rule':
      return client.updatePricingRule(args.id as number, {
        name: args.name as string | undefined,
        data: args.data as Record<string, unknown> | undefined,
      });

    case 'delete_pricing_rule':
      return client.deletePricingRule(args.id as number);

    default:
      throw new Error(`Unknown pricing rule tool: ${name}`);
  }
}
