import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const FONT_TOOLS: Tool[] = [
  {
    name: 'list_fonts',
    description:
      'List the custom TTF font families available to the product designer, including their variant URLs (regular, bold, italic, bolditalic).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'upload_font',
    description:
      'Upload a local TTF font file to Chamevo. The MCP server reads the file from the local filesystem and posts it to the Chamevo API.',
    inputSchema: {
      type: 'object',
      required: ['file_path'],
      properties: {
        file_path: { type: 'string', description: 'Absolute path to the .ttf file on the local filesystem' },
        name: {
          type: 'string',
          description: 'Font family name (defaults to the uploaded filename). Use "__bold"/"__italic"/"__bolditalic" suffixes for variants.',
        },
      },
    },
  },
  {
    name: 'delete_font',
    description: 'Delete a font family and all of its variant files.',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string', description: 'Font family name to delete' } },
    },
  },
];

export async function callFontTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_fonts':
      return client.listFonts();

    case 'upload_font':
      return client.uploadFont(args.file_path as string, args.name as string | undefined);

    case 'delete_font':
      return client.deleteFont(args.name as string);

    default:
      throw new Error(`Unknown font tool: ${name}`);
  }
}
