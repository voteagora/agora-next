# Design Review Rubric

**Scoring system for evaluating visual quality and UX execution**

---

## Scoring Scale

- **+** = Criterion met (full points awarded)
- **-** = Criterion not met (0 points)
- **Partial** = Criterion partially met (half points, noted in comments)

**Total Possible Score:** 100 points

---

## Category 1: Spacing & Layout (20 points)

| +/- | Weight | Criterion |
|-----|--------|-----------|
| | 5 | All similar components (cards, buttons, inputs) use consistent padding across all pages |
| | 5 | All data tables have consistent cell padding and column widths are proportional to content |
| | 4 | All table headers are aligned with their corresponding data columns |
| | 3 | Border formatting is consistent across similar elements (all cards have borders OR none do, not mixed) |
| | 3 | Related groups of content have consistent spacing between them (e.g., all section gaps are 24px or 32px, not random) |

**Category 1 Total: ___ / 20 points**

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

## Detailed Criteria Notes

### Spacing & Layout

**Consistent padding (5 pts):**
- Measure padding on 3+ similar components
- Example: All cards use 24px padding, or all buttons use 12px vertical/16px horizontal
- **Fail if:** Same component type has different padding values (one card 16px, another 24px)

**Table consistency (5 pts):**
- Check cell padding across all tables
- Verify column widths accommodate content without overflow or excessive whitespace
- **Fail if:** Tables have inconsistent cell padding or poorly sized columns

**Table header alignment (4 pts):**
- Headers must align with data columns below them
- **Fail if:** Any table has misaligned headers (header text doesn't align with column data)

**Border consistency (3 pts):**
- All cards either have borders or don't (consistent choice)
- All tables either have borders or don't
- **Fail if:** Some cards have borders, others don't (mixed approach)

**Spacing between groups (3 pts):**
- Measure gaps between sections, cards, or content groups
- Should follow consistent scale (e.g., 16px, 24px, 32px)
- **Fail if:** Random spacing values (18px here, 26px there, 35px somewhere else)

### Typography Consistency

**Page titles (6 pts):**
- Compare page titles across 3+ pages
- Must use identical font size and weight
- **Fail if:** Page titles vary in size (one is 32px, another is 28px)

**Section headers (6 pts):**
- Compare h2 headers across multiple sections/pages
- Must use identical font size and weight
- **Fail if:** Section headers vary (one is 24px, another is 20px)

**Subsection headers (4 pts):**
- Compare h3 headers across sections
- Must use identical font size and weight
- **Fail if:** Subsections vary in size

**Hierarchy correctness (2 pts):**
- Page title must be largest, then section header, then subsection
- **Fail if:** Any inversion exists (subsection larger than section header)

**Line height (2 pts):**
- Body text should have consistent line height
- **Fail if:** Some sections cramped (line-height 1.2), others spacious (line-height 1.8)

### Icon Usage

**Lucide library (5 pts):**
- Inspect all icons across pages
- **Fail if:** Any icons are not from Lucide library (custom SVGs, different icon sets)

**Vertical centering (4 pts):**
- Icons next to text should be vertically centered
- **Fail if:** Icons sit above or below text baseline inconsistently

**Size consistency (3 pts):**
- Measure icon sizes in similar contexts
- **Fail if:** Inline icons vary (some 16px, some 18px, some 20px in same context)

**Pattern consistency (3 pts):**
- If one card has an icon, all similar cards should
- **Fail if:** Pattern breaks (3 cards have icons, 2 don't)

### Content Density & Organization

**No walls of text >150 words (8 pts):**
- Count words in text blocks
- **Fail if:** Any block exceeds 150 words without subheadings, spacing, or visual breaks

**Progressive disclosure (6 pts):**
- Check if long optional content (>200 words) uses accordions/tabs
- **Fail if:** 300+ word legal text or FAQ displayed all at once

**Clear subheadings (5 pts):**
- Dense sections should break topics with h3 subheadings
- **Fail if:** Multiple topics in one section without clear breaks

**Logical grouping (4 pts):**
- Related content grouped together with consistent spacing
- **Fail if:** Random grouping or inconsistent spacing between groups

**Bullet point limits (2 pts):**
- No single list should exceed 6 bullets without subsections
- **Fail if:** Lists with 8+ bullets in a row without breaks

### Visual Hierarchy & Illustrations

**Illustration placeholders (8 pts):**
- Info pages should have placeholders after ~100+ word sections
- **Fail if:** 150+ word sections with no visual breaks or placeholder illustrations

**Single-column layout (5 pts):**
- Info pages use vertical stack, NOT multi-column grid
- **Fail if:** Multi-column grid with cards of uneven heights

**Alternating pattern (4 pts):**
- Text-image sections alternate left-right
- **Fail if:** All sections are text-left/image-right (no alternation)

**Aspect ratio (3 pts):**
- Placeholders maintain consistent proportions (16:9 typical)
- **Fail if:** Random aspect ratios (square, portrait, wide, etc.)

---

## Scoring Summary Template

```
Category 1: Spacing & Layout          ___ / 20
Category 2: Typography Consistency    ___ / 20
Category 3: Icon Usage                ___ / 15
Category 4: Content Density           ___ / 25
Category 5: Visual Hierarchy          ___ / 20

TOTAL SCORE: ___ / 100

Grade:
90-100: Excellent (A)
80-89:  Good (B)
70-79:  Acceptable (C)
60-69:  Needs Improvement (D)
<60:    Fails Standards (F)
```

---

## Example Completed Rubric

### Sample Review: Governance Dashboard

**Category 1: Spacing & Layout (18/20)**

| +/- | Weight | Criterion | Notes |
|-----|--------|-----------|-------|
| + | 5 | Consistent padding | All cards use 24px padding consistently |
| + | 5 | Table consistency | All tables have 16px cell padding, columns sized properly |
| + | 4 | Header alignment | All table headers align with data columns |
| Partial | 3 | Border consistency | Cards have borders, but one button group doesn't (2/3 points) |
| + | 3 | Spacing between groups | Consistent 32px gaps between sections |

**Category 2: Typography Consistency (18/20)**

| +/- | Weight | Criterion | Notes |
|-----|--------|-----------|-------|
| + | 6 | Page titles | All 32px/bold across 4 pages checked |
| Partial | 6 | Section headers | Most 24px, but Info page uses 20px (3/6 points) |
| + | 4 | Subsection headers | All 18px/semibold |
| + | 2 | Hierarchy correct | No inversions found |
| + | 2 | Line height | Consistent 1.6 throughout |

**Category 3: Icon Usage (12/15)**

| +/- | Weight | Criterion | Notes |
|-----|--------|-----------|-------|
| + | 5 | Lucide library | All icons from Lucide |
| - | 4 | Vertical centering | Search icon 2px below baseline (0/4 points) |
| + | 3 | Size consistency | All inline icons 16px |
| + | 3 | Pattern consistency | All action buttons have icons |

**Category 4: Content Density (19/25)**

| +/- | Weight | Criterion | Notes |
|-----|--------|-----------|-------|
| - | 8 | No walls of text | About section has 250 words unbroken (0/8 points) |
| + | 6 | Progressive disclosure | Legal text uses accordion |
| + | 5 | Clear subheadings | All dense sections have h3 breaks |
| + | 4 | Logical grouping | Content well grouped |
| + | 2 | Bullet limits | No lists exceed 6 items |

**Category 5: Visual Hierarchy (15/20)**

| +/- | Weight | Criterion | Notes |
|-----|--------|-----------|-------|
| Partial | 8 | Illustration placeholders | 2 of 4 sections have placeholders (4/8 points) |
| + | 5 | Single-column layout | Proper vertical stack |
| + | 4 | Alternating pattern | Text/image alternates correctly |
| Partial | 3 | Aspect ratio | Most 16:9, one is square (1.5/3 points) |

**TOTAL: 82/100 (B - Good)**

**Priority Fixes:**
1. High: Fix wall of text in About section (250 words → break into 3 subsections)
2. High: Center search icon vertically
3. Medium: Add illustration placeholders to 2 remaining sections
4. Medium: Standardize Info page section headers to 24px
5. Low: Fix aspect ratio on governance flow illustration

---

## Usage Guidelines

1. **Score each criterion independently** - Don't let one failure influence others
2. **Document evidence** - Note specific examples (e.g., "Card on Delegates page: 16px padding, Card on Info page: 24px padding")
3. **Use partial points sparingly** - Only when criterion is mostly met but has minor issues
4. **Prioritize fixes by weight** - Higher weight items should be fixed first
5. **Context matters** - Hero sections may intentionally differ from content sections
