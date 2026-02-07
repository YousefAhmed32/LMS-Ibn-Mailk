/**
 * Production phone normalization and backward-compatibility helpers.
 * Single source of truth for E.164 storage and legacy login lookup.
 * Uses libphonenumber-js.
 */

const { parsePhoneNumber } = require('libphonenumber-js');

const DEFAULT_COUNTRY = 'EG';

/**
 * Clean raw input: trim, remove spaces and dashes.
 * @param {string} input
 * @returns {string}
 */
function cleanInput(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '');
}

/**
 * Remove duplicate leading zero after country code (e.g. +20 0106657702 → +20106657702).
 * Only strip when 0 is followed by another 0 (trunk duplicate), so +20 106657702 is unchanged.
 * @param {string} cleaned - Already trimmed, no spaces/dashes
 * @returns {string}
 */
function stripLeadingZeroAfterCountryCode(cleaned) {
  if (!cleaned.startsWith('+')) return cleaned;
  return cleaned.replace(/^(\+\d{1,3})0(?=0)/, '$1');
}

/**
 * Normalize any user input to E.164. Throws if invalid.
 * Rules:
 * - Remove spaces and dashes
 * - Remove duplicate leading zero after country code
 * - Use default country "EG" only when number starts with 0 and has no +
 * - Always return E.164
 *
 * @param {string} input - Raw phone (e.g. 0106657702, +20 0106657702, +971 55 635 6789)
 * @param {string} [defaultCountry='EG'] - Default when input has no + (e.g. 0106657702)
 * @returns {string} E.164 (e.g. +20106657702, +971556356789)
 * @throws {Error} When input is invalid
 */
function normalizePhone(input, defaultCountry = DEFAULT_COUNTRY) {
  const cleaned = cleanInput(input);
  if (!cleaned) {
    throw new Error('Phone number is required');
  }

  let toParse = cleaned;
  if (cleaned.startsWith('+')) {
    toParse = stripLeadingZeroAfterCountryCode(cleaned);
  }

  const useDefaultCountry = toParse.startsWith('0') && !toParse.startsWith('+');
  const parsed = useDefaultCountry
    ? parsePhoneNumber(toParse, defaultCountry)
    : parsePhoneNumber(toParse);

  if (!parsed) {
    throw new Error('Invalid phone number');
  }
  if (!parsed.isValid()) {
    throw new Error('Invalid phone number');
  }

  return parsed.number;
}

/**
 * For login backward compatibility: get legacy local format for Egypt only.
 * E.g. +20106657702 → 0106657702 (so old DB records still match).
 *
 * @param {string} e164 - E.164 string (e.g. +20106657702)
 * @returns {string|null} Legacy local format for Egypt, or null for other countries
 */
function getLegacyLocalForLogin(e164) {
  if (!e164 || typeof e164 !== 'string' || !e164.startsWith('+')) return null;
  try {
    const parsed = parsePhoneNumber(e164);
    if (!parsed || parsed.country !== 'EG') return null;
    return '0' + parsed.nationalNumber;
  } catch {
    return null;
  }
}

/**
 * Build list of phone values to use in $or query for login (normalized + legacy if Egypt).
 *
 * @param {string} input - Raw login input
 * @param {string} [defaultCountry='EG']
 * @returns {{ normalized: string, candidates: string[] }} normalized E.164 and array for $or (unique)
 */
function getPhoneCandidatesForLogin(input, defaultCountry = DEFAULT_COUNTRY) {
  const normalized = normalizePhone(input, defaultCountry);
  const legacy = getLegacyLocalForLogin(normalized);
  const candidates = legacy ? [normalized, legacy] : [normalized];
  return { normalized, candidates };
}

module.exports = {
  normalizePhone,
  getLegacyLocalForLogin,
  getPhoneCandidatesForLogin,
  cleanInput,
  stripLeadingZeroAfterCountryCode
};
