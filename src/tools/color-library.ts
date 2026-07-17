import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const COLOR_LIBRARY_TOOLS: Tool[] = [
  {
    name: 'get_color_library',
    description:
      "The site's color library: the named colors and the palettes built from them, shared by the designer, print profiles, and pricing. Read this before saving — save_color_library replaces the whole model. meta.persisted tells you whether the library has been saved yet or is still being derived from the legacy color config.",
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'save_color_library',
    description:
      'Save the color library. This REPLACES the whole model — any color or palette you omit is deleted, so always start from get_color_library, change what you need, and send the full model back. Colors keep stable ids: editing a hex keeps palette references intact, so change a colour rather than replacing it. Before removing a color or palette, check get_color_library_usages. Rejected models come back with a list of validation errors and nothing is written.',
    inputSchema: {
      type: 'object',
      required: ['library'],
      properties: {
        library: {
          type: 'object',
          description:
            'The complete library model as returned by get_color_library (colors, palettes, version, …)',
        },
      },
    },
  },
  {
    name: 'get_color_library_usages',
    description:
      'Report where a color or palette is referenced — call before deleting one. In-library and print-profile references are authoritative; the report sets productsChecked to false when product-view and design-library elements could not be scanned, which means "unknown", not "unused".',
    inputSchema: {
      type: 'object',
      required: ['id', 'type'],
      properties: {
        id: { type: 'string', description: 'The color or palette id' },
        type: {
          type: 'string',
          enum: ['color', 'palette'],
          description: 'What the id refers to',
        },
      },
    },
  },
];

export async function callColorLibraryTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'get_color_library':
      return client.getColorLibrary();

    case 'save_color_library':
      return client.saveColorLibrary(args.library as Record<string, unknown>);

    case 'get_color_library_usages':
      return client.getColorLibraryUsages(args.id as string, args.type as string);

    default:
      throw new Error(`Unknown color library tool: ${name}`);
  }
}
