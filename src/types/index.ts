export type UserRole = 'executive' | 'coach' | 'finance' | 'secretary' | 'public';

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export type PlayerStatus = 'Active' | 'Injured' | 'Suspended' | 'Pending Trial' | 'Inactive';

export type FeeStatus = 'Paid' | 'Partial' | 'Overdue' | 'Exempt / Bursary';

export type MonthlyPaymentMethod = 'EFT' | 'CASH';

export interface MonthInstallment {
  amount: number;
  method: MonthlyPaymentMethod; // 'EFT' = blue fill/badge, 'CASH' = yellow fill/badge
  datePaid?: string;
  receiptNumber?: string;
}

export interface TeamFeePlayerRow {
  id: string;
  no: number;
  name: string;
  surname: string;
  cardNumber: string; // SAFA / Registration Card Number
  amountDue: number; // e.g. 1800.00 or 900.00
  apr?: MonthInstallment | null;
  may?: MonthInstallment | null;
  june?: MonthInstallment | null;
  july?: MonthInstallment | null;
  augSep?: MonthInstallment | null;
  sept?: MonthInstallment | null;
  oct?: MonthInstallment | null;
  totalPaid: number;
  balanceDue: number;
  remarks?: string;
  isInactive?: boolean; // For "No longer playing" strikethrough/red row
  isDonationRow?: boolean; // For team donation / sponsorship offset row
}

export interface TeamFeeSheet {
  id: string; // 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12', 'u13'
  ageGroup: string; // 'Under 6', 'Under 7', ... 'Under 13'
  coach: string;
  assistantCoach: string;
  seasonStandardFee: number; // 1800
  hasExtendedMonths?: boolean; // True when team tracks AUG, SEPT, OCT separately (e.g. U10)
  players: TeamFeePlayerRow[];
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  squadId: string;
  position: PlayerPosition;
  jerseyNumber: number;
  dob: string;
  idNumber: string;
  safaNumber: string;
  status: PlayerStatus;
  phone: string;
  email: string;
  parentGuardian?: string;
  parentPhone?: string;
  medicalNotes?: string;
  feeDue: number; // in ZAR
  feePaid: number; // in ZAR
  feeStatus: FeeStatus;
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  attendanceRate: number; // 0 - 100%
  dateJoined: string;
}

export interface Squad {
  id: string;
  name: string;
  division: string;
  headCoach: string;
  coachPhone: string;
  assistantCoach?: string;
  trainingSchedule: string;
  homePitch: string;
  currentRank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface PitchPositionSlot {
  slotId: string;
  name: string;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  defaultRole: string;
  playerId?: string;
}

export interface TacticalSetup {
  squadId: string;
  formation: '4-3-3' | '4-2-3-1' | '4-4-2' | '3-5-2' | '5-3-2';
  slots: PitchPositionSlot[];
  benchPlayerIds: string[];
  captainId?: string;
  penaltyTakerId?: string;
  freeKickTakerId?: string;
  tacticalNotes: string;
}

export type FixtureStatus = 'Scheduled' | 'Live' | 'Completed' | 'Postponed';

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'Goal' | 'Yellow Card' | 'Red Card' | 'Substitution';
  player: string;
  detail?: string;
}

export interface Fixture {
  id: string;
  squadId: string;
  competition: string;
  isHome: boolean;
  opponent: string;
  venue: string;
  pitch: string;
  date: string;
  kickoffTime: string;
  status: FixtureStatus;
  mgfcScore?: number;
  opponentScore?: number;
  referee?: string;
  playerOfTheMatch?: string;
  matchEvents: MatchEvent[];
  coachNotes?: string;
  matchReport?: string;
  confirmedOnSocial?: boolean;
  weekLabel?: string;
  fixturePosterGeneratedAt?: string;
  resultPosterGeneratedAt?: string;
}

export type TransactionType = 'income' | 'expense';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number; // in ZAR
  date: string;
  description: string;
  referenceNumber: string;
  payerOrPayee: string;
  paymentMethod: 'EFT / Bank' | 'SnapScan / QR' | 'Cash' | 'Card';
  recordedBy: string;
  playerId?: string;
  receiptNumber?: string;
}

export interface GovernanceMeeting {
  id: string;
  title: string;
  type: 'Executive Committee' | 'Annual General Meeting (AGM)' | 'Coaches Council' | 'Disciplinary Committee' | 'Finance Audit';
  date: string;
  time: string;
  venue: string;
  status: 'Upcoming' | 'Completed';
  attendees: string[];
  agenda: string[];
  minutesSummary: string;
  actionItems: {
    id: string;
    task: string;
    assignee: string;
    dueDate: string;
    status: 'Pending' | 'In Progress' | 'Completed';
  }[];
}

export interface ClubDocument {
  id: string;
  title: string;
  category: 'Constitution & Bylaws' | 'SAFA Compliance' | 'Safeguarding' | 'Code of Conduct' | 'Financial Statements' | 'Sponsorships';
  lastUpdated: string;
  fileSize: string;
  fileFormat: string;
  description: string;
  tags: string[];
  downloadName: string;
}

export interface ClubNewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Match Report' | 'Club Announcement' | 'Youth Academy' | 'Community' | 'Transfers & Trials';
  date: string;
  author: string;
  readTime: string;
  featured?: boolean;
}

export type SocialPosterTemplate =
  | 'Weekly Fixtures Slate'
  | 'Matchday'
  | 'Full Time'
  | 'Weekend Results Slate';

export type SocialPosterTheme = 'navy-red' | 'white-clean' | 'slate-navy';

export interface SocialMediaPost {
  id: string;
  type: SocialPosterTemplate | 'Player of Match' | 'Announcement' | 'Birthday';
  title: string;
  subHeadline?: string;
  content: string;
  hashtags: string[];
  fixtureId?: string;
  fixtureIds?: string[];
  themeColor?: SocialPosterTheme;
  createdAt: string;
  status: 'Draft' | 'Scheduled' | 'Published';
  channel: 'Instagram' | 'Facebook' | 'X' | 'WhatsApp Broadcast';
}

export interface PublicTrialApplication {
  id: string;
  fullName: string;
  dob: string;
  preferredPosition: PlayerPosition;
  preferredSquad: string;
  parentName?: string;
  phone: string;
  email: string;
  previousClub?: string;
  suburb: string;
  applicationDate: string;
  status: 'Pending Review' | 'Invited for Trial' | 'Approved' | 'Declined';
  registrationType?: 'existing' | 'new';
  playerIdNumber?: string;
  parentIdNumber?: string;
  address?: string;
  safaCardNumber?: string;
  formDate?: string;
  indemnityAccepted?: boolean;
  obligationAccepted?: boolean;
  affordabilityConfirmed?: 'YES' | 'NO';
  parentSignature?: string;
  documentsChecklist?: {
    idOrBirthCertificate: boolean;
    passportPhotos: boolean;
    latestSchoolReport: boolean;
  };
}

export interface SeasonArchive {
  id: string;
  seasonYear: number;
  seasonLabel: string;
  archivedAt: string;
  archivedBy: string;
  notes?: string;
  promotedPlayersOnRollover?: number;
  summary: {
    totalPlayers: number;
    activePlayers: number;
    totalBilled: number;
    totalCollected: number;
    totalOutstanding: number;
    collectionRate: number;
    totalTransactions: number;
    completedFixtures: number;
    totalRegistrations: number;
  };
  snapshot: {
    squads: Squad[];
    players: Player[];
    teamFeeSheets: TeamFeeSheet[];
    fixtures: Fixture[];
    transactions: FinanceTransaction[];
    trialApplications: PublicTrialApplication[];
  };
}

export interface ArchiveRolloverOptions {
  newSeasonYear: number;
  newRegistrationLabel: string;
  rosterMode: 'promote_all' | 'fresh_empty' | 'keep_current';
  u13Handling: 'graduate' | 'keep';
  skipInactive: boolean;
  feeResetMode: 'keep_concessions' | 'standard_all';
  resetFixturesAndStandings: boolean;
  clearSeasonTransactions: boolean;
  clearRegistrations: boolean;
  archivedBy?: string;
  notes?: string;
}

export interface PromoteSquadOptions {
  sourceSquadId: string;
  targetSquadId: string; // 'u7'..'u13' or 'graduate'
  mode: 'append' | 'replace';
  skipInactive: boolean;
  resetFeesForNewSeason: boolean;
  feeResetMode: 'keep_concessions' | 'standard_all';
}

