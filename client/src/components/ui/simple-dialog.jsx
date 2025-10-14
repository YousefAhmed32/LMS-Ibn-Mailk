import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dialog = ({ children, open, onOpenChange }) => {
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

const DialogTrigger = ({ children, asChild, ...props }) => {
  if (asChild) {
    return React.cloneElement(children, props);
  }
  return <button {...props}>{children}</button>;
};

const DialogContent = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const DialogHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className = '', ...props }) => {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`} {...props}>
      {children}
    </h2>
  );
};

const DialogDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </p>
  );
};

const DialogFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex justify-end gap-3 mt-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
