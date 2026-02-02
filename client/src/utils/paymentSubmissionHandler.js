/**
 * Frontend Payment Submission Handler
 * Prevents duplicate submissions and provides better UX
 */
import { isValidPhone } from './phoneUtils';

class PaymentSubmissionHandler {
  constructor() {
    this.submitting = false;
    this.submitButton = null;
    this.originalButtonText = '';
    this.submitTimeout = null;
  }

  /**
   * Initialize the payment form submission handler
   * @param {string} formId - The form ID to attach to
   * @param {string} submitButtonId - The submit button ID
   */
  init(formId, submitButtonId) {
    const form = document.getElementById(formId);
    const submitButton = document.getElementById(submitButtonId);
    
    if (!form || !submitButton) {
      console.error('Payment form or submit button not found');
      return;
    }

    this.submitButton = submitButton;
    this.originalButtonText = submitButton.textContent;

    // Add event listener to form submission
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Add visual feedback for form changes
    this.addFormChangeListener(form);
  }

  /**
   * Handle form submission with duplicate prevention
   * @param {Event} event - The form submit event
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.submitting) {
      console.log('Payment submission already in progress');
      this.showMessage('Payment submission in progress...', 'warning');
      return;
    }

    this.submitting = true;
    this.disableSubmitButton();

    try {
      const formData = new FormData(event.target);
      
      // Add client-side validation
      const validationResult = this.validateFormData(formData);
      if (!validationResult.isValid) {
        throw new Error(validationResult.message);
      }

      // Show loading state
      this.showMessage('Submitting payment...', 'info');

      // Submit the payment
      const response = await this.submitPayment(formData);
      
      if (response.success) {
        this.showMessage('Payment submitted successfully!', 'success');
        this.handleSuccessResponse(response);
      } else {
        throw new Error(response.message || 'Payment submission failed');
      }

    } catch (error) {
      console.error('Payment submission error:', error);
      this.handleSubmissionError(error);
    } finally {
      this.submitting = false;
      this.enableSubmitButton();
    }
  }

  /**
   * Submit payment to the server
   * @param {FormData} formData - The form data to submit
   * @returns {Promise<Object>} The server response
   */
  async submitPayment(formData) {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 409 && data.code === 'DUPLICATE_TRANSACTION_ID') {
        throw new Error('This transaction ID has already been used. Please use a different transaction ID.');
      }
      
      if (response.status === 400 && data.code === 'DUPLICATE_PENDING_PAYMENT') {
        throw new Error('You already have a pending payment for this course. Please wait for admin approval.');
      }

      throw new Error(data.message || data.error || 'Payment submission failed');
    }

    return data;
  }

  /**
   * Validate form data before submission
   * @param {FormData} formData - The form data to validate
   * @returns {Object} Validation result
   */
  validateFormData(formData) {
    const requiredFields = ['courseId', 'studentName', 'studentPhone', 'amount'];
    
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return {
          isValid: false,
          message: `Please fill in the ${field} field`
        };
      }
    }

    const phoneNumber = formData.get('studentPhone');
    if (!phoneNumber || !isValidPhone(phoneNumber)) {
      return {
        isValid: false,
        message: 'Please enter a valid international phone number (e.g. +201234567890)'
      };
    }

    // Validate amount
    const amount = parseFloat(formData.get('amount'));
    if (isNaN(amount) || amount <= 0) {
      return {
        isValid: false,
        message: 'Please enter a valid payment amount'
      };
    }

    // Check if screenshot is uploaded
    const screenshot = formData.get('screenshot');
    if (!screenshot || screenshot.size === 0) {
      return {
        isValid: false,
        message: 'Please upload a payment screenshot'
      };
    }

    return { isValid: true };
  }

  /**
   * Handle successful payment submission
   * @param {Object} response - The server response
   */
  handleSuccessResponse(response) {
    // Show success message
    this.showMessage('Payment submitted successfully! Redirecting...', 'success');
    
    // Redirect after a short delay
    setTimeout(() => {
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
      } else {
        window.location.href = '/';
      }
    }, 2000);
  }

  /**
   * Handle submission errors
   * @param {Error} error - The error that occurred
   */
  handleSubmissionError(error) {
    let message = error.message || 'An unexpected error occurred';
    
    // Handle specific error types
    if (message.includes('transaction ID')) {
      this.showMessage(message, 'error');
      this.highlightTransactionIdField();
    } else if (message.includes('pending payment')) {
      this.showMessage(message, 'warning');
    } else {
      this.showMessage(message, 'error');
    }
  }

  /**
   * Disable submit button and show loading state
   */
  disableSubmitButton() {
    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Submitting...';
      this.submitButton.classList.add('loading');
    }
  }

  /**
   * Enable submit button and restore original state
   */
  enableSubmitButton() {
    if (this.submitButton) {
      this.submitButton.disabled = false;
      this.submitButton.textContent = this.originalButtonText;
      this.submitButton.classList.remove('loading');
    }
  }

  /**
   * Show message to user
   * @param {string} message - The message to show
   * @param {string} type - The message type (success, error, warning, info)
   */
  showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessage = document.querySelector('.payment-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = `payment-message payment-message--${type}`;
    messageElement.textContent = message;

    // Add styles
    messageElement.style.cssText = `
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 8px;
      font-weight: 500;
      text-align: center;
      animation: slideIn 0.3s ease-out;
    `;

    // Set colors based on type
    const colors = {
      success: 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;',
      error: 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;',
      warning: 'background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7;',
      info: 'background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;'
    };

    messageElement.style.cssText += colors[type] || colors.info;

    // Insert message
    const form = document.querySelector('form');
    if (form) {
      form.insertBefore(messageElement, form.firstChild);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 5000);
  }

  /**
   * Highlight transaction ID field for user attention
   */
  highlightTransactionIdField() {
    const transactionIdField = document.querySelector('input[name="transactionId"]');
    if (transactionIdField) {
      transactionIdField.style.borderColor = '#dc3545';
      transactionIdField.style.backgroundColor = '#fff5f5';
      transactionIdField.focus();
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        transactionIdField.style.borderColor = '';
        transactionIdField.style.backgroundColor = '';
      }, 3000);
    }
  }

  /**
   * Add form change listener to provide real-time feedback
   * @param {HTMLElement} form - The form element
   */
  addFormChangeListener(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        // Remove any existing error styling
        input.style.borderColor = '';
        input.style.backgroundColor = '';
      });
    });
  }

  /**
   * Get authentication token from localStorage
   * @returns {string} The auth token
   */
  getAuthToken() {
    return localStorage.getItem('token') || '';
  }

  /**
   * Generate a unique transaction ID suggestion
   * @param {string} phoneNumber - User's phone number
   * @returns {string} Suggested transaction ID
   */
  generateTransactionIdSuggestion(phoneNumber = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    const phoneSuffix = phoneNumber ? phoneNumber.slice(-4) : '';
    
    return `TXN_${timestamp}_${random}${phoneSuffix}`;
  }

  /**
   * Suggest a unique transaction ID to the user
   */
  suggestTransactionId() {
    const phoneField = document.querySelector('input[name="studentPhone"]');
    const transactionIdField = document.querySelector('input[name="transactionId"]');
    
    if (phoneField && transactionIdField && !transactionIdField.value) {
      const phoneNumber = phoneField.value;
      const suggestion = this.generateTransactionIdSuggestion(phoneNumber);
      
      transactionIdField.placeholder = `Suggested: ${suggestion}`;
      
      // Add click handler to use suggestion
      transactionIdField.addEventListener('click', () => {
        if (!transactionIdField.value) {
          transactionIdField.value = suggestion;
        }
      });
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentSubmissionHandler;
} else {
  window.PaymentSubmissionHandler = PaymentSubmissionHandler;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const handler = new PaymentSubmissionHandler();
    handler.init('payment-form', 'submit-payment-btn');
    handler.suggestTransactionId();
  });
} else {
  const handler = new PaymentSubmissionHandler();
  handler.init('payment-form', 'submit-payment-btn');
  handler.suggestTransactionId();
}
