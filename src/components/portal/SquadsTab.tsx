import React, { useState, useMemo } from 'react';
import { useClub, NEXT_SQUAD_MAP } from '../../context/ClubContext';
import { Player, PlayerPosition, PlayerStatus, FeeStatus } from '../../types';
import { SeasonManagerModal, SeasonManagerTab } from './SeasonManagerModal';
import { DateInput } from '../common/DateInput';
import { formatDateMMDDYYYY } from '../../utils/dateFormat';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  UserCheck,
  Archive,
  History,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

export const SquadsTab: React.FC = () => {
  const {
    players,
    squads,
    teamFeeSheets,
    addPlayer,
    updatePlayer,
    deletePlayer,
    trialApplications,
    updateTrialStatus,
    clearSeasonRegistrations,
    registrationOpen,
    setRegistrationOpen,
    registrationSeasonLabel,
    currentSeasonYear,
    seasonArchives,
    promoteSinglePlayer,
    showToast,
  } = useClub();

  const [selectedSquad, setSelectedSquad] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [showTrials, setShowTrials] = useState(false);

  // Season Archive & Rollover state
  const [viewingArchiveId, setViewingArchiveId] = useState<string>('active');
  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [seasonModalTab, setSeasonModalTab] = useState<SeasonManagerTab>('promote');
  const [seasonModalSourceSquad, setSeasonModalSourceSquad] = useState<string | undefined>(undefined);

  const openSeasonModal = (tab: SeasonManagerTab, sourceSquad?: string) => {
    setSeasonModalTab(tab);
    setSeasonModalSourceSquad(sourceSquad);
    setSeasonModalOpen(true);
  };

  const activeArchive = useMemo(
    () => (viewingArchiveId === 'active' ? null : seasonArchives.find(a => a.id === viewingArchiveId) || null),
    [viewingArchiveId, seasonArchives]
  );
  const isReadOnlyArchive = !!activeArchive;
  const displayedSquads = activeArchive ? activeArchive.snapshot.squads : squads;
  const displayedPlayers = activeArchive ? activeArchive.snapshot.players : players;
  const displayedFeeSheets = activeArchive ? activeArchive.snapshot.teamFeeSheets : teamFeeSheets;

  // Form state for creating / editing player
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    squadId: squads[0]?.id || 'u6',
    position: 'MF' as PlayerPosition,
    jerseyNumber: 10,
    dob: '2016-01-01',
    idNumber: '',
    safaNumber: '',
    status: 'Active' as PlayerStatus,
    phone: '',
    email: '',
    parentGuardian: '',
    parentPhone: '',
    medicalNotes: '',
    feeDue: 1800,
    feePaid: 0,
    feeStatus: 'Overdue' as FeeStatus,
    appearances: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    attendanceRate: 90,
    dateJoined: new Date().toISOString().split('T')[0],
  });

  const openAddModal = () => {
    setEditingPlayer(null);
    setFormData({
      firstName: '',
      lastName: '',
      squadId: selectedSquad !== 'all' ? selectedSquad : squads[0]?.id || 'u6',
      position: 'MF',
      jerseyNumber: Math.floor(1 + Math.random() * 30),
      dob: '2016-05-15',
      idNumber: '',
      safaNumber: `NRFA-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Active',
      phone: '',
      email: '',
      parentGuardian: '',
      parentPhone: '',
      medicalNotes: '',
      feeDue: 1800,
      feePaid: 0,
      feeStatus: 'Overdue',
      appearances: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      attendanceRate: 100,
      dateJoined: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      squadId: player.squadId,
      position: player.position,
      jerseyNumber: player.jerseyNumber,
      dob: player.dob,
      idNumber: player.idNumber,
      safaNumber: player.safaNumber,
      status: player.status,
      phone: player.phone,
      email: player.email,
      parentGuardian: player.parentGuardian || '',
      parentPhone: player.parentPhone || '',
      medicalNotes: player.medicalNotes || '',
      feeDue: player.feeDue,
      feePaid: player.feePaid,
      feeStatus: player.feeStatus,
      appearances: player.appearances,
      goals: player.goals,
      assists: player.assists,
      yellowCards: player.yellowCards,
      redCards: player.redCards,
      attendanceRate: player.attendanceRate,
      dateJoined: player.dateJoined,
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    if (editingPlayer) {
      updatePlayer({
        ...editingPlayer,
        ...formData,
      });
    } else {
      addPlayer(formData);
    }
    setIsAddModalOpen(false);
  };

  // Convert approved trial or registration applicant to official player
  const convertTrialToPlayer = (app: any) => {
    addPlayer({
      firstName: app.fullName.split(' ')[0] || app.fullName,
      lastName: app.fullName.split(' ').slice(1).join(' ') || 'Player',
      squadId: app.preferredSquad || 'u13',
      position: app.preferredPosition || 'MF',
      jerseyNumber: Math.floor(1 + Math.random() * 35),
      dob: app.dob || '2014-01-01',
      idNumber: app.playerIdNumber || 'To be verified',
      safaNumber: app.safaCardNumber || `NRFA-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Active',
      phone: app.phone,
      email: app.email,
      parentGuardian: app.parentName,
      parentPhone: app.phone,
      medicalNotes: `${app.registrationType === 'existing' ? 'Returning / Existing MGFC player' : `New ${registrationSeasonLabel} player registration`}${app.affordabilityConfirmed ? ` • Fee affordability: ${app.affordabilityConfirmed}` : ''}${app.address ? ` • Address: ${app.address}` : ''}`,
      feeDue: 1800,
      feePaid: 0,
      feeStatus: 'Overdue',
      appearances: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      attendanceRate: 100,
      dateJoined: app.formDate || new Date().toISOString().split('T')[0],
    });
    updateTrialStatus(app.id, 'Approved');
    showToast(`Applicant ${app.fullName} converted to official squad player!`);
  };

  // Filter players
  const filteredPlayers = displayedPlayers.filter(player => {
    const matchesSquad = selectedSquad === 'all' || player.squadId === selectedSquad;
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      player.firstName.toLowerCase().includes(query) ||
      player.lastName.toLowerCase().includes(query) ||
      player.safaNumber.toLowerCase().includes(query) ||
      player.idNumber.toLowerCase().includes(query);

    return matchesSquad && matchesPosition && matchesSearch;
  });

  const activeSquadObj = selectedSquad !== 'all' ? displayedSquads.find(s => s.id === selectedSquad) : null;
  const activeFeeSheet = selectedSquad !== 'all' ? displayedFeeSheets.find(s => s.id === selectedSquad) : null;
  const activeSheetTotals = activeFeeSheet
    ? activeFeeSheet.players.reduce(
        (acc, r) => {
          acc.billed += r.amountDue || 0;
          acc.paid += r.totalPaid || 0;
          acc.balance += r.isDonationRow
            ? (r.amountDue || 0) - (r.totalPaid || 0)
            : r.isInactive
            ? 0
            : Math.max(0, (r.amountDue || 0) - (r.totalPaid || 0));
          return acc;
        },
        { billed: 0, paid: 0, balance: 0 }
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#E31E24] mb-0.5">
            {isReadOnlyArchive
              ? `Archived ${activeArchive?.seasonLabel} · Read-Only`
              : `Active ${currentSeasonYear} Season`}
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-wide">
            Squads & Player Master Registry
          </h2>
          <p className="text-xs text-[#718096] mt-0.5 font-medium">
            NRFA player verification cards, medical records, jersey assignments, and year-to-year squad progression.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openSeasonModal('promote', selectedSquad !== 'all' ? selectedSquad : 'u7')}
            className="px-3.5 py-2 rounded-xl bg-white text-[#0B1F3A] border border-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#E31E24]" />
            <span>Move Squads Forward</span>
          </button>
          <button
            onClick={() => openSeasonModal('archive')}
            className="px-3.5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5 text-[#E31E24]" />
            <span>Archive Year & Start Fresh</span>
          </button>
          <button
            onClick={() => setRegistrationOpen(!registrationOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              registrationOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-[#718096] border-slate-300 hover:bg-slate-200'
            }`}
            title="Toggle public seasonal registration links and buttons on or off"
          >
            <span>Public Registration: {registrationOpen ? 'Open' : 'Closed'}</span>
          </button>
          <button
            onClick={() => setShowTrials(!showTrials)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showTrials
                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                : 'bg-white text-[#0B1F3A] border-slate-300 hover:bg-slate-100 shadow-xs'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#E31E24]" />
            <span>Registrations ({trialApplications.length})</span>
          </button>
          {!isReadOnlyArchive && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register New Player
            </button>
          )}
        </div>
      </div>

      {/* Season Year / Archive Switcher Bar */}
      <div className="bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider px-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#E31E24]" /> Season View:
          </span>
          <button
            onClick={() => setViewingArchiveId('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              viewingArchiveId === 'active'
                ? 'bg-[#0B1F3A] text-white shadow-xs'
                : 'text-[#718096] hover:text-[#0B1F3A] hover:bg-slate-50'
            }`}
          >
            Active: {currentSeasonYear} Season
          </button>
          {seasonArchives.map(arch => (
            <button
              key={arch.id}
              onClick={() => setViewingArchiveId(arch.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewingArchiveId === arch.id
                  ? 'bg-[#E31E24] text-white shadow-xs'
                  : 'text-[#718096] hover:text-[#0B1F3A] hover:bg-slate-50'
              }`}
            >
              Archived: {arch.seasonYear} ({arch.summary.totalPlayers})
            </button>
          ))}
        </div>

        {isReadOnlyArchive && (
          <button
            onClick={() => setViewingArchiveId('active')}
            className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold hover:bg-amber-100 cursor-pointer"
          >
            Read-Only Archive · Return to Active {currentSeasonYear} &rarr;
          </button>
        )}
      </div>

      {/* Trial Applications Panel if toggled */}
      {showTrials && (
        <div className="p-6 rounded-3xl bg-white border border-red-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#E31E24]" />
              <h3 className="font-heading font-extrabold text-xl text-[#0B1F3A] uppercase">
                Public Trial & Registration Applicants ({registrationSeasonLabel})
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#E31E24]">
                {trialApplications.filter(t => t.status === 'Pending Review').length} pending review
              </span>
              {trialApplications.length > 0 && (
                <>
                  <button
                    onClick={() => clearSeasonRegistrations(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F0F4F9] hover:bg-slate-200 text-[#0B1F3A] text-[11px] font-bold border border-slate-200 cursor-pointer"
                  >
                    Clear Processed
                  </button>
                  <button
                    onClick={() => openSeasonModal('archive')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0B1F3A] hover:bg-[#15325b] text-white text-[11px] font-bold cursor-pointer"
                  >
                    Archive Year & Start Fresh
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trialApplications.map(app => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200 text-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#0B1F3A] text-sm">{app.fullName}</span>
                        {app.registrationType && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              app.registrationType === 'existing'
                                ? 'bg-blue-100 text-[#0B1F3A]'
                                : 'bg-red-100 text-[#E31E24]'
                            }`}
                          >
                            {app.registrationType === 'existing' ? 'Existing Player' : 'New Player'}
                          </span>
                        )}
                      </div>
                      <div className="text-[#718096] text-[11px] font-medium tabular-nums">
                        {app.suburb || 'Marlboro Gardens'} • DOB: {formatDateMMDDYYYY(app.dob)}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[#E31E24] font-black border border-slate-200 shrink-0">
                      {app.preferredPosition}
                    </span>
                  </div>

                  <div className="mt-2 text-[#0B1F3A] space-y-1 text-[11px] font-medium">
                    <div>
                      Age Group / Squad:{' '}
                      <strong>{squads.find(s => s.id === app.preferredSquad)?.name || app.preferredSquad}</strong>
                    </div>
                    {app.playerIdNumber && (
                      <div>
                        Player ID / Birth Cert: <strong>{app.playerIdNumber}</strong>
                      </div>
                    )}
                    {app.safaCardNumber && (
                      <div>
                        NRFA Card: <strong>{app.safaCardNumber}</strong>
                      </div>
                    )}
                    <div>
                      Contact: <strong>{app.phone}</strong>
                    </div>
                    {app.parentName && (
                      <div>
                        Parent/Guardian: <strong>{app.parentName}</strong>
                        {app.parentIdNumber ? ` (ID: ${app.parentIdNumber})` : ''}
                      </div>
                    )}
                    {app.address && <div className="truncate">Address: {app.address}</div>}
                    {app.previousClub && <div>Prev Club: {app.previousClub}</div>}
                    {(app.indemnityAccepted || app.affordabilityConfirmed) && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {app.indemnityAccepted && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                            Indemnity Signed
                          </span>
                        )}
                        {app.affordabilityConfirmed && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              app.affordabilityConfirmed === 'YES'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            R1,800 Fee Affordability: {app.affordabilityConfirmed}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'Invited for Trial'
                        ? 'bg-red-100 text-[#E31E24]'
                        : 'bg-slate-200 text-[#718096]'
                    }`}
                  >
                    {app.status}
                  </span>

                  {app.status !== 'Approved' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateTrialStatus(app.id, 'Invited for Trial')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-[#0B1F3A] text-[10px] font-bold"
                      >
                        Invite
                      </button>
                      <button
                        onClick={() => convertTrialToPlayer(app)}
                        className="px-2.5 py-1 rounded-lg bg-[#E31E24] hover:bg-[#C91419] text-white text-[10px] font-extrabold"
                      >
                        Register
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clickable Youth Age-Group Squad Selector Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setSelectedSquad('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 min-w-max cursor-pointer ${
            selectedSquad === 'all'
              ? 'bg-[#0B1F3A] text-white shadow-sm'
              : 'text-[#718096] hover:text-[#0B1F3A] hover:bg-slate-50'
          }`}
        >
          <span>All Squads</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${selectedSquad === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {displayedPlayers.length}
          </span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1 shrink-0" />

        {displayedSquads.map(sq => {
          const isSelected = selectedSquad === sq.id;
          const count = displayedPlayers.filter(p => p.squadId === sq.id).length;
          return (
            <button
              key={sq.id}
              onClick={() => setSelectedSquad(sq.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-w-max cursor-pointer ${
                isSelected
                  ? 'bg-[#E31E24] text-white shadow-xs'
                  : 'text-[#718096] hover:text-[#0B1F3A] hover:bg-slate-50'
              }`}
            >
              <span>{sq.id.toUpperCase()}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Squad Coaching & Fee Register Alignment Summary */}
      {activeSquadObj && (
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black font-heading text-[#0B1F3A] uppercase tracking-wide">
                {activeSquadObj.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F4F9] text-[#0B1F3A] border border-slate-200">
                {activeSquadObj.division}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#718096]">
              <span>Head Coach: <strong className="text-[#0B1F3A]">{activeSquadObj.headCoach}</strong></span>
              <span>•</span>
              <span>Assistant Coach: <strong className="text-[#0B1F3A]">{activeSquadObj.assistantCoach}</strong></span>
              <span>•</span>
              <span>Training: <strong className="text-[#0B1F3A]">{activeSquadObj.trainingSchedule}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeSheetTotals && (
              <>
                <div className="bg-[#F0F4F9] px-3.5 py-2 rounded-2xl border border-slate-200 text-center tabular-nums">
                  <span className="text-[10px] text-[#718096] uppercase font-bold block">Fee Sheet Billed</span>
                  <span className="text-sm font-black text-[#0B1F3A]">R{activeSheetTotals.billed.toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 text-center tabular-nums">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Collected</span>
                  <span className="text-sm font-black text-emerald-800">R{activeSheetTotals.paid.toLocaleString()}</span>
                </div>
                <div className="bg-red-50 px-3.5 py-2 rounded-2xl border border-red-200 text-center tabular-nums">
                  <span className="text-[10px] text-[#E31E24] uppercase font-bold block">Balance</span>
                  <span className="text-sm font-black text-[#E31E24]">R{activeSheetTotals.balance.toLocaleString()}</span>
                </div>
              </>
            )}
            {!isReadOnlyArchive && NEXT_SQUAD_MAP[activeSquadObj.id] && (
              <button
                onClick={() => openSeasonModal('promote', activeSquadObj.id)}
                className="px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#E31E24] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>
                  Move {activeSquadObj.id.toUpperCase()} &rarr; {NEXT_SQUAD_MAP[activeSquadObj.id]?.toUpperCase()}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar - Crisp White */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search player name, NRFA card number, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#0B1F3A] placeholder-slate-400 focus:outline-none focus:border-[#E31E24] font-medium"
            />
          </div>

          {/* Squad Filter */}
          <select
            value={selectedSquad}
            onChange={e => setSelectedSquad(e.target.value)}
            className="bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B1F3A] focus:outline-none focus:border-[#E31E24] font-bold"
          >
            <option value="all">All Squads ({displayedPlayers.length})</option>
            {displayedSquads.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({displayedPlayers.filter(p => p.squadId === s.id).length})
              </option>
            ))}
          </select>

          {/* Position Filter */}
          <select
            value={selectedPosition}
            onChange={e => setSelectedPosition(e.target.value)}
            className="bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B1F3A] focus:outline-none focus:border-[#E31E24] font-bold"
          >
            <option value="all">All Positions</option>
            <option value="GK">Goalkeepers (GK)</option>
            <option value="DF">Defenders (DF)</option>
            <option value="MF">Midfielders (MF)</option>
            <option value="FW">Forwards (FW)</option>
          </select>
        </div>

        <div className="text-xs text-[#718096] font-medium">
          Showing <strong className="text-[#0B1F3A]">{filteredPlayers.length}</strong> players
        </div>
      </div>

      {/* Players Grid / Directory - Crisp White Cards */}
      {filteredPlayers.length === 0 && (
        <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <p className="text-sm font-bold text-[#0B1F3A]">
            No players found in {activeSquadObj ? activeSquadObj.name : 'this view'}.
          </p>
          <p className="text-xs text-[#718096]">
            {isReadOnlyArchive
              ? 'This archived squad had no registered players.'
              : 'Register a new player or move players forward from the previous age group.'}
          </p>
          {!isReadOnlyArchive && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl bg-[#E31E24] text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer"
              >
                Register Player
              </button>
              <button
                onClick={() => openSeasonModal('promote', 'u7')}
                className="px-4 py-2 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold cursor-pointer"
              >
                Move Squads Forward
              </button>
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlayers.map(player => {
          const squad = displayedSquads.find(s => s.id === player.squadId);
          const nextSquadId = NEXT_SQUAD_MAP[player.squadId];
          return (
            <div
              key={player.id}
              className={`p-5 rounded-3xl bg-white border transition-all shadow-sm hover:shadow-md space-y-4 flex flex-col justify-between ${
                player.status === 'Inactive'
                  ? 'border-red-200 bg-red-50/30 opacity-85 hover:border-[#E31E24]'
                  : 'border-slate-200 hover:border-[#E31E24]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-[#0B1F3A] text-white font-black font-heading flex items-center justify-center text-base shadow-xs">
                      #{player.jerseyNumber}
                    </span>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#E31E24]">
                        {player.position}
                      </span>
                      <span className="text-slate-300 mx-1.5">•</span>
                      <span className="text-xs text-[#718096] font-semibold">{squad?.name}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      player.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : player.status === 'Injured' || player.status === 'Inactive'
                        ? 'bg-red-100 text-[#E31E24]'
                        : 'bg-slate-200 text-[#718096]'
                    }`}
                  >
                    {player.status}
                  </span>
                </div>

                <div className="mt-3">
                  <h3
                    onClick={() => setViewingPlayer(player)}
                    className="cursor-pointer font-heading font-extrabold text-2xl text-[#0B1F3A] hover:text-[#E31E24] transition-colors uppercase"
                  >
                    {player.firstName} {player.lastName}
                  </h3>
                  <div className="text-[11px] text-[#718096] font-mono mt-0.5 font-medium">
                    {player.safaNumber}
                  </div>
                </div>

                {/* Player key stats */}
                <div className="grid grid-cols-4 gap-2 my-3 p-2.5 rounded-2xl bg-[#F0F4F9] border border-slate-200 text-center text-xs">
                  <div>
                    <div className="font-extrabold text-[#0B1F3A] text-sm">{player.appearances}</div>
                    <div className="text-[10px] text-[#718096] uppercase font-bold">Apps</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-[#E31E24] text-sm">{player.goals}</div>
                    <div className="text-[10px] text-[#718096] uppercase font-bold">Goals</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-blue-700 text-sm">{player.assists}</div>
                    <div className="text-[10px] text-[#718096] uppercase font-bold">Assists</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-emerald-700 text-sm">{player.attendanceRate}%</div>
                    <div className="text-[10px] text-[#718096] uppercase font-bold">Attend</div>
                  </div>
                </div>

                {/* Fee status indicator */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-[#718096] font-medium">Subscription Fee:</span>
                  <span
                    className={`font-bold ${
                      player.feeStatus === 'Paid'
                        ? 'text-emerald-700'
                        : player.feeStatus === 'Partial'
                        ? 'text-amber-600'
                        : player.feeStatus === 'Exempt / Bursary'
                        ? 'text-blue-700'
                        : 'text-[#E31E24]'
                    }`}
                  >
                    {player.feeStatus} (R{player.feePaid}/R{player.feeDue})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingPlayer(player)}
                  className="text-xs font-extrabold text-[#E31E24] hover:text-[#C91419] cursor-pointer"
                >
                  View Passport &rarr;
                </button>

                {!isReadOnlyArchive && (
                  <div className="flex items-center gap-1.5">
                    {nextSquadId && (
                      <button
                        onClick={() => promoteSinglePlayer(player.id, nextSquadId, true)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#F0F4F9] hover:bg-[#0B1F3A] hover:text-white text-[#0B1F3A] text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                        title={`Move ${player.firstName} to ${nextSquadId.toUpperCase()} for new season`}
                      >
                        Move &rarr; {nextSquadId.toUpperCase()}
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(player)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] cursor-pointer"
                      title="Edit Player"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${player.firstName} ${player.lastName} from squad?`)) {
                          deletePlayer(player.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-[#718096] hover:text-[#E31E24] cursor-pointer"
                      title="Delete Player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Player Modal - Crisp White */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase">
                {editingPlayer ? 'Edit Player Passport' : 'Register New Player to MGFC'}
              </h3>
              <p className="text-xs text-[#718096] mt-1 font-medium">
                Official NRFA and Marlboro Gardens FC player registration record.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Squad Assignment *</label>
                  <select
                    value={formData.squadId}
                    onChange={e => setFormData({ ...formData, squadId: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  >
                    {squads.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Position *</label>
                  <select
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value as PlayerPosition })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  >
                    <option value="GK">Goalkeeper (GK)</option>
                    <option value="DF">Defender (DF)</option>
                    <option value="MF">Midfielder (MF)</option>
                    <option value="FW">Forward (FW)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Jersey Number</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formData.jerseyNumber}
                    onChange={e => setFormData({ ...formData, jerseyNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">NRFA Card Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.safaNumber}
                    onChange={e => setFormData({ ...formData, safaNumber: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">National ID / Birth Cert No.</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Date of Birth (MM/DD/YYYY)</label>
                  <DateInput
                    value={formData.dob}
                    onChange={val => setFormData({ ...formData, dob: val })}
                    ariaLabel="Date of Birth"
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Date Joined (MM/DD/YYYY)</label>
                  <DateInput
                    value={formData.dateJoined}
                    onChange={val => setFormData({ ...formData, dateJoined: val })}
                    ariaLabel="Date Joined"
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Medical Notes & Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Asthmatic, carries pump in bag"
                  value={formData.medicalNotes}
                  onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as PlayerStatus })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  >
                    <option value="Active">Active</option>
                    <option value="Injured">Injured</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending Trial">Pending Trial</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Annual Fee (ZAR)</label>
                  <input
                    type="number"
                    value={formData.feeDue}
                    onChange={e => setFormData({ ...formData, feeDue: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Fee Status</label>
                  <select
                    value={formData.feeStatus}
                    onChange={e => setFormData({ ...formData, feeStatus: e.target.value as FeeStatus })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  >
                    <option value="Paid">Paid in Full</option>
                    <option value="Partial">Partial</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Exempt / Bursary">Exempt / Bursary</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-[#0B1F3A] hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold uppercase tracking-wider transition-all shadow-md shadow-red-600/25"
                >
                  {editingPlayer ? 'Update Player' : 'Save & Register Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Player Detailed Passport Modal - Crisp White */}
      {viewingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setViewingPlayer(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0B1F3A] text-white font-heading font-black text-3xl flex items-center justify-center shadow-sm">
                #{viewingPlayer.jerseyNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-3xl text-[#0B1F3A] uppercase">
                    {viewingPlayer.firstName} {viewingPlayer.lastName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#E31E24] text-white">
                    {viewingPlayer.position}
                  </span>
                </div>
                <div className="text-xs text-[#718096] mt-1 font-medium tabular-nums">
                  {squads.find(s => s.id === viewingPlayer.squadId)?.name} • Joined {formatDateMMDDYYYY(viewingPlayer.dateJoined)}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F0F4F9] p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">NRFA Card Number</span>
                  <span className="font-mono font-bold text-[#0B1F3A]">{viewingPlayer.safaNumber}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">National ID Number</span>
                  <span className="font-mono font-bold text-[#0B1F3A]">{viewingPlayer.idNumber || 'Pending'}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">Date of Birth</span>
                  <span className="font-bold text-[#0B1F3A] tabular-nums">{formatDateMMDDYYYY(viewingPlayer.dob)}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">Player Status</span>
                  <span className="font-bold text-emerald-700">{viewingPlayer.status}</span>
                </div>
              </div>

              <div className="bg-[#F0F4F9] p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-[#0B1F3A] font-extrabold uppercase tracking-wider text-[11px]">
                  Emergency & Medical Info
                </div>
                <div className="text-[#718096]">
                  <strong className="text-[#0B1F3A]">Notes:</strong> {viewingPlayer.medicalNotes || 'No specific medical concerns on file.'}
                </div>
                <div className="flex justify-between pt-1 text-[#718096]">
                  <span>Player Phone: <strong className="text-[#0B1F3A]">{viewingPlayer.phone}</strong></span>
                  {viewingPlayer.parentPhone && (
                    <span>Parent: <strong className="text-[#0B1F3A]">{viewingPlayer.parentPhone}</strong></span>
                  )}
                </div>
              </div>

              <div className="bg-[#F0F4F9] p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-[#718096] uppercase font-bold">
                    Season {activeArchive ? activeArchive.seasonYear : currentSeasonYear} Subscription
                  </div>
                  <div className="text-sm font-extrabold text-[#0B1F3A]">
                    R{viewingPlayer.feePaid} paid / R{viewingPlayer.feeDue} due
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B1F3A] text-white">
                  {viewingPlayer.feeStatus}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-end gap-3">
              {!isReadOnlyArchive && NEXT_SQUAD_MAP[viewingPlayer.squadId] && (
                <button
                  onClick={() => {
                    const nextId = NEXT_SQUAD_MAP[viewingPlayer.squadId]!;
                    promoteSinglePlayer(viewingPlayer.id, nextId, true);
                    setViewingPlayer(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-bold cursor-pointer"
                >
                  Move to {NEXT_SQUAD_MAP[viewingPlayer.squadId]?.toUpperCase()} &rarr;
                </button>
              )}
              {!isReadOnlyArchive && (
                <button
                  onClick={() => {
                    setViewingPlayer(null);
                    openEditModal(viewingPlayer);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0B1F3A] cursor-pointer"
                >
                  Edit Passport
                </button>
              )}
              <button
                onClick={() => setViewingPlayer(null)}
                className="px-5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <SeasonManagerModal
        isOpen={seasonModalOpen}
        onClose={() => setSeasonModalOpen(false)}
        initialTab={seasonModalTab}
        initialSourceSquadId={seasonModalSourceSquad}
      />
    </div>
  );
};
