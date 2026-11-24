import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { CrestLogo } from '../common/CrestLogo';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
  Share2,
  Settings,
  Globe,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Building,
  Briefcase,
} from 'lucide-react';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  const { currentRole, setCurrentRole, activeView, setActiveView } = useClub();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'squads', label: 'Squads & Players', icon: Users },
    { id: 'fixtures', label: 'Fixtures & Results', icon: Calendar },
    { id: 'finance', label: 'Fees & Finance', icon: DollarSign },
    { id: 'governance', label: 'Meetings & Tasks', icon: Building },
    { id: 'ai', label: 'Reports & Assistant', icon: Sparkles },
    { id: 'social', label: 'Social Posters', icon: Share2 },
    { id: 'settings', label: 'Settings & Backup', icon: Settings },
  ];

  const roleMeta: Record<UserRole, { title: string; subtitle: string; icon: any; color: string }> = {
    executive: {
      title: 'Executive Board',
      subtitle: 'Chairperson & General ExCo',
      icon: ShieldCheck,
      color: 'text-white bg-[#E31E24] border-red-700',
    },
    coach: {
      title: 'Technical Staff',
      subtitle: 'Head Coach & Team Manager',
      icon: UserCheck,
      color: 'text-white bg-blue-700 border-blue-800',
    },
    finance: {
      title: 'Treasury & Finance',
      subtitle: 'Comptroller & Auditor',
      icon: DollarSign,
      color: 'text-white bg-emerald-700 border-emerald-800',
    },
    secretary: {
      title: 'Club Secretariat',
      subtitle: 'Registrar & Administrator',
      icon: Briefcase,
      color: 'text-white bg-slate-700 border-slate-800',
    },
    public: {
      title: 'Public Guest',
      subtitle: 'Fan & Member View',
      icon: Globe,
      color: 'text-slate-200 bg-slate-800 border-slate-700',
    },
  };

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    setRoleDropdownOpen(false);
    if (role === 'public') {
      setActiveView('public');
    }
  };

  const currentRoleInfo = roleMeta[currentRole];
  const CurrentRoleIcon = currentRoleInfo.icon;

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-[#0B1F3A] flex flex-col lg:flex-row selection:bg-[#E31E24] selection:text-white">
      {/* Sidebar Desktop - Deep Navy #0B1F3A */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0B1F3A] text-white border-r border-[#122A4E] flex-shrink-0 shadow-lg">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <CrestLogo size="md" showText={false} variant="dark" />
            <div>
              <div className="font-heading font-extrabold text-2xl text-white tracking-wide uppercase">
                MGFC <span className="text-[#E31E24]">Portal</span>
              </div>
              <div className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">
                Marlboro Gardens FC
              </div>
            </div>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="p-4 border-b border-white/10 relative">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Operating Role</span>
            <span className="text-[#E31E24] text-[9px] font-extrabold">Switch</span>
          </div>

          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${currentRoleInfo.color} hover:brightness-110 shadow-sm`}
          >
            <div className="flex items-center gap-2.5 text-left truncate">
              <CurrentRoleIcon className="w-4 h-4 flex-shrink-0" />
              <div className="truncate">
                <div className="text-xs font-black uppercase tracking-wider leading-none">{currentRoleInfo.title}</div>
                <div className="text-[10px] text-white/80 leading-tight truncate mt-0.5 font-medium">
                  {currentRoleInfo.subtitle}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-80 flex-shrink-0 ml-1" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute top-full left-4 right-4 z-50 mt-1 bg-white text-[#0B1F3A] border border-slate-200 rounded-2xl shadow-2xl p-1.5 space-y-1">
              {(['executive', 'coach', 'finance', 'secretary'] as UserRole[]).map(role => {
                const meta = roleMeta[role];
                const Icon = meta.icon;
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-bold transition-colors ${
                      currentRole === role ? 'bg-[#E31E24] text-white' : 'text-[#0B1F3A] hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div>{meta.title}</div>
                      <div className={`text-[10px] font-medium ${currentRole === role ? 'text-white/80' : 'text-[#718096]'}`}>
                        {meta.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleRoleSelect('public')}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-bold text-[#718096] hover:bg-slate-100 hover:text-[#0B1F3A]"
                >
                  <Globe className="w-4 h-4 text-[#E31E24]" />
                  <span>Public Club Website</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#E31E24] text-white shadow-md shadow-red-700/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${
                      isActive ? 'bg-white text-[#E31E24]' : 'bg-[#E31E24] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Back to Public Web */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setActiveView('public')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
          >
            <Globe className="w-4 h-4 text-[#E31E24]" />
            <span>Switch to Public Website</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-[#0B1F3A] text-white border-b border-red-900/40 p-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <CrestLogo size="sm" showText={false} variant="dark" />
          <div>
            <span className="font-heading font-extrabold text-lg uppercase tracking-wide">
              MGFC <span className="text-[#E31E24]">Portal</span>
            </span>
            <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider leading-none">
              {currentRoleInfo.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('public')}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 border border-white/10"
          >
            <Globe className="w-3.5 h-3.5 text-[#E31E24]" />
            <span>Public Site</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 focus:outline-none"
            aria-label="Toggle Portal Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#E31E24]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Quick-Tab Scroller (Always accessible for instant 1-tap switching) */}
      <div className="lg:hidden bg-[#0B1F3A]/95 text-white border-b border-white/10 px-2 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-none sticky top-[57px] z-20 backdrop-blur-md">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#E31E24] text-white shadow-xs'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">{item.label.split('&')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1F3A] text-white border-b border-white/10 p-4 space-y-4 shadow-2xl animate-in slide-in-from-top duration-150">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Switch Operating Role</span>
              <span className="text-[#E31E24]">Current: {currentRoleInfo.title}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['executive', 'coach', 'finance', 'secretary'] as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentRole(role);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                    currentRole === role
                      ? 'bg-[#E31E24] text-white border-red-600 shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="truncate">{roleMeta[role].title}</div>
                  <div className="text-[9px] text-slate-300/80 truncate font-normal mt-0.5">
                    {roleMeta[role].subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Portal Sections
            </div>
            <div className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold min-h-[44px] transition-all ${
                      isActive ? 'bg-[#E31E24] text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-white/20 uppercase">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setActiveView('public');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-extrabold text-white uppercase tracking-wider"
            >
              <Globe className="w-4 h-4 text-[#E31E24]" />
              <span>Back to Public Website</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Portal Content Workspace - Light Navy #F0F4F9 */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar - Crisp White */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0B1F3A] tracking-tight truncate">
              {navItems.find(n => n.id === activeView)?.label || 'Club Portal'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => setActiveView('public')}
              className="px-3.5 py-2 rounded-xl bg-[#F0F4F9] hover:bg-slate-200 text-xs font-bold text-[#0B1F3A] border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-[#E31E24]" />
              <span className="hidden sm:inline">View Public Site</span>
              <span className="sm:hidden">Public</span>
            </button>
          </div>
        </header>

        {/* Content Body - Responsive Padding for Phones */}
        <div className="p-3 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
