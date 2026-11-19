import React, { useState } from 'react';
import { CheckCircle2, Cloud, KeyRound, Loader2, Lock, Save, ShieldCheck, XCircle } from 'lucide-react';
import {
  api,
  getAccessPin,
  KeyStatusMap,
  saveAccessPin,
  saveDeviceApiKeys,
  SettingsData,
} from '../lib/api';
import { LS_KEYS, saveLocalJson } from '../lib/localCache';

interface SettingsViewProps {
  deployment: 'local' | 'vercel';
  pinProtected: boolean;
  settings: SettingsData;
  keys: KeyStatusMap;
  cacheStats: { cachedImages: number; cachedAudio: number };
  onUpdated: (nextSettings: SettingsData, nextKeys: KeyStatusMap) => void;
  onRefresh: () => Promise<void>;
}

const PROVIDERS = [
  { id: 'deepgram', keyField: 'DEEPGRAM_API_KEY', label: 'Deepgram (Hebrew STT — Nova-3)', recommended: true },
  { id: 'gemini', keyField: 'GEMINI_API_KEY', label: 'Google Gemini (Default Tutor + Cheap Images + Hebrew TTS)', recommended: true },
  { id: 'openai', keyField: 'OPENAI_API_KEY', label: 'OpenAI (GPT + gpt-image-1-mini + TTS)', recommended: false },
  { id: 'anthropic', keyField: 'ANTHROPIC_API_KEY', label: 'Anthropic (Claude Sonnet / Haiku)', recommended: false },
  { id: 'grok', keyField: 'GROK_API_KEY', label: 'xAI (Grok)', recommended: false },
  { id: 'kimi', keyField: 'KIMI_API_KEY', label: 'Moonshot AI (Kimi)', recommended: false },
  { id: 'qwen', keyField: 'QWEN_API_KEY', label: 'Alibaba Cloud (Qwen / DashScope)', recommended: false },
] as const;

export const SettingsView: React.FC<SettingsViewProps> = ({
  deployment,
  pinProtected,
  settings,
  keys,
  cacheStats,
  onUpdated,
  onRefresh,
}) => {
  const [localSettings, setLocalSettings] = useState<SettingsData>(settings);
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [accessPin, setAccessPin] = useState<string>(() => getAccessPin());
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      saveAccessPin(accessPin);
      saveLocalJson(LS_KEYS.SETTINGS, localSettings);

      if (deployment === 'vercel') {
        // On Vercel, store any entered keys locally on this phone/browser device
        saveDeviceApiKeys(keyInputs);
        const res = await api.getSettings();
        onUpdated(localSettings, res.keys);
        setKeyInputs({});
        setSavedMsg('Saved on this device! (Or configure keys once in Vercel Environment Variables.)');
      } else {
        const res = await api.saveSettings({
          settings: localSettings,
          keys: keyInputs,
        });
        onUpdated(res.settings, res.keys);
        setKeyInputs({});
        setSavedMsg('Settings & API keys saved safely to your local .env file!');
      }
      await onRefresh();
      setTimeout(() => setSavedMsg(''), 4500);
    } catch (err: any) {
      setSavedMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (providerId: string) => {
    setTestingId(providerId);
    try {
      const res = await api.testProvider(providerId);
      setTestResults((prev) => ({ ...prev, [providerId]: res }));
    } catch (err: any) {
      setTestResults((prev) => ({ ...prev, [providerId]: { ok: false, message: err.message } }));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2b1e10]">
            API Connections, Voice &amp; Learning Preferences
          </h1>
          <p className="text-sm text-[#66543f]">
            {deployment === 'vercel'
              ? 'Running on Vercel Cloud: set API keys once in Vercel Environment Variables (recommended) OR save them locally on your phone below.'
              : 'Running locally: keys are stored strictly on your computer inside .env and never sent back to the browser in plaintext.'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
          <Cloud className="w-3.5 h-3.5" />
          Mode: {deployment === 'vercel' ? 'Vercel Cloud / Mobile' : 'Local Studio'}
        </span>
      </div>

      {/* Optional Access PIN (when deployed publicly on Vercel with server API keys) */}
      {(deployment === 'vercel' || pinProtected) && (
        <div className="rounded-2xl bg-indigo-50/80 border border-indigo-200 p-4 space-y-2">
          <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
            <Lock className="w-4 h-4 text-indigo-700" />
            App Access PIN {pinProtected ? '(Required by Server)' : '(Optional Protection)'}
          </div>
          <p className="text-xs text-indigo-900">
            If you set <code className="bg-white px-1.5 py-0.5 rounded">APP_ACCESS_PIN</code> in Vercel Environment
            Variables to protect your API credits on a public URL, enter that same PIN here once on your phone.
          </p>
          <input
            type="password"
            value={accessPin}
            onChange={(e) => setAccessPin(e.target.value)}
            placeholder="Enter Access PIN (leave blank if none set)..."
            className="w-full sm:w-80 rounded-xl border border-indigo-300 bg-white px-3 py-2 text-xs focus:outline-none focus:border-indigo-700"
          />
        </div>
      )}

      {/* Cost-Saving Cache Indicator */}
      <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-emerald-950 text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <strong>Cost-Saving Mnemonic Cache Active:</strong> Generated illustrations are cached{' '}
            {deployment === 'vercel' ? 'directly on your phone (IndexedDB)' : 'permanently on disk'} so you never pay
            twice for the same letter or word.
          </div>
        </div>
        <div className="text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
          {cacheStats.cachedImages} Images • {cacheStats.cachedAudio} Audio Clips Cached
        </div>
      </div>

      {/* API Keys Vault */}
      <div className="parchment-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#2b1e10] flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-800" />
          API Keys
        </h2>

        <div className="space-y-3">
          {PROVIDERS.map((p) => {
            const st = keys[p.keyField];
            const test = testResults[p.id];
            return (
              <div
                key={p.id}
                className="rounded-xl bg-white border border-[#e6d9c2] p-3.5 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#2b1e10]">{p.label}</span>
                    {p.recommended && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-950">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        st?.configured ? 'text-emerald-700' : 'text-[#8c7860]'
                      }`}
                    >
                      {st?.configured
                        ? `Saved${st.source === 'server' ? ' in Server Env' : st.source === 'device' ? ' on Device' : ''} (${st.masked})`
                        : 'Not set'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTest(p.id)}
                      disabled={testingId === p.id}
                      className="px-2.5 py-1 rounded-lg bg-[#f3e9d6] hover:bg-amber-200/70 text-amber-950 text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      {testingId === p.id && <Loader2 className="w-3 h-3 animate-spin" />}
                      Test
                    </button>
                  </div>
                </div>

                <input
                  type="password"
                  value={keyInputs[p.keyField] ?? ''}
                  onChange={(e) => setKeyInputs({ ...keyInputs, [p.keyField]: e.target.value })}
                  placeholder={
                    st?.configured
                      ? 'Leave blank to keep current key, or paste a new key to replace...'
                      : `Paste your ${p.keyField}...`
                  }
                  className="w-full rounded-lg border border-[#dfd1b7] bg-[#fcfaf5] px-3 py-2 text-xs focus:outline-none focus:border-amber-700"
                />

                {test && (
                  <div
                    className={`text-xs flex items-center gap-1.5 ${
                      test.ok ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {test.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {test.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Default Providers & Models */}
      <div className="parchment-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#2b1e10]">
          Default Models for Tutoring, Images &amp; Hebrew Voice
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-amber-900 block mb-1">
              Default AI Tutor Provider
            </label>
            <select
              value={localSettings.tutorProvider}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  tutorProvider: e.target.value as SettingsData['tutorProvider'],
                })
              }
              className="w-full rounded-xl border border-[#dfd1b7] bg-white px-3 py-2.5 text-sm"
            >
              <option value="gemini">Google Gemini (Best overall value)</option>
              <option value="openai">OpenAI (GPT)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="grok">xAI (Grok)</option>
              <option value="kimi">Moonshot (Kimi)</option>
              <option value="qwen">Alibaba (Qwen)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-amber-900 block mb-1">
              Model ID for Selected Tutor
            </label>
            <input
              type="text"
              value={localSettings.tutorModels[localSettings.tutorProvider] || ''}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  tutorModels: {
                    ...localSettings.tutorModels,
                    [localSettings.tutorProvider]: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border border-[#dfd1b7] bg-white px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-amber-900 block mb-1">
              Mnemonic Image Generator (Cheap &amp; Cached)
            </label>
            <select
              value={localSettings.imageProvider}
              onChange={(e) => {
                const prov = e.target.value as 'gemini' | 'openai';
                setLocalSettings({
                  ...localSettings,
                  imageProvider: prov,
                  imageModel: prov === 'gemini' ? 'gemini-2.5-flash-image' : 'gpt-image-1-mini',
                });
              }}
              className="w-full rounded-xl border border-[#dfd1b7] bg-white px-3 py-2.5 text-sm"
            >
              <option value="gemini">Google Gemini (gemini-2.5-flash-image)</option>
              <option value="openai">OpenAI (gpt-image-1-mini)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-amber-900 block mb-1">
              Hebrew Text-to-Speech Voice
            </label>
            <select
              value={localSettings.ttsProvider}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  ttsProvider: e.target.value as SettingsData['ttsProvider'],
                })
              }
              className="w-full rounded-xl border border-[#dfd1b7] bg-white px-3 py-2.5 text-sm"
            >
              <option value="gemini">Google Gemini Native Hebrew TTS (Recommended)</option>
              <option value="openai">OpenAI TTS (gpt-4o-mini-tts)</option>
              <option value="browser">Free Browser Web Speech (he-IL)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-emerald-800">{savedMsg}</div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings &amp; Keys
        </button>
      </div>
    </form>
  );
};
