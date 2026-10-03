import React from 'react';
import { Album } from '../types';

interface AlbumRowProps {
  album: Album;
  onSetFree: () => void;
  onSetVip: () => void;
  onReset: () => void;
  loading?: boolean;
}

export const AlbumRow: React.FC<AlbumRowProps> = ({
  album,
  onSetFree,
  onSetVip,
  onReset,
  loading = false,
}) => {
  const isFree = album.isFree === true;
  const isVip = album.isVip === true;
  const isOverridden = album.isOverridden === true;
  const order = album.order ?? 0;

  return (
    <div
      className={`flex items-center gap-4 p-3.5 bg-white rounded-2xl border transition-all shadow-xs hover:shadow-sm ${
        isVip
          ? 'border-red-200 bg-red-50/20'
          : isFree
          ? 'border-emerald-200 bg-emerald-50/20'
          : 'border-gray-200'
      }`}
    >
      {/* Pochette */}
      <img
        src={album.imageAlbum}
        alt={album.titreAlbum}
        className="w-14 h-14 rounded-xl object-cover shadow-xs border border-gray-100 shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=150&q=80';
        }}
      />

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm truncate">
            {album.titreAlbum}
          </span>
          {album.annee && (
            <span className="text-[11px] text-gray-400 font-mono">({album.annee})</span>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate mt-0.5">
          {album.nomArtiste || 'Artiste'}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
          {/* Position / Ancienneté */}
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
            {order === 0 ? '🥇 1er (Plus ancien)' : `#${order + 1}`}
          </span>

          {/* Statut */}
          {isFree && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
              🆓 Gratuit
            </span>
          )}
          {isVip && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-semibold flex items-center gap-1">
              🔒 Premium VIP
            </span>
          )}
          {!isOverridden && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium">
              Auto (1er gratuit)
            </span>
          )}
          {isOverridden && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 font-semibold">
              ⚡ Forcé
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onSetFree}
          disabled={isFree || loading}
          title="Rendre gratuit"
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1 ${
            isFree
              ? 'bg-emerald-50 text-emerald-300 border border-emerald-100 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs active:scale-95 cursor-pointer'
          }`}
        >
          <span>🆓</span>
          <span className="hidden sm:inline">Gratuit</span>
        </button>
        <button
          type="button"
          onClick={onSetVip}
          disabled={isVip || loading}
          title="Forcer Premium VIP"
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1 ${
            isVip
              ? 'bg-red-50 text-red-300 border border-red-100 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-xs active:scale-95 cursor-pointer'
          }`}
        >
          <span>🔒</span>
          <span className="hidden sm:inline">VIP</span>
        </button>
        {isOverridden && (
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            title="Réinitialiser à la règle par défaut"
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <span>↺</span>
            <span className="hidden md:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AlbumRow;
