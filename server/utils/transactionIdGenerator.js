/**
 * Transaction ID Generator Utility
 * Generates unique transaction IDs for payments
 */

class TransactionIdGenerator {
  /**
   * Generate a unique transaction ID
   * @param {string} phoneNumber - User's phone number for uniqueness
   * @param {string} prefix - Optional prefix (default: 'TXN')
   * @returns {string} Unique transaction ID
   */
  static generate(phoneNumber = '', prefix = 'TXN') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    const phoneSuffix = phoneNumber ? phoneNumber.slice(-4) : '';
    
    return `${prefix}_${timestamp}_${random}${phoneSuffix}`;
  }

  /**
   * Generate a transaction ID with custom format
   * @param {Object} options - Generation options
   * @param {string} options.prefix - Transaction prefix
   * @param {string} options.phoneNumber - User's phone number
   * @param {string} options.courseId - Course ID for uniqueness
   * @param {string} options.studentId - Student ID for uniqueness
   * @returns {string} Unique transaction ID
   */
  static generateCustom(options = {}) {
    const {
      prefix = 'TXN',
      phoneNumber = '',
      courseId = '',
      studentId = ''
    } = options;

    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Create unique components
    const phoneSuffix = phoneNumber ? phoneNumber.slice(-3) : '';
    const courseSuffix = courseId ? courseId.slice(-3) : '';
    const studentSuffix = studentId ? studentId.slice(-3) : '';
    
    return `${prefix}_${timestamp}_${random}_${phoneSuffix}${courseSuffix}${studentSuffix}`;
  }

  /**
   * Validate transaction ID format
   * @param {string} transactionId - Transaction ID to validate
   * @returns {boolean} True if valid format
   */
  static validate(transactionId) {
    if (!transactionId || typeof transactionId !== 'string') {
      return false;
    }
    
    // Basic format validation: PREFIX_TIMESTAMP_RANDOM_SUFFIX
    const pattern = /^[A-Z]{2,4}_\d{13}_[A-Z0-9]{6,9}(_[A-Z0-9]{3,6})*$/;
    return pattern.test(transactionId);
  }

  /**
   * Extract timestamp from transaction ID
   * @param {string} transactionId - Transaction ID
   * @returns {number|null} Timestamp or null if invalid
   */
  static extractTimestamp(transactionId) {
    if (!this.validate(transactionId)) {
      return null;
    }
    
    const parts = transactionId.split('_');
    if (parts.length >= 2) {
      const timestamp = parseInt(parts[1]);
      return isNaN(timestamp) ? null : timestamp;
    }
    
    return null;
  }

  /**
   * Check if transaction ID is recent (within specified hours)
   * @param {string} transactionId - Transaction ID
   * @param {number} hours - Hours threshold (default: 24)
   * @returns {boolean} True if recent
   */
  static isRecent(transactionId, hours = 24) {
    const timestamp = this.extractTimestamp(transactionId);
    if (!timestamp) {
      return false;
    }
    
    const now = Date.now();
    const hoursInMs = hours * 60 * 60 * 1000;
    
    return (now - timestamp) <= hoursInMs;
  }
}

module.exports = TransactionIdGenerator;
