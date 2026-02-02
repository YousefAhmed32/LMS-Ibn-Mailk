/**
 * Client phone utils - E.164 validation (international)
 * Uses libphonenumber-js (via react-phone-number-input dependency or direct)
 */
import { isValidPhoneNumber } from 'react-phone-number-input';

/**
 * Validate international phone number (E.164 or national with default country)
 * @param {string} value - Phone string
 * @param {string} [defaultCountry] - Default country code when value has no +
 * @returns {boolean}
 */
export function isValidPhone(value, defaultCountry = 'EG') {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    return isValidPhoneNumber(trimmed, defaultCountry);
  } catch {
    return false;
  }
}

/**
 * E.164 regex (loose): + followed by 7–15 digits
 * Use for quick format check; prefer isValidPhone for real validation
 */
export const E164_REGEX = /^\+[1-9]\d{6,14}$/;
