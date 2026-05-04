import React, { useEffect, useRef, useState } from "react";

const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/oahcpmhnmcfjciaehfijhfjofjddjjij";
const DURATION_MS = 2 * 60 * 60 * 1000;
const STORAGE_KEY = "sb_deal_end";

const fmt = (n: number) => String(n).padStart(2, "0");

function getEndTime(): number {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return parseInt(stored, 10);
    const end = Date.now() + DURATION_MS;
    sessionStorage.setItem(STORAGE_KEY, String(end));
    return end;
  } catch {
    return Date.now() + DURATION_MS;
  }
}

export const StickyBottomBar: React.FC = () => {
  const endTimeRef = useRef<number | null>(null);
  const [hms, setHms] = useState({ h: "02", m: "00", s: "00" });
  const [urgent, setUrgent] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [viewers, setViewers] = useState<number>(
    () => 38 + Math.floor(Math.random() * 20),
  );

  useEffect(() => {
    endTimeRef.current = getEndTime();

    const tick = () => {
      const end = endTimeRef.current ?? Date.now();
      const remaining = Math.max(0, end - Date.now());
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);

      setHms({ h: fmt(h), m: fmt(m), s: fmt(s) });
      setUrgent(remaining > 0 && remaining < 3600000);

      if (remaining <= 0) setHidden(true);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const update = () => {
      setViewers((prev) => {
        let next = prev + Math.floor(Math.random() * 5) - 2;
        if (next < 28) next = 28 + Math.floor(Math.random() * 5);
        if (next > 68) next = 60 - Math.floor(Math.random() * 5);
        return next;
      });
    };

    let timeoutId: number;
    const schedule = () => {
      timeoutId = window.setTimeout(
        () => {
          update();
          schedule();
        },
        15000 + Math.random() * 15000,
      );
    };
    schedule();

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (hidden) return null;

  return (
    <div
      className="sticky-bottom"
      role="complementary"
      aria-label="Limited time offer"
    >
      <div className="sb-left">
        <span className="sb-label">
          ⚡ Get All 4 AI Tools. Lifetime. &pound;50
        </span>
        <div
          className={`sb-timer${urgent ? " urgent" : ""}`}
          aria-live="polite"
        >
          <span className="sb-timer-seg">{hms.h}</span>
          <span className="sb-timer-colon">:</span>
          <span className="sb-timer-seg">{hms.m}</span>
          <span className="sb-timer-colon">:</span>
          <span className="sb-timer-seg">{hms.s}</span>
        </div>
      </div>
      <div className="sb-viewers">
        <span className="sb-viewers-dot" aria-hidden="true"></span>
        <span>{viewers} viewing now</span>
      </div>
      <a
        href="https://api.extino.net/store/lifetime"
        target="_blank"
        rel="noopener noreferrer"
        className="sb-cta"
      >
        Claim Lifetime Deal
      </a>
    </div>
  );
};
