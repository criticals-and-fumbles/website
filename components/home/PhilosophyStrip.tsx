import Link from "next/link";

export function PhilosophyStrip({ tagline }: { tagline?: string }) {
  return (
    <section className="bg-bg-forest px-4 py-20 text-center md:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl leading-tight text-on-forest md:text-5xl">
          {tagline ?? "Good Players Make Good Tables. Good Tables Make Good Stories."}
        </h2>
        <p className="mt-6 font-ui text-sm text-on-forest-muted md:text-base">
          A Guild That Runs Itself · Worlds Worth Returning To · Friends Who Know
          Your Alignment
        </p>
        <Link
          href="/about#philosophy"
          className="mt-6 inline-block font-ui text-sm text-emerald hover:underline"
        >
          Read our philosophy →
        </Link>
      </div>
    </section>
  );
}
