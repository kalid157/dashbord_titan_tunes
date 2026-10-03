import React, { useEffect, useState } from 'react';
import { albumService } from '../services/albumService';
import AlbumRow from '../components/AlbumRow';
import Toast from '../components/Toast';
import { Album } from '../types';
import { ArrowLeft, RefreshCw, ArrowUpDown } from 'lucide-react';

interface AlbumManagerProps {
  onBack?: () => void;
  onRefreshGlobal?: () => void;
}

export const AlbumManager: React.FC<AlbumManagerProps> = ({ onBack, onRefreshGlobal }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FREE' | 'VIP' | 'OVERRIDDEN'>('ALL');
  const [sortOrder, setSortOrder] = useState<'OLD_FIRST' | 'NEW_FIRST'>('OLD_FIRST');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await albumService.getAll();
      setAlbums(data);
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les albums');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleSetFree = async (album: Album) => {
    const tid = album.trackingId || album.trackingIdAlbum;
    try {
      setActionLoading(true);
      await albumService.setFree(tid);
      await loadAlbums();
      showToast(`"${album.titreAlbum}" → Forcé Gratuit 🆓`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetVip = async (album: Album) => {
    const tid = album.trackingId || album.trackingIdAlbum;
    try {
      setActionLoading(true);
      await albumService.setVip(tid);
      await loadAlbums();
      showToast(`"${album.titreAlbum}" → Forcé Premium 🔒`, 'warning');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async (album: Album) => {
    const tid = album.trackingId || album.trackingIdAlbum;
    try {
      setActionLoading(true);
      await albumService.reset(tid);
      await loadAlbums();
      showToast(`"${album.titreAlbum}" → Règle par défaut (Auto)`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du reset', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Group by artist
  const grouped = albums.reduce((acc: Record<string, Album[]>, album) => {
    const key = (album.nomArtiste || 'Artiste Inconnu').trim();
    if (!acc[key]) acc[key] = [];
    acc[key].push(album);
    return acc;
  }, {});

  // Apply search, status filter and sort order
  const filteredGrouped = Object.entries(grouped).reduce(
    (acc: Record<string, Album[]>, [artist, artistAlbums]) => {
      const q = search.toLowerCase();
      let matched = artistAlbums.filter((a) => {
        const matchesQuery =
          a.titreAlbum.toLowerCase().includes(q) ||
          artist.toLowerCase().includes(q);

        if (!matchesQuery) return false;

        if (statusFilter === 'FREE') return a.isFree === true;
        if (statusFilter === 'VIP') return a.isVip === true;
        if (statusFilter === 'OVERRIDDEN') return a.isOverridden === true;
        return true;
      });

      // Sort by order or year
      matched.sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return sortOrder === 'OLD_FIRST' ? orderA - orderB : orderB - orderA;
      });

      if (matched.length > 0) acc[artist] = matched;
      return acc;
    },
    {}
  );

  // Stats
  const stats = {
    total: albums.length,
    free: albums.filter((a) => a.isFree).length,
    vip: albums.filter((a) => a.isVip).length,
    overridden: albums.filter((a) => a.isOverridden).length,
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 pb-20 animate-in fade-in duration-150">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-50 transition cursor-pointer shadow-xs"
                title="Retour au Dashboard"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                <span>🎵</span>
                <span>Gestion des Albums (Gratuit & VIP)</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Le <b>1er album</b> de chaque artiste (le plus ancien) est <b>gratuit 🆓</b> par défaut. Les albums suivants (plus récents) sont <b>verrouillés Premium 🔒</b>. Vous pouvez forcer ou réinitialiser n&apos;importe quel album.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadAlbums}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Albums" value={stats.total} color="gray" />
          <StatCard label="Gratuits 🆓" value={stats.free} color="green" />
          <StatCard label="Premium 🔒" value={stats.vip} color="red" />
          <StatCard label="Forcés Manuellement" value={stats.overridden} color="orange" />
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="🔍 Rechercher un artiste ou un album..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50/50"
            />
            {/* Sort Toggle: Ancien d'abord vs Nouveau d'abord */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'OLD_FIRST' ? 'NEW_FIRST' : 'OLD_FIRST'))}
              className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              title="Changer le sens de tri"
            >
              <ArrowUpDown size={14} className="text-orange-600" />
              <span>
                {sortOrder === 'OLD_FIRST' ? '📅 Ancien d’abord (1er gratuit)' : '⚡ Nouveau d’abord (Récents)'}
              </span>
            </button>
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
            <span className="text-gray-400 font-medium mr-1 text-[11px]">Filtrer:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'ALL'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('FREE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'FREE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Gratuits ({stats.free})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('VIP')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'VIP'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Premium VIP ({stats.vip})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('OVERRIDDEN')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'OVERRIDDEN'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              Forcés ({stats.overridden})
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-16 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-orange-500 border-t-transparent"></div>
            <p className="mt-3 text-sm font-medium">Chargement des albums et calcul des statuts...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between">
            <span>❌ {error}</span>
            <button
              type="button"
              onClick={loadAlbums}
              className="text-xs font-bold underline cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* List of Albums Grouped by Artist */}
        {!loading && !error && (
          <div className="space-y-6">
            {Object.entries(filteredGrouped).map(([artist, artistAlbums]) => (
              <div
                key={artist}
                className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-3"
              >
                {/* Artist Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">
                      👤 {artist}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 bg-gray-100 rounded-full text-gray-600 font-semibold font-mono">
                      {artistAlbums.length} album{artistAlbums.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                    {sortOrder === 'OLD_FIRST' ? 'Ordre chronologique : Ancien → Récent' : 'Ordre inversé : Récent → Ancien'}
                  </span>
                </div>

                {/* Artist Album Rows */}
                <div className="space-y-2.5">
                  {artistAlbums.map((album) => (
                    <AlbumRow
                      key={album.trackingId || album.trackingIdAlbum}
                      album={album}
                      loading={actionLoading}
                      onSetFree={() => handleSetFree(album)}
                      onSetVip={() => handleSetVip(album)}
                      onReset={() => handleReset(album)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(filteredGrouped).length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-500 space-y-2">
                <p className="text-4xl">🔍</p>
                <p className="font-semibold text-gray-800">Aucun album trouvé</p>
                <p className="text-xs text-gray-400">
                  Modifiez vos critères de recherche ou réinitialisez les filtres.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════
const StatCard = ({ label, value, color }: { label: string; value: number; color: 'gray' | 'green' | 'red' | 'orange' }) => {
  const colors = {
    gray: 'bg-white border border-gray-200 text-gray-800',
    green: 'bg-emerald-50/60 border border-emerald-200 text-emerald-900',
    red: 'bg-red-50/60 border border-red-200 text-red-900',
    orange: 'bg-orange-50/60 border border-orange-200 text-orange-900',
  };

  return (
    <div className={`${colors[color]} p-4 rounded-2xl shadow-xs transition hover:shadow-sm`}>
      <div className="text-[11px] uppercase font-bold tracking-wider opacity-70">
        {label}
      </div>
      <div className="text-2xl font-black mt-1">{value}</div>
    </div>
  );
};

export default AlbumManager;
