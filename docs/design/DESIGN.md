---
name: Monolith Dark
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#37393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#ffb690'
  on-secondary: '#552100'
  secondary-container: '#ec6a06'
  on-secondary-container: '#4a1c00'
  tertiary: '#c6c6c6'
  on-tertiary: '#303030'
  tertiary-container: '#676767'
  on-tertiary-container: '#e6e6e6'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  margin: 32px
---

## Brand & Style

This design system is engineered for utility, precision, and speed. It adopts a developer-centric aesthetic where functionality is prioritized over decoration. The design language sits at the intersection of **Minimalism** and **Neo-Brutalism**, utilizing high-contrast surfaces to eliminate visual noise and focus the user's attention on the task at hand.

The target audience consists of power users and developers who value efficiency and clarity. The UI evokes a sense of being "under the hood" of a powerful engine—raw, fast, and uncompromising. Visual hierarchy is established through stark black-and-white contrasts, punctuated by hyper-vibrant accent colors that signal interactivity and state changes.

## Colors

The color palette is built on a foundation of "True Black" to ensure maximum OLED efficiency and high-contrast legibility. 

- **Primary (#7C3AED):** A vibrant violet used for primary actions, active states, and focus indicators. 
- **Secondary (#F97316):** A high-energy orange reserved for secondary calls to action, warnings, or destructive buttons that require immediate attention.
- **Neutral (#FFFFFF):** Pure white is used for primary text and high-importance borders to maintain a crisp, sharp appearance.
- **Background (#000000):** All surfaces begin at pure black. Tiered depth is achieved through subtle border strokes rather than background elevation.

## Typography

The typography strategy pairs technical geometric forms with utilitarian sans-serifs. **Space Grotesk** is used for headlines and labels to provide a futuristic, technical character that mimics the look of monospaced fonts while maintaining superior readability. 

**Inter** is utilized for all body copy and prose. It provides a neutral, systematic foundation that ensures long-form content is easy to parse. All labels should be treated with uppercase styling and increased letter spacing to emphasize the "tool" aesthetic.

## Layout & Spacing

This design system uses a strict **8px grid system** (with a 4px half-step for micro-adjustments). Layouts are constructed using a 12-column fluid grid for desktop and a 4-column grid for mobile devices.

Margins and gutters are kept generous to prevent the high-contrast elements from feeling cluttered. Content should be grouped in clear, logical blocks defined by whitespace rather than heavy containers. The layout is "Top-Heavy," with clear breadcrumbs or utility bars always present at the top of the viewport.

## Elevation & Depth

In this design system, depth is not conveyed through shadows or blurs. Instead, it utilizes **Bold Borders** and **Tonal Layering** (Low-contrast outlines).

1.  **Surfaces:** All containers use a `1px` solid border. 
2.  **Inactive/Background:** Borders use a dark grey (#262626).
3.  **Active/Foreground:** Borders use White (#FFFFFF) or the Primary Accent.
4.  **Floating Elements:** Modals and tooltips do not use shadows; they use a thicker `2px` white border and a pure black background to "cut" through the interface. This reinforces the minimalist, flat aesthetic.

## Shapes

The shape language is strictly **Sharp (0px)**. Rounding is avoided to maintain the technical, architectural feel of the brand. Every button, input field, and card must have 90-degree corners. 

This lack of rounding creates a cohesive "grid" feel across the entire application, making every component feel like a module within a larger machine.

## Components

### Buttons
Buttons are high-contrast blocks. 
- **Primary:** Pure white background with black text. On hover, shifts to Primary Violet (#7C3AED) with white text.
- **Secondary:** Transparent background with a 1px white border. On hover, shifts to a solid orange background (#F97316).
- **Ghost:** No background, white text. Underline appears on hover.

### Input Fields
Inputs are black with a 1px border (#404040). Upon focus, the border turns white and the label (in Space Grotesk) shifts to the Primary color. There is no "glow" effect; the transition must be instant and crisp.

### Chips & Tags
Small, rectangular boxes with 1px borders. Use them for metadata or technical tags. Font size should be minimal (12px) using the label-mono style.

### Lists & Data Tables
Tables should not have row backgrounds. Use horizontal 1px lines (#262626) to separate items. Hovering over a row should change the border color of that row to white, providing a "selection" highlight without changing the background color.

### Cards
Cards are simple containers with 1px borders. Padding is standardized at 24px (lg spacing). They should be used sparingly, as the system prefers a "limitless" canvas feel where data is separated by rules and headers rather than boxes.