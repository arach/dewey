import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <header className="mx-auto w-full max-w-2xl px-6 pt-10">
        <nav className="flex items-center justify-between pb-5">
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-newsreader)" }}
          >
            Scout
          </span>
          <Link
            href="/docs"
            className="font-mono text-[10px] uppercase tracking-[0.12em] transition-opacity hover:opacity-70"
            style={{ color: "#8b8579" }}
          >
            Docs
          </Link>
        </nav>
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-16">
        <div className="w-full max-w-2xl text-center">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ color: "#8b8579" }}
          >
            Local agent broker
          </p>
          <h1
            className="mt-5 text-5xl font-medium tracking-[-0.03em] sm:text-6xl"
            style={{ fontFamily: "var(--font-newsreader)", color: "#111110" }}
          >
            One connection.
            <br />
            Every agent.
          </h1>
          <p
            className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed"
            style={{ color: "#5e5a52" }}
          >
            Scout routes messages between AI agents on your machine — no point-to-point
            wiring, no port juggling.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: "#111110", color: "#ffffff" }}
            >
              Read the docs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs/overview"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-colors"
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                color: "#4c4841",
              }}
            >
              Quick overview
            </Link>
          </div>
        </div>

        <div
          className="mt-20 grid w-full max-w-2xl gap-4 sm:grid-cols-3"
        >
          {[
            { label: "Discover", text: "Agents advertise capabilities; the broker indexes them." },
            { label: "Route", text: "Point-to-point or broadcast — one WebSocket per agent." },
            { label: "Coordinate", text: "Consult, delegate, notify, complete — structured actions." },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-5 text-left"
              style={{ border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <p
                className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: "#8b8579" }}
              >
                {item.label}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "#5e5a52" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}