import React from 'react';
import { motion } from 'framer-motion';
import StudentDashboard from '../../components/dashboard/StudentDashboard';
import PageWrapper from '../../components/layout/PageWrapper';

const StudentDashboardPage = () => {
  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <StudentDashboard />
      </motion.div>
    </PageWrapper>
  );
};

export default StudentDashboardPage;
