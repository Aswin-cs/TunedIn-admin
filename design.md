---
name: TunedIn Light
colors:
  surface: '#fbf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fbf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#eae8e2'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c18'
  on-surface-variant: '#594138'
  inverse-surface: '#30312d'
  inverse-on-surface: '#f3f1eb'
  outline: '#8d7166'
  outline-variant: '#e1bfb2'
  surface-tint: '#a43d00'
  primary: '#a03b00'
  on-primary: '#ffffff'
  primary-container: '#c94c00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb597'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5c5c5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#747474'
  on-tertiary-container: '#fefcfc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb597'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#fbf9f3'
  on-background: '#1b1c18'
  surface-variant: '#e4e2dd'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an editorial, tactile, and modern audio streaming environment. It rejects the generic dark mode trope of digital audio platforms in favor of a warm, daylight-infused studio aesthetic reminiscent of boutique vinyl listening rooms and high-end industrial audio equipment.

The UI combines Modern Minimalism with subtle tactile grounding:
- **Atmosphere:** Warm Linen foundation paired with architectural Milk White surfaces creates depth through physical card grouping rather than stark separation.
- **Tone:** Discerning, focused, and acoustically pure. High contrast text ensures effortless glanceability while deep browsing.
- **Accents:** Sunburst Orange serves as an intentional kinetic driver for playback controls, active waveforms, and focal calls to action without visual clutter.
- **Wordmark ("TunedIn"):** In the brand signature, "Tuned" is rendered in solid Deep Ink (`#1A1A1A`), while the suffix **"In"** features a vibrant kinetic gradient (`linear-gradient(135deg, #F26419 0%, #FF833D 100%)`). This delivers an energetic, plugged-in visual accent across navigation headers, authentication cards, and hero sections.


## Colors

The palette leverages high-contrast neutrals with a vibrant energetic orange anchor:

- **Base Canvas (`#F8F6F0`):** Warm Linen. Applied to the root layout canvas, sidebar gutters, and outer viewport margins.
- **Elevated Surfaces (`#FFFFFF`):** Pure Milk White. Applied to track cards, detail sheets, popovers, and the bottom persistent player dock.
- **Primary Text & Headings (`#1A1A1A`):** Deep Ink / Charcoal. Provides uncompromising clarity for track metadata, album titles, and structural icons.
- **Secondary / Muted Text (`#737373`):** Soft Slate. Reserved for artist credits, durations, metadata timestamps, and inactive navigational states.
- **Brand & Action Accent (`#F26419`):** Sunburst Orange. Exclusively assigned to playback states, primary buttons, seek-bar thumbs, and live status badges.
- **Dividers & Structural Borders (`#E6E2DA`):** Subtle Sand. Used at 1px thickness to define panel splits and tabular track lists without breaking the warm tonal balance.

## Typography

The typography couples the architectural, rhythmic geometry of **Space Grotesk** for display and headline levels with the clean, legible precision of **Hanken Grotesk** for metadata, controls, and body text.

- **Display & Headlines:** Space Grotesk's tight tracking and technical flair deliver a music-hardware aesthetic on album covers, hero banners, and section markers.
- **Body & Tabular Data:** Hanken Grotesk ensures maximum legibility across dense track listings, durations, and multi-column queue panels. Tabular numbers (`tnum`) must be enforced for track counters, timestamps, and bit-rate statistics.

## Layout & Spacing

The interface follows a structured fluid grid optimized for desktop audio streaming with clear hierarchy between library management, browsing canvas, and audio controls.

- **Desktop Shell:**
  - **Left Rail (Navigation & Library):** Fixed width at 260px, anchored directly onto the Warm Linen (`#F8F6F0`) canvas.
  - **Central Main Canvas:** 12-column fluid grid spanning between 800px and 1600px max-width, adjusting column span for album cards from 2 columns (on compact viewports) to 4-6 cards per row.
  - **Bottom Dock (Persistent Player):** Fixed height 88px, spanning 100% viewport width, elevated above content.
- **Rhythm & Alignments:** Strict 8px increment system. Inner container padding strictly leverages `space-md` (16px) and `space-lg` (24px) to preserve airy separation between structural cards.

## Elevation & Depth

Visual hierarchy uses warm ambient lighting paired with crisp, low-contrast bounding borders (`#E6E2DA`). Surfaces do not utilize cold gray drop shadows; all shadows inherit a calibrated amber-sand tint (`rgba(60, 45, 20, ...)`) to complement the Warm Linen base:

- **Level 0 (Base Canvas):** `#F8F6F0` flat canvas.
- **Level 1 (Card & Content Blocks):** `#FFFFFF` background with a subtle border (`1px solid #E6E2DA`) and an ambient warm shadow: `0 2px 8px -2px rgba(60, 45, 20, 0.04), 0 1px 3px 0 rgba(60, 45, 20, 0.02)`.
- **Level 2 (Hovered Cards & Dropdowns):** `0 10px 24px -4px rgba(60, 45, 20, 0.08), 0 4px 8px -2px rgba(60, 45, 20, 0.03)`.
- **Level 3 (Persistent Bottom Player & Modals):** `0 -4px 20px 0 rgba(60, 45, 20, 0.06)` along the top edge of the player bar, reinforced with a top border (`1px solid #E6E2DA`).

## Shapes

The interface embraces a balanced rounded architecture (Level 2):
- **Components & Form Elements:** 8px (`0.5rem`) base radius for inputs, track list rows, and small action targets.
- **Album Artwork & Content Cards:** 12px to 16px (`1rem`) border radius to ensure vinyl artwork and card containers feel soft yet structured.
- **Playback & Interactive Controls:** Pure pill geometry (`rounded-full` / 9999px) is applied exclusively to Play/Pause action buttons, badge chips, and audio scrubbing indicators to communicate primary kinetic affordance.

## Components

### Buttons
- **Primary (Play CTA):** Fully rounded pill geometry (`rounded-full`), `#F26419` background with pure white text/icons. Hover transitions to `#D9530D` with a subtle elevation shift. Focus ring is a 2px `#F26419` ring offset by 2px `#F8F6F0`.
- **Secondary:** Milk White surface (`#FFFFFF`), `1px solid #E6E2DA`, text `#1A1A1A`. Hover transitions background to `#F8F6F0`.
- **Ghost / Icon Actions:** Transparent background, text `#737373`, hover transitions to text `#1A1A1A` with a `#FFFFFF` circular wash.

### Cards & Media Tiles
- **Album / Playlist Card:** Pure Milk White background, 16px radius, enclosed by `1px solid #E6E2DA`. Includes 12px internal padding (`space-sm` to `space-md`). Album art has an inner 12px radius. The Sunburst Play trigger floats in the bottom-right corner of the artwork on hover using a spring scale-up animation.

### Track Lists & Data Grids
- **Rows:** Minimum height 56px, 8px corner radius. Padding: `0 12px`.
- **Default State:** Transparent background, `#1A1A1A` title, `#737373` artist and track duration.
- **Hover State:** Background tints to `#FFFFFF` with warm Level 1 elevation and Subtle Sand border highlight.
- **Active / Playing State:** Title transitions to Sunburst Orange (`#F26419`), prepended with an animated equalizer bar indicator in the track index slot.

### Scrubbers & Sliders (Audio Timeline & Volume)
- **Track Rail:** Height 4px, background `#E6E2DA`, rounded pill.
- **Progress Fill:** Background `#1A1A1A` on neutral tracks; transitions to `#F26419` on active scrub.
- **Scrubber Thumb:** 12px diameter circle in `#1A1A1A` (or `#F26419` during interaction), invisible during passive playback, scaling into visibility on rail hover.

### Chips & Filter Tags
- **Base:** Height 32px, pill shape, `1px solid #E6E2DA`, background `#FFFFFF`, text `#737373`.
- **Selected:** Background `#1A1A1A`, border `#1A1A1A`, text `#FFFFFF`.

### Input Fields (Search)
- **Search Bar:** Height 44px, background `#FFFFFF`, border `1px solid #E6E2DA`, 8px radius. Left-aligned search icon in `#737373`. Placeholder text `#737373`. Focus state switches border to `#F26419` with a subtle orange focus ring (`rgba(242, 100, 25, 0.15)`).

### Persistent Bottom Player Dock
- Milk White background spanning full width, fixed to bottom. Separated from content by `1px solid #E6E2DA` and Level 3 warm elevation. Hosts current track metadata on the left, primary playback controls centered, and volume/device controls on the right.
