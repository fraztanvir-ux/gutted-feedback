import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const LABELS: Record<number, string> = {
  1: "Not likely",
  2: "Unlikely",
  3: "Neutral",
  4: "Likely",
  5: "Very likely",
};

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    const { score, feedback } = body;

    if (typeof score !== "number" || score < 1 || score > 5) {
      return NextResponse.json({ ok: false, error: "Invalid score" }, { status: 400 });
    }

    await resend.emails.send({
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
              ${feedback ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top;">Feedback</td><td style="padding:8px 0;">${String(feedback).replace(/\n/g, "<br/>")}</td></tr>` : ""}
            </table>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[feedback] error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
