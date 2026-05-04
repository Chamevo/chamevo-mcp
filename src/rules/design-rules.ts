export const DESIGN_RULES = `
# Chamevo MCP — Design Rules & Conventions

Follow these rules every time you create or update a product, view, or element via the Chamevo MCP tools.

---

## 1. View Composition Pattern

Every view for a physical product (apparel, phone case, mug, etc.) **must** include these layers in order:

| # | Layer | type | Key parameters |
|---|-------|------|----------------|
| 1 | **Base** | \`image\` | SVG or PNG mockup; \`z: -1\`, \`excludeFromExport: 1\`, \`topped: 0\`, \`locked: 0\`, \`showInColorSelection: 1\` |
| 2 | **Editable content** | \`text\` / \`image\` / upload zone | Customer-facing layers; \`draggable: 1\`, \`removable: 1\` |
| 3 | **Overlay** | \`image\` | Shading/highlight PNG; \`z: 10\`, \`topped: 1\`, \`excludeFromExport: 1\`, \`locked: 1\`, \`adminLocked: true\` |

Never skip the Overlay on physical product mockups — it provides the fabric shading that makes the mockup realistic.

---

## 2. Stage Dimensions (stageWidth × stageHeight, in px)

| Product type | Width | Height |
|---|---|---|
| Apparel (t-shirt, hoodie) | 600 | 660 |
| Flat (business card, sticker, poster) | 700 | 500 |
| Phone case | 440 | 660 |
| Mug / drinkware | 900 | 400 |
| Cap | 700 | 500 |

Set these in \`view.options.stageWidth\` / \`view.options.stageHeight\`.

---

## 3. Element Positioning

- Always set \`originX: "center"\` and \`originY: "center"\` on every element.
- \`left\` / \`top\` refer to the element's centre point in canvas pixels.
- A 600×660 canvas has centre at \`left: 300, top: 330\`.

---

## 4. Print Areas

- \`printingBox\` dimensions are in **canvas pixels**.
- \`output.width\` / \`output.height\` are in **millimetres (mm)**.
- Always set \`bleed\` (minimum **3 mm** for any print product, 5 mm recommended).
- Assign each editable element a \`printAreaId\` matching the print area's \`id\`.
- \`showBoundingBox: true\` and \`showBleedBox: true\` by default.

---

## 5. Valid Element Types

| Value | Use case |
|---|---|
| \`"text"\` | Single-line editable text |
| \`"textbox"\` | Multi-line text with auto-wrap |
| \`"curved-text"\` | Text following an arc |
| \`"neon-text"\` | Text with neon glow effect |
| \`"engraved-text"\` | Text with engraved/etched effect |
| \`"image"\` | Raster image, SVG, or upload zone |

---

## 6. Text Element Rules

Always set these fields:

\`\`\`json
{
  "printAreaId": "<matching print area id>",
  "fontFamily": "Lobster",
  "fontSize": 42,
  "minFontSize": 12,
  "maxFontSize": 72,
  "colors": ["#01192a", "#3498DB", "#E74C3C", "#FFFFFF", "#F1C40F"],
  "originX": "center",
  "originY": "center",
  "textAlign": "center",
  "editable": true
}
\`\`\`

- Set \`autoSelect: true\` on the **primary** editable text so it activates on load.
- Set \`curvable: 1\` to allow the customer to toggle curved text.
- Set \`maxLength\` to a reasonable limit (e.g. 30 for name fields).

---

## 7. Image Element Rules

| Scenario | Key flags |
|---|---|
| SVG base / color-changeable shirt | \`colorMode: "tint"\`, \`showInColorSelection: 1\`, \`colorLinkGroup: "color-shirt"\`, \`replaceInAllViews: 1\` |
| Customer upload zone | \`uploadZone: 1\`, \`uploadZoneMovable: 0\`, \`colorMode: "multiply"\` |
| Decorative overlay (tops all layers) | \`topped: 1\`, \`excludeFromExport: 1\`, \`locked: 1\`, \`adminLocked: true\` |
| Photo/PNG that should print | \`excludeFromExport: false\`, \`colorMode: "multiply"\` |

---

## 8. Color Palette

Use these swatches for \`colors\` arrays on elements:

\`\`\`
#FFFFFF  #000000  #3498DB  #E74C3C  #2ECC71  #F1C40F  #9B59B6  #34495E
\`\`\`

Never pass raw hex values that aren't in this palette unless the product requires a specific brand color.

---

## 9. Multi-View Products

- Use \`replaceInAllViews: 1\` on the Base SVG so shirt color changes apply to all views.
- Use \`colorLinkGroup: "color-shirt"\` consistently across all views to sync the color picker.
- Each view should have its own print area with a unique \`id\`.

---

## 10. Z-Index Conventions

| Layer role | z value |
|---|---|
| Base (bottom) | -1 |
| Customer content | 1, 2, 3 … |
| Overlay (top) | 10 |

Set \`topped: 1\` on the Overlay as a second safety net — it renders above all other z values regardless.
`.trim();
