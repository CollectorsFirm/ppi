import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are PPI, an expert collector car analyst embedded in the Pre-Purchase Intelligence tool for Bring a Trailer auctions. You help buyers make informed decisions.

You are STRICTLY limited to discussing:
1. The specific BaT listing being analyzed (its condition, history, price, documentation, flags)
2. The make and model in question (known issues, variants, market values, auction history, specs, ownership costs)
3. Bring a Trailer as a platform (how auctions work, bidding strategy, BaT community norms, reserve vs no-reserve, typical buyer premiums)

If asked ANYTHING outside these three topics — stocks, other websites, general advice, personal questions, politics, or anything unrelated to this listing/car/BaT — respond with exactly:
"I can only help with questions about this listing, the car itself, or the BaT auction platform. What would you like to know about the [CAR MODEL]?"

Be concise, direct, and expert. No fluff. Think like a knowledgeable car guy who's spent years on BaT, not a customer service rep.

When discussing values, always anchor to what you know from the report data provided. When discussing model-specific issues, draw on your knowledge of the car's history and common failure points. When discussing bidding strategy, factor in the listing's score and flags.`;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { message, listingContext, history } = body ?? {};

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set." }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build the context block prepended to conversation
  const contextBlock = listingContext
    ? `LISTING CONTEXT (for reference only — do not repeat this back verbatim):\n${JSON.stringify(listingContext, null, 2)}\n\n---\n\n`
    : "";

  // History (cap at last 10 exchanges to keep token use reasonable)
  const safeHistory: ChatMessage[] = Array.isArray(history) ? history.slice(-20) : [];

  // If this is the first message, prepend the context as a system note
  const messages: Anthropic.MessageParam[] = [
    ...(contextBlock && safeHistory.length === 0
      ? [{ role: "user" as const, content: `${contextBlock}${message}` }]
      : [
          ...(contextBlock && safeHistory.length > 0
            ? [{ role: "user" as const, content: contextBlock + "Context loaded." }, { role: "assistant" as const, content: "Got it. What would you like to know?" }]
            : []),
          ...safeHistory,
          { role: "user" as const, content: message },
        ]),
  ];

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 600,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages,
  });

  const reply = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  return NextResponse.json({ reply });
}
