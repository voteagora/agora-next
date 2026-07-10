export type TenantCopyMode = "dao" | "ngo";

type SupportType = "FOR" | "AGAINST" | "ABSTAIN";

export type TenantCopy = {
  mode: TenantCopyMode;
  nouns: {
    organization: string;
    community: string;
    member: string;
    members: string;
    tokenHolder: string;
    tokenHolders: string;
    representative: string;
    representatives: string;
    proposal: string;
    proposals: string;
    governanceProposal: string;
    governanceProposals: string;
    tempCheck: string;
    tempChecks: string;
    discussion: string;
    discussions: string;
    votingPower: string;
    votes: string;
  };
  nav: {
    proposals: string;
    delegates: string;
    governance: string;
    discussions: string;
    info: string;
    about: string;
    financials: string;
    grants: string;
    menu: string;
  };
  footer: {
    tagline: string;
    shortTagline: string;
  };
  info: {
    defaultTabs: {
      delegateTitle: string;
      delegateDescription: string;
      proposalsTitle: string;
      proposalsDescription: string;
      voteTitle: string;
      voteDescription: string;
    };
    governanceCharts: {
      title: string;
      topRepresentatives: string;
      activeRepresentatives: string;
      proposalVoters: string;
      representativesNeeded: string;
      totalVotableSupply: string;
      allRepresentatives: string;
      representativesOver100kTokens: string;
      representativesToReachHalfSupply: string;
      representativesToReachQuorum: string;
      toReachHalfSupply: string;
      toReachQuorum: string;
    };
  };
  filters: {
    proposals: {
      relevant: string;
      everything: string;
      tempChecks: string;
    };
    delegates: {
      filter: string;
      reset: string;
      sort: string;
      apply: string;
      hasStatement: string;
      allRepresentatives: string;
      myRepresentatives: string;
      sortBy: string;
      weightedRandom: string;
      mostVotingPower: string;
      leastVotingPower: string;
      mostDelegators: string;
      mostRecentDelegation: string;
      oldestDelegation: string;
      latestVotingBlock: string;
      vpChange7d: string;
      vpChange7dDesc: string;
    };
  };
  proposals: {
    allTitle: string;
    empty: string;
    tabTitle: string;
    draftsTabTitle: string;
    sponsorshipRequestsTabTitle: string;
    myDraftsTitle: string;
    sponsorshipRequestsTitle: string;
    createButton: string;
    createDraftButton: string;
    updateDraftButton: string;
    proposalTypeLabel: string;
    proposalTypePlaceholder: string;
    proposalTypeDisclaimer: string;
    scopesLabel: string;
    titleLabel: string;
    descriptionLabel: string;
    bodyLabel: string;
    bodyPlaceholder: string;
    draftBodyPlaceholder: string;
    titlePlaceholder: (tenantName: string) => string;
    noVotingReason: string;
    eligibleToCreateGovernanceProposal: string;
    createGovernanceProposalButton: string;
    discussPrompt: (subject: string) => string;
    createDiscussionButton: string;
    proposalTypeNotApproved: string;
    proposalTypeTooltip: string;
    quorum: string;
    approvalThreshold: string;
    untilTypeApproved: string;
  };
  create: {
    pageTitle: (postTypeLabel: string) => string;
    postTypeOptions: {
      tempcheck: string;
      "gov-proposal": string;
    };
    titlePlaceholder: (tenantName: string) => string;
    tempCheckPermissionGranted: string;
    governanceProposalPermissionGranted: string;
    noWallet: string;
    insufficientVotingPower: string;
    connectWalletPermission: string;
    tempCheckAuthorConfirmation: string;
    tempCheckMustBeApproved: string;
    selectSuccessfulTempCheck: string;
    onlyAdminsOrAuthorsCanCreateProposal: string;
    createTempCheckButton: string;
    createProposalButton: string;
    creating: string;
    successToast: (postType: "tempcheck" | "gov-proposal") => string;
    failureToast: string;
    indexingTitle: string;
    indexingDescription: (postType: "tempcheck" | "gov-proposal") => string;
    gotIt: string;
    relatedDiscussions: string;
    relatedTempCheck: string;
    addReference: string;
    searchRelatedTitle: (searchType: "forum" | "tempcheck") => string;
    searchRelatedPlaceholder: (searchType: "forum" | "tempcheck") => string;
    noRelatedResults: string;
    addedReference: string;
    clickReferenceHelp: string;
  };
  forums: {
    title: string;
    metadataTitle: (brandName: string) => string;
    metadataDescription: (brandName: string) => string;
    metadataOpenGraphDescription: (brandName: string) => string;
    metadataTwitterDescription: (brandName: string) => string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    noMatches: string;
    noTopics: string;
    errorLoading: string;
    newTopicButton: string;
    createButton: string;
    createTitle: string;
    topicTitlePlaceholder: string;
    bodyPlaceholder: string;
    noCategory: string;
    topicCreationPermission: string;
    createSuccessToast: string;
    createFailureToast: string;
    replyPlaceholder: string;
    postingReply: string;
    postReply: string;
    relatedTempCheck: string;
    relatedProposal: string;
    relatedDiscussion: string;
    referencedInDiscussion: string;
    referencedInTempCheck: string;
    referencedInProposal: string;
    existingTempCheckTitle: string;
    existingTempCheckDescription: string;
    viewTempCheck: string;
    createNewTempCheck: string;
  };
  delegates: {
    pageTitle: string;
    searchPlaceholder: string;
    searchTooltip: string;
    openSearchAria: string;
    closeSearchAria: string;
    table: {
      name: string;
      votingPower: string;
      change7d: string;
      participation: string;
      delegators: string;
      info: string;
      empty: string;
    };
    delegation: {
      disabled: (tokenSymbol: string) => string;
      sameAddress: string;
      failed: string;
      submitting: string;
      completed: string;
      action: string;
      selfAction: string;
      setRepresentative: (representative: string) => string;
      canVoteWithTokens: (representative: string) => string;
      totalDelegatableVotes: string;
      currentDelegate: string;
      delegatingTo: string;
      removeOwnDelegation: string;
      removeTitle: (representative: string) => string;
      removeDescription: string;
      removeVotes: string;
      notDelegating: string;
      undelegateAction: string;
      undelegationFailed: string;
      undelegationSubmitting: string;
      undelegationCompleted: string;
      selfBannerTitle: string;
      selfBannerDescription: string;
      overflowWarning: string;
      splitDelegation: string;
      allowRedelegation: string;
      advancedTitle: string;
      advancedDescription: string;
      continue: string;
      delegateVotesAction: string;
      connectWalletAction: string;
      ownVotesLabel: string;
      delegatedEntryLabel: string;
      additionalVotesPrefix: string;
      additionalVotesSuffix: string;
      encourageTitle: string;
      encourageDescription: string;
      circularDelegationSelfTarget: string;
      circularDelegationDelegatorTarget: string;
      circularDelegationUnsupported: (target: string) => string;
    };
    statement: {
      requiredToVote: string;
      setupButton: string;
      submitProfile: string;
      submitError: string;
      editTip: string;
      codeOfConductRequired: string;
      principlesRequired: string;
      title: string;
      defaultPlaceholder: string;
    };
    profile: {
      myRepresentative: string;
      myRepresentatives: string;
      statementTab: string;
      participationTab: string;
      delegationsTab: string;
      delegationsTitle: string;
      noDelegations: string;
      delegatedFrom: string;
      delegatedTo: string;
      delegatedOn: string;
      votingPowerColumn: string;
      currentTokenBalance: string;
      from: string;
      to: string;
      txnHash: string;
      hiddenDust: string;
      loadMore: string;
      noVotingPowerTitle: string;
      noVotingPowerDescription: string;
      editMyProfile: string;
      notFound: string;
      activeTitle: string;
      inactiveTitle: string;
      votedRecent: (voted: string, total: number) => string;
      pendingActivityTitle: string;
      pendingActivitySubtitle: string;
    };
  };
  voting: {
    notOpen: string;
    connectWallet: string;
    loading: string;
    reasonPlaceholder: string;
    submitVote: string;
    castingVote: string;
    approveTransaction: string;
    reflectDelay: string;
    statementRequiresGas: string;
    freeVoting: string;
    shareVote: string;
    votedAgo: (ago: string) => string;
    proposalLaunched: string;
    snapshotExplanation: string;
    snapshotChangeExplanation: string;
    proposalVotingPower: string;
    noReason: string;
    submittedTitle: string;
    submittedDescription: string;
    writingToChain: string;
    noStatementInline: string;
    noStatementLink: string;
    availableSoonTitle: string;
    availableSoonDescription: string;
    comeBackLater: string;
    errorSubmitting: string;
    tryRegularVote: string;
    cancel: string;
    tryAgain: string;
    supportLabel: (support: SupportType) => string;
    castVoteTitle: (support: SupportType) => string;
    voteWithPower: (support: SupportType) => string;
  };
  permissions: {
    insufficientTitle: (actionText: string) => string;
    alignedToTokenHolders: string;
    yourVotingPowerAndBalance: string;
    requiredVotingPower: string;
    howToGetTokens: string;
    buyTokens: (tokenSymbol: string) => string;
    buyTokensDescription: (tokenSymbol: string) => string;
    actionText: {
      topic: string;
      post: string;
      upvote: string;
      react: string;
    };
  };
};

const daoCopy: TenantCopy = {
  mode: "dao",
  nouns: {
    organization: "DAO",
    community: "community",
    member: "member",
    members: "members",
    tokenHolder: "token holder",
    tokenHolders: "token holders",
    representative: "delegate",
    representatives: "delegates",
    proposal: "proposal",
    proposals: "proposals",
    governanceProposal: "governance proposal",
    governanceProposals: "governance proposals",
    tempCheck: "temp check",
    tempChecks: "temp checks",
    discussion: "discussion",
    discussions: "discussions",
    votingPower: "voting power",
    votes: "votes",
  },
  nav: {
    proposals: "Proposals",
    delegates: "Delegates",
    governance: "Governance",
    discussions: "Discussions",
    info: "Info",
    about: "About",
    financials: "Financials",
    grants: "Grants",
    menu: "Menu",
  },
  footer: {
    tagline: ", the onchain governance company",
    shortTagline: "Onchain Governance",
  },
  info: {
    defaultTabs: {
      delegateTitle: "Delegate voting power",
      delegateDescription:
        "The community is governed by its token holders, represented by trusted delegates.",
      proposalsTitle: "Browse proposals",
      proposalsDescription:
        "Governance decisions are initiated as proposals, providing insights into the priorities of the community.",
      voteTitle: "Vote on proposals",
      voteDescription:
        "Proposals that advance to a vote are accepted or rejected by the community's delegates.",
    },
    governanceCharts: {
      title: "Governance",
      topRepresentatives: "Top Delegates",
      activeRepresentatives: "Active Delegates",
      proposalVoters: "Proposal Voters",
      representativesNeeded: "Delegates needed",
      totalVotableSupply: "Total votable supply",
      allRepresentatives: "All Delegates",
      representativesOver100kTokens: "Delegates with over 100K tokens",
      representativesToReachHalfSupply:
        "# of delegates to reach 50% of votable supply",
      representativesToReachQuorum: "# of delegates to reach quorum",
      toReachHalfSupply: "To reach 50%",
      toReachQuorum: "To reach quorum",
    },
  },
  filters: {
    proposals: {
      relevant: "Relevant",
      everything: "Everything",
      tempChecks: "Temp Checks",
    },
    delegates: {
      filter: "Filter",
      reset: "Reset",
      sort: "Sort",
      apply: "Apply",
      hasStatement: "Has statement",
      allRepresentatives: "All Delegates",
      myRepresentatives: "My Delegate(s)",
      sortBy: "Sort by",
      weightedRandom: "Random (default)",
      mostVotingPower: "Most voting power",
      leastVotingPower: "Least voting power",
      mostDelegators: "Most delegators",
      mostRecentDelegation: "Most recently delegated",
      oldestDelegation: "Oldest delegation",
      latestVotingBlock: "Latest voting block",
      vpChange7d: "7d VP Change Increase",
      vpChange7dDesc: "7d VP Change Decrease",
    },
  },
  proposals: {
    allTitle: "All Proposals",
    empty: "No proposals currently",
    tabTitle: "Proposals",
    draftsTabTitle: "Drafts",
    sponsorshipRequestsTabTitle: "Sponsorship Requests",
    myDraftsTitle: "My proposals",
    sponsorshipRequestsTitle: "Requests for sponsorship",
    createButton: "Create proposal",
    createDraftButton: "Create draft",
    updateDraftButton: "Update draft",
    proposalTypeLabel: "Proposal type",
    proposalTypePlaceholder: "Select a type",
    proposalTypeDisclaimer:
      "All proposal type selections must be approved by the DUNA admin before the vote is allowed to pass.",
    scopesLabel: "Scopes",
    titleLabel: "Title",
    descriptionLabel: "Description",
    bodyLabel: "Body",
    bodyPlaceholder: "Write your proposal...",
    draftBodyPlaceholder:
      "Describe the proposal, its rationale, and expected outcome.",
    titlePlaceholder: (tenantName) => `Add new appchain to ${tenantName}`,
    noVotingReason: "No voting reason provided",
    eligibleToCreateGovernanceProposal:
      "You are eligible to turn this into a gov proposal",
    createGovernanceProposalButton: "Create gov proposal",
    discussPrompt: (subject) => `Want to discuss this ${subject} further?`,
    createDiscussionButton: "Create discussion",
    proposalTypeNotApproved: "Proposal type not yet approved",
    proposalTypeTooltip:
      "This temp check still needs admin approval with proposal type before it can proceed to a governance proposal.",
    quorum: "Quorum",
    approvalThreshold: "Approval Threshold",
    untilTypeApproved: "until type approved",
  },
  create: {
    pageTitle: (postTypeLabel) => `Create ${postTypeLabel.toLowerCase()}`,
    postTypeOptions: {
      tempcheck: "Temp check",
      "gov-proposal": "Governance proposal",
    },
    titlePlaceholder: (tenantName) => `Add new appchain to ${tenantName}`,
    tempCheckPermissionGranted: "You can create temp checks",
    governanceProposalPermissionGranted:
      "You are authorized to create proposal",
    noWallet: "Wallet not connected",
    insufficientVotingPower: "Insufficient voting power",
    connectWalletPermission: "Connect your wallet to check permissions",
    tempCheckAuthorConfirmation: "You are the author of this temp check",
    tempCheckMustBeApproved: "Referenced temp check must be approved",
    selectSuccessfulTempCheck: "Select a successful temp check to continue",
    onlyAdminsOrAuthorsCanCreateProposal:
      "Only admins or temp check authors can create governance proposals",
    createTempCheckButton: "Create temp check",
    createProposalButton: "Create Proposal",
    creating: "Creating...",
    successToast: (postType) =>
      `${postType === "tempcheck" ? "Temp check" : "Governance proposal"} created successfully!`,
    failureToast: "Failed to create post",
    indexingTitle: "Created Successfully",
    indexingDescription: (postType) =>
      `Your ${postType === "tempcheck" ? "temp check" : "governance proposal"} has been submitted to the blockchain. It may take a couple of minutes for the data to be indexed and appear.`,
    gotIt: "Got it",
    relatedDiscussions: "Related Discussions",
    relatedTempCheck: "Related Temp Check",
    addReference: "+ Add Reference",
    searchRelatedTitle: (searchType) =>
      `Search ${searchType === "forum" ? "Forum Posts" : "Temp Checks"}`,
    searchRelatedPlaceholder: (searchType) =>
      `Search ${searchType === "forum" ? "forum posts" : "temp checks"}...`,
    noRelatedResults: "No results found",
    addedReference: "Added",
    clickReferenceHelp: "Click on an item to add it as a reference",
  },
  forums: {
    title: "Discussions",
    metadataTitle: (brandName) => `${brandName} Forum Discussions`,
    metadataDescription: (brandName) =>
      `Browse the latest topics, questions, and community updates from the ${brandName} forum.`,
    metadataOpenGraphDescription: (brandName) =>
      `Join the ${brandName} community conversations and explore trending forum topics.`,
    metadataTwitterDescription: (brandName) =>
      `Discover the latest conversations happening on the ${brandName} forum.`,
    searchPlaceholder: "Search discussions",
    searchAriaLabel: "Search forum topics",
    noMatches: "No matches found.",
    noTopics: "No topics found",
    errorLoading: "Error loading forum data",
    newTopicButton: "+ New Topic",
    createButton: "Create topic",
    createTitle: "Create new topic",
    topicTitlePlaceholder: "Topic title",
    bodyPlaceholder: "Write your discussion...",
    noCategory: "No category",
    topicCreationPermission: "Topic creation permission",
    createSuccessToast: "Forum topic created successfully! Redirecting...",
    createFailureToast: "Failed to create topic",
    replyPlaceholder: "Write your reply...",
    postingReply: "Posting...",
    postReply: "Post Reply",
    relatedTempCheck: "Related Temp check",
    relatedProposal: "Related Proposal",
    relatedDiscussion: "Related Discussion",
    referencedInDiscussion: "Referenced in Discussion",
    referencedInTempCheck: "Referenced in Temp check",
    referencedInProposal: "Referenced in Proposal",
    existingTempCheckTitle: "Existing Temp Check Found",
    existingTempCheckDescription:
      "There is already a temp check for this discussion. Do you want to see that one, or create a new one?",
    viewTempCheck: "View Temp Check",
    createNewTempCheck: "Create a New One",
  },
  delegates: {
    pageTitle: "Delegates",
    searchPlaceholder: "Exact ENS or address",
    searchTooltip:
      "Please input exact ENS or address. Partial and fuzzy search is not supported yet.",
    openSearchAria: "Open search",
    closeSearchAria: "Close search",
    table: {
      name: "Name",
      votingPower: "Voting power",
      change7d: "7d Change",
      participation: "Participation",
      delegators: "# of Delegators",
      info: "Info",
      empty: "None found",
    },
    delegation: {
      disabled: (tokenSymbol) =>
        `${tokenSymbol} delegation is disabled at this time`,
      sameAddress: "You cannot delegate to the same address again",
      failed: "Delegation failed - try again",
      submitting: "Submitting your delegation...",
      completed: "Delegation completed!",
      action: "Delegate",
      selfAction: "Delegate to self",
      setRepresentative: (representative) =>
        `Set ${representative} as your delegate`,
      canVoteWithTokens: (representative) =>
        `${representative} will be able to vote with any token owned by your address`,
      totalDelegatableVotes: "Your total delegatable votes",
      currentDelegate: "Currently delegated to",
      delegatingTo: "Delegating to",
      removeOwnDelegation: "Remove your own delegation",
      removeTitle: (representative) =>
        `Remove ${representative} as your delegate`,
      removeDescription:
        "This delegate will no longer be able to vote on your behalf. Your votes will be returned to you.",
      removeVotes: "Remove your delegate votes",
      notDelegating: "You are not currently delegating any votes.",
      undelegateAction: "Undelegate",
      undelegationFailed: "Undelegation failed - try again",
      undelegationSubmitting: "Submitting your undelegation request...",
      undelegationCompleted: "Undelegation completed!",
      selfBannerTitle: "Your tokens can't be voted with!",
      selfBannerDescription:
        "Make your vote count, delegate to yourself or someone else in the community.",
      overflowWarning:
        "You have delegated more than the total delegatable votes you have. Please reduce your current delegation before delegating more",
      splitDelegation: "Split your delegation to multiple people",
      allowRedelegation: "Let your delegates re-delegate",
      advancedTitle: "Welcome to advanced delegation",
      advancedDescription:
        "As a large token holder, you now have access to advanced delegation, which lets you manage your voting power with more control and flexibility.",
      continue: "Continue",
      delegateVotesAction: "Delegate your votes",
      connectWalletAction: "Connect wallet to delegate",
      ownVotesLabel: "You own",
      delegatedEntryLabel: "Delegated to",
      additionalVotesPrefix: "You've been delegated an additional",
      additionalVotesSuffix:
        "without the right to redelegate. You can only vote with this portion of votes and cannot pass them to others.",
      encourageTitle: "Governance starts with you!",
      encourageDescription:
        "Your tokens matter - connect your wallet to delegate your voting power and shape the future of the collective.",
      circularDelegationSelfTarget: "yourself",
      circularDelegationDelegatorTarget: "your direct or indirect delegator",
      circularDelegationUnsupported: (target) =>
        `Delegating back to ${target} is not supported`,
    },
    statement: {
      requiredToVote:
        "Voting requires a delegate statement. Set yours now to participate.",
      setupButton: "Set up statement",
      submitProfile: "Submit delegate profile",
      submitError:
        "There was an error submitting your delegate profile, please try again.",
      editTip:
        "Tip: you can always come back and edit your profile at any time.",
      codeOfConductRequired:
        "You must agree with the code of conduct to continue",
      principlesRequired: "You must agree with the DAO principles to continue",
      title: "Delegate statement",
      defaultPlaceholder: `A brief intro to yourself:

A message to the community and ecosystem:

Discourse username:`,
    },
    profile: {
      myRepresentative: "My Delegate",
      myRepresentatives: "My Delegates",
      statementTab: "Statement",
      participationTab: "Participation",
      delegationsTab: "Delegations",
      delegationsTitle: "Delegations",
      noDelegations: "No delegations found.",
      delegatedFrom: "Delegated from",
      delegatedTo: "Delegated to",
      delegatedOn: "Delegated on",
      votingPowerColumn: "Voting Power",
      currentTokenBalance: "Current Token Balance",
      from: "From",
      to: "To",
      txnHash: "Txn Hash",
      hiddenDust: "Accounts with 0 VP or Dust are hidden",
      loadMore: "Load More",
      noVotingPowerTitle: "This profile has no voting power",
      noVotingPowerDescription:
        "Our records show that this delegate currently holds no voting weight on this protocol. Any statements or votes posted from this profile do not influence proposal outcomes. Profiles like this are sometimes used for signaling or scams; please review with appropriate context.",
      editMyProfile: "Edit my profile",
      notFound: "Can't find that delegate.",
      activeTitle: "Active delegate",
      inactiveTitle: "Inactive delegate",
      votedRecent: (voted, total) =>
        `Voted in ${voted}/${total} of the most recent proposals`,
      pendingActivityTitle: "Gathering Data",
      pendingActivitySubtitle:
        "This delegate has not had voting power for a sufficient number of recent proposals. Check back later!",
    },
  },
  voting: {
    notOpen: "Not open to voting",
    connectWallet: "Connect wallet to vote",
    loading: "Loading...",
    reasonPlaceholder: "I believe...",
    submitVote: "Submit vote",
    castingVote: "Casting your vote",
    approveTransaction: "Approve transaction in your wallet to vote",
    reflectDelay:
      "It might take up to a minute for the changes to be reflected.",
    statementRequiresGas: "Voter statements require gas fees.",
    freeVoting: "Voting on Agora is free!",
    shareVote: "Share your vote",
    votedAgo: (ago) => `You voted for this proposal ${ago} ago`,
    proposalLaunched: "Proposal launched",
    snapshotExplanation:
      "Your voting power is captured when proposals launch based on your token holdings and delegations at that time.",
    snapshotChangeExplanation:
      "Any changes to your holdings after launch will not affect voting on this proposal.",
    proposalVotingPower: "Proposal voting power",
    noReason: "No voting reason provided",
    submittedTitle: "Your vote has been submitted!",
    submittedDescription:
      "It might take up to a minute for the changes to be reflected. Thank you for your active participation in governance.",
    writingToChain: "Writing your vote to the chain...",
    noStatementInline: "You do not have a delegate statement.",
    noStatementLink: "Please set one up to vote.",
    availableSoonTitle: "Voting will be available soon!",
    availableSoonDescription:
      "Thanks for trying to vote early! It looks like you've received votes via advanced delegation - a new beta feature. Voting will be enabled shortly. Please check back in a few days.",
    comeBackLater: "Got it, I'll come back later",
    errorSubmitting: "Error submitting vote",
    tryRegularVote: "Try regular vote",
    cancel: "Cancel",
    tryAgain: "Try again",
    supportLabel: (support) => support.toLowerCase(),
    castVoteTitle: (support) => `Casting vote ${support.toLowerCase()}`,
    voteWithPower: (support) => `Vote ${support.toLowerCase()} with`,
  },
  permissions: {
    insufficientTitle: (actionText) =>
      `Oh no, you don't have enough tokens to ${actionText}`,
    alignedToTokenHolders:
      "It's important that conversations are aligned only to token holders",
    yourVotingPowerAndBalance: "Your voting power and token balance",
    requiredVotingPower: "Required voting power",
    howToGetTokens: "How can I get tokens?",
    buyTokens: (tokenSymbol) => `Buy ${tokenSymbol} tokens`,
    buyTokensDescription: (tokenSymbol) =>
      `Purchase ${tokenSymbol} tokens to gain voting power. Your token balance counts as voting power, even without delegation. You can also delegate to yourself or others for additional governance participation.`,
    actionText: {
      topic: "create topics",
      post: "post replies",
      upvote: "upvote",
      react: "react to posts",
    },
  },
};

const ngoCopy: TenantCopy = {
  ...daoCopy,
  mode: "ngo",
  nouns: {
    ...daoCopy.nouns,
    organization: "organization",
    community: "supporter community",
    member: "supporter",
    members: "supporters",
    tokenHolder: "supporter",
    tokenHolders: "supporters",
    representative: "representative",
    representatives: "representatives",
    governanceProposal: "community proposal",
    governanceProposals: "community proposals",
    tempCheck: "community check",
    tempChecks: "community checks",
  },
  nav: {
    ...daoCopy.nav,
    delegates: "Voters",
    governance: "Community",
  },
  footer: {
    tagline: ", the onchain community engagement company",
    shortTagline: "Onchain Community Engagement",
  },
  info: {
    defaultTabs: {
      delegateTitle: "Assign representative voting power",
      delegateDescription:
        "Supporters can participate directly or assign their voting power to trusted representatives.",
      proposalsTitle: "Browse proposals",
      proposalsDescription:
        "Community decisions are initiated as proposals, providing insight into supporter priorities.",
      voteTitle: "Vote on proposals",
      voteDescription:
        "Proposals that advance to a vote are accepted or rejected by participating supporters and representatives.",
    },
    governanceCharts: {
      ...daoCopy.info.governanceCharts,
      title: "Community",
      topRepresentatives: "Top Representatives",
      activeRepresentatives: "Active Representatives",
      representativesNeeded: "Representatives needed",
      allRepresentatives: "All Representatives",
      representativesOver100kTokens:
        "Representatives with over 100K supporter tokens",
      representativesToReachHalfSupply:
        "# of representatives to reach 50% of votable supply",
      representativesToReachQuorum: "# of representatives to reach quorum",
    },
  },
  filters: {
    proposals: {
      relevant: "Relevant",
      everything: "Everything",
      tempChecks: "Community Checks",
    },
    delegates: {
      ...daoCopy.filters.delegates,
      allRepresentatives: "All Representatives",
      myRepresentatives: "My Representative(s)",
      mostDelegators: "Most supporters",
      mostRecentDelegation: "Most recently assigned",
      oldestDelegation: "Oldest assignment",
    },
  },
  proposals: {
    ...daoCopy.proposals,
    allTitle: "All Proposals",
    sponsorshipRequestsTabTitle: "Support Requests",
    sponsorshipRequestsTitle: "Requests for support",
    proposalTypeDisclaimer:
      "All proposal type selections must be approved by an admin before the vote is allowed to pass.",
    bodyPlaceholder:
      "Share the context, decision needed, and expected impact for the community.",
    draftBodyPlaceholder:
      "Describe the proposal, why it matters, and what supporter input should decide.",
    titlePlaceholder: (tenantName) => `Help shape ${tenantName}'s priorities`,
    eligibleToCreateGovernanceProposal:
      "You are eligible to turn this into a community proposal",
    createGovernanceProposalButton: "Create community proposal",
    proposalTypeTooltip:
      "This community check still needs admin approval with proposal type before it can proceed to a community proposal.",
  },
  create: {
    ...daoCopy.create,
    postTypeOptions: {
      tempcheck: "Community check",
      "gov-proposal": "Community proposal",
    },
    titlePlaceholder: (tenantName) => `Help shape ${tenantName}'s priorities`,
    tempCheckPermissionGranted: "You can create community checks",
    governanceProposalPermissionGranted:
      "You are authorized to create a community proposal",
    tempCheckAuthorConfirmation: "You are the author of this community check",
    tempCheckMustBeApproved: "Referenced community check must be approved",
    selectSuccessfulTempCheck:
      "Select a successful community check to continue",
    onlyAdminsOrAuthorsCanCreateProposal:
      "Only admins or community check authors can create community proposals",
    createTempCheckButton: "Create community check",
    createProposalButton: "Create Proposal",
    successToast: (postType) =>
      `${postType === "tempcheck" ? "Community check" : "Community proposal"} created successfully!`,
    indexingDescription: (postType) =>
      `Your ${postType === "tempcheck" ? "community check" : "community proposal"} has been submitted. It may take a couple of minutes for the data to be indexed and appear.`,
    relatedTempCheck: "Related Community Check",
    searchRelatedTitle: (searchType) =>
      `Search ${searchType === "forum" ? "Discussions" : "Community Checks"}`,
    searchRelatedPlaceholder: (searchType) =>
      `Search ${searchType === "forum" ? "discussions" : "community checks"}...`,
  },
  forums: {
    ...daoCopy.forums,
    metadataDescription: (brandName) =>
      `Browse the latest topics, questions, and supporter updates from the ${brandName} forum.`,
    metadataOpenGraphDescription: (brandName) =>
      `Join the ${brandName} supporter conversations and explore trending forum topics.`,
    metadataTwitterDescription: (brandName) =>
      `Discover the latest conversations happening in the ${brandName} supporter forum.`,
    newTopicButton: "+ New Discussion",
    createButton: "Create discussion",
    createTitle: "Create new discussion",
    topicTitlePlaceholder: "Discussion title",
    bodyPlaceholder: "Write your discussion...",
    topicCreationPermission: "Discussion creation permission",
    createSuccessToast: "Discussion created successfully! Redirecting...",
    createFailureToast: "Failed to create discussion",
    replyPlaceholder: "Write your reply...",
    postingReply: "Posting...",
    postReply: "Post Reply",
    relatedTempCheck: "Related Community Check",
    relatedDiscussion: "Related Discussion",
    referencedInTempCheck: "Referenced in Community Check",
    existingTempCheckTitle: "Existing Community Check Found",
    existingTempCheckDescription:
      "There is already a community check for this discussion. Do you want to see that one, or create a new one?",
    viewTempCheck: "View Community Check",
    createNewTempCheck: "Create a New One",
  },
  delegates: {
    ...daoCopy.delegates,
    pageTitle: "Voters",
    table: {
      ...daoCopy.delegates.table,
      delegators: "# of Supporters",
    },
    delegation: {
      ...daoCopy.delegates.delegation,
      disabled: (tokenSymbol) =>
        `${tokenSymbol} representation is disabled at this time`,
      sameAddress: "You cannot assign representation to the same address again",
      failed: "Representative assignment failed - try again",
      submitting: "Submitting your representative assignment...",
      completed: "Representative assignment completed!",
      action: "Assign representative",
      selfAction: "Assign yourself",
      setRepresentative: (representative) =>
        `Set ${representative} as your representative`,
      canVoteWithTokens: (representative) =>
        `${representative} will be able to vote with the voting power owned by your address`,
      totalDelegatableVotes: "Your total assignable votes",
      currentDelegate: "Currently represented by",
      delegatingTo: "Assigning representative",
      removeOwnDelegation: "Remove your own representative",
      removeTitle: (representative) =>
        `Remove ${representative} as your representative`,
      removeDescription:
        "This representative will no longer be able to vote on your behalf. Your votes will be returned to you.",
      removeVotes: "Return your representative votes",
      notDelegating: "You are not currently assigning any votes.",
      undelegateAction: "Remove representative",
      undelegationFailed: "Representative removal failed - try again",
      undelegationSubmitting: "Submitting your representative removal...",
      undelegationCompleted: "Representative removal completed!",
      selfBannerTitle: "Your supporter tokens are not voting yet!",
      selfBannerDescription:
        "Make your vote count by assigning representation to yourself or another supporter.",
      overflowWarning:
        "You have assigned more than your total available votes. Please reduce your current assignment before assigning more.",
      splitDelegation: "Split your representation across multiple people",
      allowRedelegation: "Let your representatives re-assign votes",
      advancedTitle: "Welcome to advanced representation",
      advancedDescription:
        "As a large supporter, you now have access to advanced representation, which lets you manage your voting power with more control and flexibility.",
      delegateVotesAction: "Assign your votes",
      connectWalletAction: "Connect wallet to assign a representative",
      ownVotesLabel: "You own",
      delegatedEntryLabel: "Assigned to",
      additionalVotesPrefix: "You've received an additional",
      additionalVotesSuffix:
        "without the right to re-assign it. You can only vote with this portion of votes and cannot pass it to others.",
      encourageTitle: "Community voting starts with you!",
      encourageDescription:
        "Your supporter tokens matter - connect your wallet to assign representation and help shape the future of the community.",
      circularDelegationSelfTarget: "yourself",
      circularDelegationDelegatorTarget:
        "your direct or indirect representative",
      circularDelegationUnsupported: (target) =>
        `Assigning representation back to ${target} is not supported`,
    },
    statement: {
      requiredToVote:
        "Voting requires a voter statement. Set yours now to participate.",
      setupButton: "Set up statement",
      submitProfile: "Submit voter profile",
      submitError:
        "There was an error submitting your voter profile, please try again.",
      editTip:
        "Tip: you can always come back and edit your profile at any time.",
      codeOfConductRequired:
        "You must agree with the code of conduct to continue",
      principlesRequired:
        "You must agree with the organization principles to continue",
      title: "Voter statement",
      defaultPlaceholder: `A brief intro to yourself:`,
    },
    profile: {
      myRepresentative: "My Representative",
      myRepresentatives: "My Representatives",
      statementTab: "Statement",
      participationTab: "Participation",
      delegationsTab: "Representation",
      delegationsTitle: "Representation",
      noDelegations: "No representation found.",
      delegatedFrom: "Represented by",
      delegatedTo: "Representing",
      delegatedOn: "Assigned on",
      votingPowerColumn: "Voting Power",
      currentTokenBalance: "Current Supporter Token Balance",
      from: "From",
      to: "To",
      txnHash: "Txn Hash",
      hiddenDust: "Accounts with 0 voting power or dust are hidden",
      loadMore: "Load More",
      noVotingPowerTitle: "This profile has no voting power",
      noVotingPowerDescription:
        "Our records show that this voter currently holds no voting weight. Any statements or votes posted from this profile do not influence proposal outcomes. Profiles like this are sometimes used for signaling or scams; please review with appropriate context.",
      editMyProfile: "Edit profile",
      notFound: "Can't find that voter.",
      activeTitle: "Active voter",
      inactiveTitle: "Inactive voter",
      votedRecent: (voted, total) =>
        `Voted in ${voted}/${total} of the most recent proposals`,
      pendingActivityTitle: "Gathering Data",
      pendingActivitySubtitle:
        "This voter has not had voting power for a sufficient number of recent proposals. Check back later!",
    },
  },
  voting: {
    ...daoCopy.voting,
    reasonPlaceholder: "I support this because...",
    snapshotExplanation:
      "Your voting power is captured when proposals launch based on your supporter token holdings and representative assignments at that time.",
    snapshotChangeExplanation:
      "Any changes to your holdings after launch will not affect voting on this proposal.",
    submittedDescription:
      "It might take up to a minute for the changes to be reflected. Thank you for participating.",
    noStatementInline: "You do not have a voter statement.",
    noStatementLink: "Please set one up to vote.",
  },
  permissions: {
    ...daoCopy.permissions,
    insufficientTitle: (actionText) =>
      `You don't have enough supporter voting power to ${actionText}`,
    alignedToTokenHolders:
      "Conversations are limited to supporters who meet the participation threshold.",
    yourVotingPowerAndBalance: "Your voting power and supporter token balance",
    howToGetTokens: "How can I get supporter voting power?",
    buyTokens: (tokenSymbol) => `Claim or receive ${tokenSymbol}`,
    buyTokensDescription: (tokenSymbol) =>
      `${tokenSymbol} represents supporter voting power. Your balance counts as voting power, and you can assign a representative to participate on your behalf.`,
    actionText: {
      topic: "create discussions",
      post: "post replies",
      upvote: "upvote",
      react: "react to posts",
    },
  },
};

export const TENANT_COPY: Record<TenantCopyMode, TenantCopy> = {
  dao: daoCopy,
  ngo: ngoCopy,
};

export function getTenantCopy(mode: TenantCopyMode = "dao"): TenantCopy {
  return TENANT_COPY[mode];
}
