// client/src/services/authService.js - Production-ready auth service
import axiosInstance from '../api/axiosInstance';
import { isValidPhone } from '../utils/phoneUtils';

// Registration service with proper error handling
export const registerService = async (userData) => {
  try {
    // Debug: Print incoming data to help troubleshoot field mapping issues
    console.log('📥 Registration service - incoming data:', {
      phoneNumber: userData.phoneNumber ? userData.phoneNumber.substring(0, 4) + '***' : 'missing',
      role: userData.role,
      hasPassword: !!userData.password,
      hasGuardianPhone: !!userData.guardianPhone,
      grade: userData.grade
    });

    // Map frontend data to backend schema
    const mappedData = { ...userData };
    
    // Remove fields not needed on server
    delete mappedData.confirmPassword;
    delete mappedData.age;
    
    // Validate required fields on frontend
    const requiredFields = ['firstName', 'secondName', 'thirdName', 'fourthName', 'phoneNumber', 'password'];
    const missingFields = requiredFields.filter(field => !mappedData[field] || mappedData[field].trim() === '');
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate international phone (E.164 / any country)
    if (!isValidPhone(mappedData.phoneNumber)) {
      throw new Error('Please enter a valid international phone number (e.g. +201234567890)');
    }

    // Role-specific validation
    if (mappedData.role === 'student') {
      const studentRequiredFields = ['phoneStudent', 'guardianPhone', 'governorate', 'grade'];
      const missingStudentFields = studentRequiredFields.filter(field => !mappedData[field] || mappedData[field].trim() === '');
      
      if (missingStudentFields.length > 0) {
        throw new Error(`Missing required student fields: ${missingStudentFields.join(', ')}`);
      }
    }
    
    console.log('📤 Sending registration request to:', '/api/auth/register');
    console.log('📤 Full payload:', JSON.stringify(mappedData, null, 2));
    
    const response = await axiosInstance.post('/api/auth/register', mappedData);
    
    console.log('✅ Registration successful:', {
      userId: response.data.data?._id,
      phoneNumber: response.data.data?.phoneNumber,
      role: response.data.data?.role
    });
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle axios errors
    if (error.response) {
      // Server responded with error status
      const serverError = error.response.data;
      console.error('❌ Server error details:', serverError);
      throw {
        message: serverError.message || serverError.error || 'Registration failed',
        details: serverError.details || [],
        status: error.response.status
      };
    } else if (error.request) {
      // Request was made but no response received
      throw {
        message: 'Network error. Please check your connection and try again.',
        status: 0
      };
    } else {
      // Something else happened
      throw {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }
};

// Login service
export const loginService = async (phoneNumber, password) => {
  try {
    console.log('🔐 Login service - preparing request:', {
      phoneNumber: phoneNumber ? phoneNumber.substring(0, 4) + '***' : 'missing',
      hasPassword: !!password,
      passwordLength: password ? password.length : 0
    });

    const requestPayload = {
      phoneNumber: phoneNumber.trim().replace(/\s+/g, ''), // Normalize phone number
      password
    };

    // Debug: Print outgoing payload to help troubleshoot login issues
    console.log('📤 Login service - sending payload:', {
      phoneNumber: requestPayload.phoneNumber.substring(0, 4) + '***',
      hasPassword: !!requestPayload.password,
      passwordLength: requestPayload.password ? requestPayload.password.length : 0,
      payloadKeys: Object.keys(requestPayload)
    });

    const response = await axiosInstance.post('/api/auth/login', requestPayload);
    
    console.log('✅ Login successful:', {
      userId: response.data.user?._id,
      phoneNumber: response.data.user?.phoneNumber,
      role: response.data.user?.role
    });
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Login error:', error);
    
    if (error.response) {
      const serverError = error.response.data;
      // Debug: Print server error details to help troubleshoot validation issues
      console.error('❌ Login server error details:', serverError);
      throw {
        message: serverError.message || serverError.error || 'Login failed',
        status: error.response.status
      };
    } else if (error.request) {
      throw {
        message: 'Network error. Please check your connection and try again.',
        status: 0
      };
    } else {
      throw {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }
  console.log("🧩 Login Body:", req.body);

};