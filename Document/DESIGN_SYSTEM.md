# Vyn — Design System
**Logistics Intelligence Platform · Frontend Design Reference**

> This document is the single source of truth for all UI decisions in the Vyn frontend. Every new component, page, or feature must follow these guidelines.

---

## 1. Brand Identity

| Property | Value |
|---|---|
| **Product Name** | Vyn |
| **Tag Line** | Detect. Diagnose. Deliver. |
| **Font** | Inter (Google Fonts) |
| **Base Border Radius** | `rounded-xl` (12px) — default for all interactive elements |
| **Logo Mark** | `Zap` icon from `lucide-react` paired with `VYNLYTICS` wordmark |

---

## 2. Color Tokens

All colors are defined as CSS custom properties inside `@theme {}` in `src/styles/tailwind.css` and are consumed as Tailwind utility classes (e.g., `bg-navy`, `text-orange`).

### 2.1 Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#1e3a5f` | Primary brand, sidebar bg, headings, heavy CTAs |
| `navy-light` | `#2b4f7e` | Hover state of navy elements |
| `navy-dark` | `#152c49` | Active/pressed state |
| `navy-50` | `#eff6ff` | Light navy tint for icon backgrounds |
| `navy-100` | `#dbeafe` | Bordered navy backgrounds |
| `navy-900` | `#0f1d30` | Darkest navy, backdrop overlays |
| `orange` | `#f97316` | Speed accent, primary CTA, interactive highlights |
| `orange-light` | `#fb923c` | Hover on orange elements |
| `orange-dark` | `#ea580c` | Active/pressed on orange |
| `orange-50` | `#fff7ed` | Soft warning / highlight backgrounds |
| `orange-100` | `#ffedd5` | Bordered orange backgrounds |
| `cyan` | `#0891b2` | Corporate secondary, analytic charts, info states |
| `cyan-light` | `#22d3ee` | Light cyan accents |
| `cyan-dark` | `#0e7490` | Active cyan |
| `cyan-50` | `#f0fdfa` | Subtle cyan backgrounds |

### 2.2 Semantic / Status Colors

| Token | Hex | Usage |
|---|---|---|
| `success` | `#059669` | Positive outcomes, "Analyzed" status, green badges |
| `success-light` | `#10b981` | Hover states on success |
| `success-50` | `#ecfdf5` | Success chip backgrounds |
| `warning` | `#d97706` | Warnings, caution states |
| `warning-50` | `#fffbeb` | Warning chip backgrounds |
| `danger` | `#dc2626` | Errors, destructive actions, "Failed" status |
| `danger-light` | `#ef4444` | Hover on danger elements |
| `danger-50` | `#fef2f2` | Error chip backgrounds |
| `anomaly` | `#7c3aed` | ML anomaly detections, risk signals |
| `anomaly-light` | `#8b5cf6` | Hover anomaly states |
| `anomaly-50` | `#f5f3ff` | Anomaly chip backgrounds |

### 2.3 Surface & Text Tokens

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#f8fafc` | Page backgrounds, inputs, hovered rows |
| `surface-dark` | `#f1f5f9` | Slightly heavier surfaces |
| `border` | `#e2e8f0` | All dividers and input borders |
| `border-dark` | `#cbd5e1` | Focused or hovered borders |
| `content-primary` | `#111827` | Main body copy, headings |
| `content-secondary` | `#475569` | Descriptive text, subheadings |
| `content-muted` | `#94a3b8` | Placeholder text, labels, captions |

---

## 3. Typography

All text uses **Inter** loaded via Google Fonts.

| Role | Class | Size | Weight | Use |
|---|---|---|---|---|
| Page H1 | `text-2xl font-bold` | 24px | 700 | Dashboard page titles |
| Section H2 | `text-xl font-bold` | 20px | 700 | Card headers, settings sections |
| Subheading H3 | `text-base font-semibold` | 16px | 600 | Widget headers |
| Body | `text-sm` | 14px | 400 | General copy |
| Caption | `text-xs` | 12px | 400 | Secondary metadata |
| Micro | `text-[11px]` | 11px | — | Tags, badge labels |
| Nano | `text-[10px]` | 10px | — | Keyboard shortcut hints |

> **Rule:** Never use `font-medium` for primary labels. Use `font-semibold` (600) for buttons, badge labels, and navigation items.

---

## 4. Spacing & Sizing

We use Tailwind's default 4px base scale throughout. Common values:

| Value | px | Common Usage |
|---|---|---|
| `gap-1.5` | 6px | Icon-to-text gaps inside badges |
| `gap-2` | 8px | Inline element spacing |
| `gap-3` | 12px | Form field groups |
| `gap-4` | 16px | Grid gaps |
| `gap-6` | 24px | Section spacing |
| `p-4` | 16px | Compact card padding |
| `p-5` | 20px | Standard card padding |
| `p-6` | 24px | Spacious card padding |
| `px-4 py-2` | — | Small button |
| `px-6 py-3.5` | — | Default button |
| `px-8 py-4` | — | Large button |

---

## 5. Shadows

| Token | Usage |
|---|---|
| `shadow-card` | Low-elevation card, default |
| `shadow-elevated` | Dropdowns, modals |
| `shadow-dropdown` | Context menus, autocomplete |
| `shadow-navbar` | Top navigation bar |

---

## 6. Border Radius

| Class | px | Application |
|---|---|---|
| `rounded-lg` | 8px | Input fields, table cells |
| `rounded-xl` | 12px | **Default** — cards, buttons, chips |
| `rounded-2xl` | 16px | Large cards, modals, page sections |
| `rounded-full` | — | Badges, avatars, progress bars |

---

## 7. Component API Reference

### 7.1 `Button` (`src/components/ui/Button.tsx`)

The universal interactive element. Supports routing, auth-awareness loading states, and icons.

```tsx
<Button
  variant="primary"    // 'primary' | 'secondary' | 'outline' | 'ghost' | 'navy'
  size="md"            // 'sm' | 'md' | 'lg'
  href="/pricing"      // renders as react-router <Link>
  icon                 // bool → shows ArrowRight icon, or pass ReactNode
  isLoading={false}    // shows Loader2 spinner, disables interaction
  smartAuth            // if true: routes to /app if logged in, /register if not
  onClick={() => {}}   // standard button handler
>
  Get Started
</Button>
```

| Variant | Background | Text | Use |
|---|---|---|---|
| `primary` | `orange` | White | Main CTAs |
| `secondary` | `surface` | Navy | Secondary actions |
| `navy` | `navy` | White | Dark theme CTAs |
| `outline` | Transparent | Navy | Ghost CTAs with border |
| `ghost` | Transparent | Secondary | Tertiary or icon-only |

---

### 7.2 `Input` (`src/components/ui/Input.tsx`)

```tsx
<Input
  id="email"
  type="email"
  label="Work Email"
  placeholder="your@email.com"
  error="This field is required"
  icon={<Mail className="w-4 h-4" />}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

- Always has a `label` prop for accessibility.
- `error` prop turns the border `danger` and renders error text underneath.
- `icon` is rendered on the left inside the field with `pl-10`.

---

### 7.3 `Badge` (`src/components/ui/Badge.tsx`)

Inline status chips using semantic color pairings.

```tsx
<Badge variant="success">Analyzed</Badge>
<Badge variant="warning">Processing</Badge>
<Badge variant="danger">Failed</Badge>
<Badge variant="info">Pending</Badge>
<Badge variant="anomaly">Anomaly</Badge>
```

- Uses `rounded-full`, always `uppercase`, `text-[11px] font-semibold`.
- Pair with `ring-1` for a polished bordered effect.

---

### 7.4 `Card` (`src/components/ui/Card.tsx`)

Standard card container.

```tsx
<Card className="p-6">
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>
```

- Default: `bg-white rounded-2xl border border-border shadow-card`.
- Use `hover:shadow-elevated transition-shadow` for interactive cards.

---

### 7.5 `Modal` (`src/components/ui/Modal.tsx`)

```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm Action">
  <p>Are you sure?</p>
  <div className="flex gap-3 pt-4">
    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

- Renders a `fixed inset-0 z-[50]` backdrop with `bg-navy-900/40 backdrop-blur-sm`.
- Modal panel: `bg-white rounded-2xl shadow-elevated`.

---

### 7.6 `Toast` / `showToast` (`src/components/ui/Toast.tsx`)

Global notifications. `ToastContainer` is mounted once in `App.tsx`.

```tsx
import { showToast } from '../../components/ui/Toast';

// Call from anywhere:
showToast('Password updated!', 'success');
showToast('Failed to save. Please try again.', 'error');
```

- Auto-dismisses after 4 seconds.
- Uses `slideInRight` animation.
- Green border for `success`, red border for `error`.

---

### 7.7 `Table` (`src/components/ui/Table.tsx`)

Responsive data table.

```tsx
<Table
  columns={[
    { key: 'name', header: 'Dataset' },
    { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  ]}
  rows={datasets}
  onRowClick={(row) => navigate(`/app/datasets/${row.id}`)}
/>
```

---

### 7.8 `EmptyState` (`src/components/feedback/EmptyState.tsx`)

Used for zero-data states in lists, search results, etc.

```tsx
<EmptyState
  icon={<Database className="w-8 h-8" />}
  title="No datasets yet"
  description="Upload your first CSV to get started."
  action={<Button href="/app/upload">Upload Dataset</Button>}
/>
```

---

### 7.9 `LoadingSpinner` (`src/components/feedback/LoadingSpinner.tsx`)

```tsx
<LoadingSpinner size="md" />   // 'sm' | 'md' | 'lg'
```

- Renders `Loader2` from lucide-react with `animate-spin` in `text-orange`.

---

## 8. Layout System

The app uses three distinct layout wrappers:

```
src/app/layout/
  ├── MainLayout.tsx      → Marketing pages (/,  /product, /solutions, /pricing, /about-us, /demo)
  ├── AuthLayout.tsx      → Auth pages (/login, /register, /forgot-password, /reset-password)
  └── DashboardLayout.tsx → Protected app (/app/*)
```

### 8.1 `MainLayout`
- Full-width with `Navbar` + `Footer`.
- Transparent-to-white navbar on scroll with `shadow-navbar`.

### 8.2 `AuthLayout`
- Two-column split: left side decorative panel (navy gradient) + right side centered form.
- Responsive: collapses to single column on mobile.

### 8.3 `DashboardLayout`
- Fixed sidebar (left) + scrollable main content area (right).
- Top header bar with a search trigger button (opens `CommandPalette`) and `UserDropdown`.
- Sidebar collapses to icon-only on narrow viewports via `collapsed` state.
- Active nav item uses: `bg-white/10 text-white font-semibold`.

---

## 9. Animation Utilities

### 9.1 Scroll-Reveal Classes
Apply these to sections on marketing pages for entrance animations as they scroll into view (wired via `IntersectionObserver`).

| Class | Effect |
|---|---|
| `.reveal` | Fade + slide up 40px |
| `.reveal-scale` | Fade + scale from 92% |
| `.reveal-left` | Fade + slide from left 30px |
| `.reveal-right` | Fade + slide from right 30px |

Add `.revealed` via JS when element enters viewport. Use `.stagger-1` through `.stagger-6` on children for cascading reveals.

### 9.2 Utility Animation Classes

| Class | Effect | Duration |
|---|---|---|
| `.animate-float` | Gentle vertical bob | 4s infinite |
| `.animate-float-delayed` | Staggered float | 5s, 1s delay |
| `.text-shimmer` | Orange→Cyan gradient shimmer | 4s loop |
| `.animate-pulse-glow` | Orange box-shadow pulse | 2.5s loop |
| `.animate-count-pop` | Scale pop for stats | 0.6s entrance |

### 9.3 Framer Motion Conventions

All page-level transitions and modal presence animations use `framer-motion`:

```tsx
// Standard entrance for tab content / cards
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
transition={{ duration: 0.2 }}
```

---

## 10. Navigation Components

### 10.1 `Navbar` (`src/components/navigation/Navbar.tsx`)
- Desktop: logo, product links, CTA buttons.
- Mobile: hamburger menu with full-screen slide-down overlay.
- Transparent → white-with-shadow on scroll.
- Logged-in state: shows user avatar and `openSearch` trigger.
- Not-logged-in state: shows "Login" link + "Start Free Trial" CTA.

### 10.2 `UserDropdown` (`src/components/navigation/UserDropdown.tsx`)
- Triggered by clicking user avatar in Navbar or DashboardLayout header.
- Shows: user full name, email, avatar initials.
- Links: Settings (`/app/settings`), 3 quick links, Logout action.

### 10.3 `CommandPalette` (`src/components/ui/CommandPalette.tsx`)
- Opened via `Cmd+K` / `Ctrl+K` keyboard shortcut or search button.
- **Auth-aware**: when user not logged in, `/app/*` routes are **hidden** from results.
- Attempting to access a protected route while not logged in: shows `showToast` error + redirects to `/login`.
- Navigation: `↑`/`↓` arrow keys, `Enter` to select, `Esc` to close.
- Global state managed by `useSearchStore` (Zustand).

---

## 11. Data Layer & Services

### 11.1 Architecture Pattern
All data fetching follows a **"Backend First, Mock Fallback"** pattern.

```
src/services/
  ├── api.ts              → Axios instance (base URL, auth token interceptor)
  ├── authService.ts      → login, register, forgotPassword, resetPassword, changePassword
  ├── dashboardService.ts → getDashboardData (with fallback mock stats)
  ├── datasetService.ts   → getDatasets, getDatasetById (with fallback mock list)
  └── billingService.ts   → getBillingStats (with fallback mock plan data)
```

### 11.2 Service Template

```typescript
export const myService = {
  getData: async (): Promise<MyData> => {
    try {
      const response = await api.get('/my-endpoint');
      if (response.data && isValidShape(response.data)) {
        return response.data;   // Real backend data
      }
      throw new Error('Invalid structure');
    } catch (error) {
      console.warn('Backend unavailable. Using fallback data.', error);
      return fallbackMockData; // Always defined above the service
    }
  },
};
```

### 11.3 React Query Usage

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['uniqueKey'],
  queryFn: myService.getData,
});

if (isLoading || !data) return <LoadingSpinner />;
```

- `queryKey` should be a unique, descriptive string array.
- Always show a `<LoadingSpinner />` or skeleton while loading.
- `useMutation` is used for all write operations (login, save, change-password).

---

## 12. State Management (Zustand Stores)

```
src/store/
  ├── authStore.ts    → isAuthenticated, user, token, setAuth, logout
  ├── searchStore.ts  → isOpen, openSearch, closeSearch, toggleSearch
  └── uiStore.ts      → misc global UI flags
```

### 12.1 `useAuthStore`
```tsx
const { isAuthenticated, user, logout } = useAuthStore();
```

### 12.2 `useSearchStore`
```tsx
const { openSearch, isOpen } = useSearchStore();
```

---

## 13. Routing Conventions

```
/                         → Landing page
/solutions/trucking       → Trucking solution
/solutions/warehouse      → Warehouse solution
/solutions/supply-chain   → Supply chain solution
/solutions/enterprise     → Enterprise monitoring
/demo                     → Interactive demo
/about-us                 → About page
/login                    → Login
/register                 → Register
/forgot-password          → Forgot password
/reset-password           → Reset password

/app                      → Dashboard home (protected)
/app/datasets             → Dataset list (protected)
/app/datasets/:id         → Dataset detail (protected)
/app/upload               → File upload (protected)
/app/analytics            → Analytics (protected)
/app/settings             → Settings page (protected)
```

> **Protected routes** are wrapped inside `DashboardLayout`. Access without auth redirects to `/login`.

---

## 14. UX Design Principles

1. **Smart Auth** — Every CTA checks `isAuthenticated` before routing.  When logged in, primary CTAs route to `/app`; when not, they route to `/register`.
2. **Graceful Degradation** — All backend fetches have mock fallback. The UI is always functional even when offline.
3. **Loading States** — Every async operation shows a spinner. Never leave the user staring at an empty white screen.
4. **Instant Feedback** — Every user action (save, delete, change password) responds with a `showToast` notification.
5. **Keyboard Navigation** — The `CommandPalette` is fully keyboard-navigable. Forms support `onBlur` validation.
6. **Responsive First** — All layouts are mobile-first. Sidebar collapses, grids stack vertically, and padding adjusts via `sm:` breakpoints.

---

## 15. Icon Library

**Source:** `lucide-react` — used exclusively throughout the project.

Common icon sizes:

| Context | Class |
|---|---|
| Navigation / sidebar | `w-5 h-5` |
| Inline with text (button/badge) | `w-4 h-4` |
| Page section header | `w-6 h-6` |
| Large empty state illustration | `w-8 h-8` or `w-10 h-10` |

---

## 16. Development Checklist

Before shipping any new page or component:

- [ ] Uses design tokens (no arbitrary hex values)
- [ ] Uses `font-semibold` (not `font-medium`) for interactive labels
- [ ] Loading state handled (`isLoading` guard)
- [ ] Error / empty state handled (`EmptyState` component or equivalent)
- [ ] Mobile responsive (tested at 375px width)
- [ ] Auth guard applied if accessing `/app/*`
- [ ] Toast feedback on success/error for mutations
- [ ] `CommandPalette` results updated if new routes are added
- [ ] `framer-motion` used for any enter/exit transitions
- [ ] New service follows the Backend-First Fallback pattern
