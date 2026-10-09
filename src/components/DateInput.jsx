import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDate, toISODate } from '../utils/dateUtils';

/**
 * Standardized Date Input component that ALWAYS displays dates in DD-MM-YYYY format
 * while maintaining ISO (YYYY-MM-DD) values for form handlers & backend APIs.
 */
export default function DateInput({
  value = '',
  onChange,
  name,
  id,
  placeholder = 'DD-MM-YYYY',
  min,
  max,
  disabled = false,
  required = false,
  className = '',
  iconClassName = '',
  autoFocus = false,
  ...props
}) {
  const hiddenDateInputRef = useRef(null);

  // Convert incoming value (could be YYYY-MM-DD or DD-MM-YYYY) to DD-MM-YYYY display value
  const displayValue = value ? formatDate(value, '') : '';
  const isoValue = value ? toISODate(value) : '';

  const handleDisplayChange = (e) => {
    let raw = e.target.value.replace(/[^\d-]/g, '');
    
    // Auto-hyphenate DD-MM-YYYY as user types
    if (raw.length === 2 && !raw.includes('-')) {
      raw = raw + '-';
    } else if (raw.length === 5 && raw.split('-').length === 2) {
      raw = raw + '-';
    }
    raw = raw.slice(0, 10);

    // If fully valid DD-MM-YYYY, convert to ISO for parent form
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      const iso = toISODate(raw);
      if (onChange) {
        onChange({
          ...e,
          target: {
            ...e.target,
            name: name || id,
            value: iso
          }
        });
      }
    } else {
      if (onChange) {
        onChange({
          ...e,
          target: {
            ...e.target,
            name: name || id,
            value: raw
          }
        });
      }
    }
  };

  const handlePickerChange = (e) => {
    const selectedIso = e.target.value; // YYYY-MM-DD from native date picker
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          name: name || id,
          value: selectedIso
        }
      });
    }
  };

  const openPicker = () => {
    if (disabled) return;
    if (hiddenDateInputRef.current) {
      try {
        if (typeof hiddenDateInputRef.current.showPicker === 'function') {
          hiddenDateInputRef.current.showPicker();
        } else {
          hiddenDateInputRef.current.focus();
          hiddenDateInputRef.current.click();
        }
      } catch (err) {
        hiddenDateInputRef.current.focus();
        hiddenDateInputRef.current.click();
      }
    }
  };

  return (
    <div className="relative flex items-center w-full">
      {/* Visual Text Field showing DD-MM-YYYY */}
      <input
        type="text"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleDisplayChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        className={`w-full text-xs sm:text-sm tracking-wide bg-white font-mono ${className}`}
        {...props}
      />

      {/* Calendar Icon Button to trigger native date picker */}
      <button
        type="button"
        tabIndex={-1}
        onClick={openPicker}
        disabled={disabled}
        aria-label="Choose date"
        className={`absolute right-2.5 p-1 text-stone-400 hover:text-[#510601] transition-colors rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${iconClassName}`}
      >
        <Calendar className="w-4 h-4" />
      </button>

      {/* Hidden native date picker */}
      <input
        ref={hiddenDateInputRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={isoValue}
        min={min ? toISODate(min) : undefined}
        max={max ? toISODate(max) : undefined}
        onChange={handlePickerChange}
        disabled={disabled}
        className="sr-only absolute opacity-0 pointer-events-none w-0 h-0"
      />
    </div>
  );
}
