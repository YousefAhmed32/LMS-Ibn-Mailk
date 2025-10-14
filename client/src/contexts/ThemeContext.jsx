import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference, then default to dark
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    return true; // Default to dark mode
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Set data-theme attribute for CSS variables
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Set Tailwind dark class for dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Add smooth transition class during theme change
    document.documentElement.classList.add('theme-transition');
    
    // Remove transition class after animation completes
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Dark Mode Colors - Luxury Deep Navy + Gold
      dark: {
        background: '#000012',
        surface: '#0A0A1A',
        surfaceElevated: '#1A1A2E',
        surfaceCard: 'rgba(26, 26, 46, 0.8)',
        text: '#FFFFFF',
        textSecondary: '#B8B8CC',
        textMuted: '#8A8A9A',
        accent: '#D2B065',
        accentHover: '#E6C478',
        accentLight: '#F4E6B7',
        accentDark: '#B8954A',
        success: '#00D4AA',
        error: '#FF6B6B',
        warning: '#FFB347',
        info: '#4ECDC4',
        border: '#2A2A3E',
        borderLight: '#3A3A4E',
        borderAccent: '#D2B065',
        shadow: 'rgba(0, 0, 0, 0.8)',
        shadowLight: 'rgba(0, 0, 0, 0.4)',
        shadowAccent: 'rgba(210, 176, 101, 0.3)',
        gradient: 'linear-gradient(135deg, #000012 0%, #1A1A2E 100%)',
        cardGradient: 'linear-gradient(145deg, #0A0A1A 0%, #1A1A2E 100%)',
        buttonGradient: 'linear-gradient(135deg, #D2B065 0%, #E6C478 100%)',
        buttonSecondary: 'rgba(210, 176, 101, 0.1)',
        overlay: 'rgba(0, 0, 18, 0.8)',
        glow: '0 0 20px rgba(210, 176, 101, 0.3)',
        glowStrong: '0 0 30px rgba(210, 176, 101, 0.5)'
      },
      // Light Mode Colors - Ivory/White + Dark Navy + Gold
      light: {
        background: '#FEFEFE',
        surface: '#F8F9FA',
        surfaceElevated: '#FFFFFF',
        surfaceCard: 'rgba(255, 255, 255, 0.9)',
        text: '#1A1A2E',
        textSecondary: '#4A4A4A',
        textMuted: '#8A8A9A',
        accent: '#D2B065',
        accentHover: '#B8954A',
        accentLight: '#F4E6B7',
        accentDark: '#A67C00',
        success: '#00D4AA',
        error: '#FF6B6B',
        warning: '#FFB347',
        info: '#4ECDC4',
        border: '#E1E5E9',
        borderLight: '#F1F3F4',
        borderAccent: '#D2B065',
        shadow: 'rgba(0, 0, 0, 0.1)',
        shadowLight: 'rgba(0, 0, 0, 0.05)',
        shadowAccent: 'rgba(210, 176, 101, 0.2)',
        gradient: 'linear-gradient(135deg, #FEFEFE 0%, #F8F9FA 100%)',
        cardGradient: 'linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%)',
        buttonGradient: 'linear-gradient(135deg, #D2B065 0%, #B8954A 100%)',
        buttonSecondary: 'rgba(210, 176, 101, 0.1)',
        overlay: 'rgba(255, 255, 255, 0.8)',
        glow: '0 0 20px rgba(210, 176, 101, 0.2)',
        glowStrong: '0 0 30px rgba(210, 176, 101, 0.4)'
      }
    },
    typography: {
      fontFamily: {
        heading: '"Playfair Display", "Times New Roman", serif',
        body: '"Inter", "Segoe UI", "Roboto", sans-serif',
        mono: '"JetBrains Mono", "Fira Code", monospace'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      glow: '0 0 20px rgba(255, 215, 0, 0.3)',
      glowStrong: '0 0 30px rgba(255, 215, 0, 0.5)'
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        easeInOut: [0.4, 0, 0.2, 1],
        easeOut: [0, 0, 0.2, 1],
        easeIn: [0.4, 0, 1, 1],
        bounce: [0.68, -0.55, 0.265, 1.55]
      }
    }
  };

  const currentColors = isDarkMode ? theme.colors.dark : theme.colors.light;

  return (
    <ThemeContext.Provider value={{ ...theme, colors: currentColors, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};