import React from 'react';
import ModernMyAccountPage from './ModernMyAccountPage';

// Mock auth context for testing
const MockAuthProvider = ({ children }) => {
  const mockUser = {
    _id: "66f123456789abcdef012345",
    firstName: "Ahmed",
    secondName: "Mohamed",
    thirdName: "Ali",
    fourthName: "Hassan",
    userEmail: "ahmed.mohamed@example.com",
    phoneStudent: "+201234567890",
    phoneNumber: "+201234567890",
    governorate: "القاهرة",
    grade: "10",
    role: "student", // Can be "student", "parent", or "admin"
    avatar: null,
    createdAt: "2024-01-15T10:00:00.000Z"
  };

  const mockAuthValue = {
    user: mockUser,
    updateUser: (userData) => {
      console.log('Updating user:', userData);
    },
    logout: () => {
      console.log('Logging out...');
    }
  };

  return (
    <div>
      {React.cloneElement(children, { mockAuth: mockAuthValue })}
    </div>
  );
};

// Example usage component
const ModernMyAccountExample = () => {
  return (
    <MockAuthProvider>
      <ModernMyAccountPage />
    </MockAuthProvider>
  );
};

export default ModernMyAccountExample;

// For testing different user roles, you can modify the mockUser object:

/*
// Example: Parent user
const mockParentUser = {
  _id: "66f987654321fedcba098765",
  firstName: "Fatima",
  secondName: "Ali",
  thirdName: "Ahmed",
  fourthName: "Ibrahim",
  userEmail: "fatima.ali@example.com",
  phoneNumber: "+201098765432",
  governorate: "الجيزة",
  relation: "Mother",
  role: "parent",
  avatar: null,
  createdAt: "2024-02-20T14:30:00.000Z"
};

// Example: Admin user
const mockAdminUser = {
  _id: "66f456789abcdef012345678",
  firstName: "Omar",
  secondName: "Khaled",
  userEmail: "omar.khaled@admin.com",
  phoneNumber: "+201555666777",
  governorate: "الإسكندرية",
  role: "admin",
  avatar: null,
  createdAt: "2024-01-01T09:00:00.000Z"
};
*/
