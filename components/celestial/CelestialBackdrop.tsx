/**
 * Fixed, persistent ambient backdrop — ported near-verbatim from the
 * approved code.html mockup's "BackgroundArtAndCosmicNebula" +
 * "OuterOrnateScreenBorder" blocks (purely decorative, no data, so a
 * direct structural port rather than a generated component like
 * MacroCompass was for the old /lobby preview). Deliberately scoped to
 * this ONE route via app/celestial/layout.tsx — the mockup itself
 * places this outside the scrollable content wrapper, i.e. as sitewide
 * chrome by construction; that's flagged in this project's review as a
 * decision to make later, not assumed here.
 *
 * This route got a light/dark toggle (2026-09-14 — see
 * CelestialThemeToggle.tsx and globals.css's .celestial /
 * .celestial.celestial-light blocks). This component itself needed no
 * theme-reactive logic to support that: the astrolabe line-art, frame,
 * and pulsing planetary markers are saturated/thin enough to work as
 * accents on EITHER background unchanged, and the one spot that did
 * hardcode a page-matching colour (the frame's small diamond notches)
 * now reads `var(--bg)` instead of a literal hex, so it tracks whichever
 * theme is active automatically.
 *
 * Three elements from the original code.html mockup were dropped/
 * reworked entirely rather than made theme-reactive, because they were
 * built specifically as "glow in the dark" effects with no light-mode
 * equivalent worth inventing: a translucent near-black night-sky wash,
 * an opaque mountain silhouette, and a white starburst blur (all three
 * would read as invisible or a muddy smudge against the light variant,
 * not just low-contrast) — the starburst was recoloured to gold/cream
 * rather than dropped, since a glinting accent still suits dark mode
 * too; the wash and silhouette have no dark-only replacement here.
 */
export function CelestialBackdrop() {
  return (
    <>
      {/* Ambient backdrop — nebula/celestial lighting only, no night-sky wash.
          -z-10 (not z-0): on /celestial itself z-0 was fine because that
          route's own layout wraps all real content in one relative z-10
          div, guaranteeing it outranks this. Reused sitewide via
          PageBackdrop.tsx, this renders as a plain sibling inside each
          page's own JSX instead, where most content sections have no
          position of their own — and a position:fixed z-0 element still
          paints ABOVE plain non-positioned siblings, so the backdrop was
          bleeding straight through "opaque" card backgrounds (confirmed:
          Team/Events/Wiki/the homepage's EventStrip/WorldStrip). Negative
          z-index paints behind ALL non-negative content regardless of
          whether that content is positioned — the fix that doesn't
          depend on every page/component happening to declare `relative`
          somewhere. */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Ambient nebula clouds — same soft radial washes as the original,
            already low-opacity enough (max ~22%) to read as a gentle colour
            tint rather than a "glow" either way, so kept unchanged. Dropped
            the crescent-moon ring shape that sat above these — that one
            read specifically as "moon in a night sky", no light-mode
            equivalent worth inventing for a quick recolour. */}
        <div className="absolute top-[5%] right-[2%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(0,149,138,0.16)_0%,_rgba(6,95,90,0.1)_40%,_transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute top-[45%] left-[2%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(146,114,31,0.1)_0%,_rgba(79,219,200,0.06)_40%,_transparent_75%)] blur-3xl pointer-events-none" />

        {/* Continuous full-site sacred-geometry astrolabe */}
        <div className="absolute top-[-150px] sm:top-[-100px] left-1/2 -translate-x-1/2 w-[1100px] md:w-[1500px] lg:w-[1850px] aspect-square pointer-events-none opacity-55 mix-blend-screen">
          <svg
            className="w-full h-full spin-slow drop-shadow-[0_0_25px_rgba(0,229,200,0.25)]"
            fill="none"
            viewBox="0 0 1000 1000"
            aria-hidden="true"
          >
            <defs>
              <radialGradient cx="50%" cy="50%" id="coreGlow" r="50%">
                <stop offset="0%" stopColor="#00e5c8" stopOpacity="0.35" />
                <stop offset="30%" stopColor="#d4af37" stopOpacity="0.18" />
                <stop offset="70%" stopColor="#031826" stopOpacity="0.05" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="500" cy="500" fill="url(#coreGlow)" r="480" />
            <circle cx="500" cy="500" opacity="0.4" r="480" stroke="#d4af37" strokeDasharray="3 9" strokeWidth="0.8" />
            <circle cx="500" cy="500" opacity="0.45" r="460" stroke="#00e5c8" strokeWidth="1" />
            <circle cx="500" cy="500" opacity="0.5" r="440" stroke="#d4af37" strokeDasharray="2 4" strokeWidth="0.6" />
            <circle cx="500" cy="500" opacity="0.5" r="390" stroke="#38bdf8" strokeWidth="1.2" />
            <circle cx="500" cy="500" opacity="0.6" r="340" stroke="#d4af37" strokeDasharray="6 6" strokeWidth="1" />
            <circle cx="500" cy="500" opacity="0.65" r="280" stroke="#00e5c8" strokeWidth="1.4" />
            <circle cx="500" cy="500" opacity="0.7" r="210" stroke="#d4af37" strokeWidth="1.2" />
            <circle cx="500" cy="500" opacity="0.8" r="130" stroke="#00e5c8" strokeWidth="1.5" />
            <circle cx="500" cy="500" opacity="0.85" r="70" stroke="#d4af37" strokeDasharray="2 2" strokeWidth="1.2" />
            <polygon fill="none" opacity="0.7" points="500,60 881,720 119,720" stroke="#d4af37" strokeWidth="1.2" />
            <polygon fill="none" opacity="0.7" points="500,940 881,280 119,280" stroke="#d4af37" strokeWidth="1.2" />
            <rect fill="none" height="530" opacity="0.5" stroke="#00e5c8" strokeWidth="0.9" width="530" x="235" y="235" />
            <rect fill="none" height="530" opacity="0.55" stroke="#d4af37" strokeWidth="0.9" transform="rotate(45 500 500)" width="530" x="235" y="235" />
            <rect fill="none" height="530" opacity="0.4" stroke="#38bdf8" strokeDasharray="4 4" strokeWidth="0.6" transform="rotate(22.5 500 500)" width="530" x="235" y="235" />
            <rect fill="none" height="530" opacity="0.4" stroke="#38bdf8" strokeDasharray="4 4" strokeWidth="0.6" transform="rotate(67.5 500 500)" width="530" x="235" y="235" />
            <line opacity="0.55" stroke="#d4af37" strokeWidth="0.9" x1="500" x2="500" y1="10" y2="990" />
            <line opacity="0.55" stroke="#d4af37" strokeWidth="0.9" x1="10" x2="990" y1="500" y2="500" />
            <line opacity="0.5" stroke="#38bdf8" strokeDasharray="5 5" strokeWidth="0.7" x1="153" x2="847" y1="153" y2="847" />
            <line opacity="0.5" stroke="#38bdf8" strokeDasharray="5 5" strokeWidth="0.7" x1="153" x2="847" y1="847" y2="153" />
            <circle cx="500" cy="60" fill="#d4af37" r="5.5" />
            <circle cx="881" cy="720" fill="#d4af37" r="5.5" />
            <circle cx="119" cy="720" fill="#d4af37" r="5.5" />
            <circle cx="500" cy="940" fill="#d4af37" r="5.5" />
            <circle cx="881" cy="280" fill="#d4af37" r="5.5" />
            <circle cx="119" cy="280" fill="#d4af37" r="5.5" />
          </svg>

          <svg className="absolute inset-0 w-full h-full spin-reverse pointer-events-none" fill="none" viewBox="0 0 1000 1000" aria-hidden="true">
            <g opacity="0.45" stroke="#d4af37" strokeWidth="0.7">
              <line x1="500" x2="500" y1="500" y2="40" />
              <line x1="500" x2="725" y1="500" y2="110" />
              <line x1="500" x2="890" y1="500" y2="275" />
              <line x1="500" x2="960" y1="500" y2="500" />
              <line x1="500" x2="890" y1="500" y2="725" />
              <line x1="500" x2="725" y1="500" y2="890" />
              <line x1="500" x2="500" y1="500" y2="960" />
              <line x1="500" x2="275" y1="500" y2="890" />
              <line x1="500" x2="110" y1="500" y2="725" />
              <line x1="500" x2="40" y1="500" y2="500" />
              <line x1="500" x2="110" y1="500" y2="275" />
              <line x1="500" x2="275" y1="500" y2="110" />
            </g>
            <ellipse cx="440" cy="460" opacity="0.35" rx="350" ry="190" stroke="#00e5c8" strokeWidth="0.9" transform="rotate(-30 440 460)" />
            <ellipse cx="560" cy="540" opacity="0.25" rx="310" ry="160" stroke="#f43f5e" strokeWidth="0.8" transform="rotate(35 560 540)" />
          </svg>

          {/* Planetary nodes (pulsing astral markers) */}
          <div className="absolute top-[28%] right-[22%] flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-pink-400 glow-magenta" />
            <span className="absolute w-9 h-9 rounded-full bg-pink-500/40 animate-ping" />
          </div>
          <div className="absolute bottom-[28%] right-[24%] flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-pink-400 glow-magenta" />
            <span className="absolute w-8 h-8 rounded-full bg-pink-500/30 animate-ping" style={{ animationDelay: "1.2s" }} />
          </div>
          <div className="absolute top-[30%] left-[26%] flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-pink-400 glow-magenta" />
          </div>
          <div className="absolute bottom-[30%] left-[26%] flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-pink-400 glow-magenta" />
          </div>
          <div className="absolute top-[49%] right-[16%] flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-pink-400 glow-magenta" />
          </div>
          <div className="absolute top-[50%] left-[20%] flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-teal-300 glow-cyan" />
          </div>

          {/* Central astral starburst — recoloured from teal/white (a "glow
              in the dark" effect: a white blur is invisible against a
              cream page, same problem as the mountain silhouette above)
              to gold/cream, so it still reads as a glinting accent rather
              than vanishing. */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pulse-star">
            <div className="absolute w-44 h-44 rounded-full bg-[var(--celestial-gold-400-25)] blur-2xl" />
            <div className="absolute w-20 h-20 rounded-full bg-[var(--celestial-gold-200-70)] blur-lg" />
            <svg className="w-44 h-44 text-gold-600 fill-current filter drop-shadow-[0_0_15px_rgba(146,114,31,0.5)]" viewBox="0 0 100 100" aria-hidden="true">
              <path d="M50 0 L53 43 L96 50 L53 57 L50 100 L47 57 L4 50 L47 43 Z" />
              <path d="M50 18 L55 45 L82 50 L55 55 L50 82 L45 55 L18 50 L45 45 Z" fill="#fdf9f0" opacity="0.9" />
              <circle cx="50" cy="50" fill="#fdf9f0" r="4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Outer ornate screen border (fixed frame) */}
      <div className="fixed inset-0 pointer-events-none z-50 p-2 sm:p-4 flex flex-col justify-between">
        <div className="relative w-full flex items-center justify-between">
          <CornerCompass className="-translate-x-1 -translate-y-1" ticks="M4 4 L22 4 M4 4 L4 22 M10 10 L28 10 M10 10 L10 28" />
          <CornerCompass className="translate-x-1 -translate-y-1" ticks="M56 4 L38 4 M56 4 L56 22 M50 10 L32 10 M50 10 L50 28" />
        </div>
        {/* Side rails — the center diamond on each (at the vertical
            midpoint) is deliberately magenta (#f9a8d4, the same hue
            "Fumbles" uses in the brand title), not gold like the rest of
            the frame — a 2026-09-15 request. The two small dots flanking
            it stay gold, unchanged. */}
        <div className="w-full flex-1 flex justify-between pointer-events-none relative px-1">
          <div className="h-full w-[1px] bg-gradient-to-b from-[#d4af37]/80 via-[#d4af37]/30 to-[#d4af37]/80 relative">
            <div className="absolute top-1/2 -translate-y-1/2 -left-[4px] w-2.5 h-2.5 rotate-45 border border-[#f9a8d4] bg-[var(--bg)]" />
            <div className="absolute top-1/4 -translate-y-1/2 -left-[2px] w-1.5 h-1.5 rounded-full bg-[#eab308]" />
            <div className="absolute top-3/4 -translate-y-1/2 -left-[2px] w-1.5 h-1.5 rounded-full bg-[#eab308]" />
          </div>
          <div className="h-full w-[1px] bg-gradient-to-b from-[#d4af37]/80 via-[#d4af37]/30 to-[#d4af37]/80 relative">
            <div className="absolute top-1/2 -translate-y-1/2 -right-[4px] w-2.5 h-2.5 rotate-45 border border-[#f9a8d4] bg-[var(--bg)]" />
            <div className="absolute top-1/4 -translate-y-1/2 -right-[2px] w-1.5 h-1.5 rounded-full bg-[#eab308]" />
            <div className="absolute top-3/4 -translate-y-1/2 -right-[2px] w-1.5 h-1.5 rounded-full bg-[#eab308]" />
          </div>
        </div>
        <div className="relative w-full flex items-center justify-between">
          <CornerCompass className="-translate-x-1 translate-y-1" ticks="M4 56 L22 56 M4 56 L4 38 M10 50 L28 50 M10 50 L10 32" />
          <CornerCompass className="translate-x-1 translate-y-1" ticks="M56 56 L38 56 M56 56 L56 38 M50 50 L32 50 M50 50 L50 32" />
        </div>
      </div>
    </>
  );
}

function CornerCompass({ className, ticks }: { className: string; ticks: string }) {
  return (
    <div className={`relative w-10 sm:w-12 h-10 sm:h-12 ${className}`}>
      <svg
        className="w-full h-full text-[#d4af37] fill-current filter drop-shadow-[0_0_6px_rgba(212,175,55,0.7)]"
        viewBox="0 0 60 60"
        aria-hidden="true"
      >
        <circle cx="30" cy="30" fill="none" r="16" stroke="#d4af37" strokeWidth="1.2" />
        <circle cx="30" cy="30" fill="none" r="22" stroke="#d4af37" strokeDasharray="2 2" strokeWidth="0.8" />
        <path d="M30 4 L33 24 L56 30 L33 36 L30 56 L27 36 L4 30 L27 24 Z" />
        <circle cx="30" cy="30" fill="#fff" r="3" />
        <path d={ticks} fill="none" stroke="#c5a044" strokeWidth="1" />
      </svg>
    </div>
  );
}
