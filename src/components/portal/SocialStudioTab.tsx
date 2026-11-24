import React, { useState, useEffect, useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import { formatDateMMDDYYYY } from '../../utils/dateFormat';
import {
  Fixture,
  SocialMediaPost,
  SocialPosterTemplate,
  SocialPosterTheme,
} from '../../types';
import {
  renderPosterPngDataUrl,
  downloadDataUrlAsPng,
  groupFixturesByDate,
  getPosterSquadCode,
} from '../../utils/posterGenerator';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Loader2,
  Trash2,
  ArrowRight,
  History,
  Image as ImageIcon,
  Minus,
  Plus,
} from 'lucide-react';

type StudioTab = 'poster' | 'archive';

interface HeaderSizeOption {
  id: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  label: string;
  scale: number;
  subClass: string;
  mainClass: string;
}

const HEADER_SIZE_OPTIONS: HeaderSizeOption[] = [
  {
    id: 'sm',
    label: 'Small',
    scale: 0.85,
    subClass: 'text-lg sm:text-[21px]',
    mainClass: 'text-4xl sm:text-[46px]',
  },
  {
    id: 'md',
    label: 'Normal',
    scale: 1,
    subClass: 'text-2xl sm:text-[26px]',
    mainClass: 'text-5xl sm:text-[56px]',
  },
  {
    id: 'lg',
    label: 'Large',
    scale: 1.15,
    subClass: 'text-[26px] sm:text-[30px]',
    mainClass: 'text-[54px] sm:text-[64px]',
  },
  {
    id: 'xl',
    label: 'XL',
    scale: 1.3,
    subClass: 'text-[28px] sm:text-[34px]',
    mainClass: 'text-[60px] sm:text-[72px]',
  },
  {
    id: '2xl',
    label: 'Max',
    scale: 1.45,
    subClass: 'text-[31px] sm:text-[38px]',
    mainClass: 'text-[66px] sm:text-[80px]',
  },
];

const DEFAULT_HOME_VENUE = 'Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens';

const TEMPLATE_OPTIONS: Array<{ value: SocialPosterTemplate; label: string; hint: string }> = [
  { value: 'Weekly Fixtures Slate', label: 'Weekend Fixtures', hint: 'All upcoming teams' },
  { value: 'Matchday', label: 'Single Match', hint: 'One team fixture' },
  { value: 'Weekend Results Slate', label: 'Weekend Results', hint: 'All weekend scores' },
  { value: 'Full Time', label: 'Single Result', hint: 'One match score' },
];

export const SocialStudioTab: React.FC = () => {
  const {
    fixtures,
    squads,
    currentSeasonYear,
    socialPosts,
    socialStudioIntent,
    clearSocialStudioIntent,
    markFixturePosterGenerated,
    deleteSocialPost,
    setActiveView,
    showToast,
  } = useClub();

  const upcomingFixtures = useMemo(
    () => fixtures.filter(f => f.status !== 'Completed'),
    [fixtures]
  );
  const completedFixtures = useMemo(
    () => fixtures.filter(f => f.status === 'Completed'),
    [fixtures]
  );

  const [studioTab, setStudioTab] = useState<StudioTab>('poster');

  // Poster state
  const [postType, setPostType] = useState<SocialPosterTemplate>('Weekly Fixtures Slate');
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(
    upcomingFixtures[0]?.id || fixtures[0]?.id || ''
  );
  // Select ALL upcoming fixtures by default (never capped!)
  const [selectedSlateIds, setSelectedSlateIds] = useState<string[]>(() =>
    upcomingFixtures.length > 0
      ? upcomingFixtures.map(f => f.id)
      : fixtures.map(f => f.id)
  );
  const [customHeadline, setCustomHeadline] = useState('FIXTURES');
  const [subText, setSubText] = useState("THIS WEEKEND'S");
  const [headerSizeIdx, setHeaderSizeIdx] = useState<number>(HEADER_SIZE_OPTIONS.length - 1);
  const [themeColor, setThemeColor] = useState<SocialPosterTheme>('navy-red');
  const [exportingPng, setExportingPng] = useState(false);

  const activeHeaderSize =
    HEADER_SIZE_OPTIONS[headerSizeIdx] || HEADER_SIZE_OPTIONS[HEADER_SIZE_OPTIONS.length - 1];

  // Caption copy / AI caption
  const [aiCaption, setAiCaption] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Clean squad labels
  const getShortSquad = (squadId: string) => getPosterSquadCode(squadId);

  const getFullSquadLabel = (squadId: string) => {
    const match = /^u(\d+)$/i.exec(squadId.trim());
    if (match) return `Under ${match[1]} (U${match[1]})`;
    if (squadId === 'community') return 'Senior';
    const sq = squads.find(s => s.id === squadId);
    if (sq) {
      return sq.name
        .replace(/\b(Grassroots|Juniors|Stars|Academy|Colts|Lions|Transition|Development)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    return squadId.toUpperCase();
  };

  // Automatically include newly added fixtures in the active slate pool so preview always shows all fixtures
  const slatePool: Fixture[] = useMemo(() => {
    if (postType === 'Weekly Fixtures Slate') return upcomingFixtures;
    if (postType === 'Weekend Results Slate') return completedFixtures;
    return fixtures;
  }, [postType, upcomingFixtures, completedFixtures, fixtures]);

  // Track known fixture IDs so any newly added fixture automatically gets checked for preview
  const [knownFixtureIds, setKnownFixtureIds] = useState<string[]>(() => fixtures.map(f => f.id));
  useEffect(() => {
    const currentIds = fixtures.map(f => f.id);
    const newlyAdded = currentIds.filter(id => !knownFixtureIds.includes(id));
    if (newlyAdded.length > 0) {
      setSelectedSlateIds(prev => Array.from(new Set([...prev, ...newlyAdded])));
      setKnownFixtureIds(currentIds);
    } else if (currentIds.length !== knownFixtureIds.length) {
      setKnownFixtureIds(currentIds);
    }
  }, [fixtures, knownFixtureIds]);

  // Handle deep-links from Dashboard or Fixtures page
  useEffect(() => {
    if (!socialStudioIntent) return;

    setStudioTab(socialStudioIntent.openSection === 'archive' ? 'archive' : 'poster');

    const template = socialStudioIntent.template;
    if (template) {
      setPostType(template);
      if (template === 'Weekly Fixtures Slate') {
        setSubText("THIS WEEKEND'S");
        setCustomHeadline('FIXTURES');
        const ids =
          socialStudioIntent.fixtureIds && socialStudioIntent.fixtureIds.length > 0
            ? socialStudioIntent.fixtureIds
            : upcomingFixtures.map(f => f.id);
        setSelectedSlateIds(ids);
      } else if (template === 'Weekend Results Slate') {
        setSubText("THIS WEEKEND'S");
        setCustomHeadline('RESULTS');
        const ids =
          socialStudioIntent.fixtureIds && socialStudioIntent.fixtureIds.length > 0
            ? socialStudioIntent.fixtureIds
            : completedFixtures.map(f => f.id);
        setSelectedSlateIds(ids);
      } else if (template === 'Full Time') {
        setSubText('FULL-TIME');
        setCustomHeadline('RESULT');
      } else if (template === 'Matchday') {
        setSubText('MARLBORO GARDENS FC');
        setCustomHeadline('MATCHDAY');
      }
    }

    if (socialStudioIntent.fixtureId) {
      setSelectedFixtureId(socialStudioIntent.fixtureId);
      const target = fixtures.find(f => f.id === socialStudioIntent.fixtureId);
      if (target && template === 'Matchday') {
        setSubText(getFullSquadLabel(target.squadId).toUpperCase());
      }
    }

    clearSocialStudioIntent();
  }, [socialStudioIntent]);

  const isSlateTemplate =
    postType === 'Weekly Fixtures Slate' || postType === 'Weekend Results Slate';
  const isResultsTemplate =
    postType === 'Weekend Results Slate' || postType === 'Full Time';

  const handleSelectTemplate = (next: SocialPosterTemplate) => {
    setPostType(next);
    setAiCaption(null);

    if (next === 'Weekly Fixtures Slate') {
      setSubText("THIS WEEKEND'S");
      setCustomHeadline('FIXTURES');
      setSelectedSlateIds(upcomingFixtures.map(f => f.id));
    } else if (next === 'Weekend Results Slate') {
      setSubText("THIS WEEKEND'S");
      setCustomHeadline('RESULTS');
      setSelectedSlateIds(completedFixtures.map(f => f.id));
    } else if (next === 'Matchday') {
      const target = upcomingFixtures[0] || fixtures[0];
      if (target) setSelectedFixtureId(target.id);
      setSubText('MARLBORO GARDENS FC');
      setCustomHeadline('MATCHDAY');
    } else {
      const target = completedFixtures[0] || fixtures[0];
      if (target) setSelectedFixtureId(target.id);
      setSubText('FULL-TIME');
      setCustomHeadline('RESULT');
    }
  };

  const activeFixture = useMemo(
    () => fixtures.find(f => f.id === selectedFixtureId) || fixtures[0],
    [fixtures, selectedFixtureId]
  );

  // Show ALL selected fixtures (if none manually selected, show ALL fixtures in pool — never sliced)
  const activeSlateFixtures: Fixture[] = useMemo(() => {
    const selected = slatePool.filter(f => selectedSlateIds.includes(f.id));
    return selected.length > 0 ? selected : slatePool;
  }, [slatePool, selectedSlateIds]);

  const posterFixturesToDisplay: Fixture[] = useMemo(() => {
    if (isSlateTemplate) return activeSlateFixtures;
    return activeFixture ? [activeFixture] : [];
  }, [isSlateTemplate, activeSlateFixtures, activeFixture]);

  const groupedPosterFixtures = useMemo(
    () => groupFixturesByDate(posterFixturesToDisplay, squads),
    [posterFixturesToDisplay, squads]
  );

  const toggleSlateFixture = (fixtureId: string) => {
    setSelectedSlateIds(prev =>
      prev.includes(fixtureId) ? prev.filter(id => id !== fixtureId) : [...prev, fixtureId]
    );
  };

  const buildShareText = () => {
    if (postType === 'Weekly Fixtures Slate') {
      const sections = groupedPosterFixtures.map(group => {
        const lines = group.fixtures.map(
          f =>
            `• ${getShortSquad(f.squadId)} | ${f.kickoffTime} (${f.isHome ? 'HOME' : 'AWAY'}) | ${
              f.isHome ? 'MGFC' : f.opponent
            } vs ${f.isHome ? f.opponent : 'MGFC'}`
        );
        return `${group.bannerLabel}\n${lines.join('\n')}`;
      });
      return `${subText} ${customHeadline}\n\n${sections.join('\n\n')}\n\n#MGFC #StarsOfSandton`;
    }
    if (postType === 'Weekend Results Slate') {
      const sections = groupedPosterFixtures.map(group => {
        const lines = group.fixtures.map(f => {
          const leftTeam = f.isHome ? 'MGFC' : f.opponent;
          const rightTeam = f.isHome ? f.opponent : 'MGFC';
          const leftScore = f.isHome ? f.mgfcScore ?? 0 : f.opponentScore ?? 0;
          const rightScore = f.isHome ? f.opponentScore ?? 0 : f.mgfcScore ?? 0;
          return `• ${getShortSquad(f.squadId)} | ${leftTeam} ${leftScore} - ${rightScore} ${rightTeam}`;
        });
        return `${group.bannerLabel}\n${lines.join('\n')}`;
      });
      return `${subText} ${customHeadline}\n\n${sections.join('\n\n')}\n\n#MGFC #StarsOfSandton`;
    }
    if (postType === 'Full Time' && activeFixture) {
      return `FULL TIME: Marlboro Gardens FC ${activeFixture.mgfcScore ?? 0} - ${
        activeFixture.opponentScore ?? 0
      } ${activeFixture.opponent} (${getShortSquad(activeFixture.squadId)} · ${formatDateMMDDYYYY(
        activeFixture.date
      )}). #MGFC #StarsOfSandton`;
    }
    return `${subText} ${customHeadline}. ${
      activeFixture
        ? `${getShortSquad(activeFixture.squadId)} · ${
            activeFixture.isHome ? 'MGFC' : activeFixture.opponent
          } vs ${activeFixture.isHome ? activeFixture.opponent : 'MGFC'} (${formatDateMMDDYYYY(
            activeFixture.date
          )} ${activeFixture.kickoffTime})`
        : ''
    } #MGFC #StarsOfSandton`;
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied text! Ready to paste on WhatsApp or social media.');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateAiCaption = async () => {
    setLoadingAi(true);
    try {
      const details = isSlateTemplate
        ? buildShareText()
        : `MGFC (${getShortSquad(activeFixture?.squadId || 'u12')}) vs ${
            activeFixture?.opponent || 'Opponent'
          } on ${activeFixture?.date ? formatDateMMDDYYYY(activeFixture.date) : 'Saturday'} at ${
            activeFixture?.venue || DEFAULT_HOME_VENUE
          }. Score: ${activeFixture?.mgfcScore ?? 0} - ${activeFixture?.opponentScore ?? 0}`;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'social-caption',
          data: { postType, headline: `${subText} ${customHeadline}`, details },
        }),
      });
      const json = await res.json();
      if (json.success && json.result) {
        setAiCaption(json.result);
        showToast('Caption drafted!');
      } else {
        throw new Error(json.error || 'Could not draft caption');
      }
    } catch (e: any) {
      showToast(e.message || 'Could not draft caption', 'error');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleDownloadPoster = async () => {
    setExportingPng(true);
    try {
      const linkedIds = isSlateTemplate
        ? activeSlateFixtures.map(f => f.id)
        : activeFixture
        ? [activeFixture.id]
        : [];

      const kind: 'fixture' | 'result' = isResultsTemplate ? 'result' : 'fixture';

      const dataUrl = await renderPosterPngDataUrl({
        template: postType,
        headline: customHeadline,
        subText,
        themeColor,
        activeFixture,
        slateFixtures: activeSlateFixtures,
        squads,
        seasonYear: currentSeasonYear,
        headerFontScale: activeHeaderSize.scale,
      });

      const safeSlug = `${subText}-${customHeadline}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 32);
      const dateTag = activeFixture?.date || new Date().toISOString().split('T')[0];
      downloadDataUrlAsPng(dataUrl, `MGFC_${safeSlug}_${dateTag}.png`);

      markFixturePosterGenerated(linkedIds, kind, {
        type: postType,
        title: `${subText} ${customHeadline}`.trim(),
        subHeadline: subText,
        content: aiCaption || buildShareText(),
        hashtags: ['#MGFC', '#StarsOfSandton'],
        fixtureId: activeFixture?.id,
        fixtureIds: linkedIds,
        themeColor,
        status: 'Published',
        channel: 'WhatsApp Broadcast',
      });

      showToast(`Downloaded "${subText} ${customHeadline}" poster and saved to archive.`);
    } catch (err: any) {
      showToast(err?.message || 'Unable to download poster', 'error');
    } finally {
      setExportingPng(false);
    }
  };

  const isSupportedTemplate = (t: SocialMediaPost['type']): t is SocialPosterTemplate =>
    t === 'Weekly Fixtures Slate' ||
    t === 'Matchday' ||
    t === 'Weekend Results Slate' ||
    t === 'Full Time';

  const handleRedownloadArchived = async (post: SocialMediaPost) => {
    const resolved: SocialPosterTemplate = isSupportedTemplate(post.type) ? post.type : 'Matchday';
    const targetFix = fixtures.find(f => f.id === post.fixtureId);
    const slateList =
      post.fixtureIds && post.fixtureIds.length > 0
        ? fixtures.filter(f => post.fixtureIds!.includes(f.id))
        : targetFix
        ? [targetFix]
        : [];
    const dataUrl = await renderPosterPngDataUrl({
      template: resolved,
      headline: post.title,
      subText: post.subHeadline || "THIS WEEKEND'S",
      themeColor: post.themeColor || 'navy-red',
      activeFixture: targetFix,
      slateFixtures: slateList,
      squads,
      seasonYear: currentSeasonYear,
    });
    downloadDataUrlAsPng(dataUrl, `MGFC_${post.title.replace(/\s+/g, '_')}.png`);
    showToast('Downloaded poster PNG.');
  };

  const isLightTheme = themeColor === 'white-clean';
  const isSlateTheme = themeColor === 'slate-navy';

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* 1. Simple Top Header & 3-Tab Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1F3A] tracking-tight">
              Social Posters
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Create matchday and results posters to share on WhatsApp, Instagram, and Facebook.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('fixtures')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] text-sm font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
          >
            <span>Fixtures &amp; Results</span>
            <ArrowRight className="w-4 h-4 text-[#E31E24]" />
          </button>
        </div>

        {/* Clean 2-Tab Bar */}
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-sm">
          <button
            type="button"
            onClick={() => setStudioTab('poster')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              studioTab === 'poster'
                ? 'bg-[#0B1F3A] text-white'
                : 'text-slate-600 hover:text-[#0B1F3A]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Make a Poster</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioTab('archive')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              studioTab === 'archive'
                ? 'bg-[#0B1F3A] text-white'
                : 'text-slate-600 hover:text-[#0B1F3A]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Saved Posters ({socialPosts.length})</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: MAKE A POSTER (EASY CONTROLS + LIVE PREVIEW)
         ===================================================================== */}
      {studioTab === 'poster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Controls (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 text-sm">
            {/* Step 1: Poster Type */}
            <div className="space-y-2">
              <label className="block font-bold text-[#0B1F3A]">1. Choose Poster Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectTemplate(opt.value)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      postType === opt.value
                        ? 'bg-[#E31E24] text-white border-[#E31E24]'
                        : 'bg-slate-50 border-slate-200 text-[#0B1F3A] hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        postType === opt.value ? 'text-red-100' : 'text-slate-500'
                      }`}
                    >
                      {opt.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Pick Matches */}
            <div className="space-y-2">
              {isSlateTemplate ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-bold text-[#0B1F3A]">
                      2. Pick Matches ({activeSlateFixtures.length} of {slatePool.length})
                    </label>
                    {slatePool.length > 0 && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedSlateIds(slatePool.map(f => f.id))}
                          className="text-xs font-bold text-[#E31E24] hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                      </div>
                    )}
                  </div>

                  {slatePool.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                      <p>
                        {postType === 'Weekly Fixtures Slate'
                          ? 'No upcoming matches added yet.'
                          : 'No completed scores saved yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveView('fixtures')}
                        className="px-3 py-1.5 rounded-lg bg-[#0B1F3A] text-white font-bold cursor-pointer"
                      >
                        Go to Fixtures &amp; Results
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-xl">
                      {slatePool.map(f => {
                        const checked = selectedSlateIds.includes(f.id);
                        return (
                          <label
                            key={f.id}
                            className={`flex items-center justify-between gap-2 px-3 py-2.5 text-xs cursor-pointer ${
                              checked ? 'bg-red-50/40 text-[#0B1F3A]' : 'bg-white text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSlateFixture(f.id)}
                                className="accent-[#E31E24] w-4 h-4 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-[#0B1F3A] truncate">
                                  {getShortSquad(f.squadId)}: {f.isHome ? 'MGFC' : f.opponent} vs{' '}
                                  {f.isHome ? f.opponent : 'MGFC'}
                                </div>
                                <div className="text-[11px] text-slate-500 tabular-nums">
                                  {formatDateMMDDYYYY(f.date)} · {f.kickoffTime} ·{' '}
                                  {f.isHome ? 'Home' : 'Away'}
                                </div>
                              </div>
                            </div>
                            <span className="font-bold text-[#E31E24] tabular-nums shrink-0">
                              {f.status === 'Completed'
                                ? `${f.mgfcScore ?? 0}–${f.opponentScore ?? 0}`
                                : f.kickoffTime}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label className="block font-bold text-[#0B1F3A]">2. Choose Match</label>
                  <select
                    value={selectedFixtureId}
                    onChange={e => setSelectedFixtureId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                  >
                    {fixtures.map(f => (
                      <option key={f.id} value={f.id}>
                        {getShortSquad(f.squadId)} · {f.isHome ? 'MGFC' : f.opponent} vs{' '}
                        {f.isHome ? f.opponent : 'MGFC'} ({formatDateMMDDYYYY(f.date)})
                        {f.status === 'Completed' ? ` — ${f.mgfcScore ?? 0}–${f.opponentScore ?? 0}` : ''}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {/* Step 3: Heading & Colour */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <label className="block font-bold text-[#0B1F3A]">3. Poster Text &amp; Colour</label>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Top Line (White)
                </label>
                <input
                  type="text"
                  value={subText}
                  onChange={e => setSubText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Main Title (Gold)
                </label>
                <input
                  type="text"
                  value={customHeadline}
                  onChange={e => setCustomHeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Header Font Size
                  </label>
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setHeaderSizeIdx(i => Math.max(0, i - 1))}
                      disabled={headerSizeIdx === 0}
                      aria-label="Decrease header font size"
                      className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-[#0B1F3A] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="min-w-[54px] text-center text-xs font-bold text-[#0B1F3A]">
                      {activeHeaderSize.label}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setHeaderSizeIdx(i => Math.min(HEADER_SIZE_OPTIONS.length - 1, i + 1))
                      }
                      disabled={headerSizeIdx === HEADER_SIZE_OPTIONS.length - 1}
                      aria-label="Increase header font size"
                      className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-[#0B1F3A] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-xs">
                  {HEADER_SIZE_OPTIONS.map((opt, idx) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setHeaderSizeIdx(idx)}
                      className={`py-2 rounded-xl border font-bold transition-colors cursor-pointer ${
                        headerSizeIdx === idx
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Poster Colour</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(
                    [
                      { id: 'navy-red', label: 'Navy & Gold' },
                      { id: 'white-clean', label: 'Clean White' },
                      { id: 'slate-navy', label: 'Dark Slate' },
                    ] as Array<{ id: SocialPosterTheme; label: string }>
                  ).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setThemeColor(opt.id)}
                      className={`py-2 rounded-xl border font-bold transition-colors cursor-pointer ${
                        themeColor === opt.id
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Poster Preview & Download (7 cols) — Matches Attached Poster Format */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
            {/* Portrait Dynamic-Height Poster Preview (Shows ALL fixtures without clipping) */}
            <div
              className={`w-full max-w-[460px] mx-auto rounded-2xl overflow-hidden shadow-xl select-none relative ${
                isLightTheme
                  ? 'bg-[#F8FAFC] text-[#0B1F3A] border border-slate-300'
                  : isSlateTheme
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#06183D] text-white'
              }`}
            >
              {/* TOP ATHLETIC HEADER */}
              <div
                className={`relative px-5 pt-5 pb-4 overflow-hidden ${
                  isLightTheme
                    ? 'bg-gradient-to-b from-white to-[#F8FAFC]'
                    : isSlateTheme
                    ? 'bg-gradient-to-b from-[#1E293B] to-[#0F172A]'
                    : 'bg-gradient-to-b from-[#092356] to-[#06183D]'
                }`}
              >
                {/* Diagonal Red & White Slash Accents (matching reference poster) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-6 left-[34%] w-3 h-32 rotate-[42deg] bg-[#D92027]/80"
                />
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-5 left-[38%] w-2.5 h-32 rotate-[42deg] ${
                    isLightTheme ? 'bg-[#0B1F3A]/15' : 'bg-white/85'
                  }`}
                />

                {/* Headline Left + MGFC Crest Right */}
                <div className="relative z-10 flex items-center justify-between gap-2.5 pt-2">
                  <div className="min-w-0 flex-1 -rotate-2 origin-left py-1">
                    <div
                      className={`font-heading font-black uppercase tracking-tight leading-none break-words transition-all ${
                        activeHeaderSize.subClass
                      } ${isLightTheme ? 'text-[#0B1F3A]' : 'text-white'}`}
                    >
                      {subText || "THIS WEEKEND'S"}
                    </div>
                    <div
                      className={`font-heading font-black uppercase tracking-tight leading-[0.92] text-[#E5A922] mt-0.5 break-words transition-all ${activeHeaderSize.mainClass}`}
                    >
                      {customHeadline || 'FIXTURES'}
                    </div>
                  </div>

                  <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                    <img
                      src="/assets/mgfc-logo.png"
                      alt="Marlboro Gardens FC Crest"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                </div>

                {/* Crimson Star Divider Streak */}
                <div className="relative z-10 mt-3 flex items-center gap-2 pr-14">
                  <div
                    className={`h-[2px] flex-1 rounded-full ${
                      isLightTheme ? 'bg-[#0B1F3A]/40' : 'bg-white/80'
                    }`}
                  />
                  <span className="text-[#D92027] text-sm leading-none" aria-hidden="true">
                    ★
                  </span>
                  <div className="h-[2px] flex-1 rounded-full bg-[#D92027]" />
                </div>
              </div>

              {/* BODY: DATE-GROUPED GOLD RIBBONS + BORDERED FIXTURE BARS (ALL FIXTURES, NO CLUB LOGOS) */}
              <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4">
                {groupedPosterFixtures.length === 0 ? (
                  <div
                    className={`rounded-xl border-2 px-4 py-8 text-center text-xs font-semibold ${
                      isLightTheme
                        ? 'border-[#0B1F3A]/30 text-slate-500 bg-white'
                        : 'border-white/40 text-slate-300 bg-white/5'
                    }`}
                  >
                    {isResultsTemplate
                      ? 'No completed scores selected yet.'
                      : 'No fixtures selected yet.'}
                  </div>
                ) : (
                  groupedPosterFixtures.map(group => (
                    <div key={group.dateKey} className="space-y-2.5">
                      {/* Gold Swallowtail Ribbon Date Banner */}
                      <div className="flex justify-center">
                        <div
                          className="relative px-7 py-1.5 bg-[#E5A922] text-white font-heading font-black text-xs sm:text-sm uppercase tracking-wider text-center tabular-nums"
                          style={{
                            clipPath:
                              'polygon(0% 0%, 100% 0%, calc(100% - 10px) 50%, 100% 100%, 0% 100%, 10px 50%)',
                          }}
                        >
                          {group.bannerLabel}
                        </div>
                      </div>

                      {/* Fixture Rows (ALL fixtures in group — never truncated, zero opponent logos) */}
                      <div className="space-y-2">
                        {group.fixtures.map(fix => {
                          const sqCode = getShortSquad(fix.squadId);
                          const homeTeam = (fix.isHome ? 'MGFC' : fix.opponent).toUpperCase();
                          const awayTeam = (fix.isHome ? fix.opponent : 'MGFC').toUpperCase();
                          const homeScore = fix.isHome ? fix.mgfcScore ?? 0 : fix.opponentScore ?? 0;
                          const awayScore = fix.isHome ? fix.opponentScore ?? 0 : fix.mgfcScore ?? 0;

                          return (
                            <div key={fix.id} className="space-y-1.5">
                              <div
                                className={`rounded-xl border-[1.5px] px-2.5 py-2.5 flex items-center ${
                                  isLightTheme
                                    ? 'bg-white border-[#0B1F3A] text-[#0B1F3A]'
                                    : isSlateTheme
                                    ? 'bg-[#131E33] border-white/90 text-white'
                                    : 'bg-[#06183D] border-white/90 text-white'
                                }`}
                              >
                                {/* Col 1: Age Group (Gold) */}
                                <div
                                  className={`w-12 sm:w-14 shrink-0 text-center font-heading font-black text-base sm:text-lg leading-none ${
                                    isLightTheme ? 'text-[#C68B0A]' : 'text-[#E8B238]'
                                  }`}
                                >
                                  {sqCode}
                                </div>

                                {/* Vertical Divider */}
                                <div
                                  className={`w-px h-7 shrink-0 ${
                                    isLightTheme ? 'bg-[#0B1F3A]/30' : 'bg-white/60'
                                  }`}
                                />

                                {/* Col 2: Kickoff Time + HOME/AWAY (or FT) */}
                                <div className="w-14 sm:w-16 shrink-0 text-center leading-tight px-1">
                                  <div className="text-xs sm:text-[13px] font-extrabold tabular-nums">
                                    {isResultsTemplate ? 'FT' : fix.kickoffTime || 'TBA'}
                                  </div>
                                  <div
                                    className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                                      isLightTheme ? 'text-slate-500' : 'text-slate-300'
                                    }`}
                                  >
                                    {fix.isHome ? 'HOME' : 'AWAY'}
                                  </div>
                                </div>

                                {/* Vertical Divider */}
                                <div
                                  className={`w-px h-7 shrink-0 ${
                                    isLightTheme ? 'bg-[#0B1F3A]/30' : 'bg-white/60'
                                  }`}
                                />

                                {/* Col 3: Home Team  VS/SCORE  Away Team (Clean typography, no club logos) */}
                                <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 pl-2 pr-1">
                                  <div className="text-center font-extrabold text-[11px] sm:text-xs uppercase leading-tight break-words">
                                    {homeTeam}
                                  </div>
                                  <div
                                    className={`font-heading font-black text-sm sm:text-base tabular-nums px-1 ${
                                      isLightTheme ? 'text-[#C68B0A]' : 'text-[#E8B238]'
                                    }`}
                                  >
                                    {isResultsTemplate ? `${homeScore} - ${awayScore}` : 'VS'}
                                  </div>
                                  <div className="text-center font-extrabold text-[11px] sm:text-xs uppercase leading-tight break-words">
                                    {awayTeam}
                                  </div>
                                </div>
                              </div>

                              {/* Single match extra venue & competition line */}
                              {!isSlateTemplate && (
                                <div className="text-center pt-1 space-y-0.5">
                                  <div
                                    className={`text-[11px] font-semibold ${
                                      isLightTheme ? 'text-slate-600' : 'text-slate-300'
                                    }`}
                                  >
                                    {fix.venue || DEFAULT_HOME_VENUE}
                                  </div>
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#E5A922]">
                                    {fix.competition} · {formatDateMMDDYYYY(fix.date)}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}

                {/* Subtle Club Footer */}
                <div
                  className={`pt-2 text-center text-[9px] font-bold uppercase tracking-widest ${
                    isLightTheme ? 'text-slate-400' : 'text-white/55'
                  }`}
                >
                  Marlboro Gardens Football Club · Est. 1985 · {currentSeasonYear}
                </div>
              </div>
            </div>

            {/* Primary Download & Copy Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                disabled={exportingPng}
                onClick={handleDownloadPoster}
                className="px-5 py-3 rounded-xl bg-[#E31E24] hover:bg-[#C91419] disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                {exportingPng ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{exportingPng ? 'Preparing Poster...' : 'Download Poster (PNG)'}</span>
              </button>

              <button
                type="button"
                onClick={() => copyText(buildShareText(), 'quick')}
                className="px-4 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-white text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                {copiedKey === 'quick' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedKey === 'quick' ? 'Copied!' : 'Copy Share Text'}</span>
              </button>

              <button
                type="button"
                disabled={loadingAi}
                onClick={handleGenerateAiCaption}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-[#0B1F3A] text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                {loadingAi ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#E31E24]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#E31E24]" />
                )}
                <span>{loadingAi ? 'Writing...' : 'Write Caption'}</span>
              </button>
            </div>

            {/* Optional Generated Caption */}
            {aiCaption && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B1F3A]">Ready-to-Post Caption</span>
                  <button
                    type="button"
                    onClick={() => copyText(aiCaption, 'ai')}
                    className="text-xs font-bold text-[#E31E24] hover:underline cursor-pointer"
                  >
                    {copiedKey === 'ai' ? 'Copied!' : 'Copy Caption'}
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0B1F3A] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {aiCaption}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: SAVED POSTERS
         ===================================================================== */}
      {studioTab === 'archive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-extrabold font-heading text-[#0B1F3A]">
                Saved Posters ({socialPosts.length})
              </h3>
              <p className="text-sm text-slate-600">
                Re-download any poster or copy its share text anytime.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStudioTab('poster')}
              className="px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-white text-sm font-bold cursor-pointer"
            >
              Make New Poster
            </button>
          </div>

          {socialPosts.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm text-slate-600">No posters saved yet.</p>
              <button
                type="button"
                onClick={() => setStudioTab('poster')}
                className="px-4 py-2.5 rounded-xl bg-[#E31E24] text-white text-sm font-bold cursor-pointer"
              >
                Make Your First Poster
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {socialPosts.map(post => (
                <div
                  key={post.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs font-semibold text-slate-500">
                      <span className="font-bold text-[#E31E24]">{post.type}</span> ·{' '}
                      <span className="tabular-nums">{formatDateMMDDYYYY(post.createdAt)}</span>
                    </div>
                    <div className="text-base font-extrabold text-[#0B1F3A] truncate">{post.title}</div>
                    <p className="text-xs text-slate-600 line-clamp-1">{post.content}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRedownloadArchived(post)}
                      className="px-3.5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(post.content, post.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === post.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === post.id ? 'Copied' : 'Copy Text'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSocialPost(post.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#E31E24] hover:bg-red-50 cursor-pointer"
                      aria-label="Delete saved poster"
                      title="Delete saved poster"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
