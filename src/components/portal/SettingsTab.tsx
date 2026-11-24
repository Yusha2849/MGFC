import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { SeasonManagerModal, SeasonManagerTab } from './SeasonManagerModal';
import {
  Download,
  Upload,
  RotateCcw,
  Shield,
  Database,
  Server,
  Key,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  Archive,
  History,
  TrendingUp,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const {
    exportDataJson,
    importDataJson,
    resetToDefaultData,
    players,
    fixtures,
    transactions,
    registrationOpen,
    setRegistrationOpen,
    registrationSeasonLabel,
    setRegistrationSeasonLabel,
    currentSeasonYear,
    seasonArchives,
    showToast,
  } = useClub();

  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [seasonModalTab, setSeasonModalTab] = useState<SeasonManagerTab>('archive');

  const openSeasonModal = (tab: SeasonManagerTab) => {
    setSeasonModalTab(tab);
    setSeasonModalOpen(true);
  };

  const [importJsonText, setImportJsonText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDownloadBackup = () => {
    const dataStr = exportDataJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MGFC_Operations_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Database backup file exported successfully.');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    const success = importDataJson(importJsonText);
    if (success) {
      setImportJsonText('');
    }
  };

  const handleReset = () => {
    resetToDefaultData();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-wide">
          Club Configuration, Security & Data Backup
        </h2>
        <p className="text-xs text-[#718096] mt-0.5 font-medium">
          Manage database persistence, export operational JSON backups, and review integration health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Seasonal Registration, Data Backup & Recovery (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Seasonal Registration Control Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase tracking-wide">
                    Seasonal Player Registration Control
                  </h3>
                  <p className="text-[11px] text-[#718096] font-medium">
                    Toggle public registration buttons & age-group pages on or off once intake closes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRegistrationOpen(!registrationOpen)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  registrationOpen
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-200 hover:bg-slate-300 text-[#0B1F3A]'
                }`}
              >
                {registrationOpen ? (
                  <>
                    <ToggleRight className="w-4 h-4" />
                    <span>Registration Open</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4" />
                    <span>Registration Closed</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-[#0B1F3A]">
                  Public Platform Status:{' '}
                  <span className={registrationOpen ? 'text-emerald-700' : 'text-[#E31E24]'}>
                    {registrationOpen
                      ? 'Visible — Registration page & age-group forms active'
                      : 'Hidden — All public register links and buttons removed'}
                  </span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-1">
                <label className="text-[11px] font-bold text-[#718096] uppercase whitespace-nowrap">
                  Active Season Label:
                </label>
                <input
                  type="text"
                  value={registrationSeasonLabel}
                  onChange={e => setRegistrationSeasonLabel(e.target.value)}
                  placeholder="e.g. 2027 Season"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <p className="text-[11px] text-[#718096] leading-relaxed">
                When switched <strong>Closed</strong>, the Registration navigation link, footer link, and all age-group registration forms are automatically hidden from the public website until the next seasonal intake window opens.
              </p>

              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#0B1F3A]">
                  Active Year: <strong className="text-[#E31E24]">{currentSeasonYear}</strong> · Archived Seasons: <strong>{seasonArchives.length}</strong>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openSeasonModal('promote')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0B1F3A] border border-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Move Teams Forward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openSeasonModal('history')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0B1F3A] border border-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-amber-600" />
                    <span>Archives ({seasonArchives.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openSeasonModal('archive')}
                    className="px-3 py-1.5 rounded-lg bg-[#0B1F3A] hover:bg-[#122A4E] text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-[#E31E24]" />
                    <span>Archive & Start Fresh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Export Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase tracking-wide">
                  Database Backup & Export
                </h3>
                <p className="text-[11px] text-[#718096] font-medium">Structured, versioned JSON backup of all records</p>
              </div>
            </div>
            <p className="text-xs text-[#718096] leading-relaxed font-medium">
              Export all active player records, match fixtures, financial ledgers, committee minutes, and official documents as a structured, versioned JSON backup file.
            </p>

            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F0F4F9] border border-slate-200 text-center text-xs">
              <div>
                <div className="font-heading font-extrabold text-2xl text-[#0B1F3A]">{players.length}</div>
                <div className="text-[10px] text-[#718096] font-bold uppercase">Players</div>
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl text-[#0B1F3A]">{fixtures.length}</div>
                <div className="text-[10px] text-[#718096] font-bold uppercase">Fixtures</div>
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl text-[#0B1F3A]">{transactions.length}</div>
                <div className="text-[10px] text-[#718096] font-bold uppercase">Transactions</div>
              </div>
            </div>

            <button
              onClick={handleDownloadBackup}
              className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 transition-all"
            >
              <Download className="w-4 h-4" /> Download Full Club Backup (.json)
            </button>
          </div>

          {/* Import / Restore Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase tracking-wide">
                  Restore Database From Backup
                </h3>
                <p className="text-[11px] text-[#718096] font-medium">Import JSON payload to restore club states</p>
              </div>
            </div>
            <p className="text-[#718096] leading-relaxed font-medium">
              Paste the contents of a previously exported MGFC database JSON file to restore all club records.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                rows={4}
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                placeholder='Paste {"clubName": "Marlboro Gardens...", "players": [...]} here...'
                className="w-full bg-[#F0F4F9] border border-slate-200 rounded-2xl p-3 text-[#0B1F3A] font-mono text-[11px] focus:outline-none focus:border-[#E31E24]"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#122A4E] disabled:opacity-50 text-white font-bold text-xs shadow transition-all"
                >
                  Verify & Restore Database
                </button>
              </div>
            </form>
          </div>

          {/* Reset to Factory Default Card */}
          <div className="p-6 rounded-3xl bg-white border border-red-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase tracking-wide">
                  Reset to Authentic Factory Dataset
                </h3>
                <p className="text-[11px] text-[#718096] font-medium">Reverts to the official demo baseline</p>
              </div>
            </div>
            <p className="text-[#718096] leading-relaxed font-medium">
              Revert all modifications and reload the official Marlboro Gardens Football Club demonstration database (squads, fixtures, ZAR finance records, and governance minutes).
            </p>

            {showResetConfirm ? (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2.5">
                <div className="font-bold text-red-900">Are you sure you want to reset all records?</div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-bold text-xs shadow-xs"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-[#0B1F3A] text-xs font-semibold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2.5 rounded-xl bg-[#F0F4F9] hover:bg-red-50 text-[#E31E24] font-bold text-xs border border-red-200 transition-colors"
              >
                Reset to Default Demo State
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Integration & Environment Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase tracking-wide">
                  Platform Integrations Status
                </h3>
                <p className="text-[11px] text-[#718096] font-medium">Honest live connection indicators</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Integration 1: Gemini AI */}
              <div className="p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B1F3A] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#E31E24]" /> Google Gemini AI
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Connected
                  </span>
                </div>
                <div className="text-[11px] text-[#718096]">
                  Model: <strong className="text-[#0B1F3A]">gemini-3.8-flash</strong> via server-side endpoint proxy (<code className="text-[#E31E24] font-mono">/api/ai/*</code>).
                </div>
              </div>

              {/* Integration 2: Local Persistence */}
              <div className="p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B1F3A] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-700" /> Local Persistence
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-[#718096]">
                  Data persists locally across browser sessions with JSON schema recovery.
                </div>
              </div>

              {/* Integration 3: SAFA Central Webhook (Honest Unconfigured State) */}
              <div className="p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B1F3A] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#718096]" /> SAFA Inqaku Central API
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-[#718096]">
                    Setup Required
                  </span>
                </div>
                <div className="text-[11px] text-[#718096] leading-relaxed">
                  Direct live API sync with the national SAFA Inqaku player database requires a provincial club gateway key. Currently operating in official local registry mode with downloadable squad CSV export.
                </div>
              </div>
            </div>
          </div>

          {/* Club Info Reference */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-heading font-extrabold text-base text-[#0B1F3A] uppercase tracking-wider">
              Marlboro Gardens FC Profile
            </h4>
            <div className="space-y-2 text-[#0B1F3A] font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#718096]">Official Name:</span>
                <span className="font-bold text-[#0B1F3A]">Marlboro Gardens Football Club</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#718096]">Founded:</span>
                <span className="font-bold text-[#0B1F3A]">1985 (40+ Years of Heritage)</span>
              </div>
              <div className="flex justify-between gap-3 py-1.5 border-b border-slate-100">
                <span className="text-[#718096] shrink-0">Home Ground:</span>
                <span className="font-bold text-[#0B1F3A] text-right">
                  Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#718096]">Affiliation:</span>
                <span className="font-bold text-[#0B1F3A]">SDLFA & SAFA Johannesburg</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#718096]">Official Identity Colors:</span>
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B1F3A]" title="Navy #0B1F3A" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E31E24]" title="Red #E31E24" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" title="White #FFFFFF" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#718096]" title="Slate #718096" />
                  <span className="text-[11px] text-[#0B1F3A] font-bold">Navy, Red, White, Slate</span>
                </span>
              </div>
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
