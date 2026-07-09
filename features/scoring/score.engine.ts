import type { ScoreInput, ScoreBreakdown } from "./score.types";

export function computeVultureScore(input: ScoreInput): ScoreBreakdown {
  const traction = scoreTraction(input);
  const financial = scoreFinancial(input);
  const team = scoreTeam(input);
  const market = scoreMarket(input);
  const momentum = scoreMomentum(input);

  const total = Math.min(100, traction + financial + team + market + momentum);

  return { total, traction, financial, team, market, momentum };
}

// Traction: max 35pts — MRR thresholds + monthly growth rate + customer count
function scoreTraction(input: ScoreInput): number {
  let score = 0;

  const mrrDollars = input.mrr / 100;
  if (mrrDollars > 100_000) score += 15;
  else if (mrrDollars > 50_000) score += 12;
  else if (mrrDollars > 10_000) score += 9;
  else if (mrrDollars > 1_000) score += 5;
  else if (mrrDollars > 0) score += 2;

  if (input.monthlyGrowth > 30) score += 12;
  else if (input.monthlyGrowth > 20) score += 10;
  else if (input.monthlyGrowth > 10) score += 7;
  else if (input.monthlyGrowth > 5) score += 4;
  else if (input.monthlyGrowth > 0) score += 2;

  if (input.customers > 100) score += 5;
  else if (input.customers > 20) score += 3;
  else if (input.customers > 0) score += 1;

  return Math.min(score, 35);
}

// Financial: max 25pts — runway length + burn efficiency (MRR/burn) + total raised
function scoreFinancial(input: ScoreInput): number {
  let score = 0;

  if (input.runwayMonths > 18) score += 10;
  else if (input.runwayMonths > 12) score += 8;
  else if (input.runwayMonths > 6) score += 5;
  else if (input.runwayMonths > 3) score += 2;

  // Burn efficiency: revenue / burn. Zero burn with revenue = maximum efficiency.
  if (input.burnRate === 0 && input.mrr > 0) {
    score += 10;
  } else if (input.burnRate > 0) {
    const efficiency = input.mrr / input.burnRate;
    if (efficiency > 1.0) score += 10;
    else if (efficiency > 0.5) score += 7;
    else if (efficiency > 0.2) score += 4;
    else if (efficiency > 0) score += 2;
  }

  const raisedDollars = input.fundingRaised / 100;
  if (raisedDollars > 5_000_000) score += 5;
  else if (raisedDollars > 1_000_000) score += 4;
  else if (raisedDollars > 500_000) score += 3;
  else if (raisedDollars > 100_000) score += 2;
  else if (raisedDollars > 0) score += 1;

  return Math.min(score, 25);
}

// Team: max 15pts — headcount + founder profile completeness + role coverage depth
function scoreTeam(input: ScoreInput): number {
  let score = 0;

  // Team size (0-5)
  if (input.teamSize > 10) score += 5;
  else if (input.teamSize > 5) score += 4;
  else if (input.teamSize > 2) score += 3;
  else if (input.teamSize >= 2) score += 2;
  else score += 1;

  // Founder profile completeness (0-5)
  let completeness = 0;
  if (input.founderBio && input.founderBio.length > 20) completeness++;
  if (input.founderLinkedin) completeness++;
  if (input.founderRole) completeness++;
  if (completeness === 3) score += 5;
  else if (completeness === 2) score += 3;
  else if (completeness >= 1) score += 1;

  // Team depth - larger teams suggest role coverage (0-5)
  if (input.teamSize >= 6) score += 5;
  else if (input.teamSize >= 4) score += 4;
  else if (input.teamSize >= 3) score += 3;
  else if (input.teamSize >= 2) score += 2;
  else score += 1;

  return Math.min(score, 15);
}

// Market: max 15pts — sector heat (hot/warm/normal) + stage-appropriate traction validation
function scoreMarket(input: ScoreInput): number {
  let score = 0;

  const hotSectors = ["ai", "ml", "climate", "fintech", "healthtech"];
  const warmSectors = ["saas", "edtech", "biotech", "cybersecurity"];
  const normalSectors = ["ecommerce", "marketplace", "media", "gaming"];

  const sector = input.sector.toLowerCase();
  if (hotSectors.some((s) => sector.includes(s))) score += 8;
  else if (warmSectors.some((s) => sector.includes(s))) score += 6;
  else if (normalSectors.some((s) => sector.includes(s))) score += 5;
  else score += 3;

  const stage = input.stage.toLowerCase();
  const mrrDollars = input.mrr / 100;

  if (stage.includes("pre-seed") && input.activeUsers > 0) score += 7;
  else if (stage.includes("seed") && mrrDollars > 0) score += 7;
  else if (stage.includes("series-a") && mrrDollars > 50_000) score += 7;
  else if (stage.includes("series-b") && mrrDollars > 200_000) score += 7;
  else if (mrrDollars > 0 || input.activeUsers > 0) score += 4;
  else score += 2;

  return Math.min(score, 15);
}

// Momentum: max 10pts — profile views + investor interests + competition participation
function scoreMomentum(input: ScoreInput): number {
  let score = 0;

  if (input.profileViews30d > 50) score += 4;
  else if (input.profileViews30d > 20) score += 3;
  else if (input.profileViews30d > 5) score += 2;
  else if (input.profileViews30d > 0) score += 1;

  if (input.interestsReceived > 5) score += 4;
  else if (input.interestsReceived > 2) score += 3;
  else if (input.interestsReceived > 0) score += 1;

  if (input.inCompetition) score += 2;

  return Math.min(score, 10);
}
