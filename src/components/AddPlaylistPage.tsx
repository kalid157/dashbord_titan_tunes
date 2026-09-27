import React, { useState } from 'react';
import {
  ArrowLeft,
  ListPlus,
  Image as ImageIcon,
  Info,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Music,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { Playlist, Song } from '../types';

interface AddPlaylistPageProps {
  onBack: () => void;
  onPlaylistAdded: (playlist: Playlist) => void;
  availableSongs: Song[];
}

export const AddPlaylistPage: React.FC<AddPlaylistPageProps> = ({
  onBack,
  onPlaylistAdded,
  availableSongs,
}) => {
  const [titre, setTitre] = useState('');
  const [image, setImage] = useState('');
  const [clientTrackingId, setClientTrackingId] = useState('client_admin_root');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const samplePlaylistCovers = [
    { label: 'Festival Stage', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80' },
    { label: 'Neon Mood', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Urban Nights', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80' },
    { label: 'Summer Pool', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' },
  ];

  const handleFillDemo = () => {
    setTitre('Afrobeats Workout & Energy');
    setImage('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80');
    setIsPublic(true);
    if (availableSongs.length > 0) {
      setSelectedSongIds([availableSongs[0].trackingIdSong]);
    }
    setErrorMsg(null);
  };

  const toggleSongSelection = (id: string) => {
    setSelectedSongIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setErrorMsg('Veuillez entrer le nom de la playlist');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Calls endpoint: /playlist/create/{trackingIdClient}
      const result = await api.createPlaylist(clientTrackingId.trim() || 'client_admin_root', {
        titre: titre.trim(),
        imageAlbum: (image || samplePlaylistCovers[0].url).trim(),
        visibilite: isPublic,
        songIds: selectedSongIds,
      });

      if (result.success && result.playlist) {
        setSuccessMsg('Playlist créée avec succès ✅');
        onPlaylistAdded(result.playlist);
        setTimeout(() => {
          onBack();
        }, 1200);
      } else {
        setErrorMsg(result.message || 'Erreur lors de la création de la playlist');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top AppBar */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black font-medium text-sm transition"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
        <h2 className="text-base font-semibold text-gray-800">Créer une playlist</h2>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-xs text-[#FF6B6B] font-medium hover:underline flex items-center gap-1"
        >
          <Sparkles size={13} />
          Exemple
        </button>
      </div>

      {/* Header Info Box */}
      <div className="p-4 rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 flex items-start gap-3">
        <Info className="text-[#FF6B6B] shrink-0 mt-0.5" size={20} />
        <p className="text-xs text-gray-700 leading-relaxed">
          Les playlists créées peuvent être publiques pour tous les auditeurs ou réservées au compte client spécifié.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg} Redirection en cours...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Field: Titre Playlist */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-800 block">Titre de la playlist</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FF6B6B]">
              <ListPlus size={19} />
            </div>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Titan Top Hits 2026"
              required
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-gray-300 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 text-sm outline-none transition shadow-sm"
            />
          </div>
        </div>

        {/* Field: Image Playlist */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-800 block">URL de la couverture</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FF6B6B]">
              <ImageIcon size={19} />
            </div>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://...jpg"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-gray-300 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 text-sm outline-none transition shadow-sm font-mono text-xs"
            />
          </div>

          {/* Quick preset covers */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            <span className="text-[11px] text-gray-400 shrink-0 font-medium">Suggestions :</span>
            {samplePlaylistCovers.map((c, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setImage(c.url)}
                className="text-[11px] px-2 py-1 rounded-md bg-gray-100 hover:bg-rose-50 hover:text-rose-700 transition border border-gray-200 shrink-0"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Client Tracking ID (Le clientTrackingId vient de authNotifier.user.id) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-gray-800">
              Tracking ID Client (Propriétaire)
            </label>
            <span className="text-[11px] text-gray-400 font-mono">authNotifier.user.id</span>
          </div>
          <input
            type="text"
            value={clientTrackingId}
            onChange={(e) => setClientTrackingId(e.target.value)}
            placeholder="client_admin_root"
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-[#FF6B6B] focus:bg-white text-xs font-mono outline-none transition"
          />
        </div>

        {/* Visibility Setting */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[13px] font-semibold text-gray-800 block">Visibilité</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`p-3 rounded-xl border flex items-center gap-3 transition text-left cursor-pointer ${
                isPublic
                  ? 'border-[#FF6B6B] bg-[#FF6B6B]/5 text-gray-900 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <Globe className={isPublic ? 'text-[#FF6B6B]' : 'text-gray-400'} size={20} />
              <div>
                <div className="text-xs font-bold">Publique</div>
                <div className="text-[11px] text-gray-500">Accessible à tous</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`p-3 rounded-xl border flex items-center gap-3 transition text-left cursor-pointer ${
                !isPublic
                  ? 'border-[#FF6B6B] bg-[#FF6B6B]/5 text-gray-900 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <Lock className={!isPublic ? 'text-[#FF6B6B]' : 'text-gray-400'} size={20} />
              <div>
                <div className="text-xs font-bold">Privée</div>
                <div className="text-[11px] text-gray-500">Réservée au compte</div>
              </div>
            </button>
          </div>
        </div>

        {/* Select Initial Songs */}
        {availableSongs.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-gray-800">
                Ajouter des chansons ({selectedSongIds.length} sélectionnée{selectedSongIds.length > 1 ? 's' : ''})
              </label>
              <span className="text-[11px] text-gray-400">Optionnel</span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-gray-50 border border-gray-200">
              {availableSongs.map((s) => {
                const isSelected = selectedSongIds.includes(s.trackingIdSong);
                return (
                  <div
                    key={s.trackingIdSong}
                    onClick={() => toggleSongSelection(s.trackingIdSong)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-rose-50 border border-rose-200 text-gray-900'
                        : 'bg-white hover:bg-gray-100 border border-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={s.imageAlbum}
                        alt={s.titre}
                        className="w-8 h-8 rounded-md object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{s.titre}</p>
                        <p className="text-[11px] text-gray-500 truncate">{s.artiste}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                        isSelected
                          ? 'bg-[#FF6B6B] border-[#FF6B6B] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Playlist Card Preview */}
        {(titre || image) && (
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
            <img
              src={image || samplePlaylistCovers[0].url}
              alt="Playlist Preview"
              className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = samplePlaylistCovers[0].url;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B6B] bg-rose-50 px-1.5 py-0.5 rounded">
                  Playlist
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  {isPublic ? <Globe size={11} /> : <Lock size={11} />}
                  {isPublic ? 'Publique' : 'Privée'}
                </span>
              </div>
              <h5 className="text-sm font-bold text-gray-900 truncate mt-1">
                {titre || 'Titre de la playlist'}
              </h5>
              <p className="text-xs text-gray-500 truncate">
                {selectedSongIds.length} titre{selectedSongIds.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-13 rounded-full bg-[#FF6B6B] hover:bg-[#fa5a5a] active:scale-[0.99] text-white font-semibold text-base shadow-md shadow-rose-500/25 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Créer la playlist</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
