import { ParsedProposalData } from "@/lib/proposalUtils";

// ---------------------------------------------------------------------------
// Example A — initiative selection (economic / program direction)
// ---------------------------------------------------------------------------

export const INITIATIVE_VOTE_TITLE =
  "Supporter Vote: Select the Next Initiative to Fund (Q3 2026)";

export const INITIATIVE_FORUM_TITLE =
  "Discussion: Q3 Supporter Initiative Funding Vote";

export const INITIATIVE_FORUM_OPENER = `The [Supporter Vote: Select the Next Initiative to Fund (Q3 2026)](/proposals/civic-demo-example-a) is now open. This gov proposal asks members to pick **one** program for the next $420K–$500K tranche from the 2026 Supporter Cohort fund.

**Options on the ballot:**
1. **Ukraine Civilian Protection Rapid Response** — mobile reporting kits and community liaison teams
2. **Sahel Community Protection Training Expansion** — scale training to Mali, Burkina Faso, and Niger
3. **Yemen Documentation & Advocacy Capacity** — survivor-centered documentation and legal advocacy
4. **Urban Warfare Community Reporting Network** — encrypted reporting channels in three urban zones

I'm leaning Ukraine given February field feedback, but Sahel training has strong partner demand. Where would you allocate if this were your donation?`;

export const INITIATIVE_CHOICES = [
  "Ukraine Civilian Protection Rapid Response ($420K)",
  "Sahel Community Protection Training Expansion",
  "Yemen Documentation & Advocacy Capacity Building",
  "Urban Warfare Community Reporting Network Pilot",
] as const;

export const INITIATIVE_VOTE_DESCRIPTION = `## Summary

CIVIC's **2026 Supporter Cohort** contributed $1.2M in unrestricted philanthropic gifts this quarter. Rather than allocating behind closed doors, we're asking members to **choose which initiative receives the next tranche of funding**.

This is an **Example A** governance proposal: supporters vote on **real economic direction** — where dollars go, which communities are prioritized, and what field capacity gets built.

> *Does influencing real economic direction influence perception? Best for testing if control boosts retention and donor confidence metrics.*

---

## What members are voting on

Select **one** initiative below. The winning option receives up to the listed allocation from the Supporter Cohort fund, subject to board ratification and field feasibility review.

### Option 1 — Ukraine Civilian Protection Rapid Response ($420K)

Deploy mobile civilian-harm reporting kits, community liaison teams, and rapid incident verification capacity in frontline-adjacent areas of eastern Ukraine. Builds on our February 2026 field deployment lessons.

**Impact:** ~12 partner communities; estimated 6-week deployment window.

### Option 2 — Sahel Community Protection Training Expansion

Scale CIVIC's community protection training curriculum to Mali, Burkina Faso, and Niger — three hubs where partner NGOs have requested structured civilian harm prevention modules.

**Impact:** 240 community leaders trained; 3 new field liaison posts.

### Option 3 — Yemen Documentation & Advocacy Capacity Building

Fund survivor-centered documentation tools, legal advocacy support, and secure testimony channels for Yemeni civil society partners documenting civilian harm.

**Impact:** 2 legal advocacy fellows; encrypted reporting infrastructure.

### Option 4 — Urban Warfare Community Reporting Network Pilot

Pilot encrypted, community-operated reporting channels in three urban conflict zones (Gaza City corridor partners, Khartoum urban network, and a third TBD with field input).

**Impact:** Cross-regional documentation pilot; 18-month evaluation period.

---

## Voting rules

- **One choice per member** (approval voting, max 1 selection)
- Quorum: 20% of votable CIVIC supply
- Voting period: 7 days
- Outcome is advisory to the Executive Committee; binding allocation requires standard governance ratification

**Related discussion:** [${INITIATIVE_FORUM_TITLE}](/forums/1014/discussion-q3-supporter-initiative-funding-vote)
`;

// ---------------------------------------------------------------------------
// Example B — artist selection (engagement / content)
// ---------------------------------------------------------------------------

export const ARTIST_VOTE_TITLE =
  "Supporter Vote: Select the Next Artist Collaboration";

export const ARTIST_FORUM_TITLE = "Discussion: Next Artist Collaboration Vote";

export const ARTIST_FORUM_OPENER = `The [Supporter Vote: Select the Next Artist Collaboration](/proposals/civic-demo-example-b) gov proposal is live. Members choose **one** creative partnership for CIVIC's 2026 public engagement calendar ($180K committed budget).

**Options on the ballot:**
1. **Tania Bruguera** — participatory installation *"Who Bears Witness?"*
2. **Forensic Architecture** — data-driven exhibition on conflict damage and civilian impact
3. **Field Team Storytellers Residency** — commission local photographers and writers from program areas
4. **Ai Weiwei** — limited print series with proceeds to the Civilian Protection Fund

I'm personally drawn to the Field Team residency — it centers community voices rather than external celebrity. But I want to hear what would actually make *you* share and stay engaged as a supporter.`;

export const ARTIST_CHOICES = [
  "Tania Bruguera — participatory installation on civilian harm",
  "Forensic Architecture — data-driven conflict impact exhibition",
  "Field Team Storytellers Residency (local photographers & writers)",
  "Ai Weiwei — limited print series for the Civilian Protection Fund",
] as const;

export const ARTIST_VOTE_DESCRIPTION = `## Summary

CIVIC's communications and philanthropy teams have shortlisted **four artist collaboration models** for the 2026 public engagement calendar. Supporters choose which partnership we pursue first.

This is an **Example B** governance proposal: members vote on **who we collaborate with** — a person-led, content-forward decision that drives visibility, storytelling, and donor engagement rather than direct program allocation.

> *Choosing a person is likely more engaging content-wise, but possibly less impactful than an economic decision. Best for measuring content reach and supporter behaviour.*

---

## What members are voting on

Select **one** collaboration below. The winning artist or program receives a committed partnership budget of **$180K** (production, travel, and distribution) plus staff liaison time from our Geneva and DC offices.

### Option 1 — Tania Bruguera

Participatory installation series titled *"Who Bears Witness?"* — interactive exhibits in Washington, DC and two partner cities, incorporating field audio and community testimony with consent protocols reviewed by CIVIC's protection team.

**Deliverables:** 3-city installation; 6-month run; donor preview events.

### Option 2 — Forensic Architecture

Data-driven exhibition mapping conflict damage and civilian impact using open-source geospatial analysis, paired with CIVIC field reporting. Designed for policy audiences and university partnerships.

**Deliverables:** Digital + physical exhibition; policy briefing series; academic licensing.

### Option 3 — Field Team Storytellers Residency

Commission local photographers and writers from active CIVIC program areas (Ukraine, Yemen, Sahel) for a 12-week residency producing a traveling gallery and digital archive — **centered on community voices, not external artists**.

**Deliverables:** 24 commissioned works; traveling gallery; permanent digital archive.

### Option 4 — Ai Weiwei

Limited-run print series with proceeds directed to the Civilian Protection Fund. High-visibility campaign targeting crypto-native and contemporary art donor segments.

**Deliverables:** 500-edition print run; auction event; social campaign.

---

## Voting rules

- **One choice per member** (approval voting, max 1 selection)
- Quorum: 20% of votable CIVIC supply
- Voting period: 10 days
- Partnership contracts subject to standard vendor review and conflict-of-interest screening

**Related discussion:** [${ARTIST_FORUM_TITLE}](/forums/1015/discussion-next-artist-collaboration-vote)
`;

export const SUPPORTER_FORUM_OPENER = `We're piloting **two types of supporter-facing gov proposals** for the 2026 philanthropic cohort — each is a worked example you can click through:

**Example A — Initiative selection** (economic direction)
→ Discussion: [${INITIATIVE_FORUM_TITLE}](/forums/1014/discussion-q3-supporter-initiative-funding-vote) · Vote: [${INITIATIVE_VOTE_TITLE}](/proposals/civic-demo-example-a)

Members choose **which field program** receives the next funding tranche. Tests whether giving donors control over *where money goes* improves retention and confidence.

**Example B — Artist selection** (engagement & content)
→ Discussion: [${ARTIST_FORUM_TITLE}](/forums/1015/discussion-next-artist-collaboration-vote) · Vote: [${ARTIST_VOTE_TITLE}](/proposals/civic-demo-example-b)

Members choose **which creative partnership** CIVIC pursues next. Tests whether person-led, content-forward votes drive engagement and sharing behaviour.

---

Our working view: **Example A** gives supporters a clearer sense of control over donation direction. **Example B** is stronger for visibility and storytelling. Both are live **gov proposals** (multi-choice approval) for deck screenshots and donor conversations.

Which example feels more compelling for your giving style?`;

export function buildApprovalProposalData(
  choices: readonly string[]
): ParsedProposalData["APPROVAL"]["kind"] {
  return {
    options: choices.map((description) => ({
      targets: [],
      values: [],
      calldatas: [],
      description,
      functionArgsName: [],
      budgetTokensSpent: null,
    })),
    proposalSettings: {
      maxApprovals: 1,
      criteria: "THRESHOLD",
      budgetToken: "0x0000000000000000000000000000000000000000",
      criteriaValue: 0n,
      budgetAmount: 0n,
    },
  };
}

export function multiChoiceOutcome(votesByOption: number[]) {
  const tokenHolders: Record<string, { "1": string }> = {};
  votesByOption.forEach((votes, index) => {
    tokenHolders[String(index)] = { "1": String(votes) };
  });
  const total = votesByOption.reduce((sum, n) => sum + n, 0);
  return {
    "token-holders": tokenHolders,
    "no-param": {
      "0": "4",
      "1": String(total),
      "2": "7",
    },
  };
}

export function buildApprovalArchiveFields(choices: readonly string[]) {
  return {
    proposal_type: {
      class: "APPROVAL" as const,
      quorum: 2000,
      approval_threshold: 5100,
      eas_uid: "",
      name: "Approval",
      description: "",
    },
    voting_module: "approval" as const,
    voting_module_name: "approval" as const,
    kwargs: {
      choices: [...choices],
      max_approvals: 1,
      criteria: 0,
      criteria_value: "0",
    },
    choices: [...choices],
    max_approvals: 1,
  };
}
