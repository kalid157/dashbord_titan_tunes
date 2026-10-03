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
  Search,
  Plus,
  FolderPlus,
  FolderOpen,
  Trash2,
  ExternalLink,
  ChevronRight,
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

  // Step state: null = step 1 (creation), Playlist = step 2 (dossier créé, ajout de songs)
  const [createdPlaylist, setCreatedPlaylist] = useState<Playlist | null>(null);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [addingSongId, setAddingSongId] = useState<string | null>(null);
  const [removingSongId, setRemovingSongId] = useState<string | null>(null);

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
    setErrorMsg(null);
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setErrorMsg('Veuillez entrer le nom de la playlist');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Calls endpoint: POST /playlist/create/{trackingIdClient}
      const result = await api.createPlaylist(clientTrackingId.trim() || 'client_admin_root', {
        titre: titre.trim(),
        imageAlbum: (image || samplePlaylistCovers[0].url).trim(),
        visibilite: isPublic,
        songIds: selectedSongIds,
      });

      if (result.success && result.playlist) {
        setSuccessMsg(`Dossier playlist "${result.playlist.titre}" créé avec succès ✅`);
        onPlaylistAdded(result.playlist);
        // Switch to Step 2: In the created folder, add songs directly!
        setCreatedPlaylist(result.playlist);
      } else {
        setErrorMsg(result.message || 'Erreur lors de la création de la playlist');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a song to the created folder (/playlist/addSong)
  const handleAddSongToCreatedFolder = async (song: Song) => {
    if (!createdPlaylist) return;
    setAddingSongId(song.trackingIdSong);
    setErrorMsg(null);

    try {
      // Calls endpoint: POST /playlist/addSong
      // Payload: { trackingIdSong: uuid, trackingIdPlaylist: uuid }
      const res = await api.addSongToPlaylist(
        createdPlaylist.trackingIdPlaylist,
        song.trackingIdSong
      );

      if (res.success && res.playlist) {
        setCreatedPlaylist(res.playlist);
        onPlaylistAdded(res.playlist);
        setSuccessMsg(`Morceau "${song.titre}" ajouté au dossier ✅`);
        setTimeout(() => setSuccessMsg(null), 2500);
      } else {
        setErrorMsg(res.message || 'Erreur lors de l\'ajout du morceau');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setAddingSongId(null);
    }
  };

  // Remove a song from the created folder (/playlist/removeSongForPlaylist/{trackingIdPlaylist}/{trackingIdSong})
  const handleRemoveSongFromCreatedFolder = async (songId: string) => {
    if (!createdPlaylist) return;
    setRemovingSongId(songId);
    setErrorMsg(null);

    try {
      const res = await api.removeSongFromPlaylist(
        createdPlaylist.trackingIdPlaylist,
        songId
      );

      if (res.success && res.playlist) {
        setCreatedPlaylist(res.playlist);
        onPlaylistAdded(res.playlist);
        setSuccessMsg('Morceau retiré du dossier');
        setTimeout(() => setSuccessMsg(null), 2000);
      } else {
        setErrorMsg(res.message || 'Erreur lors du retrait du morceau');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setRemovingSongId(null);
    }
  };

  // Toggle visibility (/playlist/changeVisibilite/{trackingIdPlaylist})
  const handleToggleVisibility = async () => {
    if (!createdPlaylist) return;
    try {
      const res = await api.changeVisibilite(createdPlaylist.trackingIdPlaylist);
      if (res.success && res.playlist) {
        setCreatedPlaylist(res.playlist);
        onPlaylistAdded(res.playlist);
      }
    } catch (err) {
      console.error(err);
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

      {/* ======================================================== */}
      {/* VUE 2 : DOSSIER CRÉÉ -> AJOUT DE MORCEAUX EN DIRECT       */}
      {/* ======================================================== */}
      {createdPlaylist ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Dossier Header Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-pink-50 to-orange-50/30 border border-rose-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={createdPlaylist.imageAlbum}
                  alt={createdPlaylist.titre}
                  className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-white shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=150&q=80';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider">
                      <FolderOpen size={11} /> Dossier Playlist
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleVisibility}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                        createdPlaylist.visibilite
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                      title="Changer visibilité (PUT /playlist/changeVisibilite)"
                    >
                      {createdPlaylist.visibilite ? <Globe size={10} /> : <Lock size={10} />}
                      <span>{createdPlaylist.visibilite ? 'Publique 🌐' : 'Privée 🔒'}</span>
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {createdPlaylist.titre}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-mono text-[11px]">
                    <span className="text-gray-400">UUID:</span>
                    <span className="font-semibold text-rose-700">{createdPlaylist.trackingIdPlaylist}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedPlaylist(null);
                    setTitre('');
                    setImage('');
                    setSelectedSongIds([]);
                  }}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold transition cursor-pointer"
                >
                  + Créer une autre
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#FF6B6B] hover:bg-[#fa5a5a] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Terminer & Voir mes playlists</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Swagger Endpoints Ribbon for this folder */}
            <div className="mt-3 pt-3 border-t border-rose-200/60 flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-mono">
              <span className="font-bold text-rose-800">Endpoints en action :</span>
              <span className="bg-white/80 px-2 py-0.5 rounded border border-rose-200 text-emerald-700">
                POST /playlist/addSong
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded border border-rose-200 text-red-700">
                DELETE /playlist/removeSongForPlaylist
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded border border-rose-200 text-purple-700">
                PUT /playlist/changeVisibilite
              </span>
            </div>
          </div>

          {/* Section: Chansons contenues dans le dossier */}
          <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music size={16} className="text-[#FF6B6B]" />
                <h4 className="text-sm font-bold text-gray-900">
                  Morceaux dans ce dossier ({createdPlaylist.songs?.length || 0})
                </h4>
              </div>
              <span className="text-xs text-gray-400">
                Contenu synchronisé
              </span>
            </div>

            {(!createdPlaylist.songs || createdPlaylist.songs.length === 0) ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
                <Music className="mx-auto text-gray-300 mb-1" size={24} />
                <p className="text-xs font-semibold text-gray-700">Ce dossier est vide</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Sélectionnez des morceaux ci-dessous pour les ajouter avec <code>/playlist/addSong</code>
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {createdPlaylist.songs.map((song, idx) => (
                  <div
                    key={`${song.trackingIdSong}-${idx}`}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-between gap-3 text-xs transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-gray-400 font-mono w-4 text-center">{idx + 1}</span>
                      <img
                        src={song.imageAlbum}
                        alt={song.titre}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{song.titre}</p>
                        <p className="text-[11px] text-gray-500 truncate">{song.artiste}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={removingSongId === song.trackingIdSong}
                      onClick={() => handleRemoveSongFromCreatedFolder(song.trackingIdSong)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Retirer de la playlist (DELETE /playlist/removeSongForPlaylist)"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Ajouter des morceaux depuis le catalogue */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Plus size={16} className="text-[#FF6B6B]" />
                  <span>Ajouter des chansons au dossier</span>
                </h4>
                <p className="text-[11px] text-gray-500">
                  Cliquez sur &quot;+ Ajouter&quot; pour envoyer <code>POST /playlist/addSong</code>
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                <input
                  type="text"
                  value={songSearchQuery}
                  onChange={(e) => setSongSearchQuery(e.target.value)}
                  placeholder="Rechercher un titre, un artiste..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-xs outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {availableSongs
                .filter(
                  (s) =>
                    s.titre.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
                    s.artiste.toLowerCase().includes(songSearchQuery.toLowerCase())
                )
                .map((s) => {
                  const isInFolder = createdPlaylist.songs?.some(
                    (item) => item.trackingIdSong === s.trackingIdSong
                  );
                  const isAdding = addingSongId === s.trackingIdSong;

                  return (
                    <div
                      key={s.trackingIdSong}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                        isInFolder
                          ? 'bg-emerald-50/60 border-emerald-200/80 text-gray-900'
                          : 'bg-white hover:bg-gray-50 border-gray-150 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={s.imageAlbum}
                          alt={s.titre}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{s.titre}</p>
                          <p className="text-[11px] text-gray-500 truncate">{s.artiste}</p>
                        </div>
                      </div>

                      {isInFolder ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          <Check size={12} strokeWidth={3} />
                          <span>Dans le dossier</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isAdding}
                          onClick={() => handleAddSongToCreatedFolder(s)}
                          className="px-3 py-1.5 rounded-xl bg-[#FF6B6B] hover:bg-[#fa5a5a] text-white text-xs font-semibold transition flex items-center gap-1 shadow-2xs disabled:opacity-50 cursor-pointer"
                        >
                          {isAdding ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Plus size={14} />
                          )}
                          <span>Ajouter</span>
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* VUE 1 : FORMULAIRE DE CRÉATION DE PLAYLIST (DOSSIER)      */
        /* ======================================================== */
        <form onSubmit={handleCreatePlaylist} className="space-y-4">
          {/* Field: Titre Playlist */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-800 block">Titre de la playlist</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FF6B6B]">
                <FolderPlus size={19} />
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

          {/* Client Tracking ID (/playlist/create/{trackingIdClient}) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-gray-800">
                Tracking ID Client (Propriétaire)
              </label>
              <span className="text-[11px] text-gray-400 font-mono">/playlist/create/{'{trackingIdClient}'}</span>
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
                    Dossier Playlist
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
                  Vous ajouterez des morceaux directement dans le dossier créé à l&apos;étape suivante
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
                <>
                  <FolderPlus size={18} />
                  <span>Créer la playlist &amp; Ouvrir le dossier</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
