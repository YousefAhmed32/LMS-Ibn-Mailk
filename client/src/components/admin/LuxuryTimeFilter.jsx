import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Calendar, Clock } from 'lucide-react';

const LuxuryTimeFilter = ({ selectedPeriod, onPeriodChange, isLoading }) => {
  const { isDark } = useTheme();

  const timePeriods = [
    { value: '1hour', label: 'آخر ساعة', icon: Clock },
    { value: '24hours', label: 'آخر 24 ساعة', icon: Clock },
    { value: '7days', label: 'آخر 7 أيام', icon: Calendar },
    { value: '30days', label: 'آخر 30 يوم', icon: Calendar },
    { value: 'all', label: 'جميع الأوقات', icon: Calendar }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Calendar className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          الفترة الزمنية
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {timePeriods.map((period) => {
          const Icon = period.icon;
          const isSelected = selectedPeriod === period.value;
          
          return (
            <motion.button
              key={period.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPeriodChange(period.value)}
              disabled={isLoading}
              className={`
                flex items-center space-x-2 px-4 py-3 rounded-xl
                transition-all duration-300 ease-out
                ${isSelected
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-600 text-white shadow-lg'
                  : isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
                border-2 shadow-md hover:shadow-xl
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium text-sm">{period.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LuxuryTimeFilter;
