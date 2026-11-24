import React, { useState, useRef, useEffect } from 'react';
import { useClub, NEXT_SQUAD_MAP } from '../../context/ClubContext';
import { CrestLogo } from '../common/CrestLogo';
import { DateInput } from '../common/DateInput';
import { SeasonManagerModal, SeasonManagerTab } from '../portal/SeasonManagerModal';
import { PlayerPosition } from '../../types';
import { formatDateMMDDYYYY } from '../../utils/dateFormat';
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Download,
  UserCheck,
  UserPlus,
  Shield,
  AlertCircle,
  Printer,
  Calendar,
  MapPin,
  Users,
  Check,
  RotateCcw,
  Phone,
  FileCheck,
  Archive,
  History,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react';

export interface AgeGroupConfig {
  id: string;
  shortLabel: string;
  title: string;
  format: string;
  focus: string;
  detail: string;
  ageGuidance: string;
  trainingNote: string;
}

export const AGE_GROUP_CONFIGS: AgeGroupConfig[] = [
  {
    id: 'u6',
    shortLabel: 'U6',
    title: 'Under 6 (U6)',
    format: '5v5 Small-Sided Format',
    focus: 'Grassroots Foundation',
    detail: 'Early ball mastery, coordination, joyful play, and fun introductory football.',
    ageGuidance: 'Players turning 5 or 6 in 2027 (Born 2021–2022)',
    trainingNote: 'Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063',
  },
  {
    id: 'u7',
    shortLabel: 'U7',
    title: 'Under 7 (U7)',
    format: '5v5 Small-Sided Format',
    focus: 'Skills & Confidence',
    detail: 'Basic passing, movement into space, teamwork, and structured match practice.',
    ageGuidance: 'Players turning 7 in 2027 (Born 2020)',
    trainingNote: 'Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063',
  },
  {
    id: 'u8',
    shortLabel: 'U8',
    title: 'Under 8 (U8)',
    format: '7v7 Match Format',
    focus: 'Game Awareness',
    detail: 'Introduction to tactical positioning, passing rhythms, and defensive balance.',
    ageGuidance: 'Players turning 8 in 2027 (Born 2019)',
    trainingNote: 'Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063',
  },
  {
    id: 'u9',
    shortLabel: 'U9',
    title: 'Under 9 (U9)',
    format: '7v7 Match Format',
    focus: 'Technical Acceleration',
    detail: 'First touch under pressure, transition play, and spatial decision-making.',
    ageGuidance: 'Players turning 9 in 2027 (Born 2018)',
    trainingNote: 'Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063',
  },
  {
    id: 'u10',
    shortLabel: 'U10',
    title: 'Under 10 (U10)',
    format: '9v9 Match Format',
    focus: 'Tactical Transition',
    detail: 'Competitive development, tactical discipline, and teamwork under match pressure.',
    ageGuidance: 'Players turning 10 in 2027 (Born 2017)',
    trainingNote: 'Marlboro School, 41 Zinnia Drive (Mon/Wed & Sat)',
  },
  {
    id: 'u11',
    shortLabel: 'U11',
    title: 'Under 11 (U11)',
    format: '9v9 Match Format',
    focus: 'Positional Mastery',
    detail: 'Tactical shapes, combination play, set-piece fundamentals, and resilience.',
    ageGuidance: 'Players turning 11 in 2027 (Born 2016)',
    trainingNote: 'Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063',
  },
  {
    id: 'u12',
    shortLabel: 'U12',
    title: 'Under 12 (U12)',
    format: '9v9 Match Format',
    focus: 'Junior Leadership',
    detail: 'High-tempo match preparation, mental strength, and tactical problem-solving.',
    ageGuidance: 'Players turning 12 in 2027 (Born 2015)',
    trainingNote: 'Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063',
  },
  {
    id: 'u13',
    shortLabel: 'U13',
    title: 'Under 13 (U13)',
    format: '11v11 Full Pitch',
    focus: 'Youth Academy Transition',
    detail: 'Full-pitch tactical systems, 11v11 positional structure, leadership, and competitive youth football.',
    ageGuidance: 'Players turning 13 in 2027 (Born 2014)',
    trainingNote: 'Marlboro Sports Ground, 4 Islamabad Drive — Junior Field (Wed & Fri 16:00)',
  },
  {
    id: 'community',
    shortLabel: 'Senior',
    title: 'Community & Senior',
    format: 'Full Pitch / Tournaments',
    focus: 'Recreation & Fellowship',
    detail: 'Adult and community recreational football promoting lifelong fitness and unity.',
    ageGuidance: 'Youth graduates (14+) & adult community players',
    trainingNote: 'Marlboro Sports Ground, 4 Islamabad Drive — Floodlit Evening Sessions',
  },
];

interface AgeGroupRegistrationPageProps {
  ageGroupId: string | null;
  onSelectAgeGroup: (id: string | null) => void;
  onNavigateHome: () => void;
}

function getAgeGuidance(groupId: string, year: number, fallback: string): string {
  switch (groupId) {
    case 'u6':
      return `Players turning 5 or 6 in ${year} (Born ${year - 6}–${year - 5})`;
    case 'u7':
      return `Players turning 7 in ${year} (Born ${year - 7})`;
    case 'u8':
      return `Players turning 8 in ${year} (Born ${year - 8})`;
    case 'u9':
      return `Players turning 9 in ${year} (Born ${year - 9})`;
    case 'u10':
      return `Players turning 10 in ${year} (Born ${year - 10})`;
    case 'u11':
      return `Players turning 11 in ${year} (Born ${year - 11})`;
    case 'u12':
      return `Players turning 12 in ${year} (Born ${year - 12})`;
    case 'u13':
      return `Players turning 13 in ${year} (Born ${year - 13})`;
    default:
      return fallback;
  }
}

export const AgeGroupRegistrationPage: React.FC<AgeGroupRegistrationPageProps> = ({
  ageGroupId,
  onSelectAgeGroup,
  onNavigateHome,
}) => {
  const {
    teamFeeSheets,
    squads,
    submitTrialApplication,
    showToast,
    registrationOpen,
    setRegistrationOpen,
    registrationSeasonLabel,
    currentSeasonYear,
    seasonArchives,
    currentRole,
    setActiveView,
  } = useClub();

  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [seasonModalTab, setSeasonModalTab] = useState<SeasonManagerTab>('archive');
  const [seasonModalSourceSquad, setSeasonModalSourceSquad] = useState<string | undefined>(undefined);

  const openSeasonModal = (tab: SeasonManagerTab, sourceSquad?: string) => {
    setSeasonModalTab(tab);
    setSeasonModalSourceSquad(sourceSquad);
    setSeasonModalOpen(true);
  };

  const regYear = Number(registrationSeasonLabel.match(/\d{4}/)?.[0]) || currentSeasonYear + 1;
  const seasonTitle = registrationSeasonLabel.trim() || `${regYear} Season`;

  const selectedAgeConfig = ageGroupId
    ? AGE_GROUP_CONFIGS.find(a => a.id === ageGroupId) || null
    : null;
  const ageConfig = selectedAgeConfig || AGE_GROUP_CONFIGS[0];

  const matchingFeeSheet = teamFeeSheets.find(s => s.id === ageConfig.id);
  const matchingSquad = squads.find(s => s.id === ageConfig.id);

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultPromoteSource =
    selectedAgeConfig?.id && NEXT_SQUAD_MAP[selectedAgeConfig.id] ? selectedAgeConfig.id : 'u7';
  const defaultPromoteTarget = NEXT_SQUAD_MAP[defaultPromoteSource];

  const renderStaffSeasonBar = () => {
    if (currentRole === 'public') return null;
    return (
      <div className="bg-[#08172B] border-b border-white/15 text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Staff Controls
            </span>
            <span className="text-slate-400" aria-hidden="true">·</span>
            <span className="text-slate-200 font-semibold">
              Active Season: <strong className="text-white">{currentSeasonYear}</strong>
            </span>
            <span className="text-slate-400" aria-hidden="true">·</span>
            <span className="text-slate-200 font-semibold">
              Intake: <strong className="text-white">{seasonTitle}</strong>
            </span>
            <span className="text-slate-400" aria-hidden="true">·</span>
            <span className="text-slate-300">
              Archives: <strong className="text-white">{seasonArchives.length}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRegistrationOpen(!registrationOpen)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                registrationOpen
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
              }`}
            >
              {registrationOpen ? (
                <>
                  <ToggleRight className="w-3.5 h-3.5" />
                  <span>Intake Open</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-3.5 h-3.5" />
                  <span>Intake Closed</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => openSeasonModal('promote', defaultPromoteSource)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Move {defaultPromoteSource.toUpperCase()} &rarr;{' '}
                {defaultPromoteTarget ? defaultPromoteTarget.toUpperCase() : 'Graduate'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => openSeasonModal('history')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Archives ({seasonArchives.length})</span>
            </button>

            <button
              type="button"
              onClick={() => openSeasonModal('archive')}
              className="px-3 py-1.5 rounded-lg bg-[#E31E24] hover:bg-[#C91419] text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive {currentSeasonYear} & Start Fresh</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="px-3 py-1.5 rounded-lg bg-white text-[#0B1F3A] hover:bg-slate-100 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Registration Type: 'existing' | 'new'
  const [registrationType, setRegistrationType] = useState<'existing' | 'new'>('new');

  // Existing player card verification state
  const [returningLookupStatus, setReturningLookupStatus] = useState<
    'idle' | 'verified' | 'not_found'
  >('idle');

  // Submission success state
  const [submittedRecord, setSubmittedRecord] = useState<{
    refId: string;
    playerName: string;
    playerIdNumber: string;
    parentName: string;
    parentIdNumber: string;
    address: string;
    contactNumber: string;
    registrationType: 'existing' | 'new';
    ageGroupTitle: string;
    affordabilityConfirmed: 'YES' | 'NO';
    parentSignature: string;
    formDate: string;
    safaCardNumber?: string;
    signatureDataUrl?: string | null;
  } | null>(null);

  // Digital Signature Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Form Fields matching MGFC INDEMNITY AND REGISTRATION FORM 2027
  const [formState, setFormState] = useState({
    formDate: todayStr,
    playerName: '',
    playerIdNumber: '',
    dob: '',
    preferredPosition: 'MF' as PlayerPosition,
    safaCardNumber: '',
    previousClub: '',
    parentName: '',
    parentIdNumber: '',
    address: '',
    suburb: 'Marlboro Gardens',
    contactNumber: '',
    email: '',
    indemnityAccepted: false,
    obligationAccepted: false,
    affordabilityConfirmed: '' as '' | 'YES' | 'NO',
    parentSignature: '',
    docIdCopy: false,
    docPassportPhotos: false,
    docSchoolReport: false,
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Reset verification & scroll when switching age group page
  useEffect(() => {
    setReturningLookupStatus('idle');
    setFormError(null);
    setSubmittedRecord(null);
  }, [ageGroupId]);

  // Canvas signature drawing handlers
  const getCanvasCoordinates = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0B1F3A';
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
  };

  const clearSignaturePad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Optional Returning Player Card Verification against Club records (privacy-safe: only confirms a match)
  const handleVerifyReturningCard = () => {
    const card = formState.safaCardNumber.trim().toLowerCase();
    const nameInput = formState.playerName.trim().toLowerCase();
    if (!card && !nameInput) {
      showToast('Enter the player name or NRFA / MGFC card number to check returning status.', 'info');
      return;
    }

    const foundInSheets = teamFeeSheets.some(sheet =>
      sheet.players.some(p => {
        const cardMatch = card && p.cardNumber.toLowerCase() === card;
        const fullName = `${p.name} ${p.surname}`.toLowerCase();
        const nameMatch =
          nameInput.length >= 3 &&
          (fullName.includes(nameInput) || p.surname.toLowerCase() === nameInput);
        return cardMatch || (card ? false : nameMatch);
      })
    );

    if (foundInSheets) {
      setReturningLookupStatus('verified');
      showToast('Returning player record verified in MGFC register!');
    } else {
      setReturningLookupStatus('not_found');
      showToast('No automatic card match found — you may still submit your Existing Player form.', 'info');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formState.playerName.trim()) {
      setFormError("Please enter the Player's Full Name.");
      return;
    }
    if (!formState.playerIdNumber.trim()) {
      setFormError("Please enter the Player's ID Number or Birth Certificate Number.");
      return;
    }
    if (!formState.parentName.trim()) {
      setFormError('Please enter the Parent / Guardian Full Name.');
      return;
    }
    if (!formState.parentIdNumber.trim()) {
      setFormError('Please enter the Parent / Guardian ID Number.');
      return;
    }
    if (!formState.address.trim()) {
      setFormError('Please enter the residential Address.');
      return;
    }
    if (!formState.contactNumber.trim()) {
      setFormError('Please enter a Contact Number.');
      return;
    }
    if (!formState.indemnityAccepted) {
      setFormError(`Please accept the MGFC ${regYear} Indemnity Clause to proceed.`);
      return;
    }
    if (!formState.obligationAccepted) {
      setFormError(`Please acknowledge the ${regYear} Obligation to MGFC (R1,800.00 affiliation fee).`);
      return;
    }
    if (!formState.affordabilityConfirmed) {
      setFormError('Please confirm affordability of the affiliation fee (YES or NO).');
      return;
    }
    if (!formState.parentSignature.trim() && !hasDrawnSignature) {
      setFormError('Please provide the Parent / Guardian signature (typed name or drawn signature).');
      return;
    }

    const signatureDataUrl =
      hasDrawnSignature && canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;

    const effectiveSignature =
      formState.parentSignature.trim() || `${formState.parentName.trim()} (Signed Digitally)`;

    submitTrialApplication({
      fullName: formState.playerName.trim(),
      dob: formState.dob || '2016-01-01',
      preferredPosition: formState.preferredPosition,
      preferredSquad: ageConfig.id,
      parentName: formState.parentName.trim(),
      phone: formState.contactNumber.trim(),
      email: formState.email.trim() || 'parent@mgfc.co.za',
      previousClub:
        registrationType === 'existing'
          ? 'Marlboro Gardens FC (Returning Player)'
          : formState.previousClub.trim(),
      suburb: formState.suburb.trim() || 'Marlboro Gardens',
      registrationType,
      playerIdNumber: formState.playerIdNumber.trim(),
      parentIdNumber: formState.parentIdNumber.trim(),
      address: formState.address.trim(),
      safaCardNumber: formState.safaCardNumber.trim() || undefined,
      formDate: formState.formDate,
      indemnityAccepted: formState.indemnityAccepted,
      obligationAccepted: formState.obligationAccepted,
      affordabilityConfirmed: formState.affordabilityConfirmed,
      parentSignature: effectiveSignature,
      documentsChecklist: {
        idOrBirthCertificate: formState.docIdCopy,
        passportPhotos: formState.docPassportPhotos,
        latestSchoolReport: formState.docSchoolReport,
      },
    });

    const refId = `MGFC-${regYear}-${ageConfig.shortLabel.toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setSubmittedRecord({
      refId,
      playerName: formState.playerName.trim(),
      playerIdNumber: formState.playerIdNumber.trim(),
      parentName: formState.parentName.trim(),
      parentIdNumber: formState.parentIdNumber.trim(),
      address: formState.address.trim(),
      contactNumber: formState.contactNumber.trim(),
      registrationType,
      ageGroupTitle: ageConfig.title,
      affordabilityConfirmed: formState.affordabilityConfirmed,
      parentSignature: effectiveSignature,
      formDate: formState.formDate,
      safaCardNumber: formState.safaCardNumber.trim() || undefined,
      signatureDataUrl,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForAnotherChild = () => {
    setSubmittedRecord(null);
    setReturningLookupStatus('idle');
    setFormError(null);
    clearSignaturePad();
    setFormState(prev => ({
      ...prev,
      playerName: '',
      playerIdNumber: '',
      dob: '',
      safaCardNumber: '',
      previousClub: '',
      indemnityAccepted: false,
      obligationAccepted: false,
      affordabilityConfirmed: '',
      parentSignature: '',
      docIdCopy: false,
      docPassportPhotos: false,
      docSchoolReport: false,
    }));
  };

  // If Seasonal Registration is closed by Admin Staff, hide all register forms & buttons
  if (!registrationOpen) {
    return (
      <>
        <div className="space-y-8 pb-16">
          {renderStaffSeasonBar()}
          <section className="bg-[#0B1F3A] text-white py-14 border-b-4 border-[#E31E24]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              <button
                onClick={onNavigateHome}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#E31E24]" />
                <span>Back to Main Website</span>
              </button>
              <div className="text-xs font-bold uppercase tracking-widest text-[#E31E24]">
                Seasonal Registration Window
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white uppercase tracking-tight">
                Player Registration is Currently Closed
              </h1>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed font-medium">
                Marlboro Gardens Football Club operates seasonal registration windows. Online registration for the {seasonTitle} has closed. Please check back when the next intake window opens or visit us at Marlboro Sports Ground.
              </p>
            </div>
          </section>

          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F0F4F9] text-[#0B1F3A] flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <Shield className="w-6 h-6 text-[#E31E24]" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-heading font-extrabold text-2xl text-[#0B1F3A] uppercase">
                    Need Assistance From Club Administration?
                  </h2>
                  <p className="text-xs sm:text-sm text-[#718096] leading-relaxed font-medium">
                    If you have a query about an existing player card, transfers, or upcoming intake dates, please reach out to your team manager or visit our home ground at{' '}
                    <strong className="text-[#0B1F3A]">
                      Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063
                    </strong>
                    .
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={onNavigateHome}
                  className="px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  Return to Club Home Page
                </button>
              </div>
            </div>
          </section>
        </div>
        <SeasonManagerModal
          isOpen={seasonModalOpen}
          onClose={() => setSeasonModalOpen(false)}
          initialTab={seasonModalTab}
          initialSourceSquadId={seasonModalSourceSquad}
        />
      </>
    );
  }

  // Dedicated Registration Hub: Choose Age Group Page
  if (!selectedAgeConfig) {
    return (
      <>
        <div className="space-y-10 pb-16">
          {renderStaffSeasonBar()}
          <section className="bg-[#0B1F3A] text-white pt-10 pb-14 border-b-4 border-[#E31E24]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={onNavigateHome}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#E31E24]" />
                <span>Back to Main Website</span>
              </button>

              <a
                href="/assets/aistudio/MGFC_REG_2026-1_368a7694.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0B1F3A] hover:bg-slate-100 text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-[#E31E24]" />
                <span>Official Registration PDF</span>
              </a>
            </div>

            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span className="text-[#E31E24]">{registrationSeasonLabel} Intake Open</span>
                <span aria-hidden="true">·</span>
                <span>Under 6 to Under 13 & Senior</span>
                <span aria-hidden="true">·</span>
                <span>Existing & New Players</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white uppercase tracking-tight">
                Player <span className="text-[#E31E24]">Registration</span> by Age Group
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                Select your child&apos;s age group below to open its dedicated registration page. Each age-group page supports both <strong>Existing Player</strong> renewals and <strong>New Player</strong> applications with the official Marlboro Gardens FC Indemnity and Registration Form.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E31E24]">
                Step 1 · Select Age Division
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase mt-0.5">
                Choose Your Age Group Registration Page
              </h2>
            </div>
            <div className="text-xs font-semibold text-[#718096]">
              Annual Affiliation Fee: <strong className="text-[#0B1F3A]">R1,800.00 / season</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AGE_GROUP_CONFIGS.map(group => {
              const sheet = teamFeeSheets.find(s => s.id === group.id);
              return (
                <div
                  key={group.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#E31E24] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
                      <span className="font-heading font-extrabold text-2xl text-[#0B1F3A] uppercase">
                        {group.title}
                      </span>
                      <span className="text-[11px] font-bold text-[#718096] whitespace-nowrap">
                        {group.format}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[#E31E24] uppercase tracking-wider">
                      {group.focus}
                    </div>

                    <p className="text-xs text-[#718096] font-medium leading-relaxed">
                      {group.detail}
                    </p>

                    <div className="pt-2 space-y-1.5 text-[11px] text-[#0B1F3A] font-medium">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#E31E24] flex-shrink-0 mt-0.5" />
                        <span>{getAgeGuidance(group.id, regYear, group.ageGuidance)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#E31E24] flex-shrink-0 mt-0.5" />
                        <span>{group.trainingNote}</span>
                      </div>
                      {sheet && (
                        <div className="flex items-start gap-2">
                          <Users className="w-3.5 h-3.5 text-[#E31E24] flex-shrink-0 mt-0.5" />
                          <span>
                            Coach: <strong>{sheet.coach}</strong>
                            {sheet.assistantCoach ? ` & ${sheet.assistantCoach}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onSelectAgeGroup(group.id)}
                      className="w-full py-3 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#E31E24] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span>Open {group.shortLabel} Registration</span>
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        </div>
        <SeasonManagerModal
          isOpen={seasonModalOpen}
          onClose={() => setSeasonModalOpen(false)}
          initialTab={seasonModalTab}
          initialSourceSquadId={seasonModalSourceSquad}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-16">
        {renderStaffSeasonBar()}
        {/* Top Age-Group Hero Banner */}
        <section className="bg-[#0B1F3A] text-white pt-8 pb-12 border-b-4 border-[#E31E24] relative overflow-hidden print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => onSelectAgeGroup(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#E31E24]" />
              <span>All Age Groups</span>
            </button>

            <a
              href="/assets/aistudio/MGFC_REG_2026-1_368a7694.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0B1F3A] hover:bg-slate-100 text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-[#E31E24]" />
              <span>Official Registration PDF</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span className="text-[#E31E24]">{seasonTitle} Player Registration</span>
                <span aria-hidden="true">·</span>
                <span>{ageConfig.format}</span>
                <span aria-hidden="true">·</span>
                <span>{ageConfig.focus}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white uppercase tracking-tight">
                {ageConfig.title} <span className="text-[#E31E24]">Registration</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed font-medium">
                {ageConfig.detail} Complete the official {regYear} Marlboro Gardens FC Indemnity and Registration Form below for {ageConfig.title}.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white/10 border border-white/15 rounded-2xl p-5 space-y-2.5 text-xs">
              <div className="font-heading font-extrabold text-base text-white uppercase tracking-wide border-b border-white/15 pb-2">
                {ageConfig.title} Division Info
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <Calendar className="w-4 h-4 text-[#E31E24] flex-shrink-0 mt-0.5" />
                <span>{getAgeGuidance(ageConfig.id, regYear, ageConfig.ageGuidance)}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-200">
                <MapPin className="w-4 h-4 text-[#E31E24] flex-shrink-0 mt-0.5" />
                <span>{matchingSquad?.homePitch || ageConfig.trainingNote}</span>
              </div>
              {matchingFeeSheet && (
                <div className="flex items-start gap-2 text-slate-200">
                  <Users className="w-4 h-4 text-[#E31E24] flex-shrink-0 mt-0.5" />
                  <span>
                    Coaching: <strong className="text-white">{matchingFeeSheet.coach}</strong>
                    {matchingFeeSheet.assistantCoach ? ` & ${matchingFeeSheet.assistantCoach}` : ''}
                  </span>
                </div>
              )}
              <div className="pt-1 border-t border-white/15 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">{regYear} Affiliation Fee:</span>
                <span className="text-[#E31E24] text-sm font-black">R1,800.00 / season</span>
              </div>
            </div>
          </div>

          {/* Age Group Page Switcher Bar */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              Switch Age Group Registration Page:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {AGE_GROUP_CONFIGS.map(group => {
                const isActive = group.id === ageConfig.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => onSelectAgeGroup(group.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer min-h-[40px] ${
                      isActive
                        ? 'bg-[#E31E24] text-white shadow-md'
                        : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/15'
                    }`}
                  >
                    {group.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Registration Workspace */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {submittedRecord ? (
          /* =====================================================================
             POST-SUBMISSION CONFIRMATION & PRINTABLE 2027 INDEMNITY SUMMARY
             ===================================================================== */
          <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-xl p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    {regYear} Registration Submitted
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B1F3A] uppercase">
                    {submittedRecord.ageGroupTitle} — Confirmed
                  </h2>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[11px] font-bold text-[#718096] uppercase">Reference Number</div>
                <div className="font-mono font-black text-base text-[#E31E24]">{submittedRecord.refId}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F4F9] border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#718096] font-bold block uppercase text-[10px]">Registration Category</span>
                <span className="font-extrabold text-[#0B1F3A] text-sm">
                  {submittedRecord.registrationType === 'existing'
                    ? `Existing Player (${regYear} Renewal)`
                    : `New Player (${regYear} Intake)`}
                </span>
              </div>
              <div>
                <span className="text-[#718096] font-bold block uppercase text-[10px]">Form Date</span>
                <span className="font-bold text-[#0B1F3A] tabular-nums">{formatDateMMDDYYYY(submittedRecord.formDate)}</span>
              </div>
              <div>
                <span className="text-[#718096] font-bold block uppercase text-[10px]">Player&apos;s Name</span>
                <span className="font-bold text-[#0B1F3A]">{submittedRecord.playerName}</span>
              </div>
              <div>
                <span className="text-[#718096] font-bold block uppercase text-[10px]">Player ID / Birth Cert #</span>
                <span className="font-mono font-bold text-[#0B1F3A]">{submittedRecord.playerIdNumber}</span>
              </div>
              <div>
                <span className="text-[#718096] font-bold block uppercase text-[10px]">Parent / Guardian Name</span>
                <span className="font-bold text-[#0B1F3A]">{submittedRecord.parentName}</span>
              </div>
              <div>
                <span className="text-[#718096] font-bold block uppercase text-[10px]">Parent ID Number</span>
                <span className="font-mono font-bold text-[#0B1F3A]">{submittedRecord.parentIdNumber}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#718096] font-bold block uppercase text-[10px]">Address & Contact</span>
                <span className="font-medium text-[#0B1F3A]">
                  {submittedRecord.address} • Tel: <strong>{submittedRecord.contactNumber}</strong>
                </span>
              </div>
              <div>
                <span className="text-[#718096] font-bold block uppercase text-[10px]">
                  {regYear} Affiliation Fee (R1,800.00) Affordability
                </span>
                <span
                  className={`font-black ${
                    submittedRecord.affordabilityConfirmed === 'YES'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {submittedRecord.affordabilityConfirmed}
                </span>
              </div>
              <div>
                <span className="text-[#718096] font-bold block uppercase text-[10px]">
                  Parent/Guardian Signature
                </span>
                <span className="font-bold text-[#0B1F3A] italic">{submittedRecord.parentSignature}</span>
                {submittedRecord.signatureDataUrl && (
                  <img
                    src={submittedRecord.signatureDataUrl}
                    alt="Parent digital signature"
                    className="h-12 mt-1 border border-slate-200 rounded bg-white p-1"
                  />
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#E31E24]" /> Required Supporting Documents Reminder
              </div>
              <p className="leading-relaxed">
                Please hand in or email the required attachments to your {submittedRecord.ageGroupTitle} team manager or the club secretariat:
                <strong> (1) Copy of player&apos;s ID / birth certificate, (2) Two passport-size photos, and (3) Latest school report.</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#E31E24]" />
                  <span>Print Confirmation</span>
                </button>
                <a
                  href="/assets/aistudio/MGFC_REG_2026-1_368a7694.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#F0F4F9] hover:bg-slate-200 text-[#0B1F3A] text-xs font-bold border border-slate-300 flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#E31E24]" />
                  <span>Blank PDF Form</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={resetForAnotherChild}
                  className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#E31E24] text-xs font-extrabold uppercase tracking-wider border border-red-200 cursor-pointer"
                >
                  Register Another Child
                </button>
                <button
                  onClick={onNavigateHome}
                  className="px-4 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =====================================================================
             OFFICIAL 2027 INDEMNITY AND REGISTRATION FORM (EXISTING OR NEW PLAYER)
             ===================================================================== */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: TWO OPTIONS — EXISTING PLAYER OR NEW PLAYER */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase text-[#E31E24] tracking-wider">
                    Step 1 · Select Registration Type
                  </span>
                  <h2 className="font-heading font-extrabold text-2xl text-[#0B1F3A] uppercase">
                    Existing Player or New Player?
                  </h2>
                </div>
                <span className="text-xs font-semibold text-[#718096]">
                  Age Group: <strong className="text-[#0B1F3A]">{ageConfig.title}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: Existing Player */}
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationType('existing');
                    setReturningLookupStatus('idle');
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    registrationType === 'existing'
                      ? 'border-[#E31E24] bg-red-50/60 shadow-sm'
                      : 'border-slate-200 bg-[#F0F4F9] hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      registrationType === 'existing'
                        ? 'bg-[#E31E24] text-white'
                        : 'bg-white text-[#0B1F3A] border border-slate-200'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                        Existing Player
                      </span>
                      {registrationType === 'existing' && (
                        <CheckCircle className="w-5 h-5 text-[#E31E24] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#718096] font-medium leading-relaxed">
                      Returning MGFC player renewing registration and {regYear} indemnity for {ageConfig.shortLabel}.
                    </p>
                  </div>
                </button>

                {/* Option B: New Player */}
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationType('new');
                    setReturningLookupStatus('idle');
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    registrationType === 'new'
                      ? 'border-[#E31E24] bg-red-50/60 shadow-sm'
                      : 'border-slate-200 bg-[#F0F4F9] hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      registrationType === 'new'
                        ? 'bg-[#E31E24] text-white'
                        : 'bg-white text-[#0B1F3A] border border-slate-200'
                    }`}
                  >
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                        New Player
                      </span>
                      {registrationType === 'new' && (
                        <CheckCircle className="w-5 h-5 text-[#E31E24] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#718096] font-medium leading-relaxed">
                      First-time player applying to join MGFC {ageConfig.shortLabel} for the {regYear} season.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* STEP 2: OFFICIAL INDEMNITY AND REGISTRATION FORM */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Official Document Title Header mirroring uploaded PDF */}
              <div className="bg-[#0B1F3A] text-white p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#E31E24]">
                <div className="flex items-center gap-4">
                  <CrestLogo size="md" showText={false} variant="dark" />
                  <div>
                    <div className="font-heading font-extrabold text-xl sm:text-2xl uppercase tracking-wide text-white">
                      Marlboro Gardens Football Club
                    </div>
                    <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#E31E24]">
                      Indemnity and Registration Form {regYear}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {ageConfig.title} · {registrationType === 'existing' ? 'Existing Player Renewal' : 'New Player Registration'}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right sm:w-44">
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
                    Form Date (MM/DD/YYYY) *
                  </label>
                  <DateInput
                    required
                    dark
                    value={formState.formDate}
                    onChange={val => setFormState({ ...formState, formDate: val })}
                    ariaLabel="Form Date"
                    className="w-full bg-white/10 border border-white/25 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-300 font-bold focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div className="p-5 sm:p-8 space-y-8 text-xs">
                {/* Existing Player Optional Card Verification Box */}
                {registrationType === 'existing' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F0F4F9] border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-heading font-extrabold text-base text-[#0B1F3A] uppercase">
                          Returning Player Details (Existing Player)
                        </h3>
                        <p className="text-[11px] text-[#718096]">
                          Enter your existing NRFA / MGFC registration card number (if known) to confirm your returning status.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyReturningCard}
                        className="px-3.5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white font-bold text-xs whitespace-nowrap cursor-pointer"
                      >
                        Verify Returning Record
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#0B1F3A] font-bold mb-1">
                          NRFA / MGFC Registration Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 223028 or NRFA card number"
                          value={formState.safaCardNumber}
                          onChange={e =>
                            setFormState({ ...formState, safaCardNumber: e.target.value })
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                        />
                      </div>
                      <div className="flex items-end">
                        {returningLookupStatus === 'verified' && (
                          <div className="w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span>Returning player found in MGFC club register.</span>
                          </div>
                        )}
                        {returningLookupStatus === 'not_found' && (
                          <div className="w-full p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>No exact match found — please complete the form below.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION A: PLAYER'S DETAILS */}
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-heading font-extrabold text-xl text-[#0B1F3A] uppercase">
                      Player&apos;s Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Player&apos;s Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="First Name & Surname"
                        value={formState.playerName}
                        onChange={e => setFormState({ ...formState, playerName: e.target.value })}
                        className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Player&apos;s ID Number / Birth Certificate # *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="13-digit SA ID Number"
                        value={formState.playerIdNumber}
                        onChange={e =>
                          setFormState({ ...formState, playerIdNumber: e.target.value })
                        }
                        className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] font-mono focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Date of Birth (MM/DD/YYYY) *
                      </label>
                      <DateInput
                        required
                        value={formState.dob}
                        onChange={val => setFormState({ ...formState, dob: val })}
                        ariaLabel="Date of Birth"
                        className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Preferred Position
                      </label>
                      <select
                        value={formState.preferredPosition}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            preferredPosition: e.target.value as PlayerPosition,
                          })
                        }
                        className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                      >
                        <option value="GK">Goalkeeper (GK)</option>
                        <option value="DF">Defender (DF)</option>
                        <option value="MF">Midfielder (MF)</option>
                        <option value="FW">Forward / Striker (FW)</option>
                      </select>
                    </div>

                    {registrationType === 'new' && (
                      <div className="sm:col-span-2">
                        <label className="block text-[#0B1F3A] font-bold mb-1">
                          Previous Club (if transferring or played elsewhere)
                        </label>
                        <input
                          type="text"
                          placeholder="Leave blank if this is your child's first football club"
                          value={formState.previousClub}
                          onChange={e =>
                            setFormState({ ...formState, previousClub: e.target.value })
                          }
                          className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION B: PARENT / GUARDIAN DETAILS */}
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-heading font-extrabold text-xl text-[#0B1F3A] uppercase">
                      Parent / Guardian Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Parent / Guardian Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name of Parent or Legal Guardian"
                        value={formState.parentName}
                        onChange={e => setFormState({ ...formState, parentName: e.target.value })}
                        className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Parent / Guardian ID Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="13-digit SA ID / Passport Number"
                        value={formState.parentIdNumber}
                        onChange={e =>
                          setFormState({ ...formState, parentIdNumber: e.target.value })
                        }
                        className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] font-mono focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Residential Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Street Address, Suburb, Postal Code"
                        value={formState.address}
                        onChange={e => setFormState({ ...formState, address: e.target.value })}
                        className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Contact Number (WhatsApp / Mobile) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+27 82 000 0000"
                        value={formState.contactNumber}
                        onChange={e =>
                          setFormState({ ...formState, contactNumber: e.target.value })
                        }
                        className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Email Address (for confirmation)
                      </label>
                      <input
                        type="email"
                        placeholder="parent@example.co.za"
                        value={formState.email}
                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                        className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION C: INDEMNITY CLAUSE (Exact wording from registration document) */}
                <div className="space-y-3 p-5 rounded-2xl bg-[#F0F4F9] border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#E31E24]" />
                    <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                      Indemnity Clause
                    </h3>
                  </div>
                  <p className="text-xs text-[#0B1F3A] leading-relaxed font-medium">
                    I, the undersigned parent/guardian, hereby indemnify and hold harmless Marlboro Gardens Football Club, its officials, coaches, and members, against any claims, demands, or causes of action that may arise from any damage or injury to my child/ward, or any other person, during the course of my child&apos;s/ward&apos;s participation in the club&apos;s activities.
                  </p>
                  <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formState.indemnityAccepted}
                      onChange={e =>
                        setFormState({ ...formState, indemnityAccepted: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 accent-[#E31E24] rounded"
                    />
                    <span className="font-bold text-[#0B1F3A]">
                      I have read, understood, and agree to the MGFC {regYear} Indemnity Clause *
                    </span>
                  </label>
                </div>

                {/* SECTION D: OBLIGATION TO MGFC & AFFORDABILITY CONFIRMATION */}
                <div className="space-y-4 p-5 rounded-2xl bg-[#F0F4F9] border border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                      Obligation to MGFC ({regYear} Season)
                    </h3>
                    <span className="font-black text-[#E31E24] text-sm">
                      Affiliation Fee: R1,800.00
                    </span>
                  </div>

                  <p className="text-xs text-[#0B1F3A] leading-relaxed font-medium">
                    By signing below, I acknowledge that I am obligated to Marlboro Gardens Football Club for the {regYear} season and am liable for the affiliation fee of <strong>R1,800.00 (One Thousand Eight Hundred Rand)</strong>. I understand that this obligation is binding and cannot be terminated. Fees are payable in full regardless of if the player opts for an early termination from the club during the season.
                  </p>

                  {/* Affordability Confirmation: YES / NO */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5">
                    <div className="font-bold text-[#0B1F3A]">
                      I hereby confirm affordability of the affiliation fee: *
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormState({ ...formState, affordabilityConfirmed: 'YES' })
                        }
                        className={`px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
                          formState.affordabilityConfirmed === 'YES'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : 'bg-[#F0F4F9] text-[#0B1F3A] border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {formState.affordabilityConfirmed === 'YES' && (
                          <Check className="w-4 h-4" />
                        )}
                        <span>YES</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormState({ ...formState, affordabilityConfirmed: 'NO' })
                        }
                        className={`px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
                          formState.affordabilityConfirmed === 'NO'
                            ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                            : 'bg-[#F0F4F9] text-[#0B1F3A] border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {formState.affordabilityConfirmed === 'NO' && (
                          <Check className="w-4 h-4" />
                        )}
                        <span>NO</span>
                      </button>
                    </div>

                    {formState.affordabilityConfirmed === 'NO' && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                        Thank you for your honesty. MGFC operates a community Youth Bursary & Payment Arrangement programme — our Treasury & ExCo will reach out privately to discuss support options.
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-3 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formState.obligationAccepted}
                      onChange={e =>
                        setFormState({ ...formState, obligationAccepted: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 accent-[#E31E24] rounded"
                    />
                    <span className="font-bold text-[#0B1F3A]">
                      I acknowledge the binding {regYear} season obligation of R1,800.00 to MGFC *
                    </span>
                  </label>
                </div>

                {/* SECTION E: ATTACHMENTS CHECKLIST & NOTES FROM PDF */}
                <div className="space-y-3 p-5 rounded-2xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#E31E24]" />
                    <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                      Important Note & Required Attachments
                    </h3>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[#718096] font-medium list-disc pl-4">
                    <li>Please ensure that all details are completed accurately.</li>
                    <li>This form must be signed by the parent/guardian.</li>
                    <li>
                      A copy of the player&apos;s ID / birth certificate, two passport size photos and latest school report must be attached.
                    </li>
                  </ul>

                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F0F4F9] border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.docIdCopy}
                        onChange={e =>
                          setFormState({ ...formState, docIdCopy: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#E31E24]"
                      />
                      <span className="font-bold text-[#0B1F3A] text-[11px]">
                        Player ID / Birth Certificate Ready
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F0F4F9] border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.docPassportPhotos}
                        onChange={e =>
                          setFormState({ ...formState, docPassportPhotos: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#E31E24]"
                      />
                      <span className="font-bold text-[#0B1F3A] text-[11px]">
                        2 Passport-Size Photos Ready
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F0F4F9] border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.docSchoolReport}
                        onChange={e =>
                          setFormState({ ...formState, docSchoolReport: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#E31E24]"
                      />
                      <span className="font-bold text-[#0B1F3A] text-[11px]">
                        Latest School Report Ready
                      </span>
                    </label>
                  </div>
                </div>

                {/* SECTION F: SIGNATURE OF PARENT / GUARDIAN */}
                <div className="space-y-4 p-5 rounded-2xl bg-[#F0F4F9] border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] uppercase">
                      Signature of Parent / Guardian
                    </h3>
                    <button
                      type="button"
                      onClick={clearSignaturePad}
                      className="text-xs font-bold text-[#718096] hover:text-[#E31E24] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear Pad
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#0B1F3A] font-bold mb-1">
                        Sign in Box Below (Mouse or Touch)
                      </label>
                      <canvas
                        ref={canvasRef}
                        width={420}
                        height={130}
                        onPointerDown={startDrawing}
                        onPointerMove={draw}
                        onPointerUp={stopDrawing}
                        onPointerCancel={stopDrawing}
                        className="w-full h-[120px] bg-white border-2 border-dashed border-slate-300 rounded-xl touch-none cursor-crosshair"
                      />
                    </div>

                    <div className="space-y-3 flex flex-col justify-between">
                      <div>
                        <label className="block text-[#0B1F3A] font-bold mb-1">
                          Typed Parent / Guardian Legal Signature *
                        </label>
                        <input
                          type="text"
                          placeholder="Type Parent/Guardian Full Name"
                          value={formState.parentSignature}
                          onChange={e =>
                            setFormState({ ...formState, parentSignature: e.target.value })
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] italic font-semibold focus:outline-none focus:border-[#E31E24]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#0B1F3A] font-bold mb-1">
                          Signature Date (MM/DD/YYYY)
                        </label>
                        <DateInput
                          value={formState.formDate}
                          onChange={val => setFormState({ ...formState, formDate: val })}
                          ariaLabel="Signature Date"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#0B1F3A] font-bold focus:outline-none focus:border-[#E31E24]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Alert */}
                {formError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-[#E31E24] font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Submit Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                  <div className="text-[11px] text-[#718096] flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#E31E24]" />
                    <span>
                      Registering for <strong>{ageConfig.title}</strong> ({registrationType === 'existing' ? 'Existing Player' : 'New Player'})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onNavigateHome}
                      className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] font-bold text-xs uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial px-7 py-3 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-red-600/25 cursor-pointer"
                    >
                      Submit {ageConfig.shortLabel} {regYear} Registration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </section>
      </div>
      <SeasonManagerModal
        isOpen={seasonModalOpen}
        onClose={() => setSeasonModalOpen(false)}
        initialTab={seasonModalTab}
        initialSourceSquadId={seasonModalSourceSquad}
      />
    </>
  );
};
