/**
 * Phone number utilities - E.164 international format
 * Uses libphonenumber-js for validation and normalization.
 * Supports any country; no Egypt-only logic.
 */

const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

/**
 * Normalize phone input to E.164 format (+countrycode + national number)
 * Accepts: E.164 (+201234567890), national with leading 0 (01234567890), or digits only with default country
 * @param {string} input - Raw phone string
 * @param {string} [defaultCountry='EG'] - Default country code (ISO 3166-1 alpha-2) when input has no +
 * @returns {string|null} - E.164 string or null if invalid
 */
function toE164(input, defaultCountry = 'EG') {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim().replace(/\s+/g, '');
  if (!trimmed) return null;

  // If already E.164, parse and return normalized
  if (trimmed.startsWith('+')) {
    try {
      const parsed = parsePhoneNumber(trimmed);
      return parsed && parsed.isValid() ? parsed.number : null;
    } catch {
      return null;
    }
  }

  // National format: try with default country
  try {
    const parsed = parsePhoneNumber(trimmed, defaultCountry);
    return parsed && parsed.isValid() ? parsed.number : null;
  } catch {
    return null;
  }
}

/**
 * Validate phone number (any country)
 * @param {string} input - Phone string (E.164 or national with defaultCountry)
 * @param {string} [defaultCountry='EG'] - Default country when input has no +
 * @returns {boolean}
 */
function isValidPhone(input, defaultCountry = 'EG') {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim().replace(/\s+/g, '');
  if (!trimmed) return false;
  if (trimmed.startsWith('+')) return isValidPhoneNumber(trimmed);
  return isValidPhoneNumber(trimmed, defaultCountry);
}

/**
 * Normalize for storage/lookup: always return E.164 or null
 * Use this before saving to DB or when looking up user by phone
 * @param {string} input
 * @param {string} [defaultCountry='EG']
 * @returns {string|null}
 */
function normalizeForStorage(input, defaultCountry = 'EG') {
  return toE164(input, defaultCountry);
}

module.exports = {
  toE164,
  isValidPhone,
  normalizeForStorage,
};
