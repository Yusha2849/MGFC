import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatDateMMDDYYYY } from '../../utils/dateFormat';
import {
  Sparkles,
  FileText,
  Compass,
  HelpCircle,
  TrendingUp,
  Copy,
  Check,
  Send,
  Loader2,
  AlertCircle,
  Trophy,
} from 'lucide-react';

export const AiAssistantTab: React.FC = () => {
  const {
    fixtures,
    squads,
    players,
    transactions,
    meetings,
    showToast,
  } = useClub();

  const [activeModule, setActiveModule] = useState<'match-report' | 'exec-briefing' | 'tactical' | 'qa'>('match-report');
  const [loading, setLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Module 1: Match Report State
  const completedFixtures = fixtures.filter(f => f.status === 'Completed');
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(completedFixtures[0]?.id || '');
  const [customCoachQuote, setCustomCoachQuote] = useState('Our boys showed true Marlboro grit, tactical discipline, and fighting spirit.');

  // Module 2: Exec Briefing State
  const [briefingFocus, setBriefingFocus] = useState('Q4 Revenue & League Run-In');

  // Module 3: Tactical State
  const [oppTeam, setOppTeam] = useState('Sandton Celtic FC');
  const [myFormation, setMyFormation] = useState('4-3-3');
  const [oppStyle, setOppStyle] = useState('Aggressive high pressing and direct aerial balls into the box');

  // Module 4: Club QA State
  const [qaQuestion, setQaQuestion] = useState('What are the rules regarding SAFA player eligibility and player transfer clearances for mid-season?');
  const [, setChatHistory] = useState<{ q: string; a: string }[]>([]);

  const callAiService = async (type: string, data: any) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });

      const json = await res.json();
      if (json.success && json.result) {
        setGeneratedOutput(json.result);
        showToast('AI analysis generated successfully!');
        return json.result;
      } else {
        throw new Error(json.error || 'Server returned an error generating response.');
      }
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      setErrorMessage(err.message || 'Unable to connect to AI service. Please ensure server is running.');
      showToast('AI Generation failed. Check error log.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatchReport = () => {
    const fixture = fixtures.find(f => f.id === selectedFixtureId) || completedFixtures[0];
    if (!fixture) return;

    const scorers = fixture.matchEvents
      .filter(e => e.type === 'Goal')
      .map(e => `${e.player} (${e.minute}')`)
      .join(', ');

    callAiService('match-report', {
      opponent: fixture.opponent,
      competition: fixture.competition,
      date: formatDateMMDDYYYY(fixture.date),
      venue: fixture.venue,
      mgfcScore: fixture.mgfcScore ?? 3,
      oppScore: fixture.opponentScore ?? 1,
      scorers: scorers || 'Bongani Khumalo, Muhammad Akhalwaya',
      motm: fixture.playerOfTheMatch || 'Bongani Khumalo',
      coachQuote: customCoachQuote,
      notes: fixture.coachNotes || 'High intensity derby atmosphere at Alexandra Stadium',
    });
  };

  const handleGenerateExecutiveBriefing = () => {
    const totalFeesDue = players.reduce((sum, p) => sum + p.feeDue, 0);
    const totalFeesCollected = players.reduce((sum, p) => sum + p.feePaid, 0);
    const collectionRate = totalFeesDue > 0 ? Math.round((totalFeesCollected / totalFeesDue) * 100) : 0;

    callAiService('executive-briefing', {
      activePlayers: players.length,
      totalSquads: squads.length,
      collectedFees: totalFeesCollected.toLocaleString(),
      totalFeesDue: totalFeesDue.toLocaleString(),
      collectionRate,
      recentForm: 'W-W-D-W-L',
      facilityStatus: 'Pitch 1 floodlights upgraded; Pitch 2 perimeter fence quote pending.',
      upcomingFixtures: 'Senior First Team vs Sandton Celtic; U19 vs Wits Junior',
      governanceNotes: `${meetings.length} active board meetings recorded; fee recovery reminders active`,
    });
  };

  const handleGenerateTactics = () => {
    callAiService('tactical-analysis', {
      team: 'MGFC Senior First Team',
      formation: myFormation,
      opponent: oppTeam,
      context: 'SDLFA Premier League showdown',
      opponentStyle: oppStyle,
      availability: 'Key playmaker available, full strength squad.',
    });
  };

  const handleAskClubQa = async () => {
    if (!qaQuestion.trim()) return;
    const q = qaQuestion;
    const answer = await callAiService('club-qa', { question: q });
    if (answer) {
      setChatHistory(prev => [{ q, a: answer }, ...prev]);
      setQaQuestion('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    showToast('Copied output to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#E31E24] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> AI Operations & Sporting Intelligence
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-wide">
            Gemini-Powered Club Intelligence
          </h2>
          <p className="text-xs text-[#718096] mt-0.5 font-medium">
            Automated match journalism, executive committee briefings, tactical opponent scout analysis, and club knowledgebase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-[#0B1F3A] border border-slate-200 shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
            <span className="font-mono text-[11px]">gemini-3.8-flash</span>
          </span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setActiveModule('match-report');
            setGeneratedOutput('');
          }}
          className={`p-5 rounded-3xl border text-left transition-all shadow-xs ${
            activeModule === 'match-report'
              ? 'bg-white border-[#E31E24] ring-2 ring-[#E31E24]/20 shadow-md'
              : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300 text-[#718096]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-extrabold text-base text-[#0B1F3A] uppercase">1. Match Report</span>
            <FileText className="w-4 h-4 text-[#E31E24]" />
          </div>
          <p className="text-[11px] text-[#718096] font-medium leading-relaxed">
            Press release & match article generator in South African football style.
          </p>
        </button>

        <button
          onClick={() => {
            setActiveModule('exec-briefing');
            setGeneratedOutput('');
          }}
          className={`p-5 rounded-3xl border text-left transition-all shadow-xs ${
            activeModule === 'exec-briefing'
              ? 'bg-white border-[#E31E24] ring-2 ring-[#E31E24]/20 shadow-md'
              : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300 text-[#718096]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-extrabold text-base text-[#0B1F3A] uppercase">2. Exec Briefing</span>
            <TrendingUp className="w-4 h-4 text-[#0B1F3A]" />
          </div>
          <p className="text-[11px] text-[#718096] font-medium leading-relaxed">
            Executive Board operational digest, finance recovery, and resolutions.
          </p>
        </button>

        <button
          onClick={() => {
            setActiveModule('tactical');
            setGeneratedOutput('');
          }}
          className={`p-5 rounded-3xl border text-left transition-all shadow-xs ${
            activeModule === 'tactical'
              ? 'bg-white border-[#E31E24] ring-2 ring-[#E31E24]/20 shadow-md'
              : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300 text-[#718096]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-extrabold text-base text-[#0B1F3A] uppercase">3. Tactical Scout</span>
            <Compass className="w-4 h-4 text-[#E31E24]" />
          </div>
          <p className="text-[11px] text-[#718096] font-medium leading-relaxed">
            Opponent scout analysis, transition blueprints, and set-piece triggers.
          </p>
        </button>

        <button
          onClick={() => {
            setActiveModule('qa');
            setGeneratedOutput('');
          }}
          className={`p-5 rounded-3xl border text-left transition-all shadow-xs ${
            activeModule === 'qa'
              ? 'bg-white border-[#E31E24] ring-2 ring-[#E31E24]/20 shadow-md'
              : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300 text-[#718096]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-extrabold text-base text-[#0B1F3A] uppercase">4. Club Q&A</span>
            <HelpCircle className="w-4 h-4 text-[#0B1F3A]" />
          </div>
          <p className="text-[11px] text-[#718096] font-medium leading-relaxed">
            MGFC constitution, SAFA player eligibility, and club code policies.
          </p>
        </button>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Module Input Configuration Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          {activeModule === 'match-report' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                  Match Report Parameters
                </h3>
                <p className="text-[#718096] text-[11px]">Select a recorded match and enter coach perspectives.</p>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Select Completed Fixture</label>
                <select
                  value={selectedFixtureId}
                  onChange={e => setSelectedFixtureId(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2.5 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                >
                  {completedFixtures.map(f => (
                    <option key={f.id} value={f.id}>
                      MGFC {f.mgfcScore} - {f.opponentScore} {f.opponent} ({formatDateMMDDYYYY(f.date)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Head Coach Post-Match Quote</label>
                <textarea
                  rows={3}
                  value={customCoachQuote}
                  onChange={e => setCustomCoachQuote(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl p-3 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <button
                disabled={loading}
                onClick={handleGenerateMatchReport}
                className="w-full py-3 rounded-xl bg-[#E31E24] hover:bg-[#C91419] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/25 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Synthesizing Report...' : 'Draft Match Report & Release'}</span>
              </button>
            </div>
          )}

          {activeModule === 'exec-briefing' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                  Executive Committee Briefing
                </h3>
                <p className="text-[#718096] text-[11px]">
                  Scans live player counts, ZAR fee collection rates, net treasury reserves, and pending board resolutions.
                </p>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Key Strategic Theme</label>
                <input
                  type="text"
                  value={briefingFocus}
                  onChange={e => setBriefingFocus(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2.5 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <button
                disabled={loading}
                onClick={handleGenerateExecutiveBriefing}
                className="w-full py-3 rounded-xl bg-[#E31E24] hover:bg-[#C91419] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/25 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Analyzing Club Data...' : 'Compile Executive Digest'}</span>
              </button>
            </div>
          )}

          {activeModule === 'tactical' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                  Tactical Matchup Scout
                </h3>
                <p className="text-[#718096] text-[11px]">Simulates opponent formation matchup and pressing triggers.</p>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Upcoming Opponent</label>
                <input
                  type="text"
                  value={oppTeam}
                  onChange={e => setOppTeam(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2.5 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">MGFC Formation</label>
                <select
                  value={myFormation}
                  onChange={e => setMyFormation(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl px-3 py-2.5 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                >
                  <option value="4-3-3">4-3-3 Attacking Dominant</option>
                  <option value="4-2-3-1">4-2-3-1 Balanced Pivot</option>
                  <option value="4-4-2">4-4-2 Direct Twin Attack</option>
                  <option value="3-5-2">3-5-2 Wingback Overload</option>
                </select>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Opponent Tendencies</label>
                <textarea
                  rows={3}
                  value={oppStyle}
                  onChange={e => setOppStyle(e.target.value)}
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl p-3 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <button
                disabled={loading}
                onClick={handleGenerateTactics}
                className="w-full py-3 rounded-xl bg-[#E31E24] hover:bg-[#C91419] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/25 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Simulating Matchup...' : 'Generate Tactical Plan'}</span>
              </button>
            </div>
          )}

          {activeModule === 'qa' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                  Club Knowledgebase Q&A
                </h3>
                <p className="text-[#718096] text-[11px] leading-relaxed">
                  Ask any question regarding MGFC constitution, registration rules, SAFA regulations, fee waivers, or disciplinary standards.
                </p>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Your Question</label>
                <textarea
                  rows={4}
                  value={qaQuestion}
                  onChange={e => setQaQuestion(e.target.value)}
                  placeholder="e.g. Can a player transfer during the mid-season window without clearance?"
                  className="w-full bg-[#F0F4F9] border border-slate-200 rounded-xl p-3 text-[#0B1F3A] font-medium focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setQaQuestion('What is the MGFC Youth Bursary qualification criteria?')
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#F0F4F9] border border-slate-200 text-[10px] font-semibold text-[#718096] hover:text-[#0B1F3A] hover:bg-slate-200 transition-colors"
                >
                  Youth Bursary Policy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setQaQuestion('What are the official disciplinary consequences for receiving a red card in SDLFA?')
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#F0F4F9] border border-slate-200 text-[10px] font-semibold text-[#718096] hover:text-[#0B1F3A] hover:bg-slate-200 transition-colors"
                >
                  Red Card Discipline
                </button>
              </div>

              <button
                disabled={loading || !qaQuestion.trim()}
                onClick={handleAskClubQa}
                className="w-full py-3 rounded-xl bg-[#E31E24] hover:bg-[#C91419] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/25 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? 'Consulting Knowledgebase...' : 'Ask AI Operations Director'}</span>
              </button>
            </div>
          )}
        </div>

        {/* AI Output Result Terminal (7 cols) */}
        <div className="lg:col-span-7 flex flex-col p-6 rounded-3xl bg-white border border-slate-200 shadow-sm min-h-[460px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#0B1F3A] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#E31E24]" />
              <span>Intelligence Output</span>
            </div>

            {generatedOutput && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1F3A] hover:bg-[#122A4E] text-white text-xs font-bold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 py-4 overflow-y-auto">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
                <div className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                  Processing via Gemini 3.8 Flash
                </div>
                <p className="text-xs text-[#718096] max-w-xs leading-relaxed font-medium">
                  Analyzing club records, tactical structures, and South African football operational standards...
                </p>
              </div>
            ) : errorMessage ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#E31E24]">
                  <AlertCircle className="w-4 h-4" /> AI Generation Error
                </div>
                <div>{errorMessage}</div>
              </div>
            ) : generatedOutput ? (
              <div className="bg-[#F0F4F9] p-5 rounded-2xl border border-slate-200 text-xs text-[#0B1F3A] leading-relaxed font-sans whitespace-pre-wrap selection:bg-[#E31E24] selection:text-white">
                {generatedOutput}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#718096] text-xs space-y-2">
                <Trophy className="w-8 h-8 text-slate-300" />
                <div className="font-semibold text-[#0B1F3A]">Configure parameters on the left and click Generate.</div>
                <div className="text-[11px] text-[#718096]">
                  All outputs are grounded in Marlboro Gardens FC context & SAFA regulations.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
