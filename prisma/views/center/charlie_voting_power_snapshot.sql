WITH ranked_balance_events AS (
  SELECT
    pc.proposal_id,
    dvc.delegate,
    dvc.new_balance,
    row_number() OVER (
      PARTITION BY pc.proposal_id,
      dvc.delegate
      ORDER BY
        dvc.block_number DESC
    ) AS rn
  FROM
    (
      center.optimism_proposal_created_0x7d84a626_events pc
      JOIN center.optimism_delegate_votes_changed_events dvc ON ((pc.block_number >= dvc.block_number))
    )
  WHERE
    ((dvc.new_balance) :: numeric > (0) :: numeric)
)
SELECT
  rbe.proposal_id,
  rbe.delegate AS address,
  (rbe.new_balance) :: numeric AS voting_power
FROM
  ranked_balance_events rbe
WHERE
  (rbe.rn = 1)
ORDER BY
  rbe.proposal_id,
  rbe.delegate;