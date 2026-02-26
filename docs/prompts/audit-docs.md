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
