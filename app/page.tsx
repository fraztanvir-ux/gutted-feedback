"use client";
import { useState } from "react";

const LABELS: Record<number, string> = {
  1: "Not likely",
  2: "Unlikely",
  3: "Neutral",
  4: "Likely",
  5: "Very likely",
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";

function Eyebrow() {
  return (
    <span
      className="inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.08em] uppercase"
      style={{ color: "rgba(255,255,255,0.72)" }}
    >
      <span aria-hidden className="inline-block h-[2px] w-6 shrink-0" style={{ background: "var(--orange)" }} />
      Your feedback
    </span>
  );
}

export default function FeedbackPage() {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [touched, setTouched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === null) {
      setTouched(true);
      return;
    }
    if (status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, feedback }),
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-16"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, rgba(192,74,39,0.08) 0%, rgba(192,74,39,0) 55%), var(--surface-muted)",
      }}
    >
      <div
        className="w-full overflow-hidden rounded-[28px]"
        style={{ maxWidth: 600, background: "var(--white)", boxShadow: "0 24px 64px rgba(26,26,26,0.14)" }}
      >
        {status === "success" ? (
          <SuccessPanel />
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Dark band: question + rating */}
            <div
              className="relative overflow-hidden px-7 pt-9 pb-10 sm:px-10 sm:pt-11 sm:pb-11"
              style={{ background: "linear-gradient(150deg, var(--dark) 0%, var(--dark-2) 100%)" }}
            >
              <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ backgroundImage: GRAIN }} />
              <div className="relative fb-anim fb-d1">
                <Eyebrow />
              </div>
              <h1 className="relative fb-anim fb-d2 mt-4 text-[28px] sm:text-[32px] font-extrabold leading-[1.15] tracking-tight text-white">
                How likely would you be to recommend us to friends and family?
              </h1>

              <div className="relative fb-anim fb-d3 mt-8 flex items-start justify-between gap-1 sm:gap-3">
                {[1, 2, 3, 4, 5].map((n) => {
                  const selected = score === n;
                  return (
                    <div key={n} className="flex flex-col items-center gap-2.5" style={{ width: 64 }}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        aria-label={`${n} out of 5, ${LABELS[n]}`}
                        onClick={() => {
                          setScore(n);
                          setTouched(false);
                        }}
                        className="fb-rating-btn flex items-center justify-center rounded-full font-bold text-[17px]"
                        style={{
                          width: 52,
                          height: 52,
                          color: selected ? "#fff" : "rgba(255,255,255,0.75)",
                          background: selected ? "var(--orange)" : "rgba(255,255,255,0.04)",
                          border: selected ? "1.5px solid transparent" : "1.5px solid rgba(255,255,255,0.22)",
                          boxShadow: selected ? "0 10px 28px var(--orange-glow)" : "none",
                          transform: selected ? "scale(1.08)" : "scale(1)",
                        }}
                      >
                        {n}
                      </button>
                      {(n === 1 || n === 5) && (
                        <span className="text-[12px] font-medium text-center leading-tight" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {n === 1 ? "Not likely" : "Very likely"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {touched && score === null && (
                <p className="relative mt-4 text-[13px] font-semibold" style={{ color: "#DB6B3E" }}>
                  Pick a number from 1 to 5 to continue.
                </p>
              )}
            </div>

            {/* Light section: open feedback + submit */}
            <div className="px-7 pt-8 pb-7 sm:px-10 sm:pt-9 sm:pb-9">
              <label htmlFor="feedback" className="block text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                Do you have any feedback for our team on how we could improve?
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Optional, but it really helps."
                className="mt-3 w-full rounded-xl px-4 py-3.5 text-[15px] outline-none transition-colors"
                style={{
                  border: "1.5px solid var(--hairline)",
                  color: "var(--text-primary)",
                  resize: "vertical",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--orange)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--hairline)")}
              />

              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                  Takes about 10 seconds.
                </span>
                <SubmitButton status={status} />
              </div>

              {status === "error" && (
                <p className="mt-4 text-[13px] font-semibold" style={{ color: "var(--orange)" }}>
                  Something went wrong sending that. Mind trying again in a moment?
                </p>
              )}
            </div>
          </form>
        )}
      </div>

      <footer
        className="fb-anim fb-d3 mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]"
        style={{ color: "var(--text-muted)" }}
      >
        <span>© {new Date().getFullYear()} gutted.</span>
        <a
          href="https://www.gutd.au/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="fb-footer-link"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          Privacy Policy
        </a>
        <a
          href="https://www.gutd.au/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="fb-footer-link"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          Terms of Service
        </a>
      </footer>

      <style>{`
        @keyframes fbFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fb-anim { animation: fbFadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fb-d1 { animation-delay: 40ms; }
        .fb-d2 { animation-delay: 120ms; }
        .fb-d3 { animation-delay: 220ms; }
        .fb-rating-btn { transition: background 800ms ease, color 800ms ease, border-color 800ms ease, box-shadow 800ms ease, transform 800ms ease; cursor: pointer; }
        .fb-rating-btn:hover { border-color: rgba(255,255,255,0.5); transform: scale(1.06); }
        .fb-footer-link { transition: color 800ms ease; }
        .fb-footer-link:hover { color: var(--orange) !important; }
      `}</style>
    </main>
  );
}

function SubmitButton({ status }: { status: "idle" | "submitting" | "success" | "error" }) {
  const [hover, setHover] = useState(false);
  const disabled = status === "submitting";
  return (
    <button
      type="submit"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap"
      style={{
        padding: "13px 26px",
        fontSize: 15,
        color: "#fff",
        background: disabled ? "var(--orange)" : hover ? "#E8673A" : "var(--orange)",
        boxShadow: hover && !disabled ? "0 12px 32px var(--orange-glow)" : "none",
        transform: hover && !disabled ? "scale(1.06)" : "scale(1)",
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? "default" : "pointer",
        transition: "background 800ms ease, box-shadow 800ms ease, transform 800ms ease, opacity 300ms ease",
      }}
    >
      {status === "submitting" ? "Sending…" : "Send feedback"}
    </button>
  );
}

function SuccessPanel() {
  return (
    <div className="fb-anim fb-d1 flex flex-col items-center px-8 py-16 text-center sm:py-20">
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 64, height: 64, background: "var(--orange-tint)" }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h2 className="mt-6 text-[24px] font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
        Thanks, that means a lot.
      </h2>
      <p className="mt-2.5 text-[15px] max-w-[340px]" style={{ color: "var(--text-secondary)" }}>
        We read every single one. If you flagged something to improve, someone on our team will follow up personally.
      </p>
    </div>
  );
}
