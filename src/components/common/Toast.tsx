import React from 'react';
import { useClub } from '../../context/ClubContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useClub();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-[#0B1F3A] border-emerald-500 text-white shadow-emerald-950/20',
    error: 'bg-[#0B1F3A] border-[#E31E24] text-white shadow-red-950/20',
    info: 'bg-[#0B1F3A] border-[#E31E24] text-white shadow-navy-950/20',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#E31E24] flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-[#E31E24] flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${bgStyles[toast.type]}`}
      >
        {icons[toast.type]}
        <div className="text-sm font-semibold leading-relaxed">{toast.message}</div>
      </div>
    </div>
  );
};
