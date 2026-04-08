import {
  type DashboardSummary,
  type DonationRecord,
  type DonationSettingsRecord,
  type FellowRecord,
  type ProposalActionRecord,
  type ProposalMetadataRecord,
  type ProposalRecord,
  type SalaryClaimRecord,
  type SyncState,
  type TreasuryTransferRecord,
  type VoteRecord,
} from './types';
import { ensureAppSchema, query, pool } from './db';

function serializeRecord<T extends Record<string, unknown>>(record: T): T {
  const entries = Object.entries(record).map(([key, value]) => {
    if (typeof value === 'bigint') return [key, value.toString()];
    if (value instanceof Date) return [key, value.toISOString()];
    return [key, value];
  });

  return Object.fromEntries(entries) as T;
}

function groupActionsByProposal(actions: ProposalActionRecord[]): Map<string, ProposalActionRecord[]> {
  const map = new Map<string, ProposalActionRecord[]>();
  for (const action of actions) {
    map.set(action.proposalId, [...(map.get(action.proposalId) ?? []), action]);
  }
  return map;
}

function groupVotesByProposal(votes: VoteRecord[]): Map<string, VoteRecord[]> {
  const map = new Map<string, VoteRecord[]>();
  for (const vote of votes) {
    map.set(vote.proposalId, [...(map.get(vote.proposalId) ?? []), vote]);
  }
  return map;
}

function groupMetadataByProposal(metadata: ProposalMetadataRecord[]): Map<string, ProposalMetadataRecord> {
  return new Map(metadata.map((item) => [item.proposalId, item]));
}

export async function getSyncState(): Promise<SyncState | null> {
  const rows = await query<SyncState>(`
    select
      id,
      chain_id as "chainId",
      latest_processed_block as "latestProcessedBlock",
      latest_processed_timestamp as "latestProcessedTimestamp",
      latest_processed_hash as "latestProcessedHash",
      mode,
      updated_at as "updatedAt"
    from web3.sync_state
    order by updated_at desc
    limit 1
  `);

  return rows[0] ? serializeRecord(rows[0]) : null;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [counts] = await query<{
    donationCount: string;
    proposalCount: string;
    activeFellowCount: string;
    salaryClaimCount: string;
    treasuryTransferCount: string;
    totalDonated: string | null;
    totalGranted: string | null;
    totalClaimedSalary: string | null;
  }>(`
    select
      (select count(*)::text from web3.donations) as "donationCount",
      (select count(*)::text from web3.proposals) as "proposalCount",
      (select count(*)::text from web3.fellows where active = true) as "activeFellowCount",
      (select count(*)::text from web3.salary_claims) as "salaryClaimCount",
      (select count(*)::text from web3.treasury_transfers) as "treasuryTransferCount",
      (select coalesce(sum(amount), 0)::text from web3.donations) as "totalDonated",
      (select coalesce(sum(amount), 0)::text from web3.treasury_transfers where transfer_type = 'grant') as "totalGranted",
      (select coalesce(sum(amount), 0)::text from web3.treasury_transfers where transfer_type = 'salary') as "totalClaimedSalary"
  `);

  return {
    donationCount: Number(counts.donationCount),
    proposalCount: Number(counts.proposalCount),
    activeFellowCount: Number(counts.activeFellowCount),
    salaryClaimCount: Number(counts.salaryClaimCount),
    treasuryTransferCount: Number(counts.treasuryTransferCount),
    totalDonated: counts.totalDonated ?? '0',
    totalGranted: counts.totalGranted ?? '0',
    totalClaimedSalary: counts.totalClaimedSalary ?? '0',
    syncState: await getSyncState(),
  };
}

export async function getDonations(limit = 20): Promise<DonationRecord[]> {
  const rows = await query<DonationRecord>(
    `
      select
        id,
        donor,
        beneficiary,
        asset,
        amount,
        voting_power as "votingPower",
        block_number as "blockNumber",
        block_timestamp as "blockTimestamp",
        tx_hash as "txHash",
        created_at as "createdAt"
      from web3.donations
      order by block_number desc, created_at desc
      limit $1
    `,
    [limit],
  );

  return rows.map(serializeRecord);
}

export async function getDonationSettings(): Promise<DonationSettingsRecord> {
  try {
    const rows = await query<DonationSettingsRecord>(`
      select
        id,
        minimum_donation as "minimumDonation",
        updated_at_block as "updatedAtBlock",
        updated_at_timestamp as "updatedAtTimestamp",
        tx_hash as "txHash",
        updated_at as "updatedAt"
      from web3.donation_settings
      order by updated_at_block desc, updated_at desc
      limit 1
    `);

    return rows[0]
      ? serializeRecord(rows[0])
      : {
          id: 'donation-controller',
          minimumDonation: '1000000000000000000',
          updatedAtBlock: '0',
          updatedAtTimestamp: '0',
          txHash: '',
          updatedAt: new Date(0).toISOString(),
        };
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
    if (code !== '42P01') throw error;

    return {
      id: 'donation-controller',
      minimumDonation: '1000000000000000000',
      updatedAtBlock: '0',
      updatedAtTimestamp: '0',
      txHash: '',
      updatedAt: new Date(0).toISOString(),
    };
  }
}

export async function getFellows(): Promise<FellowRecord[]> {
  const rows = await query<FellowRecord>(`
    select
      id,
      member,
      active,
      monthly_salary as "monthlySalary",
      rate_per_block_wad as "ratePerBlockWad",
      last_accrued_block as "lastAccruedBlock",
      unclaimed_amount as "unclaimedAmount",
      claimable_amount as "claimableAmount",
      added_at_block as "addedAtBlock",
      removed_at_block as "removedAtBlock",
      updated_at_block as "updatedAtBlock",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from web3.fellows
    order by active desc, updated_at desc
  `);

  return rows.map(serializeRecord);
}

export async function getSalaryClaims(limit = 20): Promise<SalaryClaimRecord[]> {
  const rows = await query<SalaryClaimRecord>(
    `
      select
        id,
        member,
        amount,
        block_number as "blockNumber",
        block_timestamp as "blockTimestamp",
        tx_hash as "txHash",
        created_at as "createdAt"
      from web3.salary_claims
      order by block_number desc, created_at desc
      limit $1
    `,
    [limit],
  );

  return rows.map(serializeRecord);
}

export async function getTreasuryTransfers(limit = 20): Promise<TreasuryTransferRecord[]> {
  const rows = await query<TreasuryTransferRecord>(
    `
      select
        id,
        recipient,
        amount,
        transfer_type as "transferType",
        block_number as "blockNumber",
        block_timestamp as "blockTimestamp",
        tx_hash as "txHash",
        proposal_id as "proposalId",
        created_at as "createdAt"
      from web3.treasury_transfers
      order by block_number desc, created_at desc
      limit $1
    `,
    [limit],
  );

  return rows.map(serializeRecord);
}

export async function getProposalMetadata(proposalId: string): Promise<ProposalMetadataRecord | null> {
  await ensureAppSchema();
  const rows = await query<ProposalMetadataRecord>(
    `
      select
        proposal_id as "proposalId",
        title,
        summary,
        body,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from app.proposal_metadata
      where proposal_id = $1
      limit 1
    `,
    [proposalId],
  );

  return rows[0] ? serializeRecord(rows[0]) : null;
}

export async function upsertProposalMetadata(input: {
  proposalId: string;
  title: string;
  summary?: string | null;
  body?: string | null;
}): Promise<ProposalMetadataRecord> {
  await ensureAppSchema();

  const rows = await query<ProposalMetadataRecord>(
    `
      insert into app.proposal_metadata (proposal_id, title, summary, body)
      values ($1, $2, $3, $4)
      on conflict (proposal_id)
      do update set
        title = excluded.title,
        summary = excluded.summary,
        body = excluded.body,
        updated_at = now()
      returning
        proposal_id as "proposalId",
        title,
        summary,
        body,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `,
    [input.proposalId, input.title, input.summary ?? null, input.body ?? null],
  );

  return serializeRecord(rows[0]);
}

export async function getProposals(limit = 50): Promise<ProposalRecord[]> {
  await ensureAppSchema();

  const proposals = await query<Omit<ProposalRecord, 'actions' | 'votes' | 'metadata'>>(
    `
      select
        id,
        proposal_id as "proposalId",
        proposer,
        target,
        proposal_type as "proposalType",
        value,
        calldata,
        description,
        snapshot_block as "snapshotBlock",
        deadline_block as "deadlineBlock",
        created_block as "createdBlock",
        created_timestamp as "createdTimestamp",
        queued_at as "queuedAt",
        eta,
        executed_at as "executedAt",
        operation_id as "operationId",
        state,
        for_votes as "forVotes",
        against_votes as "againstVotes",
        abstain_votes as "abstainVotes",
        quorum_votes as "quorumVotes",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from web3.proposals
      order by created_block desc, created_at desc
      limit $1
    `,
    [limit],
  );

  const proposalIds = proposals.map((proposal) => proposal.proposalId);
  if (proposalIds.length === 0) return [];

  const [actions, votes, metadata] = await Promise.all([
    query<ProposalActionRecord>(
      `
        select
          id,
          proposal_id as "proposalId",
          target,
          selector,
          action_type as "actionType",
          recipient,
          member,
          amount,
          monthly_salary as "monthlySalary",
          raw_data as "rawData",
          created_at as "createdAt"
        from web3.proposal_actions
        where proposal_id = any($1)
        order by created_at asc
      `,
      [proposalIds],
    ),
    query<VoteRecord>(
      `
        select
          id,
          proposal_id as "proposalId",
          voter,
          support,
          weight,
          reason,
          block_number as "blockNumber",
          block_timestamp as "blockTimestamp",
          tx_hash as "txHash",
          created_at as "createdAt"
        from web3.votes
        where proposal_id = any($1)
        order by block_number desc, created_at desc
      `,
      [proposalIds],
    ),
    query<ProposalMetadataRecord>(
      `
        select
          proposal_id as "proposalId",
          title,
          summary,
          body,
          created_at as "createdAt",
          updated_at as "updatedAt"
        from app.proposal_metadata
        where proposal_id = any($1)
      `,
      [proposalIds],
    ),
  ]);

  const actionMap = groupActionsByProposal(actions.map(serializeRecord));
  const voteMap = groupVotesByProposal(votes.map(serializeRecord));
  const metadataMap = groupMetadataByProposal(metadata.map(serializeRecord));

  return proposals.map((proposal) => {
    const serialized = serializeRecord(proposal);
    return {
      ...serialized,
      actions: actionMap.get(proposal.proposalId) ?? [],
      votes: voteMap.get(proposal.proposalId) ?? [],
      metadata: metadataMap.get(proposal.proposalId) ?? null,
    };
  });
}

export async function getProposalById(proposalId: string): Promise<ProposalRecord | null> {
  const proposals = await getProposals(100);
  return proposals.find((proposal) => proposal.proposalId === proposalId) ?? null;
}

export async function getAddressClaims(address: string): Promise<SalaryClaimRecord[]> {
  const rows = await query<SalaryClaimRecord>(
    `
      select
        id,
        member,
        amount,
        block_number as "blockNumber",
        block_timestamp as "blockTimestamp",
        tx_hash as "txHash",
        created_at as "createdAt"
      from web3.salary_claims
      where lower(member) = lower($1)
      order by block_number desc
    `,
    [address],
  );

  return rows.map(serializeRecord);
}

export async function getAddressDonations(address: string): Promise<DonationRecord[]> {
  const rows = await query<DonationRecord>(
    `
      select
        id,
        donor,
        beneficiary,
        asset,
        amount,
        voting_power as "votingPower",
        block_number as "blockNumber",
        block_timestamp as "blockTimestamp",
        tx_hash as "txHash",
        created_at as "createdAt"
      from web3.donations
      where lower(donor) = lower($1) or lower(beneficiary) = lower($1)
      order by block_number desc
    `,
    [address],
  );

  return rows.map(serializeRecord);
}

export async function closePool(): Promise<void> {
  await pool.end();
}
