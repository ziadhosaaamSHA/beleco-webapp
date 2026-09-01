---
name: beleco-v2-dev-standards
description: Enforces all Beleco v2 development requirements, architectural patterns, clean service layer boundaries, bespoke design system tokens, and UX feedback standards.
---

# Beleco v2 Development Standards & Architecture Skill

This skill contains the mandatory requirements, architectural boundaries, design system tokens, and UX rules for building the **Beleco v2** web application.

---

## 1. Core Architectural Constraints

### 1.1 Strict Aesthetics: Zero Gradients, Zero Emojis, Clean SVG Icons
- **NO Gradients**: All UI surfaces must use clean, solid, luxury flat colors and refined borders. No multicolor gradients or rainbow effects.
- **NO Emojis**: Never use emojis in UI buttons, titles, cards, or alerts (e.g. no 📷, 🎪, ✓ emojis). Use clean, crisp, scalable SVG icons (Lucide/Heroicons).
- **NO AI Slop**: Professional, bespoke e-commerce luxury aesthetic with precise typography and intentional micro-interactions.

### 1.2 Clean Layered Architecture
- **Presentation Layer (`src/app/`, `src/components/`)**:
  - UI components and pages must **NEVER** contain direct Firebase SDK calls or inline `fetch` logic.
  - Components **ONLY** call custom React hooks (e.g. `useProducts`, `useOrders`, `useBazaarPOS`) or receive data via props.
- **Service Layer (`src/services/`)**:
  - All database reads/writes, Firebase Auth operations, Storage uploads, and external scraping APIs are encapsulated in typed service files (`products.service.ts`, `orders.service.ts`, `bazaar.service.ts`, etc.).
- **Type Contracts (`src/types/`)**:
  - Every entity (`Product`, `Order`, `Reel`, `BazaarSale`, `UserProfile`, `ApiError`) must have a strict TypeScript interface.
  - Zero `any` types allowed.

---

## 2. Bespoke Brand Design System & Color Shades

Anchored around Primary `#f0660e` with systematic shade scales (50 to 950) configured in Tailwind CSS:

### 2.1 Primary Color Scale — Beleco Sun Tangerine (`#f0660e`)
- `primary-50` (`#FEF6EE`): Ultra-light warm surface & subtle badge backgrounds.
- `primary-100` (`#FDEBD7`): Active tab pill backings, soft chips.
- `primary-200` (`#FBD4AF`): Subtle component borders & hover backgrounds.
- `primary-300` (`#F7B57D`): Secondary interactive accents.
- `primary-400` (`#F38D43`): Focus rings & gradient mid-stops.
- **`primary-500` (`#F0660E`) [BASE PRIMARY]**: Main CTA buttons, active tab indicators, brand logo highlight, floating actions.
- `primary-600` (`#D64E07`): Primary button hover & active press states.
- `primary-700` (`#B03908`): Deep terracotta text links & dark gradient anchors.
- `primary-800` (`#8C2E0E`): High-contrast category tags.
- `primary-900` (`#73280F`): Deepest text emphasis.

### 2.2 Secondary Color Scale — Rich Espresso & Warm Neutrals (`#241A14`)
- `neutral-50` (`#FBF9F8`): Clean canvas white & root screen background.
- `neutral-100` (`#F5F1EE`): Card surface fill, input default backings.
- `neutral-200` (`#E8E0D9`): Standard borders, input outlines, table dividers.
- `neutral-300` (`#D3C5BA`): Disabled states & muted borders.
- `neutral-400` (`#A89485`): Placeholder text, inactive tab icons.
- `neutral-500` (`#7A6658`): Secondary labels, timestamps, subtitle copy.
- `neutral-600` (`#5D4B3E`): Category titles, readable subheadings.
- `neutral-700` (`#46372D`): High-contrast body text.
- `neutral-800` (`#34271F`): Headings, product titles.
- **`neutral-900` (`#241A14`) [BASE SECONDARY]**: Admin topbars, scanner actions, deep luxury dark surfaces.
- `neutral-950` (`#140E0A`): Maximum contrast elements.

### 2.3 Tertiary Color Scale — Golden Amber / Souq Gold (`#D49B44`)
- `tertiary-50` (`#FDF9F0`): VIP badge background tint.
- `tertiary-100` (`#FAF0DB`): Influencer picks tag fill.
- `tertiary-500` (`#D49B44`) [BASE TERTIARY]: Bazaar ticket perforation highlights, star ratings, VIP badges.
- `tertiary-700` (`#925C23`): Dark gold text.

### 2.4 Semantic Scales
- **Success Sage**: `50: #F2F9F4`, `500: #2E8B57`, `700: #1E5C39` (Order delivered, sale confirmed).
- **Danger Crimson**: `50: #FEF2F2`, `500: #DC2626`, `700: #991B1B` (Refund/delete actions, error toasts).
- **Info Sky**: `50: #F0F9FF`, `500: #0284C7`, `700: #0369A1` (Order tracking, announcements).

### 2.2 Typography Scale & Heading Component
- **Editorial Headings**: `'Fraunces', serif` (Weights: 600, 700)
- **Arabic UI / Body**: `'Cairo', sans-serif` (Weights: 400, 500, 600, 700, 800)
- **Numbers / Admin Barcodes**: `'Manrope', sans-serif` (Weights: 600, 700, 800)

**Standardized `<Heading />` Component Variants (`@/components/ui/Heading`)**:
- `editorial-h1`: Large luxury page titles (Fraunces 26–30px, bold).
- `section-title`: Feed section titles (Cairo 18–20px, bold).
- `card-title`: Product/item names (Cairo 15–16px, semibold).
- `metric-value`: Key numbers/prices (Manrope 22–28px, bold tabular).
- `subheading`: Section descriptions (Cairo 13–14px, muted).
- `badge-label`: Small uppercase / chip text (Cairo/Manrope 10–11px, bold).

### 2.3 8-Point Spacing & Elevation System
- **Micro**: `4px` (`gap-1`), `8px` (`gap-2`)
- **Components**: `12px` (`p-3`), `16px` (`p-4`)
- **Layout**: `24px` (`gap-6`), `32px` (`pt-8`)
- **Safe Area Insets**:
  - Top header padding: `calc(16px + env(safe-area-inset-top, 0px))`
  - Floating bottom bar: `bottom: calc(14px + env(safe-area-inset-bottom, 0px))`
  - Scroll container clearance: `padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px))`
- **Glassmorphism**:
  - Floating Nav: `bg-[#FFFBF8]/92 backdrop-blur-md border border-[#F0E4DA]/90 shadow-[0_14px_30px_-14px_rgba(43,29,20,0.28)]`

---

## 3. Shared Layouts & AppShell Architecture

Every page must be wrapped in its appropriate shared layout to prevent duplicated boilerplate:
1. `AppShell`: Constrains viewport (`max-w-md` centered on desktop), manages full-height (`100dvh + safe-area`).
2. `StandardPageLayout`: Scrollable view with sticky/static branded topbar, pull-to-refresh listener, and bottom clearance.
3. `DetailOverlayLayout`: Slide-in full overlay for details/checkout with sticky header and back button.
4. `AdminDashboardLayout`: Admin workspace layout with role validation and POS controls.

---

## 4. Mandatory UX Feedback Standards

### 4.1 Gesture-Based Pull-to-Refresh
- All major customer feed pages and admin lists must support a smooth downward swipe gesture (`usePullToRefresh`) that triggers a refetch without reloading the browser.

### 4.2 Skeletons vs Micro-Spinners
- **Initial Load & Filtering**: Display shimmering `Skeleton` cards that match the exact shape of products/orders to avoid layout shift (CLS).
- **Inline Actions**: Display compact button spinners while keeping the button dimensions fixed and preventing double-clicks.

### 4.3 Toasts & Confirmation Dialogs
- **Non-blocking notifications**: Use `ToastContext` (`showToast(message, type)`) for success/error notifications.
- **Sensitive actions** (Refund, Delete, Logout): Must trigger a styled modal confirmation via `ConfirmContext` (`confirmAction(...)`) before execution.

### 4.4 Bulletproof Error Fallbacks
- Network failures or empty query results must render dedicated fallback states with an illustrated icon, descriptive message, and an "إعادة المحاولة" (Retry) button.
