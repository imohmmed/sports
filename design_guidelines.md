# AlAli Sport - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based (Sports Streaming Platforms)
**Primary References:** DAZN, ESPN+, beIN Sports Connect, with Netflix-inspired card layouts
**Key Principle:** Premium sports viewing experience with clear subscription value proposition and seamless RTL Arabic support

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 12 8% 8% (deep charcoal)
- Surface: 12 8% 12% (elevated dark cards)
- Primary Brand: 142 76% 36% (vibrant football green)
- Accent: 0 0% 95% (crisp white for CTAs)
- Success (Subscribed): 142 76% 36% (green)
- Warning (Not Subscribed): 38 92% 50% (amber/gold)
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 65%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 142 76% 36%
- Text Primary: 12 8% 12%

### B. Typography

**Font Families:**
- Primary (Arabic & Latin): 'Cairo', sans-serif (Google Fonts)
- Accent/Numbers: 'Inter', sans-serif (Google Fonts)

**Hierarchy:**
- Hero/Page Titles: text-4xl to text-6xl, font-bold (Cairo)
- Section Headings: text-2xl to text-3xl, font-semibold
- Channel Names: text-lg, font-medium
- Body Text: text-base, font-normal
- Quality Badges: text-sm, font-semibold uppercase

### C. Layout System

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-24
- Card gaps: gap-4, gap-6
- Grid gutters: gap-6

**Containers:**
- Max width: max-w-7xl mx-auto px-4
- Channel grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

### D. Component Library

**Navigation Bar:**
- Fixed top position with backdrop blur
- Logo (AlAli Sport with football icon) left-aligned (RTL: right-aligned)
- User email/subscription badge
- Logout button
- Background: bg-background/80 backdrop-blur-md border-b

**Hero Section (Landing/Marketing):**
- Full-width background with football stadium/pitch imagery
- Overlay gradient: from-background/90 to-background/60
- Centered content with large heading
- Primary CTA button with glow effect
- Height: min-h-[60vh]

**Channel Cards:**
- Rounded-xl with hover lift effect (transform scale-105)
- Channel thumbnail/poster (16:9 aspect ratio)
- Channel name overlay at bottom with gradient backdrop
- Quality badge pills (FHD/HD/LOW) as color-coded chips
- Border: border border-white/10
- Shadow: shadow-lg on hover

**Subscription Status Banner:**
- Full-width alert at top of channel page
- Warning variant for non-subscribers
- Icon + Message + CTA to Telegram
- Dismissible option

**Video Player Container:**
- 16:9 aspect ratio wrapper
- Rounded corners (rounded-lg)
- Custom controls bar with dark theme
- Quality selector dropdown
- Fullscreen support
- Loading spinner overlay

**Quality Selector Buttons:**
- Pill-shaped badges (rounded-full px-4 py-2)
- FHD: bg-green-600 (active), bg-green-600/20 (inactive)
- HD: bg-blue-600 (active), bg-blue-600/20 (inactive)
- LOW: bg-gray-600 (active), bg-gray-600/20 (inactive)
- Active state: ring-2 ring-white/50

**Authentication Forms:**
- Centered modal with max-w-md
- Rounded-2xl with shadow-2xl
- Glass morphism effect: bg-surface/90 backdrop-blur-xl
- Input fields with rounded-lg borders
- Focus states with ring-2 ring-primary

**Footer:**
- Dark background (bg-surface)
- Two-column layout: Links (left) + Contact/Social (right)
- Copyright + Telegram link prominent
- Minimal padding: py-8

### E. RTL Support

**Critical Implementation:**
- dir="rtl" on <html> for Arabic content
- Flip all margin/padding directions automatically via Tailwind
- Icons position swap (chevrons, arrows)
- Text alignment: text-right for Arabic
- Grid order reversal where appropriate

### F. Animations

**Minimal, Purposeful:**
- Card hover: transition-transform duration-300 ease-out
- Button press: active:scale-95
- Loading states: spinning icon only
- Page transitions: fade-in opacity (if needed)
- NO auto-playing animations or distracting effects

## Images & Visual Assets

**Required Images:**

1. **Hero Section Background:**
   - Description: Dramatic football stadium at night with bright floodlights, crowd silhouettes, green pitch visible
   - Placement: Full-width background behind hero content
   - Treatment: Dark overlay gradient for text readability

2. **Channel Thumbnails/Posters:**
   - Description: BeIN Sports channel logos on football-themed backgrounds (green pitch texture, stadium imagery)
   - Placement: Top of each channel card (16:9 ratio)
   - Treatment: Slight overlay at bottom for channel name

3. **Player Action Shots:**
   - Description: Dynamic football action photos (celebrations, goals, tackles) for visual interest
   - Placement: Landing page feature sections, authentication page backgrounds
   - Treatment: Parallax effect or subtle zoom on scroll (optional)

4. **Logo/Brand:**
   - Description: "AlAli Sport" text with football icon/emblem
   - Placement: Navbar top-left (RTL: top-right)
   - Format: SVG with white/primary green color scheme

5. **Empty States:**
   - Description: Football-themed illustration when no channels available
   - Placement: Center of channel grid if empty
   - Treatment: Muted colors with helpful text

**Large Hero Image:** YES - Dramatic stadium/pitch background for landing page hero section

## Icon Library

**Selected Library:** Heroicons (via CDN)
- Use outline variant for navigation and secondary actions
- Use solid variant for badges and status indicators
- Football/sports-specific icons: Use Font Awesome for better sports coverage

## Page-Specific Layouts

**Landing Page (Pre-Auth):**
- Hero with stadium background + CTA to login/signup
- Features grid (3-column): "HD Quality", "Multiple Devices", "Live Matches"
- Preview channel grid (locked state)
- Pricing/subscription info
- Footer with Telegram contact

**Dashboard (Authenticated - Subscribed):**
- Subscription badge (green) in header
- Channel grid (3-4 columns responsive)
- Quick filters: All Channels, FHD Only, Currently Live
- Each card clickable to player page

**Dashboard (Authenticated - Not Subscribed):**
- Warning banner at top with Telegram CTA
- Blurred/locked channel grid preview
- Prominent "Get Subscription" section

**Player Page:**
- Full-width video player (sticky on scroll)
- Quality selector below player
- Channel info sidebar (desktop) / below (mobile)
- Related channels section at bottom

## Quality Standards

- Premium sports streaming aesthetic
- Fast loading with optimized images (WebP format)
- Smooth quality switching without buffering
- Clear visual hierarchy for subscription status
- Professional, trustworthy design to justify paid subscriptions
- Mobile-first responsive design with touch-friendly controls (min 44px tap targets)