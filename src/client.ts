import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

function getConfig(): { siteUrl: string; apiToken: string } {
  const siteUrl = process.env.CHAMEVO_SITE_URL?.replace(/\/$/, '');
  const apiToken = process.env.CHAMEVO_API_TOKEN;

  if (!siteUrl) throw new Error('CHAMEVO_SITE_URL environment variable is required');
  if (!apiToken) throw new Error('CHAMEVO_API_TOKEN environment variable is required');

  return { siteUrl, apiToken };
}

function baseUrl(): string {
  return `${getConfig().siteUrl}/wp-json/chamevo/v1`;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '' && val !== false) {
      q.set(key, String(val));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** Ceiling for ordinary requests — a hung site should fail, not block the client forever. */
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * The export route renders the file before responding and blocks for up to
 * ExportService::JOB_TIMEOUT (180s) while polling the export service. Allow
 * headroom on top of that so a slow-but-working export is never cut short.
 */
const EXPORT_TIMEOUT_MS = 240_000;

/**
 * Parse a response body as JSON, failing with the raw payload in the message.
 *
 * WordPress does not always answer with JSON: a WAF, a PHP fatal, or a login
 * redirect returns HTML. Parsing that blindly throws an opaque SyntaxError, so
 * surface the status and a snippet of what actually came back instead.
 */
async function parseJson(response: Response): Promise<unknown> {
  const raw = await response.text();

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    const snippet = raw.slice(0, 200).replace(/\s+/g, ' ').trim();
    throw new Error(
      `API ${response.status}: expected JSON but got ${response.headers.get('content-type') ?? 'unknown content-type'} — ${snippet}`
    );
  }
}

async function apiFetch(
  method: string,
  path: string,
  body?: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<unknown> {
  const { apiToken } = getConfig();
  const url = `${baseUrl()}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s: ${method} ${path}`);
    }
    throw error;
  }

  const data = await parseJson(response);

  if (!response.ok) {
    const message = (data as { message?: string })?.message ?? response.statusText;
    throw new Error(`API ${response.status}: ${message}`);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export function listProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  type?: string;
}): Promise<unknown> {
  return apiFetch('GET', `/products${buildQuery({ ...params })}`);
}

export function getProduct(id: number, include_views?: boolean): Promise<unknown> {
  return apiFetch('GET', `/products/${id}${buildQuery({ include_views })}`);
}

export function createProduct(args: {
  title?: string;
  type?: string;
  thumbnail?: string;
  duplicate_product_id?: number;
  template_id?: number;
}): Promise<unknown> {
  return apiFetch('POST', '/products', args);
}

export function updateProduct(
  id: number,
  args: {
    title?: string;
    thumbnail?: string;
    options?: Record<string, unknown>;
    sorted_views?: Array<{ id: number }>;
  }
): Promise<unknown> {
  return apiFetch('PATCH', `/products/${id}`, args);
}

export function deleteProduct(id: number): Promise<unknown> {
  return apiFetch('DELETE', `/products/${id}`);
}

// ---------------------------------------------------------------------------
// Product views
// ---------------------------------------------------------------------------

export function listProductViews(productId: number): Promise<unknown> {
  return apiFetch('GET', `/products/${productId}/views`);
}

export function addProductView(
  productId: number,
  args: {
    title: string;
    thumbnail?: string;
    elements?: unknown[];
    order?: number;
    options?: Record<string, unknown>;
  }
): Promise<unknown> {
  return apiFetch('POST', `/products/${productId}/views`, args);
}

export function getView(id: number): Promise<unknown> {
  return apiFetch('GET', `/views/${id}`);
}

export function updateView(
  id: number,
  args: {
    title?: string;
    thumbnail?: string;
    options?: Record<string, unknown>;
    elements?: unknown[];
    product_id?: number;
  }
): Promise<unknown> {
  return apiFetch('PATCH', `/views/${id}`, args);
}

export function deleteView(id: number): Promise<unknown> {
  return apiFetch('DELETE', `/views/${id}`);
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export function listOrders(params?: {
  type?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<unknown> {
  return apiFetch('GET', `/orders${buildQuery({ ...params })}`);
}

export function getOrder(
  id: number,
  params?: { type?: string; item_key?: string; item_id?: number }
): Promise<unknown> {
  return apiFetch('GET', `/orders/${id}${buildQuery({ ...params })}`);
}

export function updateOrder(
  id: number,
  args: { order: unknown; type?: string; item_id?: number }
): Promise<unknown> {
  return apiFetch('PATCH', `/orders/${id}`, args);
}

export function deleteOrder(id: number, type: string = 'sc'): Promise<unknown> {
  return apiFetch('DELETE', `/orders/${id}${buildQuery({ type })}`);
}

/**
 * Generate a print-ready file from an order's stored design.
 * Blocks while the export service renders — hence the extended timeout.
 */
export function exportOrder(
  id: number,
  args: {
    type?: string;
    item_id?: number;
    output_format?: string;
    dpi?: number;
    include_font_files?: boolean;
    summary_json?: boolean;
  }
): Promise<unknown> {
  return apiFetch('POST', `/orders/${id}/export`, args, EXPORT_TIMEOUT_MS);
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export function listAssets(params?: { page?: number; limit?: number }): Promise<unknown> {
  return apiFetch('GET', `/assets${buildQuery({ ...params })}`);
}

export async function uploadAsset(filePath: string): Promise<unknown> {
  return uploadMultipart('/assets', filePath);
}

/**
 * Shared multipart uploader: reads a local file and POSTs it as `file`,
 * with optional extra text fields. Used by asset and font uploads.
 */
async function uploadMultipart(
  path: string,
  filePath: string,
  fields: Record<string, string> = {}
): Promise<unknown> {
  const { apiToken } = getConfig();
  const fileBuffer = readFileSync(filePath);
  const fileName = basename(filePath);

  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]), fileName);
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  const response = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: 'application/json',
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const message = (data as { message?: string })?.message ?? response.statusText;
    throw new Error(`Upload ${response.status}: ${message}`);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Product categories
// ---------------------------------------------------------------------------

export function listCategories(include_products?: boolean): Promise<unknown> {
  return apiFetch('GET', `/categories${buildQuery({ include_products })}`);
}

export function getCategory(id: number, include_products?: boolean): Promise<unknown> {
  return apiFetch('GET', `/categories/${id}${buildQuery({ include_products })}`);
}

export function createCategory(title: string): Promise<unknown> {
  return apiFetch('POST', '/categories', { title });
}

export function updateCategory(
  id: number,
  args: { title?: string; products?: number[] }
): Promise<unknown> {
  return apiFetch('PATCH', `/categories/${id}`, args);
}

export function deleteCategory(id: number): Promise<unknown> {
  return apiFetch('DELETE', `/categories/${id}`);
}

export function clearCategory(id: number): Promise<unknown> {
  return apiFetch('POST', `/categories/${id}/clear`);
}

// ---------------------------------------------------------------------------
// Design / clipart library
// ---------------------------------------------------------------------------

export function listDesignCategories(params?: {
  only_roots?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<unknown> {
  return apiFetch('GET', `/design-categories${buildQuery({ ...params })}`);
}

export function getDesignCategory(id: number): Promise<unknown> {
  return apiFetch('GET', `/design-categories/${id}`);
}

export function createDesignCategory(args: {
  title: string;
  options?: Record<string, unknown>;
  thumbnail?: string;
  designs?: unknown[];
  parent_id?: number;
  order?: number;
}): Promise<unknown> {
  return apiFetch('POST', '/design-categories', args);
}

export function updateDesignCategory(
  id: number,
  args: {
    title?: string;
    options?: Record<string, unknown>;
    thumbnail?: string;
    parent_id?: number;
    designs?: unknown[];
    order?: number;
  }
): Promise<unknown> {
  return apiFetch('PATCH', `/design-categories/${id}`, args);
}

export function deleteDesignCategory(id: number): Promise<unknown> {
  return apiFetch('DELETE', `/design-categories/${id}`);
}

// ---------------------------------------------------------------------------
// Pricing rules
// ---------------------------------------------------------------------------

export function listPricingRules(params?: {
  search?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
}): Promise<unknown> {
  return apiFetch('GET', `/pricing-rules${buildQuery({ ...params })}`);
}

export function getPricingRule(id: number): Promise<unknown> {
  return apiFetch('GET', `/pricing-rules/${id}`);
}

export function createPricingRule(name: string, data: Record<string, unknown>): Promise<unknown> {
  return apiFetch('POST', '/pricing-rules', { name, data });
}

export function updatePricingRule(
  id: number,
  args: { name?: string; data?: Record<string, unknown> }
): Promise<unknown> {
  return apiFetch('PATCH', `/pricing-rules/${id}`, args);
}

export function deletePricingRule(id: number): Promise<unknown> {
  return apiFetch('DELETE', `/pricing-rules/${id}`);
}

// ---------------------------------------------------------------------------
// Print profiles
// ---------------------------------------------------------------------------

export function listPrintProfiles(): Promise<unknown> {
  return apiFetch('GET', '/print-profiles');
}

export function getPrintProfile(
  id: number | string,
  include_data?: boolean
): Promise<unknown> {
  return apiFetch('GET', `/print-profiles/${id}${buildQuery({ include_data })}`);
}

export function createPrintProfile(args: {
  name: string;
  data?: Record<string, unknown>;
  is_master?: boolean;
}): Promise<unknown> {
  return apiFetch('POST', '/print-profiles', args);
}

export function updatePrintProfile(
  id: number | string,
  args: { name?: string; data?: Record<string, unknown>; is_master?: boolean }
): Promise<unknown> {
  return apiFetch('PATCH', `/print-profiles/${id}`, args);
}

export function deletePrintProfile(id: number): Promise<unknown> {
  return apiFetch('DELETE', `/print-profiles/${id}`);
}

export function duplicatePrintProfile(id: number, name: string): Promise<unknown> {
  return apiFetch('POST', `/print-profiles/${id}/duplicate`, { name });
}

export function setPrintProfileMaster(id: number, is_master: boolean): Promise<unknown> {
  return apiFetch('POST', `/print-profiles/${id}/master`, { is_master });
}

// ---------------------------------------------------------------------------
// User interfaces (UI layouts)
// ---------------------------------------------------------------------------

export function listUserInterfaces(): Promise<unknown> {
  return apiFetch('GET', '/user-interfaces');
}

export function getUserInterface(
  id: number | string,
  include_data?: boolean
): Promise<unknown> {
  return apiFetch('GET', `/user-interfaces/${id}${buildQuery({ include_data })}`);
}

export function createUserInterface(args: {
  name: string;
  data?: Record<string, unknown>;
  is_default?: boolean;
}): Promise<unknown> {
  return apiFetch('POST', '/user-interfaces', args);
}

export function updateUserInterface(
  id: number | string,
  args: { name?: string; data?: Record<string, unknown>; is_default?: boolean }
): Promise<unknown> {
  return apiFetch('PATCH', `/user-interfaces/${id}`, args);
}

export function deleteUserInterface(id: number): Promise<unknown> {
  return apiFetch('DELETE', `/user-interfaces/${id}`);
}

// ---------------------------------------------------------------------------
// Shortcode orders
// ---------------------------------------------------------------------------

export function listShortcodeOrders(params?: {
  page?: number;
  limit?: number;
  include_data?: boolean;
}): Promise<unknown> {
  return apiFetch('GET', `/shortcode-orders${buildQuery({ ...params })}`);
}

export function getShortcodeOrder(id: number): Promise<unknown> {
  return apiFetch('GET', `/shortcode-orders/${id}`);
}

export function createShortcodeOrder(args: {
  customer_name?: string;
  customer_mail?: string;
  views: unknown[];
}): Promise<unknown> {
  return apiFetch('POST', '/shortcode-orders', args);
}

export function updateShortcodeOrder(
  id: number,
  args: { views?: unknown[]; customer_name?: string; customer_mail?: string }
): Promise<unknown> {
  return apiFetch('PATCH', `/shortcode-orders/${id}`, args);
}

export function deleteShortcodeOrder(id: number): Promise<unknown> {
  return apiFetch('DELETE', `/shortcode-orders/${id}`);
}

// ---------------------------------------------------------------------------
// Print jobs
// ---------------------------------------------------------------------------

export function listPrintJobs(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<unknown> {
  return apiFetch('GET', `/print-jobs${buildQuery({ ...params })}`);
}

export function getPrintJob(id: number | string): Promise<unknown> {
  return apiFetch('GET', `/print-jobs/${id}`);
}

export function deletePrintJob(id: number | string): Promise<unknown> {
  return apiFetch('DELETE', `/print-jobs/${id}`);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function getSettingsIndex(): Promise<unknown> {
  return apiFetch('GET', '/settings');
}

export function getSettingsValues(keys: string[]): Promise<unknown> {
  const query = keys.map((k) => `keys[]=${encodeURIComponent(k)}`).join('&');
  return apiFetch('GET', `/settings/values?${query}`);
}

export function getSettingsGroup(tab: string): Promise<unknown> {
  return apiFetch('GET', `/settings/groups/${encodeURIComponent(tab)}`);
}

export function updateSettings(options: Record<string, unknown>): Promise<unknown> {
  return apiFetch('PATCH', '/settings', options);
}

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

export function listFonts(): Promise<unknown> {
  return apiFetch('GET', '/fonts');
}

export function uploadFont(filePath: string, name?: string): Promise<unknown> {
  return uploadMultipart('/fonts', filePath, name ? { name } : {});
}

export function deleteFont(name: string): Promise<unknown> {
  return apiFetch('DELETE', `/fonts/${encodeURIComponent(name)}`);
}

// ---------------------------------------------------------------------------
// Text templates
// ---------------------------------------------------------------------------

export interface TextTemplateFields {
  text?: string;
  font_family?: string;
  font_size?: number;
  text_align?: string;
}

export function listTextTemplates(): Promise<unknown> {
  return apiFetch('GET', '/text-templates');
}

export function getTextTemplate(index: number): Promise<unknown> {
  return apiFetch('GET', `/text-templates/${index}`);
}

export function createTextTemplate(args: TextTemplateFields): Promise<unknown> {
  return apiFetch('POST', '/text-templates', args);
}

export function updateTextTemplate(index: number, args: TextTemplateFields): Promise<unknown> {
  return apiFetch('PATCH', `/text-templates/${index}`, args);
}

export function deleteTextTemplate(index: number): Promise<unknown> {
  return apiFetch('DELETE', `/text-templates/${index}`);
}

export function replaceTextTemplates(templates: TextTemplateFields[]): Promise<unknown> {
  return apiFetch('PUT', '/text-templates', { templates });
}

// ---------------------------------------------------------------------------
// Color library
// ---------------------------------------------------------------------------

export function getColorLibrary(): Promise<unknown> {
  return apiFetch('GET', '/color-library');
}

export function saveColorLibrary(library: Record<string, unknown>): Promise<unknown> {
  return apiFetch('PUT', '/color-library', library);
}

export function getColorLibraryUsages(id: string, type: string): Promise<unknown> {
  return apiFetch('GET', `/color-library/usages${buildQuery({ id, type })}`);
}

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------

export function getSystem(): Promise<unknown> {
  return apiFetch('GET', '/system');
}
