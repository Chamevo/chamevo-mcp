import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const ASSET_TOOLS: Tool[] = [
  {
    name: 'list_assets',
    description:
      'List image and PDF assets stored in the Chamevo uploads folder, sorted newest first.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        limit: { type: 'number', description: 'Items per page, max 100 (default: 20)' },
      },
    },
  },
  {
    name: 'upload_asset',
    description:
      'Upload a local image (PNG, JPEG, SVG) or PDF to Chamevo. The MCP server reads the file from the local filesystem and posts it to the Chamevo API. Returns the public URL of the uploaded file.',
    inputSchema: {
      type: 'object',
      required: ['file_path'],
      properties: {
        file_path: {
          type: 'string',
          description: 'Absolute path to the file on the local filesystem',
        },
      },
    },
  },
];

export async function callAssetTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_assets':
      return client.listAssets({
        page: args.page as number | undefined,
        limit: args.limit as number | undefined,
      });

    case 'upload_asset':
      return client.uploadAsset(args.file_path as string);

    default:
      throw new Error(`Unknown asset tool: ${name}`);
  }
}
