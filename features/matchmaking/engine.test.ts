import assert from "node:assert/strict";
import test from "node:test";
import { MATCH_CONFIG, scorePair, startupPairKey } from "./engine";
import type { MatchProfile } from "./types";

function profile(overrides: Partial<MatchProfile>): MatchProfile {
  return {
    id: overrides.id ?? "00000000-0000-0000-0000-000000000001",
    userId: overrides.userId ?? "10000000-0000-0000-0000-000000000001",
    name: overrides.name ?? "Startup",
    slug: overrides.slug ?? "startup",
    tagline: overrides.tagline ?? null,
    sector: overrides.sector ?? null,
    stage: overrides.stage ?? "seed",
    location: overrides.location ?? null,
    problem: overrides.problem ?? null,
    solution: overrides.solution ?? null,
    tags: overrides.tags ?? null,
    offerings: overrides.offerings ?? null,
    needs: overrides.needs ?? null,
    targetCustomers: overrides.targetCustomers ?? null,
    isPublic: overrides.isPublic ?? true,
  };
}

const bottleBrand = profile({
  id: "aaaaaaaa-0000-0000-0000-000000000001",
  name: "Refill Water Co",
  sector: "Climate",
  location: "Pune, India",
  tagline: "Reusable water bottles for offices",
  problem: "Offices generate huge amounts of single-use plastic waste.",
  solution: "We sell reusable bottles to companies and campuses.",
  needs: ["packaging", "logistics"],
  targetCustomers: ["businesses", "enterprise"],
});

const packagingSupplier = profile({
  id: "bbbbbbbb-0000-0000-0000-000000000002",
  name: "EcoPack Solutions",
  sector: "Climate",
  location: "Mumbai, India",
  tagline: "Sustainable packaging for growing brands",
  problem: "Brands struggle to find packaging that is both affordable and compostable.",
  solution: "We manufacture compostable packaging and labels for food and consumer brands.",
  offerings: ["sustainable packaging", "compostable labels"],
  targetCustomers: ["food brands", "businesses"],
});

const foodBrand = profile({
  id: "cccccccc-0000-0000-0000-000000000003",
  name: "GreenBite Foods",
  sector: "E-commerce",
  location: "Mumbai, India",
  tagline: "Packaged healthy snacks sold online",
  problem: "Consumers want healthy snacks but shelves are full of sugary options.",
  solution: "We sell packaged snacks direct to consumers through our online store.",
  offerings: ["packaged snacks"],
  targetCustomers: ["consumers"],
});

const logisticsProvider = profile({
  id: "dddddddd-0000-0000-0000-000000000004",
  name: "SwiftMile Logistics",
  sector: "Other",
  location: "Mumbai, India",
  tagline: "Last-mile delivery and warehousing",
  solution: "We run last-mile delivery and warehousing for online brands.",
  offerings: ["last-mile delivery", "warehousing"],
  targetCustomers: ["online brands", "retailers"],
});

// Same industry, same broad capability, no distinct offering or stated need.
const saasA = profile({
  id: "eeeeeeee-0000-0000-0000-000000000005",
  name: "FlowDesk",
  sector: "SaaS",
  tagline: "Workflow software for operations teams",
  solution: "We build workflow software for operations teams.",
  offerings: ["workflow software"],
  targetCustomers: ["teams"],
});

const saasB = profile({
  id: "ffffffff-0000-0000-0000-000000000006",
  name: "MetricLoop",
  sector: "SaaS",
  tagline: "SaaS software for teams",
  solution: "We build software for teams.",
  offerings: ["software"],
  targetCustomers: ["teams"],
});

test("1. a stated need matched by another startup's offering produces a strong, eligible match", () => {
  const result = scorePair(bottleBrand, packagingSupplier);
  assert.equal(result.eligible, true);
  assert.ok(result.score >= MATCH_CONFIG.strengthBands.high, `score ${result.score}`);
  const supplier = result.dimensions.find((dimension) => dimension.dimension === "supplier");
  assert.ok(supplier && supplier.score !== null && supplier.score >= 0.72);
  assert.ok(
    result.reasons.aToB.some((reason) => reason.detail.includes("packaging")),
    "buyer side should be told why packaging is relevant"
  );
  assert.ok(
    result.reasons.bToA.some((reason) => reason.label === "Potential customer"),
    "supplier side should see the customer angle"
  );
});

test("2. complementary offerings match even when the startups sit in different industries", () => {
  const result = scorePair(foodBrand, logisticsProvider);
  assert.equal(result.eligible, true, `score ${result.score}`);
  assert.equal(result.relationshipType, "complementary");
  const complementary = result.dimensions.find((d) => d.dimension === "complementary");
  assert.ok(complementary && complementary.score !== null && complementary.score >= 0.85);
  assert.ok(result.reasons.aToB.some((reason) => reason.detail.includes("logistics") || reason.detail.includes("fulfilment")));
});

test("3. sharing an industry alone never produces a recommendation", () => {
  const result = scorePair(saasA, saasB);
  assert.equal(result.eligible, false);
  assert.ok(result.score < MATCH_CONFIG.minScore);
});

test("4. weak keyword overlap does not create an unjustified strong match", () => {
  const left = profile({
    name: "Alpha",
    sector: "SaaS",
    tagline: "A platform for modern teams",
    solution: "We build a platform.",
  });
  const right = profile({
    name: "Beta",
    sector: "Gaming",
    tagline: "A platform for gamers",
    solution: "We build a platform.",
  });
  const result = scorePair(left, right);
  assert.equal(result.eligible, false);
  assert.ok(result.score < MATCH_CONFIG.minScore);
});

test("5. missing profile fields never crash the engine", () => {
  const empty = profile({ name: "Empty", tagline: null, sector: null, solution: null });
  const result = scorePair(empty, packagingSupplier);
  assert.equal(result.eligible, false);
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.deepEqual(result.reasons.aToB, []);
});

test("6. insufficiently informative profiles do not generate recommendations", () => {
  const sparse = profile({ name: "Sparse", sector: "Climate" });
  const other = profile({ name: "AlsoSparse", sector: "Climate" });
  const result = scorePair(sparse, other);
  assert.equal(result.eligible, false);
  assert.ok(result.score < MATCH_CONFIG.minScore, `score ${result.score}`);
  assert.deepEqual(result.reasons.aToB, []);
});

test("7. scores stay in range and reasons reflect the contributing signals", () => {
  const pairs: [MatchProfile, MatchProfile][] = [
    [bottleBrand, packagingSupplier],
    [foodBrand, logisticsProvider],
    [saasA, saasB],
    [bottleBrand, foodBrand],
  ];
  for (const [left, right] of pairs) {
    const result = scorePair(left, right);
    assert.ok(result.score >= 0 && result.score <= 100);
    for (const reason of [...result.reasons.aToB, ...result.reasons.bToA]) {
      assert.ok(reason.detail.length > 0);
      const mentionsBoth = reason.detail.includes(left.name) || reason.detail.includes(right.name);
      assert.ok(mentionsBoth, `${reason.detail} should reference a matched startup`);
    }
    const points = result.dimensions.reduce((sum, dimension) => sum + dimension.points, 0);
    if (result.eligible) {
      assert.ok(Math.abs(points - result.score) <= 1.5, `points ${points} vs ${result.score}`);
    }
  }
});

test("8. the same inputs always produce the same score and reasons", () => {
  const first = scorePair(bottleBrand, packagingSupplier);
  const second = scorePair(bottleBrand, packagingSupplier);
  assert.deepEqual(first, second);
});

test("the pair key is order independent", () => {
  const a = "aaaaaaaa-0000-0000-0000-000000000001";
  const b = "bbbbbbbb-0000-0000-0000-000000000002";
  assert.equal(startupPairKey(a, b), startupPairKey(b, a));
  assert.equal(startupPairKey(a, b), `${a}:${b}`);
});

test("explicit supplier fit outranks a purely same-industry pair", () => {
  const supplierMatch = scorePair(bottleBrand, packagingSupplier);
  const industryOnly = scorePair(saasA, saasB);
  assert.ok(supplierMatch.score > industryOnly.score);
});
