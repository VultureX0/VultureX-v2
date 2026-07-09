import OpenAI from "openai";
import type { Slide, DeckInput } from "./deck.types";

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

  return slides;
}
