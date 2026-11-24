import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Users,
  Award,
  Phone,
  Copy,
  Check,
  ShoppingBag,
  ArrowRight,
  Shield,
  Sparkles,
  Info,
  ExternalLink,
  X,
  CheckCircle,
} from 'lucide-react';

interface TournamentsPageProps {
  onNavigateHome: () => void;
  onNavigatePartnerships: () => void;
}

export const TournamentsPage: React.FC<TournamentsPageProps> = ({
  onNavigateHome,
  onNavigatePartnerships,
}) => {
  const { showToast } = useClub();
  const [copiedBank, setCopiedBank] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isStallModalOpen, setIsStallModalOpen] = useState(false);

  // Team Entry Form State
  const [teamForm, setTeamForm] = useState({
    clubName: '',
    contactPerson: '',
    phone: '',
    email: '',
    ageGroup: 'u8',
    numberOfTeams: 1,
    notes: '',
  });

  // Vendor Stall Form State
  const [stallForm, setStallForm] = useState({
    stallName: '',
    ownerName: '',
    phone: '',
    email: '',
    category: 'Food & Beverages',
    electricalRequired: 'No',
    notes: '',
  });

  const copyBankDetails = () => {
    navigator.clipboard.writeText(
      'Bank: FNB | Account Name: Marlboro Gardens FC | Account Number: 63041859604 | Branch Code: 210835'
    );
    setCopiedBank(true);
    showToast('FNB tournament banking details copied to clipboard!');
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.clubName || !teamForm.phone) return;
    setIsTeamModalOpen(false);
    showToast(`Team entry for ${teamForm.clubName} received! Coordinators will contact you for payment verification.`);
    setTeamForm({
      clubName: '',
      contactPerson: '',
      phone: '',
      email: '',
      ageGroup: 'u8',
      numberOfTeams: 1,
      notes: '',
    });
  };

  const handleStallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stallForm.stallName || !stallForm.phone) return;
    setIsStallModalOpen(false);
    showToast(`Vendor stall request for ${stallForm.stallName} received! Stall coordinators will follow up.`);
    setStallForm({
      stallName: '',
      ownerName: '',
      phone: '',
      email: '',
      category: 'Food & Beverages',
      electricalRequired: 'No',
      notes: '',
    });
  };

  const shifts = [
    {
      day: 'Saturday 10 October 2026',
      shift: 'Shift 1 (Morning)',
      time: '9:00am – 1:00pm',
      ages: 'Under 7 & Under 13',
      badge: 'U7 & U13',
      format: 'U7 (5v5 max 10 players) • U13 (7v7 max 10 players)',
      status: 'Open for Registration',
    },
    {
      day: 'Saturday 10 October 2026',
      shift: 'Shift 2 (Afternoon)',
      time: '1:30pm – 5:30pm',
      ages: 'Under 9 & Under 12',
      badge: 'U9 & U12',
      format: 'U9 (7v7 max 10 players) • U12 (7v7 max 10 players)',
      status: 'Open for Registration',
    },
    {
      day: 'Sunday 11 October 2026',
      shift: 'Shift 1 (Morning)',
      time: '9:00am – 1:00pm',
      ages: 'Under 6 & Under 11',
      badge: 'U6 & U11',
      format: 'U6 (5v5 max 10 players) • U11 (7v7 max 10 players)',
      status: 'Open for Registration',
    },
    {
      day: 'Sunday 11 October 2026',
      shift: 'Shift 2 (Afternoon)',
      time: '1:30pm – 5:30pm',
      ages: 'Under 8 & Under 10',
      badge: 'U8 & U10',
      format: 'U8 (7v7 max 10 players) • U10 (7v7 max 10 players)',
      status: 'Open for Registration',
    },
  ];

  const calendarTournaments = [
    {
      title: 'MGFC Flagship Annual Tournament 2026',
      date: '10 & 11 October 2026',
      venue: 'Marlboro School, 41 Zinnia Drive, Sandton',
      divisions: 'U6, U7, U8, U9, U10, U11, U12, U13',
      fee: 'R900 per team',
      description: 'The landmark grassroots youth festival of Marlboro Gardens featuring small-sided match shifts, medals, family entertainment, and a 2-day pop-up market.',
      featured: true,
    },
    {
      title: 'NRFA Little League Mid-Season Festival',
      date: 'June 2026',
      venue: 'Regional Football Hub, Gauteng',
      divisions: 'U8, U9, U10, U11, U12',
      fee: 'Official League Sanctioned',
      description: 'Competitive festival featuring teams from the Northern Regional Football Association Little League circuit.',
      featured: false,
    },
    {
      title: 'Sandton Grassroots Winter Cup',
      date: 'July 2026 (School Holidays)',
      venue: 'Marlboro Sports Ground, 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063',
      divisions: 'U6, U7, U8, U9',
      fee: 'R650 per team',
      description: 'Fast-paced small-sided winter tournament focused on maximum ball touches, fun, and sportsmanship during the winter break.',
      featured: false,
    },
    {
      title: 'SAFA Regional Youth Development Festival',
      date: 'September 2026',
      venue: 'Johannesburg Regional Grounds',
      divisions: 'U11, U12, U13',
      fee: 'SAFA Sanctioned',
      description: 'Regional tournament offering high-level technical competition and talent scouting across the Johannesburg metro district.',
      featured: false,
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner - Deep Navy with Crisp Red Accents */}
      <section className="bg-[#0B1F3A] text-white pt-10 pb-14 border-b-4 border-[#E31E24] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(227,30,36,0.25),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E31E24] text-white text-xs font-black uppercase tracking-wider">
              MGFC Tournament Portal
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              Official Youth Cups & Community Festivals
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white uppercase tracking-tight">
            Upcoming <span className="text-[#E31E24]">Tournaments</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed font-medium">
            Explore upcoming football tournaments, annual festival shifts, team entry registrations, and pop-up vendor stall bookings hosted by Marlboro Gardens Football Club and affiliated regional associations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" /> Enter A Team (R900)
            </button>
            <button
              onClick={() => setIsStallModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#0B1F3A] font-extrabold text-xs uppercase tracking-wider transition-all shadow flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#E31E24]" /> Book Vendor Stall (R1,600)
            </button>
            <button
              onClick={onNavigateHome}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
            >
              &larr; Back to Main Website
            </button>
          </div>
        </div>
      </section>

      {/* Flagship Event Showcase: MGFC Annual Tournament 2026 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-3xl bg-white border-2 border-slate-200 shadow-xl overflow-hidden">
          {/* Card Top Title Banner */}
          <div className="bg-[#0B1F3A] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#E31E24]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black text-[#E31E24] uppercase tracking-widest">
                <Trophy className="w-4 h-4" /> Flagship Community Event
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white uppercase tracking-tight">
                Marlboro Gardens Annual Tournament 2026
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E31E24]" /> 10 & 11 October 2026
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E31E24]" /> Marlboro School, 41 Zinnia Drive, Sandton
                </span>
                <span>•</span>
                <span className="font-bold text-[#E31E24]">R900 Affiliation Fee per Team</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-black text-xs uppercase tracking-wider shadow-md"
              >
                Register Team
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Shifts Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0B1F3A] uppercase tracking-wide">
                  Tournament Schedule & Age-Group Shifts
                </h3>
                <span className="text-xs font-bold text-[#718096]">Max 10 players per squad</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {shifts.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#F0F4F9] border border-slate-200 hover:border-[#E31E24] transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#0B1F3A] text-white">
                          {s.day.includes('Saturday') ? 'Sat 10 Oct' : 'Sun 11 Oct'}
                        </span>
                        <span className="text-[10px] font-bold text-[#E31E24] uppercase tracking-wider">
                          {s.shift}
                        </span>
                      </div>
                      <div className="font-heading font-extrabold text-2xl text-[#0B1F3A] pt-1">
                        {s.ages}
                      </div>
                      <div className="text-xs font-bold text-[#E31E24] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {s.time}
                      </div>
                      <p className="text-[11px] text-[#718096] font-medium leading-relaxed pt-1">
                        {s.format}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {s.status}
                      </span>
                      <button
                        onClick={() => {
                          setTeamForm(prev => ({
                            ...prev,
                            ageGroup: s.badge.toLowerCase().includes('u7') ? 'u7' : 'u8',
                          }));
                          setIsTeamModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-[#0B1F3A] hover:text-[#E31E24] transition-colors"
                      >
                        Enter &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FNB Banking Details & Coordinators Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* FNB Box */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0B1F3A] text-white space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E31E24] flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Official Banking Details for Team Affiliation
                    </span>
                    <button
                      onClick={copyBankDetails}
                      className="text-xs text-white hover:text-red-300 font-bold flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBank ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Use your club name and age group as reference (e.g., &ldquo;Stars U10 Entry&rdquo;).
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Bank</span>
                    <strong className="text-white">First National Bank (FNB)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Name</span>
                    <strong className="text-white">Marlboro Gardens FC</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Number</span>
                    <strong className="font-mono text-[#E31E24] font-black text-sm">63041859604</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Branch Code</span>
                    <strong className="font-mono text-white text-sm">210835</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  Fee: R900 per team. Proof of payment should be sent via WhatsApp or email to confirm your team fixture allocation.
                </div>
              </div>

              {/* Tournament Coordinators */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-[#F0F4F9] border border-slate-200 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading font-extrabold text-xl text-[#0B1F3A] uppercase tracking-wide">
                    Tournament Coordinators & Inquiries
                  </h4>
                  <p className="text-xs text-[#718096] font-medium mt-1">
                    Directly contact our tournament committee members for rules, group fixtures, or queries.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: 'M. Y. Suliman', phone: '072 177 1204', role: 'Tournament Director' },
                    { name: 'Hassan Variawa', phone: '076 518 8955', role: 'Logistics Coordinator' },
                    { name: 'Mo Kara', phone: '083 229 7542', role: 'Fixtures & Registrations' },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#0B1F3A]">{c.name}</div>
                        <div className="text-[10px] text-[#718096] font-medium">{c.role}</div>
                      </div>
                      <a
                        href={`tel:${c.phone.replace(/\s+/g, '')}`}
                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#E31E24] font-bold flex items-center gap-1.5 border border-red-200 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{c.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-[#718096]">
                  <span>Venue: Marlboro School Grounds</span>
                  <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className="font-bold text-[#E31E24] hover:underline"
                  >
                    Submit Team Details &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Pop-up Market Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-50 via-white to-red-50 border border-red-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="px-3 py-0.5 rounded-full bg-[#E31E24] text-white text-[10px] font-black uppercase tracking-wider">
                  Community Pop-Up Market
                </span>
                <h4 className="font-heading font-extrabold text-2xl text-[#0B1F3A] uppercase tracking-tight">
                  Vendor Stalls: Food, Sweets, Toys & Apparel
                </h4>
                <p className="text-xs text-[#718096] font-medium leading-relaxed">
                  Join hundreds of families, players, and supporters. Rent a prime vendor space for both days (10 & 11 October 2026) for only <strong>R1,600</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs pt-1 font-semibold text-[#0B1F3A]">
                  <span>Coordinators: Muhsin Munshi (071 613 7565)</span>
                  <span>•</span>
                  <span>Mo Amod (084 456 6676)</span>
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3">
                <div className="text-center px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-2xl font-black font-heading text-[#E31E24]">R1,600</div>
                  <div className="text-[10px] text-[#718096] uppercase font-bold">2-Day Stall Fee</div>
                </div>
                <button
                  onClick={() => setIsStallModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E31E24]" />
                  <span>Reserve Vendor Stall</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar of All 2026 Tournaments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[#E31E24] text-xs font-extrabold uppercase tracking-widest">
            Annual Competition Pathway
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-tight">
            2026 Tournament Calendar
          </h2>
          <p className="text-xs sm:text-sm text-[#718096] font-medium">
            Events and tournaments that MGFC squads participate in and host across the calendar year.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {calendarTournaments.map((t, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-3xl bg-white border transition-all space-y-4 shadow-sm hover:shadow-md ${
                t.featured ? 'border-2 border-[#E31E24]' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  {t.featured && (
                    <span className="text-[10px] font-black uppercase text-[#E31E24] tracking-wider block">
                      MGFC Official Host
                    </span>
                  )}
                  <h3 className="font-heading font-extrabold text-xl text-[#0B1F3A] uppercase">
                    {t.title}
                  </h3>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-red-50 text-[#E31E24] whitespace-nowrap">
                  {t.fee}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#718096]">
                <div className="flex items-center gap-1.5 font-bold text-[#0B1F3A]">
                  <Calendar className="w-3.5 h-3.5 text-[#E31E24]" /> {t.date}
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#718096]" /> {t.venue}
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-[#718096]" /> Divisions: {t.divisions}
                </div>
              </div>

              <p className="text-xs text-[#718096] font-medium leading-relaxed">
                {t.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0B1F3A]">
                  Affiliated with SAFA / NRFA
                </span>
                {t.featured ? (
                  <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className="text-xs font-bold text-[#E31E24] hover:underline flex items-center gap-1"
                  >
                    <span>Register Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-xs text-[#718096] italic">Announced via League</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules & Eligibility Guidelines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1F3A] text-white border-t-4 border-[#E31E24] space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E31E24]">
              Tournament Standards
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase">
              Tournament Rules & Code of Conduct
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl font-medium">
              To ensure fairness, player safety, and enjoyable community spirit, all participating clubs and supporters must adhere to tournament guidelines:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium text-slate-200">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                <CheckCircle className="w-4 h-4 text-[#E31E24]" /> Squad Size & Identification
              </div>
              <p className="text-slate-300 text-[11px]">
                Maximum 10 players per registered squad. Players must have official SAFA or league cards / verified proof of age.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                <CheckCircle className="w-4 h-4 text-[#E31E24]" /> Punctuality & Match Time
              </div>
              <p className="text-slate-300 text-[11px]">
                Teams must arrive at least 30 minutes before their designated shift kickoff. Fixtures run strictly to schedule.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                <CheckCircle className="w-4 h-4 text-[#E31E24]" /> Fair Play & Zero Tolerance
              </div>
              <p className="text-slate-300 text-[11px]">
                Strict zero tolerance for abuse toward referees, opposition players, or tournament marshals by parents or coaches.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 text-xs">
            <span className="text-slate-300">
              Need tournament sponsorship or advertising opportunities?
            </span>
            <button
              onClick={onNavigatePartnerships}
              className="text-[#E31E24] hover:text-white font-extrabold transition-colors flex items-center gap-1"
            >
              <span>Explore Partnership Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Team Registration Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#E31E24] uppercase tracking-wider block">
                Official Team Registration • 10 & 11 October 2026
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase mt-1">
                Annual Tournament Entry
              </h3>
              <p className="text-xs text-[#718096] font-medium mt-1">
                Affiliation Fee: <strong>R900 per team</strong> (Max 10 players) • Venue: Marlboro School (41 Zinnia Drive)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1F3A] text-white space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#E31E24] font-bold uppercase text-[10px] tracking-wider">FNB Banking Details</span>
                <button
                  onClick={copyBankDetails}
                  className="text-white hover:text-red-300 text-[11px] font-bold flex items-center gap-1"
                >
                  {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="space-y-0.5 font-mono text-[11px]">
                <div>Bank: <strong>First National Bank (FNB)</strong></div>
                <div>Account Name: <strong>Marlboro Gardens FC</strong></div>
                <div>Account Number: <strong className="text-[#E31E24]">63041859604</strong></div>
                <div>Branch Code: <strong>210835</strong></div>
              </div>
            </div>

            <form onSubmit={handleTeamSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Club / Academy Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sandton Warriors FC"
                  value={teamForm.clubName}
                  onChange={e => setTeamForm({ ...teamForm, clubName: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="Coach / Manager Name"
                    value={teamForm.contactPerson}
                    onChange={e => setTeamForm({ ...teamForm, contactPerson: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+27 82 000 0000"
                    value={teamForm.phone}
                    onChange={e => setTeamForm({ ...teamForm, phone: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Age Division *</label>
                  <select
                    value={teamForm.ageGroup}
                    onChange={e => setTeamForm({ ...teamForm, ageGroup: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  >
                    <option value="u6">Under 6 (Sun Morning)</option>
                    <option value="u7">Under 7 (Sat Morning)</option>
                    <option value="u8">Under 8 (Sun Afternoon)</option>
                    <option value="u9">Under 9 (Sat Afternoon)</option>
                    <option value="u10">Under 10 (Sun Afternoon)</option>
                    <option value="u11">Under 11 (Sun Morning)</option>
                    <option value="u12">Under 12 (Sat Afternoon)</option>
                    <option value="u13">Under 13 (Sat Morning)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Number of Teams</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={teamForm.numberOfTeams}
                    onChange={e => setTeamForm({ ...teamForm, numberOfTeams: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="manager@club.co.za"
                  value={teamForm.email}
                  onChange={e => setTeamForm({ ...teamForm, email: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Special Notes / Squad Requests</label>
                <textarea
                  rows={2}
                  placeholder="Any fixture constraints or questions..."
                  value={teamForm.notes}
                  onChange={e => setTeamForm({ ...teamForm, notes: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl p-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-[#0B1F3A] hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold uppercase tracking-wider shadow"
                >
                  Submit Team Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Stall Reservation Modal */}
      {isStallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setIsStallModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#E31E24] uppercase tracking-wider block">
                Food & Merchandise Pop-Up Market
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase mt-1">
                Reserve Vendor Stall
              </h3>
              <p className="text-xs text-[#718096] font-medium mt-1">
                MGFC Annual Tournament • 10 & 11 October 2026 • Marlboro School (41 Zinnia Drive)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1F3A] text-white text-center space-y-1">
              <div className="text-3xl font-extrabold font-heading text-[#E31E24]">R1,600</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Weekend Stall Fee (Saturday & Sunday Access)
              </div>
              <div className="text-[11px] text-slate-300">
                Stall Coordinators: Muhsin Munshi (071 613 7565) • Mo Amod (084 456 6676)
              </div>
            </div>

            <form onSubmit={handleStallSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Stall / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delicious Burgers & Shakes"
                  value={stallForm.stallName}
                  onChange={e => setStallForm({ ...stallForm, stallName: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Owner / Representative"
                    value={stallForm.ownerName}
                    onChange={e => setStallForm({ ...stallForm, ownerName: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+27 82 000 0000"
                    value={stallForm.phone}
                    onChange={e => setStallForm({ ...stallForm, phone: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Vendor Category *</label>
                  <select
                    value={stallForm.category}
                    onChange={e => setStallForm({ ...stallForm, category: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  >
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Sweets & Confectionery">Sweets & Ice Cream</option>
                    <option value="Toys & Children Entertainment">Toys & Games</option>
                    <option value="Apparel & Footwear">Apparel & Sportswear</option>
                    <option value="Crafts & Merchandise">Crafts & Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Electricity Required?</label>
                  <select
                    value={stallForm.electricalRequired}
                    onChange={e => setStallForm({ ...stallForm, electricalRequired: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  >
                    <option value="No">No (Self-contained / Gas)</option>
                    <option value="Yes">Yes (Standard 220V plug point)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Special Requests / Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your menu or items to be sold..."
                  value={stallForm.notes}
                  onChange={e => setStallForm({ ...stallForm, notes: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl p-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStallModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-[#0B1F3A] hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white font-extrabold uppercase tracking-wider shadow"
                >
                  Reserve Stall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
