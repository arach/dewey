---
kind: guide
title: Make docs the path to first success
description: Define one activation outcome and give developers and their agents a verified route to it.
---

# Make docs the path to first success

**How do I turn a quickstart visit into a developer's first useful result?**

Start with the result, not the installation. For a webhook product, the result might be a test event received by the developer's application. Creating an account or copying a command is progress, but neither proves that integration works.

Dewey 0.5 gives you a place to author that route, publish it for people and agents, and check its references. It does not define activation or measure conversion for you.

## Define the first-success contract

Write these decisions before changing the quickstart:

| Decision | Example for a webhook product |
| --- | --- |
| Starting state | New workspace; no endpoint registered |
| Outcome | Application receives and verifies one test event |
| Evidence | Product records a successful test delivery; application logs the event ID |
| Prerequisites | Supported runtime, sandbox credential, reachable test endpoint |
| Failure recovery | Explain credential scope, endpoint reachability, and signature mismatch |
| Next action | Subscribe to a real event after the test passes |

Use your actual product commands. Do not copy an untested command from a design mockup into the onboarding path. Keep credentials out of the page and use environment-variable placeholders in examples.

## Create the documentation workspace

From your product repository root, install the version used in this guide:

```sh
bun add -d @deweydocs/dewey@0.5.1
bunx dewey init --purpose 'Deliver verified webhook events to applications' --rule 'Never put credentials in documentation'
```

`init` creates the root `AGENTS.md`, `SKILL.md`, draft guides and source maps, `.dewey/project.json`, and a site in `.dewey/site/`. It builds immediately. That first build is not proof that the draft instructions work.

If the repository already uses Dewey's `init` / `build` / `check` loop, edit its existing quickstart instead. This loop does not use `dewey.config.ts`.

## Author one complete task

Replace the scaffold in `docs/quickstart.md`. Use a concrete description so the published page and agent index describe the outcome:

```yaml
---
kind: guide
title: Receive your first test event
description: Send a sandbox event and verify its signature in your application.
covers: []
---
```

Write the page in this order:

1. State the starting directory, runtime version, and required account permissions.
2. Give the shortest supported setup sequence.
3. Show the exact command or UI action that triggers the test event.
4. Show the expected response and the application-side evidence.
5. Give a recovery action for each common failure.
6. Link to the next task only after the success check.

Run the entire sequence in a clean environment. Repeat it with a coding agent that has only the published instructions. Record every extra explanation you have to supply. Put necessary explanations into the guide rather than relying on the test conversation.

A Dewey 0.5 guide does not require a separate agent version: `build` publishes Markdown from the same source. Source maps are a different document kind, used to explain implementation areas.

## Review and publish the result

Finish the source maps created by `init` and remove `draft: true` only after checking their claims. Review each document with a nonempty `covers` list. For a repository whose map is `docs/src.agent.md`:

```sh
bunx dewey review docs/src.agent.md
bunx dewey build
bunx dewey check --json
python3 -m http.server 4387 --bind 127.0.0.1 --directory .dewey/site
```

Use the actual map paths created for your repository. Open `http://127.0.0.1:4387` and complete the quickstart from the rendered page. A passing check means coverage, review records, references, and outputs agree. It does not execute your examples.

Deploy `.dewey/site/` through your existing static hosting workflow. Dewey builds the files; it does not deploy them.

## Judge activation, not page completion

Track the product-side first-success event for new workspaces that enter this onboarding path. Compare the completion rate and elapsed time before and after the change. Keep failed attempts in the denominator.

If developers finish the page but never receive a test event, shorten or repair the integration steps. More page views are not a substitute for successful delivery.

Next: [Measure time-to-value from docs](/docs/guides/measure-docs-time-to-value).
