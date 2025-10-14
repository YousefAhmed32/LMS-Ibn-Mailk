import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

const Toaster = ({ toasts = [], dismiss }) => {
  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          iconBg: 'bg-green-100 dark:bg-green-800'
        };
      case 'destructive':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          iconBg: 'bg-red-100 dark:bg-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          iconBg: 'bg-yellow-100 dark:bg-yellow-800'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: <Info className="h-5 w-5 text-blue-600" />,
          iconBg: 'bg-blue-100 dark:bg-blue-800'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getVariantStyles(toast.variant);
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`
                ${styles.bg} ${styles.border} ${styles.text}
                border rounded-lg shadow-lg p-4 max-w-sm w-full
                backdrop-blur-sm
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`${styles.iconBg} rounded-full p-1 flex-shrink-0`}>
                  {styles.icon}
                </div>
                <div className="flex-1 min-w-0">
                  {toast.title && (
                    <div className="font-medium text-sm mb-1">
                      {toast.title}
                    </div>
                  )}
                  {toast.description && (
                    <div className="text-sm opacity-90">
                      {toast.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(toast.id)}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
