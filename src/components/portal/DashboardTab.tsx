import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { SeasonManagerModal, SeasonManagerTab } from './SeasonManagerModal';
import { formatDateMMDDYYYY } from '../../utils/dateFormat';
import {
  Users,
  Trophy,
  DollarSign,
  Calendar,
  CheckCircle2,
  UserPlus,
  Archive,
  ArrowRight,
  Image as ImageIcon,
  Wallet,
} from 'lucide-react';

export const DashboardTab: React.FC = () => {
  const {
    players,
    squads,
    fixtures,
    transactions,
    meetings,
    trialApplications,
    registrationOpen,
    setRegistrationOpen,
    currentSeasonYear,
    seasonArchives,
    openSocialStudioForFixture,
    setActiveView,
    toggleActionItemStatus,
  } = useClub();

  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [seasonModalTab, setSeasonModalTab] = useState<SeasonManagerTab>('archive');
  const [matchTab, setMatchTab] = useState<'upcoming' | 'results'>('upcoming');

  const openSeasonModal = (tab: SeasonManagerTab) => {
    setSeasonModalTab(tab);
    setSeasonModalOpen(true);
  };

  // Club figures
  const totalFeesDue = players.reduce((sum, p) => sum + p.feeDue, 0);
  const totalFeesCollected = players.reduce((sum, p) => sum + p.feePaid, 0);
  const collectionRate = totalFeesDue > 0 ? Math.round((totalFeesCollected / totalFeesDue) * 100) : 0;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const upcomingMatches = fixtures.filter(f => f.status === 'Scheduled');
  const completedFixtures = fixtures.filter(f => f.status === 'Completed');
  const pendingTrials = trialApplications.filter(a => a.status === 'Pending Review');

  const allTasks = meetings.flatMap(m =>
    m.actionItems.map(item => ({ ...item, meetingId: m.id }))
  );
  const openTasks = allTasks.filter(i => i.status !== 'Completed');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Simple Top Welcome Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1F3A] tracking-tight">
            Marlboro Gardens FC · {currentSeasonYear} Season
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Simple overview of your players, fees, weekend matches, and club tasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setRegistrationOpen(!registrationOpen)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              registrationOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Registration: {registrationOpen ? 'Open' : 'Closed'}</span>
          </button>

          <button
            type="button"
            onClick={() => openSeasonModal('archive')}
            className="px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <Archive className="w-4 h-4 text-[#E31E24] shrink-0" />
            <span>
              Season &amp; Archives{seasonArchives.length > 0 ? ` (${seasonArchives.length})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Four Plain-English Summary Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveView('squads')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0B1F3A] transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-semibold">Players &amp; Squads</span>
            <Users className="w-5 h-5 text-[#0B1F3A]" />
          </div>
          <div className="text-3xl font-extrabold font-heading text-[#0B1F3A] tabular-nums">
            {players.length}
          </div>
          <div className="text-xs text-slate-600">
            {squads.length} squads · {pendingTrials.length} new sign-up{pendingTrials.length === 1 ? '' : 's'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('finance')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0B1F3A] transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-semibold">Fees Collected</span>
            <DollarSign className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-extrabold font-heading text-[#0B1F3A] tabular-nums">
              {collectionRate}%
            </span>
            <span className="text-xs font-semibold text-slate-600 tabular-nums">
              R{totalFeesCollected.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('fixtures')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0B1F3A] transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-semibold">Matches</span>
            <Calendar className="w-5 h-5 text-[#E31E24]" />
          </div>
          <div className="text-3xl font-extrabold font-heading text-[#0B1F3A] tabular-nums">
            {upcomingMatches.length}
          </div>
          <div className="text-xs text-slate-600 tabular-nums">
            Upcoming · {completedFixtures.length} result{completedFixtures.length === 1 ? '' : 's'} saved
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('finance')}
          className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#0B1F3A] transition-colors cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-semibold">Club Balance</span>
            <Wallet className="w-5 h-5 text-[#0B1F3A]" />
          </div>
          <div className="text-3xl font-extrabold font-heading text-[#0B1F3A] tabular-nums">
            R{netBalance.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 tabular-nums">
            In R{totalIncome.toLocaleString()} · Out R{totalExpenses.toLocaleString()}
          </div>
        </button>
      </div>

      {/* 3. Big, Easy Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <h3 className="text-lg font-extrabold font-heading text-[#0B1F3A]">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setActiveView('fixtures')}
            className="p-4 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-white text-left transition-colors cursor-pointer flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-sm font-bold">Add Weekend Fixtures</div>
              <div className="text-xs text-slate-300 mt-0.5">Capture confirmed games</div>
            </div>
            <Calendar className="w-5 h-5 text-[#E31E24] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveView('fixtures')}
            className="p-4 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-left transition-colors cursor-pointer flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-sm font-bold">Enter Match Scores</div>
              <div className="text-xs text-red-100 mt-0.5">Record weekend results</div>
            </div>
            <Trophy className="w-5 h-5 text-white shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveView('finance')}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0B1F3A] border border-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-sm font-bold">Record Fee Payment</div>
              <div className="text-xs text-slate-600 mt-0.5">Update player fees</div>
            </div>
            <DollarSign className="w-5 h-5 text-emerald-700 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() =>
              openSocialStudioForFixture({
                template: 'Weekly Fixtures Slate',
                openSection: 'poster',
              })
            }
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0B1F3A] border border-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-sm font-bold">Create Social Poster</div>
              <div className="text-xs text-slate-600 mt-0.5">Fixtures or results image</div>
            </div>
            <ImageIcon className="w-5 h-5 text-[#E31E24] shrink-0" />
          </button>
        </div>
      </div>

      {/* 4. Two Clean Working Lists: Weekend Matches & To-Do / Sign-Ups */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Weekend Matches */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold font-heading text-[#0B1F3A]">
              Weekend Matches
            </h3>

            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setMatchTab('upcoming')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer tabular-nums ${
                  matchTab === 'upcoming'
                    ? 'bg-white text-[#0B1F3A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Upcoming ({upcomingMatches.length})
              </button>
              <button
                type="button"
                onClick={() => setMatchTab('results')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer tabular-nums ${
                  matchTab === 'results'
                    ? 'bg-white text-[#0B1F3A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0B1F3A]'
                }`}
              >
                Results ({completedFixtures.length})
              </button>
            </div>
          </div>

          {matchTab === 'upcoming' ? (
            upcomingMatches.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {upcomingMatches.slice(0, 5).map(fixture => {
                  const squadName = squads.find(s => s.id === fixture.squadId)?.name || 'Squad';
                  return (
                    <div
                      key={fixture.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#E31E24] tabular-nums">
                          {squadName} · {formatDateMMDDYYYY(fixture.date)} at {fixture.kickoffTime}
                        </div>
                        <div className="text-sm font-bold text-[#0B1F3A] mt-0.5">
                          {fixture.isHome ? 'MGFC' : fixture.opponent} vs{' '}
                          {fixture.isHome ? fixture.opponent : 'MGFC'}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{fixture.pitch}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveView('fixtures')}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0B1F3A] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
                      >
                        Enter Score
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-sm text-slate-600">No upcoming matches added yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveView('fixtures')}
                  className="px-4 py-2 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold cursor-pointer"
                >
                  Add Weekend Fixtures
                </button>
              </div>
            )
          ) : completedFixtures.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {completedFixtures.slice(0, 5).map(fixture => {
                const squadName = squads.find(s => s.id === fixture.squadId)?.name || 'Squad';
                return (
                  <div
                    key={fixture.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-500 tabular-nums">
                        {squadName} · {formatDateMMDDYYYY(fixture.date)}
                      </div>
                      <div className="text-sm font-bold text-[#0B1F3A] mt-0.5 tabular-nums">
                        MGFC <span className="text-[#E31E24]">{fixture.mgfcScore ?? 0}</span> –{' '}
                        {fixture.opponentScore ?? 0} {fixture.opponent}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openSocialStudioForFixture({
                          fixtureId: fixture.id,
                          template: 'Full Time',
                          openSection: 'poster',
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-xs font-bold text-white transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
                    >
                      Make Poster
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-600">
              No match scores recorded yet.
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveView('fixtures')}
              className="text-sm font-bold text-[#E31E24] hover:text-[#B91C1C] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Open Fixtures &amp; Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Needs Attention (New Player Sign-Ups & Open Tasks) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6">
          {/* New Player Requests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold font-heading text-[#0B1F3A]">
                New Player Sign-Ups
              </h3>
              <span className="text-xs font-bold text-[#E31E24] tabular-nums">
                {pendingTrials.length} waiting
              </span>
            </div>

            {pendingTrials.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {pendingTrials.slice(0, 3).map(app => (
                  <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#0B1F3A] truncate">
                        {app.fullName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {app.preferredPosition} · {app.phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveView('squads')}
                      className="text-xs font-bold text-[#0B1F3A] hover:text-[#E31E24] whitespace-nowrap cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-2">
                No new player sign-ups waiting right now.
              </p>
            )}
          </div>

          {/* Open Club Tasks */}
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold font-heading text-[#0B1F3A]">
                Club To-Do List
              </h3>
              <span className="text-xs font-semibold text-slate-500 tabular-nums">
                {openTasks.length} open
              </span>
            </div>

            {allTasks.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {allTasks.slice(0, 4).map(item => (
                  <label
                    key={item.id}
                    className="py-3 flex items-start gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.status === 'Completed'}
                      onChange={() => toggleActionItemStatus(item.meetingId, item.id)}
                      className="mt-1 h-4 w-4 rounded text-[#E31E24] focus:ring-[#E31E24] border-slate-300 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm font-semibold ${
                          item.status === 'Completed'
                            ? 'line-through text-slate-400'
                            : 'text-[#0B1F3A]'
                        }`}
                      >
                        {item.task}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {item.assignee} · Due {formatDateMMDDYYYY(item.dueDate)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="py-2 flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All caught up!</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveView('governance')}
                className="text-sm font-bold text-[#E31E24] hover:text-[#B91C1C] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View all tasks &amp; meetings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <SeasonManagerModal
        isOpen={seasonModalOpen}
        onClose={() => setSeasonModalOpen(false)}
        initialTab={seasonModalTab}
      />
    </div>
  );
};
