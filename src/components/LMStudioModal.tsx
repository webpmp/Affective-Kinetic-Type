import React, { useState, useEffect } from 'react';
import { X, Server, CheckCircle, XCircle, Loader2, ExternalLink, Monitor, Cpu, Key, Globe } from 'lucide-react';
import {
  LMStudioConfig,
  DEFAULT_LM_STUDIO_CONFIG,
  testLMStudioConnection,
  saveLMStudioConfig,
  loadLMStudioConfig,
} from '../lib/aiProvider';

interface LMStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: LMStudioConfig) => void;
  initialError?: string;
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

export function LMStudioModal({ isOpen, onClose, onConnect, initialError }: LMStudioModalProps) {
  const [config, setConfig] = useState<LMStudioConfig>(DEFAULT_LM_STUDIO_CONFIG);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Load saved config on mount and auto-test if opened from an error
  useEffect(() => {
    if (isOpen) {
      const saved = loadLMStudioConfig();
      setConfig(saved);
      setConnectionStatus('idle');
      setStatusMessage('');
      setAvailableModels([]);
      // If opened because of an error, auto-test so the model list populates
      if (initialError) {
        setTimeout(async () => {
          setConnectionStatus('testing');
          setStatusMessage('Testing connection...');
          const result = await testLMStudioConnection(saved);
          if (result.ok) {
            setConnectionStatus('success');
            setAvailableModels(result.models || []);
            setStatusMessage(
              result.models && result.models.length > 0
                ? `Connected! ${result.models.length} model${result.models.length !== 1 ? 's' : ''} available — select one below.`
                : 'Connected! No models currently loaded in LM Studio.'
            );
          } else {
            setConnectionStatus('error');
            setStatusMessage(result.error || 'Connection failed.');
          }
        }, 150);
      }
    }
  }, [isOpen, initialError]);

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setStatusMessage('Testing connection...');
    setAvailableModels([]);

    const result = await testLMStudioConnection(config);

    if (result.ok) {
      setConnectionStatus('success');
      setAvailableModels(result.models || []);
      setStatusMessage(
        result.models && result.models.length > 0
          ? `Connected! ${result.models.length} model${result.models.length !== 1 ? 's' : ''} available — select one below.`
          : 'Connected! No models currently loaded.'
      );
    } else {
      setConnectionStatus('error');
      setStatusMessage(result.error || 'Connection failed.');
    }
  };

  const handleSelectModel = (model: string) => {
    setConfig(prev => ({ ...prev, modelId: model }));
  };

  const handleSave = () => {
    saveLMStudioConfig(config);
    onConnect(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Server className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Configure LM Studio</h2>
              <p className="text-xs text-slate-500">Connect to a local LLM server</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
          {/* How-to Section */}
          <div className="px-6 pt-5 pb-4">
            {/* Error Banner */}
            {initialError && (
              <div className="mb-3 flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-semibold mb-0.5">LM Studio Error</p>
                  <p className="leading-relaxed opacity-90">{initialError}</p>
                </div>
              </div>
            )}
            <div className="bg-gradient-to-br from-indigo-50/80 to-violet-50/80 border border-indigo-100 rounded-xl p-4">
              <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                How to use local LLM models
              </h3>
              <ol className="space-y-2">
                {[
                  { step: '1', icon: Monitor, text: 'Open LM Studio on your local desktop.' },
                  { step: '2', icon: Cpu, text: 'In the Developer Server tab, load a model and toggle the Local Server switch ON.' },
                  { step: '3', icon: ExternalLink, text: 'Toggle the AI Provider dropdown to LM Studio to activate local parsing.' },
                ].map(({ step, icon: Icon, text }) => (
                  <li key={step} className="flex items-start gap-2.5">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {step}
                    </span>
                    <span className="text-xs text-indigo-900 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Config Form */}
          <div className="px-6 pb-5 space-y-3.5">
            {/* Server URL */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Server URL
              </label>
              <input
                type="text"
                value={config.url}
                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                placeholder="http://localhost:1234"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Model ID */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                Model ID
                <span className="text-[10px] font-normal text-slate-400">(optional — required if multiple models are loaded)</span>
              </label>
              <input
                type="text"
                value={config.modelId}
                onChange={(e) => setConfig(prev => ({ ...prev, modelId: e.target.value }))}
                placeholder="Leave blank to use the currently loaded model"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Connection Status — appears above model chips */}
            {connectionStatus !== 'idle' && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                connectionStatus === 'testing'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : connectionStatus === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {connectionStatus === 'testing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {connectionStatus === 'success' && <CheckCircle className="w-3.5 h-3.5" />}
                {connectionStatus === 'error' && <XCircle className="w-3.5 h-3.5" />}
                <span className="leading-tight">{statusMessage}</span>
              </div>
            )}

            {/* Available model chips — below status message */}
            {availableModels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {availableModels.map(model => (
                  <button
                    key={model}
                    onClick={() => handleSelectModel(model)}
                    className={`text-[10px] px-2.5 py-1 rounded-md border transition-colors ${
                      config.modelId === model
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}

            {/* API Key */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                API Key / Bearer Token
                <span className="text-[10px] font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Not required for most local setups"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleTestConnection}
            disabled={connectionStatus === 'testing' || !config.url.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {connectionStatus === 'testing' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Server className="w-3.5 h-3.5" />
            )}
            Test Connection
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={connectionStatus !== 'success'}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save &amp; Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
