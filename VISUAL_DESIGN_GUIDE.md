# 🎨 Premium Theme - Visual Design Guide

## Color Palette Reference

### Primary Colors
```
Soft Cream Background:  #FFF9F3
├── Used for: Main page background
├── Contrast ratio: High with dark text
└── Creates: Premium, warm aesthetic

Golden Brown Primary:   #C9A27D
├── Used for: Buttons, accents, highlights
├── Accent: Gradients and hover states
├── Creates: Luxury restaurant feel

Dark Gold (Darker variant): #A68968
├── Used for: Button hover states
├── Paired with: Primary gold for gradients
└── Creates: Interactive depth
```

### Secondary Colors
```
White Cards:            #FFFFFF
├── Used for: Card backgrounds
├── Shadow: Subtle (0 2px 8px rgba(0,0,0,0.08))
└── Border: Transparent with 1px color overlay

Light Gray (Off-white): #F8F6F3
├── Used for: Subtle backgrounds, hover states
├── Contrast: Soft distinction from white
└── Usage: Alt backgrounds and disabled states

Medium Gray:            #D4CCCB
├── Used for: Borders, dividers
├── Opacity: Often at 10-20% opacity
└── Accent: Subtle visual separation

Dark Gray:              #5A5A5A
├── Used for: Text content, labels
├── Contrast: Good readability on light backgrounds
└── Usage: Primary text color throughout
```

### Semantic Status Colors
```
Success/Healthy:    #4CAF50 (Green)
├── Used for: "In Stock", completed orders, available riders
├── Background: 10-15% opacity on white cards
└── Badge: Color-coded status indicators

Warning/Low Stock:  #FFA500 (Orange)
├── Used for: Low stock items, pending items
├── Background: 10-15% opacity on white cards
└── Badge: Caution indicators

Danger/Critical:    #E74C3C (Red)
├── Used for: Out of stock, errors, critical alerts
├── Background: 10-15% opacity on white cards
└── Badge: Urgent status indicators

Info:               #3498DB (Blue)
├── Used for: Ready orders, information
├── Background: 10-15% opacity on white cards
└── Badge: Informational badges
```

---

## Typography Scale

### Headings
```
Page Title (h1):      32-36px, font-weight: 700
├── Color: #2D2D2D (dark gray)
├── Spacing: 12px margin-bottom
└── Example: "Inventory Dashboard"

Section Title (h2):   24px, font-weight: 700
├── Color: #2D2D2D
├── Spacing: 24px margin-top
└── Example: "Kitchen Live Status"

Card Title (h3):      18px, font-weight: 700
├── Color: #2D2D2D
└── Example: Card headers

Card Subtitle:        14px, font-weight: 600
├── Color: #5A5A5A
└── Example: Secondary text in cards
```

### Body Text
```
Primary Text:         14px, font-weight: 400, color: #2D2D2D
Secondary Text:       13px, font-weight: 400, color: #5A5A5A
Helper Text:          12px, font-weight: 400, color: #999999
Label Text:           12px, font-weight: 500, color: #666666
```

---

## Spacing System

### Gap/Padding Values
```
Extra Small:  4px (xs)
Small:        8px (sm)
Medium:       16px (base)
Large:        24px (lg)
Extra Large:  32px (xl)
2X Large:     48px (2xl)
```

### Component Spacing Examples
```
KPI Cards Grid:     gap-6 (24px between cards)
Card Internal:      p-6 (24px padding inside)
Button Spacing:     px-6 py-3 (24px horizontal, 12px vertical)
Form Fields:        gap-4 (16px between inputs)
List Items:         space-y-3 (12px between items)
```

---

## Border Radius Guidelines

```
Small Components:        border-radius: 8px
├── Input fields
├── Small buttons
└── Mini badges

Standard Components:     border-radius: 12px
├── Dialog triggers
├── Filter buttons
└── Action buttons

Medium Components:       border-radius: 16px
├── Ingredient cards
├── Order cards
└── Status badges

Large Components:        border-radius: 18-20px
├── KPI cards
├── Main card sections
└── Modal dialogs

Full Circle:            border-radius: 50%
├── Avatar images
├── Status indicators
└── Rider avatars
```

---

## Shadow System

### Shadow Hierarchy
```
Level 1 (Subtle):       box-shadow: 0 2px 8px rgba(0,0,0,0.08)
├── Used for: Cards at rest
├── Effect: Barely noticeable depth
└── Example: Ingredient cards

Level 2 (Medium):       box-shadow: 0 4px 16px rgba(0,0,0,0.1)
├── Used for: Elevated cards, modals
├── Effect: Clear visual separation
└── Example: KPI cards, dialogs

Level 3 (Strong):       box-shadow: 0 8px 24px rgba(0,0,0,0.12)
├── Used for: Top-level elements, overlays
├── Effect: Strong prominence
└── Example: Floating action buttons

Level 4 (Very Strong):  box-shadow: 0 12px 32px rgba(0,0,0,0.15)
├── Used for: Modals, dropdowns
├── Effect: Maximum prominence
└── Example: Important dialogs
```

---

## Button Styles

### Primary Button
```
Background:    Linear gradient (135deg, #C9A27D, #A68968)
Text:          White, 14px, font-weight: 600
Padding:       12px 24px (py-3 px-6)
Border Radius: 12px
Shadow:        0 4px 12px rgba(201, 162, 125, 0.2)
Hover Effect:  translateY(-2px), stronger shadow
Active:        Scale 0.98
```

### Secondary Button
```
Background:    #F8F6F3 (light gray)
Text:          #5A5A5A, 14px, font-weight: 500
Padding:       10px 20px (py-2.5 px-5)
Border:        1px solid #D4CCCB
Border Radius: 12px
Hover:         Border color to #C9A27D, text to gold
Active:        Background to white
```

### Outline Button
```
Background:    Transparent or white
Text:          #5A5A5A, 14px, font-weight: 500
Border:        1px solid #D4CCCB
Hover:         Border to gold, text to gold
Active:        Text color to primary gold
```

---

## Badge & Status Styles

### Status Badge (Success)
```
Background:    rgba(76, 175, 80, 0.15) - 15% opacity green
Text Color:    #4CAF50
Border:        1px solid rgba(76, 175, 80, 0.3)
Border Radius: 20px (pill shape)
Padding:       6px 14px
Font Size:     12px, font-weight: 600
Letter Spacing: 0.5px
```

### Status Badge (Warning)
```
Background:    rgba(255, 165, 0, 0.15)
Text Color:    #FFA500
Border:        1px solid rgba(255, 165, 0, 0.3)
[Other properties same as success]
```

### Status Badge (Danger)
```
Background:    rgba(231, 76, 60, 0.15)
Text Color:    #E74C3C
Border:        1px solid rgba(231, 76, 60, 0.3)
[Other properties same as success]
```

### Status Badge (Info)
```
Background:    rgba(52, 152, 219, 0.15)
Text Color:    #3498DB
Border:        1px solid rgba(52, 152, 219, 0.3)
[Other properties same as success]
```

---

## Card Components

### KPI Card Layout
```
Background:    Linear gradient (135deg, #FFFFFF, #F8F6F3)
Border:        1px solid rgba(201, 162, 125, 0.1)
Border Radius: 16px
Padding:       24px
Shadow:        0 2px 8px rgba(0,0,0,0.08)

Top Accent Bar: 4px solid [color based on metric]

Content:
├── Icon container (40x40px)
├── Label (12px, uppercase, gray)
├── Value (28px, bold, dark gray)
└── Subtext (optional, 12px, muted)
```

### Ingredient Card Layout
```
Background:    #FFFFFF
Border:        2px solid rgba(201, 162, 125, 0.1)
               Left border: 6px solid [status color if low]
Border Radius: 18px
Padding:       20px
Shadow:        0 2px 8px rgba(0,0,0,0.08)
Hover:         Shadow 0 4px 16px, translateY(-4px)

Status Badge:
├── Position: Absolute top-right (16px, 16px)
├── Border Radius: 12px
├── Padding: 6px 12px
├── Font Size: 11px, uppercase, bold
└── Color coded by status

Content Layout:
├── Header section with icon & name
├── Stock level section with progress bar
├── Usage rate badge
├── Divider line
└── Action buttons (2 buttons, flex gap-2)
```

### Order Card Layout
```
Background:    #FFFFFF
Border:        2px solid #E0E0E0
               Left border: 6px solid [status color]
Border Radius: 18px
Padding:       24px
Shadow:        0 2px 8px rgba(0,0,0,0.08)
Hover:         Shadow 0 4px 16px, translateY(-4px)

Content:
├── Header: Badge + Name + Amount
├── Items: Comma-separated list
├── Divider
├── Distance & ETA with icons
├── Rider info if assigned
├── Divider
└── Action button (full width)
```

---

## Animation Guidelines

### Timing Functions
```
Spring Animation:    type: 'spring', stiffness: 300, damping: 25
├── Use for: Component entrance, interactive elements
└── Feel: Natural, bouncy

Linear:              ease: 'linear'
├── Use for: Moving objects (bikes on map)
└── Feel: Constant, continuous motion

Ease-Out:            ease: 'easeOut'
├── Use for: Fading in, sliding in
└── Feel: Natural deceleration

Cubic Bezier:        ease: [0.4, 0, 0.2, 1]
├── Use for: Material Design feel
└── Feel: Professional, smooth
```

### Animation Durations
```
Micro:      150-250ms  (Hover states, quick transitions)
Short:      300-500ms  (Component entrance, fade effects)
Medium:     500-800ms  (Card animations, larger movements)
Long:       1000-2000ms (Page transitions, complex sequences)
```

### Animation Effects
```
Entrance:           opacity 0→1, transform translateY/scale
Hover:              scale 1→1.02, shadow enhancement
Exit:               opacity 1→0, transform translateY outward
Stagger:            delay: index * 0.05 or 0.1
Continuous:         repeat: Infinity, repeatType: 'reverse'
```

---

## Component Examples

### KPI Card Visual
```
┌─────────────────────────────┐
│ ▯ Total Ingredients         │  ← Icon (24x24)
│                             │
│ 67                          │  ← Large value
│ TOTAL ITEMS IN INVENTORY    │  ← Gray label
└─────────────────────────────┘
   Shadow underneath
```

### Ingredient Card Visual
```
┌────────────────────────────────────┐
│ 🌾 Rice                   IN STOCK │
│    Grains                          │
│                                    │
│ Stock Level              60.5 kg   │
│ ██████████░░░░░ 75%               │
│ Min: 50 kg                         │
│                                    │
│ Usage Rate: HIGH                   │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│ [Add Purchase]  [Update Stock]    │
└────────────────────────────────────┘
```

### Order Card Visual
```
┌────────────────────────────────────┐
│ #ORD-8821          ₹650            │
│ Priya Sharma                       │
│ Flat 402, Green Heights            │
│                                    │
│ Butter Chicken, Naan               │
│                                    │
│ 📍 3.2 km    🕐 12:50 PM           │
│                                    │
│ 🚗 Rahul Kumar | KA-01-AB-1234     │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│        [Assign Rider]              │
└────────────────────────────────────┘
```

---

## Responsive Design Breakpoints

### Mobile (< 768px)
```
- Single column layouts
- Full-width cards
- Stacked sections
- Bottom navigation for actions
- Smaller padding (16px)
- Font sizes reduced by 1-2px
```

### Tablet (768px - 1024px)
```
- 2-column grids
- Medium padding (20px)
- Optimized spacing
- Side panel compatibility
- Touch-friendly button sizes
```

### Desktop (> 1024px)
```
- 3-4 column grids
- Standard padding (24px)
- Full feature set visible
- Hover effects enabled
- Larger font sizes
```

---

## Accessibility Considerations

### Color Contrast
- Text on light backgrounds: #5A5A5A (minimum WCAG AA)
- Status colors: Always include text fallback
- Badges: Combine color + icon/text

### Focus States
- All buttons have visible focus outline
- Tab navigation order: Left to right, top to bottom
- Focus indicator color: Gold (#C9A27D)

### Text Alternatives
- Icons paired with text labels
- Alt text for product images
- Aria labels for interactive elements
- Semantic HTML structure maintained

---

## Implementation Tips

1. **Use CSS Variables**: All colors use `var(--premium-gold)` pattern
2. **Consistent Spacing**: Use the spacing system consistently
3. **Semantic HTML**: Use `<button>`, `<header>`, `<nav>` appropriately
4. **Accessibility**: Include alt text and ARIA labels
5. **Performance**: Limit animations to interactive elements
6. **Testing**: Check colors with contrast analyzers

---

**This guide ensures visual consistency across the premium theme.**

Last Updated: February 2026
