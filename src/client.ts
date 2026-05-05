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

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export function listAssets(params?: { page?: number; limit?: number }): Promise<unknown> {
  return apiFetch('GET', `/assets${buildQuery({ ...params })}`);
}

export async function uploadAsset(filePath: string): Promise<unknown> {
  const { apiToken } = getConfig();
  const fileBuffer = readFileSync(filePath);
  const fileName = basename(filePath);

  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]), fileName);

  const response = await fetch(`${baseUrl()}/assets`, {
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
