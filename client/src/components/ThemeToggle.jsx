import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        ${isDark 
          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
          : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
        }
        animate-theme-toggle
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <Sun size={18} className="text-yellow-600" />
      ) : (
        <Moon size={18} className="text-yellow-400" />
      )}
      
      {/* Animated ring effect */}
      <div className={`
        absolute inset-0 rounded-lg border-2 border-transparent
        transition-all duration-300
        ${isDark ? 'border-yellow-400' : 'border-gray-600'}
        opacity-0 hover:opacity-100
      `} />
    </button>
  );
};

export default ThemeToggle;