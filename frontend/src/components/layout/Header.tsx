import React from 'react';
import { Shield, Bell, User } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 md:hidden">
        <div className="p-1.5 bg-brand-500 rounded-xl text-white">
          <Shield size={20} />
        </div>
        <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">MONETO</span>
      </div>

      <div className="hidden md:block">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Security-First Platform Overview</h2>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center font-bold text-xs">
            <User size={16} />
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-300">MACH-ADMIN</span>
        </div>
      </div>
    </header>
  );
};
