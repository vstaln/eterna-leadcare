import type { Metadata } from "next";
import SectionHeading from "@/components/section-heading";

const REPO = "https://github.com/vstaln/eterna-ops-command-center";

export const metadata: Metadata = {
  title: "Behind the Scenes — How Eterna LeadCare was built",
  description: "Git log, CI, and the $0 cost behind the Eterna LeadCare build.",
};

const rows = [
  {
    k: "GIT",
    v: "All commits, on main, in the open repo.",
    href: `${REPO}/commits/main`,
    cta: "view git log →",
  },
  {
    k: "CI",
    v: "Lint + typecheck + build + gitleaks on every PR.",
    href: `${REPO}/actions`,
    cta: "view builds →",
  },
  {
    k: "AI_LOG",
    v: "Every session, honestly: what changed and how it was verified.",
    href: `${REPO}/blob/main/AI_LOG.md`,
    cta: "read the log →",
  },
];

export default function BehindTheScenes() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-8">
        <SectionHeading
          eyebrow="BEHIND THE SCENES // the build story"
          title="Git, CI, and the $0 bill."
        />
        <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-muted">
          How Eterna LeadCare was built — in the open, honestly, and at $0/month. Every commit,
          build, and session is documented below.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-6">
        <ul className="divide-y divide-border border border-border bg-surface">
          {rows.map((r) => (
            <li key={r.k} className="flex items-center justify-between gap-4 px-4 py-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-text">{r.k}</span>
                <p className="mt-1 font-mono text-sm text-muted">{r.v}</p>
              </div>
              <a
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 border border-border px-3 py-2 font-mono text-xs uppercase tracking-widest text-text transition-colors hover:border-live hover:text-live"
              >
                {r.cta}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <SectionHeading eyebrow="COST" title="$0/month." />
        <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-muted">
          Oracle Cloud free tier, Cloudflare edge, GCP Cloud Run free tier,
          GitHub Actions CI. Itemized in the README.
        </p>
      </section>
    </div>
  );
}
