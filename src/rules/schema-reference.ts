export const SCHEMA_REFERENCE = `
# Chamevo Data Schema Reference

Source: https://jsdoc.chamevo.com

---

## CVProduct

| Field | Type | Description |
|---|---|---|
| \`id\` | \`string?\` | Auto-generated from title if omitted |
| \`title\` | \`string?\` | Product display title |
| \`thumbnail\` | \`string?\` | Product thumbnail URL |
| \`views\` | \`CVView[]\` | Array of views |
| \`options\` | \`Partial<ChamevoOptions>?\` | Product-level option overrides |
| \`namesNumbers\` | \`NamesNumbersEntry[]?\` | Names & Numbers roster |

---

## CVView

| Field | Type | Description |
|---|---|---|
| \`id\` | \`string?\` | Auto-generated if omitted |
| \`title\` | \`string\` | Display title (e.g. "Front", "Back") |
| \`thumbnail\` | \`string?\` | Thumbnail image URL |
| \`elements\` | \`CVElementData[]\` | Elements on this view |
| \`options\` | \`Partial<ChamevoViewOptions>?\` | View-specific overrides (stageWidth, stageHeight, printAreas, …) |
| \`locked\` | \`boolean?\` | Whether view is locked/optional |
| \`isDynamic\` | \`boolean?\` | Dynamically added by user |
| \`namesNumbers\` | \`NamesNumbersEntry[]?\` | Persisted Names & Numbers entries |

---

## CVElementData

| Field | Type | Description |
|---|---|---|
| \`type\` | \`ElementType\` | Element category (see enum below) |
| \`title\` | \`string\` | Element identifier/name |
| \`source\` | \`string\` | URL for images; text string for text elements |
| \`parameters\` | \`ElementParameters & (TextParameters | ImageParameters)?\` | Element-specific parameters |

---

## ElementType (enum)

\`\`\`
"text"          — Single-line editable text
"textbox"       — Fixed-width text with auto-wrap
"curved-text"   — Text following a curved path
"neon-text"     — Text with neon glow effect
"engraved-text" — Text with engraved/etched styling
"image"         — Raster image, SVG, or upload zone
\`\`\`

---

## ElementParameters (base — all element types)

### Position & Transform
| Field | Type | Default |
|---|---|---|
| \`left\` | \`number\` | — |
| \`top\` | \`number\` | — |
| \`angle\` | \`number\` | 0 |
| \`scaleX\` | \`number\` | 1 |
| \`scaleY\` | \`number\` | 1 |
| \`opacity\` | \`number\` | 1 |
| \`flipX\` | \`boolean\` | false |
| \`flipY\` | \`boolean\` | false |
| \`originX\` | \`"center" | "left" | "right"\` | "center" |
| \`originY\` | \`"center" | "top" | "bottom"\` | "center" |

### Interaction Controls
| Field | Type | Description |
|---|---|---|
| \`draggable\` | \`boolean\` | Allow user to drag |
| \`rotatable\` | \`boolean\` | Allow rotation |
| \`resizable\` | \`boolean\` | Allow resizing |
| \`removable\` | \`boolean\` | Allow removal |
| \`copyable\` | \`boolean\` | Allow duplication |
| \`editable\` | \`boolean\` | Allow content editing |
| \`locked\` | \`boolean\` | Lock (unlock via Manage Layers) |
| \`uniScalingUnlockable\` | \`boolean\` | Allow override of proportional lock |
| \`minScaleLimit\` | \`number\` | Minimum scale threshold |

### Layering
| Field | Type | Description |
|---|---|---|
| \`z\` | \`number\` | Z-index; -1 = bottom, 10 = overlay |
| \`zChangeable\` | \`boolean\` | Allow user z-position changes |
| \`topped\` | \`boolean\` | Always render on top regardless of z |
| \`fixed\` | \`boolean\` | Persist across product changes |

### Colors & Appearance
| Field | Type | Description |
|---|---|---|
| \`fill\` | \`string | false\` | Color value or disabled |
| \`colors\` | \`string[] | false\` | Available color swatches |
| \`colorLinkGroup\` | \`string | false\` | Group color linking identifier |
| \`colorPrices\` | \`Record<string, number>\` | Per-color costs |
| \`colorLink3DLayer\` | \`string | false\` | 3D model layer association |
| \`shadowColor\` | \`string\` | Shadow color |
| \`shadowBlur\` | \`number\` | Shadow softness |
| \`shadowOffsetX\` | \`number\` | Horizontal shadow offset |
| \`shadowOffsetY\` | \`number\` | Vertical shadow offset |
| \`showInColorSelection\` | \`boolean\` | Display in color panel |

### Commerce & Export
| Field | Type | Description |
|---|---|---|
| \`price\` | \`number\` | Element base cost |
| \`sku\` | \`string\` | Stock keeping unit |
| \`excludeFromExport\` | \`boolean\` | Omit from print/export outputs |
| \`printAreaId\` | \`string | null\` | Assigned print region id |

### Behavior
| Field | Type | Description |
|---|---|---|
| \`autoCenter\` | \`boolean\` | Center on canvas when added |
| \`autoSelect\` | \`boolean\` | Select when added |
| \`replaceInAllViews\` | \`boolean\` | Sync changes across all views |
| \`boundingBox\` | \`BoundingBoxValue\` | Movement boundary (false, printAreaId string, or {x,y,width,height}) |

---

## TextParameters (extends ElementParameters)

| Field | Type | Description |
|---|---|---|
| \`fontFamily\` | \`string\` | Font family |
| \`fontSize\` | \`number\` | Size in px |
| \`fontWeight\` | \`string\` | "normal", "bold" |
| \`fontStyle\` | \`string\` | "normal", "italic" |
| \`textAlign\` | \`string\` | "left", "center", "right" |
| \`lineHeight\` | \`number\` | Line spacing multiplier |
| \`letterSpacing\` | \`number\` | Additional letter spacing |
| \`stroke\` | \`string | null\` | Stroke/outline color |
| \`strokeWidth\` | \`number\` | Stroke width |
| \`strokeColors\` | \`string[]\` | Available stroke colors |
| \`maxLength\` | \`number\` | Max characters (0 = unlimited) |
| \`maxLines\` | \`number\` | Max lines (0 = unlimited) |
| \`minFontSize\` | \`number\` | Minimum font size |
| \`maxFontSize\` | \`number\` | Maximum font size |
| \`textTransform\` | \`"none" | "uppercase" | "lowercase" | "capitalize"\` | Transform mode |
| \`chargeAfterEditing\` | \`boolean\` | Charge price only after editing |
| \`textPlaceholder\` | \`boolean\` | Names & Numbers text placeholder |
| \`numberPlaceholder\` | \`boolean | number[]\` | Names & Numbers number placeholder |
| \`textLinkGroup\` | \`string\` | Link text value across elements |
| \`widthFontSize\` | \`number\` | Scale font to fit width (0 = off; exclusive with heightFontSize) |
| \`heightFontSize\` | \`number\` | Scale font to fit height (0 = off; exclusive with widthFontSize) |
| \`curved\` | \`boolean\` | Enable curved text |
| \`curvable\` | \`boolean\` | Allow user to toggle curved/straight |
| \`curveRadius\` | \`number\` | Curve radius |
| \`curveReverse\` | \`boolean\` | Reverse curve direction |
| \`neonText\` | \`boolean\` | Enable neon glow effect |
| \`textBox\` | \`boolean\` | Fixed-width auto-wrap box |

---

## ImageParameters (extends ElementParameters)

| Field | Type | Description |
|---|---|---|
| \`filter\` | \`string | false | null\` | Filter: "grayscale", "sepia", etc. |
| \`colorMode\` | \`"tint" | "multiply" | "none"\` | Colorization blend mode |
| \`scaleMode\` | \`"fit" | "fill" | "stretch"\` | How image scales in its box |
| \`resizeToW\` | \`string | number\` | Resize to width (0 = no resize) |
| \`resizeToH\` | \`string | number\` | Resize to height (0 = no resize) |
| \`advancedEditing\` | \`boolean\` | Enable crop & filter UI |
| \`uploadZone\` | \`boolean\` | Use as customer upload zone |
| \`uploadZoneMovable\` | \`boolean\` | Allow zone movement |
| \`uploadZoneRemovable\` | \`boolean\` | Allow zone removal |
| \`svgFill\` | \`string | false | string[]\` | SVG path fill color(s) |
| \`adminLocked\` | \`boolean\` | Lock even in admin/editor mode |

---

## CVPrintAreaConfig

| Field | Type | Description |
|---|---|---|
| \`id\` | \`string?\` | Unique identifier referenced by elements via \`printAreaId\` |
| \`printingBox\` | \`{ left, top, width, height }\` | Position and size in **canvas pixels** |
| \`output\` | \`{ width, height, bleed }?\` | Physical output dimensions in **mm** |
| \`mask\` | \`PrintAreaMask | null\` | SVG mask configuration |
| \`showIndicator\` | \`boolean?\` | Show selection checkmark |
| \`showZoom\` | \`boolean?\` | Display zoom icon |
| \`showRuler\` | \`boolean?\` | Display ruler icon |
| \`showBoundingBox\` | \`boolean?\` | Show bounding box (default: true) |
| \`showBleedBox\` | \`boolean?\` | Show bleed box / crop marks (default: true) |
| \`color\` | \`string?\` | Active state color (default: "#2196F3") |
| \`placeholder\` | \`string? | null\` | Placeholder image URL when empty |
| \`printProfile\` | \`Partial<ChamevoPrintAreaOptions>[]?\` | Custom print profile overrides |
| \`exportOnly\` | \`boolean?\` | Whole-view output area: hidden in the customizer, composited on export (default: false) |
| \`excludeFromExport\` | \`boolean?\` | Design-only zone: interactive in the customizer, but **no print file** is produced for it. Mutually exclusive with \`exportOnly\` (default: false) |

---

## ChamevoOptions (key fields)

| Field | Type | Default |
|---|---|---|
| \`stageWidth\` | \`number\` | 900 |
| \`stageHeight\` | \`number\` | 600 |
| \`responsive\` | \`boolean\` | true |
| \`unitOfMeasurement\` | \`"mm" | "cm" | "in"\` | "mm" |
| \`fonts\` | \`FontDefinition[]\` | Arial, Lobster |
| \`elementParameters\` | \`Partial<ElementParameters>\` | Global element defaults |
| \`textParameters\` | \`Partial<TextParameters>\` | Global text defaults |
| \`imageParameters\` | \`Partial<ImageParameters>\` | Global image defaults |
| \`pricingRules\` | \`PricingRule[]\` | [] |
| \`maxPrice\` | \`number\` | -1 (unlimited) |
| \`printingBox\` | \`PrintingBox | null\` | null |
| \`watermark\` | \`string | false\` | false |
`.trim();
