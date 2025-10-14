import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Trophy, Star, Target, Zap } from 'lucide-react';

const MotivationalToast = ({ 
  isVisible, 
  onClose, 
  type = 'completion',
  message = '',
  progressPercentage = 0,
  duration = 4000 
}) => {
  const getToastConfig = () => {
    switch (type) {
      case 'milestone':
        // Use the message prop if provided, otherwise use progressPercentage
        const displayMessage = message || `تقدمك ${progressPercentage}%`;
        
        if (progressPercentage === 100) {
          return {
            icon: Trophy,
            title: '🎉 مبروك!',
            message: message || 'لقد أكملت الكورس بالكامل!',
            bgColor: 'from-yellow-400 to-orange-500',
            iconColor: 'text-yellow-600',
            borderColor: 'border-yellow-300'
          };
        } else if (progressPercentage >= 75) {
          return {
            icon: Star,
            title: '🌟 تقريباً انتهيت!',
            message: displayMessage,
            bgColor: 'from-purple-400 to-pink-500',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-300'
          };
        } else if (progressPercentage >= 50) {
          return {
            icon: Target,
            title: '🎯 في منتصف الطريق!',
            message: displayMessage,
            bgColor: 'from-blue-400 to-cyan-500',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-300'
          };
        } else if (progressPercentage >= 25) {
          return {
            icon: Zap,
            title: '⚡ بداية رائعة!',
            message: displayMessage,
            bgColor: 'from-green-400 to-emerald-500',
            iconColor: 'text-green-600',
            borderColor: 'border-green-300'
          };
        }
        break;
      case 'completion':
      default:
        return {
          icon: CheckCircle,
          title: '✅ تم الإكمال!',
          message: message || 'تم إكمال هذا الدرس!',
          bgColor: 'from-green-400 to-emerald-500',
          iconColor: 'text-green-600',
          borderColor: 'border-green-300'
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.6 
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`
            relative overflow-hidden rounded-xl shadow-2xl border-2 ${config.borderColor}
            bg-gradient-to-r ${config.bgColor} p-4 text-white
          `}>
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-white opacity-20 rounded-xl" />
            
            {/* Content */}
            <div className="relative flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className={`p-2 rounded-full bg-white ${config.iconColor}`}
              >
                <IconComponent size={24} />
              </motion.div>
              
              <div className="flex-1">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-bold text-lg"
                >
                  {config.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm opacity-90"
                >
                  {config.message}
                </motion.p>
              </div>
              
              {/* Close button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
            
            {/* Progress indicator for milestones */}
            {type === 'milestone' && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute bottom-0 left-0 h-1 bg-white opacity-50"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MotivationalToast;
