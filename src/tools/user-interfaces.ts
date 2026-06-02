import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const USER_INTERFACE_TOOLS: Tool[] = [
  {
    name: 'list_user_interfaces',
    description:
      'List saved product-designer UI layouts built in the UI Composer (panels, modules, toolbars).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_user_interface',
    description: 'Get a single UI layout. Use id "default" for the default layout.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: ['number', 'string'], description: 'Layout ID, or the literal "default"' },
        include_data: {
          type: 'boolean',
          description: 'Embed the full layout data blob (default: false)',
        },
      },
    },
  },
  {
    name: 'create_user_interface',
    description:
      'Create a UI layout. When data is omitted, the default layout is cloned as a starting point.',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', description: 'Layout name' },
        data: { type: 'object', description: 'Layout definition (panels/modules)' },
        is_default: { type: 'boolean', description: 'Make this the default layout' },
      },
    },
  },
  {
    name: 'update_user_interface',
    description: 'Update a UI layout — name, data, and/or default flag. Use id "default" to target the default layout.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: ['number', 'string'], description: 'Layout ID, or "default"' },
        name: { type: 'string', description: 'New layout name' },
        data: { type: 'object', description: 'New layout definition' },
        is_default: { type: 'boolean', description: 'Set as default layout' },
      },
    },
  },
  {
    name: 'delete_user_interface',
    description: 'Delete a UI layout.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Layout ID to delete' } },
    },
  },
];

export async function callUserInterfaceTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_user_interfaces':
      return client.listUserInterfaces();

    case 'get_user_interface':
      return client.getUserInterface(
        args.id as number | string,
        args.include_data as boolean | undefined
      );

    case 'create_user_interface':
      return client.createUserInterface({
        name: args.name as string,
        data: args.data as Record<string, unknown> | undefined,
        is_default: args.is_default as boolean | undefined,
      });

    case 'update_user_interface':
      return client.updateUserInterface(args.id as number | string, {
        name: args.name as string | undefined,
        data: args.data as Record<string, unknown> | undefined,
        is_default: args.is_default as boolean | undefined,
      });

    case 'delete_user_interface':
      return client.deleteUserInterface(args.id as number);

    default:
      throw new Error(`Unknown user interface tool: ${name}`);
  }
}
