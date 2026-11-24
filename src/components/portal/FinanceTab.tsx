import React, { useState, useMemo } from 'react';
import { useClub, NEXT_SQUAD_MAP } from '../../context/ClubContext';
import { CrestLogo } from '../common/CrestLogo';
import { DateInput } from '../common/DateInput';
import { SeasonManagerModal, SeasonManagerTab } from './SeasonManagerModal';
import { Player, FinanceTransaction, TeamFeePlayerRow } from '../../types';
import { formatDateMMDDYYYY } from '../../utils/dateFormat';
import {
  Plus,
  Search,
  Printer,
  AlertCircle,
  CreditCard,
  X,
  Receipt,
  Download,
  Users,
  Edit2,
  Trash2,
  Banknote,
  Building2,
  Layers,
  ArrowRight,
  Archive,
  History,
  ArrowUpRight,
} from 'lucide-react';

type MonthKey = 'apr' | 'may' | 'june' | 'july' | 'augSep' | 'sept' | 'oct';

const ALL_MONTH_KEYS: MonthKey[] = ['apr', 'may', 'june', 'july', 'augSep', 'sept', 'oct'];
const BASE_MONTH_KEYS: MonthKey[] = ['apr', 'may', 'june', 'july', 'augSep'];

const MONTH_LABELS: Record<MonthKey, string> = {
  apr: 'APR',
  may: 'MAY',
  june: 'JUNE',
  july: 'JULY',
  augSep: 'AUG / SEP',
  sept: 'SEPT',
  oct: 'OCT',
};

export const FinanceTab: React.FC = () => {
  const {
    players,
    squads,
    transactions,
    teamFeeSheets,
    currentSeasonYear,
    seasonArchives,
    addTransaction,
    recordPlayerFeePayment,
    updateTeamFeePlayer,
    addTeamFeePlayer,
    deleteTeamFeePlayer,
    recordMonthPayment,
    updateTeamSheetInfo,
  } = useClub();

  // Primary Tab: 'team-sheets' | 'players' | 'ledger'
  const [activeSubTab, setActiveSubTab] = useState<'team-sheets' | 'players' | 'ledger'>('team-sheets');

  // Team Sheet sub-selector: 'summary' or sheet ID e.g. 'u6', 'u7', ... 'u13'
  const [selectedSheetId, setSelectedSheetId] = useState<string>('summary');

  // Season Archive & Rollover controls
  const [viewingArchiveId, setViewingArchiveId] = useState<string>('active');
  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [seasonModalTab, setSeasonModalTab] = useState<SeasonManagerTab>('archive');
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
  const displaySeasonYear = activeArchive ? activeArchive.seasonYear : currentSeasonYear;
  const displayedSheets = activeArchive ? activeArchive.snapshot.teamFeeSheets : teamFeeSheets;
  const displayedPlayers = activeArchive ? activeArchive.snapshot.players : players;
  const displayedTransactions = activeArchive ? activeArchive.snapshot.transactions : transactions;
  const displayedSquads = activeArchive ? activeArchive.snapshot.squads : squads;

  // Filters
  const [sheetSearchQuery, setSheetSearchQuery] = useState('');
  const [sheetStatusFilter, setSheetStatusFilter] = useState<'all' | 'settled' | 'outstanding' | 'concession' | 'inactive'>('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('all');
  const [searchPlayerQuery, setSearchPlayerQuery] = useState('');
  const [mobileDisplayMode, setMobileDisplayMode] = useState<'cards' | 'table'>('table');

  // Modals
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<FinanceTransaction | null>(null);

  // Player Fee payment in general ledger modal
  const [payingPlayer, setPayingPlayer] = useState<Player | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<'EFT / Bank' | 'SnapScan / QR' | 'Cash' | 'Card'>('EFT / Bank');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Team Sheet Edit Player Modal
  const [editingPlayerSheetId, setEditingPlayerSheetId] = useState<string | null>(null);
  const [editingPlayerRow, setEditingPlayerRow] = useState<TeamFeePlayerRow | null>(null);
  const [isNewPlayerModal, setIsNewPlayerModal] = useState(false);

  // Team Sheet Quick Month Payment Modal
  const [monthPaymentModal, setMonthPaymentModal] = useState<{
    sheetId: string;
    player: TeamFeePlayerRow;
    monthKey: MonthKey;
    amount: number;
    method: 'EFT' | 'CASH';
    datePaid: string;
  } | null>(null);

  // Edit Team Coaching Info Modal
  const [editingSheetInfoId, setEditingSheetInfoId] = useState<string | null>(null);
  const [sheetInfoForm, setSheetInfoForm] = useState({
    coach: '',
    assistantCoach: '',
    standardFee: 1800,
  });

  // General Transaction Modal State
  const [newTx, setNewTx] = useState({
    type: 'income' as 'income' | 'expense',
    category: 'Sponsorship',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    description: '',
    payerOrPayee: '',
    paymentMethod: 'EFT / Bank' as any,
    recordedBy: 'Haroon Wadee (Treasurer)',
  });

  // Active Sheet Object
  const currentSheet = useMemo(() => {
    return displayedSheets.find(s => s.id === selectedSheetId);
  }, [displayedSheets, selectedSheetId]);

  const activeMonthKeys: MonthKey[] = useMemo(() => {
    return currentSheet?.hasExtendedMonths ? ALL_MONTH_KEYS : BASE_MONTH_KEYS;
  }, [currentSheet]);

  const getMonthLabel = (mKey: MonthKey, isExtended?: boolean) => {
    if (isExtended && mKey === 'augSep') return 'AUG';
    return MONTH_LABELS[mKey];
  };

  // Calculations for Team Fee Sheets: Summary Metrics across all teams
  const masterStats = useMemo(() => {
    let totalRegistered = 0;
    let totalActive = 0;
    let totalInactive = 0;
    let totalBilled = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    let totalEft = 0;
    let totalCash = 0;

    const monthTotals: Record<MonthKey, { eft: number; cash: number; total: number }> = {
      apr: { eft: 0, cash: 0, total: 0 },
      may: { eft: 0, cash: 0, total: 0 },
      june: { eft: 0, cash: 0, total: 0 },
      july: { eft: 0, cash: 0, total: 0 },
      augSep: { eft: 0, cash: 0, total: 0 },
      sept: { eft: 0, cash: 0, total: 0 },
      oct: { eft: 0, cash: 0, total: 0 },
    };

    const teamSummaries = displayedSheets.map(sheet => {
      let sheetBilled = 0;
      let sheetPaid = 0;
      let sheetBalance = 0;
      let sheetEft = 0;
      let sheetCash = 0;
      let sheetPlayersCount = 0;
      let sheetActiveCount = 0;
      let sheetInactiveCount = 0;

      const sheetMonthTotals: Record<MonthKey, { eft: number; cash: number; total: number }> = {
        apr: { eft: 0, cash: 0, total: 0 },
        may: { eft: 0, cash: 0, total: 0 },
        june: { eft: 0, cash: 0, total: 0 },
        july: { eft: 0, cash: 0, total: 0 },
        augSep: { eft: 0, cash: 0, total: 0 },
        sept: { eft: 0, cash: 0, total: 0 },
        oct: { eft: 0, cash: 0, total: 0 },
      };

      sheet.players.forEach(p => {
        if (!p.isDonationRow) {
          totalRegistered += 1;
          sheetPlayersCount += 1;
          if (p.isInactive) {
            totalInactive += 1;
            sheetInactiveCount += 1;
          } else {
            totalActive += 1;
            sheetActiveCount += 1;
          }
        }

        // Include billed amount for all rows (including inactive players who paid/owed partial fee)
        const due = p.amountDue || 0;
        sheetBilled += due;
        totalBilled += due;

        sheetPaid += p.totalPaid || 0;
        totalPaid += p.totalPaid || 0;

        const bal = p.isDonationRow
          ? due - (p.totalPaid || 0)
          : p.isInactive
          ? 0
          : Math.max(0, due - (p.totalPaid || 0));
        sheetBalance += bal;
        totalBalance += bal;

        ALL_MONTH_KEYS.forEach(mKey => {
          const installment = p[mKey];
          if (installment && installment.amount > 0) {
            if (installment.method === 'EFT') {
              sheetEft += installment.amount;
              totalEft += installment.amount;
              sheetMonthTotals[mKey].eft += installment.amount;
              monthTotals[mKey].eft += installment.amount;
            } else {
              sheetCash += installment.amount;
              totalCash += installment.amount;
              sheetMonthTotals[mKey].cash += installment.amount;
              monthTotals[mKey].cash += installment.amount;
            }
            sheetMonthTotals[mKey].total += installment.amount;
            monthTotals[mKey].total += installment.amount;
          }
        });
      });

      const collectionRate = sheetBilled > 0 ? Math.round((sheetPaid / sheetBilled) * 100) : 0;

      return {
        sheet,
        totalPlayers: sheetPlayersCount,
        activePlayers: sheetActiveCount,
        inactivePlayers: sheetInactiveCount,
        billed: sheetBilled,
        paid: sheetPaid,
        balance: sheetBalance,
        eft: sheetEft,
        cash: sheetCash,
        monthTotals: sheetMonthTotals,
        augToOctTotal:
          sheetMonthTotals.augSep.total + sheetMonthTotals.sept.total + sheetMonthTotals.oct.total,
        collectionRate,
      };
    });

    const overallCollectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
    const augToOctGrandTotal =
      monthTotals.augSep.total + monthTotals.sept.total + monthTotals.oct.total;

    return {
      totalRegistered,
      totalActive,
      totalInactive,
      totalBilled,
      totalPaid,
      totalBalance,
      totalEft,
      totalCash,
      monthTotals,
      augToOctGrandTotal,
      teamSummaries,
      overallCollectionRate,
    };
  }, [displayedSheets]);

  // Current Sheet Specific Totals
  const currentSheetStats = useMemo(() => {
    if (!currentSheet) return null;

    let billed = 0;
    let paid = 0;
    let balance = 0;
    let eft = 0;
    let cash = 0;
    let totalPlayers = 0;
    let activePlayers = 0;
    let inactivePlayers = 0;

    const monthTotals: Record<MonthKey, { eft: number; cash: number; total: number }> = {
      apr: { eft: 0, cash: 0, total: 0 },
      may: { eft: 0, cash: 0, total: 0 },
      june: { eft: 0, cash: 0, total: 0 },
      july: { eft: 0, cash: 0, total: 0 },
      augSep: { eft: 0, cash: 0, total: 0 },
      sept: { eft: 0, cash: 0, total: 0 },
      oct: { eft: 0, cash: 0, total: 0 },
    };

    currentSheet.players.forEach(p => {
      if (!p.isDonationRow) {
        totalPlayers += 1;
        if (p.isInactive) {
          inactivePlayers += 1;
        } else {
          activePlayers += 1;
        }
      }

      const due = p.amountDue || 0;
      billed += due;
      paid += p.totalPaid || 0;
      const bal = p.isDonationRow
        ? due - (p.totalPaid || 0)
        : p.isInactive
        ? 0
        : Math.max(0, due - (p.totalPaid || 0));
      balance += bal;

      ALL_MONTH_KEYS.forEach(mKey => {
        const inst = p[mKey];
        if (inst && inst.amount > 0) {
          if (inst.method === 'EFT') {
            eft += inst.amount;
            monthTotals[mKey].eft += inst.amount;
          } else {
            cash += inst.amount;
            monthTotals[mKey].cash += inst.amount;
          }
          monthTotals[mKey].total += inst.amount;
        }
      });
    });

    const collectionRate = billed > 0 ? Math.round((paid / billed) * 100) : 0;

    return {
      totalPlayers,
      activePlayers,
      inactivePlayers,
      billed,
      paid,
      balance,
      eft,
      cash,
      monthTotals,
      collectionRate,
    };
  }, [currentSheet]);

  // Filtered Players for current sheet
  const filteredSheetPlayers = useMemo(() => {
    if (!currentSheet) return [];
    return currentSheet.players.filter(player => {
      const q = sheetSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        player.name.toLowerCase().includes(q) ||
        player.surname.toLowerCase().includes(q) ||
        player.cardNumber.toLowerCase().includes(q) ||
        (player.remarks && player.remarks.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (sheetStatusFilter === 'all') return true;
      if (sheetStatusFilter === 'settled') {
        return !player.isInactive && !player.isDonationRow && player.balanceDue === 0 && player.totalPaid > 0;
      }
      if (sheetStatusFilter === 'outstanding') {
        return !player.isInactive && !player.isDonationRow && player.balanceDue > 0;
      }
      if (sheetStatusFilter === 'concession') {
        return (
          !player.isInactive &&
          !player.isDonationRow &&
          player.amountDue < (currentSheet.seasonStandardFee || 1800)
        );
      }
      if (sheetStatusFilter === 'inactive') return !!player.isInactive;

      return true;
    });
  }, [currentSheet, sheetSearchQuery, sheetStatusFilter]);

  // General Ledger Metrics
  const totalFeesDue = displayedPlayers.reduce((sum, p) => sum + p.feeDue, 0);
  const totalFeesCollected = displayedPlayers.reduce((sum, p) => sum + p.feePaid, 0);
  const totalOutstanding = totalFeesDue - totalFeesCollected;
  const collectionRate = totalFeesDue > 0 ? Math.round((totalFeesCollected / totalFeesDue) * 100) : 0;

  const totalInflow = displayedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = displayedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netReserve = totalInflow - totalOutflow;
  void totalOutstanding;
  void collectionRate;
  void netReserve;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingPlayer || paymentAmount <= 0 || isReadOnlyArchive) return;

    recordPlayerFeePayment(payingPlayer.id, paymentAmount, paymentMethod, paymentNotes);
    setPayingPlayer(null);
    setPaymentNotes('');
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || newTx.amount <= 0 || isReadOnlyArchive) return;

    addTransaction({
      type: newTx.type,
      category: newTx.category,
      amount: newTx.amount,
      date: newTx.date,
      description: newTx.description,
      payerOrPayee: newTx.payerOrPayee || 'MGFC Treasury',
      paymentMethod: newTx.paymentMethod,
      recordedBy: newTx.recordedBy,
    });
    setIsAddTxModalOpen(false);
    setNewTx({
      type: 'income',
      category: 'Sponsorship',
      amount: 5000,
      date: new Date().toISOString().split('T')[0],
      description: '',
      payerOrPayee: '',
      paymentMethod: 'EFT / Bank',
      recordedBy: 'Haroon Wadee (Treasurer)',
    });
  };

  // Filter players for General Player Subscriptions
  const filteredPlayers = displayedPlayers.filter(p => {
    const matchesStatus = feeStatusFilter === 'all' || p.feeStatus === feeStatusFilter;
    const query = searchPlayerQuery.toLowerCase();
    const matchesSearch =
      !query ||
      p.firstName.toLowerCase().includes(query) ||
      p.lastName.toLowerCase().includes(query) ||
      p.safaNumber.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // CSV Export for Team Sheet
  const exportSheetToCsv = (sheet: typeof currentSheet) => {
    if (!sheet) return;
    const keys: MonthKey[] = sheet.hasExtendedMonths ? ALL_MONTH_KEYS : BASE_MONTH_KEYS;
    const monthHeaders = keys.map(k => getMonthLabel(k, sheet.hasExtendedMonths).replace(' / ', '_'));
    const headers = [
      'NO',
      'NAME',
      'SURNAME',
      'CARD NUMBER',
      'AMOUNT DUE',
      ...monthHeaders,
      'TOTAL PAID',
      'BALANCE DUE',
      'REMARKS',
      'STATUS',
    ];
    const rows = sheet.players.map(p => [
      p.isDonationRow ? '' : p.no,
      `"${p.name}"`,
      `"${p.surname}"`,
      `"${p.cardNumber}"`,
      p.amountDue,
      ...keys.map(k => (p[k] ? `${p[k]!.method} ${p[k]!.amount}` : '')),
      p.totalPaid,
      p.balanceDue,
      `"${p.remarks || ''}"`,
      p.isDonationRow ? 'Donations' : p.isInactive ? 'Inactive' : 'Active',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MGFC_${displaySeasonYear}_${sheet.id.toUpperCase()}_Fee_Sheet.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Master Summary
  const exportSummaryToCsv = () => {
    const headers = ['AGE GROUP', 'COACH', 'ASSISTANT COACH', 'REGISTERED PLAYERS', 'AMOUNT DUE', 'APR TOTAL', 'MAY TOTAL', 'JUNE TOTAL', 'JULY TOTAL', 'AUG_OCT TOTAL', 'TOTAL PAID', 'BALANCE DUE', 'COLLECTION %'];
    const rows = masterStats.teamSummaries.map(t => [
      `"${t.sheet.ageGroup}"`,
      `"${t.sheet.coach}"`,
      `"${t.sheet.assistantCoach}"`,
      t.totalPlayers,
      t.billed,
      t.monthTotals.apr.total,
      t.monthTotals.may.total,
      t.monthTotals.june.total,
      t.monthTotals.july.total,
      t.augToOctTotal,
      t.paid,
      t.balance,
      `${t.collectionRate}%`,
    ]);

    // Grand total row
    rows.push([
      '"ALL TEAMS TOTAL"',
      '"—"',
      '"—"',
      masterStats.totalRegistered,
      masterStats.totalBilled,
      masterStats.monthTotals.apr.total,
      masterStats.monthTotals.may.total,
      masterStats.monthTotals.june.total,
      masterStats.monthTotals.july.total,
      masterStats.augToOctGrandTotal,
      masterStats.totalPaid,
      masterStats.totalBalance,
      `${masterStats.overallCollectionRate}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MGFC_${displaySeasonYear}_Youth_Fees_Master_Summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#E31E24] mb-0.5">
            {isReadOnlyArchive
              ? `Archived ${activeArchive?.seasonLabel} · Read-Only Snapshot`
              : `Active ${currentSeasonYear} Season`}
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-wide flex items-center gap-2.5">
            <span>Finance & Player-Fee System (ZAR)</span>
          </h2>
          <p className="text-xs text-[#718096] mt-0.5 font-medium">
            Official digitised youth team fee register (Under 6 to Under 13), annual archives, receipts, and general treasury ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openSeasonModal('promote', selectedSheetId !== 'summary' ? selectedSheetId : 'u7')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-[#0B1F3A] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#E31E24]" /> Move Teams Forward
          </button>

          <button
            onClick={() => openSeasonModal('archive')}
            className="px-3.5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5 text-[#E31E24]" /> Archive Fees & New Season
          </button>

          {!isReadOnlyArchive && activeSubTab === 'team-sheets' && selectedSheetId !== 'summary' && currentSheet && (
            <button
              onClick={() => {
                setEditingPlayerSheetId(currentSheet.id);
                setEditingPlayerRow({
                  id: '',
                  no: currentSheet.players.filter(p => !p.isDonationRow).length + 1,
                  name: '',
                  surname: '',
                  cardNumber: '',
                  amountDue: currentSheet.seasonStandardFee || 1800,
                  totalPaid: 0,
                  balanceDue: currentSheet.seasonStandardFee || 1800,
                  remarks: '',
                  isInactive: false,
                });
                setIsNewPlayerModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Player to {currentSheet.ageGroup}
            </button>
          )}

          {!isReadOnlyArchive && (
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-[#0B1F3A] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#E31E24]" /> Log Ledger Entry
            </button>
          )}
        </div>
      </div>

      {/* Season Year / Archive Switcher Bar */}
      <div className="bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider px-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#E31E24]" /> Fee Register Season:
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer tabular-nums ${
                viewingArchiveId === arch.id
                  ? 'bg-[#E31E24] text-white shadow-xs'
                  : 'text-[#718096] hover:text-[#0B1F3A] hover:bg-slate-50'
              }`}
            >
              Archived {arch.seasonYear} (R{arch.summary.totalCollected.toLocaleString()})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isReadOnlyArchive ? (
            <button
              onClick={() => setViewingArchiveId('active')}
              className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold hover:bg-amber-100 cursor-pointer"
            >
              Viewing {activeArchive?.seasonYear} Archive (Read-Only) · Return to {currentSeasonYear} &rarr;
            </button>
          ) : (
            <button
              onClick={() => openSeasonModal('history')}
              className="text-[11px] font-bold text-[#718096] hover:text-[#0B1F3A] px-2 cursor-pointer"
            >
              Manage Archives ({seasonArchives.length}) &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs Switcher: Digitised Team Fee Sheets vs General Registration vs Ledger */}
      <div className="flex flex-wrap p-1 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-2xl">
        <button
          onClick={() => setActiveSubTab('team-sheets')}
          className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'team-sheets'
              ? 'bg-[#E31E24] text-white shadow-xs'
              : 'text-[#718096] hover:text-[#0B1F3A]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Team Fee Sheets (U6 - U13)</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${activeSubTab === 'team-sheets' ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {masterStats.totalRegistered}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('players')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'players'
              ? 'bg-[#E31E24] text-white shadow-xs'
              : 'text-[#718096] hover:text-[#0B1F3A]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Registered Players</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${activeSubTab === 'players' ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {displayedPlayers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'ledger'
              ? 'bg-[#E31E24] text-white shadow-xs'
              : 'text-[#718096] hover:text-[#0B1F3A]'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>General Ledger</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${activeSubTab === 'ledger' ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {displayedTransactions.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          SUBTAB 1: DIGITISED TEAM FEE SHEETS (SUMMARY & INDIVIDUAL TEAM PAGES)
         ========================================================================= */}
      {activeSubTab === 'team-sheets' && (
        <div className="space-y-6">
          {/* Team Switcher Bar: Summary + U6 to U13 */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max">
              <button
                onClick={() => setSelectedSheetId('summary')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedSheetId === 'summary'
                    ? 'bg-[#0B1F3A] text-white shadow-sm'
                    : 'text-[#718096] hover:text-[#0B1F3A] hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#E31E24]" />
                <span>All Teams Summary</span>
              </button>

              <div className="h-5 w-px bg-slate-200 mx-1" />

              {displayedSheets.map(sheet => {
                const isSelected = selectedSheetId === sheet.id;
                const count = sheet.players.filter(p => !p.isDonationRow).length;
                return (
                  <button
                    key={sheet.id}
                    onClick={() => {
                      setSelectedSheetId(sheet.id);
                      setSheetSearchQuery('');
                      setSheetStatusFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#E31E24] text-white shadow-xs'
                        : 'text-[#718096] hover:text-[#0B1F3A] hover:bg-slate-50'
                    }`}
                  >
                    <span>{sheet.ageGroup}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pl-2">
              {selectedSheetId === 'summary' ? (
                <button
                  onClick={exportSummaryToCsv}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-[#0B1F3A] hover:bg-slate-50 text-xs font-bold flex items-center gap-1 min-w-max"
                  title="Export Master Summary to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#E31E24]" />
                  <span>Export Summary CSV</span>
                </button>
              ) : (
                <button
                  onClick={() => exportSheetToCsv(currentSheet)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-[#0B1F3A] hover:bg-slate-50 text-xs font-bold flex items-center gap-1 min-w-max"
                  title="Export Team Fee Sheet to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#E31E24]" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* VIEW A: ALL TEAMS SUMMARY VIEW */}
          {selectedSheetId === 'summary' && (
            <div className="space-y-6">
              {/* Master KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-xs text-[#718096] uppercase tracking-wider font-bold">
                    <span>Total Youth Players</span>
                    <Users className="w-4 h-4 text-[#0B1F3A]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0B1F3A]">
                    {masterStats.totalRegistered}
                  </div>
                  <div className="text-[11px] text-[#718096] font-medium flex items-center gap-2">
                    <span className="text-emerald-700 font-bold">{masterStats.totalActive} Active</span>
                    <span>•</span>
                    <span className="text-red-600 font-bold">{masterStats.totalInactive} Inactive / Dropped</span>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-xs text-[#718096] uppercase tracking-wider font-bold">
                    <span>Total Season Fees Billed</span>
                    <CreditCard className="w-4 h-4 text-[#0B1F3A]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0B1F3A]">
                    R{masterStats.totalBilled.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#718096] font-medium">Standard R1,800 + Concessions</div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-xs text-[#718096] uppercase tracking-wider font-bold">
                    <span>Total Fees Collected</span>
                    <span className="text-emerald-700 font-black">{masterStats.overallCollectionRate}%</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-heading text-emerald-700">
                    R{masterStats.totalPaid.toLocaleString()}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, masterStats.overallCollectionRate)}%` }}
                    />
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-xs text-[#718096] uppercase tracking-wider font-bold">
                    <span>Total Outstanding Balance</span>
                    <AlertCircle className="w-4 h-4 text-[#E31E24]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#E31E24]">
                    R{masterStats.totalBalance.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#718096] font-medium">Across all {teamFeeSheets.length} youth age groups</div>
                </div>
              </div>

              {/* EFT vs CASH Reconciliation Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> EFT / Direct Bank Deposits
                      </span>
                    </div>
                    <div className="text-2xl font-black font-heading text-[#0B1F3A]">
                      R{masterStats.totalEft.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#718096]">
                      {masterStats.totalPaid > 0 ? Math.round((masterStats.totalEft / masterStats.totalPaid) * 100) : 0}% of all collected fees
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#718096] font-medium">
                    Verified via FNB Business Account statements
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> CASH Collected by Managers
                      </span>
                    </div>
                    <div className="text-2xl font-black font-heading text-amber-700">
                      R{masterStats.totalCash.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#718096]">
                      {masterStats.totalPaid > 0 ? Math.round((masterStats.totalCash / masterStats.totalPaid) * 100) : 0}% of all collected fees
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#718096] font-medium">
                    Recorded with receipt / handed to Treasurer
                  </div>
                </div>
              </div>

              {/* Master Summary Table: All Teams Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-[#0B1F3A] uppercase tracking-wide">
                      Master Fee Summary Across All Teams
                    </h3>
                    <p className="text-xs text-[#718096] font-medium">
                      Consolidated breakdown of player registrations, monthly collections (Apr - Aug/Sep), and collection performance.
                    </p>
                  </div>
                  <button
                    onClick={exportSummaryToCsv}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#E31E24]" /> Export Master CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#0B1F3A]">
                    <thead className="bg-[#0B1F3A] text-white text-[11px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">Team</th>
                        <th className="py-3 px-3">Coaching Staff</th>
                        <th className="py-3 px-3 text-center">Players</th>
                        <th className="py-3 px-3 text-right">Billed (R)</th>
                        <th className="py-3 px-3 text-right">APR</th>
                        <th className="py-3 px-3 text-right">MAY</th>
                        <th className="py-3 px-3 text-right">JUNE</th>
                        <th className="py-3 px-3 text-right">JULY</th>
                        <th className="py-3 px-3 text-right">AUG–OCT</th>
                        <th className="py-3 px-3 text-right font-black">Total Paid</th>
                        <th className="py-3 px-3 text-right font-black">Balance Due</th>
                        <th className="py-3 px-3 text-center">Rate</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {masterStats.teamSummaries.map(({ sheet, totalPlayers, activePlayers, billed, paid, balance, monthTotals, augToOctTotal, collectionRate }) => (
                        <tr key={sheet.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-[#0B1F3A] text-sm">{sheet.ageGroup}</div>
                            <div className="text-[10px] text-[#718096]">Std: R{sheet.seasonStandardFee || 1800}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-medium text-[#0B1F3A] text-[11px]">{sheet.coach}</div>
                            <div className="text-[10px] text-[#718096]">Asst: {sheet.assistantCoach}</div>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="font-bold text-[#0B1F3A]">{totalPlayers}</span>
                            <span className="text-[10px] text-[#718096] block">({activePlayers} active)</span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-semibold">
                            R{billed.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-[11px]">
                            {monthTotals.apr.total > 0 ? `R${monthTotals.apr.total.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-[11px]">
                            {monthTotals.may.total > 0 ? `R${monthTotals.may.total.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-[11px]">
                            {monthTotals.june.total > 0 ? `R${monthTotals.june.total.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-[11px]">
                            {monthTotals.july.total > 0 ? `R${monthTotals.july.total.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-[11px]">
                            {augToOctTotal > 0 ? `R${augToOctTotal.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-emerald-700">
                            R{paid.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-[#E31E24]">
                            R{balance.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                collectionRate >= 90
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : collectionRate >= 60
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {collectionRate}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedSheetId(sheet.id);
                                setSheetSearchQuery('');
                                setSheetStatusFilter('all');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#0B1F3A] hover:bg-[#15325b] text-white text-[11px] font-bold transition-all flex items-center gap-1 mx-auto"
                            >
                              <span>Manage</span>
                              <ArrowRight className="w-3 h-3 text-[#E31E24]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-xs">
                      <tr>
                        <td className="py-3.5 px-4 font-black uppercase text-[#0B1F3A]">ALL TEAMS TOTAL</td>
                        <td className="py-3.5 px-3 text-[#718096]">{teamFeeSheets.length} Age Groups</td>
                        <td className="py-3.5 px-3 text-center text-[#0B1F3A] font-black">{masterStats.totalRegistered}</td>
                        <td className="py-3.5 px-3 text-right text-[#0B1F3A] font-black">R{masterStats.totalBilled.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold">R{masterStats.monthTotals.apr.total.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold">R{masterStats.monthTotals.may.total.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold">R{masterStats.monthTotals.june.total.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold">R{masterStats.monthTotals.july.total.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold">R{masterStats.augToOctGrandTotal.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right text-emerald-800 font-black">R{masterStats.totalPaid.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right text-[#E31E24] font-black">R{masterStats.totalBalance.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-center text-[#0B1F3A] font-black">{masterStats.overallCollectionRate}%</td>
                        <td className="py-3.5 px-4"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: INDIVIDUAL TEAM FEE SHEET (THE EXACT DIGITISED SPREADSHEET) */}
          {selectedSheetId !== 'summary' && currentSheet && currentSheetStats && (
            <div className="space-y-4">
              {/* Team Information & Staff Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black font-heading text-[#0B1F3A] uppercase tracking-wide">
                      {currentSheet.ageGroup} Fee Register ({displaySeasonYear})
                    </h3>
                    {!isReadOnlyArchive && (
                      <button
                        onClick={() => {
                          setEditingSheetInfoId(currentSheet.id);
                          setSheetInfoForm({
                            coach: currentSheet.coach,
                            assistantCoach: currentSheet.assistantCoach,
                            standardFee: currentSheet.seasonStandardFee || 1800,
                          });
                        }}
                        className="text-[#718096] hover:text-[#E31E24] transition-colors p-1 cursor-pointer"
                        title="Edit Coach & Fee Information"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#718096]">
                    <span>Head Coach: <strong className="text-[#0B1F3A] font-bold">{currentSheet.coach}</strong></span>
                    <span>•</span>
                    <span>Assistant Coach: <strong className="text-[#0B1F3A] font-bold">{currentSheet.assistantCoach}</strong></span>
                    <span>•</span>
                    <span>Standard Season Fee: <strong className="text-[#E31E24] font-bold">R{currentSheet.seasonStandardFee || 1800}.00</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-[#F0F4F9] px-4 py-2 rounded-2xl border border-slate-200 text-center tabular-nums">
                    <span className="text-[10px] text-[#718096] uppercase font-bold block">Billed</span>
                    <span className="text-sm font-black text-[#0B1F3A]">R{currentSheetStats.billed.toLocaleString()}</span>
                  </div>
                  <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 text-center tabular-nums">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold block">Paid ({currentSheetStats.collectionRate}%)</span>
                    <span className="text-sm font-black text-emerald-800">R{currentSheetStats.paid.toLocaleString()}</span>
                  </div>
                  <div className="bg-red-50 px-4 py-2 rounded-2xl border border-red-200 text-center tabular-nums">
                    <span className="text-[10px] text-[#E31E24] uppercase font-bold block">Balance</span>
                    <span className="text-sm font-black text-[#E31E24]">R{currentSheetStats.balance.toLocaleString()}</span>
                  </div>
                  {!isReadOnlyArchive && NEXT_SQUAD_MAP[currentSheet.id] && (
                    <button
                      onClick={() => openSeasonModal('promote', currentSheet.id)}
                      className="px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#E31E24] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Move {currentSheet.id.toUpperCase()} &rarr; {NEXT_SQUAD_MAP[currentSheet.id]?.toUpperCase()}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter and Action Bar */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      placeholder={`Search ${currentSheet.ageGroup} player name or card #...`}
                      value={sheetSearchQuery}
                      onChange={e => setSheetSearchQuery(e.target.value)}
                      className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#0B1F3A] placeholder-slate-400 focus:outline-none focus:border-[#E31E24] font-medium"
                    />
                  </div>

                  <select
                    value={sheetStatusFilter}
                    onChange={e => setSheetStatusFilter(e.target.value as any)}
                    className="bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B1F3A] focus:outline-none focus:border-[#E31E24] font-bold"
                  >
                    <option value="all">All Players ({currentSheetStats.totalPlayers})</option>
                    <option value="settled">Fully Settled (R0 Balance)</option>
                    <option value="outstanding">Outstanding Balance</option>
                    <option value="concession">Manager Fee / Concessions</option>
                    <option value="inactive">Inactive / No Longer Playing</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#718096] hidden sm:inline">
                    Showing <strong className="text-[#0B1F3A]">{filteredSheetPlayers.length}</strong> rows
                  </span>

                  {!isReadOnlyArchive && (
                    <button
                      onClick={() => {
                        setEditingPlayerSheetId(currentSheet.id);
                        setEditingPlayerRow({
                          id: '',
                          no: currentSheet.players.filter(p => !p.isDonationRow).length + 1,
                          name: '',
                          surname: '',
                          cardNumber: '',
                          amountDue: currentSheet.seasonStandardFee || 1800,
                          totalPaid: 0,
                          balanceDue: currentSheet.seasonStandardFee || 1800,
                          remarks: '',
                          isInactive: false,
                        });
                        setIsNewPlayerModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Player
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode Toggle & Legend Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#718096] px-1 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#0B1F3A]">View Mode:</span>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    <button
                      onClick={() => setMobileDisplayMode('table')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        mobileDisplayMode === 'table'
                          ? 'bg-[#0B1F3A] text-white shadow-xs'
                          : 'text-[#718096] hover:text-[#0B1F3A]'
                      }`}
                    >
                      Spreadsheet Table
                    </button>
                    <button
                      onClick={() => setMobileDisplayMode('cards')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        mobileDisplayMode === 'cards'
                          ? 'bg-[#0B1F3A] text-white shadow-xs'
                          : 'text-[#718096] hover:text-[#0B1F3A]'
                      }`}
                    >
                      Mobile Player Cards
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#0B1F3A]">Badges:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 font-bold">
                    EFT
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-bold">
                    CASH
                  </span>
                  <span className="text-red-600 font-medium ml-1">Strikethrough = Inactive</span>
                </div>
              </div>

              {/* Mobile Swipe Hint for Table View */}
              {mobileDisplayMode === 'table' && (
                <div className="lg:hidden p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center justify-between">
                  <span>
                    Swipe horizontally to view all {currentSheet.hasExtendedMonths ? '16' : '14'} columns (Apr–{currentSheet.hasExtendedMonths ? 'Oct' : 'Aug/Sep'}, totals, balance) &rarr;
                  </span>
                  <span className="font-bold text-[10px] bg-blue-200 px-2 py-0.5 rounded-full">Scrollable</span>
                </div>
              )}

              {/* MODE 1: MOBILE PLAYER CARDS VIEW */}
              {mobileDisplayMode === 'cards' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredSheetPlayers.map(player => {
                    const isInactive = player.isInactive;
                    const isDonation = player.isDonationRow;
                    return (
                      <div
                        key={player.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 bg-white shadow-xs ${
                          isInactive
                            ? 'border-red-200 bg-red-50/30'
                            : isDonation
                            ? 'border-emerald-200 bg-emerald-50/30'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center font-mono">
                              {isDonation ? '★' : player.no}
                            </span>
                            <div>
                              <div
                                className={`font-bold text-sm ${
                                  isInactive
                                    ? 'line-through text-red-700'
                                    : isDonation
                                    ? 'text-emerald-800'
                                    : 'text-[#0B1F3A]'
                                }`}
                              >
                                {player.name} {player.surname}
                              </div>
                              <div className="text-[10px] text-[#718096] font-mono">
                                {isDonation ? 'Team Donation Offset' : `Card: ${player.cardNumber || 'No card yet'}`}
                              </div>
                            </div>
                          </div>

                          {!isReadOnlyArchive && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingPlayerSheetId(currentSheet.id);
                                  setEditingPlayerRow(player);
                                  setIsNewPlayerModal(false);
                                }}
                                className="p-1.5 text-slate-400 hover:text-[#0B1F3A] rounded-lg bg-slate-100 transition-colors cursor-pointer"
                                title="Edit player"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove ${player.name} ${player.surname} from ${currentSheet.ageGroup}?`)) {
                                    deleteTeamFeePlayer(currentSheet.id, player.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-[#E31E24] rounded-lg bg-slate-100 transition-colors cursor-pointer"
                                title="Delete player"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Financial Snapshot */}
                        <div className="grid grid-cols-3 gap-2 bg-[#F0F4F9] p-2.5 rounded-xl text-center text-xs">
                          <div>
                            <span className="text-[10px] text-[#718096] block font-medium">Due</span>
                            <span className="font-bold text-[#0B1F3A]">R{player.amountDue}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#718096] block font-medium">Paid</span>
                            <span className="font-black text-emerald-700">R{player.totalPaid}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#718096] block font-medium">Balance</span>
                            <span className={`font-black ${player.balanceDue < 0 ? 'text-emerald-700' : 'text-[#E31E24]'}`}>
                              {isInactive ? 'R0' : `R${player.balanceDue}`}
                            </span>
                          </div>
                        </div>

                        {/* Months Payment Pills */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#718096] uppercase font-bold block">
                            {isReadOnlyArchive ? 'Monthly Payments Snapshot:' : 'Tap Month to Record/Edit Payment:'}
                          </span>
                          <div className={`grid gap-1.5 ${activeMonthKeys.length > 5 ? 'grid-cols-4 sm:grid-cols-7' : 'grid-cols-5'}`}>
                            {activeMonthKeys.map(mKey => {
                              const inst = player[mKey];
                              const hasPaid = inst && inst.amount > 0;
                              return (
                                <button
                                  key={mKey}
                                  disabled={isReadOnlyArchive}
                                  onClick={() => {
                                    if (isReadOnlyArchive) return;
                                    setMonthPaymentModal({
                                      sheetId: currentSheet.id,
                                      player,
                                      monthKey: mKey,
                                      amount: inst ? inst.amount : 600,
                                      method: inst ? inst.method : 'EFT',
                                      datePaid: inst?.datePaid || new Date().toISOString().split('T')[0],
                                    });
                                  }}
                                  className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                                    hasPaid
                                      ? inst.method === 'EFT'
                                        ? 'bg-blue-100 text-blue-900 border border-blue-300 font-extrabold'
                                        : 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                                      : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="text-[9px] uppercase font-bold">
                                    {getMonthLabel(mKey, currentSheet.hasExtendedMonths)}
                                  </div>
                                  <div className="text-[10px] font-mono leading-none mt-0.5">
                                    {hasPaid ? inst.amount : '—'}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {player.remarks && (
                          <div className="text-[11px] text-[#718096] italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <strong>Note:</strong> {player.remarks}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 2: THE OFFICIAL INTERACTIVE DIGITISED SPREADSHEET TABLE */}
              {mobileDisplayMode === 'table' && (
                <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left text-xs text-[#0B1F3A]">
                    <thead className="bg-[#0B1F3A] text-white text-[11px] uppercase tracking-wider font-bold select-none">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">NO</th>
                        <th className="py-3 px-3 min-w-[120px]">NAME</th>
                        <th className="py-3 px-3 min-w-[120px]">SURNAME</th>
                        <th className="py-3 px-3 min-w-[100px]">CARD NUMBER</th>
                        <th className="py-3 px-3 text-right min-w-[100px]">AMOUNT DUE</th>
                        {activeMonthKeys.map(mKey => (
                          <th key={mKey} className="py-3 px-3 text-center min-w-[95px]">
                            {getMonthLabel(mKey, currentSheet.hasExtendedMonths)}
                          </th>
                        ))}
                        <th className="py-3 px-3 text-right min-w-[100px] font-black">TOTAL PAID</th>
                        <th className="py-3 px-3 text-right min-w-[100px] font-black">BALANCE DUE</th>
                        <th className="py-3 px-3 min-w-[160px]">REMARKS</th>
                        <th className="py-3 px-3 text-center w-16">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSheetPlayers.map(player => {
                        const isInactive = player.isInactive;
                        const isDonation = player.isDonationRow;

                        const renderMonthCell = (monthKey: MonthKey) => {
                          const installment = player[monthKey];
                          return (
                            <td
                              key={monthKey}
                              onClick={() => {
                                if (isReadOnlyArchive) return;
                                setMonthPaymentModal({
                                  sheetId: currentSheet.id,
                                  player,
                                  monthKey,
                                  amount: installment ? installment.amount : 600,
                                  method: installment ? installment.method : 'EFT',
                                  datePaid: installment?.datePaid || new Date().toISOString().split('T')[0],
                                });
                              }}
                              className={`py-2.5 px-3 text-center transition-colors group relative ${
                                isReadOnlyArchive ? 'cursor-default' : 'cursor-pointer hover:bg-slate-100/70'
                              }`}
                              title={isReadOnlyArchive ? 'Archived record (read-only)' : 'Click to edit or record payment'}
                            >
                              {installment && installment.amount > 0 ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-extrabold shadow-2xs ${
                                    installment.method === 'EFT'
                                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                                  }`}
                                >
                                  {installment.method} {installment.amount}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono text-[11px] group-hover:text-slate-500">—</span>
                              )}
                            </td>
                          );
                        };

                        return (
                          <tr
                            key={player.id}
                            className={`transition-colors ${
                              isInactive
                                ? 'bg-red-50/70 hover:bg-red-100/70 text-red-900'
                                : isDonation
                                ? 'bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950 font-semibold'
                                : 'hover:bg-slate-50/80 text-[#0B1F3A]'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-400">
                              {isDonation ? '—' : player.no}
                            </td>
                            <td
                              className={`py-2.5 px-3 font-bold ${
                                isInactive
                                  ? 'line-through text-red-700'
                                  : isDonation
                                  ? 'text-emerald-800 uppercase tracking-wider'
                                  : 'text-[#0B1F3A]'
                              }`}
                            >
                              {player.name}
                            </td>
                            <td className={`py-2.5 px-3 font-semibold ${isInactive ? 'line-through text-red-700' : 'text-[#0B1F3A]'}`}>
                              {player.surname || (isDonation ? '—' : '')}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-[#718096]">
                              {player.cardNumber || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium">
                              {isDonation ? (
                                <span className="text-slate-400">—</span>
                              ) : (
                                <span>R{player.amountDue.toLocaleString()}</span>
                              )}
                            </td>

                            {/* Monthly Installment Columns (5 base or 7 extended) */}
                            {activeMonthKeys.map(mKey => renderMonthCell(mKey))}

                            <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                              R{player.totalPaid.toLocaleString()}
                            </td>

                            <td
                              className={`py-2.5 px-3 text-right font-black ${
                                player.balanceDue < 0 ? 'text-emerald-700' : 'text-[#E31E24]'
                              }`}
                            >
                              {isInactive
                                ? '0'
                                : player.balanceDue < 0
                                ? `-R${Math.abs(player.balanceDue).toLocaleString()}`
                                : `R${player.balanceDue.toLocaleString()}`}
                            </td>

                            <td className="py-2.5 px-3 text-[11px]">
                              {isInactive ? (
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                                  {player.remarks || 'No longer playing'}
                                </span>
                              ) : isDonation ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  {player.remarks || 'Team Donations Offset'}
                                </span>
                              ) : player.remarks ? (
                                <span className="text-[#0B1F3A] font-medium bg-slate-100 px-2 py-0.5 rounded">
                                  {player.remarks}
                                </span>
                              ) : (
                                <span className="text-slate-300 italic">—</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              {isReadOnlyArchive ? (
                                <span className="text-[10px] text-slate-400 font-medium">Locked</span>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingPlayerSheetId(currentSheet.id);
                                      setEditingPlayerRow(player);
                                      setIsNewPlayerModal(false);
                                    }}
                                    className="p-1 text-slate-400 hover:text-[#0B1F3A] rounded transition-colors cursor-pointer"
                                    title="Edit player record"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove ${player.name} ${player.surname} from ${currentSheet.ageGroup}?`)) {
                                        deleteTeamFeePlayer(currentSheet.id, player.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-[#E31E24] rounded transition-colors cursor-pointer"
                                    title="Delete player"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredSheetPlayers.length === 0 && (
                        <tr>
                          <td colSpan={activeMonthKeys.length + 9} className="py-8 text-center text-slate-400 text-xs">
                            No players found matching your query in {currentSheet.ageGroup}.
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* Team Totals Row */}
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-xs text-[#0B1F3A]">
                      <tr>
                        <td className="py-3 px-3 text-center font-black">TOTAL</td>
                        <td colSpan={3} className="py-3 px-3 text-[#718096]">
                          {currentSheet.ageGroup} ({currentSheetStats.activePlayers} Active, {currentSheetStats.inactivePlayers} Inactive)
                        </td>
                        <td className="py-3 px-3 text-right font-black">
                          R{currentSheetStats.billed.toLocaleString()}
                        </td>
                        {activeMonthKeys.map(mKey => (
                          <td key={mKey} className="py-3 px-3 text-center font-mono font-bold">
                            R{currentSheetStats.monthTotals[mKey].total.toLocaleString()}
                          </td>
                        ))}
                        <td className="py-3 px-3 text-right text-emerald-800 font-black">
                          R{currentSheetStats.paid.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-[#E31E24] font-black">
                          R{currentSheetStats.balance.toLocaleString()}
                        </td>
                        <td colSpan={2} className="py-3 px-3 text-right text-[#718096] text-[11px]">
                          Collection: <strong className="text-[#0B1F3A]">{currentSheetStats.collectionRate}%</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUBTAB 2: GENERAL REGISTERED PLAYERS LEDGER
         ========================================================================= */}
      {activeSubTab === 'players' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter player name or NRFA card number..."
                  value={searchPlayerQuery}
                  onChange={e => setSearchPlayerQuery(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#0B1F3A] placeholder-slate-400 focus:outline-none focus:border-[#E31E24] font-medium"
                />
              </div>

              <select
                value={feeStatusFilter}
                onChange={e => setFeeStatusFilter(e.target.value)}
                className="bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B1F3A] focus:outline-none focus:border-[#E31E24] font-bold"
              >
                <option value="all">All Fee Statuses</option>
                <option value="Paid">Paid in Full</option>
                <option value="Partial">Partial Payment</option>
                <option value="Overdue">Overdue</option>
                <option value="Exempt / Bursary">Exempt / Bursary</option>
              </select>
            </div>

            <div className="text-xs text-[#718096] font-medium">
              Showing <strong className="text-[#0B1F3A]">{filteredPlayers.length}</strong> player accounts
            </div>
          </div>

          {/* Player Fees Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-[#0B1F3A]">
              <thead className="bg-[#0B1F3A] text-white text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-3">Squad</th>
                  <th className="py-3.5 px-3 text-right">Fee Due</th>
                  <th className="py-3.5 px-3 text-right">Paid</th>
                  <th className="py-3.5 px-3 text-right">Balance</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlayers.map(player => {
                  const balance = player.feeDue - player.feePaid;
                  return (
                    <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0B1F3A] text-sm">
                          {player.firstName} {player.lastName}
                        </div>
                        <div className="text-[10px] text-[#718096] font-mono">{player.safaNumber}</div>
                      </td>
                      <td className="py-3 px-3 text-[#718096] font-medium">
                        {displayedSquads.find(s => s.id === player.squadId)?.name || player.squadId}
                      </td>
                      <td className="py-3 px-3 text-right font-medium">
                        R{player.feeDue.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        R{player.feePaid.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#E31E24]">
                        R{balance > 0 ? balance.toLocaleString() : '0'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            player.feeStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : player.feeStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : player.feeStatus === 'Exempt / Bursary'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-[#E31E24]'
                          }`}
                        >
                          {player.feeStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isReadOnlyArchive ? (
                          <span className="text-[11px] text-[#718096] font-medium">Archived</span>
                        ) : (
                          <button
                            onClick={() => {
                              setPayingPlayer(player);
                              setPaymentAmount(balance > 0 ? balance : 500);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 3: GENERAL CLUB LEDGER (INFLOW & OUTFLOW AUDIT)
         ========================================================================= */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase tracking-wide">
              Official Club Financial Transactions ({displaySeasonYear})
            </h3>
            <span className="text-xs text-[#718096]">
              Total Records: <strong className="text-[#0B1F3A]">{displayedTransactions.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-[#0B1F3A]">
              <thead className="bg-[#0B1F3A] text-white text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Ref Number</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-4">Entity / Payer</th>
                  <th className="py-3.5 px-3">Method</th>
                  <th className="py-3.5 px-4 text-right">Amount (ZAR)</th>
                  <th className="py-3.5 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B1F3A]">
                      {tx.referenceNumber}
                    </td>
                    <td className="py-3.5 px-3 text-[#718096] font-medium tabular-nums">{formatDateMMDDYYYY(tx.date)}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-[#0B1F3A]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0B1F3A]">{tx.payerOrPayee}</div>
                      <div className="text-[10px] text-[#718096] truncate max-w-xs">{tx.description}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[#718096] font-medium">{tx.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-black text-sm ${
                          tx.type === 'income' ? 'text-emerald-700' : 'text-[#E31E24]'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}R{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {tx.receiptNumber ? (
                        <button
                          onClick={() => setViewingReceipt(tx)}
                          className="px-2.5 py-1 rounded-lg bg-[#0B1F3A] hover:bg-[#15325b] text-white text-[10px] font-bold inline-flex items-center gap-1 shadow-xs"
                        >
                          <Receipt className="w-3 h-3 text-[#E31E24]" />
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: QUICK MONTH PAYMENT RECORDING FOR TEAM FEE SHEET
         ========================================================================= */}
      {monthPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setMonthPaymentModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E31E24]">
                Update Month Installment
              </div>
              <h3 className="font-heading font-black text-2xl uppercase tracking-wide text-[#0B1F3A] mt-0.5">
                {getMonthLabel(
                  monthPaymentModal.monthKey,
                  teamFeeSheets.find(s => s.id === monthPaymentModal.sheetId)?.hasExtendedMonths
                )}{' '}
                Payment
              </h3>
              <p className="text-xs text-[#718096] font-medium mt-1">
                Player: <strong className="text-[#0B1F3A]">{monthPaymentModal.player.name} {monthPaymentModal.player.surname}</strong> (Card #{monthPaymentModal.player.cardNumber || 'N/A'})
              </p>
            </div>

            <div className="p-3 bg-[#F0F4F9] rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-[#718096]">Season Standard Due:</span>
              <span className="font-black text-[#0B1F3A]">R{monthPaymentModal.player.amountDue}</span>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                recordMonthPayment(
                  monthPaymentModal.sheetId,
                  monthPaymentModal.player.id,
                  monthPaymentModal.monthKey,
                  {
                    amount: Number(monthPaymentModal.amount),
                    method: monthPaymentModal.method,
                    datePaid: monthPaymentModal.datePaid || new Date().toISOString().split('T')[0],
                  }
                );
                setMonthPaymentModal(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMonthPaymentModal({ ...monthPaymentModal, method: 'EFT' })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      monthPaymentModal.method === 'EFT'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-[#0B1F3A] hover:bg-slate-200'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> EFT (Bank)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthPaymentModal({ ...monthPaymentModal, method: 'CASH' })}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      monthPaymentModal.method === 'CASH'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-[#0B1F3A] hover:bg-slate-200'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" /> CASH (Manager)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Amount Paid in ZAR (R) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  step={50}
                  value={monthPaymentModal.amount}
                  onChange={e => setMonthPaymentModal({ ...monthPaymentModal, amount: Number(e.target.value) })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
                <div className="flex gap-1.5 mt-2">
                  {[600, 900, 1000, 1800].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMonthPaymentModal({ ...monthPaymentModal, amount: amt })}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold text-[#0B1F3A]"
                    >
                      R{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Payment Date (MM/DD/YYYY)</label>
                <DateInput
                  required
                  value={monthPaymentModal.datePaid}
                  onChange={val => setMonthPaymentModal({ ...monthPaymentModal, datePaid: val })}
                  ariaLabel="Payment Date"
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    recordMonthPayment(
                      monthPaymentModal.sheetId,
                      monthPaymentModal.player.id,
                      monthPaymentModal.monthKey,
                      null
                    );
                    setMonthPaymentModal(null);
                  }}
                  className="text-red-600 hover:text-red-800 text-xs font-bold"
                >
                  Clear / Remove Payment
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMonthPaymentModal(null)}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-[#0B1F3A] text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider"
                  >
                    Save Payment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD OR EDIT PLAYER ON TEAM FEE SHEET
         ========================================================================= */}
      {editingPlayerRow && editingPlayerSheetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => {
                setEditingPlayerRow(null);
                setEditingPlayerSheetId(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E31E24]">
                {isNewPlayerModal ? 'Add Player' : 'Edit Player Fee Profile'}
              </div>
              <h3 className="font-heading font-black text-2xl uppercase tracking-wide text-[#0B1F3A] mt-0.5">
                {isNewPlayerModal ? 'New Team Player' : `${editingPlayerRow.name} ${editingPlayerRow.surname}`}
              </h3>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (isNewPlayerModal) {
                  addTeamFeePlayer(editingPlayerSheetId, {
                    no: editingPlayerRow.no,
                    name: editingPlayerRow.name,
                    surname: editingPlayerRow.surname,
                    cardNumber: editingPlayerRow.cardNumber,
                    amountDue: Number(editingPlayerRow.amountDue),
                    remarks: editingPlayerRow.remarks || '',
                    isInactive: editingPlayerRow.isInactive || false,
                  });
                } else {
                  updateTeamFeePlayer(editingPlayerSheetId, editingPlayerRow);
                }
                setEditingPlayerRow(null);
                setEditingPlayerSheetId(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Row No.</label>
                  <input
                    type="number"
                    value={editingPlayerRow.no}
                    onChange={e => setEditingPlayerRow({ ...editingPlayerRow, no: Number(e.target.value) })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[#0B1F3A] font-bold mb-1">NRFA Card Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 230912"
                    value={editingPlayerRow.cardNumber}
                    onChange={e => setEditingPlayerRow({ ...editingPlayerRow, cardNumber: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zayd"
                    value={editingPlayerRow.name}
                    onChange={e => setEditingPlayerRow({ ...editingPlayerRow, name: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Surname</label>
                  <input
                    type="text"
                    placeholder="e.g. Suliman"
                    value={editingPlayerRow.surname}
                    onChange={e => setEditingPlayerRow({ ...editingPlayerRow, surname: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Amount Due in ZAR (R) *</label>
                <input
                  type="number"
                  required
                  step={50}
                  value={editingPlayerRow.amountDue}
                  onChange={e => setEditingPlayerRow({ ...editingPlayerRow, amountDue: Number(e.target.value) })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-[#0B1F3A]"
                />
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingPlayerRow({ ...editingPlayerRow, amountDue: 1800 })}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-[#0B1F3A]"
                  >
                    Standard (R1,800)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPlayerRow({ ...editingPlayerRow, amountDue: 900, remarks: editingPlayerRow.remarks || 'Manager fee' })}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-[#0B1F3A]"
                  >
                    Manager Fee Concession (R900)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPlayerRow({ ...editingPlayerRow, amountDue: 0, remarks: 'Bursary exempt' })}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-[#0B1F3A]"
                  >
                    Bursary (R0)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Remarks & Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Manager fee, Concession, Widow, In installment plan"
                  value={editingPlayerRow.remarks || ''}
                  onChange={e => setEditingPlayerRow({ ...editingPlayerRow, remarks: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A]"
                />
              </div>

              {/* Inactive toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!editingPlayerRow.isInactive}
                    onChange={e => setEditingPlayerRow({ ...editingPlayerRow, isInactive: e.target.checked, remarks: e.target.checked ? (editingPlayerRow.remarks || 'No longer playing') : editingPlayerRow.remarks })}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="font-bold text-red-600 text-xs">
                    Mark player as &quot;No longer playing&quot; (Inactive / red row strikethrough)
                  </span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlayerRow(null);
                    setEditingPlayerSheetId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-[#0B1F3A] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider"
                >
                  {isNewPlayerModal ? 'Add Player' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: EDIT TEAM COACHING INFO & STANDARD FEE
         ========================================================================= */}
      {editingSheetInfoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setEditingSheetInfoId(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E31E24]">
                Team Configuration
              </div>
              <h3 className="font-heading font-black text-2xl uppercase tracking-wide text-[#0B1F3A] mt-0.5">
                Edit Coaching Staff & Fee
              </h3>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateTeamSheetInfo(
                  editingSheetInfoId,
                  sheetInfoForm.coach,
                  sheetInfoForm.assistantCoach,
                  Number(sheetInfoForm.standardFee)
                );
                setEditingSheetInfoId(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Head Coach *</label>
                <input
                  type="text"
                  required
                  value={sheetInfoForm.coach}
                  onChange={e => setSheetInfoForm({ ...sheetInfoForm, coach: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] font-bold"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Assistant Coach / Manager</label>
                <input
                  type="text"
                  value={sheetInfoForm.assistantCoach}
                  onChange={e => setSheetInfoForm({ ...sheetInfoForm, assistantCoach: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] font-bold"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Season Standard Fee in ZAR (R)</label>
                <input
                  type="number"
                  step={50}
                  value={sheetInfoForm.standardFee}
                  onChange={e => setSheetInfoForm({ ...sheetInfoForm, standardFee: Number(e.target.value) })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] font-mono font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSheetInfoId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-[#0B1F3A] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider"
                >
                  Save Team Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: RECORD GENERAL TRANSACTION
         ========================================================================= */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setIsAddTxModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E31E24]">
                MGFC Treasury Operations
              </div>
              <h3 className="font-heading font-black text-2xl uppercase tracking-wide text-[#0B1F3A] mt-0.5">
                Record Financial Transaction
              </h3>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Transaction Flow</label>
                  <select
                    value={newTx.type}
                    onChange={e => setNewTx({ ...newTx, type: e.target.value as any })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24] font-semibold"
                  >
                    <option value="income">Revenue / Inflow (+)</option>
                    <option value="expense">Expense / Outflow (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Amount in ZAR (R) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTx.amount}
                    onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Category</label>
                  <select
                    value={newTx.category}
                    onChange={e => setNewTx({ ...newTx, category: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24] font-semibold"
                  >
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="Player Subscriptions">Player Subscriptions</option>
                    <option value="Donation">Community Donation / Grant</option>
                    <option value="Referee Fees">Referee Fees</option>
                    <option value="Kit & Equipment">Kit & Equipment</option>
                    <option value="Pitch Maintenance">Pitch Maintenance</option>
                    <option value="Transport">Matchday Transport</option>
                    <option value="Affiliation & SAFA Cards">Affiliation &amp; NRFA Cards</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Date (MM/DD/YYYY)</label>
                  <DateInput
                    required
                    value={newTx.date}
                    onChange={val => setNewTx({ ...newTx, date: val })}
                    ariaLabel="Transaction Date"
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Payer or Payee Entity</label>
                <input
                  type="text"
                  placeholder="e.g. Sandton Auto Mall or SDLFA Referees"
                  value={newTx.payerOrPayee}
                  onChange={e => setNewTx({ ...newTx, payerOrPayee: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Transaction Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Purchase of matchday equipment and balls"
                  value={newTx.description}
                  onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl p-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-[#0B1F3A] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: RECORD GENERAL PLAYER FEE PAYMENT (FROM SUBTAB 2)
         ========================================================================= */}
      {payingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setPayingPlayer(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#E31E24]">
                Player Subscription Recovery
              </div>
              <h3 className="font-heading font-black text-2xl uppercase tracking-wide text-[#0B1F3A] mt-0.5">
                Record Player Payment
              </h3>
              <p className="text-xs text-[#718096] font-medium mt-1">
                Player: <strong className="text-[#0B1F3A]">{payingPlayer.firstName} {payingPlayer.lastName}</strong> ({payingPlayer.safaNumber})
              </p>
            </div>

            <div className="bg-[#F0F4F9] p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-[#718096] block text-[10px] uppercase font-bold">Total Fee</span>
                <span className="font-extrabold text-[#0B1F3A]">R{payingPlayer.feeDue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#718096] block text-[10px] uppercase font-bold">Already Paid</span>
                <span className="font-extrabold text-emerald-700">R{payingPlayer.feePaid.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[#718096] block text-[10px] uppercase font-bold">Balance Due</span>
                <span className="font-black text-[#E31E24]">
                  R{Math.max(0, payingPlayer.feeDue - payingPlayer.feePaid).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Payment Amount (ZAR) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24] font-semibold"
                >
                  <option value="EFT / Bank">EFT / Direct Bank Deposit</option>
                  <option value="SnapScan / QR">SnapScan / QR Code</option>
                  <option value="Cash">Cash (Handed to Manager/Treasurer)</option>
                  <option value="Card">Card Terminal at Clubhouse</option>
                </select>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Payment Notes / Bank Ref</label>
                <input
                  type="text"
                  placeholder="e.g. FNB App Transfer Ref: SUB-241"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2 text-[#0B1F3A]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingPlayer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-[#0B1F3A] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider"
                >
                  Generate Receipt & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: OFFICIAL ELECTRONIC TREASURY RECEIPT
         ========================================================================= */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div id="printable-area" className="space-y-4">
              <div className="text-center border-b-2 border-[#0B1F3A] pb-3 flex flex-col items-center gap-1.5">
                <CrestLogo size="sm" showText={false} />
                <h3 className="font-heading font-black text-2xl uppercase tracking-wide text-[#0B1F3A]">
                  Marlboro Gardens Football Club
                </h3>
                <div className="text-[10px] font-bold text-[#E31E24] uppercase tracking-widest">
                  Official Electronic Treasury Receipt
                </div>
                <div className="text-[10px] text-[#718096]">
                  Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063 • Est. 1985
                </div>
              </div>

              <div className="flex justify-between items-center text-xs bg-[#F0F4F9] p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[#718096] block text-[9px] uppercase font-bold">Receipt Number</span>
                  <span className="font-mono font-bold text-[#0B1F3A]">{viewingReceipt.receiptNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#718096] block text-[9px] uppercase font-bold">Date Issued</span>
                  <span className="font-bold text-[#0B1F3A] tabular-nums">{formatDateMMDDYYYY(viewingReceipt.date)}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#718096]">Received From:</span>
                  <span className="font-bold text-[#0B1F3A]">{viewingReceipt.payerOrPayee}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#718096]">Payment Category:</span>
                  <span className="font-semibold text-[#0B1F3A]">{viewingReceipt.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#718096]">Method of Payment:</span>
                  <span className="font-semibold text-[#0B1F3A]">{viewingReceipt.paymentMethod}</span>
                </div>
                <div className="py-1">
                  <span className="text-[#718096] block mb-0.5">Description:</span>
                  <span className="text-[#0B1F3A] text-[11px] leading-relaxed block">{viewingReceipt.description}</span>
                </div>

                <div className="bg-red-50 p-3.5 rounded-2xl border border-red-200 flex justify-between items-center mt-3">
                  <span className="font-bold text-[#0B1F3A]">Total Amount Paid:</span>
                  <span className="font-black text-2xl text-[#E31E24]">
                    R{viewingReceipt.amount.toLocaleString()} ZAR
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-[#718096]">
                <div>
                  <div>Officer: <strong>{viewingReceipt.recordedBy}</strong></div>
                  <div>MGFC Financial Secretariat</div>
                </div>
                <div className="text-right italic font-medium">
                  Official Digital Stamp • Verified
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-[#0B1F3A] text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
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
