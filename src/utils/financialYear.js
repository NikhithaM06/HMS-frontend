/**
 * Financial Year Configuration & Utilities for HMS MMA
 * 
 * Standard Indian Financial Year Definition:
 * - Period: 1st April of startYear to 31st March of endYear
 * - Format: YYYY-YY (e.g. 2026-27)
 * - All calculations are dynamic based on calendar date or specific input date.
 */

const STORAGE_KEYS = {
  ACTIVE_FINANCIAL_YEAR: 'hms_active_financial_year_v1'
};

/**
 * Calculates the Indian Financial Year string (e.g., "2026-27") for a given date.
 * If no date is passed, defaults to the current date.
 * 
 * @param {Date|string|number} [dateInput] - Date object, ISO string, or timestamp
 * @returns {string} Financial Year in "YYYY-YY" format (e.g., "2026-27")
 * 
 * @example
 * getFinancialYear('2026-03-31') // Returns "2025-26"
 * getFinancialYear('2026-04-01') // Returns "2026-27"
 * getFinancialYear('2026-10-08') // Returns "2026-27"
 */
export const getFinancialYear = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    const now = new Date();
    return getFinancialYear(now);
  }

  const year = d.getFullYear();
  // In JS, getMonth() is 0-indexed: 0 = Jan, 2 = Mar, 3 = Apr, 11 = Dec
  const month = d.getMonth();

  let startYear;
  if (month >= 3) {
    // April (month 3) to December (month 11) -> startYear is current year
    startYear = year;
  } else {
    // January (month 0) to March (month 2) -> startYear is previous year
    startYear = year - 1;
  }

  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endYearShort}`;
};

/**
 * Returns the current Financial Year dynamically based on today's date.
 * 
 * @returns {string} e.g. "2026-27"
 */
export const getCurrentFinancialYear = () => {
  return getFinancialYear(new Date());
};

/**
 * Parses an Indian Financial Year string (e.g., "2026-27" or "2026-2027")
 * and returns the start date, end date, and year boundaries.
 * 
 * @param {string} [fyString] - Financial Year string (e.g. "2026-27"). Defaults to current FY.
 * @returns {{ startYear: number, endYear: number, startDate: string, endDate: string, label: string }}
 */
export const getFinancialYearRange = (fyString) => {
  const targetFY = fyString || getCurrentFinancialYear();
  const parts = String(targetFY).trim().split('-');
  
  let startYear = parseInt(parts[0], 10);
  if (isNaN(startYear) || startYear < 1900 || startYear > 2100) {
    const current = new Date();
    startYear = current.getMonth() >= 3 ? current.getFullYear() : current.getFullYear() - 1;
  }

  const endYear = startYear + 1;
  const endYearShort = String(endYear % 100).padStart(2, '0');
  const label = `${startYear}-${endYearShort}`;

  return {
    startYear,
    endYear,
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`,
    label
  };
};

/**
 * Generates an array of Financial Year options for dropdowns/selectors.
 * Spans backwards and forwards from the current dynamically calculated FY.
 * 
 * @param {number} [pastYears=5] - Number of previous financial years to include
 * @param {number} [futureYears=3] - Number of upcoming financial years to include
 * @returns {Array<{ value: string, label: string, isCurrent: boolean, startDate: string, endDate: string }>}
 */
export const getFinancialYearOptions = (pastYears = 5, futureYears = 3) => {
  const currentFY = getCurrentFinancialYear();
  const currentRange = getFinancialYearRange(currentFY);
  const baseStartYear = currentRange.startYear;

  const options = [];
  const startFrom = baseStartYear - pastYears;
  const endAt = baseStartYear + futureYears;

  for (let y = endAt; y >= startFrom; y--) {
    const endShort = String((y + 1) % 100).padStart(2, '0');
    const fyVal = `${y}-${endShort}`;
    options.push({
      value: fyVal,
      label: `FY ${fyVal}`,
      shortLabel: fyVal,
      isCurrent: fyVal === currentFY,
      startDate: `${y}-04-01`,
      endDate: `${y + 1}-03-31`,
      startYear: y,
      endYear: y + 1
    });
  }

  return options;
};

/**
 * Checks whether a given date falls within a specified Financial Year.
 * 
 * @param {Date|string|number} dateInput - The date to check
 * @param {string} [fyString] - The FY string (e.g. "2026-27"). Defaults to current FY.
 * @returns {boolean}
 */
export const isDateInFinancialYear = (dateInput, fyString) => {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  
  const targetFY = fyString || getCurrentFinancialYear();
  const dateFY = getFinancialYear(d);
  return dateFY === targetFY;
};

/**
 * Retrieves the currently active/selected Financial Year from localStorage.
 * If not explicitly saved or invalid, dynamically falls back to the current date's FY.
 * 
 * @returns {string} e.g. "2026-27"
 */
export const getStoredActiveFinancialYear = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_FINANCIAL_YEAR);
    if (saved && /^\d{4}-\d{2}$/.test(saved.trim())) {
      return saved.trim();
    }
  } catch (e) {
    console.error('Failed to read active financial year from storage', e);
  }
  return getCurrentFinancialYear();
};

/**
 * Persists user-selected active Financial Year to localStorage.
 * 
 * @param {string} fyString - e.g. "2026-27"
 */
export const saveStoredActiveFinancialYear = (fyString) => {
  try {
    if (fyString && /^\d{4}-\d{2}$/.test(String(fyString).trim())) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_FINANCIAL_YEAR, String(fyString).trim());
    }
  } catch (e) {
    console.error('Failed to save active financial year to storage', e);
  }
};
