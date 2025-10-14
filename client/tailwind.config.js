/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Enhanced luxury theme colors with improved contrast
        luxury: {
          gold: {
            50: '#FFFDF7',
            100: '#FFF8E1',
            200: '#FFED4E',
            300: '#FFE082',
            400: '#FFD54F',
            500: '#D2B065',
            600: '#B8954A',
            700: '#A67C00',
            800: '#8B6F00',
            900: '#6B5500',
            // Premium gold gradient colors
            'deep-bronze': '#b87400',
            'rich-bronze': '#d4880a',
            'warm-amber': '#f6a616',
            'bright-gold': '#ffd666',
            'light-gold': '#fff3b0',
            'pale-gold': '#fff8e1',
            'metallic-dark': '#8b5a00',
            'metallic-medium': '#c4900f',
            'metallic-light': '#f4b942',
            'metallic-bright': '#ffed4e',
          },
          navy: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#1A1A2E',
            600: '#151525',
            700: '#10101C',
            800: '#0A0A13',
            900: '#000012',
          },
          // Enhanced accent colors for better accessibility
          orange: {
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#F97316',
            600: '#EA580C',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12',
          },
          emerald: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B',
          },
          rose: {
            50: '#FFF1F2',
            100: '#FFE4E6',
            200: '#FECDD3',
            300: '#FDA4AF',
            400: '#FB7185',
            500: '#F43F5E',
            600: '#E11D48',
            700: '#BE123C',
            800: '#9F1239',
            900: '#881337',
          },
          sky: {
            50: '#F0F9FF',
            100: '#E0F2FE',
            200: '#BAE6FD',
            300: '#7DD3FC',
            400: '#38BDF8',
            500: '#0EA5E9',
            600: '#0284C7',
            700: '#0369A1',
            800: '#075985',
            900: '#0C4A6E',
          }
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'arabic': ['Noto Sans Arabic', 'sans-serif'],
        'sans': ['Inter', 'Noto Sans Arabic', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'theme-transition': 'themeTransition 0.3s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        themeTransition: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(210, 176, 101, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(210, 176, 101, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        'gold-glow': '0 0 20px rgba(246, 166, 22, 0.3), 0 0 40px rgba(255, 214, 102, 0.15)',
        'gold-glow-hover': '0 0 30px rgba(255, 214, 102, 0.4), 0 0 60px rgba(255, 214, 102, 0.15), 0 8px 32px rgba(184, 116, 0, 0.3)',
        'gold-shadow': '0 4px 15px rgba(184, 116, 0, 0.3), 0 8px 25px rgba(246, 166, 22, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        // Horizontal Gold Gradients
        'gradient-gold-horizontal-primary': 'linear-gradient(to right, #b87400 0%, #d4880a 25%, #f6a616 50%, #ffd666 75%, #fff3b0 100%)',
        'gradient-gold-horizontal-metallic': 'linear-gradient(to right, #8b5a00 0%, #c4900f 30%, #f4b942 60%, #ffed4e 100%)',
        'gradient-gold-horizontal-accent': 'linear-gradient(to right, #b87400 0%, #f6a616 40%, #ffd666 80%, #fff8e1 100%)',
        
        // Vertical Gold Gradients
        'gradient-gold-vertical-primary': 'linear-gradient(to bottom, #fff3b0 0%, #ffd666 20%, #f6a616 50%, #d4880a 80%, #b87400 100%)',
        'gradient-gold-vertical-metallic': 'linear-gradient(to bottom, #ffed4e 0%, #f4b942 30%, #c4900f 70%, #8b5a00 100%)',
        'gradient-gold-vertical-accent': 'linear-gradient(to bottom, #fff8e1 0%, #ffd666 30%, #f6a616 70%, #b87400 100%)',
        
        // Diagonal Gold Gradients
        'gradient-gold-diagonal-primary': 'linear-gradient(135deg, #b87400 0%, #d4880a 25%, #f6a616 50%, #ffd666 75%, #fff3b0 100%)',
        'gradient-gold-diagonal-secondary': 'linear-gradient(225deg, #fff3b0 0%, #ffd666 25%, #f6a616 50%, #d4880a 75%, #b87400 100%)',
        'gradient-gold-diagonal-accent': 'linear-gradient(45deg, #8b5a00 0%, #c4900f 40%, #f4b942 80%, #ffed4e 100%)',
        
        // Radial Gold Gradients
        'gradient-gold-radial-primary': 'radial-gradient(circle at center, #ffd666 0%, #f6a616 40%, #d4880a 70%, #b87400 100%)',
        'gradient-gold-radial-secondary': 'radial-gradient(circle at top left, #fff3b0 0%, #ffd666 30%, #f6a616 60%, #b87400 100%)',
        
        // Text Gradients
        'gradient-gold-text-primary': 'linear-gradient(135deg, #b87400 0%, #f6a616 50%, #ffd666 100%)',
        'gradient-gold-text-metallic': 'linear-gradient(135deg, #8b5a00 0%, #f4b942 50%, #ffed4e 100%)',
        
        // Shimmer Effect
        'gradient-gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
