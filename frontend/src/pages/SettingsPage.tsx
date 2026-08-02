import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Settings, Shield, Bell, Moon, Sun, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface UserSettingsData {
  theme: string;
  defaultCurrency: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
}

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<UserSettingsData>({
    theme: 'system',
    defaultCurrency: 'USD',
    emailNotifications: true,
    pushNotifications: true,
    twoFactorEnabled: false,
  });

  const [_loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiRequest<UserSettingsData>('/settings');
        setSettings(data);
      } catch (_err) {
        // Fallback default
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Account & Security Preferences
        </h1>
        <p className="text-slate-500 text-sm">
          Manage user profile credentials, notifications, default currency, and enterprise security configurations.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {/* User Profile Card */}
      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl font-bold uppercase shadow-lg shadow-emerald-500/20">
            {user?.fullName ? user.fullName[0] : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.fullName || 'Alex Vance'}</h3>
              <Badge variant="neutral">
                {(user?.role || 'user').toUpperCase()} ROLE
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{user?.email || 'demo@moneto.io'}</p>
          </div>
        </div>
      </Card>

      {/* General & Security Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <Card className="space-y-4">
          <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings size={18} className="text-emerald-500" /> Platform Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Default Base Currency</label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Interface Color Mode</label>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-semibold flex items-center justify-between"
              >
                <span>Current Mode: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                {theme === 'dark' ? <Moon size={16} className="text-emerald-400" /> : <Sun size={16} className="text-amber-500" />}
              </button>
            </div>
          </div>
        </Card>

        {/* Security & Notifications */}
        <Card className="space-y-4">
          <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield size={18} className="text-teal-500" /> Security Controls
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication (2FA)</p>
                  <p className="text-xs text-slate-500">Require TOTP authentication code during login sessions</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) => setSettings({ ...settings, twoFactorEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-indigo-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Email Alerts & Digest</p>
                  <p className="text-xs text-slate-500">Receive monthly reports and bill payment due reminders</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
