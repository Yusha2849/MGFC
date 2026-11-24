import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { CrestLogo } from '../common/CrestLogo';
import { TournamentsPage } from './TournamentsPage';
import { PartnershipsPage } from './PartnershipsPage';
import {
  AgeGroupRegistrationPage,
  AGE_GROUP_CONFIGS,
} from './AgeGroupRegistrationPage';
import {
  MapPin,
  Trophy,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle,
  X,
  Flame,
  HeartHandshake,
  ExternalLink,
  Target,
  Compass,
  Menu,
  ChevronRight,
  BarChart3,
  Star,
} from 'lucide-react';

import heroTeamImg from '../../assets/images/hero_huddle_sa_youth_1795449044938.jpg';
import programmePlayerImg from '../../assets/images/programme_player_graphic_1795383330157.jpg';
import partnershipImg from '../../assets/images/partnership_handshake_cropped_1795448821469.jpg';
import trophyImg from '../../assets/images/tournament_trophy_1795383331427.jpg';
import sportsGroundImg from '../../assets/images/marlboro_sports_ground_1795383330634.jpg';
import schoolGroundsImg from '../../assets/images/marlboro_school_grounds_1795383330940.jpg';

export const PublicWebsite: React.FC = () => {
  const {
    setActiveView,
    setCurrentRole,
    registrationOpen,
    registrationSeasonLabel,
  } = useClub();

  // Public Page Routing: 'home' | 'tournaments' | 'partnerships' | 'register'
  const [publicPage, setPublicPage] = useState<'home' | 'tournaments' | 'partnerships' | 'register'>('home');
  const [selectedRegAgeGroup, setSelectedRegAgeGroup] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [heroLogoError, setHeroLogoError] = useState(false);

  // Handle URL hash changes or initial hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#tournaments' || hash === '#tournament') {
        setPublicPage('tournaments');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#partnerships' || hash === '#sponsorship' || hash === '#sponsors') {
        setPublicPage('partnerships');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#register-')) {
        const ageId = hash.replace('#register-', '');
        const valid = AGE_GROUP_CONFIGS.some(a => a.id === ageId);
        setSelectedRegAgeGroup(valid ? ageId : null);
        setPublicPage('register');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#register') {
        setSelectedRegAgeGroup(null);
        setPublicPage('register');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#home' || hash === '' || hash === '#about' || hash === '#programmes' || hash === '#facilities' || hash === '#impact') {
        setPublicPage('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (page: 'home' | 'tournaments' | 'partnerships' | 'register', anchor?: string) => {
    setPublicPage(page);
    setMobileNavOpen(false);
    if (page === 'home' && anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToRegistration = (ageGroupId: string | null) => {
    setSelectedRegAgeGroup(ageGroupId);
    setPublicPage('register');
    setMobileNavOpen(false);
    window.location.hash = ageGroupId ? `#register-${ageGroupId}` : '#register';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPortalWithRole = (role: 'executive' | 'coach' | 'finance' | 'secretary') => {
    setCurrentRole(role);
    setActiveView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-[#0B1F3A] flex flex-col selection:bg-[#E31E24] selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-[#0B1F3A] text-white text-xs py-2 px-3 sm:px-4 border-b border-red-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 font-bold text-[#E31E24] text-[11px] sm:text-xs">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" /> EST. 1985 • 40+ YEARS OF COMMUNITY IMPACT
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-[#E31E24] flex-shrink-0" /> Marlboro Gardens, Sandton, Gauteng
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[11px]">
            <button
              onClick={() => navigateTo('tournaments')}
              className="text-white hover:text-red-300 font-bold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Trophy className="w-3.5 h-3.5 text-[#E31E24] flex-shrink-0" />
              <span>Upcoming Tournaments</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => openPortalWithRole('executive')}
              className="bg-[#E31E24] hover:bg-[#C91419] text-white px-2.5 py-0.5 rounded font-bold transition-all shadow hover:shadow-red-500/20 text-[10px] sm:text-[11px] whitespace-nowrap cursor-pointer"
            >
              Operations Portal &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Public Header with Mobile Hamburger Menu */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer focus:outline-none shrink-0 min-w-0"
          >
            <CrestLogo size="md" showText={false} />
            <div className="min-w-0">
              <div className="font-heading font-extrabold text-xl sm:text-2xl tracking-wide text-[#0B1F3A] uppercase leading-none whitespace-nowrap">
                Marlboro Gardens <span className="text-[#E31E24]">FC</span>
              </div>
              <p className="text-[10px] font-semibold text-[#718096] tracking-wider uppercase mt-0.5 whitespace-nowrap">
                The Stars of Sandton · Est. 1985
              </p>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-[13px] font-bold text-[#0B1F3A]">
            <button
              onClick={() => navigateTo('home')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                publicPage === 'home'
                  ? 'text-[#E31E24] border-b-2 border-[#E31E24]'
                  : 'hover:text-[#E31E24]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigateTo('home', 'about')}
              className="py-1 whitespace-nowrap shrink-0 hover:text-[#E31E24] transition-colors cursor-pointer"
            >
              About
            </button>

            <button
              onClick={() => navigateTo('home', 'programmes')}
              className="py-1 whitespace-nowrap shrink-0 hover:text-[#E31E24] transition-colors cursor-pointer"
            >
              Programmes
            </button>

            <button
              onClick={() => navigateTo('home', 'facilities')}
              className="py-1 whitespace-nowrap shrink-0 hover:text-[#E31E24] transition-colors cursor-pointer"
            >
              Facilities
            </button>

            <button
              onClick={() => navigateTo('partnerships')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                publicPage === 'partnerships'
                  ? 'text-[#E31E24] border-b-2 border-[#E31E24]'
                  : 'hover:text-[#E31E24]'
              }`}
            >
              Partnership
            </button>

            {registrationOpen && (
              <button
                onClick={() => navigateToRegistration(null)}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  publicPage === 'register'
                    ? 'text-[#E31E24] border-b-2 border-[#E31E24]'
                    : 'text-[#E31E24] hover:text-[#B91C1C]'
                }`}
              >
                Registration
              </button>
            )}

            <button
              onClick={() => navigateTo('tournaments')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                publicPage === 'tournaments'
                  ? 'text-[#E31E24] border-b-2 border-[#E31E24]'
                  : 'hover:text-[#E31E24]'
              }`}
            >
              Tournaments
            </button>
          </nav>

          {/* Mobile Hamburger Menu Toggle Button */}
          <div className="lg:hidden flex items-center shrink-0">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="p-2 rounded-xl bg-[#F0F4F9] text-[#0B1F3A] hover:bg-slate-200 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6 text-[#E31E24]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-5 shadow-2xl space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="text-xs font-black uppercase text-[#718096] tracking-wider px-2">
              Website Navigation
            </div>

            <div className="space-y-1">
              <button
                onClick={() => navigateTo('home')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                  publicPage === 'home'
                    ? 'bg-[#0B1F3A] text-white'
                    : 'text-[#0B1F3A] hover:bg-[#F0F4F9]'
                }`}
              >
                <span>Home</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigateTo('home', 'about')}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-bold text-[#0B1F3A] hover:bg-[#F0F4F9]"
              >
                <span>About</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigateTo('home', 'programmes')}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-bold text-[#0B1F3A] hover:bg-[#F0F4F9]"
              >
                <span>Programmes (U6–U13)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigateTo('home', 'facilities')}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-bold text-[#0B1F3A] hover:bg-[#F0F4F9]"
              >
                <span>Facilities</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigateTo('partnerships')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                  publicPage === 'partnerships'
                    ? 'bg-[#E31E24] text-white'
                    : 'text-[#0B1F3A] hover:bg-[#F0F4F9]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HeartHandshake
                    className={`w-4 h-4 ${
                      publicPage === 'partnerships' ? 'text-white' : 'text-[#E31E24]'
                    }`}
                  />
                  <span>Partnership</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    publicPage === 'partnerships' ? 'text-white/80' : 'text-slate-400'
                  }`}
                />
              </button>

              {registrationOpen && (
                <button
                  onClick={() => navigateToRegistration(null)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                    publicPage === 'register'
                      ? 'bg-[#E31E24] text-white'
                      : 'text-[#E31E24] bg-red-50/70 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Registration</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => navigateTo('tournaments')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                  publicPage === 'tournaments'
                    ? 'bg-[#E31E24] text-white'
                    : 'text-[#0B1F3A] hover:bg-[#F0F4F9]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trophy
                    className={`w-4 h-4 ${
                      publicPage === 'tournaments' ? 'text-white' : 'text-[#E31E24]'
                    }`}
                  />
                  <span>Tournaments</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    publicPage === 'tournaments' ? 'text-white/80' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          VIEW ROUTING
         ========================================================================= */}
      {publicPage === 'tournaments' && (
        <TournamentsPage
          onNavigateHome={() => navigateTo('home')}
          onNavigatePartnerships={() => navigateTo('partnerships')}
        />
      )}

      {publicPage === 'partnerships' && (
        <PartnershipsPage
          onNavigateHome={() => navigateTo('home')}
          onNavigateTournaments={() => navigateTo('tournaments')}
        />
      )}

      {publicPage === 'register' && (
        <AgeGroupRegistrationPage
          ageGroupId={selectedRegAgeGroup}
          onSelectAgeGroup={(ageId) => navigateToRegistration(ageId)}
          onNavigateHome={() => navigateTo('home')}
        />
      )}

      {publicPage === 'home' && (
        <>
          {/* 1. HERO SECTION — Full-bleed Huddle Photo + Dark Navy Scrim + Floating Official Crest */}
          <section className="relative overflow-hidden bg-[#0B1F3A] text-white pt-10 sm:pt-14 pb-12 sm:pb-16 border-b-4 border-[#E31E24]">
            {/* Background Team Huddle Image */}
            <img
              src={heroTeamImg}
              alt="Marlboro Gardens Football Club youth squad team huddle in red and blue kits under stadium floodlights"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-[center_35%] opacity-65"
            />
            {/* Measured Navy Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/95 via-[#0B1F3A]/80 to-[#0B1F3A]/35 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-transparent to-[#0B1F3A]/40 pointer-events-none" />

            {/* Diagonal Crimson & White Corner Stripes (Right Edge Accent) */}
            <div className="hidden md:block absolute -right-14 -bottom-16 w-72 h-72 pointer-events-none opacity-95">
              <div className="w-full h-7 bg-[#E31E24] -rotate-45 translate-y-24 shadow-lg" />
              <div className="w-full h-5 bg-white -rotate-45 translate-y-28" />
              <div className="w-full h-10 bg-[#0B1F3A] -rotate-45 translate-y-32" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* Left Content */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E31E24] text-white text-[11px] font-bold tracking-wide shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>40+ Years of Football • 40+ Years of Community • 40+ Years of Impact</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.03] text-balance">
                    Building Champions.{' '}
                    <span className="block mt-1">Developing Communities.</span>
                    <span className="text-[#E31E24] block mt-1">Inspiring Futures.</span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-100 max-w-xl leading-relaxed font-medium">
                    For 40+ years, Marlboro Gardens Football Club (MGFC) has played a vital role in developing young footballers and strengthening communities through sport across Marlboro Gardens, Sandton, and surrounding Johannesburg areas.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => navigateTo('home', 'programmes')}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#E31E24] hover:bg-[#C91419] text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <span>Explore Programmes</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigateTo('partnerships')}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0B1F3A]/60 hover:bg-white/15 text-white font-bold text-xs tracking-wide border border-white/60 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <HeartHandshake className="w-4 h-4 text-[#E31E24]" />
                      <span>Partner &amp; Sponsor</span>
                    </button>
                  </div>

                  {/* Hero Bottom Stats Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 pt-5 mt-2 border-t border-white/20 sm:divide-x sm:divide-white/20 max-w-xl">
                    <div className="flex items-center gap-3 sm:pr-5">
                      <Users className="w-7 h-7 text-[#E31E24] shrink-0" />
                      <div>
                        <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white leading-none tabular-nums">
                          100–150
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium mt-1">
                          Registered Players
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:px-5">
                      <Award className="w-7 h-7 text-[#E31E24] shrink-0" />
                      <div>
                        <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white leading-none tabular-nums">
                          20–30
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium mt-1">
                          Coaches &amp; Managers
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:pl-5">
                      <Trophy className="w-7 h-7 text-[#E31E24] shrink-0" />
                      <div>
                        <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white leading-none tabular-nums">
                          10+
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium mt-1">
                          Competitive Squads
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Official MGFC Shield Crest */}
                <div className="lg:col-span-4 flex justify-center lg:justify-end">
                  <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 flex items-center justify-center">
                    {!heroLogoError ? (
                      <img
                        src="/assets/mgfc-logo-transparent.png"
                        alt="Marlboro Gardens Football Club Official Crest"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroLogoError(true)}
                        className="w-full h-full object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.65)] select-none"
                      />
                    ) : (
                      <div className="w-48 h-48 rounded-full bg-[#0B1F3A] border-4 border-[#E31E24] flex flex-col items-center justify-center text-white shadow-2xl">
                        <span className="font-heading font-extrabold text-4xl tracking-wider">MGFC</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. ABOUT SECTION & OFFICIAL CLUB IDENTITY CARD (`#about`) */}
          <section id="about" className="scroll-mt-24 py-12 sm:py-16 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Left Column: About Copy + Open Vision & Mission Split */}
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <div className="text-[#E31E24] text-xs font-extrabold tracking-wide flex items-center gap-1.5 mb-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Established 1985 • 40+ Years of Heritage</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0B1F3A] tracking-tight">
                      About Marlboro Gardens Football Club
                    </h2>
                  </div>

                  <div className="space-y-4 text-sm text-[#0B1F3A]/85 leading-relaxed font-medium">
                    <p>
                      Established in 1985, Marlboro Gardens Football Club (MGFC) was formed through the collective efforts of dedicated football administrators, players, coaches, and community leaders who recognised the need for organised football development within the community.
                    </p>
                    <p className="text-[#475569]">
                      Over the past four decades, the club has become a proud symbol of community spirit, resilience, and youth empowerment. Today, MGFC serves hundreds of players and families annually across Marlboro Gardens and surrounding Johannesburg areas, creating a safe, structured, and values-driven environment where football becomes a catalyst for personal growth, education, and community pride.
                    </p>
                  </div>

                  {/* Vision & Mission Two-Column Editorial Split */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-base font-heading font-extrabold text-[#0B1F3A]">
                        <Target className="w-5 h-5 text-[#E31E24]" />
                        <span>Our Vision</span>
                      </div>
                      <p className="text-xs text-[#475569] font-medium leading-relaxed">
                        To be a leading community football club that develops talented athletes, responsible leaders, and engaged citizens through football.
                      </p>
                    </div>

                    <div className="space-y-2 sm:border-l sm:border-slate-200 sm:pl-6">
                      <div className="flex items-center gap-2 text-base font-heading font-extrabold text-[#0B1F3A]">
                        <Compass className="w-5 h-5 text-[#E31E24]" />
                        <span>Our Mission</span>
                      </div>
                      <p className="text-xs text-[#475569] font-medium leading-relaxed">
                        To provide quality football development programmes that empower young people through coaching, mentorship, education, and positive life experiences.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Navy Official Club Identity Card */}
                <div className="lg:col-span-4">
                  <div className="rounded-2xl bg-[#0B1F3A] text-white border-t-4 border-[#E31E24] p-6 shadow-xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/15">
                      <span className="text-xs font-extrabold text-[#E31E24] tracking-wide">
                        Official Club Identity
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        Est. 1985
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-extrabold text-2xl text-white leading-tight">
                        Marlboro Gardens Football Club
                      </h3>
                      <p className="text-xs text-slate-300 font-medium mt-1.5 leading-relaxed">
                        Affiliated with South African Football Association (SAFA) and the Northern Regional Football Association Little League.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => navigateTo('tournaments')}
                        className="py-2.5 px-3 rounded-full bg-[#E31E24] hover:bg-[#C91419] text-white font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Tournaments</span>
                      </button>

                      <button
                        onClick={() => navigateTo('partnerships')}
                        className="py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <HeartHandshake className="w-3.5 h-3.5 text-[#E31E24]" />
                        <span>Partnership</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-white/15 text-xs">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E31E24] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400">Home Ground: </span>
                          <span className="font-bold text-white">4 Islamabad Drive, Marlboro Gardens</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Users className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
                        <div>
                          <span className="text-slate-400">Youth Divisions: </span>
                          <span className="font-bold text-white">Under 6 to Under 13</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
                        <div>
                          <span className="text-slate-400">League System: </span>
                          <span className="font-bold text-white">NRFA Little League</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Target className="w-3.5 h-3.5 text-[#E31E24] shrink-0" />
                        <div>
                          <span className="text-slate-400">Community Hub: </span>
                          <span className="font-bold text-white">Family, Mentorship &amp; Sport</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Club Philosophy & Code — Six Core Values Strip */}
              <div className="pt-8 border-t border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-extrabold text-[#E31E24] uppercase tracking-wider">
                      Club Philosophy &amp; Code
                    </div>
                    <h3 className="font-heading font-extrabold text-2xl text-[#0B1F3A] tracking-tight">
                      The Six Core Values
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Discipline', desc: 'Promoting punctuality, focus, respect for rules, and personal accountability.' },
                    { title: 'Respect', desc: 'Treating coaches, referees, teammates, opposing teams, and spectators with dignity.' },
                    { title: 'Teamwork', desc: 'Instilling collective responsibility, communication, and shared success.' },
                    { title: 'Leadership', desc: 'Empowering young players to become positive role models both on and off the pitch.' },
                    { title: 'Community Engagement', desc: 'Fostering family participation, unity, and civic contribution in Marlboro.' },
                    { title: 'Sporting Excellence', desc: 'Committing to high coaching standards, skill development, and fair play.' },
                  ].map((val, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-start gap-3"
                    >
                      <CheckCircle className="w-4 h-4 text-[#E31E24] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-heading font-extrabold text-sm text-[#0B1F3A] uppercase">
                          {val.title}
                        </div>
                        <div className="text-xs text-[#475569] font-medium mt-0.5 leading-relaxed">
                          {val.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. OUR FOOTBALL PROGRAMMES (`#programmes`) — Player Graphic Left + Intro + 3x3 Compact Grid */}
          <section id="programmes" className="scroll-mt-24 py-12 sm:py-16 bg-white border-b border-slate-200 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Athletic Player Graphic & Section Intro */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="hidden lg:block w-52 h-64 -ml-4 mb-2 overflow-hidden">
                    <img
                      src={programmePlayerImg}
                      alt="Dynamic youth football player in action"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain mix-blend-multiply select-none"
                    />
                  </div>

                  <div className="text-[#E31E24] text-xs font-extrabold tracking-wide flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    <span>Structured Age-Group Pathway</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0B1F3A] tracking-tight">
                    Our Football Programmes
                  </h2>

                  <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                    MGFC offers structured football development across junior age groups (Under 6 to Under 13) and recreational community football, participating in recognised local structures including the <strong>NRFA Little League</strong> and affiliated local competitions.
                  </p>
                </div>

                {/* Right Column: 3x3 Grid of Compact Programme Cards */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {AGE_GROUP_CONFIGS.map((prog) => {
                    const highlightRed = prog.id === 'community';
                    return (
                      <div
                        key={prog.id}
                        className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-[#0B1F3A]/40 transition-colors flex flex-col justify-between space-y-2.5"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`font-heading font-extrabold text-base ${
                                highlightRed ? 'text-[#E31E24]' : 'text-[#0B1F3A]'
                              }`}
                            >
                              {prog.title}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-[#0B1F3A]/80 mt-0.5">
                            {prog.format} <span className="text-slate-300">|</span>{' '}
                            <span className="text-[#E31E24]">{prog.focus}</span>
                          </div>
                          <p className="text-[11px] text-[#475569] font-medium leading-relaxed mt-1.5">
                            {prog.detail}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/70 text-[10px] text-[#718096] font-medium truncate">
                          {prog.trainingNote}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 4. HOLISTIC YOUTH DEVELOPMENT / DEVELOPING MORE THAN FOOTBALLERS (`#impact`) — Full Navy Band */}
          <section id="impact" className="scroll-mt-24 py-12 sm:py-14 bg-[#0B1F3A] text-white border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Intro */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="text-[#E31E24] text-xs font-extrabold tracking-wide flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    <span>Holistic Youth Development</span>
                  </div>
                  <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight leading-tight">
                    Developing More Than Footballers
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    Football serves as the vehicle through which we develop future leaders. Our programmes focus on character development, mental resilience, and civic pride.
                  </p>
                </div>

                {/* Middle Checklist */}
                <div className="lg:col-span-4 space-y-2.5 lg:border-x lg:border-white/15 lg:px-6">
                  {[
                    {
                      title: 'Character Development',
                      desc: 'Teaching integrity, accountability, discipline, and respect in sports and life.',
                    },
                    {
                      title: 'Leadership & Role Modelling',
                      desc: 'Encouraging players to become positive role models for peers and younger children.',
                    },
                    {
                      title: 'Confidence Building',
                      desc: 'Helping young people believe in their potential through encouragement and mentorship.',
                    },
                    {
                      title: 'Safe Youth Engagement',
                      desc: 'Providing constructive weekend and after-school activities that promote healthy lifestyles and positive decision-making.',
                    },
                    {
                      title: 'Social Cohesion',
                      desc: 'Bringing together families and diverse communities across Sandton through shared sporting experiences.',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#E31E24] shrink-0 mt-0.5" />
                      <div className="text-xs leading-snug">
                        <span className="font-bold text-white">{item.title}: </span>
                        <span className="text-slate-300 font-normal">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Impact KPI Grid */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Users className="w-6 h-6 text-[#E31E24]" />
                    <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white tabular-nums">
                      800–1,200
                    </div>
                    <div className="text-xs font-bold text-white">Community Members</div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Directly and indirectly reached every season through club activities.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Trophy className="w-6 h-6 text-[#E31E24]" />
                    <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white tabular-nums">
                      1,000–2,500
                    </div>
                    <div className="text-xs font-bold text-white">Tournament Attendees</div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Spectators, players, families, and vendors at major club events.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <BarChart3 className="w-6 h-6 text-[#E31E24]" />
                    <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white tabular-nums">
                      20K–50K
                    </div>
                    <div className="text-xs font-bold text-white">Social Impressions</div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Annual digital engagement reaching parents, youth, and local businesses.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Star className="w-6 h-6 text-[#E31E24]" />
                    <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white tabular-nums">
                      40+ Years
                    </div>
                    <div className="text-xs font-bold text-white">Legacy of Impact</div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Trusted community institution continuously active since 1985.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. PARTNERSHIPS & TOURNAMENTS DUAL PHOTO CARDS */}
          <section className="py-12 bg-[#F0F4F9] border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Partnerships Photo Card */}
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 sm:grid-cols-12">
                  <div className="sm:col-span-5 relative bg-slate-100">
                    <img
                      src={partnershipImg}
                      alt="Corporate and community partnership handshake"
                      referrerPolicy="no-referrer"
                      className="w-full h-48 sm:h-full object-cover"
                    />
                  </div>
                  <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-[#E31E24] text-white text-[10px] font-bold tracking-wide">
                        Corporate &amp; Community Partnerships
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-[#0B1F3A] leading-tight">
                        Partner with Marlboro Gardens FC
                      </h3>
                      <p className="text-xs text-[#475569] font-medium leading-relaxed">
                        Explore our comprehensive partnership packages, youth player bursaries, kit sponsorships, and transparent CSI opportunities on our dedicated partnerships page.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => navigateTo('partnerships')}
                        className="px-5 py-2.5 rounded-full bg-[#E31E24] hover:bg-[#C91419] text-white font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>View Partnerships &amp; Sponsorships</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tournaments Photo Card */}
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 sm:grid-cols-12">
                  <div className="sm:col-span-5 relative bg-slate-100">
                    <img
                      src={trophyImg}
                      alt="Golden MGFC tournament championship trophy on green pitch"
                      referrerPolicy="no-referrer"
                      className="w-full h-48 sm:h-full object-cover"
                    />
                  </div>
                  <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-[#E31E24] text-white text-[10px] font-bold tracking-wide">
                        Dedicated Tournaments Hub
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-[#0B1F3A] leading-tight">
                        MGFC Tournaments &amp; Community Festivals
                      </h3>
                      <p className="text-xs text-[#475569] font-medium leading-relaxed">
                        View full details, age shifts, match rules, team entry registration, and 2-day pop-up vendor stall reservations on our dedicated tournament page.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => navigateTo('tournaments')}
                        className="px-5 py-2.5 rounded-full bg-[#E31E24] hover:bg-[#C91419] text-white font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>View Upcoming Tournaments</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. OFFICIAL LEAGUE NOTICE & FACILITIES / LOCATIONS STRIP (`#facilities`) */}
          <section id="facilities" className="scroll-mt-24 py-12 sm:py-14 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Official League Fixtures & Standings Notice */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="shrink-0 flex flex-col items-center text-center gap-1.5">
                    <div className="w-20 h-20 rounded-full bg-[#0B1F3A] border-4 border-[#E31E24] text-white flex flex-col items-center justify-center shadow-sm">
                      <Shield className="w-7 h-7 text-[#E31E24]" />
                      <span className="text-[10px] font-extrabold tracking-wider mt-0.5">NRFA</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#0B1F3A] flex items-center gap-1">
                      <span>Managed by NRFA / League Bodies</span>
                      <ExternalLink className="w-3 h-3 text-[#E31E24]" />
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading font-extrabold text-lg text-[#0B1F3A] leading-tight">
                      Official League Fixtures &amp; Standings Notice
                    </h3>
                    <p className="text-xs text-[#475569] font-medium leading-relaxed">
                      MGFC participates in structured regional competitions including the <strong>NRFA Little League</strong> and affiliated local football associations. Official match schedules, weekly fixtures, and live league tables are managed directly on the official league platform, rather than on the club&apos;s website.
                    </p>
                  </div>
                </div>

                {/* Right: Locations & Club Hubs + Two Facility Photo Cards */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#E31E24] uppercase tracking-wider">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>Locations &amp; Club Hubs</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-xl text-[#0B1F3A] leading-tight">
                      Facilities &amp; Contact
                    </h3>
                    <p className="text-xs text-[#475569] font-medium leading-relaxed">
                      Operating across two primary grounds in Marlboro Gardens, Sandton.
                    </p>
                  </div>

                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Ground 1 */}
                    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                      <div className="h-28 bg-slate-100 overflow-hidden">
                        <img
                          src={sportsGroundImg}
                          alt="Marlboro Sports Ground pitch and floodlights"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3.5 space-y-1.5 flex-1">
                        <h4 className="font-heading font-extrabold text-sm text-[#0B1F3A]">
                          Marlboro Sports Ground
                        </h4>
                        <p className="text-[11px] text-[#475569] leading-snug">
                          Primary home ground for training sessions, floodlit practices, coaching clinics, and community league fixtures.
                        </p>
                        <div className="text-[10px] text-[#0B1F3A] space-y-0.5 pt-1 border-t border-slate-100">
                          <div><strong>Address:</strong> 4 Islamabad Drive, Marlboro Gardens, Sandton, 2063</div>
                          <div><strong>Facilities:</strong> 2 Match Pitches, Floodlights, Changing Rooms, Community Canteen</div>
                        </div>
                      </div>
                    </div>

                    {/* Ground 2 */}
                    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                      <div className="h-28 bg-slate-100 overflow-hidden">
                        <img
                          src={schoolGroundsImg}
                          alt="Marlboro School Grounds multi-pitch youth complex"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3.5 space-y-1.5 flex-1">
                        <h4 className="font-heading font-extrabold text-sm text-[#0B1F3A]">
                          Marlboro School Grounds
                        </h4>
                        <p className="text-[11px] text-[#475569] leading-snug">
                          Venue for junior development shifts, community sports days, and the MGFC Annual Tournament.
                        </p>
                        <div className="text-[10px] text-[#0B1F3A] space-y-0.5 pt-1 border-t border-slate-100">
                          <div><strong>Address:</strong> 41 Zinnia Drive, Marlboro Gardens, Sandton</div>
                          <div><strong>Features:</strong> Multi-pitch youth layout, secure parking, vendor stalls zone, family area</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Public Footer - Deep Navy with Diagonal Corner Accent */}
      <footer className="mt-auto relative overflow-hidden bg-[#0B1F3A] border-t-4 border-[#E31E24] pt-12 sm:pt-14 pb-8 text-xs text-slate-300">
        {/* Diagonal Corner Ribbon Graphic */}
        <div className="hidden lg:block absolute -right-12 -bottom-14 w-64 h-64 pointer-events-none opacity-80">
          <div className="w-full h-6 bg-[#E31E24] -rotate-45 translate-y-24" />
          <div className="w-full h-4 bg-white -rotate-45 translate-y-28" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <CrestLogo size="md" showText={false} variant="dark" />
                <span className="font-heading font-extrabold text-2xl text-white uppercase tracking-wide">
                  Marlboro Gardens Football Club
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed font-medium">
                <span className="text-[#E31E24] font-bold">40+ Years of Football • 40+ Years of Community • 40+ Years of Impact.</span>{' '}
                Empowering Marlboro Gardens and Sandton youth through structured coaching, leadership development, and sporting integrity since 1985.
              </p>
              <div className="text-[11px] text-slate-400">
                Affiliated with South African Football Association (SAFA) &amp; NRFA Little League structures.
              </div>
            </div>

            <div>
              <h4 className="font-heading font-bold text-white uppercase tracking-wider text-base mb-3">
                Public Pages
              </h4>
              <ul className="space-y-2 font-medium">
                <li>
                  <button
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#E31E24] transition-colors text-left cursor-pointer"
                  >
                    Home &amp; Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('tournaments')}
                    className="hover:text-[#E31E24] transition-colors text-[#E31E24] font-bold text-left flex items-center gap-1 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Upcoming Tournaments
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('partnerships')}
                    className="hover:text-[#E31E24] transition-colors text-left flex items-center gap-1 cursor-pointer"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-[#E31E24]" /> Partnerships &amp; Sponsorships
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('home', 'programmes')}
                    className="hover:text-[#E31E24] transition-colors text-left cursor-pointer"
                  >
                    Football Programmes (U6–U13)
                  </button>
                </li>
                {registrationOpen && (
                  <li>
                    <button
                      onClick={() => navigateToRegistration(null)}
                      className="hover:text-[#E31E24] transition-colors text-left font-bold text-white cursor-pointer"
                    >
                      {registrationSeasonLabel.replace(/\s*Season$/i, '')} Player Registration
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => navigateTo('home', 'about')}
                    className="hover:text-[#E31E24] transition-colors text-left cursor-pointer"
                  >
                    About MGFC &amp; Heritage
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('home', 'facilities')}
                    className="hover:text-[#E31E24] transition-colors text-left cursor-pointer"
                  >
                    Facilities &amp; Contact
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-white uppercase tracking-wider text-base mb-3">
                Club Administration
              </h4>
              <ul className="space-y-2 font-medium">
                <li>
                  <button
                    onClick={() => openPortalWithRole('executive')}
                    className="text-[#E31E24] hover:text-red-300 font-bold cursor-pointer"
                  >
                    Executive Dashboard &rarr;
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openPortalWithRole('coach')}
                    className="hover:text-[#E31E24] transition-colors text-left cursor-pointer"
                  >
                    Technical Coaching Staff
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openPortalWithRole('finance')}
                    className="hover:text-[#E31E24] transition-colors text-left cursor-pointer"
                  >
                    Treasury &amp; Finance
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openPortalWithRole('secretary')}
                    className="hover:text-[#E31E24] transition-colors text-left cursor-pointer"
                  >
                    Governance &amp; Documents
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-medium">
            <div>&copy; 1985–{new Date().getFullYear()} Marlboro Gardens Football Club (MGFC). All rights reserved.</div>
            <div className="flex flex-wrap items-center gap-3">
              <span>Marlboro Sports Ground &amp; Marlboro School, Sandton</span>
              <span>•</span>
              <span>Non-Profit Community Youth Organisation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
