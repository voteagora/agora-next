# UI Style Guide

## Design System

### Colors

**Primary semantic colors** (defined via CSS variables):

- `primary` - Main text and primary actions
- `secondary` - Secondary text
- `tertiary` - Tertiary text, lowest emphasis
- `neutral` - Background for neutral elements
- `wash` - Light background for secondary surfaces
- `line` - Border color
- `positive` - Success states and positive actions (#23B100)
- `negative` - Error states and negative actions (#C15049)
- `brandPrimary` - Primary brand color
- `brandSecondary` - Secondary brand color

**Grays** (agora-stone palette):

- `agora-stone-900` - #000000
- `agora-stone-700` - #4F4F4F
- `agora-stone-500` - #AFAFAF
- `agora-stone-100` - #E0E0E0
- `agora-stone-50` - #FAFAFA

**Vote-specific colors**:

- For: #06ab34
- Against: #d62600
- Abstain: #afafaf

**Usage patterns**:

- DO use semantic colors (primary, secondary, tertiary) for text hierarchy
- DO use `wash` for secondary surface backgrounds (cards, inputs, secondary buttons)
- DO use `line` for all borders
- DO use `positive`/`negative` only for meaningful states (success/error)
- DON'T use color for decoration - color should have meaning
- DON'T default to blue for links unless specifically called for

### Typography

**Font sizes** (from tailwind.config.js):

- `xs` - 0.75rem (12px) - Labels, badges
- `sm` - 0.875rem (14px) - Secondary text
- `base` - 1rem (16px) - Body text
- `lg` - 1.125rem (18px) - Emphasized text
- `xl` - 1.25rem (20px) - Small headings
- `2xl` - 1.5rem (24px) - Section titles
- `3xl` - 1.875rem (30px) - Large headings
- `4xl` - 2.25rem (36px) - Page titles

**Font weights**:

- `light` - 300
- `normal` - 400 (body text)
- `medium` - 500 (emphasized text)
- `semibold` - 600 (labels, section headings)
- `bold` - 700 (important elements)
- `extrabold` - 800 (page titles)

**Usage patterns**:

- DO use `text-2xl font-extrabold` for section titles (.gl_section_title)
- DO use `text-xs font-semibold text-secondary` for form labels
- DO use `text-sm text-secondary` for descriptive text
- DO use `font-medium` for buttons and interactive elements

### Spacing

**Common spacing scale** (from tailwind):

- 1 - 0.25rem (4px)
- 2 - 0.5rem (8px)
- 3 - 0.75rem (12px)
- 4 - 1rem (16px)
- 6 - 1.5rem (24px)
- 8 - 2rem (32px)
- 12 - 3rem (48px)

**Most common spacing values**:

- `gap-2` - Between related items
- `gap-4` - Between form fields
- `gap-6` - Between sections
- `gap-8` - Between major page sections
- `p-4` - Card padding
- `p-6` - Larger card padding
- `mt-12` - Section top margin

**Usage patterns**:

- DO use consistent gap values (2, 4, 6, 8)
- DO use `p-4` or `p-6` for card padding
- DO use `gap-6` or `gap-8` between major page sections

### Icons & Illustrations

**Icon sources**:

- Custom SVG icons in `/src/icons/`
- Lucide React icons (`lucide-react`)
- Radix UI icons for some UI components

**Icon sizing**:

- Small: `w-4 h-4` (16px)
- Default: `w-5 h-5` (20px)
- Medium: `w-6 h-6` (24px)
- Large: `w-8 h-8` (32px)

**Usage patterns**:

- DO use custom icons from `/src/icons/` when available
- DO respect icon original sizes - don't make icons bigger than designed
- DO use `className` props for color customization (e.g., `stroke-primary`, `fill-primary`)
- DON'T use emojis

### Borders & Border Radius

**Border styles**:

- Standard border: `border border-line`
- Border radius scale:
  - `rounded-md` - 0.375rem (small elements)
  - `rounded-lg` - 0.5rem (cards, buttons)
  - `rounded-xl` - 0.75rem (large cards)
  - `rounded-full` - Pills, circular buttons

**Usage patterns**:

- DO use `border border-line` for all borders
- DO use `rounded-lg` for buttons and standard cards
- DO use `rounded-xl` for major section containers
- DO use `rounded-full` for pill-shaped buttons and badges

### Shadows & Elevation

**Shadow styles**:

- `shadow-newDefault` - Standard elevation for cards/buttons: `0px 4px 12px rgba(0, 0, 0, 0.02), 0px 2px 2px rgba(0, 0, 0, 0.03)`
- `shadow-newHover` - Hover state: `0px 6px 16px rgba(0, 0, 0, 0.05), 0px 2px 2px rgba(0, 0, 0, 0.03)`
- `shadow-newPopover` - For popovers: `0px 4px 8px 0px rgba(var(--neutral), 0.11)`

**Usage patterns**:

- DO use `shadow-newDefault` for all cards and elevated surfaces
- DO use `shadow-newHover` for hover states
- DO use `shadow-newPopover` for dropdown menus and popovers
- DON'T overuse shadows - use sparingly for elevation hierarchy

### Animations & Transitions

**Transition durations**:

- `duration-75` - 75ms (very quick)
- `duration-100` - 100ms (quick)
- `duration-150` - 150ms (standard)
- `duration-200` - 200ms (slower)
- `duration-300` - 300ms (smooth)

**Common patterns**:

- `transition-colors` - For color changes
- `transition-all` - For multiple properties
- `hover:bg-wash` - Subtle hover backgrounds
- `hover:shadow-newHover` - Shadow on hover
- Accordion animations: `accordion-down` and `accordion-up` (0.2s ease-out)

**Usage patterns**:

- DO use `transition-colors` for hover states
- DO use `duration-150` or `duration-200` for most transitions
- DO use micro-interactions (e.g., hover states, button clicks)

## Layout Patterns

### Navigation

**Header navigation**:

- Horizontal tabs in a rounded pill container
- Sliding active indicator with smooth transitions
- Structure: rounded-full border with p-1, internal tabs with active shadow

**Tabs**:

- Default variant: Bold text with opacity change on active state
- Gray variant: `rounded-full` pills with `bg-wash` on active
- Bool variant: Toggle-style with shadow on active
- Underlined variant: Border-bottom on active state

**Usage patterns**:

- DO use horizontal nav pills for primary navigation (proposals, delegates, etc.)
- DO use tabs for content switching within a page
- DO use sliding indicators for visual feedback
- DON'T use buttons for navigation items

### Tables, Lists, Filters, Sorting

**Tables**:

- Full width of container
- Alternating row backgrounds: `bg-neutral` with `hover:bg-wash`
- Border between rows: `border-b border-line`
- Header: `font-medium text-tertiary` or `font-semibold text-secondary`
- Cell padding: `p-4`

**Lists**:

- Grid layout for cards: responsive columns
- Delegates use: grid layout that switches to table view
- List items have full-width hover states

**Filters & Sorting**:

- Filters in dropdown menus (FilterResetListbox component)
- Sort icon with dropdown
- Active filter count badges
- Reset functionality
- Apply/Cancel actions in mobile view

**Usage patterns**:

- DO make table rows span full width
- DO use grid layout for card views (responsive columns)
- DO provide both grid and list/table views when appropriate
- DO show active filter count
- DO provide reset functionality

### Page Layout Patterns

**Main container**:

- Max width: `max-w-[1280px]`
- Horizontal padding: `px-3 sm:px-8`
- Vertical margin: `my-3 sm:my-4`

**Common layouts**:

1. **Sidebar + Main content**:
   - Sidebar: `md:max-w-[330px] lg:max-w-[350px]`, sticky on desktop
   - Main: `flex-1 min-w-0`
   - Gap: `gap-6`
2. **Full-width section**:
   - Container with `max-w-7xl mx-auto`
3. **Two-column split**:
   - Grid: `md:grid-cols-[1fr_250px]`
   - Main content left, filters/sidebar right

**Background patterns**:

- Dotted background: `bg-dotted-pattern` (fixed position)
- Radial gradient overlay: `bg-radial-gradient` (fixed position)

**Usage patterns**:

- DO use consistent max-width (1280px)
- DO use grid layout with fractional widths (1/3, 2/3, 1/2, full)
- DO use sticky positioning for sidebars on desktop

### Alignment

**Center vs Left alignment**:

- Left-aligned: Most content (forms, cards, lists)
- Center-aligned: Empty states, loading states, hero sections

**Usage patterns**:

- DO left-align form inputs and labels
- DO left-align list/table content
- DO center-align empty states and placeholders
- DO center-align hero content

### Forms

**Form structure**:

- Vertical layout with `space-y-1` per field
- Labels: `text-xs font-semibold text-secondary`
- Required indicator: Red asterisk with `ml-1`
- Inputs: `border border-line bg-wash` with `rounded-lg` and `p-2` or `p-3`
- Descriptions: `text-xs text-tertiary`
- Error messages: `text-negative`

**Multi-column forms**:

- Use CSS Grid: `grid grid-cols-3 gap-3`
- Column spans: `col-span-2`, `col-span-3`
- Responsive: Default to single column on mobile

**Usage patterns**:

- DO use vertical spacing between fields (`space-y-1` or `gap-4`)
- DO use grid layout for complex forms
- DO show validation errors inline
- DO provide helper text for complex fields

### Content Separation

**Methods**:

1. **Whitespace**: Primary method - use `gap-6`, `gap-8`, `mt-12`
2. **Cards**: Secondary surfaces with `bg-wash` or `bg-neutral`, `border border-line`, `rounded-xl`
3. **Dividers**: `<Separator>` with `bg-line`, 1px height
4. **Background color changes**: Sections with different `bg-*` values

**Card pattern**:

```
border border-line
shadow-newDefault
rounded-xl
bg-wash or bg-neutral
p-4 or p-6
```

**Usage patterns**:

- DO prefer whitespace over cards when possible
- DO use cards for grouped content
- DON'T overuse cards - avoid nesting too deeply
- DO use horizontal separators sparingly

### Notifications & Messaging

**Toasts** (react-hot-toast):

- Success: Green toast with checkmark
- Error: Red toast
- Duration: 5000ms (5 seconds) for important messages
- Position: Top-center by default

**Banners** (inline alerts):

- Success: `bg-green-100 border-l-4 border-green-500 text-green-700 p-4`
- Info: Card-style with icon
- Empty states: `bg-wash rounded-xl shadow-newDefault border border-line` with centered text

**Tooltips**:

- Radix UI tooltip component
- `delayDuration={0}` or 200ms
- Small text with max-width constraint

**Usage patterns**:

- DO use toasts for temporary success/error feedback
- DO use banners for persistent page-level messages
- DO use tooltips for explanatory information
- DO use empty states with helpful messaging
