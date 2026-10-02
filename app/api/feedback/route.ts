import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const LABELS: Record<number, string> = {
  1: "Not likely",
  2: "Unlikely",
  3: "Neutral",
  4: "Likely",
  5: "Very likely",
};

// The form's textarea carries the same limit, so a real person never reaches it.
const MAX_FEEDBACK = 2000;

// Same rule as the main site's lead route: the request must come from this site's own page.
function isSameOrigin(req: NextRequest): boolean {
  const host = req.headers.get("host");
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!host || !origin) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ ok: false, error: "Invalid origin" }, { status: 403 });
    }

    let body: { score?: unknown; feedback?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
    const { score, feedback } = body;

    if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 5) {
      return NextResponse.json({ ok: false, error: "Invalid score" }, { status: 400 });
    }
    if (feedback !== undefined && feedback !== null && typeof feedback !== "string") {
      return NextResponse.json({ ok: false, error: "Invalid feedback" }, { status: 400 });
    }
    const text = (feedback ?? "").trim();
    if (text.length > MAX_FEEDBACK) {
      return NextResponse.json({ ok: false, error: "Feedback is too long" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "gutted. Feedback <leads@gutd.au>",
      to: "info@gutd.au",
      subject: `New feedback: ${score}/5 (${LABELS[score]})`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#C04A27;padding:20px 24px;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;font-size:20px;color:#fff;">New client feedback</h1>
          </div>
          <div style="border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:8px 0;color:#666;width:140px;">Would recommend</td><td style="padding:8px 0;font-weight:600;">${score}/5 (${LABELS[score]})</td></tr>
              ${text ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top;">Feedback</td><td style="padding:8px 0;">${escapeHtml(text).replace(/\r?\n/g, "<br/>")}</td></tr>` : ""}
            </table>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[feedback] Resend returned an error:", error);
      return NextResponse.json({ ok: false, error: error.message ?? String(error) }, { status: 502 });
    }

    console.log("[feedback] sent, Resend id:", data?.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[feedback] error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
