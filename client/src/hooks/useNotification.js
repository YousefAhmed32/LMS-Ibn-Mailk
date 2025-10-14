import { toast } from './use-toast';

// Custom hook that provides notification methods compatible with the existing codebase
export const useNotification = () => {
  const showSuccess = (message, title = 'نجح') => {
    toast({
      title: title,
      description: message,
      variant: 'success',
      duration: 5000
    });
  };

  const showError = (message, title = 'خطأ') => {
    toast({
      title: title,
      description: message,
      variant: 'error',
      duration: 7000
    });
  };

  const showInfo = (message, title = 'معلومات') => {
    toast({
      title: title,
      description: message,
      variant: 'info',
      duration: 5000
    });
  };

  const showWarning = (message, title = 'تحذير') => {
    toast({
      title: title,
      description: message,
      variant: 'warning',
      duration: 6000
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};
