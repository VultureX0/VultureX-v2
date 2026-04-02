import { useEffect, useMemo, useState } from 'react';
import {
  deleteLeaderboardEntry,
  getLeaderboardByCategory,
  upsertLeaderboardDefinition,
  upsertLeaderboardEntry,
} from '../services';
import type {
  LeaderboardCategory,
  LeaderboardDefinition,
  LeaderboardEntry,
  LeaderboardEntryUpsertInput,
} from '../types';

const categories: LeaderboardCategory[] = [
  'overall',
  'cleantech',
  'fintech',
  'web3',
  'impact',
  'rising',
  'investor',
];

const defaultEntry: LeaderboardEntryUpsertInput = {
  category: 'overall',
  rank: 1,
  name: '',
  sector: '',
  stage: '',
  score: 0,
  sdg: false,
  change: 0,
  desc: '',
  investors: 0,
};

export default function AdminLeaderboards() {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('overall');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [entryForm, setEntryForm] = useState<LeaderboardEntryUpsertInput>(defaultEntry);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => a.rank - b.rank), [entries]);

  async function refresh(category: LeaderboardCategory) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getLeaderboardByCategory(category, 100);
      setEntries(result.entries);
      setTitle(result.category);
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard entries.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh(activeCategory);
    setEntryForm((p) => ({ ...p, category: activeCategory }));
  }, [activeCategory]);

  async function onSaveDefinition() {
    setIsSaving(true);
    setError(null);
    try {
      const payload: LeaderboardDefinition = {
        id: activeCategory,
        title: title || activeCategory,
        description: description || undefined,
        updatedAt: new Date().toISOString(),
      };
      await upsertLeaderboardDefinition(payload);
      await refresh(activeCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save leaderboard definition.');
    } finally {
      setIsSaving(false);
    }
  }

  async function onSaveEntry() {
    if (!entryForm.name.trim() || !entryForm.sector.trim() || !entryForm.stage.trim()) {
      setError('Name, sector, and stage are required.');
      return;
    }
    if (!Number.isInteger(entryForm.rank) || entryForm.rank < 1) {
      setError('Rank must be a positive integer.');
      return;
    }

    const rankClash = entries.find((row) => row.id !== entryForm.id && row.rank === entryForm.rank);
    if (rankClash) {
      setError(`Rank ${entryForm.rank} is already used in ${activeCategory}.`);
      return;
    }

    const incomingKey = (entryForm.startupId || entryForm.name).trim().toLowerCase();
    const startupClash = entries.find((row) => {
      if (row.id === entryForm.id) return false;
      const existingKey = (row.startupId || row.name).trim().toLowerCase();
      return existingKey === incomingKey;
    });
    if (startupClash) {
      setError('This startup already exists in the selected category.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await upsertLeaderboardEntry({ ...entryForm, category: activeCategory });
      setEntryForm({ ...defaultEntry, category: activeCategory });
      await refresh(activeCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save leaderboard entry.');
    } finally {
      setIsSaving(false);
    }
  }

  function editEntry(entry: LeaderboardEntry) {
    setEntryForm({ ...entry });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeEntry(id: string) {
    if (!window.confirm('Delete this leaderboard row?')) return;
    await deleteLeaderboardEntry(id);
    await refresh(activeCategory);
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white">Admin: Leaderboards</h1>
          <p className="text-gray-400">Manage category definitions and ranked startup entries.</p>
        </header>

        {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-300">{error}</div>}

        <section className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  activeCategory === c
                    ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#c4b5fd]'
                    : 'border-[#1c1c3a] text-gray-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Leaderboard title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button disabled={isSaving} onClick={onSaveDefinition} className="px-4 py-2 rounded-lg bg-[#8b5cf6] text-white disabled:opacity-60">Save Definition</button>
        </section>

        <section className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Leaderboard Entry Form</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" type="number" placeholder="Rank" value={entryForm.rank} onChange={(e) => setEntryForm((p) => ({ ...p, rank: Number(e.target.value) || 1 }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Startup name" value={entryForm.name} onChange={(e) => setEntryForm((p) => ({ ...p, name: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Startup ID (optional)" value={entryForm.startupId ?? ''} onChange={(e) => setEntryForm((p) => ({ ...p, startupId: e.target.value || undefined }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Sector" value={entryForm.sector} onChange={(e) => setEntryForm((p) => ({ ...p, sector: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Stage" value={entryForm.stage} onChange={(e) => setEntryForm((p) => ({ ...p, stage: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" type="number" placeholder="Score" value={entryForm.score} onChange={(e) => setEntryForm((p) => ({ ...p, score: Number(e.target.value) || 0 }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" type="number" placeholder="Investor count" value={entryForm.investors} onChange={(e) => setEntryForm((p) => ({ ...p, investors: Number(e.target.value) || 0 }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" type="number" placeholder="Rank change" value={entryForm.change} onChange={(e) => setEntryForm((p) => ({ ...p, change: Number(e.target.value) || 0 }))} />
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={entryForm.sdg} onChange={(e) => setEntryForm((p) => ({ ...p, sdg: e.target.checked }))} /> SDG aligned</label>
          </div>
          <textarea className="w-full bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Description" value={entryForm.desc} onChange={(e) => setEntryForm((p) => ({ ...p, desc: e.target.value }))} />
          <div className="flex gap-3">
            <button disabled={isSaving} onClick={onSaveEntry} className="px-4 py-2 rounded-lg bg-[#8b5cf6] text-white disabled:opacity-60">Save Entry</button>
            <button onClick={() => setEntryForm({ ...defaultEntry, category: activeCategory })} className="px-4 py-2 rounded-lg border border-[#1c1c3a]">Clear</button>
          </div>
        </section>

        <section className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-3">Current Entries ({activeCategory})</h2>
          <div className="space-y-2">
            {sortedEntries.map((entry) => (
              <div key={entry.id} className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-white text-sm">#{entry.rank} {entry.name}</div>
                  <div className="text-gray-400 text-xs">Score {entry.score} | Investors {entry.investors} | Change {entry.change}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editEntry(entry)} className="text-xs px-2 py-1 rounded border border-[#1c1c3a]">Edit</button>
                  <button onClick={() => removeEntry(entry.id)} className="text-xs px-2 py-1 rounded border border-red-500/30 text-red-300">Delete</button>
                </div>
              </div>
            ))}
            {!isLoading && sortedEntries.length === 0 && <div className="text-sm text-gray-500">No entries yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
