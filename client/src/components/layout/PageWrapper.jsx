import React from 'react';
import GlobalLayout from './GlobalLayout';

const PageWrapper = ({ children, showAdminHeader = false }) => {
  return (
    <GlobalLayout showAdminHeader={showAdminHeader}>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </GlobalLayout>
  );
};

export default PageWrapper;

