# Prompt Bundle

| Prompt | Source | Raw markdown |
|--------|--------|--------------|
| Prompts Audit Docs | `docs/prompts/audit-docs.md` | /agent/prompts/audit-docs.md |
| Prompts Create Agent Md | `docs/prompts/create-agent-md.md` | /agent/prompts/create-agent-md.md |

---

<!-- source: docs/prompts/audit-docs.md -->

# Prompts Audit Docs

Use this prompt to audit a project's documentation for agent-readiness.

```
Review the documentation in this project for AI-agent readiness:

1. Check for completeness:
   - Does overview.md explain what the project does?
   - Does quickstart.md have working code examples?
   - Is there API documentation?

2. Check for agent-optimized versions:
   - Are there .agent.md files alongside .md files?
   - Do agent versions use structured data (tables, lists) over prose?

3. Check for critical context:
   - Is there an AGENTS.md with entry points and rules?
   - Is there an llms.txt for quick context loading?

4. Check for install.md:
   - Does it follow installmd.org format?
   - Are steps executable as a TODO checklist?

Output a score 0-100 and specific recommendations.
```

---

## Expected Output

A report with:
- Overall score
- Category breakdown
- Specific files to create or improve
- Quick wins for score improvement

---

<!-- source: docs/prompts/create-agent-md.md -->

# Prompts Create Agent Md

Use this prompt to convert human documentation to agent-optimized format.

```
Convert this documentation to agent-optimized format (.agent.md):

Input: [paste human-readable .md content]

Requirements for agent-optimized version:
1. Remove narrative prose - use bullet points and tables
2. Make it self-contained - no "see other page" references
3. Include all parameters, types, and return values
4. Use structured data:
   - Tables for options/parameters
   - Code blocks for examples
   - Lists for steps
5. Front-load critical information
6. Keep it dense but complete

Output the .agent.md content.
```

---

## Example

<div class="doc-file-block">
<div class="doc-file-bar">Human-readable docs</div>

```markdown
The `init` command helps you get started with Dewey. It creates
the necessary configuration files and folder structure. You'll
want to run this first before using other commands.
```

</div>

<div class="doc-file-block">
<div class="doc-file-bar">Agent-optimized output</div>

```markdown
## init

| Aspect | Value |
|--------|-------|
| Purpose | Create config and folder structure |
| Run when | First time setup |
| Creates | dewey.config.ts, docs/ |
| Prereqs | None |
```

</div>

<!-- dewey:generated owner=dewey -->
