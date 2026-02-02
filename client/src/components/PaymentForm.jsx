/**
 * Enhanced Payment Submission Handler for React
 * Handles payment submission with duplicate prevention and error handling
 */

import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { isValidPhone } from '../utils/phoneUtils';
import PhoneInput from './ui/PhoneInput';

// Custom hook for payment submission
export const usePaymentSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const submitTimeoutRef = useRef(null);

  const submitPayment = useCallback(async (paymentData) => {
    // Prevent double submission
    if (isSubmitting) {
      console.warn('Payment submission already in progress');
      return { success: false, error: 'Submission already in progress' };
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add payment data
      Object.keys(paymentData).forEach(key => {
        if (paymentData[key] !== null && paymentData[key] !== undefined) {
          formData.append(key, paymentData[key]);
        }
      });

      // Submit payment
      const response = await axios.post('/api/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.success) {
        setSuccess(true);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
          redirectUrl: response.data.redirectUrl
        };
      } else {
        throw new Error(response.data.message || 'Payment submission failed');
      }

    } catch (error) {
      console.error('Payment submission error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      let errorCode = 'UNKNOWN_ERROR';
      let errorDetails = null;

      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        switch (status) {
          case 409:
            errorMessage = data.message || 'Transaction ID already exists';
            errorCode = data.code || 'DUPLICATE_TRANSACTION_ID';
            errorDetails = data.details;
            break;
          case 400:
            errorMessage = data.message || 'Invalid payment data';
            errorCode = data.code || 'VALIDATION_ERROR';
            errorDetails = data.details;
            break;
          case 404:
            errorMessage = data.message || 'Course not found';
            errorCode = data.code || 'COURSE_NOT_FOUND';
            break;
          case 500:
            errorMessage = data.message || 'Server error occurred';
            errorCode = data.code || 'SERVER_ERROR';
            break;
          default:
            errorMessage = data.message || `Error ${status}: ${data.error}`;
            errorCode = data.code || 'HTTP_ERROR';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
        errorCode = 'NETWORK_ERROR';
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred';
        errorCode = 'CLIENT_ERROR';
      }

      const errorObj = {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
        originalError: error
      };

      setError(errorObj);
      return { success: false, error: errorObj };

    } finally {
      setIsSubmitting(false);
      
      // Clear success state after 5 seconds
      if (success) {
        submitTimeoutRef.current = setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    }
  }, [isSubmitting, success]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  return {
    submitPayment,
    isSubmitting,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false)
  };
};

// Payment Form Component
export const PaymentForm = ({ onSubmit, onSuccess, onError }) => {
  const {
    submitPayment,
    isSubmitting,
    error,
    success,
    clearError
  } = usePaymentSubmission();

  const [formData, setFormData] = useState({
    courseId: '',
    studentName: '',
    studentPhone: '',
    amount: '',
    transactionId: '',
    screenshot: null
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'screenshot') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear general error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.courseId) {
      errors.courseId = 'Please select a course';
    }

    if (!formData.studentName.trim()) {
      errors.studentName = 'Student name is required';
    }

    if (!formData.studentPhone) {
      errors.studentPhone = 'Phone number is required';
    } else if (!isValidPhone(formData.studentPhone)) {
      errors.studentPhone = 'Please enter a valid international phone number (e.g. +201234567890)';
    }

    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Please enter a valid amount';
      }
    }

    if (!formData.screenshot) {
      errors.screenshot = 'Payment screenshot is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await submitPayment(formData);

    if (result.success) {
      onSuccess?.(result);
    } else {
      onError?.(result.error);
    }

    onSubmit?.(result);
  };

  // Generate transaction ID suggestion
  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    const phoneSuffix = formData.studentPhone ? formData.studentPhone.slice(-4) : '';
    
    const suggestion = `TXN_${timestamp}_${random}${phoneSuffix}`;
    setFormData(prev => ({ ...prev, transactionId: suggestion }));
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      {/* Error Display */}
      {error && (
        <div className="error-message">
          <div className="error-content">
            <h4>❌ {error.message}</h4>
            {error.details && (
              <div className="error-details">
                {error.code === 'DUPLICATE_TRANSACTION_ID' && (
                  <p>💡 <strong>Suggestion:</strong> {error.details.suggestion}</p>
                )}
                {error.code === 'VALIDATION_ERROR' && error.details && (
                  <ul>
                    {error.details.map((detail, index) => (
                      <li key={index}>{detail.field}: {detail.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <button type="button" onClick={clearError} className="close-error">
            ✕
          </button>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="success-message">
          <h4>✅ Payment submitted successfully!</h4>
          <p>Please wait for admin approval.</p>
        </div>
      )}

      {/* Form Fields */}
      <div className="form-group">
        <label htmlFor="courseId">Course *</label>
        <select
          id="courseId"
          name="courseId"
          value={formData.courseId}
          onChange={handleInputChange}
          className={validationErrors.courseId ? 'error' : ''}
          disabled={isSubmitting}
        >
          <option value="">Select a course</option>
          {/* Course options will be populated dynamically */}
        </select>
        {validationErrors.courseId && (
          <span className="field-error">{validationErrors.courseId}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="studentName">Student Name *</label>
        <input
          type="text"
          id="studentName"
          name="studentName"
          value={formData.studentName}
          onChange={handleInputChange}
          className={validationErrors.studentName ? 'error' : ''}
          disabled={isSubmitting}
          placeholder="Enter student's full name"
        />
        {validationErrors.studentName && (
          <span className="field-error">{validationErrors.studentName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="studentPhone">Phone Number *</label>
        <div className={validationErrors.studentPhone ? 'rounded-md border border-red-500' : ''}>
          <PhoneInput
            id="studentPhone"
            value={formData.studentPhone}
            onChange={(val) => {
              setFormData(prev => ({ ...prev, studentPhone: val || '' }));
              if (validationErrors.studentPhone) {
                setValidationErrors(prev => ({ ...prev, studentPhone: '' }));
              }
            }}
            placeholder="+201234567890"
            defaultCountry="EG"
            disabled={isSubmitting}
            className={validationErrors.studentPhone ? '!border-0' : ''}
          />
        </div>
        {validationErrors.studentPhone && (
          <span className="field-error">{validationErrors.studentPhone}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount (EGP) *</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          className={validationErrors.amount ? 'error' : ''}
          disabled={isSubmitting}
          placeholder="0.00"
          step="0.01"
        />
        {validationErrors.amount && (
          <span className="field-error">{validationErrors.amount}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="transactionId">
          Transaction ID
          <button
            type="button"
            onClick={generateTransactionId}
            className="generate-btn"
            disabled={isSubmitting}
            title="Generate unique transaction ID"
          >
            🎲 Generate
          </button>
        </label>
        <input
          type="text"
          id="transactionId"
          name="transactionId"
          value={formData.transactionId}
          onChange={handleInputChange}
          disabled={isSubmitting}
          placeholder="Leave empty for auto-generation"
        />
        <small className="help-text">
          Enter the transaction ID from your payment app, or leave empty for auto-generation
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="screenshot">Payment Screenshot *</label>
        <input
          type="file"
          id="screenshot"
          name="screenshot"
          onChange={handleInputChange}
          className={validationErrors.screenshot ? 'error' : ''}
          disabled={isSubmitting}
          accept="image/*"
        />
        {validationErrors.screenshot && (
          <span className="field-error">{validationErrors.screenshot}</span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="spinner"></span>
            Submitting...
          </>
        ) : (
          'Submit Payment'
        )}
      </button>
    </form>
  );
};

// Utility function to check transaction ID availability
export const checkTransactionIdAvailability = async (transactionId) => {
  try {
    const response = await axios.get('/api/payments/check-transaction-id', {
      params: { transactionId },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return {
      success: true,
      exists: response.data.exists,
      message: response.data.message
    };
  } catch (error) {
    console.error('Check transaction ID error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to check transaction ID'
    };
  }
};

// CSS Styles (add to your CSS file)
export const paymentFormStyles = `
.payment-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.error-content h4 {
  margin: 0 0 8px 0;
  color: #c33;
}

.error-details {
  font-size: 14px;
  color: #666;
}

.close-error {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #c33;
}

.success-message {
  background: #efe;
  border: 1px solid #cfc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.success-message h4 {
  margin: 0 0 8px 0;
  color: #363;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.field-error {
  display: block;
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
}

.help-text {
  display: block;
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.generate-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 8px;
  cursor: pointer;
}

.generate-btn:hover {
  background: #218838;
}

.generate-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  background: #007bff;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.submit-btn.submitting {
  background: #6c757d;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default PaymentForm;
