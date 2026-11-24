import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Player,
  Squad,
  Fixture,
  FinanceTransaction,
  GovernanceMeeting,
  ClubDocument,
  ClubNewsItem,
  TacticalSetup,
  PublicTrialApplication,
  TeamFeeSheet,
  TeamFeePlayerRow,
  MonthInstallment,
  SeasonArchive,
  ArchiveRolloverOptions,
  PromoteSquadOptions,
  SocialMediaPost,
  SocialPosterTemplate,
} from '../types';
import {
  INITIAL_PLAYERS,
  INITIAL_SQUADS,
  INITIAL_FIXTURES,
  INITIAL_TRANSACTIONS,
  INITIAL_MEETINGS,
  INITIAL_DOCUMENTS,
  INITIAL_NEWS,
  DEFAULT_TACTICAL_SETUP,
  INITIAL_TRIAL_APPLICATIONS,
  INITIAL_TEAM_FEE_SHEETS,
} from '../data/initialData';

export type FeeMonthKey = 'apr' | 'may' | 'june' | 'july' | 'augSep' | 'sept' | 'oct';
export const YOUTH_AGE_ORDER = ['u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12', 'u13'] as const;
export const NEXT_SQUAD_MAP: Record<string, string | null> = {
  u6: 'u7',
  u7: 'u8',
  u8: 'u9',
  u9: 'u10',
  u10: 'u11',
  u11: 'u12',
  u12: 'u13',
  u13: null,
};
const DATA_SEED_VERSION = 2;

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SocialStudioIntent {
  fixtureId?: string;
  fixtureIds?: string[];
  template?: SocialPosterTemplate;
  openSection?: 'intake' | 'poster' | 'archive';
  timestamp: number;
}

interface ClubContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;

  squads: Squad[];
  players: Player[];
  fixtures: Fixture[];
  transactions: FinanceTransaction[];
  meetings: GovernanceMeeting[];
  documents: ClubDocument[];
  news: ClubNewsItem[];
  tactics: TacticalSetup;
  trialApplications: PublicTrialApplication[];
  teamFeeSheets: TeamFeeSheet[];
  registrationOpen: boolean;
  setRegistrationOpen: (open: boolean) => void;
  registrationSeasonLabel: string;
  setRegistrationSeasonLabel: (label: string) => void;
  currentSeasonYear: number;
  seasonArchives: SeasonArchive[];
  socialPosts: SocialMediaPost[];
  socialStudioIntent: SocialStudioIntent | null;
  openSocialStudioForFixture: (options: {
    fixtureId?: string;
    fixtureIds?: string[];
    template?: SocialPosterTemplate;
    openSection?: 'intake' | 'poster' | 'archive';
  }) => void;
  clearSocialStudioIntent: () => void;

  // Toast
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Actions
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (id: string) => void;

  addFixture: (fixture: Omit<Fixture, 'id' | 'matchEvents'>) => void;
  addWeeklyFixturesBatch: (fixturesData: Array<Omit<Fixture, 'id' | 'matchEvents'>>) => Fixture[];
  updateFixture: (fixture: Fixture) => void;
  deleteFixture: (id: string) => void;
  recordMatchResult: (
    fixtureId: string,
    mgfcScore: number,
    oppScore: number,
    events: any[],
    motm?: string,
    coachNotes?: string,
    matchReport?: string
  ) => void;
  recordMatchResultsBatch: (
    results: Array<{
      fixtureId: string;
      mgfcScore: number;
      oppScore: number;
      coachNotes?: string;
      matchReport?: string;
    }>
  ) => string[];
  markFixturePosterGenerated: (
    fixtureIds: string[],
    kind: 'fixture' | 'result',
    postRecord: Omit<SocialMediaPost, 'id' | 'createdAt'>
  ) => SocialMediaPost;
  deleteSocialPost: (id: string) => void;

  addTransaction: (tx: Omit<FinanceTransaction, 'id' | 'referenceNumber'>) => void;
  recordPlayerFeePayment: (
    playerId: string,
    amount: number,
    method: 'EFT / Bank' | 'SnapScan / QR' | 'Cash' | 'Card',
    notes?: string
  ) => void;

  // Team Fee Sheets Management (U6 - U13)
  updateTeamFeePlayer: (sheetId: string, player: TeamFeePlayerRow) => void;
  addTeamFeePlayer: (sheetId: string, player: Omit<TeamFeePlayerRow, 'id' | 'totalPaid' | 'balanceDue'>) => void;
  deleteTeamFeePlayer: (sheetId: string, playerId: string) => void;
  recordMonthPayment: (
    sheetId: string,
    playerId: string,
    monthKey: FeeMonthKey,
    payment: MonthInstallment | null
  ) => void;
  updateTeamSheetInfo: (sheetId: string, coach: string, assistantCoach: string, standardFee: number) => void;

  addMeeting: (meeting: Omit<GovernanceMeeting, 'id'>) => void;
  updateMeeting: (meeting: GovernanceMeeting) => void;
  toggleActionItemStatus: (meetingId: string, actionId: string) => void;

  addDocument: (doc: Omit<ClubDocument, 'id'>) => void;
  deleteDocument: (id: string) => void;

  updateTactics: (newTactics: TacticalSetup) => void;
  submitTrialApplication: (app: Omit<PublicTrialApplication, 'id' | 'applicationDate' | 'status'>) => void;
  updateTrialStatus: (id: string, status: PublicTrialApplication['status']) => void;
  clearSeasonRegistrations: (onlyProcessed?: boolean) => void;

  // Annual Season Archive, Rollover & Age-Group Promotion
  archiveSeasonAndStartFresh: (options: ArchiveRolloverOptions) => SeasonArchive;
  promoteSquadPlayers: (options: PromoteSquadOptions) => { movedCount: number };
  promoteSinglePlayer: (playerId: string, targetSquadId: string, resetFeesForNewSeason?: boolean) => void;
  restoreSeasonArchive: (archiveId: string) => void;
  deleteSeasonArchive: (archiveId: string) => void;

  // Persistence
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  resetToDefaultData: () => void;
}

const STORAGE_KEY = 'mgfc_platform_data_v1';

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [activeView, setActiveView] = useState<string>('public');
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Core Data States
  const [squads, setSquads] = useState<Squad[]>(INITIAL_SQUADS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [fixtures, setFixtures] = useState<Fixture[]>(INITIAL_FIXTURES);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(INITIAL_TRANSACTIONS);
  const [meetings, setMeetings] = useState<GovernanceMeeting[]>(INITIAL_MEETINGS);
  const [documents, setDocuments] = useState<ClubDocument[]>(INITIAL_DOCUMENTS);
  const [news, setNews] = useState<ClubNewsItem[]>(INITIAL_NEWS);
  const [tactics, setTactics] = useState<TacticalSetup>(DEFAULT_TACTICAL_SETUP);
  const [trialApplications, setTrialApplications] = useState<PublicTrialApplication[]>(INITIAL_TRIAL_APPLICATIONS);
  const [teamFeeSheets, setTeamFeeSheets] = useState<TeamFeeSheet[]>(INITIAL_TEAM_FEE_SHEETS);
  const [registrationOpen, setRegistrationOpenState] = useState<boolean>(true);
  const [registrationSeasonLabel, setRegistrationSeasonLabelState] = useState<string>('2027 Season');
  const [currentSeasonYear, setCurrentSeasonYearState] = useState<number>(2026);
  const [seasonArchives, setSeasonArchives] = useState<SeasonArchive[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>([]);
  const [socialStudioIntent, setSocialStudioIntent] = useState<SocialStudioIntent | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.meetings) setMeetings(parsed.meetings);
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.news) setNews(parsed.news);
        if (parsed.trialApplications) setTrialApplications(parsed.trialApplications);
        if (typeof parsed.registrationOpen === 'boolean') {
          setRegistrationOpenState(parsed.registrationOpen);
        }
        if (typeof parsed.registrationSeasonLabel === 'string' && parsed.registrationSeasonLabel.trim()) {
          setRegistrationSeasonLabelState(parsed.registrationSeasonLabel);
        }
        if (typeof parsed.currentSeasonYear === 'number' && parsed.currentSeasonYear >= 2020) {
          setCurrentSeasonYearState(parsed.currentSeasonYear);
        }
        if (Array.isArray(parsed.seasonArchives)) {
          setSeasonArchives(parsed.seasonArchives);
        }
        if (Array.isArray(parsed.socialPosts)) {
          setSocialPosts(parsed.socialPosts);
        }

        // Migrate older seed versions cleanly so uploaded fee sheets & aligned squads take effect
        if (parsed.dataVersion && parsed.dataVersion >= DATA_SEED_VERSION) {
          if (parsed.squads) setSquads(parsed.squads);
          if (parsed.players) setPlayers(parsed.players);
          if (parsed.fixtures) setFixtures(parsed.fixtures);
          if (parsed.tactics) setTactics(parsed.tactics);
          if (parsed.teamFeeSheets) {
            const savedSheets: TeamFeeSheet[] = parsed.teamFeeSheets;
            const missingDefaultSheets = INITIAL_TEAM_FEE_SHEETS.filter(
              defSheet => !savedSheets.some(s => s.id === defSheet.id)
            );
            setTeamFeeSheets(
              missingDefaultSheets.length > 0
                ? [...savedSheets, ...missingDefaultSheets]
                : savedSheets
            );
          }
        } else {
          // Persist migrated v2 aligned squads, players, fee sheets, fixtures & tactics
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              ...parsed,
              dataVersion: DATA_SEED_VERSION,
              squads: INITIAL_SQUADS,
              players: INITIAL_PLAYERS,
              teamFeeSheets: INITIAL_TEAM_FEE_SHEETS,
              fixtures: INITIAL_FIXTURES,
              tactics: DEFAULT_TACTICAL_SETUP,
            })
          );
        }
      }
    } catch (e) {
      console.error('Failed to load local MGFC data:', e);
    }
  }, []);

  // Save to localStorage whenever data changes
  const persistState = (newData: any) => {
    try {
      const payload = {
        dataVersion: DATA_SEED_VERSION,
        teamFeeSheets,
        registrationOpen,
        registrationSeasonLabel,
        currentSeasonYear,
        seasonArchives,
        socialPosts,
        ...newData,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const setRegistrationOpen = (open: boolean) => {
    setRegistrationOpenState(open);
    persistState({
      squads,
      players,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets,
      registrationOpen: open,
      registrationSeasonLabel,
    });
    showToast(
      open
        ? `Seasonal player registration (${registrationSeasonLabel}) is now OPEN on the public platform.`
        : 'Seasonal player registration is now CLOSED. All public register links and buttons have been removed.',
      open ? 'success' : 'info'
    );
  };

  const setRegistrationSeasonLabel = (label: string) => {
    const clean = label.trim() || '2027 Season';
    setRegistrationSeasonLabelState(clean);
    persistState({
      squads,
      players,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets,
      registrationOpen,
      registrationSeasonLabel: clean,
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Helpers to keep squad players and fee sheets aligned
  const deriveFeeStatus = (amountDue: number, totalPaid: number, balanceDue: number): Player['feeStatus'] => {
    if (amountDue === 0) return 'Exempt / Bursary';
    if (balanceDue <= 0) return 'Paid';
    if (totalPaid > 0) return 'Partial';
    return 'Overdue';
  };

  const syncFeeRowToPlayers = (
    currentPlayers: Player[],
    sheetId: string,
    row: TeamFeePlayerRow
  ): Player[] => {
    if (row.isDonationRow) return currentPlayers;
    const feeStatus = deriveFeeStatus(row.amountDue, row.totalPaid, row.balanceDue);
    const exists = currentPlayers.some(p => p.id === row.id);
    if (exists) {
      return currentPlayers.map(p =>
        p.id === row.id
          ? {
              ...p,
              firstName: row.name,
              lastName: row.surname || '—',
              squadId: sheetId,
              jerseyNumber: row.no,
              safaNumber: row.cardNumber || 'Pending Card',
              status: row.isInactive ? 'Inactive' : p.status === 'Inactive' ? 'Active' : p.status,
              feeDue: row.amountDue,
              feePaid: row.totalPaid,
              feeStatus,
              medicalNotes: row.remarks || p.medicalNotes,
            }
          : p
      );
    }
    const newPlayer: Player = {
      id: row.id,
      firstName: row.name,
      lastName: row.surname || '—',
      squadId: sheetId,
      position: 'MF',
      jerseyNumber: row.no,
      dob: '2016-01-01',
      idNumber: '',
      safaNumber: row.cardNumber || 'Pending Card',
      status: row.isInactive ? 'Inactive' : 'Active',
      phone: '',
      email: `${row.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@mgfc.co.za`,
      parentGuardian: row.surname ? `Parent (${row.surname})` : 'Parent / Guardian',
      parentPhone: '',
      medicalNotes: row.remarks || '',
      feeDue: row.amountDue,
      feePaid: row.totalPaid,
      feeStatus,
      appearances: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      attendanceRate: 100,
      dateJoined: new Date().toISOString().split('T')[0],
    };
    return [...currentPlayers, newPlayer];
  };

  // Player Management (synced to Team Fee Sheets)
  const addPlayer = (newPlayerData: Omit<Player, 'id'>) => {
    const idPrefix = newPlayerData.squadId || 'ply';
    const newPlayer: Player = {
      ...newPlayerData,
      id: `${idPrefix}-${Date.now().toString().slice(-4)}`,
    };
    const updatedPlayers = [newPlayer, ...players];

    const updatedSheets = teamFeeSheets.map(sheet => {
      if (sheet.id !== newPlayer.squadId) return sheet;
      const newRow = computeFeeRow({
        id: newPlayer.id,
        no: sheet.players.filter(r => !r.isDonationRow).length + 1,
        name: newPlayer.firstName,
        surname: newPlayer.lastName === '—' ? '' : newPlayer.lastName,
        cardNumber: newPlayer.safaNumber === 'Pending Card' ? '' : newPlayer.safaNumber,
        amountDue: newPlayer.feeDue,
        augSep: newPlayer.feePaid > 0 ? { amount: newPlayer.feePaid, method: 'EFT' } : null,
        remarks: newPlayer.feeStatus === 'Exempt / Bursary' ? 'Exempt / Bursary' : '',
        isInactive: newPlayer.status === 'Inactive',
      });
      return {
        ...sheet,
        players: [...sheet.players, newRow],
      };
    });

    setPlayers(updatedPlayers);
    setTeamFeeSheets(updatedSheets);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast(`Player ${newPlayer.firstName} ${newPlayer.lastName} registered successfully.`);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    const updatedPlayers = players.map(p => (p.id === updatedPlayer.id ? updatedPlayer : p));
    let existingRow: TeamFeePlayerRow | null = null;
    teamFeeSheets.forEach(s => {
      const found = s.players.find(r => r.id === updatedPlayer.id);
      if (found) existingRow = found;
    });

    const updatedSheets = teamFeeSheets.map(sheet => {
      const hasRow = sheet.players.some(r => r.id === updatedPlayer.id);
      if (sheet.id === updatedPlayer.squadId) {
        if (hasRow) {
          return {
            ...sheet,
            players: sheet.players.map(r =>
              r.id === updatedPlayer.id
                ? computeFeeRow({
                    ...r,
                    no: updatedPlayer.jerseyNumber || r.no,
                    name: updatedPlayer.firstName,
                    surname: updatedPlayer.lastName === '—' ? '' : updatedPlayer.lastName,
                    cardNumber: updatedPlayer.safaNumber === 'Pending Card' ? '' : updatedPlayer.safaNumber,
                    amountDue: updatedPlayer.feeDue,
                    isInactive: updatedPlayer.status === 'Inactive',
                  })
                : r
            ),
          };
        }
        // Moved from another squad or newly linked
        const movedRow = computeFeeRow({
          ...(existingRow || {
            id: updatedPlayer.id,
            no: sheet.players.filter(r => !r.isDonationRow).length + 1,
            name: updatedPlayer.firstName,
            surname: updatedPlayer.lastName === '—' ? '' : updatedPlayer.lastName,
            cardNumber: updatedPlayer.safaNumber === 'Pending Card' ? '' : updatedPlayer.safaNumber,
            amountDue: updatedPlayer.feeDue,
            remarks: '',
          }),
          id: updatedPlayer.id,
          no: sheet.players.filter(r => !r.isDonationRow).length + 1,
          name: updatedPlayer.firstName,
          surname: updatedPlayer.lastName === '—' ? '' : updatedPlayer.lastName,
          cardNumber: updatedPlayer.safaNumber === 'Pending Card' ? '' : updatedPlayer.safaNumber,
          amountDue: updatedPlayer.feeDue,
          isInactive: updatedPlayer.status === 'Inactive',
        });
        return {
          ...sheet,
          players: [...sheet.players, movedRow],
        };
      }
      if (hasRow) {
        return {
          ...sheet,
          players: sheet.players.filter(r => r.id !== updatedPlayer.id),
        };
      }
      return sheet;
    });

    setPlayers(updatedPlayers);
    setTeamFeeSheets(updatedSheets);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast(`Player ${updatedPlayer.firstName} ${updatedPlayer.lastName} updated.`);
  };

  const deletePlayer = (id: string) => {
    const p = players.find(x => x.id === id);
    const updatedPlayers = players.filter(x => x.id !== id);
    const updatedSheets = teamFeeSheets.map(sheet => ({
      ...sheet,
      players: sheet.players.filter(r => r.id !== id),
    }));
    setPlayers(updatedPlayers);
    setTeamFeeSheets(updatedSheets);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast(`Player ${p ? p.firstName + ' ' + p.lastName : id} removed from registry.`, 'info');
  };

  // Fixtures & Match Management
  const openSocialStudioForFixture = (options: {
    fixtureId?: string;
    fixtureIds?: string[];
    template?: SocialPosterTemplate;
    openSection?: 'intake' | 'poster' | 'archive';
  }) => {
    setSocialStudioIntent({
      ...options,
      timestamp: Date.now(),
    });
    setActiveView('social');
  };

  const clearSocialStudioIntent = () => {
    setSocialStudioIntent(null);
  };

  const addFixture = (fixtureData: Omit<Fixture, 'id' | 'matchEvents'>) => {
    const newFixture: Fixture = {
      ...fixtureData,
      id: `fix-${Date.now().toString().slice(-4)}`,
      matchEvents: [],
    };
    const updated = [newFixture, ...fixtures];
    setFixtures(updated);
    persistState({ squads, players, fixtures: updated, transactions, meetings, documents, news, tactics, trialApplications });
    showToast(`Fixture against ${newFixture.opponent} scheduled.`);
  };

  const addWeeklyFixturesBatch = (fixturesData: Array<Omit<Fixture, 'id' | 'matchEvents'>>): Fixture[] => {
    if (fixturesData.length === 0) return [];
    const baseTs = Date.now();
    const created: Fixture[] = fixturesData.map((item, idx) => ({
      ...item,
      id: `fix-${baseTs.toString().slice(-5)}-${idx + 1}`,
      confirmedOnSocial: true,
      matchEvents: [],
    }));
    const updated = [...created, ...fixtures];
    setFixtures(updated);
    persistState({ squads, players, fixtures: updated, transactions, meetings, documents, news, tactics, trialApplications });
    showToast(
      `Confirmed & stored ${created.length} weekly fixture${created.length === 1 ? '' : 's'} into the Fixtures & Results portal.`
    );
    return created;
  };

  const markFixturePosterGenerated = (
    fixtureIds: string[],
    kind: 'fixture' | 'result',
    postRecord: Omit<SocialMediaPost, 'id' | 'createdAt'>
  ): SocialMediaPost => {
    const nowIso = new Date().toISOString();
    const updatedFixtures =
      fixtureIds.length > 0
        ? fixtures.map(f => {
            if (!fixtureIds.includes(f.id)) return f;
            return kind === 'fixture'
              ? { ...f, confirmedOnSocial: true, fixturePosterGeneratedAt: nowIso }
              : { ...f, resultPosterGeneratedAt: nowIso };
          })
        : fixtures;

    const newPost: SocialMediaPost = {
      ...postRecord,
      id: `post-${Date.now().toString().slice(-6)}`,
      createdAt: nowIso,
    };
    const updatedPosts = [newPost, ...socialPosts];
    setFixtures(updatedFixtures);
    setSocialPosts(updatedPosts);
    persistState({
      squads,
      players,
      fixtures: updatedFixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      socialPosts: updatedPosts,
    });
    return newPost;
  };

  const deleteSocialPost = (id: string) => {
    const updatedPosts = socialPosts.filter(p => p.id !== id);
    setSocialPosts(updatedPosts);
    persistState({
      squads,
      players,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      socialPosts: updatedPosts,
    });
    showToast('Removed post from Social Media Archive.', 'info');
  };

  const updateFixture = (updatedFixture: Fixture) => {
    const updated = fixtures.map(f => (f.id === updatedFixture.id ? updatedFixture : f));
    setFixtures(updated);
    persistState({ squads, players, fixtures: updated, transactions, meetings, documents, news, tactics, trialApplications });
    showToast(`Fixture against ${updatedFixture.opponent} updated.`);
  };

  const deleteFixture = (id: string) => {
    const updated = fixtures.filter(f => f.id !== id);
    setFixtures(updated);
    persistState({ squads, players, fixtures: updated, transactions, meetings, documents, news, tactics, trialApplications });
    showToast('Fixture deleted.', 'info');
  };

  const recordMatchResultsBatch = (
    results: Array<{
      fixtureId: string;
      mgfcScore: number;
      oppScore: number;
      events?: any[];
      motm?: string;
      coachNotes?: string;
      matchReport?: string;
    }>
  ): string[] => {
    if (results.length === 0) return [];
    const inputMap = new Map(results.map(r => [r.fixtureId, r]));

    type StatDelta = {
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
      newAppearances: number;
    };
    const deltaBySquad = new Map<string, StatDelta>();
    const ensureDelta = (sqId: string): StatDelta => {
      let existing = deltaBySquad.get(sqId);
      if (!existing) {
        existing = {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          newAppearances: 0,
        };
        deltaBySquad.set(sqId, existing);
      }
      return existing;
    };

    const savedIds: string[] = [];
    const updatedFixtures = fixtures.map(f => {
      const entry = inputMap.get(f.id);
      if (!entry) return f;

      savedIds.push(f.id);
      const delta = ensureDelta(f.squadId);

      // Reverse prior standings impact when updating an already-completed fixture
      if (f.status === 'Completed') {
        const prevMgfc = f.mgfcScore ?? 0;
        const prevOpp = f.opponentScore ?? 0;
        delta.played -= 1;
        delta.won -= prevMgfc > prevOpp ? 1 : 0;
        delta.drawn -= prevMgfc === prevOpp ? 1 : 0;
        delta.lost -= prevMgfc < prevOpp ? 1 : 0;
        delta.goalsFor -= prevMgfc;
        delta.goalsAgainst -= prevOpp;
        delta.points -= prevMgfc > prevOpp ? 3 : prevMgfc === prevOpp ? 1 : 0;
      } else {
        delta.newAppearances += 1;
      }

      const isWin = entry.mgfcScore > entry.oppScore;
      const isDraw = entry.mgfcScore === entry.oppScore;
      const isLoss = entry.mgfcScore < entry.oppScore;

      delta.played += 1;
      delta.won += isWin ? 1 : 0;
      delta.drawn += isDraw ? 1 : 0;
      delta.lost += isLoss ? 1 : 0;
      delta.goalsFor += entry.mgfcScore;
      delta.goalsAgainst += entry.oppScore;
      delta.points += isWin ? 3 : isDraw ? 1 : 0;

      return {
        ...f,
        status: 'Completed' as const,
        mgfcScore: entry.mgfcScore,
        opponentScore: entry.oppScore,
        matchEvents: entry.events ?? f.matchEvents,
        playerOfTheMatch: entry.motm !== undefined ? entry.motm : f.playerOfTheMatch,
        coachNotes: entry.coachNotes !== undefined ? entry.coachNotes : f.coachNotes,
        matchReport: entry.matchReport !== undefined ? entry.matchReport : f.matchReport,
      };
    });

    if (savedIds.length === 0) return [];

    const updatedSquads = squads.map(sq => {
      const d = deltaBySquad.get(sq.id);
      if (!d) return sq;
      return {
        ...sq,
        played: Math.max(0, sq.played + d.played),
        won: Math.max(0, sq.won + d.won),
        drawn: Math.max(0, sq.drawn + d.drawn),
        lost: Math.max(0, sq.lost + d.lost),
        goalsFor: Math.max(0, sq.goalsFor + d.goalsFor),
        goalsAgainst: Math.max(0, sq.goalsAgainst + d.goalsAgainst),
        points: Math.max(0, sq.points + d.points),
      };
    });

    const updatedPlayers = players.map(p => {
      const d = deltaBySquad.get(p.squadId);
      const entry = d && d.newAppearances > 0 ? results.find(r => fixtures.find(f => f.id === r.fixtureId)?.squadId === p.squadId) : undefined;
      if (!d || d.newAppearances <= 0) return p;
      const evs = entry?.events || [];
      const playerGoals = evs.filter((e: any) => e.type === 'Goal' && e.player === `${p.firstName} ${p.lastName}`).length;
      const playerYellows = evs.filter((e: any) => e.type === 'Yellow Card' && e.player === `${p.firstName} ${p.lastName}`).length;
      const playerReds = evs.filter((e: any) => e.type === 'Red Card' && e.player === `${p.firstName} ${p.lastName}`).length;

      return {
        ...p,
        appearances: p.appearances + d.newAppearances,
        goals: p.goals + playerGoals,
        yellowCards: p.yellowCards + playerYellows,
        redCards: p.redCards + playerReds,
      };
    });

    setFixtures(updatedFixtures);
    setSquads(updatedSquads);
    setPlayers(updatedPlayers);
    persistState({
      squads: updatedSquads,
      players: updatedPlayers,
      fixtures: updatedFixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
    });

    if (savedIds.length === 1) {
      const f = updatedFixtures.find(x => x.id === savedIds[0]);
      if (f) {
        showToast(`Result recorded: MGFC ${f.mgfcScore} - ${f.opponentScore} ${f.opponent}. League standings updated!`);
      }
    } else {
      showToast(`Saved ${savedIds.length} weekend match results & updated league standings!`);
    }

    return savedIds;
  };

  const recordMatchResult = (
    fixtureId: string,
    mgfcScore: number,
    oppScore: number,
    events: any[],
    motm?: string,
    coachNotes?: string,
    matchReport?: string
  ) => {
    recordMatchResultsBatch([
      {
        fixtureId,
        mgfcScore,
        oppScore,
        events,
        motm,
        coachNotes,
        matchReport,
      },
    ]);
  };

  // Finance Management
  const addTransaction = (txData: Omit<FinanceTransaction, 'id' | 'referenceNumber'>) => {
    const newTx: FinanceTransaction = {
      ...txData,
      id: `txn-${Date.now().toString().slice(-4)}`,
      referenceNumber: `MGFC-${txData.type.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    persistState({ squads, players, fixtures, transactions: updated, meetings, documents, news, tactics, trialApplications });
    showToast(`Transaction ${newTx.referenceNumber} recorded for R${newTx.amount.toLocaleString()}.`);
  };

  const recordPlayerFeePayment = (
    playerId: string,
    amount: number,
    method: 'EFT / Bank' | 'SnapScan / QR' | 'Cash' | 'Card',
    notes?: string
  ) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newPaid = player.feePaid + amount;
    const newStatus: Player['feeStatus'] =
      newPaid >= player.feeDue ? 'Paid' : newPaid > 0 ? 'Partial' : 'Overdue';

    const updatedPlayers = players.map(p =>
      p.id === playerId ? { ...p, feePaid: newPaid, feeStatus: newStatus } : p
    );

    const sheetMethod: 'EFT' | 'CASH' = method === 'Cash' ? 'CASH' : 'EFT';
    const updatedSheets = teamFeeSheets.map(sheet => {
      if (sheet.id !== player.squadId) return sheet;
      return {
        ...sheet,
        players: sheet.players.map(r => {
          if (r.id !== playerId) return r;
          const prevAugSep = r.augSep?.amount || 0;
          return computeFeeRow({
            ...r,
            augSep: { amount: prevAugSep + amount, method: sheetMethod },
          });
        }),
      };
    });

    const receiptNum = `MGFC-RCP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: FinanceTransaction = {
      id: `txn-${Date.now().toString().slice(-4)}`,
      type: 'income',
      category: 'Player Subscriptions',
      amount,
      date: new Date().toISOString().split('T')[0],
      description: `Player registration subscription payment for ${player.firstName} ${player.lastName}${notes ? ` - ${notes}` : ''}`,
      referenceNumber: `SUB-PAY-${Date.now().toString().slice(-4)}`,
      payerOrPayee: `${player.firstName} ${player.lastName}`,
      paymentMethod: method,
      recordedBy: 'Haroon Wadee (Treasurer)',
      playerId: player.id,
      receiptNumber: receiptNum,
    };

    const updatedTransactions = [newTx, ...transactions];

    setPlayers(updatedPlayers);
    setTeamFeeSheets(updatedSheets);
    setTransactions(updatedTransactions);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions: updatedTransactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast(`Payment of R${amount.toLocaleString()} recorded for ${player.firstName} ${player.lastName}. Receipt: ${receiptNum}`);
  };

  // Team Fee Sheet Calculations & Management (U6 - U13)
  const computeFeeRow = (
    row: Omit<TeamFeePlayerRow, 'totalPaid' | 'balanceDue'>
  ): TeamFeePlayerRow => {
    const months = [row.apr, row.may, row.june, row.july, row.augSep, row.sept, row.oct];
    const totalPaid = months.reduce(
      (sum, m) => sum + (m && typeof m.amount === 'number' ? m.amount : 0),
      0
    );
    const rawDue = row.amountDue || 0;
    const balanceDue = row.isDonationRow
      ? rawDue - totalPaid
      : row.isInactive
      ? 0
      : Math.max(0, rawDue - totalPaid);
    return {
      ...row,
      totalPaid,
      balanceDue,
    };
  };

  const updateTeamFeePlayer = (sheetId: string, updatedPlayer: TeamFeePlayerRow) => {
    const recalculated = computeFeeRow(updatedPlayer);
    const updatedSheets = teamFeeSheets.map(sheet => {
      if (sheet.id === sheetId) {
        return {
          ...sheet,
          players: sheet.players.map(p => (p.id === updatedPlayer.id ? recalculated : p)),
        };
      }
      return sheet;
    });
    const updatedPlayers = syncFeeRowToPlayers(players, sheetId, recalculated);
    setTeamFeeSheets(updatedSheets);
    setPlayers(updatedPlayers);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast(`Updated fee record for ${recalculated.name} ${recalculated.surname} (${sheetId.toUpperCase()}).`);
  };

  const addTeamFeePlayer = (
    sheetId: string,
    playerData: Omit<TeamFeePlayerRow, 'id' | 'totalPaid' | 'balanceDue'>
  ) => {
    const targetSheet = teamFeeSheets.find(s => s.id === sheetId);
    const nextNo =
      playerData.no && playerData.no > 0
        ? playerData.no
        : targetSheet
        ? targetSheet.players.filter(r => !r.isDonationRow).length + 1
        : 1;

    const newId = `${sheetId}-${Date.now().toString().slice(-4)}`;
    const fullRow = computeFeeRow({
      ...playerData,
      id: newId,
      no: nextNo,
    });

    const updatedSheets = teamFeeSheets.map(sheet => {
      if (sheet.id === sheetId) {
        return {
          ...sheet,
          players: [...sheet.players, fullRow],
        };
      }
      return sheet;
    });
    const updatedPlayers = syncFeeRowToPlayers(players, sheetId, fullRow);

    setTeamFeeSheets(updatedSheets);
    setPlayers(updatedPlayers);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast(`Added ${fullRow.name} ${fullRow.surname} to ${targetSheet?.ageGroup || sheetId} fee sheet and squad roster.`);
  };

  const deleteTeamFeePlayer = (sheetId: string, playerId: string) => {
    const updatedSheets = teamFeeSheets.map(sheet => {
      if (sheet.id === sheetId) {
        return {
          ...sheet,
          players: sheet.players.filter(p => p.id !== playerId),
        };
      }
      return sheet;
    });
    const updatedPlayers = players.filter(p => p.id !== playerId);
    setTeamFeeSheets(updatedSheets);
    setPlayers(updatedPlayers);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast('Player removed from fee register and squad roster.', 'info');
  };

  const recordMonthPayment = (
    sheetId: string,
    playerId: string,
    monthKey: FeeMonthKey,
    payment: MonthInstallment | null
  ) => {
    let playerName = '';
    let recalculatedRow: TeamFeePlayerRow | null = null;
    const updatedSheets = teamFeeSheets.map(sheet => {
      if (sheet.id === sheetId) {
        const updatedPlayers = sheet.players.map(p => {
          if (p.id === playerId) {
            playerName = `${p.name} ${p.surname}`.trim();
            const updatedRow = {
              ...p,
              [monthKey]: payment,
            };
            recalculatedRow = computeFeeRow(updatedRow);
            return recalculatedRow;
          }
          return p;
        });
        return {
          ...sheet,
          players: updatedPlayers,
        };
      }
      return sheet;
    });

    const updatedPlayers = recalculatedRow
      ? syncFeeRowToPlayers(players, sheetId, recalculatedRow)
      : players;

    setTeamFeeSheets(updatedSheets);
    setPlayers(updatedPlayers);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast(
      payment
        ? `Logged R${payment.amount} (${payment.method}) for ${playerName} in ${monthKey.toUpperCase()}.`
        : `Cleared ${monthKey.toUpperCase()} payment for ${playerName}.`
    );
  };

  const updateTeamSheetInfo = (
    sheetId: string,
    coach: string,
    assistantCoach: string,
    standardFee: number
  ) => {
    const updatedSheets = teamFeeSheets.map(sheet => {
      if (sheet.id === sheetId) {
        return {
          ...sheet,
          coach,
          assistantCoach,
          seasonStandardFee: standardFee,
        };
      }
      return sheet;
    });
    const updatedSquads = squads.map(sq =>
      sq.id === sheetId
        ? {
            ...sq,
            headCoach: coach,
            assistantCoach,
          }
        : sq
    );
    setTeamFeeSheets(updatedSheets);
    setSquads(updatedSquads);
    persistState({
      squads: updatedSquads,
      players,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast('Team coaching details and fee standards saved across Finance and Squads.');
  };

  // Governance & Meetings
  const addMeeting = (meetingData: Omit<GovernanceMeeting, 'id'>) => {
    const newMeeting: GovernanceMeeting = {
      ...meetingData,
      id: `mtg-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newMeeting, ...meetings];
    setMeetings(updated);
    persistState({ squads, players, fixtures, transactions, meetings: updated, documents, news, tactics, trialApplications });
    showToast(`Meeting "${newMeeting.title}" created.`);
  };

  const updateMeeting = (updatedMeeting: GovernanceMeeting) => {
    const updated = meetings.map(m => (m.id === updatedMeeting.id ? updatedMeeting : m));
    setMeetings(updated);
    persistState({ squads, players, fixtures, transactions, meetings: updated, documents, news, tactics, trialApplications });
    showToast('Meeting minutes and action items saved.');
  };

  const toggleActionItemStatus = (meetingId: string, actionId: string) => {
    const updated: GovernanceMeeting[] = meetings.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          actionItems: m.actionItems.map(item => {
            if (item.id === actionId) {
              const nextStatus: 'Pending' | 'In Progress' | 'Completed' =
                item.status === 'Completed'
                  ? 'Pending'
                  : item.status === 'Pending'
                  ? 'In Progress'
                  : 'Completed';
              return { ...item, status: nextStatus };
            }
            return item;
          }),
        };
      }
      return m;
    });
    setMeetings(updated);
    persistState({ squads, players, fixtures, transactions, meetings: updated, documents, news, tactics, trialApplications });
    showToast('Governance action item status updated.');
  };

  // Documents
  const addDocument = (docData: Omit<ClubDocument, 'id'>) => {
    const newDoc: ClubDocument = {
      ...docData,
      id: `doc-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    persistState({ squads, players, fixtures, transactions, meetings, documents: updated, news, tactics, trialApplications });
    showToast(`Document "${newDoc.title}" uploaded to club registry.`);
  };

  const deleteDocument = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    persistState({ squads, players, fixtures, transactions, meetings, documents: updated, news, tactics, trialApplications });
    showToast('Document removed from repository.', 'info');
  };

  // Tactics
  const updateTactics = (newTactics: TacticalSetup) => {
    setTactics(newTactics);
    persistState({ squads, players, fixtures, transactions, meetings, documents, news, tactics: newTactics, trialApplications });
    showToast('Tactical board lineup and directives saved.');
  };

  // Trial Applications
  const submitTrialApplication = (appData: Omit<PublicTrialApplication, 'id' | 'applicationDate' | 'status'>) => {
    const newApp: PublicTrialApplication = {
      ...appData,
      id: `app-${Date.now().toString().slice(-4)}`,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Pending Review',
    };
    const updated = [newApp, ...trialApplications];
    setTrialApplications(updated);
    persistState({ squads, players, fixtures, transactions, meetings, documents, news, tactics, trialApplications: updated });
    showToast(`Trial application submitted for ${newApp.fullName}! The coaching office will contact you.`);
  };

  const updateTrialStatus = (id: string, status: PublicTrialApplication['status']) => {
    const updated = trialApplications.map(app => (app.id === id ? { ...app, status } : app));
    setTrialApplications(updated);
    persistState({ squads, players, fixtures, transactions, meetings, documents, news, tactics, trialApplications: updated });
    showToast(`Trial application status updated to: ${status}`);
  };

  const clearSeasonRegistrations = (onlyProcessed = false) => {
    const remaining = onlyProcessed
      ? trialApplications.filter(a => a.status === 'Pending Review' || a.status === 'Invited for Trial')
      : [];
    const removedCount = trialApplications.length - remaining.length;
    setTrialApplications(remaining);
    persistState({
      squads,
      players,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications: remaining,
    });
    showToast(
      onlyProcessed
        ? `Cleared ${removedCount} processed registration application(s).`
        : `Cleared all ${removedCount} registration application(s) for fresh seasonal intake.`,
      'info'
    );
  };

  // =========================================================================
  // ANNUAL SEASON ARCHIVE, FRESH YEAR ROLLOVER & AGE-GROUP PLAYER PROMOTION
  // =========================================================================
  const buildArchiveSnapshot = (
    year: number,
    archivedBy = 'Executive Committee',
    notes?: string,
    promotedCount?: number
  ): SeasonArchive => {
    let totalPlayersCount = 0;
    let activePlayersCount = 0;
    let totalBilled = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;

    teamFeeSheets.forEach(sheet => {
      sheet.players.forEach(row => {
        if (!row.isDonationRow) {
          totalPlayersCount += 1;
          if (!row.isInactive) activePlayersCount += 1;
        }
        const due = row.amountDue || 0;
        const paid = row.totalPaid || 0;
        const bal = row.isDonationRow
          ? due - paid
          : row.isInactive
          ? 0
          : Math.max(0, due - paid);
        totalBilled += due;
        totalCollected += paid;
        totalOutstanding += bal;
      });
    });

    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    return {
      id: `arch-${year}-${Date.now().toString(36)}`,
      seasonYear: year,
      seasonLabel: `${year} Season`,
      archivedAt: new Date().toISOString(),
      archivedBy,
      notes,
      promotedPlayersOnRollover: promotedCount,
      summary: {
        totalPlayers: Math.max(totalPlayersCount, players.length),
        activePlayers: activePlayersCount || players.filter(p => p.status !== 'Inactive').length,
        totalBilled,
        totalCollected,
        totalOutstanding,
        collectionRate,
        totalTransactions: transactions.length,
        completedFixtures: fixtures.filter(f => f.status === 'Completed').length,
        totalRegistrations: trialApplications.length,
      },
      snapshot: {
        squads: JSON.parse(JSON.stringify(squads)),
        players: JSON.parse(JSON.stringify(players)),
        teamFeeSheets: JSON.parse(JSON.stringify(teamFeeSheets)),
        fixtures: JSON.parse(JSON.stringify(fixtures)),
        transactions: JSON.parse(JSON.stringify(transactions)),
        trialApplications: JSON.parse(JSON.stringify(trialApplications)),
      },
    };
  };

  const resetRowForNewSeason = (
    row: TeamFeePlayerRow,
    newId: string,
    newNo: number,
    targetStandardFee: number,
    feeResetMode: 'keep_concessions' | 'standard_all'
  ): TeamFeePlayerRow => {
    const nextAmountDue =
      feeResetMode === 'standard_all'
        ? targetStandardFee
        : typeof row.amountDue === 'number'
        ? row.amountDue
        : targetStandardFee;

    return computeFeeRow({
      id: newId,
      no: newNo,
      name: row.name,
      surname: row.surname,
      cardNumber: row.cardNumber,
      amountDue: nextAmountDue,
      apr: null,
      may: null,
      june: null,
      july: null,
      augSep: null,
      sept: null,
      oct: null,
      remarks:
        feeResetMode === 'standard_all'
          ? ''
          : row.remarks && /no longer playing/i.test(row.remarks)
          ? ''
          : row.remarks || '',
      isInactive: row.isInactive,
      isDonationRow: false,
    });
  };

  const playerToFeeRow = (
    p: Player,
    newId: string,
    newNo: number,
    targetStandardFee: number,
    feeResetMode: 'keep_concessions' | 'standard_all',
    resetFees: boolean
  ): TeamFeePlayerRow => {
    const nextAmountDue =
      feeResetMode === 'standard_all' ? targetStandardFee : p.feeDue ?? targetStandardFee;

    if (resetFees) {
      return computeFeeRow({
        id: newId,
        no: newNo,
        name: p.firstName,
        surname: p.lastName === '—' ? '' : p.lastName,
        cardNumber: p.safaNumber === 'Pending Card' ? '' : p.safaNumber,
        amountDue: nextAmountDue,
        apr: null,
        may: null,
        june: null,
        july: null,
        augSep: null,
        sept: null,
        oct: null,
        remarks: p.feeStatus === 'Exempt / Bursary' ? 'Exempt / Bursary' : '',
        isInactive: p.status === 'Inactive',
      });
    }

    return computeFeeRow({
      id: newId,
      no: newNo,
      name: p.firstName,
      surname: p.lastName === '—' ? '' : p.lastName,
      cardNumber: p.safaNumber === 'Pending Card' ? '' : p.safaNumber,
      amountDue: nextAmountDue,
      augSep: p.feePaid > 0 ? { amount: p.feePaid, method: 'EFT' } : null,
      remarks: p.medicalNotes || '',
      isInactive: p.status === 'Inactive',
    });
  };

  const collectSourceUnit = (
    squadId: string,
    skipInactive: boolean,
    currentPlayersList: Player[],
    currentSheetsList: TeamFeeSheet[]
  ): { row: TeamFeePlayerRow; player?: Player }[] => {
    const sheet = currentSheetsList.find(s => s.id === squadId);
    const squadPlayers = currentPlayersList.filter(p => p.squadId === squadId);
    const usedPlayerIds = new Set<string>();
    const collected: { row: TeamFeePlayerRow; player?: Player }[] = [];

    if (sheet) {
      sheet.players.forEach(row => {
        if (row.isDonationRow) return;
        const matchedPlayer = squadPlayers.find(p => p.id === row.id);
        if (matchedPlayer) usedPlayerIds.add(matchedPlayer.id);
        const inactive = !!row.isInactive || matchedPlayer?.status === 'Inactive';
        if (skipInactive && inactive) return;
        collected.push({ row, player: matchedPlayer });
      });
    }

    squadPlayers.forEach(p => {
      if (usedPlayerIds.has(p.id)) return;
      if (skipInactive && p.status === 'Inactive') return;
      const syntheticRow = playerToFeeRow(p, p.id, collected.length + 1, sheet?.seasonStandardFee || 1800, 'keep_concessions', false);
      collected.push({ row: syntheticRow, player: p });
    });

    return collected;
  };

  const buildPromotedPlayer = (
    sourceRow: TeamFeePlayerRow,
    existingPlayer: Player | undefined,
    targetSquadId: string,
    newId: string,
    newNo: number,
    nextAmountDue: number,
    resetStatsAndFees: boolean
  ): Player => {
    const feePaid = resetStatsAndFees ? 0 : existingPlayer?.feePaid ?? sourceRow.totalPaid;
    const balance = Math.max(0, nextAmountDue - feePaid);
    return {
      id: newId,
      firstName: existingPlayer?.firstName || sourceRow.name,
      lastName: existingPlayer?.lastName || sourceRow.surname || '—',
      squadId: targetSquadId,
      position: existingPlayer?.position || 'MF',
      jerseyNumber: newNo,
      dob: existingPlayer?.dob || '2016-01-01',
      idNumber: existingPlayer?.idNumber || '',
      safaNumber: existingPlayer?.safaNumber || sourceRow.cardNumber || 'Pending Card',
      status: sourceRow.isInactive ? 'Inactive' : existingPlayer?.status === 'Inactive' ? 'Active' : existingPlayer?.status || 'Active',
      phone: existingPlayer?.phone || '',
      email: existingPlayer?.email || `${sourceRow.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@mgfc.co.za`,
      parentGuardian: existingPlayer?.parentGuardian || (sourceRow.surname ? `Parent (${sourceRow.surname})` : 'Parent / Guardian'),
      parentPhone: existingPlayer?.parentPhone || '',
      medicalNotes: existingPlayer?.medicalNotes || sourceRow.remarks || '',
      feeDue: nextAmountDue,
      feePaid,
      feeStatus: deriveFeeStatus(nextAmountDue, feePaid, balance),
      appearances: resetStatsAndFees ? 0 : existingPlayer?.appearances || 0,
      goals: resetStatsAndFees ? 0 : existingPlayer?.goals || 0,
      assists: resetStatsAndFees ? 0 : existingPlayer?.assists || 0,
      yellowCards: resetStatsAndFees ? 0 : existingPlayer?.yellowCards || 0,
      redCards: resetStatsAndFees ? 0 : existingPlayer?.redCards || 0,
      attendanceRate: resetStatsAndFees ? 100 : existingPlayer?.attendanceRate ?? 100,
      dateJoined: existingPlayer?.dateJoined || new Date().toISOString().split('T')[0],
    };
  };

  const promoteSquadPlayers = (options: PromoteSquadOptions): { movedCount: number } => {
    const {
      sourceSquadId,
      targetSquadId,
      mode,
      skipInactive,
      resetFeesForNewSeason,
      feeResetMode,
    } = options;

    if (sourceSquadId === targetSquadId) {
      showToast('Source and target squads must be different.', 'error');
      return { movedCount: 0 };
    }

    const sourceUnits = collectSourceUnit(sourceSquadId, skipInactive, players, teamFeeSheets);
    if (sourceUnits.length === 0) {
      showToast(`No eligible players found in ${sourceSquadId.toUpperCase()} to move.`, 'info');
      return { movedCount: 0 };
    }

    const movedIds = new Set(sourceUnits.map(u => u.row.id));
    const targetSheet = teamFeeSheets.find(s => s.id === targetSquadId);
    const targetStandardFee = targetSheet?.seasonStandardFee || 1800;

    // Handle graduation (removing U13 or leaving youth squads)
    if (targetSquadId === 'graduate') {
      const updatedSheets = teamFeeSheets.map(sheet =>
        sheet.id === sourceSquadId
          ? { ...sheet, players: sheet.players.filter(r => !movedIds.has(r.id) && !r.isDonationRow) }
          : sheet
      );
      const updatedPlayers = players.filter(p => !movedIds.has(p.id));
      const updatedTactics: TacticalSetup = {
        ...tactics,
        slots: tactics.slots.map(s => (s.playerId && movedIds.has(s.playerId) ? { ...s, playerId: undefined } : s)),
        benchPlayerIds: tactics.benchPlayerIds.filter(id => !movedIds.has(id)),
      };
      setTeamFeeSheets(updatedSheets);
      setPlayers(updatedPlayers);
      setTactics(updatedTactics);
      persistState({
        squads,
        players: updatedPlayers,
        fixtures,
        transactions,
        meetings,
        documents,
        news,
        tactics: updatedTactics,
        trialApplications,
        teamFeeSheets: updatedSheets,
      });
      showToast(`Graduated ${sourceUnits.length} player(s) from ${sourceSquadId.toUpperCase()} youth roster.`);
      return { movedCount: sourceUnits.length };
    }

    const existingTargetRows =
      mode === 'append' && targetSheet
        ? targetSheet.players.filter(r => !r.isDonationRow && !movedIds.has(r.id))
        : [];
    const existingTargetPlayers =
      mode === 'append'
        ? players.filter(p => p.squadId === targetSquadId && !movedIds.has(p.id))
        : [];

    const stamp = Date.now().toString(36).slice(-4);
    const newTargetRows: TeamFeePlayerRow[] = [];
    const newTargetPlayers: Player[] = [];

    sourceUnits.forEach((unit, idx) => {
      const nextNo = existingTargetRows.length + idx + 1;
      const newId = `${targetSquadId}-${stamp}-${nextNo}`;
      const row = resetFeesForNewSeason
        ? resetRowForNewSeason(unit.row, newId, nextNo, targetStandardFee, feeResetMode)
        : computeFeeRow({
            ...unit.row,
            id: newId,
            no: nextNo,
            amountDue: feeResetMode === 'standard_all' ? targetStandardFee : unit.row.amountDue,
          });
      newTargetRows.push(row);
      newTargetPlayers.push(
        buildPromotedPlayer(unit.row, unit.player, targetSquadId, newId, nextNo, row.amountDue, resetFeesForNewSeason)
      );
    });

    const updatedSheets = teamFeeSheets.map(sheet => {
      if (sheet.id === sourceSquadId) {
        return {
          ...sheet,
          players: sheet.players.filter(r => !movedIds.has(r.id) && !r.isDonationRow),
        };
      }
      if (sheet.id === targetSquadId) {
        return {
          ...sheet,
          players: [...existingTargetRows, ...newTargetRows],
        };
      }
      return sheet;
    });

    // Rebuild players array keeping non-source and non-replaced-target players, plus moved players
    const updatedPlayers = [
      ...players.filter(p => {
        if (movedIds.has(p.id)) return false;
        if (mode === 'replace' && p.squadId === targetSquadId) return false;
        return true;
      }),
      ...newTargetPlayers,
    ];
    // Preserve existingTargetPlayers when appending (already included above because !movedIds and mode !== 'replace')
    void existingTargetPlayers;

    const updatedTactics: TacticalSetup = {
      ...tactics,
      slots: tactics.slots.map(s => (s.playerId && movedIds.has(s.playerId) ? { ...s, playerId: undefined } : s)),
      benchPlayerIds: tactics.benchPlayerIds.filter(id => !movedIds.has(id)),
    };

    setTeamFeeSheets(updatedSheets);
    setPlayers(updatedPlayers);
    setTactics(updatedTactics);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics: updatedTactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });

    showToast(
      `Moved ${sourceUnits.length} player(s) from ${sourceSquadId.toUpperCase()} to ${targetSquadId.toUpperCase()}${
        resetFeesForNewSeason ? ' with fees reset for the new season' : ''
      }.`
    );
    return { movedCount: sourceUnits.length };
  };

  const promoteSinglePlayer = (playerId: string, targetSquadId: string, resetFeesForNewSeason = true) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const sourceSheet = teamFeeSheets.find(s => s.id === player.squadId);
    const targetSheet = teamFeeSheets.find(s => s.id === targetSquadId);
    const sourceRow = sourceSheet?.players.find(r => r.id === playerId);
    const targetStandardFee = targetSheet?.seasonStandardFee || 1800;
    const nextNo = (targetSheet?.players.filter(r => !r.isDonationRow).length || 0) + 1;
    const newId = `${targetSquadId}-${Date.now().toString(36).slice(-4)}-${nextNo}`;

    const baseRow =
      sourceRow ||
      playerToFeeRow(player, newId, nextNo, targetStandardFee, 'keep_concessions', resetFeesForNewSeason);

    const movedRow = resetFeesForNewSeason
      ? resetRowForNewSeason(baseRow, newId, nextNo, targetStandardFee, 'keep_concessions')
      : computeFeeRow({ ...baseRow, id: newId, no: nextNo });

    const movedPlayer = buildPromotedPlayer(
      baseRow,
      player,
      targetSquadId,
      newId,
      nextNo,
      movedRow.amountDue,
      resetFeesForNewSeason
    );

    const updatedSheets = teamFeeSheets.map(sheet => {
      if (sheet.id === player.squadId) {
        return { ...sheet, players: sheet.players.filter(r => r.id !== playerId) };
      }
      if (sheet.id === targetSquadId) {
        return { ...sheet, players: [...sheet.players, movedRow] };
      }
      return sheet;
    });

    const updatedPlayers = players.map(p => (p.id === playerId ? movedPlayer : p));
    setTeamFeeSheets(updatedSheets);
    setPlayers(updatedPlayers);
    persistState({
      squads,
      players: updatedPlayers,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets: updatedSheets,
    });
    showToast(`Moved ${player.firstName} ${player.lastName} from ${player.squadId.toUpperCase()} to ${targetSquadId.toUpperCase()}.`);
  };

  const archiveSeasonAndStartFresh = (options: ArchiveRolloverOptions): SeasonArchive => {
    const {
      newSeasonYear,
      newRegistrationLabel,
      rosterMode,
      u13Handling,
      skipInactive,
      feeResetMode,
      resetFixturesAndStandings,
      clearSeasonTransactions,
      clearRegistrations,
      archivedBy,
      notes,
    } = options;

    let promotedCount = 0;
    let nextTeamFeeSheets: TeamFeeSheet[] = [];
    let nextPlayers: Player[] = [];
    const stamp = Date.now().toString(36).slice(-4);

    if (rosterMode === 'promote_all') {
      // Build new sheets for each age group top-down so there are zero collisions
      const promotedMap: Record<string, { rows: TeamFeePlayerRow[]; players: Player[] }> = {};
      YOUTH_AGE_ORDER.forEach(id => {
        promotedMap[id] = { rows: [], players: [] };
      });

      YOUTH_AGE_ORDER.forEach(sourceId => {
        const nextId = NEXT_SQUAD_MAP[sourceId];
        const targetId = sourceId === 'u13' ? (u13Handling === 'keep' ? 'u13' : null) : nextId;
        if (!targetId) return;

        const targetSheet = teamFeeSheets.find(s => s.id === targetId);
        const targetStandardFee = targetSheet?.seasonStandardFee || 1800;
        const units = collectSourceUnit(sourceId, skipInactive, players, teamFeeSheets);

        units.forEach(unit => {
          const nextNo = promotedMap[targetId].rows.length + 1;
          const newPlayerId = `${targetId}-${newSeasonYear}-${stamp}-${nextNo}`;
          const row = resetRowForNewSeason(unit.row, newPlayerId, nextNo, targetStandardFee, feeResetMode);
          const ply = buildPromotedPlayer(unit.row, unit.player, targetId, newPlayerId, nextNo, row.amountDue, true);
          promotedMap[targetId].rows.push(row);
          promotedMap[targetId].players.push(ply);
          if (sourceId !== targetId) {
            promotedCount += 1;
          }
        });
      });

      nextTeamFeeSheets = teamFeeSheets.map(sheet => ({
        ...sheet,
        players: promotedMap[sheet.id]?.rows || [],
      }));
      nextPlayers = YOUTH_AGE_ORDER.flatMap(id => promotedMap[id].players);
    } else if (rosterMode === 'fresh_empty') {
      nextTeamFeeSheets = teamFeeSheets.map(sheet => ({
        ...sheet,
        players: [],
      }));
      nextPlayers = [];
    } else {
      // keep_current: preserve players in current squads, reset fee balances & match stats
      nextTeamFeeSheets = teamFeeSheets.map(sheet => {
        const eligibleRows = sheet.players.filter(r => !r.isDonationRow && (!skipInactive || !r.isInactive));
        return {
          ...sheet,
          players: eligibleRows.map((row, idx) =>
            resetRowForNewSeason(row, row.id, idx + 1, sheet.seasonStandardFee || 1800, feeResetMode)
          ),
        };
      });
      nextPlayers = players
        .filter(p => !skipInactive || p.status !== 'Inactive')
        .map(p => {
          const sheet = teamFeeSheets.find(s => s.id === p.squadId);
          const due = feeResetMode === 'standard_all' ? sheet?.seasonStandardFee || 1800 : p.feeDue;
          return {
            ...p,
            feeDue: due,
            feePaid: 0,
            feeStatus: deriveFeeStatus(due, 0, due),
            appearances: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            attendanceRate: 100,
          };
        });
    }

    // Create archive snapshot BEFORE overwriting active state
    const newArchive = buildArchiveSnapshot(
      currentSeasonYear,
      archivedBy || 'Executive Committee',
      notes,
      promotedCount
    );
    const updatedArchives = [newArchive, ...seasonArchives];

    const nextSquads = resetFixturesAndStandings
      ? squads.map((sq, idx) => ({
          ...sq,
          currentRank: idx + 1,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        }))
      : squads;

    const nextFixtures = resetFixturesAndStandings ? [] : fixtures;
    const nextTransactions = clearSeasonTransactions ? [] : transactions;
    const nextTrials = clearRegistrations ? [] : trialApplications;
    const nextTactics: TacticalSetup = {
      ...tactics,
      slots: tactics.slots.map(s => ({ ...s, playerId: undefined })),
      benchPlayerIds: [],
      captainId: undefined,
      penaltyTakerId: undefined,
      freeKickTakerId: undefined,
    };
    const cleanRegLabel = newRegistrationLabel.trim() || `${newSeasonYear} Season`;

    setSeasonArchives(updatedArchives);
    setCurrentSeasonYearState(newSeasonYear);
    setRegistrationSeasonLabelState(cleanRegLabel);
    setSquads(nextSquads);
    setPlayers(nextPlayers);
    setTeamFeeSheets(nextTeamFeeSheets);
    setFixtures(nextFixtures);
    setTransactions(nextTransactions);
    setTrialApplications(nextTrials);
    setTactics(nextTactics);

    persistState({
      currentSeasonYear: newSeasonYear,
      seasonArchives: updatedArchives,
      registrationSeasonLabel: cleanRegLabel,
      squads: nextSquads,
      players: nextPlayers,
      teamFeeSheets: nextTeamFeeSheets,
      fixtures: nextFixtures,
      transactions: nextTransactions,
      trialApplications: nextTrials,
      tactics: nextTactics,
    });

    showToast(
      `Archived ${newArchive.seasonLabel} and started fresh ${newSeasonYear} Season${
        promotedCount > 0 ? ` (${promotedCount} players moved up 1 age group)` : ''
      }.`
    );

    return newArchive;
  };

  const restoreSeasonArchive = (archiveId: string) => {
    const target = seasonArchives.find(a => a.id === archiveId);
    if (!target) return;

    const { snapshot, seasonYear } = target;
    setSquads(snapshot.squads);
    setPlayers(snapshot.players);
    setTeamFeeSheets(snapshot.teamFeeSheets);
    setFixtures(snapshot.fixtures);
    setTransactions(snapshot.transactions);
    setTrialApplications(snapshot.trialApplications);
    setCurrentSeasonYearState(seasonYear);
    setRegistrationSeasonLabelState(`${seasonYear + 1} Season`);

    persistState({
      currentSeasonYear: seasonYear,
      registrationSeasonLabel: `${seasonYear + 1} Season`,
      squads: snapshot.squads,
      players: snapshot.players,
      teamFeeSheets: snapshot.teamFeeSheets,
      fixtures: snapshot.fixtures,
      transactions: snapshot.transactions,
      trialApplications: snapshot.trialApplications,
    });

    showToast(`Restored ${target.seasonLabel} archive as the active club workspace.`, 'info');
  };

  const deleteSeasonArchive = (archiveId: string) => {
    const target = seasonArchives.find(a => a.id === archiveId);
    const updatedArchives = seasonArchives.filter(a => a.id !== archiveId);
    setSeasonArchives(updatedArchives);
    persistState({
      squads,
      players,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets,
      seasonArchives: updatedArchives,
    });
    showToast(`Removed ${target?.seasonLabel || 'archived season'} from archive vault.`, 'info');
  };

  // Data persistence backup and restore
  const exportDataJson = () => {
    const fullBackup = {
      clubName: 'Marlboro Gardens Football Club (MGFC)',
      exportDate: new Date().toISOString(),
      currentSeasonYear,
      seasonArchives,
      socialPosts,
      squads,
      players,
      fixtures,
      transactions,
      meetings,
      documents,
      news,
      tactics,
      trialApplications,
      teamFeeSheets,
      registrationOpen,
      registrationSeasonLabel,
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.players && parsed.squads) {
        if (parsed.squads) setSquads(parsed.squads);
        if (parsed.players) setPlayers(parsed.players);
        if (parsed.fixtures) setFixtures(parsed.fixtures);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.meetings) setMeetings(parsed.meetings);
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.news) setNews(parsed.news);
        if (parsed.tactics) setTactics(parsed.tactics);
        if (parsed.trialApplications) setTrialApplications(parsed.trialApplications);
        if (parsed.teamFeeSheets) setTeamFeeSheets(parsed.teamFeeSheets);
        if (typeof parsed.registrationOpen === 'boolean') setRegistrationOpenState(parsed.registrationOpen);
        if (typeof parsed.registrationSeasonLabel === 'string') setRegistrationSeasonLabelState(parsed.registrationSeasonLabel);
        if (typeof parsed.currentSeasonYear === 'number') setCurrentSeasonYearState(parsed.currentSeasonYear);
        if (Array.isArray(parsed.seasonArchives)) setSeasonArchives(parsed.seasonArchives);
        if (Array.isArray(parsed.socialPosts)) setSocialPosts(parsed.socialPosts);
        persistState(parsed);
        showToast('Club data successfully restored from backup file.');
        return true;
      }
      showToast('Invalid backup file structure.', 'error');
      return false;
    } catch (e: any) {
      showToast(`Import failed: ${e.message}`, 'error');
      return false;
    }
  };

  const resetToDefaultData = () => {
    setSquads(INITIAL_SQUADS);
    setPlayers(INITIAL_PLAYERS);
    setFixtures(INITIAL_FIXTURES);
    setTransactions(INITIAL_TRANSACTIONS);
    setMeetings(INITIAL_MEETINGS);
    setDocuments(INITIAL_DOCUMENTS);
    setNews(INITIAL_NEWS);
    setTactics(DEFAULT_TACTICAL_SETUP);
    setTrialApplications(INITIAL_TRIAL_APPLICATIONS);
    setTeamFeeSheets(INITIAL_TEAM_FEE_SHEETS);
    setRegistrationOpenState(true);
    setRegistrationSeasonLabelState('2027 Season');
    setCurrentSeasonYearState(2026);
    setSeasonArchives([]);
    setSocialPosts([]);
    persistState({
      squads: INITIAL_SQUADS,
      players: INITIAL_PLAYERS,
      fixtures: INITIAL_FIXTURES,
      transactions: INITIAL_TRANSACTIONS,
      meetings: INITIAL_MEETINGS,
      documents: INITIAL_DOCUMENTS,
      news: INITIAL_NEWS,
      tactics: DEFAULT_TACTICAL_SETUP,
      trialApplications: INITIAL_TRIAL_APPLICATIONS,
      teamFeeSheets: INITIAL_TEAM_FEE_SHEETS,
      registrationOpen: true,
      registrationSeasonLabel: '2027 Season',
      currentSeasonYear: 2026,
      seasonArchives: [],
      socialPosts: [],
    });
    showToast('Club operations database restored to default official state.');
  };

  return (
    <ClubContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        squads,
        players,
        fixtures,
        transactions,
        meetings,
        documents,
        news,
        tactics,
        trialApplications,
        teamFeeSheets,
        registrationOpen,
        setRegistrationOpen,
        registrationSeasonLabel,
        setRegistrationSeasonLabel,
        currentSeasonYear,
        seasonArchives,
        socialPosts,
        socialStudioIntent,
        openSocialStudioForFixture,
        clearSocialStudioIntent,
        toast,
        showToast,
        addPlayer,
        updatePlayer,
        deletePlayer,
        addFixture,
        addWeeklyFixturesBatch,
        updateFixture,
        deleteFixture,
        recordMatchResult,
        recordMatchResultsBatch,
        markFixturePosterGenerated,
        deleteSocialPost,
        addTransaction,
        recordPlayerFeePayment,
        updateTeamFeePlayer,
        addTeamFeePlayer,
        deleteTeamFeePlayer,
        recordMonthPayment,
        updateTeamSheetInfo,
        addMeeting,
        updateMeeting,
        toggleActionItemStatus,
        addDocument,
        deleteDocument,
        updateTactics,
        submitTrialApplication,
        updateTrialStatus,
        clearSeasonRegistrations,
        archiveSeasonAndStartFresh,
        promoteSquadPlayers,
        promoteSinglePlayer,
        restoreSeasonArchive,
        deleteSeasonArchive,
        exportDataJson,
        importDataJson,
        resetToDefaultData,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
