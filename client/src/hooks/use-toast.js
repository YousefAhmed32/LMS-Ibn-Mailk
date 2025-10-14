import React, { useState, useCallback } from 'react';

// Toast state management
let toastState = { toasts: [] };
let listeners = [];

function notifyListeners() {
  listeners.forEach(listener => listener(toastState));
}

function addToast(toastData) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast = {
    id,
    ...toastData,
    duration: toastData.duration || 5000
  };
  
  toastState = {
    ...toastState,
    toasts: [...toastState.toasts, newToast]
  };
  
  notifyListeners();
  
  // Auto remove toast after duration
  setTimeout(() => {
    removeToast(id);
  }, newToast.duration);
  
  return id;
}

function removeToast(id) {
  toastState = {
    ...toastState,
    toasts: toastState.toasts.filter(toast => toast.id !== id)
  };
  notifyListeners();
}

function removeAllToasts() {
  toastState = { toasts: [] };
  notifyListeners();
}

// Direct toast function that can be used without hooks
export const toast = ({ title, description, variant = "default", duration = 5000 }) => {
  return addToast({ title, description, variant, duration });
};

// Hook for components that need toast state
export const useToast = () => {
  const [toasts, setToasts] = useState(toastState.toasts);

  React.useEffect(() => {
    const listener = (newState) => setToasts(newState.toasts);
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id) => {
    removeToast(id);
  }, []);

  const dismissAll = useCallback(() => {
    removeAllToasts();
  }, []);

  return {
    toasts,
    dismiss,
    dismissAll
  };
};
