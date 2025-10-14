import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import GlobalLayout from '../layout/GlobalLayout';
import useHeaderHeight from '../../hooks/useHeaderHeight';

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const { colors, spacing } = theme;
  const headerHeight = useHeaderHeight();

  return (
    <GlobalLayout showAdminHeader={true}>
      <div 
        className="w-full "
        style={{ 
         
          minHeight: `calc(100vh - ${headerHeight}px)`,
          // CSS custom property fallback
          '--header-height': `${headerHeight}px`
        }}
      >
        <div className=" mx-auto">
          {children}
        </div>
      </div>
    </GlobalLayout>
  );
};

export default AdminLayout;
