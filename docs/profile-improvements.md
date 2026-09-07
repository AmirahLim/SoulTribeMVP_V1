# Profile improvements

The self-profile used a dark glass layout, buried the summary below several visuals, and showed role-like labels that the current brief rejects. Identity edits also closed the form before the database acknowledged the update.

## Changes

- Place the Social Signature immediately after identity and actions, with native keyboard-accessible disclosure for supported synthesis sections.
- Use warm light backgrounds, forest text, sage, lilac and sand section colours. Preserve the existing data-driven thread, interest, value and outing visuals.
- Remove self-profile participation-based Standing and Social Instinct role presentation; retain legacy storage and API identities.
- Label self advice “How you connect”; reserve Connection Notes for the existing pair experience.
- Separate profile identity editing from the baseline-answer link. Use a native modal dialog, associated field labels, pending state and visible save errors.
- Require an acknowledged database row before updating local identity, the visible portrait or closing the editor. Reject empty names and zero-row saves.

## Branch ancestry and scope

`codex/profile-improvements` builds on local `fcd8560`, including `222d434` from the earlier engineering-foundations work. GitHub main was still the assessed `aba4554` revision. A PR against main therefore includes those earlier security, persistence and outing changes; consult `docs/engineering-implementation.md` for required migrations and staging gates.

This increment updates the You profile and its shared presentation components. It does not claim a complete reproduction of every attached screen, a new public member-profile data projection, or a new matching methodology. Current product direction takes precedence over historical dark HTML exports.

## Validation

- TypeScript passes.
- Core and web tests pass (271 total), including denied and zero-row saves, empty-name validation, acknowledged identity updates and unsupported synthesis exclusion.
- Database checks pass for all committed migrations and consent/privacy boundaries.
- Browser QA is blocked: the cloud browser reports `ERR_BLOCKED_BY_CLIENT` for the local preview. Responsive appearance, keyboard interactions and authenticated staging flows remain release checks.
- GitHub integration rejected remote branch creation with `403: Resource not accessible by integration`. No PR has been created or merged.
