import OpenAI from "openai";
import type { Slide, DeckInput } from "./deck.types";
import { orderSdgGoals, sdgName } from "../sdg/taxonomy";

/**
 * Builds the SDG slide deterministically from profile data instead of asking
 * the model to write it. That guarantees no invented impact metrics and keeps
 * self-declared alignment clearly separated from verified impact.
 */
export function buildImpactSlide(input: DeckInput): Slide | null {
  const goals = input.sdgGoals ?? [];
  if (goals.length === 0) return null;

  const ordered = orderSdgGoals(goals, input.sdgPrimary ?? null);
  const primary = input.sdgPrimary && goals.includes(input.sdgPrimary)
    ? input.sdgPrimary
    : null;
  const headline = primary
    ? `SDG ${primary}: ${sdgName(primary)}`
    : "Our Sustainable Development Goals";

  const description = (input.impactDescription ?? "").trim();
  const verification = input.impactVerified
    ? "This impact claim has been reviewed and verified by VultureX."
    : "This SDG alignment is self-declared and has not been independently verified.";

  const body = description
    ? `${description} ${verification}`
    : `The team has declared alignment with the UN goals below. No impact metrics have been provided yet. ${verification}`;

  return {
    type: "impact",
    headline,
    body,
    bullets: ordered.slice(0, 4).map((id) => `SDG ${id} — ${sdgName(id)}`),
  };
}

export function withImpactSlide(slides: Slide[], input: DeckInput): Slide[] {
  const impact = buildImpactSlide(input);
  if (!impact) return slides;
  // Never duplicate an impact slide if a stored deck is regenerated.
  return [...slides.filter((slide) => slide.type !== "impact"), impact];
}

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

export async function generateDeck(input: DeckInput): Promise<Slide[]> {
  const mrrDollars = (input.mrr / 100).toLocaleString();
  const raisedDollars = (input.fundingRaised / 100).toLocaleString();

  const prompt = `You are an expert pitch deck writer who has helped startups raise over $500M. Generate a pitch deck for this startup.

STARTUP DATA:
- Name: ${input.name}
- Tagline: ${input.tagline || "N/A"}
- Sector: ${input.sector}
- Stage: ${input.stage}
- Problem: ${input.problem || "Not provided"}
- Solution: ${input.solution || "Not provided"}
- MRR: $${mrrDollars}/month
- Monthly Growth: ${input.monthlyGrowth}%
- Active Users: ${input.activeUsers.toLocaleString()}
- Customers: ${input.customers.toLocaleString()}
- Total Funding Raised: $${raisedDollars}
- Monthly Burn Rate: $${(input.burnRate / 100).toLocaleString()}
- Runway: ${input.runwayMonths} months
- Team Size: ${input.teamSize}
- Founder: ${input.founderName || "N/A"} (${input.founderRole || "CEO"})
- Founder Bio: ${input.founderBio || "N/A"}

Generate exactly 8 slides as a JSON array. Each slide object has:
- "type": one of ["title", "problem", "solution", "market", "traction", "business_model", "team", "ask"]
- "headline": bold headline, max 8 words
- "body": 2-3 compelling sentences
- "bullets": array of 3-4 short bullet points (optional, omit if not needed)
- "metric": object with "value" and "label" keys for a key number to highlight (optional)

RULES:
- Use ACTUAL numbers from the data. Never fabricate metrics.
- Write like a confident founder, not a corporate marketer.
- Traction slide: emphasize growth RATE over absolute numbers if growth is strong.
- Ask slide: suggest a raise amount appropriate for the stage (pre-seed: $500K-2M, seed: $2-5M, series-a: $5-15M).
- Be concise. Investors skim. Every word must earn its place.
- Problem slide should quantify the pain when possible.
- If a field says "Not provided" or "N/A", work around it creatively based on the sector.

Return ONLY a valid JSON array. No markdown fences, no explanation, just the array.`;

  let content: string;
  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    content = response.choices[0]?.message?.content?.trim() ?? "";
    if (!content) throw new Error("Empty response body");
  } catch (err) {
    throw new Error(
      `Deck generation failed for startup "${input.name}": ${err instanceof Error ? err.message : "unknown OpenAI error"}`,
    );
  }

  let slides: Slide[];
  try {
    const jsonStr = content.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    slides = JSON.parse(jsonStr);
  } catch {
    throw new Error(
      `Failed to parse deck JSON for startup "${input.name}": response was not valid JSON`,
    );
  }

  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error(`Invalid deck format returned for startup "${input.name}"`);
  }

  return withImpactSlide(slides, input);
}
