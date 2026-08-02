import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  Users,
  TrendingUp,
  Target,
  BarChart3,
  Settings,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dash', icon: LayoutDashboard },
    { to: '/accounts', label: 'Accounts', icon: Wallet },
    { to: '/transactions', label: 'Txns', icon: ArrowLeftRight },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/loans', label: 'Loans', icon: Users },
    { to: '/investments', label: 'Invest', icon: TrendingUp },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around overflow-x-auto scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-[54px] py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-emerald-500 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
