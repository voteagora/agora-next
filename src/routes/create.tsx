/*
 * TanStack Start port of src/app/create/page.tsx.
 * URL: /create
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { formatDistanceToNow } from "date-fns";

import Tenant from "@/lib/tenant/tenant";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { CreatePostClient } from "@/app/create/components/CreatePostClient";
import {
  type PostType,
  type CreatePostFormData,
  type ProposalType,
} from "@/app/create/types";
import { deriveStatus } from "@/components/Proposals/Proposal/Archive/archiveProposalUtils";

const serverLoadCreatePage = createServerFn({ method: "GET" })
  .inputValidator(
    (data: {
      type: string | undefined;
      fromTopicId: string | undefined;
      fromTempCheckId: string | undefined;
    }) => data
  )
  .handler(async ({ data }) => {
    const { type, fromTopicId, fromTempCheckId } = data;

    const initialPostType: PostType =
      type && ["tempcheck", "gov-proposal"].includes(type)
        ? (type as PostType)
        : "tempcheck";

    const { namespace } = Tenant.current();

    const formData: Partial<CreatePostFormData> = {
      title: "",
      description: "",
      relatedDiscussions: [],
      relatedTempChecks: [],
    };

    if (fromTopicId) {
      const { getForumTopic } = await import("@/lib/actions/forum/topics");
      const topicResult = await getForumTopic(Number(fromTopicId));
      if (topicResult.success && topicResult.data) {
        const topic = topicResult.data;
        const firstPost = (topic as any).posts?.[0];
        formData.relatedDiscussions = [
          {
            id: fromTopicId,
            title: topic.title,
            description: firstPost?.content || "",
            comments: (topic as any).posts?.length || 0,
            timestamp: formatDistanceToNow(new Date(topic.createdAt), {
              addSuffix: true,
            }),
            url: buildForumTopicPath(Number(fromTopicId), topic.title),
          },
        ];
      }
    }

    let tempCheckProposal: any = undefined;
    if (fromTempCheckId) {
      const { fetchProposalFromArchive } = await import("@/lib/archiveUtils");
      tempCheckProposal = await fetchProposalFromArchive(
        namespace,
        fromTempCheckId
      );
    }

    if (fromTempCheckId && tempCheckProposal) {
      formData.title = tempCheckProposal.title || "";
      formData.description = tempCheckProposal.description || "";

      const kwargs = tempCheckProposal.kwargs || {};
      const approvalData =
        tempCheckProposal?.voting_module?.toUpperCase() === "APPROVAL"
          ? {
              choices:
                (kwargs.choices as string[]) || tempCheckProposal.choices || [],
              maxApprovals:
                typeof kwargs.max_approvals === "number"
                  ? kwargs.max_approvals
                  : tempCheckProposal.max_approvals || 1,
              criteria:
                typeof kwargs.criteria === "number"
                  ? kwargs.criteria
                  : tempCheckProposal.criteria || 0,
              criteriaValue:
                typeof kwargs.criteria_value === "number"
                  ? kwargs.criteria_value
                  : tempCheckProposal.criteria_value || 0,
              budget: typeof kwargs.budget === "number" ? kwargs.budget : 0,
            }
          : undefined;

      formData.relatedTempChecks = [
        {
          id: fromTempCheckId,
          title: tempCheckProposal.title || "",
          description: tempCheckProposal.description || "",
          comments: 0,
          timestamp: formatDistanceToNow(
            new Date(tempCheckProposal.start_blocktime * 1000 || Date.now()),
            { addSuffix: true }
          ),
          url: `/proposals/${fromTempCheckId}`,
          status: deriveStatus(tempCheckProposal, 18),
          proposer: tempCheckProposal.proposer,
          approvalData,
          votingModule: tempCheckProposal.voting_module,
        },
      ];
    }

    const { fetchProposalTypes } = await import(
      "@/app/api/common/proposals/getProposals"
    );
    const proposalTypesData = await fetchProposalTypes();
    const proposalTypes: ProposalType[] = Array.isArray(proposalTypesData)
      ? proposalTypesData.map((t: any) => ({
          id: t.proposal_type_id,
          name: t.name,
          description: t.description,
          quorum: t.quorum / 100,
          approvalThreshold: t.approval_threshold / 100,
          module: t.module,
        }))
      : [
          {
            id: "none",
            name: "None",
            description: "No proposal type created yet",
            quorum: 0,
            approvalThreshold: 0,
            module: "STANDARD",
          },
        ];

    return { initialPostType, initialFormData: formData, proposalTypes };
  });

export const Route = createFileRoute("/create")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("easv2-govlessvoting")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    type: (search.type as string) ?? undefined,
    fromTopicId: (search.fromTopicId as string) ?? undefined,
    fromTempCheckId: (search.fromTempCheckId as string) ?? undefined,
  }),
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `Create Post | ${brandName}` },
        {
          name: "description",
          content: `Create a proposal for the ${brandName} community.`,
        },
      ],
    };
  },
  loaderDeps: ({ search }) => ({
    type: search.type,
    fromTopicId: search.fromTopicId,
    fromTempCheckId: search.fromTempCheckId,
  }),
  loader: async ({ deps }) => serverLoadCreatePage({ data: deps }),
  component: function CreatePostPage() {
    const { initialPostType, initialFormData, proposalTypes } =
      Route.useLoaderData();
    return (
      <CreatePostClient
        initialPostType={initialPostType}
        initialFormData={initialFormData}
        proposalTypes={proposalTypes}
      />
    );
  },
});
