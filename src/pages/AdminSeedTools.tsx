import { useMemo, useState } from 'react';
import {
  upsertCompetition,
  upsertCompetitionWinner,
  upsertLeaderboardDefinition,
  upsertLeaderboardEntry,
} from '../services';
import type { LeaderboardCategory, LeaderboardDefinition } from '../types';
import { COMPETITION_SEED, COMPETITION_WINNER_SEED } from '../services/competitions/competition.seed';
import { LEADERBOARD_ENTRY_SEED } from '../services/leaderboards/leaderboard.seed';

type SeedStatus = 'idle' | 'running' | 'done' | 'failed';

const leaderboardDefinitions: LeaderboardDefinition[] = [
  { id: 'overall', title: 'Top 10 Overall' },
  { id: 'cleantech', title: 'Top 10 CleanTech' },
  { id: 'fintech', title: 'Top 10 FinTech' },
  { id: 'web3', title: 'Top 10 Web3' },
  { id: 'impact', title: 'Top 10 Impact' },
  { id: 'rising', title: 'Fastest Rising' },
  { id: 'investor', title: 'Most Investor Interest' },
];

function extractCategorySummary() {
  const counts = new Map<LeaderboardCategory, number>();
  for (const row of LEADERBOARD_ENTRY_SEED) {
    const current = counts.get(row.category) ?? 0;
    counts.set(row.category, current + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export default function AdminSeedTools() {
  const [status, setStatus] = useState<SeedStatus>('idle');
  const [message, setMessage] = useState('');
  const summary = useMemo(() => extractCategorySummary(), []);

  async function seedCompetitionsOnly() {
    setStatus('running');
    setMessage('Seeding competitions...');
    try {
      await Promise.all(COMPETITION_SEED.map((row) => upsertCompetition(row)));
      await Promise.all(COMPETITION_WINNER_SEED.map((row) => upsertCompetitionWinner(row)));
      setStatus('done');
      setMessage(
        `Seeded ${COMPETITION_SEED.length} competitions and ${COMPETITION_WINNER_SEED.length} winners.`
      );
    } catch (err) {
      setStatus('failed');
      setMessage(err instanceof Error ? err.message : 'Failed to seed competitions.');
    }
  }

  async function seedLeaderboardsOnly() {
    setStatus('running');
    setMessage('Seeding leaderboards...');
    try {
      const now = new Date().toISOString();
      await Promise.all(
        leaderboardDefinitions.map((row) =>
          upsertLeaderboardDefinition({ ...row, updatedAt: now })
        )
      );
      await Promise.all(
        LEADERBOARD_ENTRY_SEED.map((row) =>
          upsertLeaderboardEntry({ ...row })
        )
      );
      setStatus('done');
      setMessage(
        `Seeded ${leaderboardDefinitions.length} leaderboard definitions and ${LEADERBOARD_ENTRY_SEED.length} entries.`
      );
    } catch (err) {
      setStatus('failed');
      setMessage(err instanceof Error ? err.message : 'Failed to seed leaderboards.');
    }
  }

  async function seedAll() {
    setStatus('running');
    setMessage('Seeding all datasets...');
    try {
      const now = new Date().toISOString();
      await Promise.all(COMPETITION_SEED.map((row) => upsertCompetition(row)));
      await Promise.all(COMPETITION_WINNER_SEED.map((row) => upsertCompetitionWinner(row)));
      await Promise.all(
        leaderboardDefinitions.map((row) =>
          upsertLeaderboardDefinition({ ...row, updatedAt: now })
        )
      );
      await Promise.all(LEADERBOARD_ENTRY_SEED.map((row) => upsertLeaderboardEntry({ ...row })));
      setStatus('done');
      setMessage('Seeded competitions, winners, leaderboard definitions, and entries.');
    } catch (err) {
      setStatus('failed');
      setMessage(err instanceof Error ? err.message : 'Failed to seed all datasets.');
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white">Admin: Data Seed Tools</h1>
          <p className="text-gray-400">
            Bootstrap Firestore with initial competitions and leaderboard data.
          </p>
        </header>

        <section className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Seed Controls</h2>
          <div className="flex flex-wrap gap-3">
            <button
              disabled={status === 'running'}
              onClick={seedCompetitionsOnly}
              className="px-4 py-2 rounded-lg border border-[#1c1c3a] text-gray-200 disabled:opacity-60"
            >
              Seed Competitions + Winners
            </button>
            <button
              disabled={status === 'running'}
              onClick={seedLeaderboardsOnly}
              className="px-4 py-2 rounded-lg border border-[#1c1c3a] text-gray-200 disabled:opacity-60"
            >
              Seed Leaderboards
            </button>
            <button
              disabled={status === 'running'}
              onClick={seedAll}
              className="px-4 py-2 rounded-lg bg-[#8b5cf6] text-white disabled:opacity-60"
            >
              Seed Everything
            </button>
          </div>

          <div
            className={`rounded-xl border p-3 text-sm ${
              status === 'failed'
                ? 'border-red-500/30 bg-red-500/10 text-red-300'
                : status === 'done'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-[#1c1c3a] bg-[#09091a] text-gray-300'
            }`}
          >
            {message || 'No seed operation executed yet.'}
          </div>
        </section>

        <section className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-3">Seed Summary</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Competitions: {COMPETITION_SEED.length}</li>
            <li>Winners: {COMPETITION_WINNER_SEED.length}</li>
            <li>Leaderboard Definitions: {leaderboardDefinitions.length}</li>
            <li>Leaderboard Entries: {LEADERBOARD_ENTRY_SEED.length}</li>
          </ul>
          <div className="mt-4 text-sm text-gray-400">
            <div className="mb-1">Entries by category:</div>
            <ul className="space-y-1">
              {summary.map(([category, count]) => (
                <li key={category}>{category}: {count}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
