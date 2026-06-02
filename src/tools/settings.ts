import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const SETTINGS_TOOLS: Tool[] = [
  {
    name: 'list_settings',
    description:
      'List every Chamevo setting as a flat, searchable index (id, label, description, type, default, tab, section). Use this to discover which chamevo_* keys exist before reading or updating them.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_settings',
    description: 'Get the current values for specific chamevo_* option keys.',
    inputSchema: {
      type: 'object',
      required: ['keys'],
      properties: {
        keys: {
          type: 'array',
          description: 'Option keys to read, e.g. ["chamevo_responsive", "chamevo_unitOfMeasurement"]',
          items: { type: 'string' },
        },
      },
    },
  },
  {
    name: 'get_settings_group',
    description:
      'Get every option in a settings tab, each with its current value. Tabs include: display, layout, actions, social-share, ai-services, api, uploads, products, product-page, cart, order, general, printful, misc, troubleshooting.',
    inputSchema: {
      type: 'object',
      required: ['tab'],
      properties: { tab: { type: 'string', description: 'Settings tab/group key' } },
    },
  },
  {
    name: 'update_settings',
    description:
      'Update one or more chamevo_* options. Only keys in the chamevo_ namespace are accepted. Booleans are stored as "yes"/"no".',
    inputSchema: {
      type: 'object',
      required: ['options'],
      properties: {
        options: {
          type: 'object',
          description: 'Map of chamevo_* option key → new value',
        },
      },
    },
  },
];

export async function callSettingsTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_settings':
      return client.getSettingsIndex();

    case 'get_settings':
      return client.getSettingsValues(args.keys as string[]);

    case 'get_settings_group':
      return client.getSettingsGroup(args.tab as string);

    case 'update_settings':
      return client.updateSettings(args.options as Record<string, unknown>);

    default:
      throw new Error(`Unknown settings tool: ${name}`);
  }
}
