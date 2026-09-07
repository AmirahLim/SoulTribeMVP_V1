# Onboarding copy refinement

Retains the founder-supplied photographs and existing image-overlay layout. No new generated images are consumed.

Q3 accepts one or two distinct settings: 2 people, 3–4, 5–9, 10+. `groupChoices` preserves both choices privately. Older scalar `group` drafts remain valid. For two choices the legacy scalar matching signal is left unknown, not averaged or arbitrarily taken from the first selection. Full set-based matching is a future engine change; both selections appear in Early Read now.

Q4 clarifies the existing measured fields: desired check-in frequency (expectation, not self behaviour), notice for plans, and opening pace. No reassurance, conflict or response-speed answers are inferred. Existing stored numeric values are unchanged; this copy refinement does not establish a new calibrated frequency scale for historical users.

Apply the additive `20260915000000_baseline_group_choices.sql` after the baseline migration before live account claims. Design preview remains isolated from storage and works without migrations. The original live Supabase release gates still apply.
