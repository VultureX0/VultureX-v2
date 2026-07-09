import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ============================================
// USERS
// ============================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  role: text("role", { enum: ["startup", "investor"] }).notNull(),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ============================================
// STARTUPS
// ============================================
export const startups = pgTable(
  "startups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    sector: text("sector").notNull(),
    stage: text("stage").notNull(),
    location: text("location"),
    website: text("website"),
    logoUrl: text("logo_url"),
    // Narrative
    problem: text("problem"),
    solution: text("solution"),
    // Traction
    mrr: integer("mrr").default(0),
    monthlyGrowth: numeric("monthly_growth", { precision: 5, scale: 2 }).default("0"),
    activeUsers: integer("active_users").default(0),
    customers: integer("customers").default(0),
    // Financials
    fundingRaised: integer("funding_raised").default(0),
    burnRate: integer("burn_rate").default(0),
    runwayMonths: integer("runway_months").default(0),
    // Team
    founderName: text("founder_name"),
    founderRole: text("founder_role"),
    founderBio: text("founder_bio"),
    founderLinkedin: text("founder_linkedin"),
    teamSize: integer("team_size").default(1),
    // Platform
    tags: text("tags").array(),
    stripeConnected: boolean("stripe_connected").default(false),
    score: numeric("score", { precision: 5, scale: 2 }).default("0"),
    scoreBreakdown: jsonb("score_breakdown"),
    isPublic: boolean("is_public").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_startups_sector_score").on(table.sector, table.score),
    index("idx_startups_score").on(table.score),
  ]
);

// ============================================
// INVESTORS
// ============================================
export const investors = pgTable("investors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  fullName: text("full_name").notNull(),
  investorType: text("investor_type").notNull(),
  firmName: text("firm_name"),
  location: text("location"),
  checkSizeMin: integer("check_size_min").default(0),
  checkSizeMax: integer("check_size_max").default(0),
  stageFocus: text("stage_focus").array(),
  sectorFocus: text("sector_focus").array(),
  investmentThesis: text("investment_thesis"),
  linkedin: text("linkedin"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ============================================
// PITCH DECKS
// ============================================
export const decks = pgTable("decks", {
  id: uuid("id").primaryKey().defaultRandom(),
  startupId: uuid("startup_id")
    .references(() => startups.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  slides: jsonb("slides").notNull(),
  template: text("template").default("minimal"),
  shareToken: text("share_token").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ============================================
// COMPETITIONS
// ============================================
export const competitions = pgTable("competitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  sector: text("sector"),
  prize: text("prize"),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  status: text("status", { enum: ["active", "completed"] }).default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const competitionEntries = pgTable(
  "competition_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    competitionId: uuid("competition_id")
      .references(() => competitions.id, { onDelete: "cascade" })
      .notNull(),
    startupId: uuid("startup_id")
      .references(() => startups.id, { onDelete: "cascade" })
      .notNull(),
    deckId: uuid("deck_id").references(() => decks.id),
    enteredAt: timestamp("entered_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_competition_startup").on(
      table.competitionId,
      table.startupId
    ),
  ]
);

// ============================================
// INTERACTIONS
// ============================================
export const interests = pgTable(
  "interests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    investorId: uuid("investor_id")
      .references(() => investors.id, { onDelete: "cascade" })
      .notNull(),
    startupId: uuid("startup_id")
      .references(() => startups.id, { onDelete: "cascade" })
      .notNull(),
    message: text("message"),
    status: text("status", { enum: ["pending", "accepted", "declined"] }).default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_investor_startup").on(table.investorId, table.startupId),
  ]
);

export const profileViews = pgTable("profile_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  startupId: uuid("startup_id")
    .references(() => startups.id, { onDelete: "cascade" })
    .notNull(),
  viewerId: uuid("viewer_id").references(() => users.id),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow(),
});

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    startupId: uuid("startup_id")
      .references(() => startups.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("unique_user_startup_bookmark").on(table.userId, table.startupId),
  ]
);

export const deckViews = pgTable("deck_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  deckId: uuid("deck_id")
    .references(() => decks.id, { onDelete: "cascade" })
    .notNull(),
  viewerEmail: text("viewer_email"),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow(),
});
