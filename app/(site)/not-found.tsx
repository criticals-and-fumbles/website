import { LinkButton } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <h1 className="font-display text-5xl md:text-6xl">
          <span className="text-emerald">Criticals</span>{" "}
          <span className="text-amber">&amp;</span>{" "}
          <span className="text-magenta">Fumbles</span>
        </h1>
        <p className="font-display text-4xl text-text">
          Nat 1. Page not found.
        </p>
        <p className="max-w-md text-text-muted">
          Even the best adventurers roll critical failures. This page doesn&apos;t
          exist — or it was retconned.
        </p>
        <LinkButton href="/" variant="primary">
          Back to the Tavern
        </LinkButton>
      </div>

      <Footer />
    </>
  );
}
