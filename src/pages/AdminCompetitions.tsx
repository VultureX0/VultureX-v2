import { useEffect, useMemo, useState } from 'react';
import {
  deleteCompetition,
  deleteCompetitionWinner,
  getCompetitionsByStatus,
  getPastCompetitionWinners,
  upsertCompetition,
  upsertCompetitionWinner,
} from '../services';
import type {
  Competition,
  CompetitionStatus,
  CompetitionUpsertInput,
  CompetitionWinner,
  CompetitionWinnerUpsertInput,
} from '../types';

const statuses: CompetitionStatus[] = ['active', 'upcoming', 'completed'];
const statusOrder: Record<CompetitionStatus, number> = {
  upcoming: 0,
  active: 1,
  completed: 2,
};

const defaultCompetition: CompetitionUpsertInput = {
  title: '',
  host: '',
  prize: '',
  sector: '',
  stage: '',
  applicants: 0,
  criteria: [],
  color: 'from-[#8b5cf6] to-[#7c3aed]',
  sdg: false,
  status: 'upcoming',
};

const defaultWinner: CompetitionWinnerUpsertInput = {
  competition: '',
  winner: '',
  prize: '',
  raised: '',
  sector: '',
  place: 1,
};

export default function AdminCompetitions() {
  const [items, setItems] = useState<Competition[]>([]);
  const [winners, setWinners] = useState<CompetitionWinner[]>([]);
  const [form, setForm] = useState<CompetitionUpsertInput>(defaultCompetition);
  const [winnerForm, setWinnerForm] = useState<CompetitionWinnerUpsertInput>(defaultWinner);
  const [criteriaText, setCriteriaText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(
    () => ({
      active: items.filter((x) => x.status === 'active'),
      upcoming: items.filter((x) => x.status === 'upcoming'),
      completed: items.filter((x) => x.status === 'completed'),
    }),
    [items]
  );

  async function refresh() {
    setIsLoading(true);
    setError(null);
    try {
      const [active, upcoming, completed, winnerList] = await Promise.all([
        getCompetitionsByStatus('active'),
        getCompetitionsByStatus('upcoming'),
        getCompetitionsByStatus('completed'),
        getPastCompetitionWinners(25),
      ]);
      setItems([...active, ...upcoming, ...completed]);
      setWinners(winnerList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitions admin data.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSaveCompetition() {
    const normalizedCriteria = criteriaText
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    if (!form.title.trim() || !form.host.trim() || !form.prize.trim() || !form.sector.trim() || !form.stage.trim()) {
      setError('Title, host, prize, sector, and stage are required.');
      return;
    }
    if (form.status === 'upcoming' && !(form.opensOn ?? '').trim()) {
      setError('Upcoming competitions require an opensOn value.');
      return;
    }
    if ((form.status === 'active' || form.status === 'completed') && !(form.deadline ?? '').trim()) {
      setError('Active/completed competitions require a deadline value.');
      return;
    }

    const existing = form.id ? items.find((x) => x.id === form.id) : null;
    if (existing && statusOrder[form.status] < statusOrder[existing.status]) {
      setError('Invalid transition. Status can only move from upcoming to active to completed.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: CompetitionUpsertInput = {
        ...form,
        criteria: normalizedCriteria,
      };
      await upsertCompetition(payload);
      setForm(defaultCompetition);
      setCriteriaText('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save competition.');
    } finally {
      setSaving(false);
    }
  }

  function editCompetition(item: Competition) {
    setForm(item);
    setCriteriaText(item.criteria.join(', '));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeCompetition(id: string) {
    if (!window.confirm('Delete this competition?')) return;
    await deleteCompetition(id);
    await refresh();
  }

  async function onSaveWinner() {
    if (!winnerForm.competition.trim() || !winnerForm.winner.trim() || !winnerForm.prize.trim() || !winnerForm.raised.trim() || !winnerForm.sector.trim()) {
      setError('Competition, winner, prize, raised, and sector are required for winner entries.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await upsertCompetitionWinner(winnerForm);
      setWinnerForm(defaultWinner);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save winner.');
    } finally {
      setSaving(false);
    }
  }

  function editWinner(item: CompetitionWinner) {
    setWinnerForm({ ...item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeWinner(id: string) {
    if (!window.confirm('Delete this winner entry?')) return;
    await deleteCompetitionWinner(id);
    await refresh();
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white">Admin: Competitions</h1>
          <p className="text-gray-400">Create, update, and remove competitions and winner entries.</p>
        </header>

        {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-300">{error}</div>}

        <section className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Competition Form</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Host" value={form.host} onChange={(e) => setForm((p) => ({ ...p, host: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Prize" value={form.prize} onChange={(e) => setForm((p) => ({ ...p, prize: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Sector" value={form.sector} onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Stage" value={form.stage} onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Color class" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Deadline (active/completed)" value={form.deadline ?? ''} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value || undefined }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Opens On (upcoming)" value={form.opensOn ?? ''} onChange={(e) => setForm((p) => ({ ...p, opensOn: e.target.value || undefined }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" type="number" placeholder="Applicants" value={form.applicants} onChange={(e) => setForm((p) => ({ ...p, applicants: Number(e.target.value) || 0 }))} />
            <select className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CompetitionStatus }))}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.sdg} onChange={(e) => setForm((p) => ({ ...p, sdg: e.target.checked }))} /> SDG aligned
            </label>
          </div>
          <textarea className="w-full bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Criteria comma-separated" value={criteriaText} onChange={(e) => setCriteriaText(e.target.value)} />
          <div className="flex gap-3">
            <button disabled={saving} onClick={onSaveCompetition} className="px-4 py-2 rounded-lg bg-[#8b5cf6] text-white disabled:opacity-60">Save Competition</button>
            <button onClick={() => { setForm(defaultCompetition); setCriteriaText(''); }} className="px-4 py-2 rounded-lg border border-[#1c1c3a]">Clear</button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {statuses.map((status) => (
            <div key={status} className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-4">
              <h3 className="text-white font-semibold capitalize mb-3">{status}</h3>
              <div className="space-y-3">
                {(grouped[status] ?? []).map((c) => (
                  <div key={c.id} className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-3">
                    <div className="text-white text-sm font-medium">{c.title}</div>
                    <div className="text-gray-400 text-xs">{c.host}</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => editCompetition(c)} className="text-xs px-2 py-1 rounded border border-[#1c1c3a]">Edit</button>
                      <button onClick={() => removeCompetition(c.id)} className="text-xs px-2 py-1 rounded border border-red-500/30 text-red-300">Delete</button>
                    </div>
                  </div>
                ))}
                {!isLoading && (grouped[status] ?? []).length === 0 && <div className="text-sm text-gray-500">No items.</div>}
              </div>
            </div>
          ))}
        </section>

        <section className="bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Past Winners Form</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Competition" value={winnerForm.competition} onChange={(e) => setWinnerForm((p) => ({ ...p, competition: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Winner" value={winnerForm.winner} onChange={(e) => setWinnerForm((p) => ({ ...p, winner: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Sector" value={winnerForm.sector} onChange={(e) => setWinnerForm((p) => ({ ...p, sector: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Prize" value={winnerForm.prize} onChange={(e) => setWinnerForm((p) => ({ ...p, prize: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" placeholder="Raised" value={winnerForm.raised} onChange={(e) => setWinnerForm((p) => ({ ...p, raised: e.target.value }))} />
            <input className="bg-[#09091a] border border-[#1c1c3a] rounded-lg p-2" type="number" placeholder="Place" value={winnerForm.place ?? 1} onChange={(e) => setWinnerForm((p) => ({ ...p, place: Number(e.target.value) || 1 }))} />
          </div>
          <div className="flex gap-3">
            <button disabled={saving} onClick={onSaveWinner} className="px-4 py-2 rounded-lg bg-[#8b5cf6] text-white disabled:opacity-60">Save Winner</button>
            <button onClick={() => setWinnerForm(defaultWinner)} className="px-4 py-2 rounded-lg border border-[#1c1c3a]">Clear</button>
          </div>

          <div className="space-y-2">
            {winners.map((w) => (
              <div key={w.id} className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-white text-sm">{w.competition} - {w.winner}</div>
                  <div className="text-gray-400 text-xs">{w.prize} | {w.raised}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editWinner(w)} className="text-xs px-2 py-1 rounded border border-[#1c1c3a]">Edit</button>
                  <button onClick={() => removeWinner(w.id)} className="text-xs px-2 py-1 rounded border border-red-500/30 text-red-300">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
