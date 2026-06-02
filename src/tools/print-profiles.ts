import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const PRINT_PROFILE_TOOLS: Tool[] = [
  {
    name: 'list_print_profiles',
    description:
      'List print profiles — reusable print-output configurations (DPI, bleed, colour handling) that attach to print areas.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_print_profile',
    description: 'Get a single print profile. Use id "master" for the master profile.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: ['number', 'string'],
          description: 'Print profile ID, or the literal "master"',
        },
        include_data: {
          type: 'boolean',
          description: 'Embed the full profile data blob (default: false)',
        },
      },
    },
  },
  {
    name: 'create_print_profile',
    description: 'Create a print profile, optionally flagging it as the master profile.',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', description: 'Profile name' },
        data: { type: 'object', description: 'Profile configuration data' },
        is_master: { type: 'boolean', description: 'Flag as the master profile' },
      },
    },
  },
  {
    name: 'update_print_profile',
    description: 'Update a print profile — name, data, and/or master flag. Use id "master" to target the master profile.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: ['number', 'string'], description: 'Profile ID, or "master"' },
        name: { type: 'string', description: 'New profile name' },
        data: { type: 'object', description: 'New profile configuration data' },
        is_master: { type: 'boolean', description: 'Set/clear master flag' },
      },
    },
  },
  {
    name: 'delete_print_profile',
    description: 'Delete a print profile.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'number', description: 'Profile ID to delete' } },
    },
  },
  {
    name: 'duplicate_print_profile',
    description: 'Duplicate a print profile under a new name.',
    inputSchema: {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'number', description: 'Profile ID to duplicate' },
        name: { type: 'string', description: 'Name for the new copy' },
      },
    },
  },
  {
    name: 'set_print_profile_master',
    description: 'Set or clear the master status of a print profile.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'number', description: 'Profile ID' },
        is_master: {
          type: 'boolean',
          description: 'true to set as master, false to clear (default: true)',
        },
      },
    },
  },
];

export async function callPrintProfileTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_print_profiles':
      return client.listPrintProfiles();

    case 'get_print_profile':
      return client.getPrintProfile(
        args.id as number | string,
        args.include_data as boolean | undefined
      );

    case 'create_print_profile':
      return client.createPrintProfile({
        name: args.name as string,
        data: args.data as Record<string, unknown> | undefined,
        is_master: args.is_master as boolean | undefined,
      });

    case 'update_print_profile':
      return client.updatePrintProfile(args.id as number | string, {
        name: args.name as string | undefined,
        data: args.data as Record<string, unknown> | undefined,
        is_master: args.is_master as boolean | undefined,
      });

    case 'delete_print_profile':
      return client.deletePrintProfile(args.id as number);

    case 'duplicate_print_profile':
      return client.duplicatePrintProfile(args.id as number, args.name as string);

    case 'set_print_profile_master':
      return client.setPrintProfileMaster(
        args.id as number,
        args.is_master === undefined ? true : (args.is_master as boolean)
      );

    default:
      throw new Error(`Unknown print profile tool: ${name}`);
  }
}
