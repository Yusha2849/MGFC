import React, { useState, useEffect, useMemo } from 'react';
import { useClub, YOUTH_AGE_ORDER, NEXT_SQUAD_MAP } from '../../context/ClubContext';
import { SeasonArchive } from '../../types';
import { formatDateMMDDYYYY } from '../../utils/dateFormat';
import {
  Archive,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  History,
  Layers,
  RotateCcw,
  Trash2,
  TrendingUp,
  Users,
  X,
  AlertTriangle,
} from 'lucide-react';

export type SeasonManagerTab = 'archive' | 'promote' | 'history';

interface SeasonManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SeasonManagerTab;
  initialSourceSquadId?: string;
}

export const SeasonManagerModal: React.FC<SeasonManagerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'archive',
  initialSourceSquadId,
}) => {
  const {
    currentSeasonYear,
    registrationSeasonLabel,
    squads,
    players,
    teamFeeSheets,
    fixtures,
    transactions,
    trialApplications,
    seasonArchives,
    archiveSeasonAndStartFresh,
    promoteSquadPlayers,
    restoreSeasonArchive,
    deleteSeasonArchive,
    showToast,
  } = useClub();

  const [activeTab, setActiveTab] = useState<SeasonManagerTab>(initialTab);

  // Archive & Start Fresh form state
  const [newSeasonYear, setNewSeasonYear] = useState<number>(currentSeasonYear + 1);
  const [newRegLabel, setNewRegLabel] = useState<string>(`${currentSeasonYear + 1} Season`);
  const [rosterMode, setRosterMode] = useState<'promote_all' | 'fresh_empty' | 'keep_current'>('promote_all');
  const [u13Handling, setU13Handling] = useState<'graduate' | 'keep'>('graduate');
  const [skipInactive, setSkipInactive] = useState<boolean>(true);
  const [feeResetMode, setFeeResetMode] = useState<'keep_concessions' | 'standard_all'>('keep_concessions');
  const [resetFixturesAndStandings, setResetFixturesAndStandings] = useState<boolean>(true);
  const [clearSeasonTransactions, setClearSeasonTransactions] = useState<boolean>(true);
  const [clearRegistrations, setClearRegistrations] = useState<boolean>(true);
  const [archiveNotes, setArchiveNotes] = useState<string>('');
  const [confirmArchiveReady, setConfirmArchiveReady] = useState<boolean>(false);

  // Move Squads Forward (single squad-to-squad) state
  const [sourceSquadId, setSourceSquadId] = useState<string>(initialSourceSquadId || 'u7');
  const [targetSquadId, setTargetSquadId] = useState<string>(NEXT_SQUAD_MAP[initialSourceSquadId || 'u7'] || 'u8');
  const [moveMode, setMoveMode] = useState<'append' | 'replace'>('append');
  const [moveSkipInactive, setMoveSkipInactive] = useState<boolean>(true);
  const [moveResetFees, setMoveResetFees] = useState<boolean>(true);
  const [moveFeeResetMode, setMoveFeeResetMode] = useState<'keep_concessions' | 'standard_all'>('keep_concessions');

  // Archive Inspector & confirmation states
  const [expandedArchiveId, setExpandedArchiveId] = useState<string | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      const defaultSource = initialSourceSquadId && NEXT_SQUAD_MAP[initialSourceSquadId] !== undefined
        ? initialSourceSquadId
        : 'u7';
      setSourceSquadId(defaultSource);
      setTargetSquadId(NEXT_SQUAD_MAP[defaultSource] || 'graduate');
      setNewSeasonYear(currentSeasonYear + 1);
      setNewRegLabel(`${currentSeasonYear + 1} Season`);
      setConfirmArchiveReady(false);
      setConfirmRestoreId(null);
      setConfirmDeleteId(null);
    }
  }, [isOpen, initialTab, initialSourceSquadId, currentSeasonYear]);

  // Sync suggested target squad when user changes source squad
  const handleSourceChange = (nextSource: string) => {
    setSourceSquadId(nextSource);
    const suggested = NEXT_SQUAD_MAP[nextSource];
    setTargetSquadId(suggested || 'graduate');
  };

  // Current Season Live Summary
  const liveSummary = useMemo(() => {
    let billed = 0;
    let collected = 0;
    let outstanding = 0;
    let activeCount = 0;

    teamFeeSheets.forEach(sheet => {
      sheet.players.forEach(row => {
        if (!row.isDonationRow && !row.isInactive) activeCount += 1;
        billed += row.amountDue || 0;
        collected += row.totalPaid || 0;
        const bal = row.isDonationRow
          ? (row.amountDue || 0) - (row.totalPaid || 0)
          : row.isInactive
          ? 0
          : Math.max(0, (row.amountDue || 0) - (row.totalPaid || 0));
        outstanding += bal;
      });
    });

    return {
      totalPlayers: players.length,
      activeCount,
      billed,
      collected,
      outstanding,
      collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 0,
      completedFixtures: fixtures.filter(f => f.status === 'Completed').length,
      totalFixtures: fixtures.length,
      totalTransactions: transactions.length,
      totalRegistrations: trialApplications.length,
    };
  }, [teamFeeSheets, players, fixtures, transactions, trialApplications]);

  // Source squad player preview for Move Players Forward tab
  const sourcePreview = useMemo(() => {
    const sheet = teamFeeSheets.find(s => s.id === sourceSquadId);
    const squadPlayers = players.filter(p => p.squadId === sourceSquadId);
    const seen = new Set<string>();
    const items: { id: string; name: string; cardNumber: string; amountDue: number; inactive: boolean }[] = [];

    if (sheet) {
      sheet.players.forEach(r => {
        if (r.isDonationRow) return;
        const matched = squadPlayers.find(p => p.id === r.id);
        if (matched) seen.add(matched.id);
        items.push({
          id: r.id,
          name: `${r.name} ${r.surname}`.trim(),
          cardNumber: r.cardNumber || matched?.safaNumber || 'Pending',
          amountDue: r.amountDue,
          inactive: !!r.isInactive || matched?.status === 'Inactive',
        });
      });
    }
    squadPlayers.forEach(p => {
      if (seen.has(p.id)) return;
      items.push({
        id: p.id,
        name: `${p.firstName} ${p.lastName === '—' ? '' : p.lastName}`.trim(),
        cardNumber: p.safaNumber || 'Pending',
        amountDue: p.feeDue,
        inactive: p.status === 'Inactive',
      });
    });

    const eligible = moveSkipInactive ? items.filter(i => !i.inactive) : items;
    return { all: items, eligible };
  }, [teamFeeSheets, players, sourceSquadId, moveSkipInactive]);

  const targetSquadCount = useMemo(() => {
    if (targetSquadId === 'graduate') return 0;
    const sheet = teamFeeSheets.find(s => s.id === targetSquadId);
    return sheet ? sheet.players.filter(r => !r.isDonationRow).length : players.filter(p => p.squadId === targetSquadId).length;
  }, [teamFeeSheets, players, targetSquadId]);

  if (!isOpen) return null;

  const handleConfirmArchiveAndRollover = () => {
    archiveSeasonAndStartFresh({
      newSeasonYear,
      newRegistrationLabel: newRegLabel,
      rosterMode,
      u13Handling,
      skipInactive,
      feeResetMode,
      resetFixturesAndStandings,
      clearSeasonTransactions,
      clearRegistrations,
      notes: archiveNotes.trim() || undefined,
    });
    setConfirmArchiveReady(false);
    setArchiveNotes('');
    setActiveTab('history');
  };

  const handleMoveSquadSubmit = () => {
    const res = promoteSquadPlayers({
      sourceSquadId,
      targetSquadId,
      mode: moveMode,
      skipInactive: moveSkipInactive,
      resetFeesForNewSeason: moveResetFees,
      feeResetMode: moveFeeResetMode,
    });
    if (res.movedCount > 0 && NEXT_SQUAD_MAP[targetSquadId]) {
      setSourceSquadId(targetSquadId);
      setTargetSquadId(NEXT_SQUAD_MAP[targetSquadId] || 'graduate');
    }
  };

  const downloadArchiveJson = (arch: SeasonArchive) => {
    const blob = new Blob([JSON.stringify(arch, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MGFC_${arch.seasonYear}_Season_Archive.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${arch.seasonLabel} archive JSON.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-4xl w-full shadow-2xl relative border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0B1F3A] text-white px-6 py-5 border-b-4 border-[#E31E24] flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#E31E24] flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Annual Season Lifecycle · Active Year: {currentSeasonYear} · Reg: {registrationSeasonLabel}</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl uppercase tracking-wide mt-0.5">
              Season Archive, Fresh Start & Player Progression
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close season manager"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Bar */}
        <div className="px-6 pt-4 pb-2 bg-[#F0F4F9] border-b border-slate-200 flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'archive'
                ? 'bg-[#E31E24] text-white shadow-xs'
                : 'bg-white text-[#0B1F3A] border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive {currentSeasonYear} & Start Fresh</span>
          </button>

          <button
            onClick={() => setActiveTab('promote')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'promote'
                ? 'bg-[#E31E24] text-white shadow-xs'
                : 'bg-white text-[#0B1F3A] border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Move Players Forward (U6→U13)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'bg-white text-[#0B1F3A] border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Archived Years ({seasonArchives.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* ===============================================================
              TAB 1: ARCHIVE YEAR & START FRESH SEASON
              =============================================================== */}
          {activeTab === 'archive' && (
            <div className="space-y-5">
              {/* Current Season Snapshot Strip */}
              <div className="p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-heading font-extrabold text-base text-[#0B1F3A] uppercase tracking-wide">
                    Snapshot to Archive: {currentSeasonYear} Season
                  </div>
                  <span className="text-[11px] font-bold text-[#718096]">
                    Preserves squads, fees, fixtures, ledger & registration inbox
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center tabular-nums">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-[#718096] uppercase">Players</div>
                    <div className="text-lg font-black text-[#0B1F3A]">{liveSummary.totalPlayers}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-[#718096] uppercase">Fees Billed</div>
                    <div className="text-lg font-black text-[#0B1F3A]">R{liveSummary.billed.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-[#718096] uppercase">Collected</div>
                    <div className="text-lg font-black text-emerald-700">R{liveSummary.collected.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-[#718096] uppercase">Outstanding</div>
                    <div className="text-lg font-black text-[#E31E24]">R{liveSummary.outstanding.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-[#718096] uppercase">Fixtures</div>
                    <div className="text-lg font-black text-[#0B1F3A]">{liveSummary.totalFixtures}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold text-[#718096] uppercase">Reg Forms</div>
                    <div className="text-lg font-black text-[#0B1F3A]">{liveSummary.totalRegistrations}</div>
                  </div>
                </div>
              </div>

              {/* New Season Target Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1">
                    New Active Season Year *
                  </label>
                  <input
                    type="number"
                    min={2025}
                    max={2050}
                    value={newSeasonYear}
                    onChange={e => {
                      const val = Number(e.target.value) || currentSeasonYear + 1;
                      setNewSeasonYear(val);
                      setNewRegLabel(`${val} Season`);
                    }}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-black text-[#0B1F3A] focus:outline-none focus:border-[#E31E24] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1">
                    Public Registration Page Label *
                  </label>
                  <input
                    type="text"
                    value={newRegLabel}
                    onChange={e => setNewRegLabel(e.target.value)}
                    placeholder="e.g. 2027 Season"
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              {/* Roster Rollover Choice */}
              <div className="space-y-2.5">
                <label className="block font-extrabold uppercase tracking-wider text-[#0B1F3A] text-[11px]">
                  Step 2 · How Should Players & Teams Start the {newSeasonYear} Season?
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRosterMode('promote_all')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-1.5 ${
                      rosterMode === 'promote_all'
                        ? 'border-[#E31E24] bg-red-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-sm uppercase text-[#0B1F3A]">
                        Move All Teams Forward (+1 Yr)
                      </span>
                      {rosterMode === 'promote_all' && <CheckCircle2 className="w-4 h-4 text-[#E31E24] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#718096] leading-relaxed">
                      Automatically shifts U6→U7, U7→U8, U8→U9, U9→U10, U10→U11, U11→U12, U12→U13 with all fees reset to R0 paid.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRosterMode('fresh_empty')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-1.5 ${
                      rosterMode === 'fresh_empty'
                        ? 'border-[#E31E24] bg-red-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-sm uppercase text-[#0B1F3A]">
                        Start Completely Fresh (Empty)
                      </span>
                      {rosterMode === 'fresh_empty' && <CheckCircle2 className="w-4 h-4 text-[#E31E24] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#718096] leading-relaxed">
                      Archives all {currentSeasonYear} rosters & fee sheets, leaving clean empty teams ready for fresh {newSeasonYear} intake.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRosterMode('keep_current')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-1.5 ${
                      rosterMode === 'keep_current'
                        ? 'border-[#E31E24] bg-red-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-sm uppercase text-[#0B1F3A]">
                        Keep Squads & Reset Fees to R0
                      </span>
                      {rosterMode === 'keep_current' && <CheckCircle2 className="w-4 h-4 text-[#E31E24] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#718096] leading-relaxed">
                      Keeps players in current age groups with paid months cleared to R0 so you can promote teams individually.
                    </p>
                  </button>
                </div>

                {/* Live Rollover Matrix Preview when promote_all is active */}
                {rosterMode === 'promote_all' && (
                  <div className="p-3.5 rounded-2xl bg-[#F0F4F9] border border-slate-200 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#0B1F3A] text-[11px] uppercase tracking-wider">
                        Age-Group Progression Preview
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-[#718096] font-semibold">U13 Players:</span>
                        <select
                          value={u13Handling}
                          onChange={e => setU13Handling(e.target.value as 'graduate' | 'keep')}
                          className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-[#0B1F3A]"
                        >
                          <option value="graduate">Graduate / Exit Youth (Clear U13 for incoming U12)</option>
                          <option value="keep">Keep existing U13 alongside incoming U12</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 tabular-nums">
                      {YOUTH_AGE_ORDER.map(sqId => {
                        const sheet = teamFeeSheets.find(s => s.id === sqId);
                        const rows = sheet ? sheet.players.filter(r => !r.isDonationRow) : [];
                        const eligibleCount = skipInactive
                          ? rows.filter(r => !r.isInactive).length
                          : rows.length;
                        const nextId = NEXT_SQUAD_MAP[sqId];
                        const targetLabel =
                          sqId === 'u13'
                            ? u13Handling === 'graduate'
                              ? 'Graduated'
                              : 'Stay U13'
                            : nextId?.toUpperCase();
                        return (
                          <div
                            key={sqId}
                            className="bg-white px-2.5 py-2 rounded-xl border border-slate-200 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-black text-[#0B1F3A]">{sqId.toUpperCase()}</span>
                              <span className="text-[10px] text-[#718096] ml-1">({eligibleCount})</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-[#E31E24]" />
                            <span className="font-bold text-emerald-700">{targetLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Rollover Options & Cleanup Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200">
                <div className="space-y-2.5">
                  <div className="font-extrabold text-[#0B1F3A] uppercase text-[11px]">
                    Fee & Player Carryover Rules
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipInactive}
                      onChange={e => setSkipInactive(e.target.checked)}
                      className="w-4 h-4 accent-[#E31E24] rounded"
                    />
                    <span className="font-semibold text-[#0B1F3A]">
                      Exclude Inactive (&quot;No longer playing&quot;) players from {newSeasonYear}
                    </span>
                  </label>
                  <div>
                    <label className="block text-[11px] font-bold text-[#718096] mb-1">
                      New Season Fee Amount Setting:
                    </label>
                    <select
                      value={feeResetMode}
                      onChange={e => setFeeResetMode(e.target.value as 'keep_concessions' | 'standard_all')}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-[#0B1F3A]"
                    >
                      <option value="keep_concessions">Preserve Manager / Bursary concessions (Paid reset to R0)</option>
                      <option value="standard_all">Reset all players to R1,800.00 standard fee (Paid R0)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="font-extrabold text-[#0B1F3A] uppercase text-[11px]">
                    Fresh Year Reset Options (Safely Archived First)
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetFixturesAndStandings}
                      onChange={e => setResetFixturesAndStandings(e.target.checked)}
                      className="w-4 h-4 accent-[#E31E24] rounded"
                    />
                    <span className="font-semibold text-[#0B1F3A]">
                      Reset league table standings, match stats & clear old fixtures
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearSeasonTransactions}
                      onChange={e => setClearSeasonTransactions(e.target.checked)}
                      className="w-4 h-4 accent-[#E31E24] rounded"
                    />
                    <span className="font-semibold text-[#0B1F3A]">
                      Archive & start fresh general ledger for {newSeasonYear}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearRegistrations}
                      onChange={e => setClearRegistrations(e.target.checked)}
                      className="w-4 h-4 accent-[#E31E24] rounded"
                    />
                    <span className="font-semibold text-[#0B1F3A]">
                      Archive & clear registration inbox for {newSeasonYear} intake
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0B1F3A] mb-1">
                  Archive Notes / AGM Resolution Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`e.g. End of ${currentSeasonYear} SDLFA season close-off approved by ExCo`}
                  value={archiveNotes}
                  onChange={e => setArchiveNotes(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              {/* Action Footer with 2-step safety confirmation */}
              {!confirmArchiveReady ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-[#718096] font-medium">
                    A full snapshot of <strong>{currentSeasonYear} Season</strong> will be saved under Archived Years before any changes occur.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmArchiveReady(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Archive {currentSeasonYear} & Start {newSeasonYear}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 text-red-900">
                    <AlertTriangle className="w-5 h-5 text-[#E31E24] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold uppercase text-xs">
                        Confirm Archiving {currentSeasonYear} Season & Rolling Into {newSeasonYear}
                      </div>
                      <div className="text-[11px] font-medium mt-0.5">
                        Mode: <strong>{rosterMode === 'promote_all' ? 'Move All Teams Forward (+1 Age Group)' : rosterMode === 'fresh_empty' ? 'Start Fresh Empty Squads' : 'Keep Current Squads & Reset Fees'}</strong>. Registration page label will update to <strong>{newRegLabel}</strong>.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirmArchiveReady(false)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-[#0B1F3A] font-bold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmArchiveAndRollover}
                      className="px-5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold uppercase tracking-wider shadow cursor-pointer"
                    >
                      Confirm & Roll Over
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===============================================================
              TAB 2: MOVE PLAYERS FORWARD (SQUAD-TO-SQUAD PROGRESSION)
              =============================================================== */}
          {activeTab === 'promote' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-heading font-extrabold text-base text-[#0B1F3A] uppercase">
                    Move Players Forward Between Age Groups
                  </div>
                  <p className="text-[11px] text-[#718096] font-medium mt-0.5">
                    Transfer an entire squad to the next age division (e.g. U7 → U8) across both Squads and Team Fee Sheets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('archive')}
                  className="px-3.5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white font-bold text-[11px] uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  Or Archive Year & Move All Teams &rarr;
                </button>
              </div>

              {/* Source -> Target Selector */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-end">
                <div className="md:col-span-5">
                  <label className="block font-bold text-[#0B1F3A] mb-1">
                    From Current Team / Squad *
                  </label>
                  <select
                    value={sourceSquadId}
                    onChange={e => handleSourceChange(e.target.value)}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  >
                    {squads.map(sq => {
                      const count = teamFeeSheets.find(s => s.id === sq.id)?.players.filter(r => !r.isDonationRow).length ?? players.filter(p => p.squadId === sq.id).length;
                      return (
                        <option key={sq.id} value={sq.id}>
                          {sq.name} ({count} players)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="md:col-span-1 flex items-center justify-center py-2">
                  <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-[#E31E24] flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="md:col-span-5">
                  <label className="block font-bold text-[#0B1F3A] mb-1">
                    To Next Season Team / Destination *
                  </label>
                  <select
                    value={targetSquadId}
                    onChange={e => setTargetSquadId(e.target.value)}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  >
                    {squads
                      .filter(sq => sq.id !== sourceSquadId)
                      .map(sq => {
                        const count = teamFeeSheets.find(s => s.id === sq.id)?.players.filter(r => !r.isDonationRow).length ?? players.filter(p => p.squadId === sq.id).length;
                        return (
                          <option key={sq.id} value={sq.id}>
                            {sq.name} (currently {count} players)
                          </option>
                        );
                      })}
                    <option value="graduate">Graduate / Exit Youth Programme (Archive Complete)</option>
                  </select>
                </div>
              </div>

              {/* Transfer Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200">
                <div className="space-y-2.5">
                  <div className="font-extrabold text-[#0B1F3A] uppercase text-[11px]">
                    Target Roster Handling
                  </div>
                  {targetSquadId !== 'graduate' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMoveMode('append')}
                        className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer ${
                          moveMode === 'append'
                            ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                            : 'bg-white text-[#0B1F3A] border-slate-300'
                        }`}
                      >
                        Append to {targetSquadId.toUpperCase()} ({targetSquadCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoveMode('replace')}
                        className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer ${
                          moveMode === 'replace'
                            ? 'bg-[#E31E24] text-white border-[#E31E24]'
                            : 'bg-white text-[#0B1F3A] border-slate-300'
                        }`}
                      >
                        Replace Target Roster
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#718096] font-medium">
                      Graduating players will be cleared from the active youth roster (archive current season first to keep a permanent record).
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={moveSkipInactive}
                      onChange={e => setMoveSkipInactive(e.target.checked)}
                      className="w-4 h-4 accent-[#E31E24] rounded"
                    />
                    <span className="font-semibold text-[#0B1F3A]">
                      Skip Inactive (&quot;No longer playing&quot;) players
                    </span>
                  </label>
                </div>

                <div className="space-y-2.5">
                  <div className="font-extrabold text-[#0B1F3A] uppercase text-[11px]">
                    Fee & Match Stat Reset
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moveResetFees}
                      onChange={e => setMoveResetFees(e.target.checked)}
                      className="w-4 h-4 accent-[#E31E24] rounded"
                    />
                    <span className="font-semibold text-[#0B1F3A]">
                      Reset monthly fee payments (R0 paid) & match stats for new season
                    </span>
                  </label>
                  {moveResetFees && (
                    <select
                      value={moveFeeResetMode}
                      onChange={e => setMoveFeeResetMode(e.target.value as 'keep_concessions' | 'standard_all')}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-[#0B1F3A]"
                    >
                      <option value="keep_concessions">Keep existing concession / bursary amounts due</option>
                      <option value="standard_all">Set all moved players to R1,800.00 standard fee</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Player Preview Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-extrabold text-[#0B1F3A] uppercase text-[11px]">
                    Players Queued in {sourceSquadId.toUpperCase()} ({sourcePreview.eligible.length} will move)
                  </span>
                  <span className="text-[11px] text-[#718096]">
                    {sourcePreview.all.length - sourcePreview.eligible.length} inactive skipped
                  </span>
                </div>

                {sourcePreview.eligible.length > 0 ? (
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {sourcePreview.eligible.map((item, idx) => (
                      <div key={item.id} className="px-4 py-2 flex items-center justify-between text-xs tabular-nums">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-[#0B1F3A] font-mono font-bold text-[11px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[#0B1F3A]">{item.name}</span>
                          {item.inactive && (
                            <span className="text-[10px] font-bold text-[#E31E24]">(Inactive)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-[#718096]">
                          <span className="font-mono">Card: {item.cardNumber}</span>
                          <span className="font-bold text-[#0B1F3A]">Fee: R{item.amountDue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[#718096] font-medium">
                    No eligible players in {sourceSquadId.toUpperCase()} to move.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={sourcePreview.eligible.length === 0}
                  onClick={handleMoveSquadSubmit}
                  className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] disabled:opacity-40 text-white font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>
                    Move {sourcePreview.eligible.length} Players ({sourceSquadId.toUpperCase()} &rarr;{' '}
                    {targetSquadId === 'graduate' ? 'Graduated' : targetSquadId.toUpperCase()})
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ===============================================================
              TAB 3: ARCHIVED SEASONS VAULT
              =============================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {seasonArchives.length === 0 ? (
                <div className="p-10 rounded-3xl bg-[#F0F4F9] border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#0B1F3A] flex items-center justify-center mx-auto">
                    <Archive className="w-6 h-6 text-[#E31E24]" />
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-[#0B1F3A] uppercase">
                    No Archived Seasons Yet
                  </h3>
                  <p className="text-xs text-[#718096] max-w-md mx-auto leading-relaxed">
                    When the current <strong>{currentSeasonYear} Season</strong> concludes, archive it to lock in all team rosters, fee sheets, fixtures, and transactions before starting the new year.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('archive')}
                    className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold uppercase tracking-wider cursor-pointer"
                  >
                    Archive {currentSeasonYear} Season Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {seasonArchives.map(arch => {
                    const isExpanded = expandedArchiveId === arch.id;
                    return (
                      <div
                        key={arch.id}
                        className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-heading font-black text-xl text-[#0B1F3A] uppercase">
                                {arch.seasonLabel} Archive
                              </span>
                              <span className="text-[11px] font-medium text-[#718096] tabular-nums">
                                Archived {formatDateMMDDYYYY(arch.archivedAt)} · By {arch.archivedBy}
                              </span>
                            </div>
                            {arch.notes && (
                              <div className="text-[11px] text-[#718096] italic">
                                Note: {arch.notes}
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs tabular-nums">
                              <span>
                                Players: <strong className="text-[#0B1F3A]">{arch.summary.totalPlayers}</strong>
                              </span>
                              <span>
                                Billed: <strong className="text-[#0B1F3A]">R{arch.summary.totalBilled.toLocaleString()}</strong>
                              </span>
                              <span>
                                Collected:{' '}
                                <strong className="text-emerald-700">
                                  R{arch.summary.totalCollected.toLocaleString()} ({arch.summary.collectionRate}%)
                                </strong>
                              </span>
                              <span>
                                Fixtures: <strong className="text-[#0B1F3A]">{arch.snapshot.fixtures.length}</strong>
                              </span>
                              <span>
                                Reg Forms: <strong className="text-[#0B1F3A]">{arch.summary.totalRegistrations}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setExpandedArchiveId(isExpanded ? null : arch.id)}
                              className="px-3 py-2 rounded-xl bg-[#F0F4F9] hover:bg-slate-200 text-[#0B1F3A] font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Layers className="w-3.5 h-3.5 text-[#E31E24]" />
                              <span>{isExpanded ? 'Hide Breakdown' : 'Inspect Teams'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadArchiveJson(arch)}
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#0B1F3A] font-bold flex items-center gap-1.5 cursor-pointer"
                              title="Download Archive JSON"
                            >
                              <Download className="w-3.5 h-3.5 text-[#0B1F3A]" />
                              <span>JSON</span>
                            </button>

                            {confirmRestoreId === arch.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  restoreSeasonArchive(arch.id);
                                  setConfirmRestoreId(null);
                                  onClose();
                                }}
                                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold cursor-pointer"
                              >
                                Confirm Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmRestoreId(arch.id)}
                                className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-[#0B1F3A] font-bold flex items-center gap-1.5 cursor-pointer"
                                title="Restore this archived season as active"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                <span>Restore</span>
                              </button>
                            )}

                            {confirmDeleteId === arch.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  deleteSeasonArchive(arch.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-3 py-2 rounded-xl bg-[#E31E24] text-white font-extrabold cursor-pointer"
                              >
                                Confirm Delete
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(arch.id)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-[#718096] hover:text-[#E31E24] cursor-pointer"
                                title="Delete archive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-slate-200 bg-[#F0F4F9] p-4 overflow-x-auto">
                            <table className="w-full text-left text-xs tabular-nums">
                              <thead>
                                <tr className="text-[10px] uppercase text-[#718096] border-b border-slate-200">
                                  <th className="py-2 pr-3">Squad</th>
                                  <th className="py-2 px-3">Coach</th>
                                  <th className="py-2 px-3 text-center">Players</th>
                                  <th className="py-2 px-3 text-right">Billed</th>
                                  <th className="py-2 px-3 text-right">Collected</th>
                                  <th className="py-2 pl-3 text-right">Outstanding</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200/70">
                                {arch.snapshot.teamFeeSheets.map(sheet => {
                                  const count = sheet.players.filter(r => !r.isDonationRow).length;
                                  const billed = sheet.players.reduce((s, r) => s + (r.amountDue || 0), 0);
                                  const paid = sheet.players.reduce((s, r) => s + (r.totalPaid || 0), 0);
                                  const bal = sheet.players.reduce(
                                    (s, r) =>
                                      s +
                                      (r.isDonationRow
                                        ? (r.amountDue || 0) - (r.totalPaid || 0)
                                        : r.isInactive
                                        ? 0
                                        : Math.max(0, (r.amountDue || 0) - (r.totalPaid || 0))),
                                    0
                                  );
                                  return (
                                    <tr key={sheet.id}>
                                      <td className="py-2 pr-3 font-bold text-[#0B1F3A]">{sheet.ageGroup}</td>
                                      <td className="py-2 px-3 text-[#718096]">{sheet.coach}</td>
                                      <td className="py-2 px-3 text-center font-bold">{count}</td>
                                      <td className="py-2 px-3 text-right">R{billed.toLocaleString()}</td>
                                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                                        R{paid.toLocaleString()}
                                      </td>
                                      <td className="py-2 pl-3 text-right font-bold text-[#E31E24]">
                                        R{bal.toLocaleString()}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
