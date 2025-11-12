# Design Context: Syndicate Network Collective Governance App

## App Overview

This is Agora, a governance platform for the Syndicate Network Collective (SNC), a Wyoming DUNA (Decentralized Unincorporated Nonprofit Association) that operates through token-based governance using the SYND token. The platform enables token holders to participate in collective decision-making through delegation and voting on governance proposals.

## Pages in the App

### 1. Proposals Page (Home)

**Purpose**: Display governance proposals and explain the voting process  
**Route**: `/` or `/proposals`  
**Key Elements**:

- Hero section with organization branding
- "Voting process" information box (the problematic wall of text)
- "All Proposals" list with filtering and sorting
- Each proposal shows status, voting results, and metadata

**Primary Actions**:

- View proposals
- Filter/sort proposals
- Click into individual proposals to vote
- Create new proposal drafts (for authorized users)

### 2. Individual Proposal Page

**Purpose**: View proposal details and cast votes  
**Route**: `/proposals/[proposal_id]`  
**Key Elements**:

- Proposal description and metadata
- Voting interface (right sidebar on desktop)
- Vote results and participation statistics
- Discussion thread

**Primary Actions**:

- Read proposal details
- Cast vote (For/Against/Abstain)
- Share vote

### 3. Discussions Page (Forums)

**Purpose**: Community forum for general discussions  
**Route**: `/forums`  
**Key Elements**:

- List of discussion topics
- Categories sidebar
- Create new discussion button
- Search and filtering

**Primary Actions**:

- Browse discussions
- Create new topics
- View and reply to threads
- React with emojis
- Attach documents

### 4. Individual Discussion Thread Page

**Purpose**: View and participate in a specific discussion  
**Route**: `/forums/[topic_id]`  
**Key Elements**:

- Original post with content and attachments
- Comment thread
- Emoji reactions
- Related proposal links (if applicable)

**Primary Actions**:

- Read discussion
- Post comments/replies
- Add emoji reactions
- Upload attachments
- Create temp-check proposals (for DUNA category)

### 5. Voters Page (Delegates List)

**Purpose**: View delegates and manage delegation  
**Route**: `/delegates`  
**Key Elements**:

- Hero section
- "How voting power works" information box (another problematic wall of text)
- "Self-Delegation" box with "Delegate to self" button (third problematic section)
- "Delegate to Other Members" information box (fourth problematic section)
- Sortable table of delegates with voting power, 7d change, # of delegators

**Primary Actions**:

- Self-delegate to activate voting power
- Delegate to other members
- Search and sort delegates
- View delegate profiles

### 6. Individual Delegate Profile Page

**Purpose**: View detailed information about a specific delegate  
**Route**: `/delegates/[addressOrENSName]`  
**Key Elements**:

- Delegate card (left sidebar) with profile info, voting power, follower counts
- Delegate statement
- Voting history
- Delegations (who delegated to them)
- Discussion participation

**Primary Actions**:

- View delegate's history
- Delegate voting power to this address
- View their votes and participation

## Core Functionality

### Delegation System

The SYND token uses OpenZeppelin's ERC20Votes standard. Tokens don't count as votes until holders choose where their voting power should live:

1. **Self-delegation**: Vote directly from your own wallet
2. **Delegate to others**: Point voting power to a trusted representative

Key points:

- Delegation does NOT transfer token ownership
- Delegation only points voting power
- Can change or revoke delegation anytime
- Requires onchain transaction to activate

### Voting Process

Complex multi-stage process:

1. **Temp-Check Phase**: 7-day period where members indicate support. Needs 5% of tokens to proceed.
2. **Governance Proposal Phase**: If temp-check passes, 7-day voting period where members vote for/against
   - **Passes** if majority votes affirm AND 10% of tokens participate
   - **Fails** if majority denies OR less than 10% participation
3. **Rules Committee Review**: 3-day period where Rules Committee can revert if proposal is legally problematic, unfeasible, or malicious
4. **Enactment**: If not reverted, proposal is enacted
5. **Funding Recipients**: Must complete tax reporting within 15 days

### Forum System

- Multi-category discussion forum
- Supports rich text editing (Duna editor)
- File attachments stored on IPFS
- Emoji reactions and upvoting
- Special DUNA category for quarterly reports
- Can create temp-check proposals from discussions

### User Authentication

- Web3 wallet connection (using wagmi/RainbowKit)
- Signature verification for actions
- Token-gated features based on holdings/delegation

## Technical Architecture

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui components library
- **Wallet**: RainbowKit + wagmi
- **Database**: PostgreSQL (Prisma ORM)
- **Smart Contracts**: ERC20Votes governance token
- **Multi-tenancy**: Supports multiple DAOs/organizations through tenant configuration

## Navigation

Header nav items:

- Proposals
- Discussions
- Voters (Delegates)
- Info (static pages about the organization)
- Connect Wallet button (right side)

## Current User Experience Issues

The app currently has large instructional text boxes on key pages (Proposals and Voters pages) that were hastily added to support new users. These boxes:

- Take up significant screen real estate
- Push actual functionality below the fold
- Are only relevant for first-time users
- Feel obtrusive and in-your-face
- Make the interface look cluttered and unprofessional

On the Voters page specifically:

- The "Self-Delegation" section contains the "Delegate to self" button embedded within explanatory text
- This button is not integrated into the actual delegates table UI
- It feels disconnected from the primary interface
