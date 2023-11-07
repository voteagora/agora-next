SELECT
  (
    jsonb_array_elements_text(
      jsonb_array_elements(
        (
          center_decode_abi(
            '["uint256[]"]' :: jsonb,
            optimism_vote_cast_with_params_events.params
          )
        ) :: jsonb
      )
    )
  ) :: integer AS param,
  optimism_vote_cast_with_params_events.weight,
  optimism_vote_cast_with_params_events.proposal_id
FROM
  center.optimism_vote_cast_with_params_events;