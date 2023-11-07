WITH proposal_deadline AS (
  SELECT
    optimism_proposal_deadline_updated_events.proposal_id,
    max(
      optimism_proposal_deadline_updated_events.block_number
    ) AS max_block_number
  FROM
    center.optimism_proposal_deadline_updated_events
  GROUP BY
    optimism_proposal_deadline_updated_events.proposal_id
),
proposal_list AS (
  SELECT
    p.proposal_id,
    p.proposer,
    p.description,
    p.start_block AS created_at,
    p.end_block,
    d.deadline,
    COALESCE(
      (
        SELECT
          q.new_quorum_numerator
        FROM
          center.optimism_quorum_numerator_updated_events q
        WHERE
          (q.block_number <= (p.start_block) :: bigint)
        ORDER BY
          q.block_number DESC
        LIMIT
          1
      ), '0' :: text
    ) AS quorum,
    c.block_number AS cancelled_at,
    e.block_number AS executed_at
  FROM
    (
      (
        (
          (
            center.optimism_proposal_created_0x7d84a626_events p
            LEFT JOIN proposal_deadline pd ON ((p.proposal_id = pd.proposal_id))
          )
          LEFT JOIN center.optimism_proposal_deadline_updated_events d ON (
            (
              (pd.proposal_id = d.proposal_id)
              AND (pd.max_block_number = d.block_number)
            )
          )
        )
        LEFT JOIN center.optimism_proposal_canceled_events c ON ((p.proposal_id = c.proposal_id))
      )
      LEFT JOIN center.optimism_proposal_executed_events e ON ((p.proposal_id = e.proposal_id))
    )
  GROUP BY
    p.proposal_id,
    p.proposer,
    p.description,
    p.start_block,
    p.end_block,
    d.deadline,
    c.block_number,
    e.block_number
),
aggregated_votes AS (
  SELECT
    optimism_vote_cast_events.proposal_id,
    count(*) AS total_votes,
    sum((optimism_vote_cast_events.weight) :: numeric) AS total_voting_power,
    sum(
      CASE
        WHEN ((optimism_vote_cast_events.support) :: integer = 1) THEN (optimism_vote_cast_events.weight) :: numeric
        ELSE (0) :: numeric
      END
    ) AS total_voting_power_for,
    sum(
      CASE
        WHEN ((optimism_vote_cast_events.support) :: integer = 0) THEN (optimism_vote_cast_events.weight) :: numeric
        ELSE (0) :: numeric
      END
    ) AS total_voting_power_against,
    sum(
      CASE
        WHEN ((optimism_vote_cast_events.support) :: integer = 2) THEN (optimism_vote_cast_events.weight) :: numeric
        ELSE (0) :: numeric
      END
    ) AS total_voting_power_abstain,
    count(
      CASE
        WHEN ((optimism_vote_cast_events.support) :: integer = 1) THEN 1
        ELSE NULL :: integer
      END
    ) AS total_votes_for,
    count(
      CASE
        WHEN ((optimism_vote_cast_events.support) :: integer = 0) THEN 1
        ELSE NULL :: integer
      END
    ) AS total_votes_against,
    count(
      CASE
        WHEN ((optimism_vote_cast_events.support) :: integer = 2) THEN 1
        ELSE NULL :: integer
      END
    ) AS total_votes_abstain,
    count(
      CASE
        WHEN (
          (optimism_vote_cast_events.reason IS NOT NULL)
          AND (optimism_vote_cast_events.reason <> '' :: text)
        ) THEN 1
        ELSE NULL :: integer
      END
    ) AS total_votes_with_reason
  FROM
    center.optimism_vote_cast_events
  GROUP BY
    optimism_vote_cast_events.proposal_id
),
final_table AS (
  SELECT
    pl.proposal_id,
    pl.proposer,
    pl.description,
    pl.created_at,
    pl.end_block,
    pl.deadline,
    pl.quorum,
    pl.cancelled_at,
    pl.executed_at,
    av.total_votes,
    av.total_voting_power,
    av.total_voting_power_for,
    av.total_voting_power_against,
    av.total_voting_power_abstain,
    av.total_votes_for,
    av.total_votes_against,
    av.total_votes_abstain,
    av.total_votes_with_reason,
    CASE
      WHEN (pl.cancelled_at IS NOT NULL) THEN 'Cancelled' :: text
      WHEN (pl.executed_at IS NOT NULL) THEN 'Executed' :: text
      ELSE CASE
        WHEN (109516350 <= (pl.created_at) :: bigint) THEN 'Pending' :: text
        WHEN (109516350 <= (pl.end_block) :: bigint) THEN 'Active' :: text
        ELSE CASE
          WHEN (
            (
              av.total_voting_power_for + av.total_voting_power_abstain
            ) < (
              (
                (pl.quorum) :: numeric * ('4294967296' :: bigint) :: numeric
              ) / (100000) :: numeric
            )
          ) THEN 'Defeated' :: text
          WHEN (
            av.total_voting_power_for > av.total_voting_power_against
          ) THEN 'Succeeded' :: text
          ELSE 'Queued' :: text
        END
      END
    END AS STATUS
  FROM
    (
      proposal_list pl
      LEFT JOIN aggregated_votes av ON ((pl.proposal_id = av.proposal_id))
    )
)
SELECT
  final_table.proposal_id,
  final_table.proposer,
  final_table.description,
  final_table.created_at,
  final_table.end_block,
  final_table.deadline,
  final_table.quorum,
  final_table.cancelled_at,
  final_table.executed_at,
  final_table.total_votes,
  final_table.total_voting_power,
  final_table.total_voting_power_for,
  final_table.total_voting_power_against,
  final_table.total_voting_power_abstain,
  final_table.total_votes_for,
  final_table.total_votes_against,
  final_table.total_votes_abstain,
  final_table.total_votes_with_reason,
  final_table.status
FROM
  final_table;