 'use client'
import type { MouseEvent, KeyboardEvent } from 'react'
import '@/app/landing-minimal.css'
const commands: Record<string,string> = {bun:'bun add -d @deweydocs/dewey',npm:'npm install -D @deweydocs/dewey',pnpm:'pnpm add -D @deweydocs/dewey',yarn:'yarn add -D @deweydocs/dewey'}
function selectTab(tab: HTMLElement) {
 const group=tab.closest('[role="tablist"]')!;
 group.querySelectorAll<HTMLElement>('[role="tab"]').forEach(t=>{
 const on=t===tab; t.setAttribute('aria-selected',String(on)); t.tabIndex=on?0:-1;
 const id=t.getAttribute('aria-controls'); if(id) {const pane=document.getElementById(id);if(pane)pane.hidden=!on;}
 });
 const pkg=tab.dataset.pkg;if(pkg){const cmd=tab.closest('[data-install]')?.querySelector('[data-cmd]');if(cmd)cmd.textContent=commands[pkg];}
}
async function click(e: MouseEvent<HTMLDivElement>) {
 const target=(e.target as Element).closest<HTMLElement>('button,[role="tab"]');if(!target)return;
 if(target.getAttribute('role')==='tab'){selectTab(target);return;}
 const text=target.dataset.copyText ?? (target.hasAttribute('data-copy')?target.closest('[data-install]')?.querySelector('[data-cmd]')?.textContent:null);
 if(!text)return;const label=target.textContent;
 try{await navigator.clipboard.writeText(text);target.textContent='Copied';}catch{target.textContent='Select & copy';}
 setTimeout(()=>{target.textContent=label},1800);
}
function keydown(e: KeyboardEvent<HTMLDivElement>) {
 const tab=e.target as HTMLElement;if(tab.getAttribute('role')!=='tab'||!['ArrowLeft','ArrowRight'].includes(e.key))return;
 e.preventDefault();const tabs=Array.from(tab.parentElement!.querySelectorAll<HTMLElement>('[role="tab"]'));
 const next=tabs[(tabs.indexOf(tab)+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];selectTab(next);next.focus();
}
export function MinimalLandingPage(){return <div className="dewey-home" onClick={click} onKeyDown={keydown}>
<header className="top">
<div className="wrap">
<a href="/" aria-label="dewey, home"><span className="ink-art wordmark" role="img" aria-label="dewey"></span></a>
<nav aria-label="Primary">
<a href="/docs">{"Docs"}</a>
<a className="hide-sm" href="/docs/cli">{"CLI"}</a>
<a className="hide-sm" href="#agents-title">{"For agents"}</a>
<a href="https://github.com/arach/dewey">{"GitHub"}</a>
<a className="cta" href="/docs/quickstart">{"Quickstart"}</a>
</nav>
</div>
</header>
<main>
<section className="wrap hero" aria-labelledby="hero-title">
<div>
<p className="kicker"><span className="label">{"Docs agent"}</span><span>{"preparation \u00b7 judgment \u00b7 agent-ready artifacts"}</span></p>
<h1 id="hero-title">{"Docs prepared for whoever reads "}<em>{"next."}</em></h1>
<p className="lede">{"Dewey audits, scores and generates agent-ready documentation from the markdown you already keep. Humans get the prose, agents get the structure. Publishing a site is optional."}</p>
<div className="install" data-install>
<div role="tablist" aria-label="Package manager">
<button type="button" role="tab" data-pkg="bun" aria-selected="true">{"bun"}</button>
<button type="button" role="tab" data-pkg="npm" aria-selected="false" tabIndex={-1}>{"npm"}</button>
<button type="button" role="tab" data-pkg="pnpm" aria-selected="false" tabIndex={-1}>{"pnpm"}</button>
<button type="button" role="tab" data-pkg="yarn" aria-selected="false" tabIndex={-1}>{"yarn"}</button>
</div>
<div className="install-row"><code data-cmd>{"bun add -d @deweydocs/dewey"}</code><button type="button" data-copy>{"Copy"}</button></div>
</div>
<div className="actions">
<a className="btn primary" href="/docs/quickstart">{"Read the quickstart "}<span aria-hidden="true">{"\u2192"}</span></a>
<a className="btn secondary" href="https://github.com/arach/dewey">{"View source"}</a>
</div>
</div>
<figure className="stack" aria-label="A session with Dewey, written on an index card">
<div className="front">
<div className="front-head"><b>{"~/my-project"}</b><span>{"Today\u2019s session"}</span></div>
<ol className="log">
<li className="cmd">{"bunx dewey init"}</li>
<li className="out">{"\u2192 docs/overview.md, dewey.config.ts"}</li>
<li className="cmd">{"bunx dewey generate"}</li>
<li className="out">{"\u2192 AGENTS.md \u00b7 llms.txt \u00b7 install.md"}</li>
<li className="cmd">{"bunx dewey agent"}</li>
<li className="out">{"\u2713 paired pages \u00b7 \u2713 cited paths"}</li>
<li className="gap" aria-hidden="true"></li>
</ol>
<div className="stamp" aria-label="Example stamp: score 92 out of 100, grade A"><b>{"92 \u00b7 A"}</b>{"Agent ready"}</div>
</div>
<figcaption>{"Example session. Score is illustrative."}</figcaption>
</figure>
</section>
<div className="wrap">
<div className="facts">
<div><b>{"5"}</b><span>{"agent artifacts per run"}</span></div>
<div><b>{"0\u2013100"}</b><span>{"agent-readiness score"}</span></div>
<div><b>{"6"}</b><span>{"project types"}</span></div>
<div><b>{"5"}</b><span>{"built-in skills"}</span></div>
</div>
</div>
<section className="wrap sec" aria-labelledby="flow-title">
<div className="sec-head">
<div><span className="label">{"Sequence"}</span><h2 id="flow-title">{"One drawer per project. Every card filed."}</h2></div>
<p>{"From an empty folder to scored, agent-ready docs. The files "}<code>{"generate"}</code>{" writes are the contract; files Dewey does not own are left alone."}</p>
</div>
<div className="catalog">
<figure className="plate">
<svg className="ln" viewBox="0 0 260 230" role="img" aria-label="Line drawing of a six-drawer card catalogue with one drawer pulled open"><use href="/brand/library-lines.svg#cabinet" /></svg>
<figcaption><span>{"Fig. 1 \u00b7 Card catalogue"}</span><span>{"dewey.config.ts"}</span></figcaption>
</figure>
<ol className="steps">
<li><h3>{"Initialise"}</h3><p>{"Docs folder and config, shaped by project type."}</p><code>{"dewey init"}</code></li>
<li><h3>{"Author"}</h3><p>{"Paired pages: prose for people, structure for agents."}</p><code>{"*.md + *.agent.md"}</code></li>
<li><h3>{"Generate"}</h3><p>{"Agent context, index, manifest, install guide."}</p><code>{"dewey generate"}</code></li>
<li><h3>{"Audit and score"}</h3><p>{"Completeness checks, then a 0\u2013100 score."}</p><code>{"dewey agent"}</code></li>
<li className="opt"><h3>{"Publish "}<span className="tag">{"\u00b7 optional"}</span></h3><p>{"Embed in React or Next.js, or create a static site."}</p><code>{"dewey create"}</code></li>
</ol>
</div>
</section>
<section className="wrap sec" aria-labelledby="doc-title">
<div className="sec-head">
<div><span className="label">{"Document"}</span><h2 id="doc-title">{"One page, two readers."}</h2></div>
<p>{"Each page is a pair. The human file explains; the agent file states requirements, commands and values. Dewey checks the two stay in step."}</p>
</div>
<article className="doc" data-views aria-label="Example documentation card: Quickstart">
<div className="doc-bar">
<span className="crumb">{"docs / "}<b>{"quickstart"}</b></span>
<div className="seg" role="tablist" aria-label="Page version">
<button type="button" role="tab" id="tab-human" aria-controls="pane-human" aria-selected="true">{".md"}</button>
<button type="button" role="tab" id="tab-agent" aria-controls="pane-agent" aria-selected="false" tabIndex={-1}>{".agent.md"}</button>
</div>
</div>
<div className="doc-body">
<div>
<div className="pane" id="pane-human" role="tabpanel" aria-labelledby="tab-human" tabIndex={0}>
<h3 id="q-start">{"Quickstart"}</h3>
<p>{"Get your documentation agent-ready in under five minutes. Install the CLI, create a docs folder, then generate the files your agents read first."}</p>
<ol>
<li id="q-install">{"Install Dewey as a dev dependency."}</li>
<li id="q-init">{"Choose a project type so the scaffold matches what you ship."}</li>
<li id="q-verify">{"Generate, then check the report."}</li>
</ol>
<pre className="snippet">{"bun add -d @deweydocs/dewey\nbunx dewey init --type npm-package\nbunx dewey generate\nbunx dewey agent   "}<span className="c">{"# Agent Readiness Report"}</span></pre>
</div>
<div className="pane" id="pane-agent" role="tabpanel" aria-labelledby="tab-agent" tabIndex={0} hidden>
<p className="kv-title">{"quickstart.agent.md"}</p>
<table>
<tr><th>{"requires"}</th><td>{"node \u2265 18, bun \u2265 1.3"}</td></tr>
<tr><th>{"install"}</th><td>{"bun add -d @deweydocs/dewey"}</td></tr>
<tr><th>{"init"}</th><td>{"bunx dewey init --type <type>"}</td></tr>
<tr><th>{"types"}</th><td>{"generic | npm-package | cli-tool | react-library | macos-app | monorepo"}</td></tr>
<tr><th>{"generate"}</th><td>{"bunx dewey generate"}</td></tr>
<tr><th>{"done when"}</th><td>{"bunx dewey agent returns Agent Readiness Report with score"}</td></tr>
</table>
</div>
</div>
<aside className="doc-side" aria-label="Page details">
<div>
<h4>{"On this page"}</h4>
<ul className="toc">
<li><a href="#q-install">{"Install"}</a></li>
<li><a href="#q-init">{"Choose a project type"}</a></li>
<li><a href="#q-verify">{"Generate and verify"}</a></li>
</ul>
</div>
<div>
<h4>{"Pair"}</h4>
<ul className="files">
<li>{"quickstart.md "}<span className="ok" aria-label="present">{"\u2713"}</span></li>
<li>{"quickstart.agent.md "}<span className="ok" aria-label="present">{"\u2713"}</span></li>
<li>{"/agents/quickstart.md "}<span>{"served"}</span></li>
</ul>
</div>
</aside>
</div>
<div className="doc-foot">
<span>{"read order 2 of 3 \u00b7 overview \u2192 quickstart \u2192 api"}</span>
<span className="x">
<button type="button" data-copy-text="https://deweydocs.com/agents/quickstart.md" aria-label="Copy agent URL for quickstart">{"Copy agent URL"}</button>
<a href="/docs/quickstart">{"Open page"}</a>
</span>
</div>
</article>
</section>
<section className="wrap sec" aria-labelledby="out-title">
<div className="sec-head">
<div><span className="label">{"Output"}</span><h2 id="out-title">{"Files agents read first."}</h2></div>
<p>{"Retrieval indexes come from one manifest. Full content lives in purpose-built surfaces, not cloned into every file."}</p>
</div>
<div className="output">
<pre className="tree" aria-label="Generated files"><span className="dim">{"my-project/"}</span>{"\n\u251c\u2500 "}<span className="new">{"AGENTS.md"}</span>{"\n\u251c\u2500 "}<span className="new">{"llms.txt"}</span>{"\n\u251c\u2500 "}<span className="new">{"install.md"}</span>{"\n\u251c\u2500 dewey.config.ts\n\u2514\u2500 docs/\n   \u251c\u2500 overview.md\n   \u251c\u2500 overview.agent.md\n   \u251c\u2500 "}<span className="new">{"docs.json"}</span>{"\n   \u2514\u2500 "}<span className="new">{"agent/"}</span>
<span className="dim">{"raw \u00b7 prompts \u00b7 bundles"}</span></pre>
<dl className="out-list">
<div><dt>{"AGENTS.md"}</dt><dd>{"Critical context, entry points and navigation rules for coding assistants."}</dd></div>
<div><dt>{"llms.txt"}</dt><dd>{"Plain text following the llms.txt convention."}</dd></div>
<div><dt>{"install.md"}</dt><dd>{"An LLM-executable install guide, per installmd.org."}</dd></div>
<div><dt>{"docs.json"}</dt><dd>{"The manifest every retrieval index derives from."}</dd></div>
<div className="wide"><dt>{"agent/"}</dt><dd>{"Recursive raw markdown, prompt registries and context bundles for retrieval."}</dd></div>
</dl>
</div>
</section>
<section className="wrap sec agent-entry" aria-labelledby="agents-title">
<div className="sec-head">
<div><span className="label">{"Agent entry"}</span><h2 id="agents-title">{"Where agents start reading."}</h2></div>
<p>{"Static files at the site root. Point an agent at "}<code>{"/llms.txt"}</code>{" or "}<code>{"/agent/manifest.json"}</code>{"; everything else is linked from there."}</p>
</div>
<div className="ae" role="region" aria-label="Agent entry points for deweydocs.com">
<div className="ae-meta"><span>{"host "}<b>{"deweydocs.com"}</b></span><span>{"schemaVersion "}<b>{"1"}</b></span><span>{"lifecycle "}<b>{"regenerate"}</b></span><span>{"registry "}<b>{"/.dewey-generated.json"}</b></span></div>
<ul>
<li><span className="p">{"/llms.txt"}</span><span className="t">{"text"}</span><span className="s">{"\u2014"}</span><span className="w">{"Plain-text index of every page. Alias: /lm.txt."}</span><span className="x"><button type="button" data-copy-text="https://deweydocs.com/llms.txt" aria-label="Copy URL for /llms.txt">{"Copy URL"}</button><a href="/llms.txt" aria-label="Open /llms.txt">{"Open"}</a></span></li>
<li><span className="p">{"/AGENTS.md"}</span><span className="t">{"md"}</span><span className="s">{"\u2014"}</span><span className="w">{"Full agent context with every agent page inline."}</span><span className="x"><button type="button" data-copy-text="https://deweydocs.com/AGENTS.md" aria-label="Copy URL for /AGENTS.md">{"Copy URL"}</button><a href="/AGENTS.md" aria-label="Open /AGENTS.md">{"Open"}</a></span></li>
<li><span className="p">{"/install.md"}</span><span className="t">{"md"}</span><span className="s">{"\u2014"}</span><span className="w">{"Executable install guide for an agent to follow."}</span><span className="x"><button type="button" data-copy-text="https://deweydocs.com/install.md" aria-label="Copy URL for /install.md">{"Copy URL"}</button><a href="/install.md" aria-label="Open /install.md">{"Open"}</a></span></li>
<li><span className="p">{"/agent/manifest.json"}</span><span className="t">{"json"}</span><span className="s">{"\u2014"}</span><span className="w">{"Discovery index for docs, prompts and bundles."}</span><span className="x"><button type="button" data-copy-text="https://deweydocs.com/agent/manifest.json" aria-label="Copy URL for /agent/manifest.json">{"Copy URL"}</button><a href="/agent/manifest.json" aria-label="Open /agent/manifest.json">{"Open"}</a></span></li>
<li><span className="p">{"/agent/docs.json"}</span><span className="t">{"json"}</span><span className="s">{"\u2014"}</span><span className="w">{"Structured docs manifest with markdown bodies."}</span><span className="x"><button type="button" data-copy-text="https://deweydocs.com/agent/docs.json" aria-label="Copy URL for /agent/docs.json">{"Copy URL"}</button><a href="/agent/docs.json" aria-label="Open /agent/docs.json">{"Open"}</a></span></li>
<li><span className="p">{"/agent/bundles/core.md"}</span><span className="t">{"md"}</span><span className="s">{"\u2014"}</span><span className="w">{"Core context bundle. Full set: /agent/bundles/all.md."}</span><span className="x"><button type="button" data-copy-text="https://deweydocs.com/agent/bundles/core.md" aria-label="Copy URL for /agent/bundles/core.md">{"Copy URL"}</button><a href="/agent/bundles/core.md" aria-label="Open /agent/bundles/core.md">{"Open"}</a></span></li>
<li><span className="p">{"/agents/"}<i>{"{slug}"}</i>{".md"}</span><span className="t">{"md"}</span><span className="s">{"\u2014"}</span><span className="w">{"Agent pages. Read order: "}<a href="/agents/overview.md">{"overview"}</a>{", "}<a href="/agents/quickstart.md">{"quickstart"}</a>{", "}<a href="/agents/api.md">{"api"}</a>{"."}</span><span className="x"></span></li>
</ul>
<div className="ae-foot"><span>{"Written by "}<code>{"bunx dewey generate"}</code>{"."}</span><a href="/agents">{"Agent index \u2192"}</a></div>
</div>
</section>
<section className="wrap sec" aria-labelledby="score-title">
<div className="sec-head">
<div><span className="label">{"Judgment"}</span><h2 id="score-title">{"A score you can act on."}</h2></div>
<p>{"Audit and agent checks are evidence-based. They report drift between source, human pages and agent pages, with recommendations."}</p>
</div>
<div className="ticket">
<div className="stub">
<small><span>{"bunx dewey agent"}</span><i>{"Illustrative"}</i></small>
<div className="n"><b>{"92"}</b><span>{"/ 100"}</span></div>
<span className="label grade">{"Grade A"}</span>
<div className="meter" aria-hidden="true"><i></i></div>
<p>{"Example output, not a measured result. Checks support semantic review; they do not replace it."}</p>
</div>
<ul>
<li><span className="ok" aria-label="Pass">{"\u2713"}</span><div><b>{"AGENTS.md and llms.txt present"}</b><span>{"Generated artifacts are up to date."}</span></div><code>{"generate"}</code></li>
<li><span className="ok" aria-label="Pass">{"\u2713"}</span><div><b>{"Paired-file coverage"}</b><span>{"Every human page has an agent page."}</span></div><code>{"audit"}</code></li>
<li><span className="ok" aria-label="Pass">{"\u2713"}</span><div><b>{"Cited paths resolve"}</b><span>{"Paths named in docs exist in the repo."}</span></div><code>{"agent"}</code></li>
<li><span className="warn" aria-label="Recommendation">{"!"}</span><div><b>{"Literal contract drift"}</b><span>{"An enum value in source is missing from the docs."}</span></div><code>{"agent"}</code></li>
</ul>
</div>
</section>
<section className="wrap sec" aria-labelledby="desk-title">
<div className="sec-head">
<div><span className="label">{"Desk"}</span><h2 id="desk-title">{"The rest of the toolkit."}</h2></div>
<p>{"Built-in skills: "}<code>{"docsReviewAgent"}</code>{", "}<code>{"docsDesignCritic"}</code>{", "}<code>{"installMdGenerator"}</code>{", "}<code>{"promptSlideoutGenerator"}</code>{", "}<code>{"improveAIPrompts"}</code>{"."}</p>
</div>
<div className="supplies">
<figure><svg className="ln" viewBox="0 0 260 170" aria-hidden="true" focusable="false"><use href="/brand/library-lines.svg#tray" /></svg><figcaption><b>{"Review"}</b>{"Page-by-page review that checks docs against the code to catch drift. "}<span>{"docsReviewAgent"}</span></figcaption></figure>
<figure><svg className="ln" viewBox="0 0 240 180" aria-hidden="true" focusable="false"><use href="/brand/library-lines.svg#bookend" /></svg><figcaption><b>{"Install guides"}</b>{"An install.md an agent can follow to the end. "}<span>{"installMdGenerator"}</span></figcaption></figure>
<figure><svg className="ln" viewBox="0 0 240 200" aria-hidden="true" focusable="false"><use href="/brand/library-lines.svg#dater" /></svg><figcaption><b>{"Regenerate"}</b>{"Generated files are recorded and refreshed; yours are preserved. "}<span>{"dewey generate"}</span></figcaption></figure>
<figure><svg className="ln" viewBox="0 0 200 120" aria-hidden="true" focusable="false"><use href="/brand/library-lines.svg#holder" /></svg><figcaption><b>{"Publish, optionally"}</b>{"Embed in React or Next.js, or create a static site. "}<span>{"dewey create"}</span></figcaption></figure>
</div>
<div className="close">
<div>
<h2 id="close-title">{"Agent-ready docs in minutes."}</h2>
<p>{"Install, initialise, generate. Then let the score tell you what is missing."}</p>
<div className="actions">
<a className="btn primary" href="/docs/quickstart">{"Read the quickstart "}<span aria-hidden="true">{"\u2192"}</span></a>
<a className="btn secondary" href="/docs">{"All docs"}</a>
</div>
</div>
<span className="ink-art art-cards" aria-hidden="true"></span>
</div>
</section>
</main>
<footer>
<div className="wrap">
<span>{"Named after the Dewey Decimal System. Made by "}<a href="https://github.com/arach">{"@arach"}</a>{"."}</span>
<nav aria-label="Footer">
<a href="/docs">{"Docs"}</a>
<a href="/contact">{"Contact"}</a>
<a href="https://www.npmjs.com/package/@deweydocs/dewey">{"npm"}</a>
<a href="https://github.com/arach/dewey">{"GitHub"}</a>
</nav>
</div>
</footer>

</div>}
