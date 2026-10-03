import React, { useState } from 'react';
import {
  ArrowLeft,
  ListPlus,
  Globe,
  Lock,
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
  Music,
  Check,
  Search,
  RefreshCw,
  User,
  Copy,
  Folder,
  FolderOpen,
  ListMusic,
} from 'lucide-react';
import { api } from '../services/api';
import { Playlist, Song } from '../types';

interface PlaylistsManagerPageProps {
  onBack: () => void;
  onNavigateAddPlaylist: () => void;
  playlists: Playlist[];
  availableSongs: Song[];
  onPlaySong: (song: Song) => void;
  onPlaylistUpdated: (playlist: Playlist) => void;
  onPlaylistsReload: () => void;
}

export const PlaylistsManagerPage: React.FC<PlaylistsManagerPageProps> = ({
  onBack,
  onNavigateAddPlaylist,
  playlists,
  availableSongs,
  onPlaySong,
  onPlaylistUpdated,
  onPlaylistsReload,
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [addSongModalPlaylist, setAddSongModalPlaylist] = useState<Playlist | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit playlist form
  const [editTitre, setEditTitre] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Search inside add song modal
  const [songSearch, setSongSearch] = useState('');

  // Inspect other playlists containing a song (/playlist/getAllSongForPlaylist/{trackingIdSong})
  const [inspectingSong, setInspectingSong] = useState<{
    song: Song;
    playlists: Playlist[];
    loading: boolean;
  } | null>(null);

  const handleInspectSongPlaylists = async (song: Song) => {
    setInspectingSong({ song, playlists: [], loading: true });
    try {
      // Calls endpoint: GET /playlist/getAllSongForPlaylist/{trackingIdSong}
      const pls = await api.getAllPlaylistsForSong(song.trackingIdSong);
      setInspectingSong({ song, playlists: pls, loading: false });
    } catch {
      setInspectingSong({ song, playlists: [], loading: false });
    }
  };

  const distinctClients = Array.from(new Set(playlists.map((p) => p.clientTrackingId).filter(Boolean)));

  const filteredPlaylists = playlists.filter((p) => {
    if (clientFilter === 'all') return true;
    return p.clientTrackingId === clientFilter;
  });

  const handleToggleVisibility = async (p: Playlist) => {
    try {
      // Calls endpoint: /playlist/changeVisibilite/{trackingIdPlaylist}
      const res = await api.changeVisibilite(p.trackingIdPlaylist);
      if (res.success && res.playlist) {
        onPlaylistUpdated(res.playlist);
        if (selectedPlaylist?.trackingIdPlaylist === p.trackingIdPlaylist) {
          setSelectedPlaylist(res.playlist);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSongToPlaylist = async (songId: string) => {
    if (!addSongModalPlaylist) return;
    try {
      // Calls endpoint: /playlist/addSong
      const res = await api.addSongToPlaylist(addSongModalPlaylist.trackingIdPlaylist, songId);
      if (res.success && res.playlist) {
        onPlaylistUpdated(res.playlist);
        setAddSongModalPlaylist(res.playlist);
        if (selectedPlaylist?.trackingIdPlaylist === res.playlist.trackingIdPlaylist) {
          setSelectedPlaylist(res.playlist);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      // Calls endpoint: /playlist/removeSongForPlaylist/{trackingIdPlaylist}/{trackingIdSong}
      const res = await api.removeSongFromPlaylist(playlistId, songId);
      if (res.success && res.playlist) {
        onPlaylistUpdated(res.playlist);
        if (selectedPlaylist?.trackingIdPlaylist === playlistId) {
          setSelectedPlaylist(res.playlist);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (p: Playlist) => {
    setEditingPlaylist(p);
    setEditTitre(p.titre);
    setEditImage(p.imageAlbum);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylist) return;

    setIsUpdating(true);
    try {
      // Calls endpoint: /playlist/update/{trackingIdClient}/{trackingIdPlaylist}
      const res = await api.updatePlaylist(
        editingPlaylist.clientTrackingId,
        editingPlaylist.trackingIdPlaylist,
        {
          titre: editTitre.trim(),
          imageAlbum: editImage.trim(),
        }
      );
      if (res.success && res.playlist) {
        onPlaylistUpdated(res.playlist);
        if (selectedPlaylist?.trackingIdPlaylist === res.playlist.trackingIdPlaylist) {
          setSelectedPlaylist(res.playlist);
        }
        setEditingPlaylist(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

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
        <h2 className="text-base font-semibold text-gray-800">
          Gestion des Playlists ({playlists.length})
        </h2>
        <button
          onClick={onNavigateAddPlaylist}
          className="p-1.5 rounded-lg bg-[#FF6B6B] text-white hover:bg-[#fa5a5a] transition flex items-center gap-1 text-xs px-2.5 font-medium shadow-xs"
        >
          <Plus size={15} />
          <span>Nouvelle</span>
        </button>
      </div>

      {/* Filter by Client trackingId (/playlist/allForOne/:trackingIdClient) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-400 shrink-0 font-medium">Filtrer par compte :</span>
        <button
          onClick={() => setClientFilter('all')}
          className={`px-2.5 py-1 rounded-full transition shrink-0 ${
            clientFilter === 'all'
              ? 'bg-[#FF6B6B] text-white font-semibold shadow-xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Toutes (/playlist/all)
        </button>
        {distinctClients.map((c) => (
          <button
            key={c}
            onClick={() => setClientFilter(c)}
            className={`px-2.5 py-1 rounded-full transition shrink-0 font-mono text-[11px] ${
              clientFilter === c
                ? 'bg-[#FF6B6B] text-white font-semibold shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Playlists Grid / List */}
      <div className="space-y-2.5">
        {filteredPlaylists.map((pl) => (
          <div
            key={pl.trackingIdPlaylist}
            className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-rose-200 transition space-y-3"
          >
            <div className="flex items-start gap-3">
              <img
                src={pl.imageAlbum}
                alt={pl.titre}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=150&q=80';
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{pl.titre}</h4>

                  {/* Visibility Button (/playlist/changeVisibilite) */}
                  <button
                    onClick={() => handleToggleVisibility(pl)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                      pl.visibilite
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                    title="Cliquer pour basculer la visibilité (/playlist/changeVisibilite)"
                  >
                    {pl.visibilite ? <Globe size={11} /> : <Lock size={11} />}
                    <span>{pl.visibilite ? 'Publique 🌐' : 'Privée 🔒'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {pl.songs?.length || 0} morceau{(pl.songs?.length || 0) > 1 ? 'x' : ''}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <User size={11} />
                    <span className="font-mono text-[10px]">{pl.clientTrackingId}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => copyToClipboard(pl.trackingIdPlaylist)}
                    className="text-[10px] font-mono text-gray-400 hover:text-black flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100"
                    title="Copier l'UUID de la playlist"
                  >
                    <span>{pl.trackingIdPlaylist}</span>
                    {copiedId === pl.trackingIdPlaylist ? (
                      <Check size={10} className="text-emerald-600" />
                    ) : (
                      <Copy size={10} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <button
                onClick={() => setSelectedPlaylist(pl)}
                className="text-[#FF6B6B] hover:text-[#fa5a5a] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
              >
                <FolderOpen size={15} />
                <span>Ouvrir le dossier ({pl.songs?.length || 0})</span>
              </button>

              <div className="flex items-center gap-1.5">
                {/* Add song button (/playlist/addSong) */}
                <button
                  onClick={() => setAddSongModalPlaylist(pl)}
                  className="text-gray-700 hover:text-black font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                  title="Ajouter un morceau avec POST /playlist/addSong"
                >
                  <Plus size={14} className="text-[#FF6B6B]" />
                  <span>Ajouter titre</span>
                </button>

                {/* Edit metadata (/playlist/update) */}
                <button
                  onClick={() => handleOpenEdit(pl)}
                  className="text-gray-500 hover:text-black p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                  title="Modifier titre ou image (PUT /playlist/update)"
                >
                  <Edit size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail / Song list Modal (/playlist/get/:trackingId) */}
      {selectedPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col p-5 shadow-2xl space-y-3">
            <div className="flex items-start justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPlaylist.imageAlbum}
                  alt={selectedPlaylist.titre}
                  className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-gray-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B6B] bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <FolderOpen size={11} /> Dossier
                    </span>
                    <button
                      onClick={() => handleToggleVisibility(selectedPlaylist)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition flex items-center gap-1 cursor-pointer ${
                        selectedPlaylist.visibilite
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                      title="Cliquer pour changer la visibilité (PUT /playlist/changeVisibilite)"
                    >
                      {selectedPlaylist.visibilite ? <Globe size={10} /> : <Lock size={10} />}
                      <span>{selectedPlaylist.visibilite ? 'Publique 🌐' : 'Privée 🔒'}</span>
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mt-0.5">{selectedPlaylist.titre}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <span className="font-mono text-[10px] text-gray-400">
                      {selectedPlaylist.trackingIdPlaylist}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Swagger Endpoints guide in folder */}
            <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 text-[10px] font-mono text-gray-600 flex flex-wrap items-center justify-between gap-1.5 shrink-0">
              <span className="font-bold text-rose-800">Endpoints Swagger :</span>
              <span className="bg-white px-1.5 py-0.5 rounded border border-rose-200 text-emerald-700">
                POST /playlist/addSong
              </span>
              <span className="bg-white px-1.5 py-0.5 rounded border border-rose-200 text-red-700">
                DELETE /playlist/removeSongForPlaylist
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(!selectedPlaylist.songs || selectedPlaylist.songs.length === 0) ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  <Music className="mx-auto mb-2 text-gray-300" size={28} />
                  <p className="font-semibold text-gray-700">Ce dossier est vide</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Ajoutez vos chansons préférées dans ce dossier
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setAddSongModalPlaylist(selectedPlaylist);
                      }}
                      className="px-3.5 py-2 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold hover:bg-[#fa5a5a] transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Ajouter des chansons (/playlist/addSong)</span>
                    </button>
                  </div>
                </div>
              ) : (
                selectedPlaylist.songs.map((song, idx) => (
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

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onPlaySong(song)}
                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-orange-600 hover:bg-orange-50 transition cursor-pointer"
                        title="Écouter"
                      >
                        <Music size={14} />
                      </button>

                      {/* Inspect containing playlists (/playlist/getAllSongForPlaylist/{trackingIdSong}) */}
                      <button
                        onClick={() => handleInspectSongPlaylists(song)}
                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                        title="Voir toutes les playlists contenant ce titre (/playlist/getAllSongForPlaylist)"
                      >
                        <ListMusic size={14} />
                      </button>

                      {/* Remove Song from Playlist (/playlist/removeSongForPlaylist) */}
                      <button
                        onClick={() =>
                          handleRemoveSongFromPlaylist(
                            selectedPlaylist.trackingIdPlaylist,
                            song.trackingIdSong
                          )
                        }
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Retirer de la playlist (DELETE /playlist/removeSongForPlaylist)"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-3 flex justify-between items-center shrink-0">
              <button
                onClick={() => setAddSongModalPlaylist(selectedPlaylist)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-[#FF6B6B] hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus size={14} />
                <span>Ajouter un titre</span>
              </button>

              <button
                onClick={() => setSelectedPlaylist(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-900 text-white hover:bg-black text-xs font-semibold transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Song to Playlist Modal (/playlist/addSong) */}
      {addSongModalPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col p-5 shadow-2xl space-y-3">
            <div className="flex items-start justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Ajouter un morceau au dossier
                </h3>
                <p className="text-xs text-rose-600 font-semibold">{addSongModalPlaylist.titre}</p>
              </div>
              <button
                onClick={() => setAddSongModalPlaylist(null)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Swagger Payload Schema snippet */}
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-[10px] font-mono text-gray-600 shrink-0">
              <span className="font-bold text-rose-600">POST /playlist/addSong</span>
              <pre className="text-[9px] text-gray-500 mt-0.5">
{`{
  "trackingIdSong": "...",
  "trackingIdPlaylist": "${addSongModalPlaylist.trackingIdPlaylist}"
}`}
              </pre>
            </div>

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
              <input
                type="text"
                value={songSearch}
                onChange={(e) => setSongSearch(e.target.value)}
                placeholder="Rechercher un morceau dans le catalogue..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {availableSongs
                .filter(
                  (s) =>
                    s.titre.toLowerCase().includes(songSearch.toLowerCase()) ||
                    s.artiste.toLowerCase().includes(songSearch.toLowerCase())
                )
                .map((song) => {
                  const alreadyIn = addSongModalPlaylist.songs?.some(
                    (s) => s.trackingIdSong === song.trackingIdSong
                  );
                  return (
                    <div
                      key={song.trackingIdSong}
                      className="p-2.5 rounded-xl border border-gray-100 flex items-center justify-between gap-3 text-xs hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
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

                      {alreadyIn ? (
                        <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                          <Check size={12} /> Ajouté
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddSongToPlaylist(song.trackingIdSong)}
                          className="px-2.5 py-1 rounded-lg bg-[#FF6B6B] hover:bg-[#fa5a5a] text-white font-semibold text-[11px] shrink-0 transition"
                        >
                          + Ajouter
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="border-t pt-3 flex justify-end shrink-0">
              <button
                onClick={() => setAddSongModalPlaylist(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Playlist Metadata Modal (/playlist/update) */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Modifier la playlist (/playlist/update)
                </h3>
                <p className="text-[11px] text-gray-400 font-mono">
                  {editingPlaylist.trackingIdPlaylist}
                </p>
              </div>
              <button
                onClick={() => setEditingPlaylist(null)}
                className="text-gray-400 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Titre</label>
                <input
                  type="text"
                  value={editTitre}
                  onChange={(e) => setEditTitre(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF6B6B] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  URL Couverture
                </label>
                <input
                  type="url"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#FF6B6B] outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#FF6B6B] hover:bg-[#fa5a5a] rounded-xl flex items-center justify-center gap-1"
                >
                  {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Song Playlists Modal (/playlist/getAllSongForPlaylist/{trackingIdSong}) */}
      {inspectingSong && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Playlists associées à ce titre
                </h3>
                <p className="text-xs text-rose-600 font-semibold truncate mt-0.5">
                  {inspectingSong.song.titre}
                </p>
              </div>
              <button
                onClick={() => setInspectingSong(null)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-2 rounded-xl bg-purple-50 text-[10px] font-mono text-purple-800 border border-purple-200">
              GET /playlist/getAllSongForPlaylist/{inspectingSong.song.trackingIdSong}
            </div>

            {inspectingSong.loading ? (
              <div className="text-center py-6 text-xs text-gray-500">
                <RefreshCw size={20} className="animate-spin mx-auto text-purple-600 mb-2" />
                Recherche des playlists contenant ce titre...
              </div>
            ) : inspectingSong.playlists.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500">
                Ce morceau ne figure dans aucune autre playlist.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {inspectingSong.playlists.map((pl) => (
                  <div
                    key={pl.trackingIdPlaylist}
                    className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={pl.imageAlbum}
                        alt={pl.titre}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{pl.titre}</p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">{pl.trackingIdPlaylist}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 bg-purple-100 text-purple-800">
                      {pl.visibilite ? 'Publique 🌐' : 'Privée 🔒'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setInspectingSong(null)}
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
