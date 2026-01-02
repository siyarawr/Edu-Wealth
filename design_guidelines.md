# Design Guidelines: StudentHub - Notion-Inspired Student Platform

## Design Approach

**Notion-Inspired System**: Calm, productivity-focused aesthetic with block-based content architecture. Combines Notion's minimal interface patterns with strategic warmth for student engagement.

**Core Principles**:
- Content-first block architecture
- Hover-revealed interactions minimize visual noise
- Generous whitespace creates breathing room
- Subtle depth through shadows, not borders
- Monochromatic foundation with warm accent touches

## Typography System

**Primary Font**: Inter (Google Fonts) - consistent with Notion's choice
**Mono Font**: JetBrains Mono (financial data, code-like elements)

**Hierarchy**:
- Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Block Headers: text-lg font-semibold (18px)
- Body Text: text-base (16px)
- Metadata/Labels: text-sm text-gray-600 (14px)
- Micro-copy: text-xs text-gray-500 (12px)

## Layout System

**Spacing**: Tailwind units 2, 4, 6, 8, 12, 16, 24
- Block spacing: mb-6 to mb-8
- Section padding: py-16 to py-24
- Card internal: p-6 to p-8
- Sidebar: w-60, collapsible to w-14

**Containers**:
- Main content: max-w-5xl mx-auto
- Narrow reading: max-w-3xl
- Wide dashboards: max-w-7xl
- Form blocks: max-w-2xl

## Core Components

### Navigation

**Sidebar**: Fixed left navigation w-60, semi-transparent background with backdrop-blur. Logo at top, collapsible sections (Workspace, Finances, Academics, Career). Icons left-aligned with labels, hover state shows subtle background fill. Bottom section for user profile with avatar.

**Top Bar**: Sticky breadcrumb navigation, search bar with ⌘K hint, page actions on right (Share, Settings). Height h-14, minimal border-bottom.

### Block-Based Content

**Content Blocks**: Each section acts as draggable/reorderable block. Hover reveals drag handle icon on left, action menu (···) on right. Blocks have no borders, separated by whitespace (mb-8). Subtle shadow appears on hover (shadow-sm transition).

**Financial Summary Blocks**: Grid cards without borders, subtle background (bg-gray-50), rounded-xl, p-6. Large metric in JetBrains Mono, small trend indicator below. Mini sparkline at bottom using simple SVG path.

**Expense Tracker Block**: Full-width block, category rows with labels, inline progress bars (no borders, filled sections with warm accent), amounts right-aligned in mono font. Hover reveals edit/delete icons.

### Data Displays

**Table Blocks**: Borderless tables, header row with text-sm uppercase text-gray-600, data rows with hover:bg-gray-50. Padding py-3 px-4, subtle divider lines only. Transaction tables show date, category chip, description, amount (mono, right-aligned).

**Calendar View**: Full-width calendar block, minimal grid lines, seminar events as rounded pills with warm accent backgrounds, show only time + title. Click expands inline detail panel.

**Seminar Cards**: Horizontal layout, thumbnail left (aspect-video, rounded-lg), content right with title, speaker name, datetime metadata. Actions (Sign Up, Remind) appear on hover. Entire card clickable with subtle transform on hover.

### Forms & Inputs

**Inline Editing**: Clicking text converts to input field, similar to Notion. Input fields have no visible borders until focused, then subtle bottom border appears. Labels inline or above in text-sm.

**Block Forms**: Add Expense, Log Study Session forms as expandable blocks. Click "+" button reveals form fields that slide down. Form buttons minimal with subtle hover states.

### Modals & Panels

**Detail Panels**: Slide from right (w-1/2 lg:w-2/5), white background, close X top-right. Seminar details, scholarship info shown here with scrollable content, primary action button at bottom.

**AI Note Taker**: Persistent side panel (w-80) that slides in during seminar attendance. Live transcription feed, auto-highlighted key points, download button at bottom.

## Page Layouts

### Landing Page (5 Sections)

**Hero** (h-screen): Two-column layout. Left: headline text-5xl font-bold, subheading describing platform capabilities, two CTAs (Start Free + View Demo) with blurred backgrounds over hero image. Right: large dashboard screenshot showing actual interface at subtle 3D angle.

**Features Grid**: Four columns (grid-cols-4), each feature with warm accent icon, title, 2-line description. Focus on Finances, Seminars, Scholarships, Internships, Calculator, AI Notes.

**Social Proof**: Student testimonial cards, two-column grid, each with quote, student photo (rounded-full, 64px), name, university in metadata style.

**Stats Bar**: Single row, four metrics (Active Students, Scholarships Tracked, Avg. Savings, Seminars Listed), large numbers with subtle warm accent.

**Footer**: Multi-column layout (Features, Resources, Company, Connect), newsletter signup block, minimalist design with generous spacing.

### Dashboard Home

**Three-column layout**: Sidebar navigation (w-60), main content area (flex-1), quick actions panel (w-80, removable). Main area shows financial overview blocks, upcoming seminars, recent transactions. Top bar with page title "Dashboard" and quick add buttons.

## Icons & Assets

**Icons**: Heroicons (outline style for navbar, solid for emphasis)
**Charts**: Chart.js with minimal styling, no gridlines, warm accent fills
**Illustrations**: None - photo-realistic images only

## Images

**Landing Hero Image**: Full dashboard interface screenshot (1400x900px) showing real financial charts, seminar calendar, clean Notion-like aesthetic. Presented at 5-degree tilt for depth. Critical for demonstrating actual product.

**Seminar Cards**: Speaker headshots, 60x60px rounded-full
**Testimonials**: Student portraits, 64x64px rounded-full, authentic college photos
**University Logos**: Scholarship listings, 48x48px, monochrome treatment
**Dashboard Screenshots**: Feature section showing specific modules (expense tracker, calendar view)

Large hero image: Yes, essential for product demonstration and trust-building.

## Accessibility

- 44px minimum touch targets
- Focus rings with warm accent outline
- Visible labels, never placeholder-only
- Keyboard shortcuts displayed (⌘K for search)
- High contrast ratios maintained in monochromatic scheme
- Screen reader labels for icon buttons