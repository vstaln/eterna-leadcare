import Link from "next/link";
import FallingText from "@/components/FallingText";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        error 404
      </p>
      <h1 className="mt-4 text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold tracking-tighter text-text">
        <FallingText text="command not found" stagger={0.06} speed={0.5} />
      </h1>
      <p className="mt-4 max-w-md font-mono text-sm text-muted">
        no pipeline exists for this path yet
      </p>
      <Link
        href="/"
        className="bg-ok mt-8 px-6 py-3 text-sm font-semibold text-zinc-950 transition-[filter,transform] duration-150 ease-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-live active:scale-[0.98]"
      >
        return to front door
      </Link>
    </div>
  );
}
