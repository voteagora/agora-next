# Design Review Rubric

**Scoring system for evaluating visual quality and UX execution**

---

## Scoring Scale

- **+** = Criterion met (full points awarded)
- **-** = Criterion not met (0 points)
- **Partial** = Criterion partially met (half points, noted in comments)

**Total Possible Score:** 105 points

---

## Category 1: Spacing & Layout (25 points)

| +/- | Weight | Criterion |
|-----|--------|-----------|
| | 5 | All similar components (cards, buttons, inputs) use consistent padding across all pages |
| | 5 | Visual elements match existing patterns: backgrounds (white/colored), borders (rounded/sharp), text formatting (bullets/no bullets) are consistent with surrounding sections |
| | 5 | All data tables have consistent cell padding and column widths are proportional to content |
| | 4 | All table headers are aligned with their corresponding data columns |
| | 3 | Border formatting is consistent across similar elements (all cards have borders OR none do, not mixed) |
| | 3 | Related groups of content have consistent spacing between them (e.g., all section gaps are 24px or 32px, not random) |

**Category 1 Total: ___ / 25 points**

---

## Category 2: Typography Consistency (20 points)

| +/- | Weight | Criterion |
|-----|--------|-----------|
| | 6 | All page titles use the same font size and weight across all pages |
| | 6 | All section headers (h2) use the same font size and weight across all pages |
| | 4 | All subsection headers (h3) use the same font size and weight across all pages |
| | 2 | Typography hierarchy is correct: page titles > section headers > subsection headers (no inversions) |
| | 2 | Line height is consistent for body text (no cramped or overly-spaced sections) |

**Category 2 Total: ___ / 20 points**

---

## Category 3: Icon Usage (15 points)

| +/- | Weight | Criterion |
|-----|--------|-----------|
| | 5 | All icons are from Lucide library (no mixed icon sets or custom icons) |
| | 4 | Icons are vertically centered with adjacent text across all instances |
| | 3 | Icon sizing is consistent within similar contexts (e.g., all inline icons are 16px, all header icons are 20px) |
| | 3 | Icons are present on all similar elements where a pattern exists (e.g., if one card has an icon, all cards have icons) |

**Category 3 Total: ___ / 15 points**

---

## Category 4: Content Density & Organization (25 points)

| +/- | Weight | Criterion |
|-----|--------|-----------|
| | 8 | No text blocks exceed 150 words without visual breaks (subheadings, illustrations, or spacing) |
| | 6 | Long optional content (legal text, FAQs, detailed explanations >200 words) uses progressive disclosure (accordions, tabs, or collapsible sections) |
| | 5 | Dense sections with multiple topics have clear subheadings to separate content |
| | 4 | Related content is grouped logically with consistent spacing patterns |
| | 2 | No section exceeds 6 bullet points in a single list without breaking into subsections |

**Category 4 Total: ___ / 25 points**

---

## Category 5: Visual Hierarchy & Illustrations (20 points)

| +/- | Weight | Criterion |
|-----|--------|-----------|
| | 8 | Information pages include illustration placeholders after text sections exceeding ~100 words |
| | 5 | Information pages use single-column vertical stack layout (NOT multi-column grid with uneven card heights) |
| | 4 | Text-image sections alternate (text-left/image-right, then image-left/text-right) for visual rhythm |
| | 3 | All illustrations/placeholders maintain consistent aspect ratio (typically 16:9) |

**Category 5 Total: ___ / 20 points**

---

## Detailed Grading Criteria

### Category 1: Spacing & Layout (25 points)

| +/- | Weight | Criterion | What to Check | Fail If |
|-----|--------|-----------|---------------|---------|
| | 5 | Consistent padding | Measure padding on 3+ similar components (cards, buttons, inputs). Example: All cards use 24px padding. | Same component type has different padding values (one card 16px, another 24px) |
| | 5 | Visual pattern matching | New/modified sections must match existing visual treatment on same page. Check: backgrounds (white box/colored/transparent), border styles (rounded/sharp), text formatting (bullets/no bullets). | New section has bullets when existing don't, OR different background treatment, OR different border radius |
| | 5 | Table consistency | Check cell padding across all tables. Verify column widths accommodate content without overflow or excessive whitespace. | Tables have inconsistent cell padding or poorly sized columns |
| | 4 | Header alignment | Headers must align with data columns below them. | Any table has misaligned headers (header text doesn't align with column data) |
| | 3 | Border consistency | All cards either have borders or don't (consistent choice). All tables either have borders or don't. | Some cards have borders, others don't (mixed approach) |
| | 3 | Spacing between groups | Measure gaps between sections, cards, or content groups. Should follow consistent scale (e.g., 16px, 24px, 32px). | Random spacing values (18px here, 26px there, 35px somewhere else) |

### Category 2: Typography Consistency (20 points)

| +/- | Weight | Criterion | What to Check | Fail If |
|-----|--------|-----------|---------------|---------|
| | 6 | Page titles | Compare page titles across 3+ pages. Must use identical font size and weight. | Page titles vary in size (one is 32px, another is 28px) |
| | 6 | Section headers (h2) | Compare h2 headers across multiple sections/pages. Must use identical font size and weight. | Section headers vary (one is 24px, another is 20px) |
| | 4 | Subsection headers (h3) | Compare h3 headers across sections. Must use identical font size and weight. | Subsections vary in size |
| | 2 | Hierarchy correctness | Page title must be largest, then section header, then subsection. | Any inversion exists (subsection larger than section header) |
| | 2 | Line height | Body text should have consistent line height across all sections. | Some sections cramped (line-height 1.2), others spacious (line-height 1.8) |

### Category 3: Icon Usage (15 points)

| +/- | Weight | Criterion | What to Check | Fail If |
|-----|--------|-----------|---------------|---------|
| | 5 | Lucide library | Inspect all icons across pages. | Any icons are not from Lucide library (custom SVGs, different icon sets) |
| | 4 | Vertical centering | Icons next to text should be vertically centered with text. | Icons sit above or below text baseline inconsistently |
| | 3 | Size consistency | Measure icon sizes in similar contexts (e.g., all inline icons, all header icons). | Inline icons vary (some 16px, some 18px, some 20px in same context) |
| | 3 | Pattern consistency | If one card has an icon, all similar cards should have icons. | Pattern breaks (3 cards have icons, 2 don't) |

### Category 4: Content Density & Organization (25 points)

| +/- | Weight | Criterion | What to Check | Fail If |
|-----|--------|-----------|---------------|---------|
| | 8 | No walls of text >150 words | Count words in text blocks. Must have visual breaks (subheadings, illustrations, spacing). | Any block exceeds 150 words without subheadings, spacing, or visual breaks |
| | 6 | Progressive disclosure | Check if long optional content (>200 words) uses accordions, tabs, or collapsible sections. | 300+ word legal text or FAQ displayed all at once without progressive disclosure |
| | 5 | Clear subheadings | Dense sections with multiple topics should break content with h3 subheadings. | Multiple topics in one section without clear breaks |
| | 4 | Logical grouping | Related content should be grouped together with consistent spacing patterns. | Random grouping or inconsistent spacing between related content groups |
| | 2 | Bullet point limits | No single list should exceed 6 bullets without breaking into subsections. | Lists with 8+ bullets in a row without breaks |

### Category 5: Visual Hierarchy & Illustrations (20 points)

| +/- | Weight | Criterion | What to Check | Fail If |
|-----|--------|-----------|---------------|---------|
| | 8 | Illustration placeholders | Info pages should have illustration placeholders after ~100+ word sections. | 150+ word sections with no visual breaks or placeholder illustrations |
| | 5 | Single-column layout | Info pages should use vertical stack layout, NOT multi-column grid. | Multi-column grid with cards of uneven heights |
| | 4 | Alternating pattern | Text-image sections should alternate (text-left/image-right, then image-left/text-right) for visual rhythm. | All sections are text-left/image-right (no alternation) |
| | 3 | Aspect ratio | All illustrations/placeholders should maintain consistent aspect ratio (typically 16:9). | Random aspect ratios (square, portrait, wide, etc. all mixed) |

---

## Example Completed Rubric

### Sample Review: Governance Dashboard

**Category 1: Spacing & Layout (23/25)**

| +/- | Weight | Criterion | What to Check | Fail If | Evidence/Notes |
|-----|--------|-----------|---------------|---------|----------------|
| + | 5 | Consistent padding | Measure padding on 3+ similar components (cards, buttons, inputs). Example: All cards use 24px padding. | Same component type has different padding values (one card 16px, another 24px) | All cards use 24px padding consistently across Proposals, Voters, and Info pages |
| + | 5 | Visual pattern matching | New/modified sections must match existing visual treatment on same page. Check: backgrounds (white box/colored/transparent), border styles (rounded/sharp), text formatting (bullets/no bullets). | New section has bullets when existing don't, OR different background treatment, OR different border radius | New banner matches existing sections (white bg, rounded borders, no bullets) |
| + | 5 | Table consistency | Check cell padding across all tables. Verify column widths accommodate content without overflow or excessive whitespace. | Tables have inconsistent cell padding or poorly sized columns | All tables have 16px cell padding, columns sized properly |
| + | 4 | Header alignment | Headers must align with data columns below them. | Any table has misaligned headers (header text doesn't align with column data) | All table headers align with data columns |
| Partial | 3 | Border consistency | All cards either have borders or don't (consistent choice). All tables either have borders or don't. | Some cards have borders, others don't (mixed approach) | Cards have borders, but one button group doesn't (2/3 points) |
| + | 3 | Spacing between groups | Measure gaps between sections, cards, or content groups. Should follow consistent scale (e.g., 16px, 24px, 32px). | Random spacing values (18px here, 26px there, 35px somewhere else) | Consistent 32px gaps between sections |

**Category 2: Typography Consistency (18/20)**

| +/- | Weight | Criterion | What to Check | Fail If | Evidence/Notes |
|-----|--------|-----------|---------------|---------|----------------|
| + | 6 | Page titles | Compare page titles across 3+ pages. Must use identical font size and weight. | Page titles vary in size (one is 32px, another is 28px) | All 32px/bold across 4 pages checked |
| Partial | 6 | Section headers (h2) | Compare h2 headers across multiple sections/pages. Must use identical font size and weight. | Section headers vary (one is 24px, another is 20px) | Most 24px, but Info page uses 20px (3/6 points) |
| + | 4 | Subsection headers (h3) | Compare h3 headers across sections. Must use identical font size and weight. | Subsections vary in size | All 18px/semibold |
| + | 2 | Hierarchy correctness | Page title must be largest, then section header, then subsection. | Any inversion exists (subsection larger than section header) | No inversions found |
| + | 2 | Line height | Body text should have consistent line height across all sections. | Some sections cramped (line-height 1.2), others spacious (line-height 1.8) | Consistent 1.6 throughout |

**Category 3: Icon Usage (12/15)**

| +/- | Weight | Criterion | What to Check | Fail If | Evidence/Notes |
|-----|--------|-----------|---------------|---------|----------------|
| + | 5 | Lucide library | Inspect all icons across pages. | Any icons are not from Lucide library (custom SVGs, different icon sets) | All icons from Lucide |
| - | 4 | Vertical centering | Icons next to text should be vertically centered with text. | Icons sit above or below text baseline inconsistently | Search icon 2px below baseline (0/4 points) |
| + | 3 | Size consistency | Measure icon sizes in similar contexts (e.g., all inline icons, all header icons). | Inline icons vary (some 16px, some 18px, some 20px in same context) | All inline icons 16px |
| + | 3 | Pattern consistency | If one card has an icon, all similar cards should have icons. | Pattern breaks (3 cards have icons, 2 don't) | All action buttons have icons |

**Category 4: Content Density & Organization (19/25)**

| +/- | Weight | Criterion | What to Check | Fail If | Evidence/Notes |
|-----|--------|-----------|---------------|---------|----------------|
| - | 8 | No walls of text >150 words | Count words in text blocks. Must have visual breaks (subheadings, illustrations, spacing). | Any block exceeds 150 words without subheadings, spacing, or visual breaks | About section has 250 words unbroken (0/8 points) |
| + | 6 | Progressive disclosure | Check if long optional content (>200 words) uses accordions, tabs, or collapsible sections. | 300+ word legal text or FAQ displayed all at once without progressive disclosure | Legal text uses accordion |
| + | 5 | Clear subheadings | Dense sections with multiple topics should break content with h3 subheadings. | Multiple topics in one section without clear breaks | All dense sections have h3 breaks |
| + | 4 | Logical grouping | Related content should be grouped together with consistent spacing patterns. | Random grouping or inconsistent spacing between related content groups | Content well grouped |
| + | 2 | Bullet point limits | No single list should exceed 6 bullets without breaking into subsections. | Lists with 8+ bullets in a row without breaks | No lists exceed 6 items |

**Category 5: Visual Hierarchy & Illustrations (15/20)**

| +/- | Weight | Criterion | What to Check | Fail If | Evidence/Notes |
|-----|--------|-----------|---------------|---------|----------------|
| Partial | 8 | Illustration placeholders | Info pages should have illustration placeholders after ~100+ word sections. | 150+ word sections with no visual breaks or placeholder illustrations | 2 of 4 sections have placeholders (4/8 points) |
| + | 5 | Single-column layout | Info pages should use vertical stack layout, NOT multi-column grid. | Multi-column grid with cards of uneven heights | Proper vertical stack |
| + | 4 | Alternating pattern | Text-image sections should alternate (text-left/image-right, then image-left/text-right) for visual rhythm. | All sections are text-left/image-right (no alternation) | Text/image alternates correctly |
| Partial | 3 | Aspect ratio | All illustrations/placeholders should maintain consistent aspect ratio (typically 16:9). | Random aspect ratios (square, portrait, wide, etc. all mixed) | Most 16:9, one is square (1.5/3 points) |

**TOTAL: 87/105**

**Priority Fixes:**
1. Fix wall of text in About section (250 words → break into 3 subsections) - 8 points
2. Center search icon vertically - 4 points
3. Add illustration placeholders to 2 remaining sections - 4 points
4. Standardize Info page section headers to 24px - 3 points
5. Fix aspect ratio on governance flow illustration - 1.5 points

---

## Usage Guidelines

1. **Score each criterion independently** - Don't let one failure influence others
2. **Document evidence** - Note specific examples (e.g., "Card on Delegates page: 16px padding, Card on Info page: 24px padding")
3. **Use partial points sparingly** - Only when criterion is mostly met but has minor issues
4. **Prioritize fixes by weight** - Higher weight items should be fixed first
5. **Context matters** - Hero sections may intentionally differ from content sections
