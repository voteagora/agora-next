WITH proposal_created_events AS (
  SELECT
    'Proposal Created' :: text AS event_type,
    optimism_proposal_created_0x7d84a626_events.block_number,
    optimism_proposal_created_0x7d84a626_events.proposer AS executor,
    optimism_proposal_created_0x7d84a626_events.proposal_id AS details,
    optimism_proposal_created_0x7d84a626_events.inputs
  FROM
    center.optimism_proposal_created_0x7d84a626_events
),
vote_cast_events AS (
  SELECT
    'Vote Casted' :: text AS event_type,
    optimism_vote_cast_events.block_number,
    optimism_vote_cast_events.voter AS executor,
    (
      (
        (
          CASE
            WHEN ((optimism_vote_cast_events.support) :: integer = 0) THEN 'Vote Against' :: text
            WHEN ((optimism_vote_cast_events.support) :: integer = 1) THEN 'Vote For' :: text
            WHEN ((optimism_vote_cast_events.support) :: integer = 2) THEN 'Vote Abstain' :: text
            ELSE 'Voted, Unknown' :: text
          END || ' on Prop ID: ' :: text
        ) || optimism_vote_cast_events.proposal_id
      ) || CASE
        WHEN (
          (optimism_vote_cast_events.reason IS NOT NULL)
          AND (optimism_vote_cast_events.reason <> '' :: text)
        ) THEN (' ; ' :: text || optimism_vote_cast_events.reason)
        ELSE '' :: text
      END
    ) AS details,
    optimism_vote_cast_events.inputs
  FROM
    center.optimism_vote_cast_events
),
delegate_changed_events AS (
  SELECT
    'Delegation Made' :: text AS event_type,
    dce.block_number,
    dce.delegator AS executor,
    (
      (
        (
          (
            ('From ' :: text || dce.from_delegate) || ' To ' :: text
          ) || dce.to_delegate
        ) || ' With Balance Difference: ' :: text
      ) || (
        (
          (
            (dvce.new_balance) :: numeric / '1000000000000000000' :: numeric
          ) - (
            (dvce.previous_balance) :: numeric / '1000000000000000000' :: numeric
          )
        )
      ) :: text
    ) AS details,
    dce.inputs
  FROM
    (
      center.optimism_delegate_changed_events dce
      JOIN center.optimism_delegate_votes_changed_events dvce ON (
        (
          (dce.block_number = dvce.block_number)
          AND (dce.to_delegate = dvce.delegate)
        )
      )
    )
),
proposal_cancelled_events AS (
  SELECT
    'Proposal Updated' :: text AS event_type,
    optimism_proposal_canceled_events.block_number,
    optimism_proposal_canceled_events.address AS executor,
    (
      'Canceled Proposal ID ' :: text || optimism_proposal_canceled_events.proposal_id
    ) AS details,
    optimism_proposal_canceled_events.inputs
  FROM
    center.optimism_proposal_canceled_events
),
proposal_executed_events AS (
  SELECT
    'Proposal Updated' :: text AS event_type,
    optimism_proposal_executed_events.block_number,
    optimism_proposal_executed_events.address AS executor,
    (
      'Executed Proposal ID ' :: text || optimism_proposal_executed_events.proposal_id
    ) AS details,
    optimism_proposal_executed_events.inputs
  FROM
    center.optimism_proposal_executed_events
)
SELECT
  proposal_created_events.event_type,
  proposal_created_events.block_number,
  proposal_created_events.executor,
  proposal_created_events.details,
  proposal_created_events.inputs
FROM
  proposal_created_events
UNION
ALL
SELECT
  vote_cast_events.event_type,
  vote_cast_events.block_number,
  vote_cast_events.executor,
  vote_cast_events.details,
  vote_cast_events.inputs
FROM
  vote_cast_events
UNION
ALL
SELECT
  delegate_changed_events.event_type,
  delegate_changed_events.block_number,
  delegate_changed_events.executor,
  delegate_changed_events.details,
  delegate_changed_events.inputs
FROM
  delegate_changed_events
UNION
ALL
SELECT
  proposal_cancelled_events.event_type,
  proposal_cancelled_events.block_number,
  proposal_cancelled_events.executor,
  proposal_cancelled_events.details,
  proposal_cancelled_events.inputs
FROM
  proposal_cancelled_events
UNION
ALL
SELECT
  proposal_executed_events.event_type,
  proposal_executed_events.block_number,
  proposal_executed_events.executor,
  proposal_executed_events.details,
  proposal_executed_events.inputs
FROM
  proposal_executed_events
ORDER BY
  2 DESC;