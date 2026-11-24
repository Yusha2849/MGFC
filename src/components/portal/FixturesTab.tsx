import React, { useState, useMemo, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { Fixture, FixtureStatus } from '../../types';
import { DateInput } from '../common/DateInput';
import { formatDateMMDDYYYY } from '../../utils/dateFormat';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckSquare,
  List,
  Pencil,
  X,
} from 'lucide-react';

type ActiveTab = 'list' | 'schedule' | 'scores';
type CaptureMode = 'single' | 'collective';

interface WeekendFixtureRow {
  rowId: string;
  squadId: string;
  include: boolean;
  opponent: string;
  date: string;
  kickoffTime: string;
  isHome: boolean;
  venue: string;
}

interface WeekendScoreDraft {
  include: boolean;
  mgfcScore: number;
  oppScore: number;
  coachNotes: string;
}

const DEFAULT_HOME_VENUE = 'Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens';

const DEFAULT_KICKOFFS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:15',
  '11:00',
  '12:00',
  '13:15',
  '15:00',
];

export const FixturesTab: React.FC = () => {
  const {
    fixtures,
    squads,
    addFixture,
    addWeeklyFixturesBatch,
    updateFixture,
    deleteFixture,
    recordMatchResult,
    recordMatchResultsBatch,
    openSocialStudioForFixture,
    showToast,
  } = useClub();

  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [scheduleMode, setScheduleMode] = useState<CaptureMode>('collective');
  const [scoreMode, setScoreMode] = useState<CaptureMode>('collective');

  // List filters & inline edit state
  const [selectedSquad, setSelectedSquad] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingFixtureId, setEditingFixtureId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    squadId: string;
    competition: string;
    isHome: boolean;
    opponent: string;
    venue: string;
    date: string;
    kickoffTime: string;
    status: FixtureStatus;
  } | null>(null);

  const nextSaturday = useMemo(() => {
    const now = new Date();
    const diff = (6 - now.getDay() + 7) % 7 || 7;
    const sat = new Date(now);
    sat.setDate(now.getDate() + diff);
    return sat.toISOString().split('T')[0];
  }, []);

  const getSquadLabel = (squadId: string) => {
    const match = /^u(\d+)$/i.exec(squadId.trim());
    if (match) return `Under ${match[1]} (U${match[1]})`;
    const sq = squads.find(s => s.id === squadId);
    if (sq) {
      return sq.name
        .replace(/\b(Grassroots|Juniors|Stars|Academy|Colts|Lions|Transition|Development)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    return squadId.toUpperCase();
  };

  // =========================================================================
  // ADD FIXTURE: ONE TEAM
  // =========================================================================
  const [singleFixture, setSingleFixture] = useState({
    squadId: squads[0]?.id || 'u6',
    competition: 'Sandton Youth League',
    isHome: true,
    opponent: '',
    venue: DEFAULT_HOME_VENUE,
    pitch: '',
    date: nextSaturday,
    kickoffTime: '09:30',
    status: 'Scheduled' as FixtureStatus,
  });

  // =========================================================================
  // ADD FIXTURES: ALL TEAMS (WEEKEND SHEET)
  // =========================================================================
  const [weekendDate, setWeekendDate] = useState<string>(nextSaturday);
  const [weekendCompetition, setWeekendCompetition] = useState<string>('Sandton Youth League');

  const createEmptyWeekendRows = (dateVal: string): WeekendFixtureRow[] =>
    squads.map((sq, idx) => ({
      rowId: `row-${sq.id}-${idx}`,
      squadId: sq.id,
      include: false,
      opponent: '',
      date: dateVal,
      kickoffTime: DEFAULT_KICKOFFS[idx % DEFAULT_KICKOFFS.length],
      isHome: true,
      venue: DEFAULT_HOME_VENUE,
    }));

  const [weekendRows, setWeekendRows] = useState<WeekendFixtureRow[]>(() =>
    createEmptyWeekendRows(nextSaturday)
  );

  useEffect(() => {
    if (weekendRows.length === 0 && squads.length > 0) {
      setWeekendRows(createEmptyWeekendRows(weekendDate));
    }
  }, [squads]);

  // =========================================================================
  // ENTER SCORES: ONE TEAM & ALL TEAMS (WEEKEND SHEET)
  // =========================================================================
  const [singleScoreId, setSingleScoreId] = useState<string>(
    () => fixtures.find(f => f.status !== 'Completed')?.id || fixtures[0]?.id || ''
  );

  const selectedFixtureForScore = useMemo(
    () => fixtures.find(f => f.id === singleScoreId) || fixtures[0] || null,
    [fixtures, singleScoreId]
  );

  const [scoreForm, setScoreForm] = useState({
    mgfcScore: 0,
    oppScore: 0,
    coachNotes: '',
  });

  const [scoreDateFilter, setScoreDateFilter] = useState<string>('all');
  const [showSavedResults, setShowSavedResults] = useState<boolean>(false);
  const [weekendScoreDrafts, setWeekendScoreDrafts] = useState<Record<string, WeekendScoreDraft>>({});

  const availableDates = useMemo(
    () => Array.from(new Set(fixtures.map(f => f.date))).sort((a, b) => b.localeCompare(a)),
    [fixtures]
  );

  const scoreSheetFixtures = useMemo(() => {
    return fixtures
      .filter(f => (showSavedResults ? true : f.status !== 'Completed'))
      .filter(f => (scoreDateFilter === 'all' ? true : f.date === scoreDateFilter))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        const idxA = squads.findIndex(s => s.id === a.squadId);
        const idxB = squads.findIndex(s => s.id === b.squadId);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
  }, [fixtures, showSavedResults, scoreDateFilter, squads]);

  useEffect(() => {
    setWeekendScoreDrafts(prev => {
      const next = { ...prev };
      let changed = false;
      fixtures.forEach(f => {
        if (!next[f.id]) {
          next[f.id] = {
            include: false,
            mgfcScore: f.mgfcScore ?? 0,
            oppScore: f.opponentScore ?? 0,
            coachNotes: f.coachNotes || '',
          };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [fixtures]);

  // =========================================================================
  // HELPERS & HANDLERS
  // =========================================================================
  const openAddFixtures = (mode: CaptureMode = 'collective') => {
    setSingleFixture({
      squadId: selectedSquad !== 'all' ? selectedSquad : squads[0]?.id || 'u6',
      competition: 'Sandton Youth League',
      isHome: true,
      opponent: '',
      venue: DEFAULT_HOME_VENUE,
      pitch: '',
      date: nextSaturday,
      kickoffTime: '09:30',
      status: 'Scheduled',
    });
    setScheduleMode(mode);
    setActiveTab('schedule');
  };

  const openEnterScores = (mode: CaptureMode = 'collective', target?: Fixture) => {
    const match = target || fixtures.find(f => f.status !== 'Completed') || fixtures[0];
    if (match) {
      setSingleScoreId(match.id);
      setScoreForm({
        mgfcScore: match.mgfcScore ?? 0,
        oppScore: match.opponentScore ?? 0,
        coachNotes: match.coachNotes || '',
      });
    }
    setScoreMode(mode);
    setActiveTab('scores');
  };

  const handleSelectFixtureToScore = (fixtureId: string) => {
    setSingleScoreId(fixtureId);
    const match = fixtures.find(f => f.id === fixtureId);
    if (match) {
      setScoreForm({
        mgfcScore: match.mgfcScore ?? 0,
        oppScore: match.opponentScore ?? 0,
        coachNotes: match.coachNotes || '',
      });
    }
  };

  const handleSaveSingleFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFixture.opponent.trim()) {
      showToast('Please enter the opponent team name.', 'error');
      return;
    }
    addFixture({
      ...singleFixture,
      opponent: singleFixture.opponent.trim(),
      venue: singleFixture.isHome ? DEFAULT_HOME_VENUE : singleFixture.venue.trim() || 'Away Ground',
    });
    setActiveTab('list');
  };

  const startEditingFixture = (fixture: Fixture) => {
    setConfirmDeleteId(null);
    setEditingFixtureId(fixture.id);
    setEditDraft({
      squadId: fixture.squadId,
      competition: fixture.competition || 'Sandton Youth League',
      isHome: fixture.isHome,
      opponent: fixture.opponent,
      venue: fixture.venue || (fixture.isHome ? DEFAULT_HOME_VENUE : ''),
      date: fixture.date,
      kickoffTime: fixture.kickoffTime || '09:30',
      status: fixture.status,
    });
  };

  const cancelEditingFixture = () => {
    setEditingFixtureId(null);
    setEditDraft(null);
  };

  const handleSaveEditedFixture = (e: React.FormEvent, original: Fixture) => {
    e.preventDefault();
    if (!editDraft) return;
    if (!editDraft.opponent.trim()) {
      showToast('Please enter the opponent team name.', 'error');
      return;
    }
    updateFixture({
      ...original,
      squadId: editDraft.squadId,
      competition: editDraft.competition.trim() || 'Sandton Youth League',
      isHome: editDraft.isHome,
      opponent: editDraft.opponent.trim(),
      venue: editDraft.isHome
        ? DEFAULT_HOME_VENUE
        : editDraft.venue.trim() || 'Away Ground',
      date: editDraft.date,
      kickoffTime: editDraft.kickoffTime,
      status: editDraft.status,
    });
    setEditingFixtureId(null);
    setEditDraft(null);
  };

  const updateWeekendRow = (rowId: string, patch: Partial<WeekendFixtureRow>) => {
    setWeekendRows(prev =>
      prev.map(row => {
        if (row.rowId !== rowId) return row;
        const updated = { ...row, ...patch };
        if (patch.opponent !== undefined) {
          updated.include = patch.opponent.trim().length > 0;
        }
        return updated;
      })
    );
  };

  const applyDateToAllRows = (newDate: string) => {
    setWeekendDate(newDate);
    setWeekendRows(prev => prev.map(r => ({ ...r, date: newDate })));
  };

  const readyWeekendFixtures = useMemo(
    () => weekendRows.filter(r => r.include && r.opponent.trim().length > 0),
    [weekendRows]
  );

  const handleSaveWeekendFixtures = (openPosterAfter: boolean) => {
    if (readyWeekendFixtures.length === 0) {
      showToast('Type an opponent name for at least one team first.', 'error');
      return;
    }

    const created = addWeeklyFixturesBatch(
      readyWeekendFixtures.map(r => ({
        squadId: r.squadId,
        competition: weekendCompetition.trim() || 'Sandton Youth League',
        isHome: r.isHome,
        opponent: r.opponent.trim(),
        venue: r.isHome ? DEFAULT_HOME_VENUE : r.venue.trim() || 'Away Ground',
        pitch: '',
        date: r.date,
        kickoffTime: r.kickoffTime,
        status: 'Scheduled',
        confirmedOnSocial: true,
        weekLabel: `Weekend of ${formatDateMMDDYYYY(weekendDate)}`,
      }))
    );

    setWeekendRows(createEmptyWeekendRows(weekendDate));

    if (openPosterAfter && created.length > 0) {
      openSocialStudioForFixture({
        fixtureIds: created.map(c => c.id),
        template: created.length > 1 ? 'Weekly Fixtures Slate' : 'Matchday',
        openSection: 'poster',
      });
    } else {
      setActiveTab('list');
    }
  };

  const saveSingleScore = (openPosterAfter: boolean) => {
    if (!selectedFixtureForScore) return;
    const savedId = selectedFixtureForScore.id;
    recordMatchResult(
      savedId,
      scoreForm.mgfcScore,
      scoreForm.oppScore,
      [],
      undefined,
      scoreForm.coachNotes,
      ''
    );
    if (openPosterAfter) {
      openSocialStudioForFixture({
        fixtureId: savedId,
        template: 'Full Time',
        openSection: 'poster',
      });
    } else {
      setActiveTab('list');
    }
  };

  const updateScoreDraft = (fixtureId: string, patch: Partial<WeekendScoreDraft>) => {
    setWeekendScoreDrafts(prev => {
      const current = prev[fixtureId] || {
        include: false,
        mgfcScore: 0,
        oppScore: 0,
        coachNotes: '',
      };
      const autoInclude =
        patch.mgfcScore !== undefined || patch.oppScore !== undefined || patch.coachNotes !== undefined
          ? true
          : current.include;
      return {
        ...prev,
        [fixtureId]: {
          ...current,
          include: patch.include !== undefined ? patch.include : autoInclude,
          ...patch,
        },
      };
    });
  };

  const selectedWeekendScores = useMemo(
    () => scoreSheetFixtures.filter(f => weekendScoreDrafts[f.id]?.include),
    [scoreSheetFixtures, weekendScoreDrafts]
  );

  const handleSaveWeekendScores = (openPosterAfter: boolean) => {
    if (selectedWeekendScores.length === 0) {
      showToast('Enter or tick at least one team score first.', 'error');
      return;
    }

    const savedIds = recordMatchResultsBatch(
      selectedWeekendScores.map(f => {
        const draft = weekendScoreDrafts[f.id] || {
          include: true,
          mgfcScore: f.mgfcScore ?? 0,
          oppScore: f.opponentScore ?? 0,
          coachNotes: f.coachNotes || '',
        };
        return {
          fixtureId: f.id,
          mgfcScore: draft.mgfcScore,
          oppScore: draft.oppScore,
          coachNotes: draft.coachNotes,
        };
      })
    );

    setWeekendScoreDrafts(prev => {
      const next = { ...prev };
      savedIds.forEach(id => {
        if (next[id]) next[id] = { ...next[id], include: false };
      });
      return next;
    });

    if (openPosterAfter && savedIds.length > 0) {
      openSocialStudioForFixture({
        fixtureIds: savedIds,
        template: savedIds.length > 1 ? 'Weekend Results Slate' : 'Full Time',
        openSection: 'poster',
      });
    } else {
      setActiveTab('list');
    }
  };

  // List view filtering
  const filteredFixtures = fixtures.filter(f => {
    const squadOk = selectedSquad === 'all' || f.squadId === selectedSquad;
    const statusOk =
      statusFilter === 'all'
        ? true
        : statusFilter === 'upcoming'
        ? f.status !== 'Completed'
        : f.status === 'Completed';
    return squadOk && statusOk;
  });

  const upcomingCount = fixtures.filter(f => f.status !== 'Completed').length;
  const completedCount = fixtures.filter(f => f.status === 'Completed').length;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* 1. Simple Top Header & Single 3-Tab Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1F3A] tracking-tight">
              Fixtures &amp; Results
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              View upcoming games, add fixtures, and enter weekend scores.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              openSocialStudioForFixture({
                template: statusFilter === 'completed' ? 'Weekend Results Slate' : 'Weekly Fixtures Slate',
                openSection: 'poster',
              })
            }
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
          >
            <ImageIcon className="w-4 h-4 text-[#E31E24]" />
            <span>Make Social Poster</span>
          </button>
        </div>

        {/* Simple 3-Tab Bar */}
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'list'
                ? 'bg-[#0B1F3A] text-white'
                : 'text-slate-600 hover:text-[#0B1F3A]'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Matches ({fixtures.length})</span>
          </button>

          <button
            type="button"
            onClick={() => openAddFixtures('collective')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-[#E31E24] text-white'
                : 'text-slate-600 hover:text-[#0B1F3A]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Fixtures</span>
          </button>

          <button
            type="button"
            onClick={() => openEnterScores('collective')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'scores'
                ? 'bg-[#E31E24] text-white'
                : 'text-slate-600 hover:text-[#0B1F3A]'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Enter Scores</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: MATCHES LIST
         ===================================================================== */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          {/* Clean Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer tabular-nums ${
                  statusFilter === 'all' ? 'bg-white text-[#0B1F3A] shadow-xs' : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                All ({fixtures.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer tabular-nums ${
                  statusFilter === 'upcoming' ? 'bg-white text-[#0B1F3A] shadow-xs' : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Upcoming ({upcomingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer tabular-nums ${
                  statusFilter === 'completed' ? 'bg-white text-[#0B1F3A] shadow-xs' : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Results ({completedCount})
              </button>
            </div>

            <select
              value={selectedSquad}
              onChange={e => setSelectedSquad(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
            >
              <option value="all">All Teams</option>
              {squads.map(s => (
                <option key={s.id} value={s.id}>
                  {getSquadLabel(s.id)}
                </option>
              ))}
            </select>
          </div>

          {filteredFixtures.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm text-slate-600">No matches found for this filter.</p>
              <button
                type="button"
                onClick={() => openAddFixtures('collective')}
                className="px-4 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-sm font-bold cursor-pointer"
              >
                Add Fixtures
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredFixtures.map(fixture => {
                const isCompleted = fixture.status === 'Completed';
                const isEditing = editingFixtureId === fixture.id && editDraft !== null;
                const homeTeam = fixture.isHome ? 'Marlboro Gardens FC' : fixture.opponent;
                const awayTeam = fixture.isHome ? fixture.opponent : 'Marlboro Gardens FC';
                const homeScore = fixture.isHome ? fixture.mgfcScore : fixture.opponentScore;
                const awayScore = fixture.isHome ? fixture.opponentScore : fixture.mgfcScore;

                if (isEditing && editDraft) {
                  return (
                    <div key={fixture.id} className="py-4">
                      <form
                        onSubmit={e => handleSaveEditedFixture(e, fixture)}
                        className="rounded-2xl border border-[#0B1F3A]/20 bg-slate-50 p-4 sm:p-5 space-y-4 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                          <div className="font-extrabold text-[#0B1F3A]">
                            Edit Fixture
                          </div>
                          <button
                            type="button"
                            onClick={cancelEditingFixture}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B1F3A] hover:bg-slate-200 transition-colors cursor-pointer"
                            aria-label="Cancel editing fixture"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Team</label>
                            <select
                              value={editDraft.squadId}
                              onChange={e => setEditDraft({ ...editDraft, squadId: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                            >
                              {squads.map(s => (
                                <option key={s.id} value={s.id}>
                                  {getSquadLabel(s.id)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Home or Away</label>
                            <select
                              value={editDraft.isHome ? 'home' : 'away'}
                              onChange={e => {
                                const home = e.target.value === 'home';
                                setEditDraft({
                                  ...editDraft,
                                  isHome: home,
                                  venue: home
                                    ? DEFAULT_HOME_VENUE
                                    : editDraft.venue === DEFAULT_HOME_VENUE
                                    ? ''
                                    : editDraft.venue,
                                });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                            >
                              <option value="home">Home (Marlboro Sports Ground)</option>
                              <option value="away">Away</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Opponent Team *</label>
                            <input
                              type="text"
                              required
                              value={editDraft.opponent}
                              onChange={e => setEditDraft({ ...editDraft, opponent: e.target.value })}
                              placeholder="e.g. Alexandra United"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                              League / Competition
                            </label>
                            <input
                              type="text"
                              value={editDraft.competition}
                              onChange={e => setEditDraft({ ...editDraft, competition: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                              Match Date (MM/DD/YYYY)
                            </label>
                            <DateInput
                              required
                              value={editDraft.date}
                              onChange={val => setEditDraft({ ...editDraft, date: val })}
                              ariaLabel="Edit Match Date"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Kickoff Time</label>
                            <input
                              type="time"
                              required
                              value={editDraft.kickoffTime}
                              onChange={e => setEditDraft({ ...editDraft, kickoffTime: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                            />
                          </div>

                          {!editDraft.isHome && (
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Away Ground</label>
                              <input
                                type="text"
                                placeholder="Where is the away match?"
                                value={editDraft.venue === DEFAULT_HOME_VENUE ? '' : editDraft.venue}
                                onChange={e => setEditDraft({ ...editDraft, venue: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-bold cursor-pointer"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingFixture}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-[#0B1F3A] text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                return (
                  <div
                    key={fixture.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Match Summary */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="font-bold text-[#0B1F3A]">{getSquadLabel(fixture.squadId)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{formatDateMMDDYYYY(fixture.date)} at {fixture.kickoffTime}</span>
                        <span aria-hidden="true">·</span>
                        <span>{fixture.isHome ? 'Home' : 'Away'}</span>
                      </div>

                      <div className="text-base sm:text-lg font-extrabold text-[#0B1F3A] flex flex-wrap items-center gap-2 tabular-nums">
                        <span>{homeTeam}</span>
                        {isCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[#E31E24] font-black">
                            {homeScore ?? 0} – {awayScore ?? 0}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-sm">vs</span>
                        )}
                        <span>{awayTeam}</span>
                      </div>
                    </div>

                    {/* Clear Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditingFixture(fixture)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEnterScores('single', fixture)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-[#0B1F3A]'
                            : 'bg-[#E31E24] hover:bg-[#C91419] text-white'
                        }`}
                      >
                        {isCompleted ? 'Edit Score' : 'Enter Score'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openSocialStudioForFixture({
                            fixtureId: fixture.id,
                            template: isCompleted ? 'Full Time' : 'Matchday',
                            openSection: 'poster',
                          })
                        }
                        className="px-3.5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {isCompleted ? 'Result Poster' : 'Fixture Poster'}
                      </button>

                      {confirmDeleteId === fixture.id ? (
                        <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-xl px-2 py-1 text-xs">
                          <span className="font-semibold text-[#E31E24] px-1">Delete?</span>
                          <button
                            type="button"
                            onClick={() => {
                              deleteFixture(fixture.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#E31E24] text-white font-bold cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded-lg bg-white text-slate-600 font-bold cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(fixture.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-[#E31E24] hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label="Delete fixture"
                          title="Delete fixture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: ADD FIXTURES (ONE TEAM vs ALL TEAMS WEEKEND SHEET)
         ===================================================================== */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-extrabold font-heading text-[#0B1F3A]">
                Add Match Fixtures
              </h3>
              <p className="text-sm text-slate-600">
                Choose to add one team&apos;s match or fill in all teams for the weekend on one page.
              </p>
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setScheduleMode('collective')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  scheduleMode === 'collective'
                    ? 'bg-white text-[#0B1F3A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                All Teams (Weekend Sheet)
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('single')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  scheduleMode === 'single'
                    ? 'bg-white text-[#0B1F3A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                One Team
              </button>
            </div>
          </div>

          {scheduleMode === 'single' ? (
            <form onSubmit={handleSaveSingleFixture} className="max-w-xl space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1">Team</label>
                  <select
                    value={singleFixture.squadId}
                    onChange={e => setSingleFixture({ ...singleFixture, squadId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                  >
                    {squads.map(s => (
                      <option key={s.id} value={s.id}>
                        {getSquadLabel(s.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1">Home or Away</label>
                  <select
                    value={singleFixture.isHome ? 'home' : 'away'}
                    onChange={e => setSingleFixture({ ...singleFixture, isHome: e.target.value === 'home' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                  >
                    <option value="home">Home (Marlboro Sports Ground)</option>
                    <option value="away">Away</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0B1F3A] mb-1">Opponent Team *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexandra United"
                  value={singleFixture.opponent}
                  onChange={e => setSingleFixture({ ...singleFixture, opponent: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1">Match Date (MM/DD/YYYY)</label>
                  <DateInput
                    required
                    value={singleFixture.date}
                    onChange={val => setSingleFixture({ ...singleFixture, date: val })}
                    ariaLabel="Match Date"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1">Kickoff Time</label>
                  <input
                    type="time"
                    required
                    value={singleFixture.kickoffTime}
                    onChange={e => setSingleFixture({ ...singleFixture, kickoffTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>
              </div>

              {!singleFixture.isHome && (
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1">Away Ground</label>
                  <input
                    type="text"
                    placeholder="Where is the away match?"
                    value={singleFixture.venue === DEFAULT_HOME_VENUE ? '' : singleFixture.venue}
                    onChange={e => setSingleFixture({ ...singleFixture, venue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-bold cursor-pointer"
                >
                  Save Fixture
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Simple Weekend Defaults Row */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-44">
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Weekend Date</label>
                  <DateInput
                    value={weekendDate}
                    onChange={val => applyDateToAllRows(val)}
                    ariaLabel="Weekend Date"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">League / Competition</label>
                  <input
                    type="text"
                    value={weekendCompetition}
                    onChange={e => setWeekendCompetition(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>
                <p className="text-xs text-slate-500 pb-2">
                  Just type an opponent name for each team playing this weekend.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs">
                    <tr>
                      <th className="px-3 py-3 text-left font-bold w-10">Add</th>
                      <th className="px-3 py-3 text-left font-bold">Team</th>
                      <th className="px-3 py-3 text-left font-bold min-w-[180px]">Opponent</th>
                      <th className="px-3 py-3 text-left font-bold min-w-[155px]">Date</th>
                      <th className="px-3 py-3 text-left font-bold">Kickoff</th>
                      <th className="px-3 py-3 text-left font-bold">Home / Away</th>
                      <th className="px-3 py-3 text-left font-bold min-w-[160px]">Ground</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {weekendRows.map(row => (
                      <tr key={row.rowId} className={row.include && row.opponent.trim() ? 'bg-red-50/30' : ''}>
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={row.include}
                            onChange={e => updateWeekendRow(row.rowId, { include: e.target.checked })}
                            className="accent-[#E31E24] w-4 h-4 cursor-pointer"
                            aria-label={`Include ${getSquadLabel(row.squadId)}`}
                          />
                        </td>
                        <td className="px-3 py-2.5 font-bold text-[#0B1F3A] whitespace-nowrap">
                          {getSquadLabel(row.squadId)}
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            placeholder="Type opponent..."
                            value={row.opponent}
                            onChange={e => updateWeekendRow(row.rowId, { opponent: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </td>
                        <td className="px-3 py-2.5 min-w-[155px]">
                          <DateInput
                            value={row.date}
                            onChange={val => updateWeekendRow(row.rowId, { date: val })}
                            ariaLabel={`Match date for ${getSquadLabel(row.squadId)}`}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="time"
                            value={row.kickoffTime}
                            onChange={e => updateWeekendRow(row.rowId, { kickoffTime: e.target.value })}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-[#0B1F3A] tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <select
                            value={row.isHome ? 'home' : 'away'}
                            onChange={e =>
                              updateWeekendRow(row.rowId, {
                                isHome: e.target.value === 'home',
                                venue: e.target.value === 'home' ? DEFAULT_HOME_VENUE : '',
                              })
                            }
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                          >
                            <option value="home">Home</option>
                            <option value="away">Away</option>
                          </select>
                        </td>
                        <td className="px-3 py-2.5">
                          {row.isHome ? (
                            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                              Marlboro Sports Ground
                            </span>
                          ) : (
                            <input
                              type="text"
                              placeholder="Away ground name"
                              value={row.venue}
                              onChange={e => updateWeekendRow(row.rowId, { venue: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-sm font-semibold text-slate-600 tabular-nums">
                  {readyWeekendFixtures.length} team{readyWeekendFixtures.length === 1 ? '' : 's'} ready to save
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSaveWeekendFixtures(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-white text-sm font-bold cursor-pointer"
                  >
                    Save Weekend Fixtures
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveWeekendFixtures(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-sm font-bold cursor-pointer"
                  >
                    Save &amp; Make Poster
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: ENTER SCORES (ONE TEAM vs ALL TEAMS WEEKEND SHEET)
         ===================================================================== */}
      {activeTab === 'scores' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-extrabold font-heading text-[#0B1F3A]">
                Enter Match Scores
              </h3>
              <p className="text-sm text-slate-600">
                Enter full-time scores for one team or all teams together on one page.
              </p>
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setScoreMode('collective')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  scoreMode === 'collective'
                    ? 'bg-white text-[#0B1F3A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                All Teams (Weekend Sheet)
              </button>
              <button
                type="button"
                onClick={() => setScoreMode('single')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  scoreMode === 'single'
                    ? 'bg-white text-[#0B1F3A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                One Team
              </button>
            </div>
          </div>

          {scoreMode === 'single' ? (
            fixtures.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-sm text-slate-600">Add a fixture first before entering a score.</p>
                <button
                  type="button"
                  onClick={() => openAddFixtures('collective')}
                  className="px-4 py-2.5 rounded-xl bg-[#E31E24] text-white text-sm font-bold cursor-pointer"
                >
                  Add Fixtures
                </button>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  saveSingleScore(false);
                }}
                className="max-w-xl space-y-5 text-sm"
              >
                <div>
                  <label className="block font-bold text-[#0B1F3A] mb-1">Choose Match</label>
                  <select
                    value={selectedFixtureForScore?.id || ''}
                    onChange={e => handleSelectFixtureToScore(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                  >
                    {fixtures.map(f => (
                      <option key={f.id} value={f.id}>
                        {getSquadLabel(f.squadId)} · MGFC vs {f.opponent} ({formatDateMMDDYYYY(f.date)})
                        {f.status === 'Completed' ? ` — ${f.mgfcScore ?? 0}–${f.opponentScore ?? 0}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedFixtureForScore && (
                  <>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-around gap-4">
                      <div className="text-center">
                        <div className="text-sm font-bold text-[#0B1F3A] mb-2">
                          MGFC ({getSquadLabel(selectedFixtureForScore.squadId)})
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={scoreForm.mgfcScore}
                          onChange={e =>
                            setScoreForm({ ...scoreForm, mgfcScore: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-20 h-14 bg-white border border-slate-300 rounded-xl text-center text-3xl font-black text-[#E31E24] tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                        />
                      </div>

                      <span className="text-xl font-bold text-slate-400">–</span>

                      <div className="text-center">
                        <div className="text-sm font-bold text-[#0B1F3A] mb-2">
                          {selectedFixtureForScore.opponent}
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={scoreForm.oppScore}
                          onChange={e =>
                            setScoreForm({ ...scoreForm, oppScore: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-20 h-14 bg-white border border-slate-300 rounded-xl text-center text-3xl font-black text-[#0B1F3A] tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#0B1F3A] mb-1">
                        Short Match Note (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={scoreForm.coachNotes}
                        onChange={e => setScoreForm({ ...scoreForm, coachNotes: e.target.value })}
                        placeholder="Optional comment about the game..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-bold cursor-pointer"
                      >
                        Save Score
                      </button>
                      <button
                        type="button"
                        onClick={() => saveSingleScore(true)}
                        className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-white font-bold cursor-pointer"
                      >
                        Save &amp; Make Poster
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('list')}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </form>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={scoreDateFilter}
                    onChange={e => setScoreDateFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-[#0B1F3A] tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                  >
                    <option value="all">All Dates</option>
                    {availableDates.map(d => (
                      <option key={d} value={d}>
                        {formatDateMMDDYYYY(d)}
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSavedResults}
                      onChange={e => setShowSavedResults(e.target.checked)}
                      className="accent-[#E31E24] w-4 h-4"
                    />
                    <span>Show already saved scores</span>
                  </label>
                </div>
              </div>

              {scoreSheetFixtures.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm text-slate-600">No upcoming games waiting for scores.</p>
                  <button
                    type="button"
                    onClick={() => setShowSavedResults(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-[#0B1F3A] cursor-pointer"
                  >
                    Show Saved Scores
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs">
                      <tr>
                        <th className="px-3 py-3 text-left font-bold w-10">Save</th>
                        <th className="px-3 py-3 text-left font-bold">Team</th>
                        <th className="px-3 py-3 text-left font-bold min-w-[180px]">Match</th>
                        <th className="px-3 py-3 text-center font-bold">MGFC</th>
                        <th className="px-3 py-3 text-center font-bold">Opponent</th>
                        <th className="px-3 py-3 text-center font-bold">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {scoreSheetFixtures.map(fix => {
                        const draft = weekendScoreDrafts[fix.id] || {
                          include: false,
                          mgfcScore: fix.mgfcScore ?? 0,
                          oppScore: fix.opponentScore ?? 0,
                          coachNotes: fix.coachNotes || '',
                        };
                        const outcome =
                          draft.mgfcScore > draft.oppScore
                            ? 'Win'
                            : draft.mgfcScore === draft.oppScore
                            ? 'Draw'
                            : 'Loss';
                        const outcomeColor =
                          outcome === 'Win'
                            ? 'text-emerald-700'
                            : outcome === 'Draw'
                            ? 'text-amber-700'
                            : 'text-[#E31E24]';

                        return (
                          <tr key={fix.id} className={draft.include ? 'bg-red-50/30' : ''}>
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                checked={draft.include}
                                onChange={e => updateScoreDraft(fix.id, { include: e.target.checked })}
                                className="accent-[#E31E24] w-4 h-4 cursor-pointer"
                                aria-label={`Save score for ${getSquadLabel(fix.squadId)}`}
                              />
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="font-bold text-[#0B1F3A]">{getSquadLabel(fix.squadId)}</div>
                              <div className="text-xs text-slate-500 tabular-nums">{formatDateMMDDYYYY(fix.date)}</div>
                            </td>
                            <td className="px-3 py-3 font-semibold text-[#0B1F3A]">
                              MGFC vs {fix.opponent}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="30"
                                value={draft.mgfcScore}
                                onChange={e =>
                                  updateScoreDraft(fix.id, {
                                    mgfcScore: parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                className="w-16 h-10 bg-slate-50 border border-slate-300 rounded-lg text-center text-base font-black text-[#E31E24] tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                              />
                            </td>
                            <td className="px-3 py-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="30"
                                value={draft.oppScore}
                                onChange={e =>
                                  updateScoreDraft(fix.id, {
                                    oppScore: parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                className="w-16 h-10 bg-slate-50 border border-slate-300 rounded-lg text-center text-base font-black text-[#0B1F3A] tabular-nums focus:outline-none focus:border-[#0B1F3A]"
                              />
                            </td>
                            <td className={`px-3 py-3 text-center font-bold ${outcomeColor}`}>
                              {outcome}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-sm font-semibold text-slate-600 tabular-nums">
                  {selectedWeekendScores.length} score{selectedWeekendScores.length === 1 ? '' : 's'} selected
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSaveWeekendScores(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-white text-sm font-bold cursor-pointer"
                  >
                    Save All Scores
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveWeekendScores(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-sm font-bold cursor-pointer"
                  >
                    Save &amp; Make Poster
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
