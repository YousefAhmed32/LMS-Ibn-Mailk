const mongoose = require('mongoose');

/**
 * MongoDB Error Handler Utility
 * Handles various MongoDB errors and returns user-friendly messages
 */
class MongoDBErrorHandler {
  /**
   * Handle MongoDB duplicate key errors
   * @param {Error} error - The MongoDB error
   * @param {string} field - The field that caused the duplicate
   * @returns {Object} Formatted error response
   */
  static handleDuplicateKeyError(error, field = 'field') {
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyPattern)[0];
      const duplicateValue = error.keyValue[duplicateKey];
      
      // Handle specific field duplicates
      switch (duplicateKey) {
        case 'transactionId':
          return {
            status: 409,
            success: false,
            error: 'Payment already submitted',
            message: `A payment with transaction ID "${duplicateValue}" already exists. Please use a different transaction ID or contact support if this is an error.`,
            code: 'DUPLICATE_TRANSACTION_ID',
            details: {
              field: 'transactionId',
              value: duplicateValue,
              suggestion: 'Use a unique transaction ID from your payment app'
            }
          };
        
        case 'userEmail':
          return {
            status: 409,
            success: false,
            error: 'Email already registered',
            message: `An account with email "${duplicateValue}" already exists. Please use a different email or try logging in.`,
            code: 'DUPLICATE_EMAIL',
            details: {
              field: 'userEmail',
              value: duplicateValue,
              suggestion: 'Use a different email address or try logging in'
            }
          };
        
        case 'phoneStudent':
        case 'phoneNumber':
          return {
            status: 409,
            success: false,
            error: 'Phone number already registered',
            message: `An account with phone number "${duplicateValue}" already exists. Please use a different phone number.`,
            code: 'DUPLICATE_PHONE',
            details: {
              field: duplicateKey,
              value: duplicateValue,
              suggestion: 'Use a different phone number'
            }
          };
        
        default:
          return {
            status: 409,
            success: false,
            error: 'Duplicate entry',
            message: `A record with this ${duplicateKey} already exists.`,
            code: 'DUPLICATE_KEY',
            details: {
              field: duplicateKey,
              value: duplicateValue
            }
          };
      }
    }
    
    return null;
  }

  /**
   * Handle MongoDB validation errors
   * @param {Error} error - The MongoDB validation error
   * @returns {Object} Formatted error response
   */
  static handleValidationError(error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));

      return {
        status: 400,
        success: false,
        error: 'Validation failed',
        message: 'Please check your input and try again.',
        code: 'VALIDATION_ERROR',
        details: errors
      };
    }
    
    return null;
  }

  /**
   * Handle MongoDB cast errors
   * @param {Error} error - The MongoDB cast error
   * @returns {Object} Formatted error response
   */
  static handleCastError(error) {
    if (error instanceof mongoose.Error.CastError) {
      return {
        status: 400,
        success: false,
        error: 'Invalid ID format',
        message: `Invalid ${error.path}: ${error.value}. Please provide a valid ID.`,
        code: 'CAST_ERROR',
        details: {
          field: error.path,
          value: error.value,
          suggestion: 'Ensure the ID is in the correct format'
        }
      };
    }
    
    return null;
  }

  /**
   * Handle general MongoDB errors
   * @param {Error} error - The MongoDB error
   * @returns {Object} Formatted error response
   */
  static handleGeneralError(error) {
    return {
      status: 500,
      success: false,
      error: 'Database error',
      message: 'An unexpected database error occurred. Please try again later.',
      code: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }

  /**
   * Main error handler that processes MongoDB errors
   * @param {Error} error - The error to handle
   * @param {string} context - Additional context for the error
   * @returns {Object} Formatted error response
   */
  static handle(error, context = '') {
    console.error(`MongoDB Error${context ? ` in ${context}` : ''}:`, error);

    // Try different error handlers in order of specificity
    const duplicateError = this.handleDuplicateKeyError(error);
    if (duplicateError) return duplicateError;

    const validationError = this.handleValidationError(error);
    if (validationError) return validationError;

    const castError = this.handleCastError(error);
    if (castError) return castError;

    // Fallback to general error handler
    return this.handleGeneralError(error);
  }

  /**
   * Check if a transaction ID already exists
   * @param {string} transactionId - The transaction ID to check
   * @param {mongoose.Model} PaymentModel - The Payment model
   * @returns {Promise<boolean>} True if transaction ID exists
   */
  static async checkTransactionIdExists(transactionId, PaymentModel) {
    if (!transactionId) return false;
    
    try {
      const existingPayment = await PaymentModel.findOne({ 
        transactionId: transactionId.trim() 
      });
      return !!existingPayment;
    } catch (error) {
      console.error('Error checking transaction ID:', error);
      return false;
    }
  }

  /**
   * Generate a unique transaction ID
   * @param {string} phoneNumber - User's phone number for uniqueness
   * @returns {string} Unique transaction ID
   */
  static generateUniqueTransactionId(phoneNumber = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    const phoneSuffix = phoneNumber ? phoneNumber.slice(-4) : '';
    
    return `TXN_${timestamp}_${random}${phoneSuffix}`;
  }
}

module.exports = MongoDBErrorHandler;
