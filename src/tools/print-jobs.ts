import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

export const PRINT_JOB_TOOLS: Tool[] = [
  {
    name: 'list_print_jobs',
    description:
      'List print jobs — records the export pipeline creates when generating print-ready files for orders.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status (e.g. "pending", "completed", "failed")',
        },
        limit: { type: 'number', description: 'Max results (0 = no limit)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
  },
  {
    name: 'get_print_job',
    description: 'Get a single print job by numeric ID or by GUID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: ['number', 'string'], description: 'Print job numeric ID or GUID' },
      },
    },
  },
  {
    name: 'delete_print_job',
    description: 'Delete a print job by numeric ID or GUID.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: ['number', 'string'], description: 'Print job numeric ID or GUID to delete' },
      },
    },
  },
];

export async function callPrintJobTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'list_print_jobs':
      return client.listPrintJobs({
        status: args.status as string | undefined,
        limit: args.limit as number | undefined,
        offset: args.offset as number | undefined,
      });

    case 'get_print_job':
      return client.getPrintJob(args.id as number | string);

    case 'delete_print_job':
      return client.deletePrintJob(args.id as number | string);

    default:
      throw new Error(`Unknown print job tool: ${name}`);
  }
}
