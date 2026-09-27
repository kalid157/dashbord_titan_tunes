import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Music,
  Play,
  Trash2,
  Edit2,
  FileAudio,
  ListMusic,
  Plus,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  CheckCircle2,
  Upload,
  Copy,
  Tag,
  Headphones,
  Disc,
  Shuffle,
  Repeat,
} from 'lucide-react';
import { api } from '../services/api';
import { Song, Playlist, Album, Category } from '../types';

interface SongsManagerPageProps {
  onBack: () => void;
  onNavigateAddSong: () => void;
  songs: Song[];
  albums?: Album[];
  categories?: Category[];
  onPlaySong: (song: Song) => void;
  onSongDeleted: (trackingIdSong: string) => void;
  onSongUpdated: (song: Song) => void;
  showEndpoints?: boolean;
}

export const SongsManagerPage: React.FC<SongsManagerPageProps> = ({
  onBack,
  onNavigateAddSong,
  songs,
  albums = [],
  categories = [],
  onPlaySong,
  onSongDeleted,
  onSongUpdated,
  showEndpoints = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Modals state
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [audioUpdatingSong, setAudioUpdatingSong] = useState<Song | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [songPlaylistsModal, setSongPlaylistsModal] = useState<{
    song: Song;
    playlists: Playlist[];
    loading: boolean;
  } | null>(null);

  // Edit form state (Swagger: PUT /song/update/{trackingIdSong})
  // Schema: { "titre": "string", "audio": "string", "albumTrackingId": "uuid", "categorieTrackingId": "uuid" }
  const [editTitre, setEditTitre] = useState('');
  const [editAudio, setEditAudio] = useState('');
  const [editAlbumTrackingId, setEditAlbumTrackingId] = useState('');
  const [editCategorieTrackingId, setEditCategorieTrackingId] = useState('');
  const [editArtiste, setEditArtiste] = useState('');
  const [editImageAlbum, setEditImageAlbum] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Audio update form state (Swagger: PUT /song/updateAudio/{trackingIdSong})
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [isUpdatingAudio, setIsUpdatingAudio] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [songPlaysMap, setSongPlaysMap] = useState<Record<string, number>>({});
  const [loadingPlaysId, setLoadingPlaysId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSongs = songs.filter((s) => {
    const matchesSearch =
      s.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artiste.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.trackingIdSong.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || s.genre === selectedGenre || s.nomCategorie === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = Array.from(new Set(songs.map((s) => s.genre || s.nomCategorie).filter(Boolean)));

  const handleOpenEdit = (s: Song) => {
    setEditingSong(s);
    setEditTitre(s.titre);
    setEditAudio(s.audio);
    setEditAlbumTrackingId(s.albumTrackingId || s.albumId || '');
    setEditCategorieTrackingId(s.categorieTrackingId || '');
    setEditArtiste(s.artiste);
    setEditImageAlbum(s.imageAlbum || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    setIsUpdating(true);
    setStatusMsg(null);
    try {
      // Calls Swagger: PUT /song/update/{trackingIdSong}
      // Schema: { "titre": "string", "audio": "string", "albumTrackingId": "uuid", "categorieTrackingId": "uuid" }
      const res = await api.updateSong(editingSong.trackingIdSong, {
        titre: editTitre.trim(),
        audio: editAudio.trim(),
        albumTrackingId: editAlbumTrackingId.trim(),
        categorieTrackingId: editCategorieTrackingId.trim(),
        artiste: editArtiste.trim(),
        imageAlbum: editImageAlbum.trim(),
      });

      if (res.success && res.song) {
        onSongUpdated(res.song);
        setStatusMsg({ text: `Chanson "${res.song.titre}" mise à jour avec succès ✅`, type: 'success' });
        setEditingSong(null);
      } else {
        setStatusMsg({ text: res.message || 'Erreur lors de la mise à jour de la chanson', type: 'error' });
      }
    } catch (err: unknown) {
      setStatusMsg({ text: err instanceof Error ? err.message : 'Erreur réseau', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenUpdateAudio = (s: Song) => {
    setAudioUpdatingSong(s);
    setNewAudioUrl(s.audio);
    setNewAudioFile(null);
  };

  const handleSaveAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUpdatingSong) return;

    setIsUpdatingAudio(true);
    setStatusMsg(null);
    try {
      // Calls Swagger: PUT /song/updateAudio/{trackingIdSong}
      // Multipart form-data with parameter "audio"
      const res = await api.updateAudio(audioUpdatingSong.trackingIdSong, {
        file: newAudioFile || undefined,
        audio: newAudioUrl.trim(),
      });

      if (res.success && res.song) {
        onSongUpdated(res.song);
        setStatusMsg({ text: `Fichier audio remplacé avec succès sur MinIO pour "${res.song.titre}" ✅`, type: 'success' });
        setAudioUpdatingSong(null);
      } else {
        setStatusMsg({ text: res.message || 'Erreur lors du remplacement de l\'audio', type: 'error' });
      }
    } catch (err: unknown) {
      setStatusMsg({ text: err instanceof Error ? err.message : 'Erreur réseau', type: 'error' });
    } finally {
      setIsUpdatingAudio(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setStatusMsg(null);
    try {
      // Calls Swagger: DELETE /song/delete/{trackingIdSong}
      const res = await api.deleteSong(deleteTarget.trackingIdSong);
      if (res.success) {
        onSongDeleted(deleteTarget.trackingIdSong);
        setStatusMsg({ text: `Chanson "${deleteTarget.titre}" supprimée avec succès ✅`, type: 'success' });
        setDeleteTarget(null);
      } else {
        setStatusMsg({ text: res.message || 'Erreur lors de la suppression', type: 'error' });
      }
    } catch (err: unknown) {
      setStatusMsg({ text: err instanceof Error ? err.message : 'Erreur réseau', type: 'error' });
    }
  };

  const handleRefreshPlays = async (trackingIdSong: string) => {
    setLoadingPlaysId(trackingIdSong);
    try {
      // Calls Swagger: GET /stats/nbrTotalEcoute/{trackingIdSong}
      const count = await api.getSongPlays(trackingIdSong);
      setSongPlaysMap((prev) => ({ ...prev, [trackingIdSong]: count }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlaysId(null);
    }
  };

  const handleInspectPlaylists = async (s: Song) => {
    setSongPlaylistsModal({ song: s, playlists: [], loading: true });
    try {
      const pls = await api.getAllPlaylistsForSong(s.trackingIdSong);
      setSongPlaylistsModal({ song: s, playlists: pls, loading: false });
    } catch {
      setSongPlaylistsModal({ song: s, playlists: [], loading: false });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black font-medium text-sm transition"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
        <div className="text-center">
          <h2 className="text-base font-semibold text-gray-800">
            Catalogue des morceaux ({songs.length})
          </h2>
          {showEndpoints ? (
            <span className="text-[11px] font-mono text-orange-600">GET /song/getAll</span>
          ) : (
            <span className="text-[11px] text-gray-500">Titres synchronisés</span>
          )}
        </div>
        <button
          onClick={onNavigateAddSong}
          className="p-1.5 rounded-lg bg-[#FF8A00] text-white hover:bg-[#e07b00] transition flex items-center gap-1 text-xs px-2.5 font-medium shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Ajouter</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={showEndpoints ? "Rechercher titre, artiste, UUID trackingIdSong..." : "Rechercher un titre ou un artiste..."}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 text-xs outline-none focus:border-[#FF8A00]"
          />
        </div>
        {genres.length > 0 && (
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs outline-none focus:border-[#FF8A00]"
          >
            <option value="all">Tous les genres ({songs.length})</option>
            {genres.map((g) => (
              <option key={String(g)} value={String(g)}>
                {String(g)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Quick Playback Bar (Tout écouter, Lecture aléatoire) */}
      {filteredSongs.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gradient-to-r from-orange-50/80 to-amber-50/80 rounded-2xl border border-orange-200/60 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPlaySong(filteredSongs[0])}
              className="px-3 py-1.5 rounded-xl bg-[#FF8A00] hover:bg-[#e07b00] text-white font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Lire la liste complète avec enchaînement automatique"
            >
              <Play size={14} fill="white" />
              <span>Tout écouter</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const rand = filteredSongs[Math.floor(Math.random() * filteredSongs.length)];
                onPlaySong(rand);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-100 text-[#FF8A00] border border-orange-200 font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Lancer la lecture en mode aléatoire"
            >
              <Shuffle size={13} />
              <span>Lecture aléatoire</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-2 pr-1 font-medium">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Enchaînement automatique
            </span>
            <span>&bull;</span>
            <span>Boucle & Aléatoire dans le lecteur</span>
          </div>
        </div>
      )}

      {/* Songs list */}
      <div className="space-y-2">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
            <Music className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-sm font-semibold text-gray-700">Aucune chanson trouvée</p>
            <p className="text-xs text-gray-400 mt-1">
              Essayez un autre mot-clé ou ajoutez un nouveau morceau
            </p>
          </div>
        ) : (
          filteredSongs.map((song) => {
            const currentPlays = songPlaysMap[song.trackingIdSong] !== undefined
              ? songPlaysMap[song.trackingIdSong]
              : song.plays || 0;

            return (
              <div
                key={song.trackingIdSong}
                className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-orange-200 transition flex items-center gap-3 group flex-wrap sm:flex-nowrap"
              >
                {/* Play / Artwork */}
                <div className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden group/img">
                  <img
                    src={song.imageAlbum}
                    alt={song.titre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80';
                    }}
                  />
                  <button
                    onClick={() => onPlaySong(song)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 group-hover/img:opacity-100 text-white transition cursor-pointer"
                    title="Écouter"
                  >
                    <Play size={18} fill="white" />
                  </button>
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{song.titre}</h4>
                    {showEndpoints ? (
                      <button
                        onClick={() => handleCopy(song.trackingIdSong, song.trackingIdSong)}
                        className="text-[10px] text-gray-500 hover:text-orange-600 font-mono bg-gray-50 hover:bg-orange-50 px-1.5 py-0.5 rounded border border-gray-200 shrink-0 flex items-center gap-1 transition cursor-pointer"
                        title="Copier le trackingIdSong"
                      >
                        <span>{song.trackingIdSong}</span>
                        {copiedId === song.trackingIdSong ? (
                          <Check size={10} className="text-emerald-600" />
                        ) : (
                          <Copy size={10} />
                        )}
                      </button>
                    ) : null}
                    {song.nomCategorie && (
                      <span className="text-[10px] font-medium bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                        <Tag size={9} />
                        {song.nomCategorie}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{song.artiste}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 flex-wrap">
                    <span className="text-[#FF8A00] font-medium">{song.genre || song.nomCategorie || 'Musique'}</span>
                    <span>•</span>
                    <span>{song.duree || '3:20'}</span>
                    {showEndpoints && song.albumTrackingId && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-teal-600 truncate max-w-[130px]" title={`albumTrackingId: ${song.albumTrackingId}`}>
                          Alb: {song.albumTrackingId}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <button
                      onClick={() => handleRefreshPlays(song.trackingIdSong)}
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 transition cursor-pointer"
                      title={showEndpoints ? `Actualiser /stats/nbrTotalEcoute/${song.trackingIdSong}` : "Nombre d'écoutes"}
                    >
                      <Headphones size={9} />
                      <span>{currentPlays} écoutes</span>
                      {loadingPlaysId === song.trackingIdSong && <RefreshCw size={8} className="animate-spin" />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
                  {/* Find containing playlists */}
                  <button
                    onClick={() => handleInspectPlaylists(song)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                    title={showEndpoints ? "Playlists contenant ce titre (/playlist/getAllSongForPlaylist)" : "Playlists associées"}
                  >
                    <ListMusic size={16} />
                  </button>

                  {/* Update audio file / URL */}
                  <button
                    onClick={() => handleOpenUpdateAudio(song)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                    title={showEndpoints ? "Remplacer l'audio (PUT /song/updateAudio/{trackingIdSong})" : "Remplacer le fichier audio"}
                  >
                    <FileAudio size={16} />
                  </button>

                  {/* Edit metadata */}
                  <button
                    onClick={() => handleOpenEdit(song)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                    title={showEndpoints ? "Modifier (PUT /song/update/{trackingIdSong})" : "Modifier les détails du morceau"}
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* Delete song */}
                  <button
                    onClick={() => setDeleteTarget(song)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title={showEndpoints ? "Supprimer (DELETE /song/delete/{trackingIdSong})" : "Supprimer le morceau"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Metadata Modal */}
      {editingSong && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {showEndpoints ? "Modifier la chanson (/song/update)" : "Modifier le morceau"}
                </h3>
                {showEndpoints && (
                  <p className="text-[11px] text-gray-400 font-mono">
                    {editingSong.trackingIdSong}
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditingSong(null)}
                className="text-gray-400 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Titre du morceau *
                </label>
                <input
                  type="text"
                  value={editTitre}
                  onChange={(e) => setEditTitre(e.target.value)}
                  required
                  placeholder="Ex: Bad Boy"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Lien du fichier Audio *
                </label>
                <input
                  type="text"
                  value={editAudio}
                  onChange={(e) => setEditAudio(e.target.value)}
                  required
                  placeholder="https://...mp3"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Album rattaché
                </label>
                <select
                  value={editAlbumTrackingId}
                  onChange={(e) => setEditAlbumTrackingId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none mb-1.5"
                >
                  <option value="">Sélectionner un album...</option>
                  {albums.map((alb) => {
                    const tid = alb.trackingId || alb.trackingIdAlbum;
                    return (
                      <option key={tid} value={tid}>
                        {alb.titreAlbum} {showEndpoints ? `(${tid.slice(0, 8)}...)` : ''}
                      </option>
                    );
                  })}
                </select>
                {showEndpoints && (
                  <input
                    type="text"
                    value={editAlbumTrackingId}
                    onChange={(e) => setEditAlbumTrackingId(e.target.value)}
                    placeholder="UUID albumTrackingId"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none font-mono"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Catégorie / Genre
                </label>
                <select
                  value={editCategorieTrackingId}
                  onChange={(e) => setEditCategorieTrackingId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none mb-1.5"
                >
                  <option value="">Sélectionner une catégorie...</option>
                  {categories.map((c) => (
                    <option key={c.trackingId} value={c.trackingId}>
                      {c.nomCategorie} {showEndpoints ? `(${c.trackingId.slice(0, 8)}...)` : ''}
                    </option>
                  ))}
                </select>
                {showEndpoints && (
                  <input
                    type="text"
                    value={editCategorieTrackingId}
                    onChange={(e) => setEditCategorieTrackingId(e.target.value)}
                    placeholder="UUID categorieTrackingId"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none font-mono"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Artiste</label>
                <input
                  type="text"
                  value={editArtiste}
                  onChange={(e) => setEditArtiste(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Image de la pochette
                </label>
                <input
                  type="url"
                  value={editImageAlbum}
                  onChange={(e) => setEditImageAlbum(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSong(null)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#FF8A00] hover:bg-[#e07b00] rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{showEndpoints ? "Enregistrer (PUT)" : "Enregistrer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Audio Modal */}
      {audioUpdatingSong && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {showEndpoints ? "Remplacer l'audio (/song/updateAudio)" : "Remplacer le fichier audio"}
                </h3>
                <p className="text-[11px] text-gray-500">{audioUpdatingSong.titre}</p>
              </div>
              <button
                onClick={() => setAudioUpdatingSong(null)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAudio} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs text-blue-900">
                <p className="font-semibold">Remplacement direct du fichier musical</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Le nouveau fichier audio sera enregistré et immédiatement disponible à l&apos;écoute.
                </p>
              </div>

              {/* File upload input */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Nouveau fichier audio (MP3, WAV, AAC, OGG)
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition text-center">
                  <Upload size={24} className="text-blue-600 mb-1" />
                  <span className="text-xs font-semibold text-gray-700">
                    {newAudioFile ? newAudioFile.name : 'Choisir un fichier audio'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Champ multipart : &quot;audio&quot;</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewAudioFile(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Or direct URL */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Ou URL audio de remplacement
                </label>
                <input
                  type="url"
                  value={newAudioUrl}
                  onChange={(e) => setNewAudioUrl(e.target.value)}
                  placeholder="https://...mp3"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAudioUpdatingSong(null)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAudio}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-1 shadow-xs"
                >
                  {isUpdatingAudio ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Remplacer sur MinIO (PUT)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (DELETE /song/delete/{trackingIdSong}) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Supprimer cette chanson ?
              </h3>
              <p className="text-xs text-gray-500">
                Confirmez la suppression de <strong>&quot;{deleteTarget.titre}&quot;</strong>.
              </p>
              <div className="p-2 bg-gray-50 rounded-xl font-mono text-[10px] text-gray-600 text-left border">
                <p className="font-bold text-gray-700">Endpoint Swagger :</p>
                <p className="break-all text-red-700">DELETE /song/delete/{deleteTarget.trackingIdSong}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Confirmer suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Containing Playlists Modal */}
      {songPlaylistsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Playlists associées</h3>
                <p className="text-xs text-gray-500 truncate">{songPlaylistsModal.song.titre}</p>
              </div>
              <button
                onClick={() => setSongPlaylistsModal(null)}
                className="text-gray-400 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            {songPlaylistsModal.loading ? (
              <div className="text-center py-6 text-xs text-gray-500">
                <RefreshCw size={20} className="animate-spin mx-auto text-purple-600 mb-2" />
                Chargement des playlists...
              </div>
            ) : songPlaylistsModal.playlists.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500">
                Cette chanson n&apos;est actuellement dans aucune playlist.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {songPlaylistsModal.playlists.map((pl) => (
                  <div
                    key={pl.trackingIdPlaylist}
                    className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{pl.titre}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{pl.trackingIdPlaylist}</p>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                      {pl.visibilite ? 'Publique 🌐' : 'Privée 🔒'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setSongPlaylistsModal(null)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 rounded-xl transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
