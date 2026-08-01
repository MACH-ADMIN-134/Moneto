import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'light' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="Light Theme"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'dark' ? 'bg-slate-700 text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="Dark Theme"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'system' ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
        title="System Preference"
      >
        <Laptop size={16} />
      </button>
    </div>
  );
};
