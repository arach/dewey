 'use client'
import type { MouseEvent, KeyboardEvent } from 'react'
import '@/app/landing-minimal.css'
const commands: Record<string,string> = {bun:'bun add -d @arach/dewey',npm:'npm install -D @arach/dewey',pnpm:'pnpm add -D @arach/dewey',yarn:'yarn add -D @arach/dewey'}
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
<p className="kicker"><span className="label">{"Docs agent"}</span><span>{"init \u00b7 build \u00b7 check"}</span></p>
<h1 id="hero-title">{"Docs prepared for whoever reads "}<em>{"next."}</em></h1>
<p className="lede">{"Dewey keeps your Markdown docs, AGENTS.md and llms.txt in step with the code, and builds a static docs site from the same files. People get the pages; agents get the front door, the maps and the index."}</p>
<div className="install" data-install>
<div role="tablist" aria-label="Package manager">
<button type="button" role="tab" data-pkg="bun" aria-selected="true">{"bun"}</button>
<button type="button" role="tab" data-pkg="npm" aria-selected="false" tabIndex={-1}>{"npm"}</button>
<button type="button" role="tab" data-pkg="pnpm" aria-selected="false" tabIndex={-1}>{"pnpm"}</button>
<button type="button" role="tab" data-pkg="yarn" aria-selected="false" tabIndex={-1}>{"yarn"}</button>
</div>
<div className="install-row"><code data-cmd>{"bun add -d @arach/dewey"}</code><button type="button" data-copy>{"Copy"}</button></div>
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
<li className="out">{"\u2192 AGENTS.md \u00b7 SKILL.md \u00b7 draft guide and maps"}</li>
<li className="cmd">{"bunx dewey build"}</li>
<li className="out">{"\u2192 .dewey/site \u00b7 llms.txt \u00b7 llms-full.txt"}</li>
<li className="cmd">{"bunx dewey check"}</li>
<li className="out">{"\u2713 references \u00b7 coverage \u00b7 reviews \u00b7 outputs"}</li>
<li className="gap" aria-hidden="true"></li>
</ol>
<div className="stamp" aria-label="Example stamp: check passed with 0 issues"><b>{"0 issues"}</b>{"Check passed"}</div>
</div>
<figcaption>{"Example session, after the drafts were finished and reviewed."}</figcaption>
</figure>
</section>
<div className="wrap">
<div className="facts">
<div><b>{"7"}</b><span>{"commands"}</span></div>
<div><b>{"4"}</b><span>{"kinds of doc"}</span></div>
<div><b>{"150"}</b><span>{"line front-door budget"}</span></div>
<div><b>{"6"}</b><span>{"site skins"}</span></div>
</div>
</div>
<section className="wrap sec" aria-labelledby="flow-title">
<div className="sec-head">
<div><span className="label">{"Sequence"}</span><h2 id="flow-title">{"One drawer per project. Every card filed."}</h2></div>
<p>{"From an empty folder to docs that pass "}<code>{"check"}</code>{". Dewey writes its own files and the marked regions of AGENTS.md and llms.txt; everything else is left alone."}</p>
</div>
<div className="catalog">
<figure className="plate" tabIndex={0}>
<svg className="ln" viewBox="0 0 260 230" role="img" aria-label="Line drawing of a six-drawer card catalogue with one drawer pulled open"><use href="/brand/library-lines.svg#cabinet" /></svg>
<figcaption><span>{"Fig. 1 \u00b7 Card catalogue"}</span><span>{".dewey/project.json"}</span></figcaption>
</figure>
<ol className="steps">
<li><h3>{"Initialise"}</h3><p>{"Front door, skills, settings, a draft guide and a draft map per source area."}</p><code>{"dewey init"}</code></li>
<li><h3>{"Author"}</h3><p>{"Guides and references for people; maps of the source for agents."}</p><code>{"*.md + *.agent.md"}</code></li>
<li><h3>{"Review"}</h3><p>{"Record that each map was checked against the code."}</p><code>{"dewey review"}</code></li>
<li><h3>{"Build"}</h3><p>{"Static site, .md copies, llms.txt and llms-full.txt from the same Markdown."}</p><code>{"dewey build"}</code></li>
<li><h3>{"Check"}</h3><p>{"Drafts, coverage, stale reviews, broken references and stale outputs."}</p><code>{"dewey check"}</code></li>
</ol>
</div>
</section>
<section className="wrap sec" aria-labelledby="doc-title">
<div className="sec-head">
<div><span className="label">{"Document"}</span><h2 id="doc-title">{"One page, two readers."}</h2></div>
<p>{"Guides explain tasks to people and agents. Maps tell agents what the source does and declare the files they cover, so check knows when a map needs another look."}</p>
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
<p>{"Install the CLI, set the project up, finish the drafts, then build and check."}</p>
<ol>
<li id="q-install">{"Install Dewey as a dev dependency."}</li>
<li id="q-init">{"Initialise with the project\u2019s purpose and hard rules."}</li>
<li id="q-verify">{"Build, then check."}</li>
</ol>
<pre className="snippet">{"bun add -d @arach/dewey\nbunx dewey init --purpose \"\u2026\" --no-rules\nbunx dewey build\nbunx dewey check   "}<span className="c">{"# Dewey check passed"}</span></pre>
</div>
<div className="pane" id="pane-agent" role="tabpanel" aria-labelledby="tab-agent" tabIndex={0} hidden>
<p className="kv-title">{"src.agent.md"}</p>
<table>
<tr><th>{"kind"}</th><td>{"map"}</td></tr>
<tr><th>{"covers"}</th><td>{"src/*"}</td></tr>
<tr><th>{"contents"}</th><td>{"files, data flow, invariants and traps"}</td></tr>
<tr><th>{"review"}</th><td>{"bunx dewey review docs/src.agent.md"}</td></tr>
<tr><th>{"stale when"}</th><td>{"a covered file changes: REVIEW_REQUIRED"}</td></tr>
<tr><th>{"published"}</th><td>{"no; agents read it from docs/"}</td></tr>
</table>
</div>
</div>
<aside className="doc-side" aria-label="Page details">
<div>
<h4>{"On this page"}</h4>
<ul className="toc">
<li><a href="#q-install">{"Install"}</a></li>
<li><a href="#q-init">{"Initialise"}</a></li>
<li><a href="#q-verify">{"Build and check"}</a></li>
</ul>
</div>
<div>
<h4>{"Files"}</h4>
<ul className="files">
<li>{"quickstart.md "}<span className="ok" aria-label="present">{"\u2713"}</span></li>
<li>{"src.agent.md "}<span className="ok" aria-label="present">{"\u2713"}</span></li>
<li>{".dewey/site/quickstart.md "}<span>{"served"}</span></li>
</ul>
</div>
</aside>
</div>
<div className="doc-foot">
<span>{"guide: on the site \u00b7 map: covers src/*, not published"}</span>
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
<p>{"One build writes the site and the agent files from the same Markdown. Outputs are tracked by hash, and the build stops rather than overwrite a hand edit."}</p>
</div>
<div className="output">
<pre className="tree" aria-label="Files written by dewey init and dewey build"><span className="dim">{"my-project/"}</span>{"\n\u251c\u2500 "}<span className="new">{"AGENTS.md"}</span>{"\n\u251c\u2500 "}<span className="new">{"SKILL.md"}</span>{"\n\u251c\u2500 "}<span className="new">{"llms.txt"}</span>{"\n\u251c\u2500 .dewey/\n\u2502  \u251c\u2500 project.json\n\u2502  \u2514\u2500 "}<span className="new">{"site/"}</span>{" "}<span className="dim">{"html \u00b7 .md \u00b7 llms-full.txt"}</span>{"\n\u2514\u2500 docs/\n   \u251c\u2500 quickstart.md\n   \u2514\u2500 src.agent.md"}</pre>
<dl className="out-list">
<div><dt>{"AGENTS.md"}</dt><dd>{"Purpose, hard rules, and a marked region Dewey keeps current: scripts, source areas and maps."}</dd></div>
<div><dt>{"llms.txt"}</dt><dd>{"An index of the pages, with a summary and size for each."}</dd></div>
<div><dt>{"SKILL.md"}</dt><dd>{"How an agent in another project should use this one."}</dd></div>
<div><dt>{".dewey/site/"}</dt><dd>{"A static site with a .md copy of each page. Works with JavaScript off."}</dd></div>
<div className="wide"><dt>{"llms-full.txt"}</dt><dd>{"Every guide and reference in one file, for agents that want all of it."}</dd></div>
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
<div className="ae-foot"><span>{"This site\u2019s files are written by the frozen "}<code>{"bunx dewey generate"}</code>{"."}</span><a href="/agents">{"Agent index \u2192"}</a></div>
</div>
</section>
<section className="wrap sec" aria-labelledby="score-title">
<div className="sec-head">
<div><span className="label">{"Judgment"}</span><h2 id="score-title">{"A check you can act on."}</h2></div>
<p>{"dewey check compares the docs with the code and with each other. Each issue has a code, a file, a line and a fix, and any issue exits 1."}</p>
</div>
<div className="ticket">
<div className="stub">
<small><span>{"bunx dewey check"}</span><i>{"Illustrative"}</i></small>
<div className="n"><b>{"2"}</b><span>{"issues"}</span></div>
<span className="label grade">{"Exit 1"}</span>
<div className="meter" aria-hidden="true"><i></i></div>
<p>{"Example output. A pass means references, coverage, reviews and outputs agree. It does not prove the prose is true."}</p>
</div>
<ul>
<li><span className="ok" aria-label="Pass">{"\u2713"}</span><div><b>{"Every source file has a map"}</b><span>{"No file is uncovered or covered twice."}</span></div><code>{"MAP_MISSING"}</code></li>
<li><span className="ok" aria-label="Pass">{"\u2713"}</span><div><b>{"Cited paths and symbols exist"}</b><span>{"src/model.ts#loadModel is still declared."}</span></div><code>{"MISSING_SYMBOL"}</code></li>
<li><span className="warn" aria-label="Issue">{"!"}</span><div><b>{"Covered code changed"}</b><span>{"src/index.ts changed since the last review."}</span></div><code>{"REVIEW_REQUIRED"}</code></li>
<li><span className="warn" aria-label="Issue">{"!"}</span><div><b>{"Draft not finished"}</b><span>{"docs/quickstart.md still has draft: true."}</span></div><code>{"DOC_DRAFT"}</code></li>
</ul>
</div>
</section>
<section className="wrap sec" aria-labelledby="desk-title">
<div className="sec-head">
<div><span className="label">{"Desk"}</span><h2 id="desk-title">{"The rest of the toolkit."}</h2></div>
<p>{"Prompt templates: "}<code>{"docsReviewAgent"}</code>{", "}<code>{"docsDesignCritic"}</code>{", "}<code>{"installMdGenerator"}</code>{", "}<code>{"promptSlideoutGenerator"}</code>{", "}<code>{"improveAIPrompts"}</code>{"."}</p>
</div>
<div className="supplies">
<figure tabIndex={0}><svg className="ln" viewBox="0 0 260 170" aria-hidden="true" focusable="false"><use href="/brand/library-lines.svg#tray" /></svg><figcaption><b>{"Review"}</b>{"Record that a map was checked against the code. Check asks again when that code changes. "}<span>{"dewey review"}</span></figcaption></figure>
<figure tabIndex={0}><svg className="ln" viewBox="0 0 240 180" aria-hidden="true" focusable="false"><use href="/brand/library-lines.svg#bookend" /></svg><figcaption><b>{"Find the docs"}</b>{"List the docs that cover a file before you change it. "}<span>{"dewey which"}</span></figcaption></figure>
<figure tabIndex={0}><svg className="ln" viewBox="0 0 240 200" aria-hidden="true" focusable="false"><use href="/brand/library-lines.svg#dater" /></svg><figcaption><b>{"Rebuild"}</b>{"Outputs are tracked by hash. A hand edit stops the build instead of being overwritten. "}<span>{"dewey build"}</span></figcaption></figure>
<figure tabIndex={0}><svg className="ln" viewBox="0 0 200 120" aria-hidden="true" focusable="false"><use href="/brand/library-lines.svg#holder" /></svg><figcaption><b>{"Style the site"}</b>{"Pick a skin, theme, accent, fonts and header links, or embed the components in React. "}<span>{".dewey/project.json"}</span></figcaption></figure>
</div>
<div className="close">
<div>
<h2 id="close-title">{"Docs that keep up with the code."}</h2>
<p>{"Install, initialise, build. Then let check tell you what is out of date."}</p>
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
<a href="https://www.npmjs.com/package/@arach/dewey">{"npm"}</a>
<a href="https://github.com/arach/dewey">{"GitHub"}</a>
</nav>
</div>
</footer>

</div>}
