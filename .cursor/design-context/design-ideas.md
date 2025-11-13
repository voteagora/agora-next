# Design Directions for New User Support

## Direction 1: Contextual Help System with Collapsible Banners

**High-level approach**: Replace the prominent walls of text with a minimal, dismissible banner system that progressively reveals information on-demand. Move detailed explanations into the existing HelpButton slide-over panel.

### Implementation Details:

**Proposals Page:**

- Remove the large "Voting process" box entirely
- Add a compact info banner at the top of the proposals list that says: "New to Syndicate governance? Understanding the voting process can help you participate effectively." with two actions: "Learn More" (opens help panel) and a dismiss "X"
- The banner uses `bg-blue-50 border-l-4 border-blue-500` styling (info banner pattern from ui-style.md), with padding `p-4`, appears above the "All Proposals" heading
- Banner state persists to localStorage - once dismissed, stays dismissed for this user
- The existing HelpButton in the header gets enhanced ProposalsHelpContent (which already exists) that includes all the voting process details in an organized, scannable format
- For users who haven't self-delegated yet and try to vote, show a contextual modal explaining "You need to activate your voting power first" with a link to the Voters page

**Voters Page:**

- Remove both the "How voting power works" and "Why it's designed this way" boxes entirely
- Remove the separate "Self-Delegation" box completely
- Remove the separate "Delegate to Other Members" box completely
- Add a compact dismissible banner above the delegate table: "To participate in governance, you need to activate your voting power by self-delegating or delegating to someone you trust." with actions: "Learn More" (opens help panel) and dismiss "X"
- Banner styling: `bg-blue-50 border-l-4 border-blue-500 p-4`
- Move the "Delegate to self" button OUT of an info box and integrate it directly into the main interface in one of two ways:
  - Option A: Add it as a prominent action button in the top-right of the page next to the search/filter controls (similar to "Create Proposal" buttons on other pages). Button text: "Delegate to self" with a small info icon next to it that shows a tooltip explaining "Activate your voting power to vote directly"
  - Option B: If the user is connected but hasn't self-delegated, show a centered empty state card above the delegate table with the heading "Activate Your Voting Power", brief description "Self-delegate to vote directly on proposals", and prominent "Delegate to self" button. Once delegated, this card disappears and they see the full table
- All the detailed explanation content (how delegation works, ERC20Votes, membership status, choosing delegates) moves into the enhanced HelpButton panel
- The HelpButton in the header remains visible and contains VotersHelpContent (already exists) with all the comprehensive information

**Help Panel Enhancements:**

- The existing HelpButton component and HelpPanel already exist and work well
- Enhance the ProposalsHelpContent to include all voting process information in scannable sections with visual hierarchy
- Enhance the VotersHelpContent to include all delegation information, including the DUNA membership legal language
- Add visual treatment: use the numbered circles pattern that already exists in HelpButton for step-by-step processes
- Content is organized with clear headings, bullet points, and examples

**localStorage Management:**

- Create a simple banner dismissal system: store dismissed banner IDs in localStorage
- Key format: `syndicate_banner_dismissed_proposals` and `syndicate_banner_dismissed_voters`
- Banners reappear if user clears storage or uses different browser (that's okay - better than never seeing it again)

**Benefits of this approach:**

- Dramatically reduces visual clutter - removes 4 large boxes across 2 pages
- Information is still fully available, just on-demand via the Help button
- Critical action (self-delegation) becomes more discoverable by integrating into main UI
- First-time users get gentle guidance without overwhelming them
- Experienced users can immediately access functionality
- Consistent with existing Help patterns in the codebase

### Critique of Direction 1:

**Does it solve high priority issues?**

- ✅ **Information overload on first impression**: YES - Reduces to small banners that can be dismissed
- ✅ **Permanent prominence for temporary information**: YES - Banners are dismissible and stay dismissed
- ⚠️ **Critical action buried in text**: PARTIALLY - Moves the button out of text, but Option A vs Option B needs decision. Option B is better because it's more contextual
- ✅ **Inconsistent visual weight**: YES - Banners are visually lighter than current boxes
- ⚠️ **Legal language too prominent**: PARTIALLY - Moves it to Help panel, but banners still visible to all users initially

**Does it make sense in context?**

- Looking at the existing HelpButton implementation, it already contains similar content to what we need. This is good - we're building on existing patterns rather than inventing new ones.
- The banner approach is familiar and well-understood by users
- CONCERN: Even a "minimal" banner still adds visual weight. We're still showing something to everyone on every visit until they dismiss it. This doesn't fully solve the "seen it once, don't need it again" problem.

**Can we make it simpler?**

- YES: Instead of two options for self-delegate button placement, we should pick one. Option B (contextual empty state when not delegated) is better because it shows the button only when relevant.
- YES: We could skip the banners entirely on the Proposals page. If someone tries to vote without being delegated, we catch it at that moment with a modal. This removes the need for any persistent banner.
- YES: The Voters page banner could be even simpler - just show it to connected users who haven't delegated, not to everyone.

**Did we forget anything?**

- Need to specify what happens on mobile - banners should be full-width and stack nicely
- Need to handle the DUNA legal language carefully - it's required for compliance, so moving it to Help panel means we need to ensure users can find it when needed
- Should add a link from the Help button content to the Info page where the full legal text lives
- The self-delegate button integration needs to account for users who are already delegated to someone else (don't show the button, or show "Re-delegate to self" instead)

**Missing considerations:**

- Users who arrive at the Voters page first (bypassing Proposals) might not see the Help button in the header if they don't look up
- We're relying on users discovering the Help button - should we make it more prominent or add a tooltip on first visit?

---

## Direction 2: Smart Progressive Disclosure with Wallet-State Awareness

**High-level approach**: Instead of showing information to everyone, show contextual guidance based on the user's actual state and needs. If they're not connected, show connection prompts. If connected but not delegated, show delegation guidance. If already set up, show nothing and let them use the interface.

### Implementation Details:

**Proposals Page:**

- Remove the "Voting process" info box completely
- Implement three different page states based on wallet connection and delegation status:

  **State 1: Not Connected**

  - Show hero section as normal
  - Show proposals list as normal (read-only)
  - Add a subtle one-liner above the proposals list: "Connect your wallet to participate in governance" with the text "participate" being a link-styled word that opens a lightweight popover explaining what participation means
  - No large information boxes

  **State 2: Connected but Not Delegated**

  - Show proposals list as normal
  - Add a prominent dismissible card between hero and proposals list with the layout:
    - Left side: Info icon in a blue circle
    - Main content: "Ready to vote? You'll need to activate your voting power first by self-delegating or choosing a delegate."
    - Right side: "Activate Now" button that takes user to Voters page, and dismiss "X"
  - Card styling: `bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center gap-4`
  - This card can be dismissed for the session

  **State 3: Connected and Delegated**

  - Show proposals list with no information boxes or banners
  - User can immediately interact with proposals
  - Clean, minimal interface

- Add inline contextual help: when hovering over proposal status labels like "Temp-Check" or "Active", show a tooltip with quick definition
- Add a small info icon next to "All Proposals" heading that explains the voting process when clicked (opens a compact modal, not the full help panel)

**Voters Page:**

- Remove all four information boxes completely
- Implement wallet-state aware interface:

  **State 1: Not Connected**

  - Show the standard hero section
  - Replace the delegate table with a centered empty state:
    - Icon: Wallet icon
    - Heading: "Connect to view delegates"
    - Description: "Connect your wallet to see eligible delegates and manage your voting power"
    - "Connect Wallet" button

  **State 2: Connected but Not Delegated**

  - Show hero section
  - Show a prominent call-to-action card before the delegate table:

    - Heading: "Activate your voting power"
    - Description: "Choose how you want to participate in Syndicate governance:"
    - Two equal-width option cards side-by-side:

      **Card 1: Self-Delegate**

      - Icon: User icon
      - Title: "Vote directly"
      - Description: "Self-delegate to vote on proposals from your wallet"
      - "Delegate to self" button (primary style)
      - Small "Learn more" link that opens a popover with details about self-delegation

      **Card 2: Choose a Delegate**

      - Icon: Users group icon
      - Title: "Delegate to others"
      - Description: "Choose a trusted representative to vote on your behalf"
      - "Browse delegates" button (secondary style) that scrolls down to the table
      - Small "Learn more" link that opens a popover with details about delegation

    - Card container styling: `bg-wash border border-line rounded-xl p-8 mb-8`
    - Option cards styling: `grid grid-cols-2 gap-6`, each option: `bg-neutral border border-line rounded-lg p-6`
    - This CTA card has a dismiss option in the top-right corner

  **State 3: Connected and Delegated to Self**

  - Show minimal hero section
  - Show delegate table immediately
  - Add a small status indicator above the table: "Your voting power: [amount] (self-delegated)" with checkmark icon
  - No information boxes or banners

  **State 4: Connected and Delegated to Others**

  - Show minimal hero section
  - Show delegate table with the user's chosen delegate highlighted subtly
  - Add status indicator above table: "Your voting power: [amount] (delegated to [name/address])" with a "Change" link
  - No information boxes or banners

**Individual Delegate Profile Pages:**

- When viewing a delegate's profile and user is not delegated, show a sticky footer bar: "Ready to delegate to [delegate name]?" with "Delegate" button
- This replaces the need for lengthy explanations on the voters page

**Tooltips and Inline Help:**

- Add small info icons next to technical terms ("Voting power", "Delegation", "ERC20Votes") that show definition tooltips on hover
- Tooltips use the existing Radix UI tooltip component with `max-w-[320px]` and clear, concise explanations
- Example: Voting power info icon shows "Your voting power is based on your SYND token balance at the time of each proposal snapshot"

**Modal for Detailed Information:**

- Create a new lightweight modal component (not full slide-over) that appears when user clicks "Learn more" links
- Modal is centered, max width 640px, contains structured information with headings and bullets
- Unlike the help panel, this is focused on the specific topic (e.g., just self-delegation, not all delegation concepts)

**Technical Implementation:**

- Use `useAccount()` hook to get connection status
- Use `useProfileData()` hook to get delegation status (already used in SyndicateDelegateInfo)
- Create a new `useDelegationStatus()` hook that returns a clear status: `not_connected`, `connected_not_delegated`, `delegated_to_self`, `delegated_to_other`
- Create new components:
  - `VoterActivationCard.tsx` - The two-option activation card
  - `VoterStatusIndicator.tsx` - The status line above delegate table
  - `ProposalActivationBanner.tsx` - The activation prompt on proposals page
  - `InlineHelpModal.tsx` - Lightweight modal for focused help content

**Benefits of this approach:**

- Zero noise for users who are already set up and know what they're doing
- Highly relevant, targeted guidance based on where user is in their journey
- Critical actions surface automatically when needed
- Information is truly contextual rather than assumed
- Eliminates the "read it once and it's no longer relevant" problem entirely

### Critique of Direction 2:

**Does it solve high priority issues?**

- ✅ **Information overload on first impression**: YES - Shows nothing to users who are already set up
- ✅ **Permanent prominence for temporary information**: YES - Information disappears once user completes the relevant action
- ✅ **Critical action buried in text**: YES - The two-card activation UI on Voters page makes self-delegation very clear and actionable
- ✅ **Inconsistent visual weight**: YES - Uses cards appropriately for actionable content, not passive information
- ✅ **Legal language too prominent**: YES - Moved to secondary locations (help modals, delegate profiles)

**Does it make sense in context?**

- EXCELLENT APPROACH: This is the most sophisticated of the three directions. It fundamentally rethinks the problem - "why are we showing the same thing to everyone?"
- The wallet-state awareness is already partially implemented in the codebase (useAccount, useProfileData hooks exist), so we're building on existing infrastructure
- The empty state for non-connected users is a best practice pattern
- CONCERN: The two-option card on Voters page (Card 1: Self-Delegate, Card 2: Choose Delegate) might still feel like it's explaining too much. The descriptions could be even more concise.
- Looking at the screenshots, the grid image on the homepage shows this is a professional governance platform - the state-based approach matches that sophistication

**Can we make it simpler?**

- YES: The "inline contextual help" idea (tooltips on status labels) is good but might be overkill. Focus on the main state-based UI first, add tooltips only if user testing shows confusion.
- YES: The separate lightweight modal component might not be necessary - could use the existing Help Panel with focused content instead of creating a new modal type.
- YES: The status indicators for delegated users ("Your voting power: [amount] (self-delegated)") could be even simpler - maybe just a small badge or checkmark in the header rather than a full line of text.
- NO: The four states on Voters page feel right - they map to real user journeys. Don't simplify this.

**Did we forget anything?**

- Need to handle edge cases: What if user is delegated but has 0 voting power (no tokens)? Should probably show a different message.
- The sticky footer on individual delegate profile pages is smart, but need to ensure it doesn't conflict with existing footer or mobile navigation
- Should specify transition animations when state changes (e.g., when user connects wallet, the page transitions from State 1 to State 2)
- Mobile layout for the two-card grid on Voters page - should stack vertically on small screens
- What about users who are delegated to themselves but then transfer all their tokens? They're still "delegated" but have no power - needs handling

**Missing considerations:**

- Delegation status can change without page refresh (tokens transferred, delegation changed in wallet). Need to handle real-time updates or at least refresh on wallet events.
- The State 2 card on Proposals page ("Ready to vote?") assumes user wants to vote. For users who just want to browse governance discussions, this might feel pushy. Could add "or just browse proposals" text.
- Need to ensure DUNA legal language is still accessible for compliance - maybe add a footnote link in the footer: "About Syndicate's legal structure"

**Strengths to preserve:**

- The fundamental insight that different users need different UI is excellent
- The two-option card design on Voters page is clean and makes the choice clear
- Showing minimal UI to advanced users respects their time and expertise

---

## Direction 3: Onboarding Wizard with First-Visit Detection

**High-level approach**: Remove all persistent information boxes and replace with a one-time, structured onboarding flow that only appears for genuinely new users. After completion (or dismissal), the interface is clean permanently. Add an "Info" section to the Info tab where users can always access comprehensive governance documentation.

### Implementation Details:

**First-Visit Detection:**

- Use localStorage to track if user has completed onboarding: `syndicate_onboarding_completed`
- Also track if user has previously visited without completing: `syndicate_onboarding_dismissed_count`
- If onboarding has been dismissed 2+ times, stop showing it (user clearly doesn't want it)
- Optional: For connected wallets, could also track onboarding completion on-chain or in the database for cross-device persistence

**Proposals Page - First Visit:**

- Remove the "Voting process" info box permanently
- On first visit, after page loads, show a centered modal overlay (not full-page, just a centered dialog):

  **Onboarding Modal - Step 1 of 3**

  - Modal styling: `max-w-2xl centered with backdrop`
  - Progress indicator at top: "1 of 3" or dots
  - Heading: "Welcome to Syndicate Governance"
  - Content: Brief introduction to what this platform does (2-3 sentences)
  - Visual: Small illustration or icon
  - Two buttons: "Skip for now" (secondary, bottom-left) and "Get Started" (primary, bottom-right)

  **Onboarding Modal - Step 2 of 3**

  - Heading: "Understanding the Voting Process"
  - Content: Condensed explanation of the multi-stage voting process
  - Visual treatment: Timeline diagram showing Temp-Check → Voting → Review → Enactment with key numbers (5%, 7 days, 10%, etc.)
  - Use a visual diagram rather than bullet points - this could be a simple vertical timeline with 4 nodes
  - "Back" button (secondary, bottom-left), "Next" (primary, bottom-right)

  **Onboarding Modal - Step 3 of 3**

  - Heading: "Activating Your Voting Power"
  - Content: Explains that you need to self-delegate or delegate to others to participate
  - Two options shown as cards:
    - "Delegate to Self" - brief explanation
    - "Delegate to Others" - brief explanation
  - "Back" button (secondary, bottom-left), "Go to Voters Page" (primary, bottom-right)
  - When user clicks "Go to Voters Page", mark onboarding as completed and navigate to /delegates

- After onboarding is completed or dismissed, proposals page shows:
  - Clean hero section
  - Immediate proposals list
  - No information boxes
  - Small help button in header for reference

**Voters Page - First Visit (if arrived directly, not from onboarding):**

- Remove all four information boxes permanently
- If user hasn't completed onboarding, show a simplified version:

  **Onboarding Modal - Voters Page Version (2 steps)**

  - Step 1: "Activating Your Voting Power" - explains delegation concept
  - Step 2: "Choose Your Approach" - shows self-delegate vs delegate to others options

- After onboarding completion/dismissal, voters page shows:
  - Hero section
  - If not connected: Simple "Connect your wallet to manage delegation" message
  - If connected but not delegated: Single prominent CTA card (similar to Direction 2) with two clear options: "Delegate to self" button and "Browse delegates below" prompt
  - If already delegated: Just the clean delegate table with a small status indicator
  - No walls of text

**Persistent Documentation - Info Tab:**

- Add a new page at `/info/governance-guide` (or update existing Info section)
- This page contains all the detailed information currently in the info boxes, but organized as proper documentation:

  **Governance Guide Page Structure:**

  - Section 1: "How Voting Works"
    - Subsections for Temp-Check, Governance Proposal, Rules Committee Review, Enactment
    - Each subsection has clear heading, explanation, requirements, and examples
  - Section 2: "Delegation and Voting Power"
    - What is delegation
    - How ERC20Votes works
    - Self-delegation process
    - Delegating to others
    - DUNA membership status explanation
  - Section 3: "Getting Started"
    - Step-by-step guide for new token holders
    - Common questions and answers
    - Troubleshooting
  - Section 4: "Legal Framework"
    - Association Agreement references
    - DUNA structure
    - Rules Committee role
    - All the formal legal language that currently exists

- This page uses clear typography hierarchy from ui-style.md:
  - `text-3xl font-extrabold` for main heading
  - `text-2xl font-bold` for section headings
  - `text-xl font-semibold` for subsection headings
  - `text-base` for body text
  - Tables for requirements and thresholds
  - Visual diagrams for processes
- Add a table of contents with jump links on the left sidebar (desktop) or collapsible menu (mobile)
- Make this page easily discoverable:
  - Add link in the main nav: Info → "Governance Guide"
  - Add link in the header Help button content: "For comprehensive documentation, see the Governance Guide"
  - Add link in footer

**Onboarding Component Details:**

- Create new component: `OnboardingFlow.tsx`
- Create sub-components:
  - `OnboardingModal.tsx` - The modal wrapper
  - `OnboardingStep.tsx` - Individual step component
  - `OnboardingProgress.tsx` - Progress indicator
- Modal uses existing dialog components from shadcn/ui
- Animations: Smooth transitions between steps using Tailwind transitions
- Keyboard navigation: Arrow keys for next/back, Escape to dismiss
- Mobile responsive: Modal becomes full-screen on mobile
- Accessibility: Proper focus management, ARIA labels

**Re-triggering Onboarding:**

- Add a "?" or "Take tour again" option in the header or footer for users who want to see onboarding again
- Clicking this clears the onboarding completion flag and restarts the flow

**Tracking and Analytics:**

- Track onboarding completion rate
- Track which step users drop off at
- Track how many users skip vs complete
- Track time spent on each step
- This data helps improve the onboarding over time

**Benefits of this approach:**

- Solves the "read once, irrelevant forever" problem completely
- New users get a structured, guided introduction without feeling lost
- After onboarding, interface is permanently clean for all users
- All detailed information is still accessible via the Info tab for reference
- User can choose their own path - skip onboarding if they're experienced
- Creates a more professional, polished first impression compared to walls of text

### Critique of Direction 3:

**Does it solve high priority issues?**

- ✅ **Information overload on first impression**: YES - Modal onboarding is structured and dismissible
- ✅ **Permanent prominence for temporary information**: YES - Onboarding is truly one-time, then interface is clean forever
- ⚠️ **Critical action buried in text**: PARTIALLY - Onboarding explains self-delegation, but after dismissal, there's no obvious prompt for connected-but-not-delegated users
- ✅ **Inconsistent visual weight**: YES - Clean interface after onboarding
- ✅ **Legal language too prominent**: YES - Moved to dedicated Info page

**Does it make sense in context?**

- MIXED: Onboarding wizards are common in SaaS apps, but less common in Web3/DAO governance platforms. Users might find a modal blocking their first visit unexpected.
- The Info tab documentation approach is excellent - gives information a proper home rather than shoving it in the UI
- CONCERN: Onboarding appears "after page loads" - this timing might feel disruptive. User lands on page, starts looking around, then modal pops up.
- Looking at the codebase, there's already a Help Panel system. Adding a separate onboarding modal creates two different education patterns. This could feel inconsistent.
- The "2+ dismissals = stop showing" logic is considerate, but complex. Adds cognitive load for the implementation team.

**Can we make it simpler?**

- YES: The three-step onboarding might be too long. Could condense to 2 steps: "Welcome + Voting Process" and "Activating Your Power"
- YES: Instead of a modal that blocks the page, could use a subtle slide-in tour (like those "tips" tooltips that point to UI elements). Less intrusive.
- YES: The "analytics tracking" section is good practice but adds implementation complexity. Start without it, add later if needed.
- YES: The distinction between "arrived from onboarding" vs "arrived directly at voters page" creates branching logic. Could simplify by having one onboarding flow regardless of entry point.
- NO: The Info tab governance guide is worth building even without onboarding - this is the right place for comprehensive documentation.

**Did we forget anything?**

- What happens if a user dismisses onboarding, then returns 6 months later having forgotten everything? They might need a refresher but won't get it because onboarding is permanently dismissed. The "take tour again" option helps, but users need to discover it.
- Mobile experience: Full-screen modal on first visit to a mobile site is aggressive. Consider whether onboarding should be desktop-only, or use a different pattern on mobile.
- The onboarding assumes users arrive at Proposals page first. Many might land on Info or Voters page first - need to handle all entry points gracefully.
- After onboarding dismissal, the Voters page "if not connected" and "if connected but not delegated" states need to be specified. The description says "simple message" and "single prominent CTA card" but these weren't detailed in Direction 3's original description.

**Missing considerations:**

- Onboarding is synchronous (blocks user from exploring) while Help Panel is asynchronous (user can explore, then seek help). The synchronous approach might frustrate advanced users who just want to look around.
- The Info page governance guide is great, but it's disconnected from the primary user flows. Users browsing proposals won't naturally think "I should check the Info tab for help"
- Creating a full governance guide page is significant content work - needs writing, editing, legal review (especially for DUNA language), and ongoing maintenance
- The visual timeline diagram in Step 2 would need to be custom-designed and built - can't just be text

**Strengths to preserve:**

- The Info tab governance guide is the right solution for comprehensive documentation - should be built regardless of which direction we pick
- The "permanently clean after onboarding" guarantee is appealing - users never see the walls of text after Day 1
- The structured, step-by-step approach respects that governance is complex and needs explanation

**Fundamental question about this direction:**

- Is a modal that interrupts the first visit the right UX for a governance platform? Users might be arriving from a proposal link shared on Twitter or Discord, wanting to read that specific proposal. Blocking them with onboarding could be frustrating. This is the biggest concern with Direction 3.

---
