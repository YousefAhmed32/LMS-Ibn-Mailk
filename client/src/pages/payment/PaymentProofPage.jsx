import React from 'react';
import PaymentProofUpload from '../../components/payment/PaymentProofUpload';
import { motion } from 'framer-motion';

const PaymentProofPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            رفع إثبات الدفع
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            يمكنك رفع إثبات الدفع هنا بعد إجراء التحويل إلى رقم Vodafone Cash المحدد
          </p>
        </motion.div>

        <PaymentProofUpload />
      </div>
    </div>
  );
};

export default PaymentProofPage;
