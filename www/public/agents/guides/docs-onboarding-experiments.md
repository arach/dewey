---
title: Run docs-led onboarding experiments
---

# Run docs-led onboarding experiments

| Field | Contract |
| --- | --- |
| Prerequisite | Dewey 0.5 locally installed; initialized repo; own experiment assignment system. |
| Hypothesis | Example only: sandbox-first setup increases first verified delivery within 24 hours for backend developers. |
| Design | Define eligible persona, stable workspace assignment, same success event, observation window, guardrails, rollback, decision rule. Persona differences are not an A/B test. |
| Create | `bunx dewey new guide "Backend quickstart"`; `bunx dewey new guide "CLI quickstart"`. Author verified steps, expected results, recovery; remove drafts. `group` and numeric `order` control generated-site navigation. |
| Installation | `bunx dewey new guide "Install"` creates `docs/install.md`. Author objective, prerequisites, steps, success check, recovery. Build publishes `.dewey/site/docs/install.md`. Root `/install.md` alias requires hosting configuration. |
| Legacy boundary | Current init/build does not generate special root install.md. Frozen `generate --install-md` is not part of this workflow. Never execute Markdown through a shell. |
| Ship | Review covered docs; `bunx dewey build`; `bunx dewey check --json`; deploy complete output with consistent HTML/Markdown variants. |
| Isolation | `nav: false` hides navigation only; not access control or experiment isolation. Use separate deployment URLs when needed; verify handoffs. |
| Decision | Primary metric: first successful product use. Clicks are diagnostic. Apply preset decision rule and safety/support guardrails. |
| Retire | `superseded_by` takes a project-root document path. Replaced page leaves indexes and links to replacement; hosting must implement any HTTP redirect. |
