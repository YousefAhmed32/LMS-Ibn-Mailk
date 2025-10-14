import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative ${sizeClasses[size]} rounded-full
        bg-[linear-gradient(to_right,#b87400_0%,#f6a616_50%,#ffd666_100%)]
        hover:bg-[linear-gradient(to_right,#d18700_0%,#f8b200_50%,#ffe066_100%)]
        dark:bg-[linear-gradient(to_right,#b87400_0%,#f6a616_50%,#ffd666_100%)]
        dark:hover:bg-[linear-gradient(to_right,#d18700_0%,#f8b200_50%,#ffe066_100%)]
        text-luxury-navy-900 dark:text-luxury-navy-900
        shadow-lg hover:shadow-xl
        border border-luxury-gold-300 dark:border-luxury-gold-400
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#f6a616] focus:ring-offset-2
        dark:focus:ring-offset-luxury-navy-800
        ${className}
      `}
      whileHover={{ 
        scale: 1.05,
        rotate: 5
      }}
      whileTap={{ 
        scale: 0.95,
        rotate: -5
      }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDarkMode ? 180 : 0,
          scale: isDarkMode ? 1.1 : 1
        }}
        transition={{ 
          duration: 0.4,
          ease: "easeInOut"
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          initial={false}
          animate={{ 
            opacity: isDarkMode ? 0 : 1,
            y: isDarkMode ? -10 : 0
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className={iconSizes[size]} />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{ 
            opacity: isDarkMode ? 1 : 0,
            y: isDarkMode ? 0 : 10
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className={iconSizes[size]} />
        </motion.div>
      </motion.div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#f6a616] opacity-0"
        animate={{
          opacity: isDarkMode ? [0, 0.3, 0] : [0, 0.2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  );
};

export default ThemeToggle;
