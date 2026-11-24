import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import {
  HeartHandshake,
  Award,
  Users,
  Trophy,
  Sparkles,
  Shield,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  Building,
  Target,
  FileCheck,
  Check,
  X,
} from 'lucide-react';

interface PartnershipsPageProps {
  onNavigateHome: () => void;
  onNavigateTournaments: () => void;
}

export const PartnershipsPage: React.FC<PartnershipsPageProps> = ({
  onNavigateHome,
  onNavigateTournaments,
}) => {
  const { showToast } = useClub();
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);

  // Inquiry Form
  const [sponsorForm, setSponsorForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    tier: 'Headline Club Partner',
    message: '',
  });

  const handleSponsorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorForm.companyName || !sponsorForm.phone) return;
    setIsSponsorModalOpen(false);
    showToast('Thank you for partnering with MGFC! Our executive committee will contact you promptly.');
    setSponsorForm({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      tier: 'Headline Club Partner',
      message: '',
    });
  };

  const benefits = [
    {
      title: 'High Brand Visibility',
      desc: 'Extensive brand exposure across players, parents, schools, and visiting teams throughout Sandton, Marlboro, and greater Johannesburg.',
      icon: Award,
    },
    {
      title: 'Active Community Engagement',
      desc: 'Authentic grassroots connection supporting positive lifestyle choices, education, and healthy sports participation for local youth.',
      icon: Users,
    },
    {
      title: 'Corporate Social Investment (CSI)',
      desc: 'Meaningful, measurable CSI impact providing disadvantaged young players with football equipment, registration subsidies, and nutrition.',
      icon: HeartHandshake,
    },
    {
      title: 'Event & Tournament Activation',
      desc: 'Prominent ground advertising, field naming rights, banner exposure, and pop-up promotional displays at our premier annual tournaments.',
      icon: Trophy,
    },
    {
      title: 'Digital & Media Outreach',
      desc: 'Dedicated social media highlights, website logo placement, and digital newsletter features reaching 20,000–50,000 annual impressions.',
      icon: Sparkles,
    },
    {
      title: 'Trusted 40+ Years Legacy',
      desc: 'Associate your organisation with an esteemed community institution continuously serving families and cultivating role models since 1985.',
      icon: Shield,
    },
  ];

  const packages = [
    {
      id: 'headline',
      name: 'Headline Club Partner',
      badge: 'Premier Tier',
      tagline: 'Principal brand visibility across the entire football club.',
      popular: true,
      features: [
        'Prominent front-of-shirt branding across all youth squads (U6–U13)',
        'Headline partner title for the MGFC Annual Tournament',
        'Permanent pitch-side banner placement at Marlboro Sports Ground',
        'Official recognition across all digital match cards and social announcements',
        'VIP invitation and presentation honours at Annual Club Awards Dinner',
      ],
      cta: 'Inquire About Headline Tier',
    },
    {
      id: 'academy',
      name: 'Youth Development Partner',
      badge: 'Squad Tier',
      tagline: 'Targeted support for junior football excellence and training.',
      popular: false,
      features: [
        'Sleeve or back-of-shirt branding on specific junior age-group kits',
        'Branded training bibs and equipment bags for developmental squads',
        'Tournament pitch banner and programme branding',
        'Quarterly impact and development reporting from coaching staff',
        'Featured sponsor profile on club digital channels',
      ],
      cta: 'Support Squad Development',
    },
    {
      id: 'bursary',
      name: 'Player Bursary Sponsor',
      badge: 'Direct CSI Impact',
      tagline: 'Directly subsidise seasonal fees for talented underprivileged players.',
      popular: false,
      features: [
        'Directly covers player seasonal registration (R1,800/player)',
        'Provides boots, shinguards, and match kits for sponsored beneficiaries',
        'Formal certificate of CSI contribution and transparent financial receipt',
        'Direct updates on the sponsored child’s academic and athletic progress',
        'Recognised on the MGFC Wall of Benefactors',
      ],
      cta: 'Fund A Player Bursary',
    },
    {
      id: 'tournament',
      name: 'Tournament & Event Partner',
      badge: 'Event Tier',
      tagline: 'Maximize exposure at our flagship community festivals.',
      popular: false,
      features: [
        'Official co-sponsor of the MGFC Annual Tournament (10 & 11 Oct 2026)',
        'Prime brand activation space at Marlboro School grounds (1,000+ attendees)',
        'Trophy and medal presentation sponsorship opportunities',
        'PA system announcements throughout tournament shifts',
        'Complimentary vendor display stall for products and services',
      ],
      cta: 'Partner for Annual Tournament',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="bg-[#0B1F3A] text-white pt-10 pb-14 border-b-4 border-[#E31E24] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(227,30,36,0.22),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E31E24] text-white text-xs font-black uppercase tracking-wider">
              Partnership & CSI Portal
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              40+ Years of Youth Empowerment • Est. 1985
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white uppercase tracking-tight">
            Partnerships & <span className="text-[#E31E24]">Sponsorships</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed font-medium">
            Partner with Marlboro Gardens Football Club to make a lasting difference in the lives of hundreds of young footballers, while gaining authentic brand recognition in Sandton and surrounding communities.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSponsorModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4" /> Become A Club Partner
            </button>
            <button
              onClick={onNavigateTournaments}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#0B1F3A] font-extrabold text-xs uppercase tracking-wider transition-all shadow flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-[#E31E24]" /> Tournament Opportunities
            </button>
            <button
              onClick={onNavigateHome}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
            >
              &larr; Main Website
            </button>
          </div>
        </div>
      </section>

      {/* Community Reach Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#E31E24]">100–150</div>
            <div className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">Registered Youth Players</div>
            <p className="text-[11px] text-[#718096]">Active grassroots athletes trained weekly across U6 to U13 squads.</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0B1F3A]">1,000–2,500</div>
            <div className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">Event Day Attendees</div>
            <p className="text-[11px] text-[#718096]">Families, spectators, and supporters attending tournaments each year.</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0B1F3A]">20K–50K</div>
            <div className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">Annual Social Impressions</div>
            <p className="text-[11px] text-[#718096]">Digital reach across our engaged community, school networks & leagues.</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#E31E24]">40+ Years</div>
            <div className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider">Continuous Community Trust</div>
            <p className="text-[11px] text-[#718096]">Non-profit youth development institution founded in 1985.</p>
          </div>
        </div>
      </section>

      {/* Why Partner With MGFC (6 Core Benefits) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[#E31E24] text-xs font-extrabold uppercase tracking-widest">
            Strategic Value & Impact
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-tight">
            Why Partner with MGFC?
          </h2>
          <p className="text-xs sm:text-sm text-[#718096] font-medium leading-relaxed">
            Your organisation partners with a respected, values-driven institution dedicated to athletic skill, character development, and social cohesion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#E31E24] transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E31E24] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-[#0B1F3A] uppercase">
                    {b.title}
                  </h3>
                  <p className="text-xs text-[#718096] font-medium leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Partnership Packages Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[#E31E24] text-xs font-extrabold uppercase tracking-widest">
            Tailored Collaboration Opportunities
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#0B1F3A] uppercase tracking-tight">
            Partnership Packages & Opportunities
          </h2>
          <p className="text-xs sm:text-sm text-[#718096] font-medium">
            Select a tier that aligns with your brand objectives and corporate social investment criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`rounded-3xl p-6 bg-white border flex flex-col justify-between space-y-6 transition-all shadow-sm hover:shadow-md ${
                pkg.popular ? 'border-2 border-[#E31E24] relative' : 'border-slate-200'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#E31E24] text-white text-[10px] font-black uppercase tracking-wider shadow">
                  Most Requested
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#E31E24] tracking-wider block">
                    {pkg.badge}
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-[#0B1F3A] uppercase mt-0.5">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#718096] mt-1 font-medium leading-relaxed">
                    {pkg.tagline}
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  {pkg.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-[#0B1F3A] font-medium leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-[#E31E24] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSponsorForm(prev => ({ ...prev, tier: pkg.name }));
                    setIsSponsorModalOpen(true);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-xs ${
                    pkg.popular
                      ? 'bg-[#E31E24] hover:bg-[#C91419] text-white'
                      : 'bg-[#0B1F3A] hover:bg-[#15325b] text-white'
                  }`}
                >
                  {pkg.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stewardship & Financial Accountability */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0B1F3A] text-white p-6 sm:p-10 border-t-4 border-[#E31E24] space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E31E24]">
                Financial Integrity & Governance
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold font-heading text-white uppercase tracking-tight">
                How Sponsorship Funds Are Allocated
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                MGFC operates under strict non-profit governance standards overseen by our Executive Committee. Every cent invested in the club is directly accounted for in creating athletic opportunities for Sandton youth.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-200">
                {[
                  'Player kits, jerseys, and protective equipment',
                  'Match balls, cones, and training equipment',
                  'Subsidised SAFA / NRFA player registrations',
                  'Tournament entry fees and safe transportation',
                  'Field upkeep, pitch repairs & floodlights',
                  'Coaching certification and referee courses',
                  'Nutrition, hydration, and first-aid kits',
                  'Grassroots community outreach events',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#E31E24] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white text-[#0B1F3A] p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#E31E24] uppercase tracking-wider">
                <Shield className="w-4 h-4" /> Board Commitment
              </div>
              <h4 className="font-heading font-extrabold text-xl uppercase text-[#0B1F3A]">
                Our Promise to Partners
              </h4>
              <p className="text-xs text-[#718096] leading-relaxed italic border-l-2 border-[#E31E24] pl-3">
                &ldquo;MGFC is dedicated to building transparent, professional, and long-term partnerships. We ensure every partner receives verifiable community impact, regular reporting, and authentic brand alignment.&rdquo;
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsSponsorModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow text-center"
                >
                  Initiate Partnership Inquiry &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Contact for Partnerships */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <h4 className="font-heading font-extrabold text-2xl text-[#0B1F3A] uppercase">
              Speak Directly with Club Leadership
            </h4>
            <p className="text-xs text-[#718096] font-medium">
              We welcome custom partnership structures, corporate team days, and co-branded youth initiatives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="mailto:partners@mgfc.co.za"
              className="px-4 py-2.5 rounded-xl bg-[#F0F4F9] text-[#0B1F3A] hover:bg-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-300"
            >
              <Mail className="w-4 h-4 text-[#E31E24]" />
              <span>partners@mgfc.co.za</span>
            </a>
            <button
              onClick={() => setIsSponsorModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#15325b] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow"
            >
              Online Inquiry Form
            </button>
          </div>
        </div>
      </section>

      {/* Sponsorship Inquiry Modal */}
      {isSponsorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white text-[#0B1F3A] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setIsSponsorModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#E31E24] uppercase tracking-wider block">
                Corporate Social Investment & Sponsorship
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0B1F3A] uppercase mt-1">
                Partner with MGFC
              </h3>
              <p className="text-xs text-[#718096] font-medium mt-1">
                Establish a transparent, measurable partnership with Marlboro Gardens Football Club.
              </p>
            </div>

            <form onSubmit={handleSponsorSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Company / Organisation Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Industrial Solutions"
                  value={sponsorForm.companyName}
                  onChange={e => setSponsorForm({ ...sponsorForm, companyName: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={sponsorForm.contactPerson}
                    onChange={e => setSponsorForm({ ...sponsorForm, contactPerson: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
                <div>
                  <label className="block text-[#0B1F3A] font-bold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+27 82 000 0000"
                    value={sponsorForm.phone}
                    onChange={e => setSponsorForm({ ...sponsorForm, phone: e.target.value })}
                    className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="corporate@company.co.za"
                  value={sponsorForm.email}
                  onChange={e => setSponsorForm({ ...sponsorForm, email: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Partnership Category *</label>
                <select
                  value={sponsorForm.tier}
                  onChange={e => setSponsorForm({ ...sponsorForm, tier: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl px-3 py-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                >
                  <option value="Headline Club Partner">Headline Club Partner (Chest Branding)</option>
                  <option value="Youth Development Partner">Youth Development & Squad Partner</option>
                  <option value="Player Bursary Sponsor">Player Fee Bursary Sponsor Fund</option>
                  <option value="Tournament & Event Partner">Annual Tournament & Event Partner</option>
                  <option value="Equipment & Ball Supporter">Equipment, Match Balls & Cones Supporter</option>
                </select>
              </div>

              <div>
                <label className="block text-[#0B1F3A] font-bold mb-1">Message / Collaboration Goals</label>
                <textarea
                  rows={3}
                  placeholder="Outline your CSI objectives, marketing focus, or questions..."
                  value={sponsorForm.message}
                  onChange={e => setSponsorForm({ ...sponsorForm, message: e.target.value })}
                  className="w-full bg-[#F0F4F9] border border-slate-300 rounded-xl p-2.5 text-[#0B1F3A] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSponsorModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-[#0B1F3A] hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E31E24] hover:bg-[#C91419] text-white font-extrabold uppercase tracking-wider shadow"
                >
                  Submit Sponsorship Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
