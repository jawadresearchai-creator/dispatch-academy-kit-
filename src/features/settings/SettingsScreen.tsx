import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  Save,
  CheckCircle2,
  DollarSign,
  Fuel,
  TrendingUp,
} from 'lucide-react';
import {
  getSettings,
  updateSettings,
  defaultSettings,
  type AppSettings,
} from '../../db';
import { checkAIHealth, type AIHealthStatus } from '../../ai/aiClient';
import { Button, Card, Pill } from '../../components/ui';

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [aiStatus, setAiStatus] = useState<AIHealthStatus>({
    available: false,
    transport: 'none',
    message: '',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
    checkAIHealth().then(setAiStatus);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settings);
    const updatedStatus = await checkAIHealth();
    setAiStatus(updatedStatus);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetMarket = async () => {
    const updated = {
      ...settings,
      dieselPrice: defaultSettings.dieselPrice,
      dieselDate: defaultSettings.dieselDate,
      datVanRate: defaultSettings.datVanRate,
      datReeferRate: defaultSettings.datReeferRate,
      datFlatbedRate: defaultSettings.datFlatbedRate,
      datDate: defaultSettings.datDate,
      weeklyFixedCost: defaultSettings.weeklyFixedCost,
      weeklyMiles: defaultSettings.weeklyMiles,
      avgMpg: defaultSettings.avgMpg,
      variableCostNoFuel: defaultSettings.variableCostNoFuel,
      dispatchFeePct: defaultSettings.dispatchFeePct,
      factoringFeePct: defaultSettings.factoringFeePct,
      profitCushion: defaultSettings.profitCushion,
    };
    setSettings(updated);
    await updateSettings(updated);
    setSavedSuccess(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#13294B] dark:text-[#F5A524]">
            Configuration & Preferences
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Application Settings
          </h1>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-[#22A35A] font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile & Regional Settings */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#13294B] dark:text-white">
            User Profile & Time Preference
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-500 font-semibold block">Dispatcher Name</label>
              <input
                type="text"
                value={settings.userName}
                onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-500 font-semibold block">Default U.S. Clock Zone</label>
              <select
                value={settings.defaultUsZone}
                onChange={(e) => setSettings({ ...settings, defaultUsZone: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="America/New_York">Eastern (America/New_York)</option>
                <option value="America/Chicago">Central (America/Chicago)</option>
                <option value="America/Denver">Mountain (America/Denver)</option>
                <option value="America/Los_Angeles">Pacific (America/Los_Angeles)</option>
                <option value="America/Phoenix">Arizona (America/Phoenix)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* AI Configuration */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F5A524]" />
              <h3 className="text-sm font-bold text-[#13294B] dark:text-white">
                Gemini AI Configuration
              </h3>
            </div>
            <Pill
              label={aiStatus.available ? 'Connected' : 'Offline / Personal Key Needed'}
              variant={aiStatus.available ? 'book' : 'counter'}
            />
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-500 font-semibold block">
                Personal Gemini API Key (Optional for Desktop / Offline Builds)
              </label>
              <input
                type="password"
                value={settings.userApiKey || ''}
                onChange={(e) => setSettings({ ...settings, userApiKey: e.target.value })}
                placeholder="AIzaSy... (Personal use only; stays on your machine)"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Inside Google AI Studio build mode, the server transport uses the injected environment key automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 font-semibold block">Fast Chat Model</label>
                <input
                  type="text"
                  value={settings.aiModel}
                  onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold block">Reasoning / Grading Model</label>
                <input
                  type="text"
                  value={settings.aiProModel}
                  onChange={(e) => setSettings({ ...settings, aiProModel: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Market Snapshots & Reset */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#22A35A]" />
              <span>Dated Market Snapshots & Cost Inputs</span>
            </h3>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={handleResetMarket}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset to Course Values
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-500 font-semibold block">Diesel Price ($/gal)</label>
              <input
                type="number"
                step={0.001}
                value={settings.dieselPrice}
                onChange={(e) => setSettings({ ...settings, dieselPrice: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
              />
              <span className="text-[10px] text-slate-400">Snapshot: 28 Sep 2026</span>
            </div>

            <div>
              <label className="text-slate-500 font-semibold block">DAT Van Rate ($/mi)</label>
              <input
                type="number"
                step={0.01}
                value={settings.datVanRate}
                onChange={(e) => setSettings({ ...settings, datVanRate: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
              />
              <span className="text-[10px] text-slate-400">August 2026 Benchmark</span>
            </div>

            <div>
              <label className="text-slate-500 font-semibold block">DAT Reefer Rate ($/mi)</label>
              <input
                type="number"
                step={0.01}
                value={settings.datReeferRate}
                onChange={(e) => setSettings({ ...settings, datReeferRate: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="amber" icon={<Save className="w-4 h-4" />}>
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
