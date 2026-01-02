# Design Guidelines: Student Financial Management & Seminar Planner

## Design Approach

**Hybrid System**: Linear's clean typography and spatial hierarchy + Material Design components for data-rich interfaces. This combination delivers the precision needed for financial tracking while maintaining modern, student-friendly aesthetics.

**Key Principles**:
- Information clarity over decoration
- Scannable data hierarchies
- Efficient task completion paths
- Trust through professional polish

## Typography System

**Primary Font**: Inter (Google Fonts)
**Secondary Font**: JetBrains Mono (for financial figures/data)

**Scale**:
- Hero Headlines: text-5xl font-bold (48px)
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Body Text: text-base font-normal (16px)
- Data Labels: text-sm font-medium (14px)
- Captions/Metadata: text-xs (12px)

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-16
- Card gaps: gap-4 to gap-6
- Dashboard grid gaps: gap-6

**Container Structure**:
- Dashboard content: max-w-7xl
- Financial cards: max-w-sm to max-w-md
- Form sections: max-w-2xl
- Reading content: max-w-prose

## Core Component Library

### Navigation
**Top Navigation Bar**: Sticky header with logo, main nav links (Dashboard, Finances, Seminars, Scholarships, Internships), user profile dropdown, notification bell icon. Height: h-16, backdrop-blur effect.

**Sidebar Navigation** (Dashboard view): Fixed left sidebar w-64, collapsible to w-16 on smaller screens. Icon + label pattern, active state with subtle background highlight.

### Dashboard Components

**Financial Summary Cards**: Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-4), rounded-xl borders, p-6 padding. Each card displays metric title, large numerical value (JetBrains Mono), trend indicator (arrow icon + percentage), sparkline chart at bottom.

**Expense Chart Widget**: Large card spanning 2 columns, h-96, includes time period selector tabs (Month/Quarter/Year), interactive line/bar chart using Chart.js, legend at top-right.

**Budget Tracker**: Progress bars with category labels, remaining amount, and percentage consumed. Stack vertically with gap-3.

### Seminar Planner Interface

**Calendar View**: Full-width calendar grid with time slots on Y-axis, days on X-axis. Seminar blocks as rounded cards with gradient backgrounds, show title + time + speaker thumbnail. Clicking opens detail modal.

**Seminar Cards** (List view): Horizontal cards with left accent border, containing seminar thumbnail (aspect-video), title (text-lg font-semibold), speaker info with avatar, date/time with clock icon, tag pills for category, CTA button "Sign Up" or "View Details".

**Schedule Timeline**: Vertical timeline with connecting lines, each node showing seminar time, title, location, quick actions (Add to Calendar, Set Reminder).

### Forms & Inputs

**Financial Input Forms**: Clean two-column layout on desktop, single column mobile. Labels above inputs (text-sm font-medium), input fields with border rounded-lg h-11, helper text below in text-xs. Expense categories as dropdown with icons.

**Search & Filters**: Search bar with magnifying glass icon, filter chips that are toggleable, sort dropdown aligned right.

### Data Tables

**Transaction History**: Striped rows (subtle), sticky header, columns for Date, Description, Category (with icon), Amount (JetBrains Mono, right-aligned), Actions. Pagination at bottom, 20 rows per page.

**Scholarship List**: Card-based table alternative, each scholarship as expandable accordion, showing university logo, deadline, amount, requirements preview, "Learn More" link.

### Modals & Overlays

**Seminar Details Modal**: Centered modal max-w-3xl, header with close button, scrollable content area with seminar image, full description, speaker bios with headshots, agenda timeline, sign-up form at bottom, backdrop blur.

**AI Note Taker Panel**: Slide-in panel from right, w-96, shows live transcription, key points extraction, action items, download notes button.

### CTAs & Buttons

**Primary Actions**: Solid buttons, rounded-lg, px-6 py-3, font-medium
**Secondary Actions**: Outlined buttons, same dimensions
**Tertiary Actions**: Text-only links with underline on hover
**Icon Buttons**: Circular, w-10 h-10, centered icon

## Page-Specific Layouts

### Landing/Marketing Page

**Hero Section**: h-screen flex layout, left side (50%) contains headline (text-6xl font-bold), subheading describing both finance and seminar tools, two CTA buttons (Get Started + Watch Demo), right side (50%) shows dashboard preview mockup screenshot at slight angle, subtle floating animation.

**Features Grid**: Three-column grid showcasing 6 key features (Financial Tracking, Seminar Planning, Scholarship Finder, Internship Board, Budget Tools, AI Notes). Each with icon, title, description (2-3 lines).

**Social Proof**: Testimonials from students in two-column grid, each with student photo, quote, name, university.

**Statistics Bar**: Four metrics across (Students Helped, Scholarships Found, Seminars Listed, Average Savings), large numbers with context.

### Dashboard Home

Three-column layout (lg:grid-cols-3): Left column (col-span-2) shows financial overview cards, expense chart, recent transactions. Right column shows upcoming seminars widget, quick actions panel, scholarship matches.

## Icons & Assets

**Icon Library**: Heroicons (via CDN) for all interface icons
**Charts**: Chart.js for data visualization
**Calendar**: FullCalendar library for seminar scheduling

## Images

**Landing Hero**: Dashboard mockup showing financial charts and seminar calendar, modern device frame, 1200x800px minimum
**Seminar Cards**: Speaker headshots, 80x80px circular crops
**University Logos**: For scholarship listings, 60x60px
**Student Testimonials**: Authentic student photos, 100x100px circular

**Large Hero Image**: Yes, landing page includes prominent dashboard preview mockup

## Accessibility

- Minimum touch targets: 44x44px
- Form labels always visible (no placeholder-only patterns)
- Focus indicators with 2px offset rings
- ARIA labels on icon-only buttons
- Keyboard navigation for all interactive elements
- Color-independent status indicators (use icons + text)