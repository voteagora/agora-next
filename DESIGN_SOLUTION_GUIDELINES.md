# Design Solution Guidelines

**Creating implementation-ready design solutions for frontend engineers**

---

## Your Role

You create **implementation specs**, not design suggestions. Solutions must be detailed enough that an engineer can implement them perfectly without asking clarifying questions.

**Requirements:**

- Medium to long format with specific file paths and line numbers
- Exact copy text (not placeholders)
- Specific layout details (flexbox, spacing values, CSS classes)
- Code blocks showing what to add/remove

---

## Core Design Principles

### 1. Minimize Visual Objects

- Remove every element that doesn't support the current task
- Integrate banners into tables, not as standalone sections
- **Test**: If users can complete the task without it, move it to Info page

### 2. Action First, Explanation Second

- Task pages show: title → subheading → banner → filters → table
- Educational content lives on Info page, accessed via banners/links

### 3. Brevity & Scannability

- Banners: ≤8-10 words
- Tooltips: ≤15-20 words
- Paragraphs: max 3 lines
- Bullet lists: max 3-4 items, no nesting
- Task page total copy: ≤70-90 words above table

### 4. Layout Patterns

- Info pages: **Single-column vertical stack** (NOT multi-column grid)
- Full-width sections with 50/50 text-image split
- Alternate text-left/image-right for visual rhythm
- Never create cards with uneven heights in grid layout

### 5. Visual Hierarchy & Icons

- **Suggest placeholder illustrations to break up walls of text** - When sections exceed ~100 words, recommend adding illustration placeholders
- Alternate text-left/image-right with image-left/text-right
- Use `aspect-video` for consistent illustration proportions
- **Icons must represent meaning**: Choose icons from Lucide library that match the content
- **Different contexts need different icons**: Proposals banner uses different icon than Delegates banner
- Icons reinforce comprehension, not just decoration

---

## Copy & Content Guidelines

### Quality Copy Principles

- **Preserve all information and context** - When improving copy, never remove information or reduce length of context
- **Default to moving, not rewriting** - Move existing copy verbatim; only change when it violates word limits or clarity standards
- **Human-legible, not marketing copy** - Write how people actually talk
- **Explain what it is, not how to use it** - "Learn about voting power" not "Vote in two steps"
- **Complete sentences, not 3-word punchlines** - Be clear and descriptive
- **Short sentences** - Break complex ideas into multiple short sentences
- **Active voice** - "Delegate your voting power" not "Voting power can be delegated"
- **Clarity over cleverness** - "Learn about delegation" not "Delegation drives quorum"

### Copy Standards

**Page Titles:**

- ❌ Bad: "Delegates" (too short, unclear)
- ✅ Good: "Delegate your voting power" (clear action)

**Section Headings:**

- ❌ Bad: "How it works" (vague)
- ✅ Good: "How delegation works in this DAO" (specific)

**Banner Messages:**

- ❌ Bad: "Learn more" (generic, no context)
- ❌ Bad: "Vote in two steps" (tells how, not what)
- ❌ Bad: "Delegation drives quorum" (vague, unclear meaning)
- ❌ Bad: "Delegation: A comprehensive guide to understanding voting power" (too long)
- ✅ Good: "Learn about the voting process" (clear, explains what)
- ✅ Good: "Learn about voting power & delegation" (descriptive, useful)

**Button/Link Text:**

- ❌ Bad: "Click here" (not descriptive)
- ✅ Good: "View delegation guide" (describes destination)

**Body Copy:**

- **Preserve existing copy when moving content** - Don't rewrite unless necessary
- Use short, clear sentences
- Avoid jargon unless it's standard in the domain
- Break up complex explanations with bullets
- Don't sacrifice clarity for brevity
- Explain what something is before explaining how to use it
- Can consolidate/restructure as long as all original information is preserved

**Icons:**

- ❌ Bad: Same icon for all banners (e.g., Info icon everywhere)
- ❌ Bad: Decorative icons that don't match content meaning
- ✅ Good: Vote icon for proposals banner, Users icon for delegates banner
- ✅ Good: Icons chosen from Lucide library that reinforce the text meaning
- Use icons to help users understand content at a glance

---

## Task Page Structure

**What to keep:**

1. Page title (clear, action-oriented)
2. One subheading (≤25 words)
3. Banner integrated with table (≤10 words, links to Info page anchor)
4. Action controls (search, filters, sort)
5. Main data table

**What to remove:**

- All "How X works" / "Why" sections
- Legal paragraphs
- Multi-section explainer cards
- Educational bullet lists

**Goal:** Table visible in first viewport without scrolling past explanations.

---

## Info Page Structure

**Layout:** Single-column vertical stack (NOT grid)

**Structure:**

1. Hero + illustration (full width)
2. Educational sections (3-5 sections, stacked):
   - Full-width container with `flex items-start gap-8`
   - Text and image each `flex-1` (50/50 split)
   - Alternate: Section 1 (text-left/image-right), Section 2 (image-left/text-right)
   - Each section: heading + icon, existing content from task page, illustration placeholder
   - **Preserve existing copy verbatim when moving from task pages**
   - Anchor IDs for deep linking
   - **Add illustration placeholders after sections with >~100 words of text**
3. Documents/resources
4. Legal/disclosures (with illustrations between sections to break up long text)

---

## Engineering Constraints

### Scope Discipline

- Only modify content explicitly identified
- Don't touch: headers, footers, navigation, table structures, filters (unless specified)
- No global spacing changes
- Zero visual regressions

### Component Reuse

- Use existing components only
- Reference existing design system
- Provide new component code if needed

### Deep Linking

- Banners link to Info page anchors (e.g., `/info#delegation`)

---

## Solution Format

### 1. Overview

2-3 sentence summary of changes.

### 2. Files to Modify

```
- src/pages/voters.tsx - Remove explainer sections, add banner
- src/pages/info.tsx - Add delegation section with anchor
```

### 3. Detailed Steps

**Step 1: Remove [Section] from [Page]**

- File: `src/pages/voters.tsx`
- Lines to remove: X-Y
- Provide exact code block to remove
- Explain why it's being removed

**Step 2: Add [Component] to [Page]**

- File: `src/pages/voters.tsx`
- Where: After line Z (be specific about location)
- Code to add: (provide complete code block)
- Layout details: spacing, width, positioning
- Copy text: (exact banner message, link text)

**Step 3: Create Info Section**

- File: `src/pages/info.tsx`
- Where: After [specific section]
- Structure: full code example showing alternating text/image pattern
- Layout: single-column stack, `mb-12` spacing, `flex-1` for 50/50 split
- Anchor ID for deep linking

### 4. Copy Content Mapping

Table showing what content moves from where to where.

### 5. Visual Changes Summary

Quantify: X sections removed, Y banners added, net change in visual objects.

### 6. Acceptance Criteria

Checklist of what must be true when done.

---

## Quality Checklist

**Specificity:**

- [ ] File paths, line numbers, component names provided
- [ ] Exact copy text (not "add a message")
- [ ] Layout structure specified (flex, spacing classes)

**Completeness:**

- [ ] Code blocks for additions and removals
- [ ] Copy content mapping table
- [ ] Visual changes quantified

**Copy Quality:**

- [ ] **Existing copy preserved verbatim** when moving from task pages to Info pages
- [ ] Only modify copy when it violates word limits (banners >10 words, etc.)
- [ ] All original information and context retained (nothing removed or shortened)
- [ ] Page titles are clear and action-oriented
- [ ] Banner messages explain what (not how), ≤10 words
- [ ] No vague copy like "Learn more", "Vote in two steps", or "Delegation drives quorum"

**Icons:**

- [ ] All icons from Lucide library
- [ ] Different icons for different contexts (Proposals vs Delegates)
- [ ] Icons match and reinforce the meaning of adjacent text
- [ ] No generic Info icon used everywhere

**Layout:**

- [ ] Info page uses single-column stack (NOT grid)
- [ ] Text/image alternating pattern
- [ ] No uneven card heights
- [ ] **Illustration placeholders suggested after sections with >~100 words**
- [ ] Long text blocks broken up with visual elements

**Scope:**

- [ ] Only modifies explicitly identified elements
- [ ] No changes to navigation, headers, filters

---

## Common Mistakes

❌ **Vague:** "Add a banner near the top"
✅ **Specific:** "In `src/pages/voters.tsx` line 45, add `<InfoBanner>` with message='Need help with delegation?' linkHref='/info#delegation'"

❌ **Poor copy:** "Delegates" (title), "Vote in two steps" (banner), "Delegation drives quorum" (banner)
✅ **Good copy:** "Delegate your voting power" (title), "Learn about the voting process" (banner), "Learn about voting power & delegation" (banner)

❌ **Rewriting existing copy:** Condensing 3 paragraphs of context into 1 short paragraph, removing information
✅ **Preserving existing copy:** Moving all 3 paragraphs verbatim to Info page, can restructure but keep all content

❌ **Poor icons:** Info icon on all banners, decorative icons that don't match content
✅ **Good icons:** Vote icon for proposals banner, Users icon for delegates banner, icons from Lucide that reinforce meaning

❌ **Poor layout:** 4-card grid with varying heights
✅ **Good layout:** Single-column vertical stack with alternating text/image

❌ **Missing illustrations:** Long text sections (>100 words) with no visual breaks
✅ **Illustrations included:** Placeholder illustrations suggested after sections with substantial text (~100+ words)

❌ **Scope creep:** Redesigning navigation not mentioned in problem
✅ **Scope discipline:** Only modify elements explicitly mentioned

---

## Philosophy

A frontend engineer should:

1. Read your solution
2. Open the files
3. Make the exact changes
4. Ship the PR

Without making any design decisions.

**Zero ambiguity. Maximum clarity. Perfect implementation.**
