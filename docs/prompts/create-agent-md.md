# Create Agent-Optimized Documentation

Use this prompt to convert human documentation to agent-optimized format.

## Prompt

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

## Example Transformation

Human version:
```markdown
The `init` command helps you get started with Dewey. It creates
the necessary configuration files and folder structure. You'll
want to run this first before using other commands.
```

Agent version:
```markdown
## init

| Aspect | Value |
|--------|-------|
| Purpose | Create config and folder structure |
| Run when | First time setup |
| Creates | dewey.config.ts, docs/ |
| Prereqs | None |
```
