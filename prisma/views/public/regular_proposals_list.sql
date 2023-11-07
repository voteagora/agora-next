SELECT
  pr.proposal_id,
  pr.description,
  pr.start_block,
  pr.end_block,
  json_build_object(
    'for',
    stats."for",
    'against',
    stats.against,
    'abstain',
    stats.abstain
  ) AS proposal_data
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
  );