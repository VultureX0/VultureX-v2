import assert from "node:assert/strict";
import test from "node:test";
import {
  SDG_GOALS,
  isSdgId,
  normalizeSdgPrimary,
  orderSdgGoals,
  sanitizeSdgIds,
} from "./taxonomy";
import {
  claimIsCurrent,
  computeClaimSignature,
  effectiveImpactStatus,
  hasVerifiedImpact,
  normalizeImpactDescription,
  successFeeEligibility,
} from "./verification";
import { MIN_IMPACT_DESCRIPTION_LENGTH } from "./status";
import { buildImpactSlide, withImpactSlide } from "../deck/deck.generator";
import { evaluateEligibility } from "../competitions/eligibility";
import type { DeckInput } from "../deck/deck.types";

const DESCRIPTION =
  "Our reusable packaging replaces single-use plastic for food brands and measures diverted waste per order.";

const startup = {
  sdgGoals: [12, 13],
  sdgPrimary: 12,
  impactDescription: DESCRIPTION,
  stage: "seed",
  sector: "climate",
  mrr: 0,
  location: "Lagos, Nigeria",
};

function claim(overrides: Record<string, unknown> = {}) {
  return {
    status: "verified" as const,
    impactDescription: DESCRIPTION,
    sdgGoals: [12, 13],
    sdgPrimary: 12,
    claimSignature: computeClaimSignature(startup),
    ...overrides,
  };
}

const deckInput: DeckInput = {
  name: "VerdeGrid",
  tagline: null,
  sector: "climate",
  stage: "seed",
  problem: null,
  solution: null,
  mrr: 0,
  monthlyGrowth: 0,
  activeUsers: 0,
  customers: 0,
  fundingRaised: 0,
  burnRate: 0,
  runwayMonths: 0,
  teamSize: 2,
  founderName: null,
  founderRole: null,
  founderBio: null,
  sdgGoals: [12, 13],
  sdgPrimary: 12,
  impactDescription: DESCRIPTION,
  impactVerified: false,
};

test("taxonomy exposes exactly the 17 official goals with stable ids", () => {
  assert.equal(SDG_GOALS.length, 17);
  assert.deepEqual(
    SDG_GOALS.map((goal) => goal.id),
    Array.from({ length: 17 }, (_, index) => index + 1)
  );
  assert.equal(SDG_GOALS[0].name, "No Poverty");
  assert.equal(SDG_GOALS[16].name, "Partnerships for the Goals");
  assert.equal(new Set(SDG_GOALS.map((goal) => goal.name)).size, 17);
  assert.equal(isSdgId(13), true);
  assert.equal(isSdgId(0), false);
  assert.equal(isSdgId(18), false);
  assert.equal(isSdgId("13"), false);
});

test("selection sanitizer dedupes, sorts and drops unknown ids", () => {
  assert.deepEqual(sanitizeSdgIds([13, 2, 13, "7", 99, null]), [2, 7, 13]);
  assert.deepEqual(sanitizeSdgIds("13, 2,abc,2,-1"), [2, 13]);
  assert.deepEqual(sanitizeSdgIds(undefined), []);
  assert.deepEqual(sanitizeSdgIds([]), []);
});

test("primary goal must belong to the selection", () => {
  assert.equal(normalizeSdgPrimary([3, 5], 5), 5);
  assert.equal(normalizeSdgPrimary([3, 5], 5.5), null);
  assert.equal(normalizeSdgPrimary([3, 5], 7), null);
  assert.equal(normalizeSdgPrimary([], 3), null);
  assert.equal(normalizeSdgPrimary([3], "3"), 3);
  assert.deepEqual(orderSdgGoals([3, 5, 7], 5), [5, 3, 7]);
});

test("claim signatures ignore ordering but detect material edits", () => {
  const reordered = computeClaimSignature({
    sdgGoals: [13, 12, 12],
    sdgPrimary: 12,
    impactDescription: DESCRIPTION,
  });
  assert.equal(reordered, computeClaimSignature(startup));
  assert.notEqual(
    reordered,
    computeClaimSignature({ ...startup, impactDescription: `${DESCRIPTION} Updated.` })
  );
  assert.notEqual(
    reordered,
    computeClaimSignature({ ...startup, sdgGoals: [12, 13, 7] })
  );
  assert.notEqual(reordered, computeClaimSignature({ ...startup, sdgPrimary: 13 }));
  assert.equal(
    normalizeImpactDescription("  line one\r\nline two  "),
    "line one\nline two"
  );
});

test("a verified claim becomes stale when the profile changes", () => {
  const verified = claim();
  assert.equal(effectiveImpactStatus(startup, verified), "verified");
  assert.equal(hasVerifiedImpact(startup, verified), true);

  assert.equal(effectiveImpactStatus(startup, null), "not_submitted");
  assert.equal(hasVerifiedImpact(startup, null), false);

  const editedGoal = { ...startup, sdgGoals: [12, 13, 7] };
  assert.equal(effectiveImpactStatus(editedGoal, verified), "stale");
  assert.equal(hasVerifiedImpact(editedGoal, verified), false);

  const editedDescription = { ...startup, impactDescription: "Completely different claim." };
  assert.equal(claimIsCurrent(verified, editedDescription), false);
  assert.equal(effectiveImpactStatus(editedDescription, verified), "stale");

  assert.equal(
    effectiveImpactStatus(startup, claim({ status: "pending" })),
    "pending"
  );
  assert.equal(
    effectiveImpactStatus(startup, claim({ status: "rejected" })),
    "rejected"
  );
});

test("success-fee eligibility follows verified impact only", () => {
  const verified = successFeeEligibility(startup, claim());
  assert.equal(verified.eligible, true);
  assert.equal(verified.rate, 0);
  assert.equal(verified.label, "0%");

  const pending = successFeeEligibility(startup, claim({ status: "pending" }));
  assert.equal(pending.eligible, false);
  assert.equal(pending.rate, 0.03);

  const declaredOnly = successFeeEligibility(startup, null);
  assert.equal(declaredOnly.eligible, false);
  assert.equal(declaredOnly.label, "3%");

  const stale = successFeeEligibility(
    { ...startup, sdgGoals: [12, 13, 7] },
    claim()
  );
  assert.equal(stale.eligible, false);
  assert.match(stale.reason, /reviewed again/i);
});

test("impact slide uses real data and never invents outcomes", () => {
  const slide = buildImpactSlide(deckInput);
  assert.ok(slide);
  assert.equal(slide.type, "impact");
  assert.match(slide.headline, /SDG 12/);
  assert.match(slide.body, /reusable packaging/);
  assert.match(slide.body, /self-declared/i);
  assert.equal(slide.metric, undefined);
  assert.ok(slide.bullets && slide.bullets.length > 0);
  assert.ok(slide.bullets.every((bullet) => /^SDG \d+ — /.test(bullet)));

  const verified = buildImpactSlide({ ...deckInput, impactVerified: true });
  assert.match(verified!.body, /reviewed and verified/i);

  const noDescription = buildImpactSlide({
    ...deckInput,
    impactDescription: null,
  });
  assert.match(noDescription!.body, /No impact metrics have been provided/i);

  assert.equal(buildImpactSlide({ ...deckInput, sdgGoals: [] }), null);

  // Appending twice must not duplicate the slide.
  const base = [{ type: "title", headline: "Hi", body: "There" }];
  const once = withImpactSlide(base, deckInput);
  const twice = withImpactSlide(once, deckInput);
  assert.equal(once.length, 2);
  assert.equal(twice.length, 2);
});

test("eligibility only enforces impact rules the host selected", () => {
  const open = evaluateEligibility(startup, {
    allStages: true,
    stages: [],
    sectors: [],
    minMrr: null,
    maxMrr: null,
    regions: [],
    requirements: null,
  });
  assert.equal(open.status, "open");

  const sdgRequired = {
    allStages: true,
    stages: [],
    sectors: [],
    minMrr: null,
    maxMrr: null,
    regions: [],
    requirements: null,
    requiredSdgs: [7],
  };
  assert.equal(evaluateEligibility(startup, sdgRequired).status, "ineligible");
  assert.equal(
    evaluateEligibility(startup, { ...sdgRequired, requiredSdgs: [13] }).status,
    "eligible"
  );

  const verifiedRequired = { ...sdgRequired, requiredSdgs: [], requireVerifiedImpact: true };

  assert.equal(
    evaluateEligibility(startup, verifiedRequired, { status: "not_submitted" }).status,
    "ineligible"
  );
  assert.equal(
    evaluateEligibility(startup, verifiedRequired, { status: "pending" }).status,
    "ineligible"
  );
  assert.equal(
    evaluateEligibility(startup, verifiedRequired, { status: "verified" }).status,
    "eligible"
  );
  // Selecting goals alone never satisfies a verified-impact requirement.
  assert.equal(
    evaluateEligibility(
      { ...startup, sdgGoals: [12, 13] },
      verifiedRequired,
      { status: "not_submitted" }
    ).status,
    "ineligible"
  );
});

test("impact description threshold is enforced consistently", () => {
  assert.equal(MIN_IMPACT_DESCRIPTION_LENGTH, 40);
  assert.ok(DESCRIPTION.length >= MIN_IMPACT_DESCRIPTION_LENGTH);
});
