import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';
import LuxuryButton from '../ui/LuxuryButton';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { 
  Sun, 
  Moon, 
  Palette, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Star,
  Heart,
  Zap
} from 'lucide-react';

const ThemeSystemTest = () => {
  const { isDarkMode, colors, toggleTheme } = useTheme();

  const testComponents = [
    {
      name: 'Buttons',
      component: (
        <div className="flex flex-wrap gap-4">
          <LuxuryButton variant="primary">Primary Button</LuxuryButton>
          <LuxuryButton variant="secondary">Secondary Button</LuxuryButton>
          <LuxuryButton variant="ghost">Ghost Button</LuxuryButton>
          <LuxuryButton variant="danger">Danger Button</LuxuryButton>
        </div>
      )
    },
    {
      name: 'Theme Toggle',
      component: (
        <div className="flex items-center gap-4">
          <ThemeToggle size="sm" />
          <ThemeToggle size="md" />
          <ThemeToggle size="lg" />
        </div>
      )
    },
    {
      name: 'Cards',
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-luxury-gold-500" />
                Test Card 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is a test card to verify theme consistency.
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Test Card 2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Another test card with different styling.
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Test Card 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Third test card for comprehensive testing.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      name: 'Status Indicators',
      component: (
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            Success State
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4" />
            Warning State
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
            <Info className="h-4 w-4" />
            Info State
          </div>
        </div>
      )
    },
    {
      name: 'Typography',
      component: (
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
          <h2 className="text-3xl font-semibold text-foreground">Heading 2</h2>
          <h3 className="text-2xl font-medium text-foreground">Heading 3</h3>
          <p className="text-base text-muted-foreground">
            This is a paragraph with muted text color that should be readable in both themes.
          </p>
          <p className="text-sm text-muted-foreground">
            This is smaller text that should also maintain good contrast.
          </p>
        </div>
      )
    },
    {
      name: 'Form Elements',
      component: (
        <div className="space-y-4 max-w-md">
          <input 
            type="text" 
            placeholder="Test input field"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 transition-all duration-300"
          />
          <textarea 
            placeholder="Test textarea"
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 transition-all duration-300"
          />
          <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 transition-all duration-300">
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Palette className="h-8 w-8 text-luxury-gold-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-luxury-gold-500 to-luxury-gold-600 bg-clip-text text-transparent">
              Theme System Test
            </h1>
            <Palette className="h-8 w-8 text-luxury-gold-500" />
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              {isDarkMode ? (
                <>
                  <Moon className="h-4 w-4 text-luxury-gold-500" />
                  <span className="text-sm font-medium">Dark Mode Active</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-luxury-gold-500" />
                  <span className="text-sm font-medium">Light Mode Active</span>
                </>
              )}
            </div>
            
            <ThemeToggle size="lg" />
          </div>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This page tests the comprehensive theme system implementation. 
            All components should smoothly transition between light and dark modes 
            with proper contrast and accessibility.
          </p>
        </motion.div>

        {/* Test Components */}
        <div className="space-y-12">
          {testComponents.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
                {test.name}
              </h2>
              {test.component}
            </motion.div>
          ))}
        </div>

        {/* Theme Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 rounded-xl bg-card border border-border"
        >
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Current Theme Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Mode:</strong> {isDarkMode ? 'Dark' : 'Light'}</p>
              <p><strong>Background:</strong> {colors.background}</p>
              <p><strong>Text:</strong> {colors.text}</p>
              <p><strong>Accent:</strong> {colors.accent}</p>
            </div>
            <div>
              <p><strong>Surface:</strong> {colors.surface}</p>
              <p><strong>Border:</strong> {colors.border}</p>
              <p><strong>Success:</strong> {colors.success}</p>
              <p><strong>Error:</strong> {colors.error}</p>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-6 rounded-xl bg-luxury-gold-50 dark:bg-luxury-gold-900/20 border border-luxury-gold-200 dark:border-luxury-gold-800"
        >
          <h3 className="text-lg font-semibold mb-3 text-luxury-gold-800 dark:text-luxury-gold-200">
            Testing Instructions
          </h3>
          <ul className="space-y-2 text-sm text-luxury-gold-700 dark:text-luxury-gold-300">
            <li>• Click the theme toggle to switch between light and dark modes</li>
            <li>• Verify all components transition smoothly without flicker</li>
            <li>• Check that text remains readable in both modes</li>
            <li>• Ensure proper contrast ratios for accessibility</li>
            <li>• Test on different screen sizes and devices</li>
            <li>• Verify theme preference persists after page refresh</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemeSystemTest;
