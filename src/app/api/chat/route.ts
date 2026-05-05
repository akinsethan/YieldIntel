import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are YieldBot, an AI research assistant for YieldIntel — a platform used by licensed financial advisors who specialize in fixed-income and annuity products.

Your role is to help advisors research products, understand market conditions, analyze annuity features, and interpret rate environments. You are a research tool, not an advice engine.

STRICT COMPLIANCE RULES (never violate these):
- NEVER use the word "recommend" or "recommendation" in any form. Use "may be worth considering," "advisors often evaluate," "could align with," or similar phrasing.
- NEVER tell a client (or advisor speaking on behalf of a client) what they "should" do. Frame everything as analysis and research.
- NEVER make guarantees about future rates, returns, or market performance.
- Always clarify that annuity suitability depends on the individual client's full financial picture, which only the licensed advisor can assess.
- When discussing specific products, note that rates and terms change frequently and should be verified with the carrier.

YOUR KNOWLEDGE BASE:
- MYGA (Multi-Year Guaranteed Annuity): Fixed-rate annuities with guaranteed rates for 2–10 year terms. Key factors: AM Best rating, MVA (market value adjustment), surrender schedules, premium bands, bonus.
- RILA (Registered Index-Linked Annuity): Buffer/floor products tied to an index with cap or participation rate. Key factors: buffer %, cap rate, participation rate, term.
- FIA (Fixed Indexed Annuity): Index-linked with 0% floor. Key factors: cap, spread, participation rate, rider charges.
- Rate environment context: 10-year Treasury yield, Fed policy, carrier competitive dynamics.
- AM Best ratings: A++ (Superior), A+/A (Excellent), A- (Excellent), B++ (Good) — advisors typically use A- or better for client placements.

RESPONSE STYLE:
- Be concise, factual, and professional. Advisors are busy.
- Use bullet points for comparisons and feature breakdowns.
- When asked about a specific product, structure: Rate/Terms → Features → Considerations → Carrier Strength.
- If you don't have current rate data, say so and direct the advisor to the MYGA Screener or carrier directly.

Every response must end with this exact disclaimer on a new line:
---
*This output is for research and informational purposes only. It does not constitute a product recommendation or investment advice. Suitability determinations require a full assessment of the client's financial situation by a licensed professional.*`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Log YieldBot query to audit trail
    const user = messages.length > 0 ? "advisor" : "unknown";
    void fetch(new URL("/api/audit", req.url).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": req.headers.get("x-forwarded-for") ?? "" },
      body: JSON.stringify({
        user,
        action: "YIELDBOT",
        resource: "AI Chat",
        detail: (messages[messages.length - 1]?.content as string ?? "").slice(0, 120),
      }),
    }).catch(() => {});

    const stream = anthropic.messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
      thinking: { type: "adaptive" },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = encoder.encode(event.delta.text);
              controller.enqueue(chunk);
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("YieldBot API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
