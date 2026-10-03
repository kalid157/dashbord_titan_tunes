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
  LayoutGrid,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { Song, Playlist, Album, Category } from '../types';

interface SongsManagerPageProps {
  onBack: () => void;
  onNavigateAddSong: () => void;
  onNavigateToAccessManager?: () => void;
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
  onNavigateToAccessManager,
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

  // View & Pagination state (2 rows = 12 items on 6-col grid)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Exactly 2 rows of 6 cards!

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

  // Calculate 2-row pagination
  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage);

  // Auto-correct currentPage if filters shrink the list
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre]);

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
        <div className="flex items-center gap-2">
          {onNavigateToAccessManager && (
            <button
              type="button"
              onClick={onNavigateToAccessManager}
              className="p-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition flex items-center gap-1.5 text-xs px-2.5 font-bold shadow-xs cursor-pointer"
              title="Gérer les morceaux gratuits et VIP"
            >
              <span>🔒</span>
              <span className="hidden sm:inline">Accès VIP/Gratuit</span>
            </button>
          )}
          <button
            onClick={onNavigateAddSong}
            className="p-1.5 rounded-xl bg-[#FF8A00] text-white hover:bg-[#e07b00] transition flex items-center gap-1 text-xs px-2.5 font-medium shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Ajouter</span>
          </button>
        </div>
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

      {/* Display Controls & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Affichage du catalogue :
          </span>
          <div className="inline-flex p-0.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#111827] text-[#FF8A00] shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              title="Affichage en cartes horizontales (comme les statistiques)"
            >
              <LayoutGrid size={13} />
              <span>Grille (Screenshot)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#111827] text-[#FF8A00] shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              title="Affichage en liste étendue"
            >
              <ListFilter size={13} />
              <span>Liste</span>
            </button>
          </div>
        </div>

        {/* 2 lines pagination indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="hidden sm:inline">Rangement :</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md border border-orange-200/50">
            2 lignes par page ({itemsPerPage} titres)
          </span>
        </div>
      </div>

      {/* Songs View */}
      {filteredSongs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#111827] rounded-2xl border border-gray-150 dark:border-gray-800 p-6">
          <Music className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Aucune chanson trouvée</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Essayez un autre mot-clé ou ajoutez un nouveau morceau
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ======================================================== */
        /* VUE GRILLE : CARTES RANGÉES COMME LE SCREENSHOT (6 COLONNES) */
        /* ======================================================== */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {paginatedSongs.map((song) => {
              const currentPlays =
                songPlaysMap[song.trackingIdSong] !== undefined
                  ? songPlaysMap[song.trackingIdSong]
                  : song.plays || 0;

              return (
                <div
                  key={song.trackingIdSong}
                  className="bg-white dark:bg-[#111827] p-3 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-xs hover:border-orange-300 dark:hover:border-orange-500/40 hover:shadow-md transition group text-left relative flex flex-col justify-between"
                >
                  {/* Top Bar (Genre/Catégorie à gauche, icône colorée à droite comme dans le screenshot) */}
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-medium mb-2">
                    <span className="truncate max-w-[85px] text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      {song.nomCategorie || song.genre || 'Morceau'}
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-[#6B4EFF] shrink-0 group-hover:scale-110 transition-transform">
                      <Music size={12} />
                    </div>
                  </div>

                  {/* Artwork & Play button */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2 group/thumb shadow-2xs">
                    <img
                      src={song.imageAlbum}
                      alt={song.titre}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => onPlaySong(song)}
                      className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                      title="Lire ce titre"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FF8A00] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                        <Play size={18} fill="white" className="ml-0.5" />
                      </div>
                    </button>
                    {/* Duration badge */}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white/90">
                      {song.duree || '3:20'}
                    </span>
                  </div>

                  {/* Main Title & Artist (gras comme les valeurs du screenshot) */}
                  <div className="min-w-0">
                    <h4
                      className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#FF8A00] transition"
                      title={song.titre}
                    >
                      {song.titre}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {song.artiste}
                    </p>
                  </div>

                  {/* Bottom Metatag (Exactement le style coloré du bas de carte du screenshot) */}
                  <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 truncate">
                      <TrendingUp size={11} className="shrink-0 text-emerald-500" />
                      <span className="truncate">{currentPlays.toLocaleString()} écoutes</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRefreshPlays(song.trackingIdSong)}
                      className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 p-0.5 transition"
                      title="Actualiser les écoutes"
                    >
                      <RefreshCw size={10} className={loadingPlaysId === song.trackingIdSong ? 'animate-spin' : ''} />
                    </button>
                  </div>

                  {/* Quick Card Toolbar Actions */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-800/60 text-gray-400 dark:text-gray-500">
                    <button
                      type="button"
                      onClick={() => onPlaySong(song)}
                      className="p-1 hover:text-[#FF8A00] hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg transition"
                      title="Écouter"
                    >
                      <Play size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInspectPlaylists(song)}
                      className="p-1 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition"
                      title="Playlists"
                    >
                      <ListMusic size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenUpdateAudio(song)}
                      className="p-1 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"
                      title="Remplacer audio"
                    >
                      <FileAudio size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(song)}
                      className="p-1 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
                      title="Modifier métadonnées"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(song)}
                      className="p-1 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* BARRE DE PAGINATION APRÈS 2 LIGNES */}
          {/* ======================================================== */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#111827] rounded-2xl border border-gray-150 dark:border-gray-800 shadow-xs mt-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Affichage de <strong className="text-gray-900 dark:text-white">{startIndex + 1}</strong> à{' '}
                <strong className="text-gray-900 dark:text-white">
                  {Math.min(startIndex + itemsPerPage, filteredSongs.length)}
                </strong>{' '}
                sur <strong className="text-gray-900 dark:text-white">{filteredSongs.length}</strong> morceaux
                <span className="ml-1 text-[11px] text-orange-600 dark:text-orange-400 font-medium">
                  (2 lignes / page)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Précédent</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                        currentPage === pageNum
                          ? 'bg-[#FF8A00] text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Suivant</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ======================================================== */
        /* VUE LISTE ALTERNATIVE AVEC PAGINATION                    */
        /* ======================================================== */
        <div className="space-y-2">
          {paginatedSongs.map((song) => {
            const currentPlays =
              songPlaysMap[song.trackingIdSong] !== undefined
                ? songPlaysMap[song.trackingIdSong]
                : song.plays || 0;

            return (
              <div
                key={song.trackingIdSong}
                className="p-3 bg-white dark:bg-[#111827] rounded-xl border border-gray-150 dark:border-gray-800 shadow-xs hover:border-orange-200 dark:hover:border-orange-500/40 transition flex items-center gap-3 group flex-wrap sm:flex-nowrap"
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
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{song.titre}</h4>
                    {showEndpoints ? (
                      <button
                        onClick={() => handleCopy(song.trackingIdSong, song.trackingIdSong)}
                        className="text-[10px] text-gray-500 hover:text-orange-600 font-mono bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 shrink-0 flex items-center gap-1 transition cursor-pointer"
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
                      <span className="text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-0.5">
                        <Tag size={9} />
                        {song.nomCategorie}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{song.artiste}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 flex-wrap">
                    <span className="text-[#FF8A00] font-medium">{song.genre || song.nomCategorie || 'Musique'}</span>
                    <span>•</span>
                    <span>{song.duree || '3:20'}</span>
                    <span>•</span>
                    <button
                      onClick={() => handleRefreshPlays(song.trackingIdSong)}
                      className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-800 transition cursor-pointer"
                    >
                      <Headphones size={9} />
                      <span>{currentPlays} écoutes</span>
                      {loadingPlaysId === song.trackingIdSong && <RefreshCw size={8} className="animate-spin" />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
                  <button
                    onClick={() => handleInspectPlaylists(song)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition cursor-pointer"
                    title="Playlists associées"
                  >
                    <ListMusic size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenUpdateAudio(song)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition cursor-pointer"
                    title="Remplacer le fichier audio"
                  >
                    <FileAudio size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(song)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition cursor-pointer"
                    title="Modifier les détails du morceau"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(song)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                    title="Supprimer le morceau"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination for list view */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-[#111827] rounded-xl border border-gray-150 dark:border-gray-800 text-xs">
              <span className="text-gray-500">
                Page {currentPage} sur {totalPages} ({filteredSongs.length} morceaux)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
