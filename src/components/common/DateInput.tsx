import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateMMDDYYYY, parseMMDDYYYYToIso, toIsoDateString } from '../../utils/dateFormat';

interface DateInputProps {
  value: string;
  onChange: (isoDate: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  dark?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseIsoParts(iso: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1; // 0-indexed
  const day = Number(m[3]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function buildIso(year: number, monthZeroIndexed: number, day: number): string {
  const yyyy = String(year).padStart(4, '0');
  const mm = String(monthZeroIndexed + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Cross-browser date input that ALWAYS displays and accepts dates in MM/DD/YYYY format
 * regardless of OS/browser locale, paired with an interactive portal-rendered calendar popup
 * that works reliably inside modals, scrollable tables, and iframes.
 * Emits ISO YYYY-MM-DD strings so internal sorting, filtering, and persistence stay consistent.
 */
export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'MM/DD/YYYY',
  ariaLabel,
  disabled = false,
  dark = false,
}) => {
  const normalizedIso = toIsoDateString(value);
  const [textValue, setTextValue] = useState<string>(() => formatDateMMDDYYYY(value));
  const [isOpen, setIsOpen] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      iso: buildIso(now.getFullYear(), now.getMonth(), now.getDate()),
    };
  }, []);

  const initialParts = parseIsoParts(normalizedIso);
  const [viewYear, setViewYear] = useState<number>(initialParts?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState<number>(initialParts?.month ?? today.month);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setTextValue(formatDateMMDDYYYY(value));
    const parts = parseIsoParts(toIsoDateString(value));
    if (parts) {
      setViewYear(parts.year);
      setViewMonth(parts.month);
    }
  }, [value]);

  const updatePopoverPosition = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const popoverWidth = 288;
    const popoverHeight = 330;
    const margin = 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;

    let top = openAbove ? rect.top - popoverHeight - 6 : rect.bottom + 6;
    top = Math.max(margin, Math.min(top, window.innerHeight - popoverHeight - margin));

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - margin) {
      left = rect.right - popoverWidth;
    }
    left = Math.max(margin, Math.min(left, window.innerWidth - popoverWidth - margin));

    setPopoverCoords({ top, left });
  }, []);

  const openCalendar = () => {
    if (disabled) return;
    const parts = parseIsoParts(toIsoDateString(value));
    if (parts) {
      setViewYear(parts.year);
      setViewMonth(parts.month);
    } else {
      setViewYear(today.year);
      setViewMonth(today.month);
    }
    updatePopoverPosition();
    setIsOpen(true);
  };

  const toggleCalendar = () => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
    } else {
      openCalendar();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePopoverPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        wrapperRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleReposition = () => {
      updatePopoverPosition();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, updatePopoverPosition]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow digits and slashes only, with friendly auto-slash insertion when typing forward
    const cleaned = raw.replace(/[^\d/]/g, '');
    let formatted = cleaned;

    if (cleaned.length > textValue.length) {
      const digitsOnly = cleaned.replace(/\//g, '').slice(0, 8);
      if (digitsOnly.length >= 5) {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
      } else if (digitsOnly.length >= 3) {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
      } else {
        formatted = digitsOnly;
      }
    }

    setTextValue(formatted);

    if (formatted === '') {
      onChange('');
      return;
    }

    const parsedIso = parseMMDDYYYYToIso(formatted);
    if (parsedIso) {
      onChange(parsedIso);
      const parts = parseIsoParts(parsedIso);
      if (parts) {
        setViewYear(parts.year);
        setViewMonth(parts.month);
      }
    }
  };

  const handleBlur = () => {
    if (!textValue.trim()) {
      onChange('');
      return;
    }
    const parsedIso = parseMMDDYYYYToIso(textValue);
    if (parsedIso) {
      setTextValue(formatDateMMDDYYYY(parsedIso));
      onChange(parsedIso);
    } else {
      setTextValue(formatDateMMDDYYYY(value));
    }
  };

  const handleSelectIso = (iso: string) => {
    setTextValue(formatDateMMDDYYYY(iso));
    onChange(iso);
    setIsOpen(false);
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const yearOptions = useMemo(() => {
    const maxYear = Math.max(today.year + 6, viewYear + 2);
    const minYear = Math.min(1950, viewYear - 2);
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [today.year, viewYear]);

  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevMonthIndex = viewMonth === 0 ? 11 : viewMonth - 1;
    const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextMonthIndex = viewMonth === 11 ? 0 : viewMonth + 1;

    const cells: Array<{
      iso: string;
      day: number;
      inCurrentMonth: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      cells.push({
        iso: buildIso(prevMonthYear, prevMonthIndex, dayNum),
        day: dayNum,
        inCurrentMonth: false,
      });
    }

    // Days in active month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        iso: buildIso(viewYear, viewMonth, d),
        day: d,
        inCurrentMonth: true,
      });
    }

    // Trailing days to complete 42 cells (6 rows) for stable popover height
    let nextDay = 1;
    while (cells.length < 42) {
      cells.push({
        iso: buildIso(nextMonthYear, nextMonthIndex, nextDay),
        day: nextDay,
        inCurrentMonth: false,
      });
      nextDay++;
    }

    return cells;
  }, [viewYear, viewMonth]);

  const calendarPopover =
    isOpen && popoverCoords && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Choose date"
            style={{
              position: 'fixed',
              top: popoverCoords.top,
              left: popoverCoords.left,
              width: 288,
              zIndex: 9999,
            }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 text-[#0B1F3A] select-none"
          >
            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between gap-1.5 pb-2.5 mb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={goToPrevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 flex-1 justify-center">
                <select
                  aria-label="Month"
                  value={viewMonth}
                  onChange={e => setViewMonth(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-[#0B1F3A] focus:outline-none focus:border-[#0B1F3A] cursor-pointer"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Year"
                  value={viewYear}
                  onChange={e => setViewYear(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-xs font-bold text-[#0B1F3A] tabular-nums focus:outline-none focus:border-[#0B1F3A] cursor-pointer"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={goToNextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-0.5 mb-1 text-center">
              {WEEKDAYS.map(wd => (
                <div
                  key={wd}
                  className="text-[11px] font-bold text-slate-400 py-1 uppercase"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {calendarCells.map(cell => {
                const isSelected = normalizedIso === cell.iso;
                const isToday = today.iso === cell.iso;
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => handleSelectIso(cell.iso)}
                    className={`h-8 w-full rounded-lg text-xs font-semibold tabular-nums transition-colors cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#E31E24] text-white font-extrabold shadow-xs'
                        : isToday
                        ? 'bg-[#0B1F3A]/10 text-[#0B1F3A] font-extrabold ring-1 ring-[#0B1F3A]/40 hover:bg-[#0B1F3A]/20'
                        : cell.inCurrentMonth
                        ? 'text-[#0B1F3A] hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-50 hover:text-slate-500'
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Footer Quick Actions */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => handleSelectIso(today.iso)}
                className="px-2.5 py-1 rounded-lg font-bold text-[#E31E24] hover:bg-red-50 transition-colors cursor-pointer"
              >
                Today
              </button>

              <div className="flex items-center gap-1.5">
                {!required && normalizedIso && (
                  <button
                    type="button"
                    onClick={() => {
                      setTextValue('');
                      onChange('');
                      setIsOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 rounded-lg font-bold text-[#0B1F3A] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={wrapperRef} className="relative flex items-center w-full">
      <input
        type="text"
        inputMode="numeric"
        maxLength={10}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel || 'Date in MM/DD/YYYY format'}
        pattern="\d{2}/\d{2}/\d{4}"
        title="Enter date in MM/DD/YYYY format or pick from calendar"
        value={textValue}
        onClick={() => {
          if (!isOpen) openCalendar();
        }}
        onChange={handleTextChange}
        onBlur={handleBlur}
        className={`${className} pr-9 tabular-nums`}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={toggleCalendar}
        aria-label="Open calendar"
        aria-expanded={isOpen}
        title="Open calendar (MM/DD/YYYY)"
        className={`absolute right-2 p-1 rounded-md transition-colors cursor-pointer disabled:opacity-40 ${
          dark
            ? 'text-slate-200 hover:text-white hover:bg-white/15'
            : 'text-slate-500 hover:text-[#0B1F3A] hover:bg-slate-200/60'
        }`}
      >
        <Calendar className="w-4 h-4" />
      </button>

      {calendarPopover}
    </div>
  );
};
