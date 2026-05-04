# chamevo-mcp

MCP (Model Context Protocol) server that exposes the Chamevo WordPress plugin REST API as tools for AI assistants such as Claude Desktop.

## Prerequisites

- Node.js ≥ 18
- A running WordPress site with the Chamevo plugin active
- An API token from **Chamevo → General → API → API Token**

## Setup

```bash
cd _dev/apps/mcp-server
npm install
npm run build
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```
CHAMEVO_SITE_URL=https://your-site.com
CHAMEVO_API_TOKEN=your_token_here
```

> The API token is displayed (read-only) under **Chamevo → Settings → General → API** in the WordPress admin.

## Running

```bash
# Production
npm start

# During development (watch + rebuild on change)
npm run dev
```

## Claude Desktop integration

Add this block to your `claude_desktop_config.json` (found at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "chamevo": {
      "command": "node",
      "args": ["/absolute/path/to/_dev/apps/mcp-server/dist/index.js"],
      "env": {
        "CHAMEVO_SITE_URL": "https://your-site.com",
        "CHAMEVO_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

Restart Claude Desktop. The Chamevo tools will appear automatically.

---

## REST API reference

All endpoints live under `{CHAMEVO_SITE_URL}/wp-json/chamevo/v1` and require:

```
Authorization: Bearer <token>
```

---

### Products

#### `GET /products`

List design products.

| Query param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `search` | string | — | Filter by title |
| `category_id` | integer | — | Filter by category |

**Response**
```json
{
  "success": true,
  "data": [ { "id": 1, "title": "Classic Mug", ... } ],
  "meta": { "page": 1, "limit": 20 }
}
```

---

#### `POST /products`

Create a new product.

**Body (JSON)**
```json
{
  "title": "New Mug",
  "type": "catalog"
}
```

Alternatively, duplicate an existing product:
```json
{ "duplicate_product_id": 3 }
```

Or create from a template:
```json
{ "template_id": 7 }
```

**Response** `201`
```json
{ "success": true, "data": { "id": 42, "title": "New Mug" } }
```

---

#### `GET /products/{id}`

Get a single product.

| Query param | Type | Default | Description |
|---|---|---|---|
| `include_views` | boolean | false | Embed views array in response |

---

#### `PATCH /products/{id}`

Update a product. Send only the fields to change.

**Body (JSON)**
```json
{
  "title": "Renamed Mug",
  "thumbnail": "https://example.com/thumb.jpg",
  "sorted_views": [{ "id": 5 }, { "id": 3 }]
}
```

---

#### `DELETE /products/{id}`

Permanently delete a product and all its views.

---

### Product views

#### `GET /products/{id}/views`

List all views (print sides/angles) for a product.

---

#### `POST /products/{id}/views`

Add a new view to a product.

**Body (JSON)**
```json
{
  "title": "Back",
  "thumbnail": "https://example.com/back.png"
}
```

**Response** `201`
```json
{ "success": true, "data": { "id": 12, "product_id": 3 } }
```

---

### Views (standalone)

#### `GET /views/{id}`

Get a single view by ID.

#### `PATCH /views/{id}`

Update a view. Updatable fields: `title`, `thumbnail`, `options`, `elements`, `product_id`.

#### `DELETE /views/{id}`

Permanently delete a view.

---

### Orders

#### `GET /orders/{id}`

Retrieve customization data attached to a WooCommerce order.

| Query param | Type | Default | Description |
|---|---|---|---|
| `type` | string | `wc` | Order type adapter |
| `item_key` | string | `_fpd_data` | WP post meta key storing the design data |
| `item_id` | integer | — | Specific order item ID (omit for all items) |

**Response**
```json
{
  "success": true,
  "data": { "order_id": 100, "items": [ { ... } ] }
}
```

---

### Assets

#### `GET /assets`

List uploaded assets (images and PDFs) from the Chamevo uploads folder, sorted newest first.

| Query param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |

**Response**
```json
{
  "success": true,
  "data": [
    {
      "url": "https://example.com/wp-content/uploads/chamevo/uploads/2025/05/abc123.png",
      "filename": "abc123.png",
      "width": 1200,
      "height": 800,
      "size": 204800,
      "modified": 1746355200
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 47, "pages": 3 }
}
```

---

#### `POST /assets`

Upload an image (PNG, JPEG, SVG) or PDF. Send as `multipart/form-data` with a `file` field.

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.png" \
  https://your-site.com/wp-json/chamevo/v1/assets
```

**Response** `201`
```json
{
  "success": true,
  "data": {
    "image_src": "https://example.com/wp-content/uploads/chamevo/uploads/2025/05/abc123.png",
    "filename": "abc123",
    "width": 1200,
    "height": 800,
    "warning": null
  }
}
```

File constraints:
- Allowed types: PNG, JPEG, SVG, PDF
- Maximum size: configured under **Chamevo → Settings → Image Upload → Max file size** (default 10 MB)
- SVG files are sanitized (malicious content stripped) before storage
- JPEG files are EXIF-rotation-corrected automatically
- Files are pushed to the configured storage backend (local, S3, or Dropbox)

---

## Enabling / disabling controllers

Optional controllers can be toggled under **Chamevo → Settings → General → API → Enabled Controllers** in the WordPress admin.

| Setting | Controller | Routes affected |
|---|---|---|
| Products API | `ProductsController` | `/products`, `/views` |
| Assets API | `AssetsController` | `/assets` |

The Orders controller is always enabled (required for export workflows).

---

## Token rotation

To rotate the API token, clear the field under **Chamevo → Settings → General → API → API Token** and save. A new token is generated automatically on the next API request.

## MCP tools reference

| Tool | Description |
|---|---|
| `list_products` | Paginated product list |
| `get_product` | Single product by ID |
| `create_product` | Create blank, duplicate, or from template |
| `update_product` | Update title, thumbnail, options, view order |
| `delete_product` | Delete product and all views |
| `list_product_views` | Views for a product |
| `add_product_view` | Add a view to a product |
| `get_view` | Single view by ID |
| `update_view` | Update view fields or move to another product |
| `delete_view` | Delete a view |
| `get_order` | Customization data for a WooCommerce order |
| `list_assets` | Paginated asset listing |
| `upload_asset` | Upload a local file to Chamevo |
