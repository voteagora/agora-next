/**
 * Fully populated forum → temp check → gov proposal chain for screenshot walkthrough.
 * Author throughout: Dr. James Okafor (0x...0002)
 */

export const MEDIATION_FLOW = {
  forumTopicId: 1004,
  tempCheckId: "civic-demo-7",
  govProposalId: "civic-demo-gov-1",
  author: "0x0000000000000000000000000000000000000002",
} as const;

export const MEDIATION_FORUM_TITLE =
  "Discussion: Should CIVIC explore local mediation support programs?";

export const MEDIATION_FORUM_OPENER = `## Background

Over the past year, CIVIC field teams in **Ukraine**, **Yemen**, and the **Sahel** have reported growing demand from local partners for structured mediation support — not as a replacement for documentation work, but as a complementary tool to de-escalate harm before incidents require formal reporting.

This thread is the first step in our governance process. I am gathering member input before opening a **temp check** to gauge formal support.

## Questions for the community

1. **Scope** — Should CIVIC facilitate community-led mediation, or limit our role to documentation and referral?
2. **Regions** — Which conflict-affected areas should be prioritized for a 12-month pilot?
3. **Safeguards** — What protections are needed for local mediators operating in active conflict zones?
4. **Evaluation** — How should we measure success without compromising partner confidentiality?

## Proposed next steps

If this discussion shows strong member support, I will submit a **temp check** to authorize a limited pilot. A successful temp check would then move to a formal **governance proposal** for funding and implementation.

Please share your perspective below — especially if you have field experience or regional expertise.`;

export const MEDIATION_TEMP_CHECK_TITLE =
  "Temp Check: Local Mediation Support Pilot";

export const MEDIATION_TEMP_CHECK_DESCRIPTION = `# Temp Check: Local Mediation Support Pilot

## Summary

This temp check asks whether CIVIC members support exploring **local mediation support** as a complement to our civilian protection documentation work.

Following [community discussion #1004](/forums/1004), members expressed strong interest in a limited pilot with clear safeguards for local partners.

## What members are voting on

- Whether CIVIC should allocate resources to a **12-month mediation support pilot**
- Whether to authorize staff to develop partner training materials and facilitation standards
- Whether to proceed toward a formal governance proposal if this temp check passes

## Pilot outline (subject to gov proposal)

| Element | Proposal |
|---------|----------|
| Duration | 12 months |
| Regions | Ukraine and Yemen (phase 1) |
| CIVIC role | Facilitation standards, training, evaluation — not direct negotiation |
| Budget | To be specified in governance proposal (~$180K) |

## Community discussion

This temp check follows member discussion: [Should CIVIC explore local mediation support programs?](/forums/1004)

## Vote

Members should vote **For** if they support moving to a formal governance proposal. Vote **Against** if CIVIC should remain focused exclusively on documentation.`;

export const MEDIATION_GOV_TITLE =
  "Establish Local Mediation Support Pilot Program";

export const MEDIATION_GOV_DESCRIPTION = `# Establish Local Mediation Support Pilot Program

## Summary

This governance proposal authorizes a **12-month Local Mediation Support Pilot** following successful community discussion and temp check.

**Author:** Dr. James Okafor  
**Related temp check:** [Temp Check: Local Mediation Support Pilot](/proposals/civic-demo-7)  
**Originating discussion:** [Forum topic #1004](/forums/1004)

## Motivation

CIVIC field partners in Ukraine and Yemen have requested structured support for community-led mediation alongside documentation. Members voted to explore this through governance rather than ad hoc staff decisions.

## Program design

### Phase 1 — Ukraine & Yemen (Months 1–6)
- Develop mediation facilitation standards with input from local partners
- Train 2 field liaison staff per region on community-led mediation protocols
- Support 3 partner organizations with toolkit deployment

### Phase 2 — Evaluation & scale decision (Months 7–12)
- Independent evaluation of pilot outcomes (safety incidents, partner satisfaction, harm reduction indicators)
- Member report published to forum before any expansion vote

## Safeguards

- Mediation remains **community-led** — CIVIC does not act as negotiator
- Mandatory safety review before any new partner onboarding
- Clear exit conditions if regional security deteriorates
- All partner identities protected per CIVIC source protection standards

## Budget request

| Line item | Amount |
|-----------|--------|
| Field liaison training | $65,000 |
| Partner toolkit & materials | $42,000 |
| Independent evaluation | $38,000 |
| Contingency (security review) | $35,000 |
| **Total** | **$180,000** |

## Success metrics

- 3 partner organizations onboarded with signed safety protocols
- Zero reported safety incidents involving CIVIC-supported mediators
- Independent evaluation completed and published to members
- Member satisfaction score ≥ 75% in post-pilot survey

## Timeline

- **Month 1–2:** Standards development & partner selection
- **Month 3–6:** Active pilot in Ukraine and Yemen
- **Month 7–9:** Evaluation data collection
- **Month 10–12:** Report to members; recommendation on expansion`;
