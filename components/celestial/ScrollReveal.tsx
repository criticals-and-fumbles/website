"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/** Same reveal-once IntersectionObserver pattern used elsewhere in this
 * project's preview work — kept as its own small copy here rather than
 * a shared cross-route import, matching how each preview route has
 * stayed self-contained so far. */
export function ScrollReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`celestial-scene-inner ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
