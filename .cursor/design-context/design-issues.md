# Design Issues: New User Support Content

## Problem Statement

We hastily added large instructional text boxes to the Proposals and Voters pages to support new users. While these provide necessary information, the implementation has significant UX problems.

## High Priority Issues

### 1. Information overload on first impression

**What's wrong**: When users first land on the Proposals or Voters pages, they're immediately confronted with massive walls of text in prominent boxes. The actual interface (proposal list, delegate table) is pushed below the fold.

**Why it's a problem**: New users can't see what the app actually does before reading long instructions. This creates a high cognitive load and may cause users to bounce. The hierarchy is backwards—we're showing documentation before functionality.

### 2. Permanent prominence for temporary information

**What's wrong**: These instruction boxes are equally prominent on every visit. A user who has read them once (or already knows how governance works) sees the exact same wall of text every time they visit.

**Why it's a problem**: The information becomes noise after the first visit. This is classic "banner blindness"—users learn to ignore it, making the page feel cluttered for no benefit. We're wasting prime screen real estate on information that has diminishing returns.

### 3. Critical action buried in explanatory text

**What's wrong**: On the Voters page, the "Delegate to self" button—arguably the most important action for new users—is embedded at the bottom of the "Self-Delegation" explanation box. It's not integrated into the main UI flow.

**Why it's a problem**: Users who need to self-delegate can't easily find the button because it's hidden in a wall of text. The action is disconnected from its outcome (appearing in the delegates table). This violates basic UX principles of progressive disclosure and action affordance.

### 4. Inconsistent visual weight

**What's wrong**: The instruction boxes use the same visual treatment (large rounded containers with borders and shadows) as actual interface elements, but they contain passive information rather than interactive content.

**Why it's a problem**: This creates visual confusion about what's actionable vs. informational. The boxes feel heavy and in-your-face, competing for attention with the actual functionality. The design doesn't differentiate between "read once" content and "use repeatedly" content.

## Medium Priority Issues

### 5. Legal/procedural language too prominent

**What's wrong**: The voting process explanation on the Proposals page uses formal legal language ("pursuant to Article 14", "violative of legal requirements", "technically unfeasible or malicious") that's necessary for governance but overwhelming for new users.

**Why it's a problem**: This language is intimidating and makes the platform feel bureaucratic. While legal precision is important for compliance, having it front-and-center on the homepage makes the barrier to entry feel higher than it needs to be. Most users just need to know the basics.

### 6. No progressive disclosure

**What's wrong**: All information is shown at once with no ability to collapse, dismiss, or access more details on demand. There's no distinction between "essential to know" vs. "good to know" information.

**Why it's a problem**: Users can't customize their experience based on their knowledge level. Power users are forced to scroll past content they don't need, while new users might be overwhelmed by the amount of information presented simultaneously.

### 7. Disconnected help patterns

**What's wrong**: Looking at the codebase, there's already a `HelpButton` component (`src/components/Help/HelpButton.tsx`) that provides similar information in a more contextual way. The wall-of-text approach duplicates this pattern.

**Why it's a problem**: We're solving the same problem (onboarding new users) in multiple ways, creating inconsistency. Users don't know whether to look for information in the prominent boxes or the help button, reducing the effectiveness of both.

## Low Priority Issues

### 8. Mobile experience concerns

**What's wrong**: These large text boxes likely dominate even more screen real estate on mobile devices, where space is at a premium.

**Why it's a problem**: On mobile, users would need to scroll through potentially multiple screens of text before reaching any actionable content. This amplifies all the issues above.

### 9. Lack of visual hierarchy within boxes

**What's wrong**: Within each instructional box, text is fairly uniform with minimal visual hierarchy. Key concepts are bolded but there's little else to aid scanning.

**Why it's a problem**: Users who want to quickly reference information (e.g., "What percentage do I need for temp-check?") can't easily scan the text. This reduces the utility of the information even for users who do need it.

## Success Criteria

A successful solution should:

- Reduce first-page cognitive load significantly
- Make critical actions (like self-delegation) easily discoverable
- Allow experienced users to access core functionality immediately
- Provide information when users need it, not preemptively
- Maintain compliance requirements (showing all necessary legal/procedural information)
- Create a professional, polished impression
- Work well on both desktop and mobile
