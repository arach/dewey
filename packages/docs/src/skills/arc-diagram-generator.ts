/**
 * Arc Diagram Generator
 *
 * Dewey emits `agent/diagram.json` — a valid ArcDiagramData scaffold of the
 * docs topology (one node per page, connectors following read order).
 *
 * This skill is the semantic layer on top: it instructs an agent to read the
 * generated artifacts and produce a true *architecture* diagram in Arc's
 * format — system components, services, and data flow — not just a map of
 * the documentation.
 *
 * Output is ArcDiagramData JSON, validatable with `validate_diagram`
 * (Arc MCP) or `validateDiagramShape()` from @arach/arc.
 *
 * @example
 * import { arcDiagramGenerator } from '@arach/dewey'
 *
 * const prompt = arcDiagramGenerator.generate
 *   .replace('{DOCS_CONTEXT}', contextMarkdown)
 *   .replace('{SCAFFOLD}', diagramJson)
 */

export interface ArcDiagramSkillConfig {
  /** Raw markdown from agent/context.md or a page .agent.md */
  docsContext: string
  /** Existing scaffold from agent/diagram.json, if present */
  scaffold?: string
}

export const arcDiagramGenerator = {
  /**
   * What the Arc diagram output is for
   */
  purpose: `Dewey prepares agent-ready documentation artifacts, including an ArcDiagramData scaffold at agent/diagram.json. This skill turns that scaffold (plus the docs context) into a real architecture diagram for Arc — the diagram editor and MCP toolchain that renders, validates, and lays out ArcDiagramData. The result drops directly into the Arc editor or render pipeline.`,

  /**
   * The ArcDiagramData contract the output must satisfy
   */
  structure: {
    layout: '{ width, height } canvas in px — 1600x900 for editor, smaller for embeds',
    nodes: 'Record<id, { x, y, size }> — sizes are xs/s/m/l only (80x36, 110x48, 160x75, 220x90)',
    nodeData: 'Record<id, { icon, name, subtitle?, description?, color }> — every nodes key needs an entry',
    connectors: '{ from, to, fromAnchor, toAnchor, style }[] — anchors: top|bottom|left|right|topLeft|topRight|bottomLeft|bottomRight; optional curve: natural|step',
    connectorStyles: 'Record<style, { color, strokeWidth, label?, dashed? }> — every connector style key needs a style entry',
    validColors: 'violet emerald blue amber sky zinc rose orange',
    iconHints: 'Monitor Server Smartphone Cloud Cpu Database HardDrive Globe User Users Lock Shield Code Terminal FileCode Folder Zap Activity Layers Grid Box Package Settings Search',
  },

  /**
   * Generate an ArcDiagramData architecture diagram from Dewey artifacts
   */
  generate: `Produce an Arc architecture diagram (ArcDiagramData JSON) for this project.

**Documentation context (from Dewey artifacts):**
{DOCS_CONTEXT}

**Existing scaffold (from agent/diagram.json, may be a docs-topology map):**
{SCAFFOLD}

**Instructions:**

1. **Identify the architecture** — extract the real system components from the docs: entry points, packages, services, stores, and external systems. If the scaffold only shows doc pages, REPLACE its nodes with architecture components. If it already has components, refine them.

2. **Emit valid ArcDiagramData** — a single JSON object with exactly these keys:
   - layout: { width, height } — size the canvas to the node count (e.g. 1200x600 for ~8 nodes)
   - nodes: id -> { x, y, size } — sizes only xs|s|m|l; grid-align to ~50px, 150-200px between connected nodes, left-to-right or top-to-bottom flow
   - nodeData: id -> { icon, name, subtitle, description, color } — icon from the Lucide set below, color from the palette below
   - connectors: { from, to, fromAnchor, toAnchor, style } — anchors: top bottom left right topLeft topRight bottomLeft bottomRight; use a style key that exists in connectorStyles
   - connectorStyles: style -> { color, strokeWidth, label?, dashed? } — label connectors with the protocol/relationship (HTTP, SQL, reads, publishes)

3. **Constraints — never violate:**
   - Every key in nodes MUST have a nodeData entry, and vice versa
   - size must be xs, s, m, or l — never 'small'/'medium'/'large'
   - Colors only: violet emerald blue amber sky zinc rose orange
   - Icons only from: Monitor Server Smartphone Watch Cloud Cpu Database HardDrive Wifi Globe User Users Lock Key Shield Mic Camera Speaker Headphones Code Terminal FileCode Folder Zap Activity BarChart PieChart ArrowRight ArrowDown RefreshCw Repeat Box Package Layers Grid Settings Bell Mail MessageSquare Search Filter Download Upload Play Pause Square Circle

4. **Quality bar:**
   - Prefer real component names from the docs over generic ones
   - Use 'l' nodes for primary entry points, 's'/'xs' for satellites
   - dashed: true for async/event flows
   - Keep labels short (component name, tech in subtitle)

**Return ONLY the JSON object, no prose.** Validate mentally before output: every node positioned, every nodeData present, every connector endpoint a real node id.`,

  /**
   * Review an ArcDiagramData draft before handoff
   */
  review: `Review this ArcDiagramData JSON against Arc's contract.

**Diagram:**
{DIAGRAM}

**Checklist (report pass/fail per item):**

1. **Shape** — exactly these top-level keys: layout, nodes, nodeData, connectors, connectorStyles
2. **Node/data parity** — every nodes key has a nodeData entry and vice versa; no orphan ids
3. **Sizes** — every node.size in {xs, s, m, l}
4. **Colors** — every nodeData.color and connectorStyles color in the palette: violet emerald blue amber sky zinc rose orange
5. **Icons** — every nodeData.icon is a Lucide name from the supported set
6. **Connectors** — every from/to references an existing node id; every style key exists in connectorStyles; anchors valid
7. **Legibility** — no overlapping nodes (m=160x75, l=220x90); connectors flow one direction

**Return:** FAIL items with the offending ids, or PASS with a one-line summary.`,
}

export default arcDiagramGenerator
