# Society Management UI Consistency Guidelines

This document outlines the design tokens, color palette, typography hierarchy, and visual principles for the Society Management System UI. Refer to this file whenever designing or editing frontend components.

---

## 1. Visual Theme (White + Purple)

The interface uses a clean, premium, high-contrast white base combined with rich purple and orchid accents.

### Color Palette

| Token Name | Hex Code | Role / Usage |
| :--- | :--- | :--- |
| **White Base** | `#FFFFFF` | Backgrounds for panels, cards, and primary views. |
| **Aura Off-White** | `#F8F6FC` | Global page background, subtle dividers, and zebra rows. |
| **Primary Purple** | `#6D28D9` | Brand primary color. Buttons, focused states, and hero headings. |
| **Deep Indigo** | `#4C1D95` | Dark state for primary buttons, active sidebar items, hover states. |
| **Orchid Light** | `#A78BFA` | Accent borders, secondary text highlights, interactive glows. |
| **Charcoal Dark** | `#1F1A24` | Main body text and heavy headers. High contrast, high readability. |
| **Charcoal Muted** | `#6B5F73` | Subtitles, labels, disabled text, and minor helper elements. |
| **Error Crimson** | `#DC2626` | Destructive actions, validation error states, and negative alerts. |
| **Success Emerald** | `#059669` | Paid bills, active status labels, and positive completions. |

---

## 2. Typography

- **Headers & Display Type**: `Plus Jakarta Sans`, sans-serif (Weights: `600` for subtitles/sub-headers, `700` for titles and main headers).
- **Body & Captions**: `Inter`, sans-serif (Weights: `400` for normal paragraphs, `500` for buttons and medium UI lists).

---

## 3. Signature Element: "The Aura Gate"

To elevate the visual styling above generic templates, select components (such as login boxes, dashboard status summaries, and active buttons) implement **The Aura Gate** style.

### Card Design
- **Background**: White `#FFFFFF` with extremely thin borders (`border border-purple-100`).
- **Glow Shadow**: A soft purple-tinted container shadow:
  ```css
  box-shadow: 0 8px 30px rgba(109, 40, 217, 0.04);
  ```
- **Hover Micro-interaction**: On hover, the border transitions to `border-purple-300` and the shadow deepens slightly, using custom CSS or tailwind:
  ```css
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 12px 40px rgba(109, 40, 217, 0.08);
  ```

---

## 4. Component Patterns

### Buttons
1. **Primary Button**: Background `#6D28D9`, text `#FFFFFF`, font-weight `500`, smooth transitions. Hover: `#4C1D95`. Active: scaled down slightly (`scale-95`).
2. **Secondary Button**: Background `#FFFFFF` with border `#A78BFA`. Text `#6D28D9`. Hover: background `#F8F6FC`.

### Form Fields
- Inputs should have a subtle border (`border-purple-100`) and placeholder color.
- Focus: Highlight with a purple ring (`focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500`).
- Error state: Border change to crimson `#DC2626` with red error labels.

### Layout & Spacing
- **Sidebar**: Sticky left layout with light purple borders, active states highlighted with a small left accent bar (`w-1 h-6 bg-purple-600 rounded-r-md`).
- **Page Container**: Max-width `max-w-7xl`, centered with uniform padding (`px-4 sm:px-6 lg:px-8 py-8`).
