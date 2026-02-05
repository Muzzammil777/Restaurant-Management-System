# Deduction Feed - Visual Design Specifications

## Color Palette

### Background & Gradients
| Element | Color | Code | Use Case |
|---------|-------|------|----------|
| Feed Background | Slate-950 → Slate-900 | `from-slate-950 via-slate-900 to-slate-950` | Main container gradient |
| Card Background | Slate-800 semi-transparent | `from-slate-800/80 to-slate-800/40` | Entry card gradient |
| Hover Background | Slate-900 with transparency | `slate-900/30 to slate-950/50` | Container background |

### Accent Colors
| Element | Color | Code | Use Case |
|---------|-------|------|----------|
| Live Badge | Emerald-500 | `bg-emerald-500/20 border-emerald-500/40` | Live indicator background |
| Live Pulse | Emerald-400 | `bg-emerald-400 animate-pulse` | Animated dot in badge |
| Live Text | Emerald-300 | `text-emerald-300` | "LIVE STREAM" text |
| Checkmark | Emerald-400 | `text-emerald-400 drop-shadow-lg` | Success indicator icon |
| Timestamp | Emerald-300 | `text-emerald-300 font-mono` | Real-time clock display |

### Content Colors
| Element | Color | Code | Use Case |
|---------|-------|------|----------|
| Card Border | Slate-700 | `border-slate-700/60` | Entry card border |
| Border Hover | Emerald-500 | `hover:border-emerald-500/30` | On hover effect |
| Title Text | White | `text-white` | Dish name |
| Subtitle Text | Slate-500 | `text-slate-500` | Order ID |
| Badge Background | Slate-900 | `bg-slate-900/80` | Ingredient pill background |
| Badge Border | Slate-600 | `border-slate-600/80` | Ingredient pill border |
| Badge Text | Slate-200/300 | `text-slate-200/300` | Ingredient text |
| **Quantity (DEDUCTION)** | **Red-400** | **`text-red-400 font-bold`** | Negative amounts |
| Unit Text | Slate-400 | `text-slate-400` | Measurement unit |

### System Logic Panel
| Card | Background | Border | Text | Icon |
|------|-----------|--------|------|------|
| Live Connection | Emerald-50 gradient | Emerald-200 | Emerald-900 | CheckCircle2 |
| Restrictions | Red-50 gradient | Red-200 | Red-900 | AlertTriangle |
| Feed Behavior | Blue-50 gradient | Blue-200 | Blue-900 | Info |

---

## Typography

### Headers
- **Feed Title**: 20px, bold white, flex with icon
- **Feed Subtitle**: 14px, slate-400, muted description
- **Card Title (System Logic)**: 18px, bold, primary color

### Entry Content
- **Dish Name**: 18px, bold white, line-height normal
- **Order ID**: 12px, monospace, slate-500, margin-top 4px
- **Timestamp**: 12px, monospace, emerald-300, font-semibold

### Badges
- **Ingredient Name**: 12px, font-medium, slate-300
- **Quantity**: 12px, font-bold, red-400
- **Unit**: 12px, font-normal, slate-400

---

## Spacing & Sizing

### Card Dimensions
- **Feed Container Height**: 650px
- **Card Padding**: 6px (p-6)
- **Card Spacing**: 3px (space-y-3)
- **Ingredient Pill Spacing**: 8px gap (gap-2)

### Icon Sizing
| Icon | Size | Container |
|------|------|-----------|
| Checkmark (main) | 24px (h-6 w-6) | 48px (h-12 w-12) |
| Checkmark Container | 48 × 48px | Rounded-lg |
| ShoppingCart (header) | 20px (h-5 w-5) | - |

### Border Radius
- **Feed Card**: `rounded-xl` (11px)
- **Entry Cards**: `rounded-xl` (11px)
- **Icon Container**: `rounded-lg` (8px)
- **Checkmark Container**: `rounded-lg` (8px)
- **Live Badge**: `rounded-full` (50%)

---

## Shadows & Effects

### Drop Shadows
| Element | Shadow | Hover |
|---------|--------|-------|
| Feed Card | `shadow-lg` | - |
| Entry Card | `shadow-lg` | `shadow-emerald-500/10` |
| Checkmark | `drop-shadow-lg` | - |
| Header | - | - |

### Hover Effects
```css
Entry Card Hover: {
  border-color: emerald-500/30,
  box-shadow: emerald-500/10
}

Badge Hover: {
  border-color: emerald-500/50,
  transition: 200ms ease
}
```

### Animations
| Element | Animation | Duration | Type |
|---------|-----------|----------|------|
| Live Dot | Pulse | Infinite | `animate-pulse` |
| Entry Entry | Spring | 300ms | Initial: opacity 0, y -20 |
| Entry Animate | Spring | 300ms | opacity 1, y 0 |
| Ingredient Pill | Spring | 200ms + delay | Stagger by 50ms each |
| Empty State | Fade-in | 400ms | opacity 0 to 1 |

### Animation Config (Framer Motion)
```tsx
transition={{ 
  duration: 0.3, 
  type: 'spring', 
  stiffness: 300, 
  damping: 30 
}}
```

---

## Layout Structure

### Feed Container
```
┌─ Overlay (gradient, pointer-events-none) ─────────────┐
│                                                        │
├─ Live Badge (absolute, top-4 right-6) ────────────────┤
│  [● LIVE STREAM]                                      │
│                                                        │
├─ Header (z-20, bg-gradient, backdrop-blur) ──────────┤
│  🛒 Real-time Deduction Feed                          │
│  Live stream of stock being deducted...              │
│                                                        │
├─ Content Area (flex-1, overflow-y-auto) ────────────┤
│  ┌─ Entry 1 (Spring Animation) ───────────────────┐ │
│  │ ✅ [Emerald Bg] Margherita Pizza  hh:mm:ss    │ │
│  │    ORD-1234                                   │ │
│  │    [🏷️ Cheese −0.1 kg] [🏷️ Tomato −0.15 kg]  │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─ Entry 2 (Spring Animation) ───────────────────┐ │
│  │ ✅ [Emerald Bg] Chicken Biryani  hh:mm:ss     │ │
│  │    ORD-5678                                   │ │
│  │    [🏷️ Rice −0.25 kg] [🏷️ Chicken −0.2 kg]   │ │
│  └─────────────────────────────────────────────────┘ │
│  ... (50 entries max)                                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Entry Card Structure
```
┌─ Card (gradient bg, rounded-xl) ─────────────────┐
│ ┌─ Icon Area ─┐                                  │
│ │   ✅        │  ┌─ Content Area ──────────────┐ │
│ │ [Emerald]   │  │ [Dish Name] [Timestamp]    │ │
│ │             │  │ Order ID                   │ │
│ │             │  │                            │ │
│ │             │  │ [Pill] [Pill] [Pill]...   │ │
│ └─────────────┘  └────────────────────────────┘ │
│                                           [#1]   │
└─────────────────────────────────────────────────┘
```

---

## Responsive Behavior

### Grid Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Feed Card: 1 col on mobile, 2 cols on lg */}
  <Card className="lg:col-span-2 h-[650px]">...</Card>
  
  {/* System Logic: 1 col on mobile, 1 col on lg */}
  <div className="space-y-6">...</div>
</div>
```

### Mobile Adjustments
- Feed height: 650px (fixed, scrollable)
- Card padding: 6px (p-6) on all sizes
- Timestamps visible on mobile
- Ingredient pills wrap naturally
- Index indicator shown for top 3 entries only

---

## Interactive States

### Card States
| State | Properties |
|-------|-----------|
| Default | Border-slate-700/60, shadow-lg |
| Hover | Border-emerald-500/30, shadow-emerald-500/10 |
| Loading | Opacity reduced slightly |
| Active | Border brightness increased |

### Badge States
| State | Properties |
|-------|-----------|
| Default | bg-slate-900/80, border-slate-600/80 |
| Hover | border-emerald-500/50, transition 200ms |

### Empty State
- Large icon: `opacity-30`
- Text: `text-slate-600` (subtle)
- Background glow: `bg-emerald-500/20 blur-xl`

---

## Accessibility

### Color Contrast
- ✅ White on dark slate: 10+ contrast ratio
- ✅ Red quantities: Visible on all backgrounds
- ✅ Emerald accents: Distinct from backgrounds

### Focus States
- Entry cards have clear hover indication
- Badges change border on hover
- System logic cards have clear visual hierarchy

### Keyboard Navigation
- Feed is scrollable with arrow keys
- Cards are visually distinct
- Status updates announced via toast

---

## Performance Considerations

### Optimization Points
- **50-entry limit**: Prevents memory overflow
- **popLayout mode**: Smooth exit animations
- **useRef**: Prevents re-renders on scroll
- **memoization**: Derives stats efficiently
- **z-index layering**: Proper stacking context

### Rendering
- AnimatePresence mode: "popLayout" (layout animations)
- Initial: false (no initial animation)
- Exit animations: Smooth removal from DOM

---

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Chrome/Safari (iOS 14+)

**CSS Features Used:**
- Gradient backgrounds
- Transform animations
- Backdrop blur
- CSS variables
- Flexbox & Grid

---

## Theme Integration

- Uses existing Tailwind color palette
- No custom CSS files needed
- Compatible with dark/light mode settings
- Respects user system preferences

---

*Last Updated: February 5, 2026*
*Version: 1.0*
*Status: Production Ready ✅*
