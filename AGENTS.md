# UI/UX Pro Max Design Guidelines for HTTP & IoT Auth Lab

This project incorporates the **UI/UX Pro Max** design intelligence system (from `nextlevelbuilder/ui-ux-pro-max-skill.git`).

## Active Design System: Minimalism & Swiss Style (Data-Dense Technical Dashboard)

### 1. Typography & Hierarchy
- **Body & Headings**: `Plus Jakarta Sans`, font weights 400, 500, 600, 700. Line-height 1.5 - 1.6.
- **Code, Tokens & Protocols**: `JetBrains Mono` / `Fira Code` with font-mono class for all JSON payloads, raw HTTP wire streams, tokens, and numeric metrics.
- **Hierarchy Scale**: Clear step ratio between headings (h1: 20-24px, h2: 18px, h3: 14-16px, body: 13-14px, captions/mono: 11-12px).

### 2. Color Palette & Dark/Light Mode (WCAG AA Compliant)
- **Light Mode**:
  - Background: `#F8FAFC` (Slate 50)
  - Card Surface: `#FFFFFF` with border `#E2E8F0` (Slate 200)
  - Primary Text: `#0F172A` (Slate 900)
  - Muted Text: `#64748B` (Slate 500)
- **Dark Mode**:
  - Background: `#020617` (Slate 950)
  - Card Surface: `#0B0F19` / `#0F172A` (Slate 900) with border `#1E293B` (Slate 800)
  - Primary Text: `#F8FAFC` (Slate 100)
  - Muted Text: `#94A3B8` (Slate 400)
- **Semantic Accents**:
  - Success / 200 OK / Valid JWT: Emerald (`#10B981` / `#059669`)
  - Info / Method / Action: Cyber Cyan (`#06B6D4` / `#0284C7`)
  - Warning / Latency / HTTP: Amber (`#F59E0B` / `#D97706`)
  - Error / 4xx / 5xx / Timeout: Crimson Rose (`#EF4444` / `#E11D48`)

### 3. Interaction & Accessibility Rules
- Minimum touch target: 44×44px on touch devices.
- Focus-visible ring on all interactive elements (`focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none`).
- Tactile feedback: 150-200ms transitions on hover and active states.
- No raw emojis as UI icons; always use `lucide-react`.
- Smooth state indicators (loading spinners, animated pulse pings, copy confirmation checkmarks).

### 4. Developer Tools UX Patterns
- Provide instant one-click copy with visual toast/icon state switch.
- Show clear explanations for HTTP Status Codes and IoT network behaviors.
- Allow masking of sensitive credentials (passwords, tokens).
- Maintain request history so learners can compare different status responses.
