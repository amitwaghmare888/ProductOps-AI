# ProductOps AI — Design System
## Extracted from Stitch Project ID: 4326699612130521435

This design system defines the visual language for ProductOps AI Enterprise OS.

---

## Color Palette

### Primary Colors
- **primary**: `#d0bcff` (Purple 300)
- **primary-container**: `#a078ff` (Purple 400)
- **on-primary**: `#3c0091` (Purple 900)
- **on-primary-container**: `#340080` (Purple 950)
- **primary-fixed**: `#e9ddff` (Purple 100)
- **primary-fixed-dim**: `#d0bcff` (Purple 300)
- **on-primary-fixed**: `#23005c` (Purple 980)
- **on-primary-fixed-variant**: `#5516be` (Purple 700)
- **inverse-primary**: `#6d3bd7` (Purple 600)

### Secondary Colors
- **secondary**: `#c0c1ff` (Indigo 300)
- **secondary-container**: `#3131c0` (Indigo 700)
- **on-secondary**: `#1000a9` (Indigo 900)
- **secondary-fixed**: `#e1e0ff` (Indigo 100)
- **secondary-fixed-dim**: `#c0c1ff` (Indigo 300)
- **on-secondary-fixed**: `#07006c` (Indigo 980)
- **on-secondary-fixed-variant**: `#2f2ebe` (Indigo 700)
- **on-secondary-container**: `#b0b2ff` (Indigo 200)

### Tertiary Colors
- **tertiary**: `#adc6ff` (Blue 300)
- **tertiary-container**: `#4d8eff` (Blue 500)
- **on-tertiary**: `#002e6a` (Blue 900)
- **tertiary-fixed**: `#d8e2ff` (Blue 100)
- **tertiary-fixed-dim**: `#adc6ff` (Blue 300)
- **on-tertiary-fixed**: `#001a42` (Blue 980)
- **on-tertiary-fixed-variant**: `#004395` (Blue 800)
- **on-tertiary-container**: `#00285d` (Blue 900)

### Surface Colors
- **background**: `#0f131d` (Deep Space Dark)
- **surface**: `#0f131d` (Deep Space Dark)
- **surface-dim**: `#0f131d` (Deep Space Dark)
- **surface-bright**: `#353944` (Slate 700)
- **surface-container-lowest**: `#0a0e17` (Deep Space Darkest)
- **surface-container-low**: `#171c25` (Deep Space Dark+)
- **surface-container**: `#1b2029` (Deep Space Medium)
- **surface-container-high**: `#262a34` (Slate 800)
- **surface-container-highest**: `#31353f` (Slate 700)
- **surface-variant**: `#31353f` (Slate 700)
- **surface-tint**: `#d0bcff` (Purple 300)

### On-Surface Colors
- **on-surface**: `#dfe2f0` (Slate 100)
- **on-surface-variant**: `#cbc3d7` (Slate 300)
- **on-background**: `#dfe2f0` (Slate 100)
- **inverse-surface**: `#dfe2f0` (Slate 100)
- **inverse-on-surface**: `#2c303b` (Slate 850)

### Outline Colors
- **outline**: `#958ea0` (Slate 400)
- **outline-variant**: `#494454` (Slate 700)

### Error Colors
- **error**: `#ffb4ab` (Red 200)
- **error-container**: `#93000a` (Red 900)
- **on-error**: `#690005` (Red 950)
- **on-error-container**: `#ffdad6` (Red 100)

### Utility Colors
- **emerald-400**: `#34d399` (Success/Operational)
- **amber-400**: `#fbbf24` (Warning/Pending)
- **red-400**: `#f87171` (Error/Failed)

### Gradient Accents
- **purple-gradient**: `linear-gradient(to right, #8B5CF6, #6366F1)` (Violet 500 → Indigo 500)

---

## Typography

### Font Families
- **Primary (Sans-serif)**: `Geist`, system-ui, sans-serif
- **Monospace (Code)**: `JetBrains Mono`, Fira Code, monospace

### Type Scale

#### Display
- **display-lg**: 40px/48px, -0.03em, weight 700 (Headlines, Hero Text)

#### Headlines
- **headline-md**: 24px/32px, -0.02em, weight 600 (Section Titles)
- **headline-lg-mobile**: 32px/40px, -0.03em, weight 700 (Mobile Hero)

#### Body
- **body-base**: 14px/20px, -0.01em, weight 400 (Default Body Text)
- **body-bold**: 14px/20px, -0.01em, weight 600 (Emphasized Text)

#### Labels
- **label-caps**: 11px/16px, +0.08em, weight 700 (UPPERCASE LABELS)

#### Stats
- **stat-lg**: 28px/36px, -0.02em, weight 600 (Dashboard Metrics)

#### Code
- **code-block**: 12px/18px, weight 400 (Terminal, JSON)

---

## Spacing

### Base Scale
- **xs**: 4px
- **sm**: 8px
- **base**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px
- **gutter**: 24px (Content padding)

### Layout Margins
- **margin-mobile**: 16px
- **margin-desktop**: 32px

---

## Border Radius

- **DEFAULT**: 0.25rem (4px) - Buttons, Small Cards
- **lg**: 0.5rem (8px) - Medium Cards
- **xl**: 0.75rem (12px) - Large Cards
- **full**: 9999px - Pills, Avatars, Status Dots

---

## Elevation & Effects

### Glass Morphism
```css
background: rgba(18, 26, 42, 0.8);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.06);
```

### Hover Glow
```css
border-color: rgba(255, 255, 255, 0.15);
box-shadow: 0 0 15px rgba(208, 188, 255, 0.1);
```

### Ambient Glow (Background Accent)
```css
background: radial-gradient(circle at top left, rgba(208, 188, 255, 0.05) 0%, transparent 50%);
```

### Button Inset Highlight
```css
shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
```

### Terminal Background
```css
background-color: #070B14;
```

### Card Style (Bento)
```css
background-color: #121A2A;
border: 1px solid rgba(255, 255, 255, 0.06);
transition: border-color 0.3s ease;
```

---

## Components

### Navigation Bar (Sidebar)
- Width: 256px (16rem)
- Background: `surface`
- Border: Right border with `outline-variant`
- Active State: Left border `primary`, background `primary-container/10`

### Top App Bar
- Height: 64px (4rem)
- Background: `surface/80` with backdrop blur
- Border: Bottom border with `outline-variant`
- Sticky positioning

### Primary Button (CTA)
- Gradient: `from-[#8B5CF6] to-[#6366F1]`
- Text: White, `body-bold`
- Padding: px-4 py-2
- Border Radius: 8px
- Inset Highlight: `inset 0 1px 0 rgba(255,255,255,0.15)`
- Hover: Scale 1.02
- Shadow: Glow accent for emphasis

### Status Badge
- Background: Color/10 (10% opacity)
- Border: Color/20 (20% opacity)
- Text: Full color
- Border Radius: Full (pill shape)
- Padding: px-3 py-1

### Status Dot
- Size: 8px × 8px
- Border Radius: Full
- Colors:
  - Operational: `emerald-400` with pulse animation
  - Running: `amber-400` with pulse animation
  - Failed: `red-400` solid

### Card (Bento Style)
- Background: `#121A2A`
- Border: 1px solid rgba(255, 255, 255, 0.06)
- Border Radius: 12px
- Padding: 24px
- Hover: Border becomes rgba(255, 255, 255, 0.15)

### Terminal / Code Block
- Background: `#070B14`
- Font: `JetBrains Mono`, 12px
- Color: `on-surface`
- Border Radius: 8px
- Padding: 16px

### Agent Card
- Glass panel style
- Border with agent color (primary, tertiary, secondary)
- Icon: Material Symbols Outlined
- Status indicator (pulse dot)

### Input Field
- Background: `surface-variant`
- Border: `outline-variant/30`
- Focus: Border `primary`, ring `primary/20`
- Font: `body-base`
- Padding: px-3 py-2

### Scrollbar
- Width: 6px
- Track: Transparent
- Thumb: rgba(255, 255, 255, 0.1)
- Thumb Hover: rgba(255, 255, 255, 0.2)
- Border Radius: 4px

---

## Iconography

### Icon Library
- **Material Symbols Outlined** (Google Fonts)
- Weight range: 100-700
- Fill range: 0-1

### Common Icons
- `terminal` - Mission Control
- `dashboard` - Dashboard
- `analytics` - Pipeline Runs
- `smart_toy` - AI Agents
- `rocket_launch` - Deploy Action
- `notifications` - Alerts
- `grid_view` - App Launcher
- `check_circle` - Success Status
- `add` - Create Action
- `settings` - Configuration

---

## Animation

### Transitions
- Default duration: 200ms
- Easing: ease-out
- Properties: colors, transform, opacity

### Pulse Animation (Status Dots)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
animation: pulse 2s ease-in-out infinite;
```

### Cursor Blink (Terminal)
```css
@keyframes blink {
  50% { opacity: 0; }
}
animation: blink 1s step-end infinite;
```

### Hover Scale
```css
hover:scale-[1.02]
transition: transform 0.15s ease-out;
```

---

## Layout Patterns

### Dashboard Grid
- Max width: 1440px
- Spacing: `gutter` (24px) between elements
- Ambient glow overlay for depth

### Sidebar + Main Layout
- Sidebar: Fixed 256px, full height
- Main: flex-1, overflow-y-auto
- Padding: `gutter` (24px)

### Hero Section
- Display title (40px)
- Status badge inline
- Metadata (timestamp, counters)

### Bento Grid (Cards)
- Grid columns: Responsive (1-3 columns)
- Gap: 16px-24px
- Cards have equal heights per row

---

## Accessibility

### Focus Indicators
- Outline: 2px solid `primary`
- Offset: 2px
- Border radius: 4px

### Contrast Ratios
- All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Interactive elements have visible states

### Motion
- Respect `prefers-reduced-motion`
- All animations can be disabled

---

## Usage Guidelines

### When to Use Primary Color
- CTAs (Deploy, New Pipeline)
- Active navigation state
- Focus indicators
- Links and interactive elements

### When to Use Secondary Color
- Secondary actions
- Supporting UI elements
- Agent indicators (Alpha)

### When to Use Tertiary Color
- Informational elements
- Network/connection indicators
- Agent indicators (Network)

### Glass Effect Usage
- Overlay panels
- Floating elements
- Modal backgrounds

### Gradient Usage
- Primary CTA buttons only
- Hero sections (ambient)
- Do NOT overuse

---

## Code Integration

### Tailwind Config Location
`tailwind.config.js`

### Global Styles Location
`app/globals.css`

### Font Import
```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

---

**Design System Version**: 1.0  
**Last Updated**: 2026-07-06  
**Source**: Stitch Project 4326699612130521435
