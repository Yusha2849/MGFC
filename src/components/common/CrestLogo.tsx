import React, { useState } from 'react';

interface CrestLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export const CrestLogo: React.FC<CrestLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'light',
}) => {
  const [imgError, setImgError] = useState(false);

  const dimensionMap = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const isDarkBg = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${dimensionMap[size]} flex-shrink-0 select-none flex items-center justify-center`}>
        {!imgError ? (
          <img
            src="/assets/mgfc-logo-transparent.png"
            alt="Marlboro Gardens Football Club Crest"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain drop-shadow-sm"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-[#0B1F3A] border-2 border-[#E31E24] flex items-center justify-center text-white font-heading font-extrabold text-xs tracking-wider">
            MGFC
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-heading font-extrabold text-xl sm:text-2xl tracking-wide uppercase whitespace-nowrap ${
                isDarkBg ? 'text-white' : 'text-[#0B1F3A]'
              }`}
            >
              Marlboro Gardens
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#E31E24] text-white uppercase tracking-wider">
              FC
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold tracking-widest uppercase whitespace-nowrap ${
              isDarkBg ? 'text-slate-300' : 'text-[#718096]'
            }`}
          >
            Est. 1985 • Sandton, Gauteng
          </span>
        </div>
      )}
    </div>
  );
};
