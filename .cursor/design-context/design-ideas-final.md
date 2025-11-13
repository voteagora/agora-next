# Final Design Directions (After Critique)

## Direction 1: Contextual Help System (Improved)

**High-level approach**: Replace walls of text with contextual UI elements that appear only when relevant. Leverage the existing HelpButton system and add smart, state-aware components.

### Proposals Page:

- Remove the "Voting process" info box completely
- Show clean interface to all users - just hero and proposals list
- Do NOT add any banners (removed from original plan based on critique)
- When a user who hasn't delegated tries to vote on a proposal, show a modal: "Activate your voting power first. Self-delegate or choose a delegate on the Voters page." with "Go to Voters" button
- Add small info icon next to each proposal status badge ("Temp-Check", "Active", etc.) that shows a tooltip on hover with quick definition
- Enhance the existing HelpButton in header to include comprehensive voting process information

### Voters Page:

- Remove all four information boxes completely
- Show clean hero and delegate table to all users
- For connected users who haven't delegated, show contextual activation card above the delegate table:
  - Heading: "Activate your voting power"
  - Brief description: "Choose how you want to participate:"
  - Two side-by-side options:
    - Left card: "Self-Delegate" with icon, short description "Vote directly from your wallet", and "Delegate to self" button
    - Right card: "Choose a Delegate" with icon, short description "Browse delegates below and select one to vote on your behalf", and arrow pointing down
  - Card styling: `bg-wash border border-line rounded-xl p-6 mb-8`
  - Options grid: `grid grid-cols-1 md:grid-cols-2 gap-4`
  - This card disappears once user is delegated
- For non-connected users, show a simple one-line message above table: "Connect your wallet to manage delegation" with "Connect Wallet" button
- For delegated users, show clean table with no messages
- Enhance the existing HelpButton to include all delegation information including DUNA legal language

### Help Panel Enhancements:

- Update `HelpButton` component's `ProposalsHelpContent` with all voting process details
- Update `HelpButton` component's `VotersHelpContent` with all delegation and legal information
- Use existing visual patterns (numbered circles, clear sections)
- Add link at bottom of Help Panel: "For complete documentation, see our Governance Guide" (links to Info tab)

### Technical Details:

- Use `useAccount()` hook to check if wallet is connected
- Use `useProfileData()` hook to check if user is delegated (this is already used in existing code)
- Create one new component: `VoterActivationCard.tsx` for the two-option card
- No localStorage needed - everything is derived from wallet state
- Mobile: Two-option cards stack vertically on small screens

---

## Direction 2: Smart Progressive Disclosure (Improved)

**High-level approach**: Show radically different UI based on wallet connection and delegation status. Users only see what's relevant to their current situation.

### Proposals Page States:

**State 1: Not Connected**

- Show hero section and proposals list as normal
- No banners or messages - just clean read-only interface
- Proposals are clickable but show "Connect wallet to vote" message in the voting UI

**State 2: Connected but Not Delegated**

- Show hero section and proposals list
- Add one dismissible card between hero and list:
  - Icon + message: "Ready to participate? Activate your voting power on the Voters page"
  - "Go to Voters" button and dismiss "X"
  - Styling: `bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 flex items-center gap-4`
  - Dismissal persists for session only
- When user tries to vote without delegation, modal explains and links to Voters page

**State 3: Connected and Delegated**

- Clean interface - just hero and proposals list
- No messages, banners, or guidance
- User can immediately interact with all features

### Voters Page States:

**State 1: Not Connected**

- Show hero section
- Show centered empty state replacing the delegate table:
  - Wallet icon
  - Heading: "Connect to view delegates"
  - Description: "Connect your wallet to see delegates and manage your voting power"
  - "Connect Wallet" button (styled prominently)

**State 2: Connected but Not Delegated**

- Show hero section
- Show activation card with two clear options:

  - Heading: "Activate your voting power"
  - Subheading: "Choose how you want to participate:"
  - Two cards side-by-side (stack on mobile):

    **Option 1: Self-Delegate**

    - User icon
    - "Vote directly"
    - Short description: "Vote on proposals from your wallet"
    - "Delegate to self" button (primary style)

    **Option 2: Choose a Delegate**

    - Users icon
    - "Delegate to others"
    - Short description: "Select a trusted representative below"
    - "Browse delegates ↓" link (secondary style) - smooth-scrolls to table

  - Container styling: `bg-wash border border-line rounded-xl p-8 mb-8`
  - Options: `grid grid-cols-1 md:grid-cols-2 gap-6`
  - Each option: `bg-neutral border border-line rounded-lg p-6 space-y-3`
  - This card has a small dismiss "X" in top-right (persists to session)

- Show full delegate table below the activation card

**State 3: Connected and Delegated to Self**

- Show hero section
- Show delegate table immediately
- Small status badge in top-right of page: "✓ Self-delegated" with subtle green accent
- No large status indicators or messages

**State 4: Connected and Delegated to Others**

- Show hero section
- Show delegate table with the delegated person's row having a subtle highlight (very light blue background)
- Small status text above table: "Delegated to [name/address]" with a "Change delegation" link
- Otherwise clean interface

### Individual Delegate Profile Pages:

- If viewing a delegate and user is not delegated to anyone: Show sticky bottom bar on desktop, inline button on mobile: "Delegate to [name]" with primary button styling
- If user is already delegated to someone else: Bar shows "Switch delegation to [name]?" instead

### Help System:

- Keep existing HelpButton in header for comprehensive information
- Add info icon tooltips next to technical terms (Voting power, Delegation, etc.)
- Tooltips are concise - 1-2 sentences max

### Technical Implementation:

- Create `useDelegationStatus()` hook that returns: `{ isConnected, isDelegated, delegatedTo, hasVotingPower }`
- Create components:
  - `VoterActivationCard.tsx` - The two-option card
  - `ProposalActivationBanner.tsx` - The State 2 card for proposals page
  - `DelegateTableEmptyState.tsx` - The "connect to view" state
- Handle wallet state changes with wagmi's wallet event listeners
- Mobile-responsive: All cards stack appropriately, status badges remain visible

### Edge Cases:

- Delegated but zero voting power: Show status with "(0 voting power)" and subtle warning icon with tooltip "Your voting power is based on your token balance"
- Delegation changes mid-session: Listen to wagmi wallet events and update UI reactively
- Mobile: Status indicators move from top-right to top-center on small screens

---

## Direction 3: Onboarding with Documentation Hub (Improved)

**High-level approach**: One-time, non-blocking onboarding for new visitors + comprehensive documentation in Info tab. Clean interface after first visit.

### First-Visit Onboarding:

**Detection:**

- Use localStorage: `syndicate_onboarding_completed` (boolean)
- If true, never show onboarding again
- If false and this is first visit, show onboarding after 2-second delay (gives user time to orient)

**Onboarding Flow (2 Steps):**

**Step 1: Welcome & Voting Process**

- Modal: `max-w-3xl` centered with translucent backdrop
- Progress: "1 of 2" at top
- Heading: "Welcome to Syndicate Governance"
- Content:
  - 2-3 sentence intro to what this platform does
  - Visual timeline showing the voting process: Temp-Check (5%, 5 days) → Vote (10% quorum, 7 days) → Review (3 days) → Enact
  - Timeline uses simple connected dots with labels, not a complex diagram
- Buttons: "Skip tour" (text link, bottom-left) | "Next" (primary button, bottom-right)

**Step 2: Activating Your Power**

- Progress: "2 of 2"
- Heading: "Ready to participate?"
- Content:
  - Short paragraph explaining delegation is required
  - Two visual cards showing the options:
    - "Self-Delegate" - icon, 1 sentence
    - "Choose a Delegate" - icon, 1 sentence
- Buttons: "Back" (secondary, bottom-left) | "Get Started" (primary, bottom-right)
- "Get Started" navigates to Voters page and marks onboarding complete

**After Onboarding:**

- Proposals page: Clean hero + proposals list, no info boxes
- Voters page: Show the same state-aware UI from Direction 2 (activation card for connected-not-delegated users, clean table for others)
- "Take tour again" link in footer for users who want to see it again

### Documentation Hub (Info Tab):

Create new page: `/info/governance`

**Page Structure:**

- Sidebar table of contents (desktop) / collapsible menu (mobile)
- Main content area with sections:

  **Section 1: How Voting Works**

  - Overview paragraph
  - Subsections:
    - Temp-Check Phase (requirements, duration, threshold)
    - Governance Proposal Phase (voting options, quorum, pass/fail conditions)
    - Rules Committee Review (purpose, duration, authority)
    - Enactment and Funding (completion timeline)
  - Use tables for requirements and thresholds
  - Use visual timeline (same one from onboarding) for process flow

  **Section 2: Delegation & Voting Power**

  - What is delegation
  - ERC20Votes explanation (keep technical but clear)
  - How to self-delegate (step-by-step)
  - How to delegate to others (step-by-step)
  - Changing your delegation
  - Token ownership vs. voting power

  **Section 3: DUNA Legal Structure**

  - Wyoming DUNA explanation
  - Membership status (all the current legal language lives here)
  - Association Agreement references
  - Rules Committee role and authority

  **Section 4: Getting Started**

  - Quick start guide for new token holders
  - FAQ section
  - Troubleshooting common issues

**Styling:**

- Typography hierarchy from ui-style.md:
  - `text-3xl font-extrabold text-primary` - Page title
  - `text-2xl font-bold text-primary` - Section headings
  - `text-xl font-semibold text-primary` - Subsection headings
  - `text-base text-secondary leading-relaxed` - Body text
- Spacing: `space-y-8` between sections, `space-y-4` within sections
- Sidebar: `sticky top-24 max-h-screen overflow-y-auto` on desktop
- Mobile: Sidebar becomes expandable accordion above content

**Discovery:**

- Add to main Info dropdown menu: "Governance Guide"
- Link from HelpButton content: "For detailed documentation, visit the Governance Guide"
- Link in footer: "How Syndicate governance works"
- Add metadata so it ranks in search engines

### Onboarding Component Implementation:

- Create `OnboardingFlow.tsx` component
- Use existing Dialog component from shadcn/ui for modal
- Simple progress indicator: "1 of 2" text, no fancy graphics
- Smooth transitions between steps: fade + slight slide
- Keyboard navigation: Enter for next, Escape to skip
- Mobile: Modal is full-screen on small devices (`h-screen` on `sm:` breakpoint)

### Re-triggering:

- Add link in footer: "Take tour again"
- Clicking clears `syndicate_onboarding_completed` and reloads page
- Also accessible from Help menu dropdown

### Simplified Approach (based on critique):

- NO analytics tracking initially - keep it simple
- NO complex "dismiss counting" logic - either completed or not
- NO different onboarding paths for different entry points - one flow, works everywhere
- YES to 2-second delay before showing modal - lets user see the page first
- YES to skippable and dismissible - never block user against their will

### Post-Onboarding UX (on Proposals and Voters pages):

Use the same state-aware UI components from Direction 2:

- Connected-not-delegated: Show activation card on Voters page
- Connected-delegated: Clean interface
- Not connected: Simple "Connect wallet" messaging

This way, Direction 3 is: Onboarding (first visit only) + Documentation Hub (always available) + Smart state-based UI (ongoing).

---
