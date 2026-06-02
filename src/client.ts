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

async function apiFetch(method: string, path: string, body?: unknown): Promise<unknown> {
  const { apiToken } = getConfig();
  const url = `${baseUrl()}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

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
// System
// ---------------------------------------------------------------------------

export function getSystem(): Promise<unknown> {
  return apiFetch('GET', '/system');
}
