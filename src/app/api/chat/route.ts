import { streamText, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import Tenant from "@/lib/tenant/tenant";
import {
  fetchProposals as apiFetchProposals,
  fetchProposal as apiFetchProposal,
  fetchDraftProposals as apiFetchDraftProposals,
} from "@/app/api/common/proposals/getProposals";

type ChatIntent =
  | { kind: "list"; filter: "relevant" | "all" | "active" | "past" }
  | { kind: "detail"; proposalId?: string }
  | { kind: "drafts" }
  | { kind: "draft_help" }
  | { kind: "governance_info" }
  | { kind: "vote_help" }
  | { kind: "forums" }
  | { kind: "delegates" }
  | { kind: "stats" }
  | { kind: "search_forums"; query: string }
  | { kind: "search_proposals"; query: string }
  | { kind: "duna_overview" }
  | { kind: "duna_documents" }
  | { kind: "duna_reports" }
  | { kind: "help" };

function detectIntent(text: string): ChatIntent | null {
  const t = text.toLowerCase().trim();
  const idMatch =
    t.match(/proposal\s*#?\s*(\d+)/i) || t.match(/(op|ens|uni)?\s*(\d{2,})/i);
  // PRIORITY: DUNA before generic listings
  if (/\bduna\b/.test(t)) {
    if (/document|doc|attachment|files?/.test(t))
      return { kind: "duna_documents" };
    if (/report|administration|admin|category/.test(t))
      return { kind: "duna_reports" };
    return { kind: "duna_overview" };
  }
  if (/forum|forums|discuss|discussion/.test(t)) return { kind: "forums" };
  if (/delegate|delegates|representative|representatives/.test(t))
    return { kind: "delegates" };
  if (/history|stats|statistics|voting history|results/.test(t))
    return { kind: "stats" };
  if (/quorum|governance|role of delegate|states of a proposal/.test(t))
    return { kind: "governance_info" };
  if (/how to vote|vote here|voting interface|where do i vote/.test(t))
    return { kind: "vote_help" };
  // Generic listings
  if (/latest|recent|list|show|proposals/.test(t) || /active|open/.test(t)) {
    if (/past|closed|ended|previous/.test(t))
      return { kind: "list", filter: "past" };
    if (/active|open|ongoing|current/.test(t))
      return { kind: "list", filter: "active" };
    return { kind: "list", filter: "relevant" };
  }
  if (/drafts?|my drafts/.test(t)) return { kind: "drafts" };
  if (
    /draft checklist|help.*draft|guide.*draft|how to create a draft|sections required/.test(
      t
    )
  )
    return { kind: "draft_help" };
  const forumSearch = t.match(/search (?:in )?forums? for\s+\"?([^\"]+)\"?/i);
  if (forumSearch?.[1]) return { kind: "search_forums", query: forumSearch[1] };
  const propSearch = t.match(/search proposals? for\s+\"?([^\"]+)\"?/i);
  if (propSearch?.[1])
    return { kind: "search_proposals", query: propSearch[1] };
  if (/details?|explain|what is|how to|quorum|delegate|vote/.test(t)) {
    if (idMatch) {
      const id = idMatch[1] || idMatch[2];
      if (id) return { kind: "detail", proposalId: String(id) };
    }
    return { kind: "help" };
  }
  if (idMatch) {
    const id = idMatch[1] || idMatch[2];
    if (id) return { kind: "detail", proposalId: String(id) };
  }
  return null;
}

function extractLastProposalId(messages: any[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const content = String(messages[i]?.content ?? "");
    const idMatch =
      content.match(/proposal\s*#?\s*(\d+)/i) ||
      content.match(/#(\d{2,})/) ||
      content.match(/\b(op|ens|uni)?\s*(\d{2,})\b/i);
    if (idMatch) {
      return idMatch[1] || idMatch[2] || null;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      tenant: clientTenant,
      userContext,
      mode,
    } = await req.json();
    const { namespace, slug, ui } = Tenant.current();

    const lastUserMessage = [...(messages || [])]
      .reverse()
      .find((m: any) => m?.role === "user");
    const intent = lastUserMessage?.content
      ? detectIntent(String(lastUserMessage.content))
      : null;

    let context = "";
    const actions: { label: string; href: string }[] = [];

    // For rich UI responses
    const uiPayload: any = {
      heading: "",
      items: [] as Array<any>,
      seeAllHref: undefined as string | undefined,
      seeAllLabel: undefined as string | undefined,
    };

    if (intent?.kind === "list") {
      const filter = intent.filter;
      const mappedFilter = filter === "relevant" ? "relevant" : "all"; // fallback
      const proposals = await apiFetchProposals({
        filter: mappedFilter,
        pagination: { limit: 5, offset: 0 },
      });
      const items = proposals.data
        ?.map((p) => {
          const id = p.id;
          const title = p.markdowntitle || `Proposal ${id}`;
          actions.push({
            label: `Open proposal #${id}`,
            href: `/proposals/${id}`,
          });
          return `- #${id}: ${title} (status: ${p.status}) -> /proposals/${id}`;
        })
        .join("\n");
      context += `Proposals (${filter}):\n${items || "No proposals found."}\n`;
      uiPayload.heading =
        filter === "active" ? "Active proposals" : "Latest proposals";
      uiPayload.items =
        proposals.data?.map((p) => ({
          id: p.id,
          title: p.markdowntitle || `Proposal ${p.id}`,
          status: p.status,
          href: `/proposals/${p.id}`,
          kind: "proposal",
        })) ?? [];
      uiPayload.seeAllHref = "/proposals";
      uiPayload.seeAllLabel =
        filter === "active" ? "See all proposals" : "See all";
    } else if (intent?.kind === "detail") {
      try {
        const proposalId =
          intent.proposalId || extractLastProposalId(messages || []);
        if (!proposalId) {
          context += `I couldn't identify the proposal. Please specify the number (e.g., "proposal #123").\n`;
        } else {
          const proposal = await apiFetchProposal(proposalId);
          if (proposal) {
            actions.push({
              label: `Open proposal #${proposal.id}`,
              href: `/proposals/${proposal.id}`,
            });
            const startStr = proposal.startTime
              ? new Date(proposal.startTime).toISOString()
              : "n/a";
            const endStr = proposal.endTime
              ? new Date(proposal.endTime).toISOString()
              : "n/a";
            context += `Proposal #${proposal.id}: ${proposal.markdowntitle || "Untitled"}\nStatus: ${proposal.status}\nQuorum: ${proposal.quorum ?? "n/a"}\nStarts: ${startStr}\nEnds: ${endStr}\nLink: /proposals/${proposal.id}\n`;
            // UI single item
            uiPayload.heading = `Proposal #${proposal.id}`;
            uiPayload.items = [
              {
                id: proposal.id,
                title: proposal.markdowntitle || `Proposal ${proposal.id}`,
                status: proposal.status,
                href: `/proposals/${proposal.id}`,
                kind: "proposal",
              },
            ];
          }
        }
      } catch (_) {
        context += `No proposal found with id ${intent.proposalId}.\n`;
      }
    } else if (intent?.kind === "drafts") {
      const address = userContext?.address as string | undefined;
      if (address) {
        try {
          const drafts = await apiFetchDraftProposals(address as `0x${string}`);
          const items = drafts
            ?.map((d: any) => {
              const id = d.uuid ?? d.id;
              actions.push({
                label: `Open draft ${id}`,
                href: `/proposals/draft/${id}`,
              });
              return `- Draft ${id}: ${d.title || "Untitled"} -> /proposals/draft/${id}`;
            })
            .join("\n");
          context += `Your drafts:\n${items || "No drafts found."}\n`;
          uiPayload.heading = "Your drafts";
          uiPayload.items = (drafts || []).map((d: any) => ({
            id: d.uuid ?? d.id,
            title: d.title || `Draft ${d.uuid ?? d.id}`,
            status: d.stage || "DRAFT",
            href: `/proposals/draft/${d.uuid ?? d.id}`,
            kind: "draft",
          }));
          uiPayload.seeAllHref = "/proposals";
          uiPayload.seeAllLabel = "See all";
        } catch (_) {
          context += `Could not fetch drafts for the provided address.\n`;
        }
      } else {
        context += `To list your drafts, connect your wallet or provide 'userContext.address'.\n`;
        uiPayload.heading = "Sign in required";
        uiPayload.items = [
          {
            id: "connect",
            title: "Connect your wallet to view your drafts",
            status: "AUTH",
            href: "/proposals",
          },
        ];
      }
      actions.push({ label: "Create a new draft", href: "/proposals" });
    } else if (intent?.kind === "forums") {
      context += `You can discuss proposals and governance topics in the forum.\n`;
      actions.push({ label: "Open forums", href: "/forums" });
    } else if (intent?.kind === "search_forums") {
      try {
        const { forumSearchService } = await import("@/lib/search");
        const res = await forumSearchService.search(slug, intent.query, {
          limit: 5,
          page: 1,
        });
        const items = res.hits
          ?.map((h) => {
            if (h.contentType === "topic" && h.topicId)
              return `- Topic #${h.topicId}: ${h.title}`;
            if (h.contentType === "post" && h.postId)
              return `- Post #${h.postId}: ${h.content.slice(0, 80)}...`;
            return `- ${h.contentType}: ${h.title || h.content?.slice(0, 80)}`;
          })
          .join("\n");
        context += `Forum search for "${intent.query}":\n${items || "No results."}\n`;
        actions.push({ label: "Open forums", href: "/forums" });
      } catch (_) {
        context += `Forum search is not available.\n`;
      }
    } else if (intent?.kind === "delegates") {
      context += `Browse and learn about delegates for this tenant.\n`;
      actions.push({ label: "Open delegates", href: "/delegates" });
    } else if (intent?.kind === "stats") {
      context += `Explore governance statistics and history.\n`;
      actions.push({ label: "Open governance info", href: "/info" });
    } else if (intent?.kind === "draft_help") {
      try {
        const { DraftProposalSchema } = await import(
          "@/app/proposals/draft/schemas/DraftProposalSchema"
        );
        // Provide a lightweight checklist derived from schema fields
        const checklist = [
          "Title",
          "Abstract",
          "Type (Basic / Social / Approval / Optimistic)",
          "Transactions or Options (depending on type)",
          "Simulation status (if applicable)",
          "Scope / Tiers (if applicable)",
          "Start/End dates for Social proposals",
          "Options for Social/Approval proposals",
        ];
        context += `Draft checklist (high-level):\n${checklist
          .map((c, i) => `${i + 1}. ${c}`)
          .join("\n")}\n`;
      } catch (_) {
        context += `Draft checklist: Title, Abstract, Type, and content per type (transactions or options).\n`;
      }
      actions.push({ label: "Create draft", href: "/proposals" });
    } else if (intent?.kind === "duna_overview") {
      const enabled = ui.toggle("duna")?.enabled === true;
      if (enabled) {
        context += `DUNA Administration provides reports and documents curated in the forum.\n`;
        actions.push({ label: "Open DUNA", href: "/info" });
      } else {
        context += `DUNA is not enabled for this tenant.\n`;
      }
    } else if (intent?.kind === "duna_documents") {
      try {
        const { getDunaCategoryId, getForumCategoryAttachments } = await import(
          "@/lib/actions/forum"
        );
        const categoryId = await getDunaCategoryId();
        if (!categoryId) {
          context += `Could not find DUNA category.\n`;
        } else {
          const res = await getForumCategoryAttachments({ categoryId });
          const items = res?.success
            ? res.data
                ?.slice(0, 5)
                .map((d: any) => `- ${d.name || d.url}`)
                .join("\n")
            : "No documents found.";
          context += `DUNA documents:\n${items}\n`;
          actions.push({ label: "Open DUNA", href: "/info" });
          uiPayload.heading = "DUNA documents";
          uiPayload.items = (res && (res as any).data ? (res as any).data : [])
            .slice(0, 5)
            .map((d: any) => ({
              id: d.id ?? d.url,
              title: d.name || d.url,
              status: "DOC",
              href: d.url || "/info",
            }));
          uiPayload.seeAllHref = "/info";
          uiPayload.seeAllLabel = "See all";
        }
      } catch (_) {
        context += `Could not fetch DUNA documents.\n`;
      }
    } else if (intent?.kind === "duna_reports") {
      try {
        const { getDunaCategoryId, getForumTopics } = await import(
          "@/lib/actions/forum"
        );
        const { transformForumTopics } = await import("@/lib/forumUtils");
        const categoryId = await getDunaCategoryId();
        if (!categoryId) {
          context += `Could not find DUNA category.\n`;
        } else {
          const topicsRes = await getForumTopics({ categoryId });
          if (topicsRes?.success) {
            const topics = transformForumTopics(topicsRes.data, {
              mergePostAttachments: true,
            });
            const items = topics
              ?.slice(0, 5)
              .map((t: any) => `- ${t.title}`)
              .join("\n");
            context += `DUNA reports:\n${items || "No reports found."}\n`;
            actions.push({ label: "Open DUNA", href: "/info" });
            uiPayload.heading = "DUNA reports";
            uiPayload.items = (topics || []).slice(0, 5).map((t: any) => ({
              id: t.id ?? t.title,
              title: t.title,
              status: "REPORT",
              href: "/info",
            }));
            uiPayload.seeAllHref = "/info";
            uiPayload.seeAllLabel = "See all";
          } else {
            context += `No DUNA reports available.\n`;
          }
        }
      } catch (_) {
        context += `Could not fetch DUNA reports.\n`;
      }
    } else if (intent?.kind === "governance_info") {
      context +=
        `Quorum: minimum voting power required for a proposal to be valid.\n` +
        `Delegates: addresses entrusted with voting power to participate on behalf of token holders.\n` +
        `Proposal states: typically Pending -> Active -> Succeeded/Defeated -> Queued -> Executed/Expired/Cancelled.\n`;
      actions.push({ label: "Learn about delegates", href: "/delegates" });
      actions.push({ label: "View proposals", href: "/proposals" });
    } else if (intent?.kind === "vote_help") {
      const voteSites: Record<string, string> = {
        optimism: "https://vote.optimism.io",
        uniswap: "https://vote.uniswapfoundation.org",
        ens: "https://www.tally.xyz/gov/ens",
      };
      const site = voteSites[slug] || "";
      context += `To vote: connect your wallet, open the proposal page, and cast your vote. If on Snapshot, sign offchain; onchain requires gas.\n`;
      if (site) actions.push({ label: "Open voting portal", href: site });
      actions.push({ label: "View proposals", href: "/proposals" });
    } else if (intent?.kind === "search_proposals") {
      try {
        const res = await apiFetchProposals({
          filter: "all",
          pagination: { limit: 20, offset: 0 },
        });
        const q = intent.query.toLowerCase();
        const filtered = res.data
          ?.filter((p) => (p.markdowntitle || "").toLowerCase().includes(q))
          ?.slice(0, 5);
        const items = filtered
          ?.map((p) => {
            actions.push({
              label: `Open proposal #${p.id}`,
              href: `/proposals/${p.id}`,
            });
            return `- #${p.id}: ${p.markdowntitle}`;
          })
          .join("\n");
        context += `Proposal search for "${intent.query}":\n${items || "No results."}\n`;
      } catch (_) {
        context += `Could not search proposals.\n`;
      }
    }

    const system =
      `You are Kleos, a helpful and friendly governance assistant inside Agora.xyz for tenant ${ui?.title || slug}.\n` +
      `- Always respond in English, be precise and concise.\n` +
      `- Only operate within the current tenant (${namespace}/${slug}).\n` +
      `- Provide internal links as clear actions.\n` +
      `- Do not execute changes; guide to existing screens (proposals, drafts, forums).\n` +
      `- If a feature is disabled by toggles, state it and suggest an alternative.\n` +
      `- Use a warm, approachable tone. Be brief but friendly.\n` +
      (context
        ? `\n=== CONTEXT START ===\n${context}\nActions: ${JSON.stringify(actions)}\n=== CONTEXT END ===\nUse the provided context and actions above to answer the user.\n`
        : "");

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const model = openai(process.env.CHAT_MODEL ?? "gpt-4o-mini");

    if (mode === "ui") {
      // If no intent or UI items detected, use a friendly fallback from Kleos
      if (!uiPayload.items?.length && !context.trim()) {
        return new Response(
          JSON.stringify({
            heading: "",
            items: [],
            textFallback:
              "Hi, I'm Kleos. Ask me about proposals, drafts, delegates, DUNA, or say 'latest proposals'.",
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          heading: uiPayload.heading,
          items: uiPayload.items,
          textFallback: context.trim(),
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    if (mode === "json") {
      const result = await generateText({ model, system, messages });
      return new Response(JSON.stringify({ text: result.text }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    const result = await streamText({ model, system, messages });
    return result.toTextStreamResponse();
  } catch (error) {
    return new Response("Bad Request", { status: 400 });
  }
}
