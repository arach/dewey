---
kind: guide
title: Run docs-led onboarding experiments
description: Test persona-specific quickstarts and installation instructions against a product success event.
---

# Run docs-led onboarding experiments

**How can I test a shorter onboarding path without rewriting all our docs?**

Change one task for one audience. Keep the success condition constant and use your product's experiment system to assign readers. Dewey 0.5 can scaffold and publish the pages, but it does not assign variants or calculate experiment results.

## Write a testable hypothesis

For example: “For backend developers integrating webhooks, showing a sandbox delivery before production configuration will increase first verified delivery within 24 hours.” This is a proposed experiment, not a reported result.

Define the eligible audience, assignment unit, success event, observation window, and rollback condition before launch. Assign at the workspace level if several developers can work on the same integration. Keep the assignment stable across repeat visits.

## Create task-specific pages

From an initialized repository with Dewey installed locally:

```sh
bunx dewey new guide "Backend quickstart"
bunx dewey new guide "CLI quickstart"
```

These commands create `docs/backend-quickstart.md` and `docs/cli-quickstart.md` as drafts. They are useful persona routes, not an automatic A/B test. Compare variants within a persona rather than interpreting different audiences as a causal result.

Each page should name:

- The reader's starting environment and required permissions.
- The single outcome they will produce.
- The verified commands for that environment.
- The expected result and the most likely recovery actions.
- The next task after success.

On a generated Dewey site, frontmatter controls grouping and ordering:

```yaml
---
kind: guide
title: Backend quickstart
description: Verify one sandbox delivery before configuring production.
group: Start with your environment
order: 1
covers: []
---
```

Keep shared API contracts in a reference page. Link to them instead of maintaining separate copies of the same contract in every variant. Keep enough prerequisites and example context in each task for an agent to execute it without guessing.

## Treat install.md as authored content

The current `init` / `build` loop does not generate a special root `install.md`. The older `generate --install-md` command is frozen; do not make it a new experiment dependency.

For an installation page in the current loop, use:

```sh
bunx dewey new guide "Install"
```

Author `docs/install.md` with the objective, prerequisites, supported installation steps, verification command, expected result, and recovery instructions. Remove the draft flag after testing. `build` publishes its Markdown at `.dewey/site/docs/install.md`, alongside the HTML page.

If an integration requires a root `/install.md` address, configure that alias in your hosting layer and test it. Dewey does not create that alias in this loop. Never pipe a Markdown installation guide into a shell; give the reviewed instructions to the developer or agent.

## Build a consistent variant

After testing the instructions and reviewing any documents that declare source coverage:

```sh
bunx dewey build
bunx dewey check --json
```

Deploy the complete output through your existing hosting workflow. Keep HTML and Markdown URLs on the same revision. An agent handed a page from a different variant can invalidate the intended experiment.

For a page reached only through the experiment, `nav: false` makes it intentionally absent from navigation. It is not an access-control or experiment-isolation mechanism. Use separate deployment URLs if variants must remain separate, and verify every copy and assistant handoff against that deployment.

## Decide what to keep

Use first successful product use as the primary outcome. Treat copy actions, assistant-link clicks, and page depth as diagnostic events. Review setup failures, support requests, and unsafe configurations as guardrails.

Set a sample-size or uncertainty-based decision rule with your experiment owner. Do not stop after the first favorable result. If the variant reduces reading time but lowers successful integrations, reject it.

After selecting a version, update the entry links and remove obsolete instructions from the active path. Dewey supports `superseded_by` with a project-root document path when an old page has a replacement. This removes the replaced page from the agent indexes and adds a replacement link; it is not an HTTP redirect. Configure redirects in your hosting layer if needed.

Next: [Measure time-to-value from docs](/docs/guides/measure-docs-time-to-value).
