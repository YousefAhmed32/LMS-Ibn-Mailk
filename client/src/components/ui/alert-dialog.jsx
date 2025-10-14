import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertDialog = ({ children, open, onOpenChange }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
          <div className="relative z-10">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AlertDialogTrigger = ({ children, asChild, ...props }) => {
  if (asChild) {
    return React.cloneElement(children, props);
  }
  return <button {...props}>{children}</button>;
};

const AlertDialogContent = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const AlertDialogHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const AlertDialogTitle = ({ children, className = '', ...props }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`} {...props}>
      {children}
    </h2>
  );
};

const AlertDialogDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </p>
  );
};

const AlertDialogFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex justify-end gap-3 mt-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const AlertDialogCancel = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const AlertDialogAction = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
