/**
 * Phone number utilities - E.164 international format.
 * Delegates to normalizePhone.js for single source of truth.
 * Supports any country; backward compatible with legacy local (EG) format.
 */

const { normalizePhone } = require('./normalizePhone');

/**
 * Normalize for storage/lookup: always return E.164 or null.
 * Use this before saving to DB. Does not throw.
 * @param {string} input
 * @param {string} [defaultCountry='EG']
 * @returns {string|null}
 */
function normalizeForStorage(input, defaultCountry = 'EG') {
  try {
    return normalizePhone(input, defaultCountry);
  } catch {
    return null;
  }
}

/**
 * Validate phone number (any country).
 * @param {string} input - Phone string (E.164 or national with defaultCountry)
 * @param {string} [defaultCountry='EG'] - Default country when input has no +
 * @returns {boolean}
 */
function isValidPhone(input, defaultCountry = 'EG') {
  try {
    normalizePhone(input, defaultCountry);
    return true;
  } catch {
    return false;
  }
}

/**
 * @deprecated Use normalizePhone from ./normalizePhone or normalizeForStorage
 * Normalize phone input to E.164. Returns null if invalid.
 */
function toE164(input, defaultCountry = 'EG') {
  return normalizeForStorage(input, defaultCountry);
}

module.exports = {
  toE164,
  isValidPhone,
  normalizeForStorage,
};
