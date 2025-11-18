### Direction 1 – **“Move deep education into Info, keep pages focused with small, dismissible prompts”**

**Core concept (one sentence)**  
Consolidate all long-form governance education into dedicated Info subpages and replace the big tutorial cards on Proposals and Voters with small, dismissible prompts that link there.

- **Proposals – Voting process card**: Remove the existing `SyndicateProposalsPageContent` card from above `All Proposals` and replace it with a short 1–2 sentence intro plus a `Learn how proposals pass` text link positioned just above the proposals list header.
- **Proposals – Detailed voting process content**: Move the full “Voting process” copy into a new `Info > Voting process` section or subpage (e.g. under `/info/voting-process`) and rewrite it into short paragraphs with subheadings instead of nested bullet lists.
- **Proposals – Legal detail access**: Add an inline `View full governance rules` text link at the bottom of the new Info section that routes users to the appropriate disclosures component (e.g. `SyndicateDunaDisclosures`) so the formal language remains accessible.
- **Voters – How voting power works card**: Replace the large “How voting power works” and “Why it’s designed this way” blocks in `SyndicateVotersPageContent` with a compact banner that explains in 2–3 short sentences that you must either self-delegate or delegate to vote and that delegation doesn’t move your tokens, and add a `Learn about voting & delegation` text link.
- **Voters – Banner behavior**: Make this new Voters banner dismissible per wallet (store in local storage or backend) and default it to hidden after the user closes it once, while retaining a small `New to voting?` text link above the delegates table to reopen the Info content.
- **Info – Voting & delegation section**: Create a new `Info > Voting & delegation` section (e.g. under `/info/delegation`) that merges the content from “How voting power works”, “Self-Delegation”, and “Delegate to Other Members” into clearly structured sub-sections with short prose and no bullet lists.
- **Self‑Delegation – Permanent home**: Move the `Delegate to self` action out of its explainer card and into the `Delegates` section header as a primary button that is always visible when the connected wallet can self-delegate.
- **Delegate to Other Members – Table-level helper**: Remove the dedicated “Delegate to Other Members” tutorial card and instead add a single sentence above the delegates table explaining that you can choose a delegate who votes on your behalf while you retain token ownership, followed by a `Learn about delegate responsibilities` text link to the new Info section.
- **Voters – Avoiding multiple banners**: Ensure that only one educational banner exists on the Voters page at a time by integrating the brief helper copy for self-delegation and delegation into the same compact, dismissible banner instead of separate sections.
- **Typography & layout clean-up**: When rewriting the Info sections and small banners, replace bolded phrases and bullet-heavy layouts with clear headings, short paragraphs, and dividers that connect edge-to-edge within their cards per the UI implementation guidelines.

**Reasoning (2–3 sentences)**  
This direction keeps the high-traffic Proposals and Voters pages focused on action while still giving new users a clear path to learn through the richer Info sections. It respects the guideline that educational content should live permanently only on information-focused pages, and keeps any remaining in-flow education small and fully dismissible. The self-delegation button becomes a predictable, permanent control in the delegates header instead of being buried in a temporary tutorial card, which should improve discoverability and confidence.

---

### Direction 2 – **“One-time guided tutorial using existing dialog pattern + status summary on Voters”**

**Core concept (one sentence)**  
Use a one-time, multi-step tutorial dialog to explain governance for new users while making the Proposals and Voters pages themselves nearly free of persistent educational blocks.

- **Tutorial entry – First visit detection**: On first visit to either the Proposals or Voters page, trigger a `Dialog`-based “Welcome to Syndicate governance” tutorial that reuses existing dialog components instead of introducing a new overlay pattern.
- **Tutorial content – Voting process**: Include a slide that summarizes the “Voting process” content in 3–4 short sentences and a simple visual stepper, and provide a `View full voting rules` text link that leads to the Info page or disclosures for users who want the legal details.
- **Tutorial content – Voting power & delegation**: Include a slide that summarizes “How voting power works”, emphasizing that votes only count after choosing self-delegation or a delegate, with short paragraphs instead of bullet lists and a link to the Info `Voting & delegation` section.
- **Tutorial content – Self‑Delegation vs delegates**: Include a slide that explains “Self-Delegation” and “Delegate to Other Members” in plain language, optionally with a small side-by-side comparison, and end with a primary action button that routes directly to the Voters page with focus on the self-delegation controls.
- **Tutorial persistence**: Persist a flag keyed by wallet so the tutorial dialog never auto-opens again for that wallet unless the user explicitly clicks a `Replay tutorial` link from the Info or Voters page.
- **Proposals – Remove permanent card**: Remove the `SyndicateProposalsPageContent` “Voting process” card entirely from the Proposals page and replace it with a single, unobtrusive line under the hero (`New to proposals? Open the governance tutorial`) that opens the dialog on demand.
- **Voters – Remove permanent cards**: Remove the “How voting power works” and “Why it’s designed this way” blocks from `SyndicateVotersPageContent` and instead render a compact “Your voting setup” summary row above the delegates table that shows whether the user is self-delegated, delegated, or undelegated.
- **Self‑Delegation – Primary control**: Inside the “Your voting setup” row, include the `Delegate to self` button as the primary CTA when the user is not yet delegated and as a secondary “Change to self-delegation” option when currently delegated to another address.
- **Delegate to Other Members – Inline helper**: Replace the large “Delegate to Other Members” explainer card with a one-line helper above the delegates table explaining that delegation does not transfer token ownership and can be changed at any time, plus a small `Learn more` text link that opens either the relevant tutorial slide or the Info page.
- **Info – Canonical home for full copy**: Move all long-form text from the old cards into Info subpages (`Voting process` and `Voting & delegation`) so the dialog slides can reference them via simple text links without duplicating page-length legal copy.

**Reasoning (2–3 sentences)**  
This direction concentrates the heavier education into a guided, one-time experience that is hard to miss for true newcomers but never clutters the main workflows again. The Proposals and Voters pages become action-centric, with only a slim “Your voting setup” row and a few text links remaining as ongoing helpers. Because the tutorial is built with the existing dialog pattern and leans on Info pages for long copy, it stays within current design language while significantly improving first-run understanding.

---

### Direction 3 – **“Progressive disclosure in context + richer Info pages, no top-of-page tutorial blocks”**

**Core concept (one sentence)**  
Replace the large tutorial blocks with small, context-attached explanations and empty states while turning the Info tab into the comprehensive source of governance education.

- **Proposals – Contextual empty state**: Replace the `SyndicateProposalsPageContent` “Voting process” card with a contextual empty state that only appears when there are no proposals or when the user has never voted, briefly explaining in one paragraph what a Governance Proposal is and linking to the Info `Voting process` section.
- **Proposals – Normal state**: In the normal case when proposals exist or the user has voted before, omit any separate tutorial block and keep only a small `How proposals work` text link near the “Relevant” filter that goes to the Info `Voting process` content.
- **Proposals – Detailed process**: Move the full “Voting process” copy to a new section within the Info page titled “How a proposal becomes law”, rewrite it into short sections with clear headings (e.g., “Temp-check”, “Member vote”, “Enactment & reversion”), and remove the nested bullet lists in favor of concise prose.
- **Voters – Remove large explainer container**: Remove the top-level `SyndicateVotersPageContent` tutorial card entirely so the `Delegates` section header and table move up into the above-the-fold area.
- **Voters – Microcopy in controls**: Add targeted microcopy inside the delegates search and filter area (e.g., placeholder text explaining you can search for ENS or addresses and a short caption under the filters that states you must either self-delegate or pick a delegate for your votes to count).
- **Voters – Ownership & risk note**: Embed the essential “delegation does not transfer your tokens or membership” message as a single sentence immediately below the delegates section title, treating it as critical system safety copy rather than a full tutorial block, and include a `Read full delegation details` text link to Info.
- **Self‑Delegation – Integrated CTA**: Make `Delegate to self` a persistent button in the delegates toolbar and optionally add a slim inline tip that appears only when the user is not yet delegated (`You haven’t delegated yet—self-delegate or pick a delegate to start voting`) and disappears once a delegation exists.
- **Delegate to Other Members – Inline explanation**: Remove the “Delegate to Other Members” card and instead add a short descriptive line just above the delegates table clarifying that selecting a delegate authorizes them to cast votes using your voting power and that you can change or revoke this at any time.
- **Info – Centralize explanations**: Create or expand Info subsections for `Voting process` and `Voting & delegation` that host all the long-form text from the removed tutorial cards, structured into clear parts that users can skim, and link to relevant legal disclosures at the end of each section.
- **Avoid multiple banners**: Ensure that any remaining educational UI on Voters and Proposals takes the form of very small inline hints or empty-state messages rather than multiple stacked banners, so there is never more than one “educational-looking” block visible at a time on those screens.

**Reasoning (2–3 sentences)**  
This direction leans on progressive disclosure: users see only as much explanation as they need at the moment, with the option to dive deeper in Info. By shifting most of the text into structured Info content and using microcopy and empty states in context, the primary pages regain a clean, high-quality feel that matches the rest of the app. The self-delegation action becomes more visible and predictable, and the key legal and conceptual messages remain available without dominating precious above-the-fold space.
