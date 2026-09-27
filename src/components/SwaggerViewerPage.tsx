import React, { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Server,
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Terminal,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BackendConfig } from '../types';
import { api } from '../services/api';

interface SwaggerViewerPageProps {
  onBack: () => void;
  config: BackendConfig;
  onOpenConnectModal: () => void;
  onConfigUpdated: (newConfig: BackendConfig) => void;
}

export const SwaggerViewerPage: React.FC<SwaggerViewerPageProps> = ({
  onBack,
  config,
  onOpenConnectModal,
  onConfigUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'iframe'>('endpoints');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('playlist');

  const swaggerUrl = config.swaggerUrl || 'http://localhost:8081/swagger-ui/index.html';

  const copySwaggerUrl = () => {
    navigator.clipboard.writeText(swaggerUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const status = await api.getBackendStatus();
      onConfigUpdated(status);
    } finally {
      setIsRefreshing(false);
    }
  };

  const playlistEndpoints = [
    { method: 'POST', path: '/playlist/addSong', desc: 'Ajouter une chanson à une playlist' },
    { method: 'GET', path: '/playlist/all', desc: 'Lister toutes les playlists' },
    { method: 'GET', path: '/playlist/allForOne/{trackingIdClient}', desc: "Lister les playlists d'un client" },
    { method: 'PUT', path: '/playlist/changeVisibilite/{trackingIdPlaylist}', desc: "Changer la visibilité d'une playlist" },
    { method: 'POST', path: '/playlist/create/{trackingIdClient}', desc: 'Créer une playlist pour un client' },
    { method: 'GET', path: '/playlist/get/{trackingId}', desc: 'Obtenir une playlist par UUID' },
    { method: 'GET', path: '/playlist/getAllSongForPlaylist/{trackingIdSong}', desc: 'Lister les playlists contenant une chanson' },
    { method: 'DELETE', path: '/playlist/removeSongForPlaylist/{trackingIdPlaylist}/{trackingIdSong}', desc: "Supprimer une chanson d'une playlist" },
    { method: 'PUT', path: '/playlist/update/{trackingIdClient}/{trackingIdPlaylist}', desc: 'Mettre à jour une playlist' },
  ];

  const songEndpoints = [
    { method: 'POST', path: '/song/create', desc: 'Créer une chanson' },
    { method: 'DELETE', path: '/song/delete/{trackingIdSong}', desc: 'Supprimer une chanson' },
    { method: 'POST', path: '/song/upload', desc: 'Uploader une chanson avec fichier audio' },
    { method: 'GET', path: '/song/get/{trackingIdSong}', desc: 'Lister ou obtenir une chanson' },
    { method: 'PUT', path: '/song/update/{trackingIdSong}', desc: 'Mettre à jour les infos d\'une chanson' },
    { method: 'POST', path: '/song/updateAudio/{trackingIdSong}', desc: "Mettre à jour l'audio d'une chanson" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black font-medium text-sm transition"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-[#FF8A00]" />
          <h2 className="text-base font-semibold text-gray-800">
            Intégration Swagger OpenAPI (Port 8081)
          </h2>
        </div>
        <button
          onClick={onOpenConnectModal}
          className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF8A00] hover:bg-orange-100 transition text-xs font-semibold"
        >
          Configuration
        </button>
      </div>

      {/* Hero Banner: Swagger link & connection status */}
      <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#85EA2D]/20 border border-[#85EA2D]/40 flex items-center justify-center text-[#85EA2D]">
              <Code2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Swagger UI OpenAPI</h3>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono">
                  v3 / 8081
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-0.5">{swaggerUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySwaggerUrl}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition"
              title="Copier le lien Swagger"
            >
              {copiedUrl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedUrl ? 'Copié !' : 'Copier lien'}</span>
            </button>

            <a
              href={swaggerUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#85EA2D] hover:bg-[#72cb25] text-gray-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <span>Ouvrir Swagger UI</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Live status check */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                config.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-gray-200">
              État du serveur :{' '}
              <strong className={config.isConnected ? 'text-emerald-400' : 'text-amber-300'}>
                {config.isConnected
                  ? `Connecté en direct (${config.latency}ms)`
                  : 'Backend 8081 hors-ligne (Mode Fallback Local)'}
              </strong>
            </span>
          </div>

          <button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="text-gray-300 hover:text-white flex items-center gap-1 text-[11px] transition"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Tester ping</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'endpoints'
              ? 'bg-[#FF8A00] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Spécification des Endpoints Swagger
        </button>
        <button
          onClick={() => setActiveTab('iframe')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'iframe'
              ? 'bg-[#FF8A00] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Aperçu Intégré (Iframe)
        </button>
      </div>

      {/* Tab 1: Endpoints Schema Details */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          {/* Playlist Controller */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === 'playlist' ? null : 'playlist')
              }
              className="w-full p-3.5 bg-rose-50/50 hover:bg-rose-50 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Playlist Controller (/playlist/*)
                </h4>
                <span className="text-[11px] text-gray-500 font-mono">
                  ({playlistEndpoints.length} endpoints)
                </span>
              </div>
              {expandedSection === 'playlist' ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>

            {expandedSection === 'playlist' && (
              <div className="divide-y divide-gray-100 p-2 space-y-1">
                {playlistEndpoints.map((ep, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl hover:bg-gray-50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 font-mono">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ep.method === 'PUT'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-semibold text-gray-900 truncate">{ep.path}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 truncate shrink-0">{ep.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Song Controller */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'song' ? null : 'song')}
              className="w-full p-3.5 bg-purple-50/50 hover:bg-purple-50 flex items-center justify-between text-left transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6B4EFF]" />
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Song Controller (/song/*)
                </h4>
                <span className="text-[11px] text-gray-500 font-mono">
                  ({songEndpoints.length} endpoints)
                </span>
              </div>
              {expandedSection === 'song' ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>

            {expandedSection === 'song' && (
              <div className="divide-y divide-gray-100 p-2 space-y-1">
                {songEndpoints.map((ep, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl hover:bg-gray-50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 font-mono">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ep.method === 'PUT'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-semibold text-gray-900 truncate">{ep.path}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 truncate shrink-0">{ep.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Embedded Iframe View */}
      {activeTab === 'iframe' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs space-y-3 p-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
            <Globe size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Accès direct au Swagger local (8081)</p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Certains navigateurs restreignent l&apos;intégration directe d&apos;un port HTTP local (`http://localhost:8081`) dans une iframe HTTPS. Si la fenêtre ci-dessous reste blanche, cliquez sur le bouton ci-dessous pour ouvrir Swagger UI directement.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <a
              href={swaggerUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>Ouvrir {swaggerUrl}</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="w-full h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-gray-100">
            <iframe
              src={swaggerUrl}
              title="Swagger UI"
              className="w-full h-full border-0"
              onError={() => console.warn('Iframe load error')}
            />
          </div>
        </div>
      )}
    </div>
  );
};
