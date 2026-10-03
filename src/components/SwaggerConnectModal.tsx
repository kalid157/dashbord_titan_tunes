import React, { useState } from 'react';
import {
  Server,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  X,
  Radio,
  Sliders,
  Sparkles,
  Link2,
  Copy,
  Check,
  Terminal,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import { BackendConfig } from '../types';

interface SwaggerConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BackendConfig;
  onConfigUpdated: (newConfig: BackendConfig) => void;
  onRefreshData: () => void;
}

export const SwaggerConnectModal: React.FC<SwaggerConnectModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
  onRefreshData,
}) => {
  const [targetUrl, setTargetUrl] = useState(() => {
    const saved = localStorage.getItem('backend_target_url');
    if (saved && !saved.includes('localhost:8081')) return saved;
    return config.targetUrl || 'https://titan-tune-reset.onrender.com';
  });
  const [mode, setMode] = useState<BackendConfig['mode']>(config.mode || 'proxy_with_fallback');
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
    tip?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText('npx localtunnel --port 8081');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // First save target if modified
      await api.updateBackendConfig({ targetUrl: targetUrl.trim(), mode });
      // Test status via proxy
      const status = await api.getBackendStatus();
      onConfigUpdated(status);

      if (status.isConnected) {
        setTestResult({
          success: true,
          message: `Connexion réussie à Swagger sur ${status.targetUrl} !`,
          latency: status.latency,
        });
        onRefreshData();
      } else {
        // Also test direct browser fetch
        let browserDirectWorked = false;
        try {
          const directCheck = await fetch(`${targetUrl.trim()}/playlist/all`, { mode: 'cors' });
          if (directCheck.ok) {
            browserDirectWorked = true;
          }
        } catch {
          // direct failed too
        }

        if (browserDirectWorked) {
          setTestResult({
            success: true,
            message: `Le conteneur Docker répond directement à votre navigateur, mais pas depuis le Cloud Run ! Activez le mode tunnel ou mode direct.`,
          });
        } else {
          setTestResult({
            success: false,
            message: `Le backend sur ${targetUrl} n'a pas répondu au serveur Cloud.`,
            tip: `Astuce : Comme cette application tourne dans le Cloud (europe-west3), "localhost" désigne le serveur cloud et non votre PC (sabr@sabr). Lancez "npx localtunnel --port 8081" dans votre terminal Linux pour lui donner une URL accessible.`,
          });
        }
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Erreur de test réseau',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsTesting(true);
    try {
      // Save client storage too
      localStorage.setItem('backend_target_url', targetUrl.trim());
      localStorage.setItem('backend_client_mode', mode === 'browser_direct' ? 'browser_direct' : 'proxy');

      const res = await api.updateBackendConfig({
        targetUrl: targetUrl.trim(),
        mode,
      });
      const status = await api.getBackendStatus();
      onConfigUpdated({ ...status, mode: res.mode, targetUrl: res.targetUrl });
      onRefreshData();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF8A00] to-[#E8A23F] flex items-center justify-center text-white shadow-sm">
              <Server size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Liaison Backend & Swagger</h3>
              <p className="text-xs text-gray-500 font-mono truncate max-w-xs">
                {config.swaggerUrl || `${targetUrl.replace(/\/$/, '')}/swagger-ui/index.html`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1 transition rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current status pill */}
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
            config.isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Radio
              size={14}
              className={config.isConnected ? 'text-emerald-600 animate-pulse' : 'text-amber-500'}
            />
            <span className="font-semibold">
              {config.isConnected
                ? 'Backend Swagger en ligne (Connecté)'
                : 'Serveur Cloud Render connecté'}
            </span>
          </div>
          {config.latency && (
            <span className="text-[11px] font-mono text-emerald-700 bg-white/60 px-2 py-0.5 rounded-full">
              {config.latency}ms
            </span>
          )}
        </div>

        {/* Contextual Cloud Card: Render vs Local Docker */}
        {targetUrl.includes('render.com') || targetUrl.startsWith('https://') ? (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Check size={16} className="text-emerald-600" />
              <span>Backend Render en Ligne ({targetUrl})</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Votre backend est hébergé sur Render. Toutes vos requêtes pour enregistrer des artistes (<code>/user/registerArtist</code>), créer des albums (<code>/albums/create</code>) ou ajouter des morceaux sont directement synchronisées avec votre base de données en ligne.
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-sky-900 font-bold">
              <Cpu size={15} />
              <span>Pourquoi localhost:8081 n&apos;a pas reçu l&apos;album ?</span>
            </div>
            <p className="text-sky-800 text-[11px] leading-relaxed">
              Votre conteneur Docker tourne sur votre ordinateur local (<strong>sabr@sabr</strong>), tandis que cette interface s&apos;exécute sur le Cloud.
            </p>

            <div className="pt-1.5 border-t border-sky-200/60">
              <p className="text-[11px] font-semibold text-sky-950 mb-1">
                Solution en 1 commande dans votre terminal :
              </p>
              <div className="flex items-center justify-between bg-sky-900 text-sky-100 font-mono text-[11px] px-3 py-1.5 rounded-xl">
                <span>npx localtunnel --port 8081</span>
                <button
                  type="button"
                  onClick={handleCopyCmd}
                  className="hover:text-white transition flex items-center gap-1 text-[10px] bg-white/10 px-2 py-0.5 rounded"
                >
                  {copiedCmd ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedCmd ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              URL Racine du Backend Swagger (ou URL Tunnel)
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://titan-tune-reset.onrender.com"
                className="w-full pl-3.5 pr-44 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:border-[#FF8A00] outline-none"
              />
              <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTargetUrl('https://titan-tune-reset.onrender.com')}
                  className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md"
                  title="Utiliser Render"
                >
                  Render
                </button>
                <button
                  type="button"
                  onClick={() => setTargetUrl('http://localhost:8081')}
                  className="text-[10px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md"
                  title="Utiliser localhost"
                >
                  Local 8081
                </button>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Stratégie de routage
            </label>
            <div className="space-y-2">
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  mode === 'proxy_with_fallback'
                    ? 'border-[#FF8A00] bg-orange-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="proxy_mode"
                  checked={mode === 'proxy_with_fallback'}
                  onChange={() => setMode('proxy_with_fallback')}
                  className="mt-0.5 accent-[#FF8A00]"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    Proxy Swagger avec Tunnel ou Fallback (Recommandé)
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Transmet toutes les créations au backend ciblé. Si non accessible, sauvegarde temporairement dans la mémoire locale de test.
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  mode === 'proxy_strict'
                    ? 'border-[#FF8A00] bg-orange-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="proxy_mode"
                  checked={mode === 'proxy_strict'}
                  onChange={() => setMode('proxy_strict')}
                  className="mt-0.5 accent-[#FF8A00]"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    Mode Strict Swagger (Exige le backend actif)
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Refuse d&apos;enregistrer en simulation locale si le conteneur Docker ne répond pas.
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  mode === 'browser_direct'
                    ? 'border-[#FF8A00] bg-orange-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="proxy_mode"
                  checked={mode === 'browser_direct'}
                  onChange={() => setMode('browser_direct')}
                  className="mt-0.5 accent-[#FF8A00]"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    Appel Direct Navigateur vers {targetUrl}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Effectue les requêtes fetch() directement depuis votre navigateur client (même PC que Docker).
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs space-y-1.5 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="font-semibold">{testResult.message}</div>
            </div>
            {testResult.tip && (
              <p className="text-[11px] text-red-700 pl-6 leading-relaxed bg-white/60 p-2 rounded-lg border border-red-100">
                {testResult.tip}
              </p>
            )}
            {testResult.latency && (
              <p className="text-[10px] pl-6 font-mono text-emerald-700">Temps de réponse: {testResult.latency}ms</p>
            )}
          </div>
        )}

        {/* Direct Link to Swagger */}
        <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <Globe size={16} className="text-[#FF8A00] shrink-0" />
            <span className="text-xs text-gray-700 font-mono truncate">
              {targetUrl}/swagger-ui/index.html
            </span>
          </div>
          <a
            href={`${targetUrl}/swagger-ui/index.html`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#FF8A00] hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <span>Ouvrir</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
            <span>Tester la connexion</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isTesting}
            className="flex-1 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#e07b00] text-xs font-semibold text-white transition shadow-sm shadow-orange-500/25 flex items-center justify-center gap-1.5"
          >
            <span>Appliquer les réglages</span>
          </button>
        </div>
      </div>
    </div>
  );
};

