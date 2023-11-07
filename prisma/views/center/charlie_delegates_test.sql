WITH pre_aggregated AS (
  SELECT
    optimism_transfer_events_mat.block_number,
    optimism_transfer_events_mat."from",
    optimism_transfer_events_mat."to",
    optimism_transfer_events_mat.value,
    optimism_transfer_events_mat.inputs
  FROM
    center.optimism_transfer_events_mat
  WHERE
    (
      (optimism_transfer_events_mat.value) :: numeric > (0) :: numeric
    )
),
token_ownership AS (
  SELECT
    aggregated_values.address,
    sum(aggregated_values.value_adjusted) AS tokens_owned
  FROM
    (
      SELECT
        pre_aggregated."to" AS address,
        (
          (pre_aggregated.value) :: numeric / '1000000000000000000' :: numeric
        ) AS value_adjusted
      FROM
        pre_aggregated
      UNION
      ALL
      SELECT
        pre_aggregated."from" AS address,
        (
          (- (pre_aggregated.value) :: numeric) / '1000000000000000000' :: numeric
        ) AS value_adjusted
      FROM
        pre_aggregated
    ) aggregated_values
  GROUP BY
    aggregated_values.address
),
tokens_represented AS (
  SELECT
    optimism_delegate_votes_changed_events.delegate AS address,
    max(
      (
        (
          optimism_delegate_votes_changed_events.new_balance
        ) :: numeric / '1000000000000000000' :: numeric
      )
    ) AS tokens_represented
  FROM
    center.optimism_delegate_votes_changed_events
  GROUP BY
    optimism_delegate_votes_changed_events.delegate
),
delegator_list AS (
  SELECT
    optimism_delegate_changed_events.to_delegate AS address,
    array_agg(
      DISTINCT optimism_delegate_changed_events.delegator
    ) AS delegators
  FROM
    center.optimism_delegate_changed_events
  GROUP BY
    optimism_delegate_changed_events.to_delegate
),
delegatee_count AS (
  SELECT
    optimism_delegate_changed_events.delegator AS address,
    count(
      DISTINCT optimism_delegate_changed_events.to_delegate
    ) AS delegatees
  FROM
    center.optimism_delegate_changed_events
  GROUP BY
    optimism_delegate_changed_events.delegator
)
SELECT
  COALESCE(toa.address, tra.address, dl.address, dc.address) AS address,
  COALESCE(toa.tokens_owned, (0) :: numeric) AS tokens_owned,
  COALESCE(tra.tokens_represented, (0) :: numeric) AS tokens_represented,
  (
    COALESCE(toa.tokens_owned, (0) :: numeric) + COALESCE(tra.tokens_represented, (0) :: numeric)
  ) AS total_voting_power,
  COALESCE(
    dl.delegators,
    (ARRAY [] :: character varying []) :: text []
  ) AS delegators,
  COALESCE(dc.delegatees, (0) :: bigint) AS delegatees
FROM
  (
    (
      (
        token_ownership toa FULL
        JOIN tokens_represented tra ON ((toa.address = tra.address))
      )
      LEFT JOIN delegator_list dl ON (
        (COALESCE(toa.address, tra.address) = dl.address)
      )
    )
    LEFT JOIN delegatee_count dc ON (
      (COALESCE(toa.address, tra.address) = dc.address)
    )
  )
ORDER BY
  (
    COALESCE(toa.tokens_owned, (0) :: numeric) + COALESCE(tra.tokens_represented, (0) :: numeric)
  ) DESC;