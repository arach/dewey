---
title: Make docs the path to first success
---

# Make docs the path to first success

| Field | Contract |
| --- | --- |
| Outcome | One verified product result; installation and page views are intermediate events. |
| Setup | From product repo: `bun add -d @arach/dewey@0.5.0`; `bunx dewey init --purpose "Deliver verified webhook events" --rule "Never document credentials"`. |
| Author | Replace `docs/quickstart.md` draft with prerequisites, exact supported steps, expected output, recovery, next task. Test in a clean environment and fresh agent session. |
| Review | Finish maps; remove `draft: true`; run `bunx dewey review <document>` for each nonempty `covers` list. |
| Verify | `bunx dewey build`; `bunx dewey check --json`; run the product task separately. |
| Publish | Deploy `.dewey/site/` using existing hosting. Dewey does not deploy. |
| Measure | Track product-side first success per eligible workspace, elapsed time, and incomplete attempts. |
| Boundary | Current loop uses `.dewey/project.json`, not `dewey.config.ts`. Guides do not require agent pairs. Build produces Markdown copies. Check does not execute examples. |
