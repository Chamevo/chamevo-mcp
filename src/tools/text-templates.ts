import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as client from '../client.js';

/**
 * Templates carry no stored id — they are addressed by position, and positions
 * shift on create/delete. Every tool description says so, because an agent that
 * caches an index across a write will edit the wrong template.
 */
const INDEX_DESCRIPTION =
  'Position in the list (0-based), from list_text_templates. Positions shift when a template is created or deleted — re-list after either.';

const STYLE_PROPERTIES = {
  text: { type: 'string' as const, description: 'The template text shown to the customer' },
  font_family: {
    type: 'string' as const,
    description: 'Font family name — must be one the site offers (see list_fonts)',
  },
  font_size: { type: 'number' as const, description: 'Font size in pixels (default: 16)' },
  text_align: {
    type: 'string' as const,
    enum: ['left', 'center', 'right'],
    description: 'Text alignment (default: left)',
  },
};

export const TEXT_TEMPLATE_TOOLS: Tool[] = [
  {
    name: 'list_text_templates',
    description:
      'List the ready-made text presets customers can drop onto a product. Each carries its 0-based index — the handle the get/update/delete tools take.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_text_template',
    description: 'Get a single text template by its position.',
    inputSchema: {
      type: 'object',
      required: ['index'],
      properties: { index: { type: 'number', description: INDEX_DESCRIPTION } },
    },
  },
  {
    name: 'create_text_template',
    description: 'Append a new text template to the end of the list.',
    inputSchema: {
      type: 'object',
      required: ['text'],
      properties: { ...STYLE_PROPERTIES },
    },
  },
  {
    name: 'update_text_template',
    description: 'Update a text template in place. Send only the fields to change.',
    inputSchema: {
      type: 'object',
      required: ['index'],
      properties: {
        index: { type: 'number', description: INDEX_DESCRIPTION },
        ...STYLE_PROPERTIES,
      },
    },
  },
  {
    name: 'delete_text_template',
    description: 'Delete a text template by position. Templates after it shift down by one.',
    inputSchema: {
      type: 'object',
      required: ['index'],
      properties: { index: { type: 'number', description: INDEX_DESCRIPTION } },
    },
  },
  {
    name: 'replace_text_templates',
    description:
      'Replace the WHOLE template list — use for reordering or bulk import. Any template not included is deleted, so send the complete list (read list_text_templates first). To change one template, prefer update_text_template.',
    inputSchema: {
      type: 'object',
      required: ['templates'],
      properties: {
        templates: {
          type: 'array',
          description: 'The complete list, in the desired order',
          items: {
            type: 'object',
            required: ['text'],
            properties: { ...STYLE_PROPERTIES },
          },
        },
      },
    },
  },
];

export async function callTextTemplateTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const fields = () => ({
    text: args.text as string | undefined,
    font_family: args.font_family as string | undefined,
    font_size: args.font_size as number | undefined,
    text_align: args.text_align as string | undefined,
  });

  switch (name) {
    case 'list_text_templates':
      return client.listTextTemplates();

    case 'get_text_template':
      return client.getTextTemplate(args.index as number);

    case 'create_text_template':
      return client.createTextTemplate(fields());

    case 'update_text_template':
      return client.updateTextTemplate(args.index as number, fields());

    case 'delete_text_template':
      return client.deleteTextTemplate(args.index as number);

    case 'replace_text_templates':
      return client.replaceTextTemplates(args.templates as client.TextTemplateFields[]);

    default:
      throw new Error(`Unknown text template tool: ${name}`);
  }
}
