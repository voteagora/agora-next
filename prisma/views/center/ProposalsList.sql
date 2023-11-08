SELECT
  pr.block_number,
  pr.proposal_id,
  pr.proposer,
  pr.description,
  pr.start_block,
  pr.end_block,
  (
    json_build_object(
      'for',
      stats."for",
      'against',
      stats.against,
      'abstain',
      stats.abstain
    )
  ) :: text AS proposal_data
FROM
  (
    center.optimism_proposal_created_0x7d84a626_events pr
    JOIN (
      SELECT
        optimism_vote_cast_events.proposal_id,
        sum(
          CASE
            WHEN (optimism_vote_cast_events.support = '0' :: text) THEN (optimism_vote_cast_events.weight) :: numeric
            ELSE NULL :: numeric
          END
        ) AS AGAINST,
        sum(
          CASE
            WHEN (optimism_vote_cast_events.support = '1' :: text) THEN (optimism_vote_cast_events.weight) :: numeric
            ELSE NULL :: numeric
          END
        ) AS "for",
        sum(
          CASE
            WHEN (optimism_vote_cast_events.support = '2' :: text) THEN (optimism_vote_cast_events.weight) :: numeric
            ELSE NULL :: numeric
          END
        ) AS abstain
      FROM
        center.optimism_vote_cast_events
      GROUP BY
        optimism_vote_cast_events.proposal_id
    ) stats ON ((stats.proposal_id = pr.proposal_id))
  )
UNION
SELECT
  optimism_proposal_created_0xe1a17f47_events.block_number,
  optimism_proposal_created_0xe1a17f47_events.proposal_id,
  optimism_proposal_created_0xe1a17f47_events.proposer,
  optimism_proposal_created_0xe1a17f47_events.description,
  optimism_proposal_created_0xe1a17f47_events.start_block,
  optimism_proposal_created_0xe1a17f47_events.end_block,
  (
    json_build_object(
      'num_of_options',
      jsonb_array_length(
        (
          (
            center_decode_abi(
              '["(address[],uint256[],bytes[],string)[]", "(uint8,uint8,address,uint128,uint128)"]' :: jsonb,
              optimism_proposal_created_0xe1a17f47_events.proposal_data
            )
          ) :: jsonb -> 0
        )
      )
    )
  ) :: text AS proposal_data
FROM
  center.optimism_proposal_created_0xe1a17f47_events
ORDER BY
  1 DESC;