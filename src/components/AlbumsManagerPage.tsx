import React, { useState } from 'react';
import {
  ArrowLeft,
  Disc,
  Plus,
  Calendar,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Image as ImageIcon,
  Play,
  Upload,
  RefreshCw,
  X,
  User,
} from 'lucide-react';
import { Album, Song, Artist } from '../types';
import { api } from '../services/api';

interface AlbumsManagerPageProps {
  onBack: () => void;
  onNavigateAddAlbum: () => void;
  onNavigateToAccessManager?: () => void;
  albums: Album[];
  songs?: Song[];
  artists?: Artist[];
  onPlaySong: (song: Song) => void;
  onAlbumDeleted?: (trackingId: string) => void;
  onAlbumUpdated?: (album: Album) => void;
  onNavigateAddSongToAlbum?: (albumTrackingId: string) => void;
  showEndpoints?: boolean;
}

export const AlbumsManagerPage: React.FC<AlbumsManagerPageProps> = ({
  onBack,
  onNavigateAddAlbum,
  onNavigateToAccessManager,
  albums,
  songs = [],
  artists = [],
  onPlaySong,
  onAlbumDeleted,
  onAlbumUpdated,
  onNavigateAddSongToAlbum,
  showEndpoints = false,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Helper: Find all songs assigned to this album via albumTrackingId
  const getAlbumSongs = (alb: Album): Song[] => {
    const tid = alb.trackingId || alb.trackingIdAlbum;
    const matched = songs.filter(
      (s) =>
        s.albumTrackingId &&
        (s.albumTrackingId === tid ||
          s.albumTrackingId === alb.trackingId ||
          s.albumTrackingId === alb.trackingIdAlbum)
    );
    if (matched.length > 0) return matched;
    return alb.songs || [];
  };
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit album modal (/albums/update/{trackingId})
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editTitreAlbum, setEditTitreAlbum] = useState('');
  const [editArtisteTrackingId, setEditArtisteTrackingId] = useState('');
  const [editImageAlbum, setEditImageAlbum] = useState('');
  const [isUpdatingAlbum, setIsUpdatingAlbum] = useState(false);

  // Update album image modal (/albums/updateImage/{trackingId})
  const [imageUpdatingAlbum, setImageUpdatingAlbum] = useState<Album | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (alb: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAlbum(alb);
    setEditTitreAlbum(alb.titreAlbum);
    setEditArtisteTrackingId(alb.artisteTrackingId || '');
    setEditImageAlbum(alb.imageAlbum);
  };

  const handleSaveEditAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;

    const tid = editingAlbum.trackingId || editingAlbum.trackingIdAlbum;
    setIsUpdatingAlbum(true);
    setStatusMsg(null);

    try {
      // Calls Swagger: PUT /albums/update/{trackingId}
      // Schema: { "titreAlbum": "...", "artisteTrackingId": "...", "imageAlbum": "..." }
      const res = await api.updateAlbum(tid, {
        titreAlbum: editTitreAlbum.trim(),
        artisteTrackingId: editArtisteTrackingId.trim(),
        imageAlbum: editImageAlbum.trim(),
      });

      if (res.success && res.album) {
        setStatusMsg({ text: `Album "${res.album.titreAlbum}" mis à jour avec succès ✅`, type: 'success' });
        if (onAlbumUpdated) onAlbumUpdated(res.album);
        if (selectedAlbum?.trackingId === tid || selectedAlbum?.trackingIdAlbum === tid) {
          setSelectedAlbum(res.album);
        }
        setEditingAlbum(null);
      } else {
        setStatusMsg({ text: res.message || 'Erreur lors de la mise à jour de l\'album', type: 'error' });
      }
    } catch (err: unknown) {
      setStatusMsg({ text: err instanceof Error ? err.message : 'Erreur réseau', type: 'error' });
    } finally {
      setIsUpdatingAlbum(false);
    }
  };

  const handleOpenImageUpdate = (alb: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUpdatingAlbum(alb);
    setNewImageFile(null);
    setNewImageUrl(alb.imageAlbum);
    setImagePreview(alb.imageAlbum);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveAlbumImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUpdatingAlbum) return;

    const tid = imageUpdatingAlbum.trackingId || imageUpdatingAlbum.trackingIdAlbum;
    setIsUpdatingImage(true);
    setStatusMsg(null);

    try {
      // Calls Swagger: PUT /albums/updateImage/{trackingId}
      // Multipart form-data with parameter "image"
      const res = await api.updateAlbumImage(tid, {
        file: newImageFile || undefined,
        image: newImageUrl.trim(),
      });

      if (res.success) {
        const updatedAlb: Album = {
          ...imageUpdatingAlbum,
          imageAlbum: res.imageAlbum || imagePreview || imageUpdatingAlbum.imageAlbum,
          nomArtiste: res.nomArtiste || imageUpdatingAlbum.nomArtiste,
          titreAlbum: res.titreAlbum || imageUpdatingAlbum.titreAlbum,
        };
        setStatusMsg({ text: "Image de l'album remplacée avec succès sur MinIO ✅", type: 'success' });
        if (onAlbumUpdated) onAlbumUpdated(updatedAlb);
        if (selectedAlbum?.trackingId === tid || selectedAlbum?.trackingIdAlbum === tid) {
          setSelectedAlbum(updatedAlb);
        }
        setImageUpdatingAlbum(null);
      } else {
        setStatusMsg({ text: res.message || "Erreur lors du remplacement de l'image", type: 'error' });
      }
    } catch (err: unknown) {
      setStatusMsg({ text: err instanceof Error ? err.message : 'Erreur réseau', type: 'error' });
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleDeleteAlbum = async (alb: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetId = alb.trackingId || alb.trackingIdAlbum;
    if (!window.confirm(`Confirmez-vous la suppression de l'album "${alb.titreAlbum}" ?\n\nEndpoint Swagger: DELETE /albums/delete/${targetId}`)) {
      return;
    }

    setDeletingId(targetId);
    setStatusMsg(null);

    try {
      // Calls Swagger: DELETE /albums/delete/{trackingId}
      const res = await api.deleteAlbum(targetId);
      if (res.success) {
        setStatusMsg({ text: `Album "${alb.titreAlbum}" supprimé avec succès ✅`, type: 'success' });
        if (onAlbumDeleted) onAlbumDeleted(targetId);
        if (selectedAlbum?.trackingId === targetId || selectedAlbum?.trackingIdAlbum === targetId) {
          setSelectedAlbum(null);
        }
      } else {
        setStatusMsg({ text: res.message || 'Erreur lors de la suppression', type: 'error' });
      }
    } catch (err: unknown) {
      setStatusMsg({ text: err instanceof Error ? err.message : 'Erreur réseau', type: 'error' });
    } finally {
      setDeletingId(null);
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
            Discographies & Albums ({albums.length})
          </h2>
          {showEndpoints ? (
            <span className="text-[11px] font-mono text-[#00BFA6]">GET /albums/all</span>
          ) : (
            <span className="text-[11px] text-gray-500">Albums disponibles</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onNavigateToAccessManager && (
            <button
              type="button"
              onClick={onNavigateToAccessManager}
              className="p-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition flex items-center gap-1.5 text-xs px-2.5 font-bold shadow-xs cursor-pointer"
              title="Gérer les albums gratuits et VIP"
            >
              <span>🔒</span>
              <span className="hidden sm:inline">Accès VIP/Gratuit</span>
            </button>
          )}
          <button
            onClick={onNavigateAddAlbum}
            className="p-1.5 rounded-xl bg-[#00BFA6] text-white hover:bg-[#00a892] transition flex items-center gap-1 text-xs px-2.5 font-medium shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Créer album</span>
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

      {/* Albums Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {albums.map((alb) => {
          const currentTid = alb.trackingId || alb.trackingIdAlbum;
          const albumSongs = getAlbumSongs(alb);
          return (
            <div
              key={currentTid}
              className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-teal-200 transition space-y-3 cursor-pointer group flex flex-col justify-between"
              onClick={() => setSelectedAlbum({ ...alb, songs: albumSongs })}
            >
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0 group/img">
                    <img
                      src={alb.imageAlbum}
                      alt={alb.titreAlbum}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-xs group-hover:scale-102 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=150&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => handleOpenImageUpdate(alb, e)}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition rounded-xl text-[10px] font-semibold cursor-pointer"
                      title={showEndpoints ? "Changer l'image (/albums/updateImage)" : "Changer l'image"}
                    >
                      <ImageIcon size={14} />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-[#00BFA6] bg-teal-50 px-1.5 py-0.5 rounded">
                        {alb.genre || 'Album'}
                      </span>
                      {alb.isFree && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                          🆓 Gratuit
                        </span>
                      )}
                      {alb.isVip && (
                        <span className="text-[10px] font-bold text-red-800 bg-red-100/80 px-1.5 py-0.5 rounded">
                          🔒 VIP
                        </span>
                      )}
                      {alb.isOverridden && (
                        <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1 py-0.5 rounded">
                          ⚡ Forcé
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 truncate mt-1 group-hover:text-[#00BFA6] transition">
                      {alb.titreAlbum}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{alb.nomArtiste || 'Artiste'}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {alb.annee || 2026}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
                        {albumSongs.length} titre{albumSongs.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking ID Badges (Only in dev mode) */}
                {showEndpoints && (
                  <div className="bg-gray-50 p-2 rounded-xl text-[10px] font-mono text-gray-600 flex items-center justify-between border border-gray-100">
                    <span className="truncate pr-1">trackingId: {currentTid}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(currentTid, currentTid);
                      }}
                      className="text-gray-400 hover:text-black shrink-0 p-0.5"
                      title="Copier ID"
                    >
                      {copiedId === currentTid ? (
                        <Check size={12} className="text-emerald-600" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {onNavigateAddSongToAlbum && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateAddSongToAlbum(currentTid);
                      }}
                      className="p-1 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                      title={showEndpoints ? "Ajouter une chanson avec cet albumTrackingId (/song/create)" : "Ajouter un morceau à cet album"}
                    >
                      <Plus size={11} />
                      <span>+ Morceau</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Edit Album Info */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(alb, e)}
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition flex items-center gap-1 text-xs cursor-pointer"
                    title={showEndpoints ? "Modifier via PUT /albums/update/{trackingId}" : "Modifier l'album"}
                  >
                    <Edit2 size={13} />
                    <span className="hidden sm:inline">Éditer</span>
                  </button>

                  {/* Update Album Image */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenImageUpdate(alb, e)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition flex items-center gap-1 text-xs cursor-pointer"
                    title={showEndpoints ? "Image MinIO via PUT /albums/updateImage/{trackingId}" : "Photo"}
                  >
                    <ImageIcon size={13} />
                    <span className="hidden sm:inline">Photo</span>
                  </button>

                  {/* Delete Album */}
                  <button
                    type="button"
                    disabled={deletingId === currentTid}
                    onClick={(e) => handleDeleteAlbum(alb, e)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition flex items-center gap-1 text-xs cursor-pointer"
                    title={showEndpoints ? "Supprimer via DELETE /albums/delete/{trackingId}" : "Supprimer"}
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Album Modal (/albums/update/{trackingId}) */}
      {editingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {showEndpoints ? "Modifier l'album (/albums/update)" : "Modifier l'album"}
                </h3>
                {showEndpoints && (
                  <p className="text-[11px] text-gray-500 font-mono">
                    {editingAlbum.trackingId || editingAlbum.trackingIdAlbum}
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditingAlbum(null)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditAlbum} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Titre de l&apos;album *
                </label>
                <input
                  type="text"
                  value={editTitreAlbum}
                  onChange={(e) => setEditTitreAlbum(e.target.value)}
                  required
                  placeholder="Nom de l'album"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#00BFA6] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Artiste associé *
                </label>
                <select
                  value={editArtisteTrackingId}
                  onChange={(e) => setEditArtisteTrackingId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#00BFA6] outline-none mb-1.5"
                >
                  <option value="">Sélectionner un artiste enregistré...</option>
                  {artists.map((art) => (
                    <option key={art.trackingId} value={art.trackingId}>
                      {art.alias || `${art.firstName} ${art.lastName}`} {showEndpoints ? `(${art.trackingId.slice(0, 8)}...)` : ''}
                    </option>
                  ))}
                </select>
                {showEndpoints && (
                  <input
                    type="text"
                    value={editArtisteTrackingId}
                    onChange={(e) => setEditArtisteTrackingId(e.target.value)}
                    placeholder="UUID de l'artiste"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#00BFA6] outline-none font-mono"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Pochette de l&apos;album *
                </label>
                <input
                  type="url"
                  value={editImageAlbum}
                  onChange={(e) => setEditImageAlbum(e.target.value)}
                  required
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#00BFA6] outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAlbum}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#00BFA6] hover:bg-[#00a892] rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  {isUpdatingAlbum ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{showEndpoints ? "Enregistrer (PUT)" : "Enregistrer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Image Modal */}
      {imageUpdatingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {showEndpoints ? "Remplacer l'image MinIO (/albums/updateImage)" : "Changer la pochette de l'album"}
                </h3>
                <p className="text-[11px] text-gray-500">{imageUpdatingAlbum.titreAlbum}</p>
              </div>
              <button
                onClick={() => setImageUpdatingAlbum(null)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAlbumImage} className="space-y-4">
              {/* Preview */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <img
                  src={imagePreview || imageUpdatingAlbum.imageAlbum}
                  alt="Aperçu"
                  className="w-16 h-16 rounded-xl object-cover border"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-gray-800 truncate">Pochette actuelle</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    L&apos;image sera enregistrée et affichée dans le lecteur.
                  </p>
                </div>
              </div>

              {/* File upload input */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Sélectionner un fichier image (JPG, PNG, WebP)
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition text-center">
                  <Upload size={24} className="text-teal-600 mb-1" />
                  <span className="text-xs font-semibold text-gray-700">
                    {newImageFile ? newImageFile.name : 'Choisir un fichier image'}
                  </span>
                  {showEndpoints && (
                    <span className="text-[10px] text-gray-400 mt-0.5">Champ multipart : &quot;image&quot;</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Or URL input */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Ou URL directe de remplacement
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => {
                    setNewImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#00BFA6] outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImageUpdatingAlbum(null)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingImage}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#00BFA6] hover:bg-[#00a892] rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  {isUpdatingImage ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{showEndpoints ? "Mettre à jour MinIO (PUT)" : "Mettre à jour la photo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Album Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <img
                src={selectedAlbum.imageAlbum}
                alt={selectedAlbum.titreAlbum}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-[#00BFA6] bg-teal-50 px-1.5 py-0.5 rounded">
                  {selectedAlbum.genre} • {selectedAlbum.annee}
                </span>
                <h3 className="text-base font-bold text-gray-900 truncate mt-1">
                  {selectedAlbum.titreAlbum}
                </h3>
                <p className="text-xs text-gray-500 truncate">{selectedAlbum.nomArtiste}</p>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5 break-all">
                  trackingId: {selectedAlbum.trackingId || selectedAlbum.trackingIdAlbum}
                </p>
                {selectedAlbum.artisteTrackingId && (
                  <p className="text-[10px] font-mono text-orange-600 mt-0.5 break-all">
                    artisteTrackingId: {selectedAlbum.artisteTrackingId}
                  </p>
                )}
              </div>
            </div>

            {(() => {
              const modalSongs = getAlbumSongs(selectedAlbum);
              return (
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Morceaux de l&apos;album ({modalSongs.length})
                    </h5>
                    {onNavigateAddSongToAlbum && (
                      <button
                        type="button"
                        onClick={() => {
                          const tid = selectedAlbum.trackingId || selectedAlbum.trackingIdAlbum;
                          setSelectedAlbum(null);
                          onNavigateAddSongToAlbum(tid);
                        }}
                        className="text-[11px] text-[#00BFA6] hover:text-[#009b86] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Ajouter un son</span>
                      </button>
                    )}
                  </div>

                  {modalSongs.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                      <p>Aucun titre rattaché directement à cet album pour l&apos;instant.</p>
                      {onNavigateAddSongToAlbum && (
                        <button
                          type="button"
                          onClick={() => {
                            const tid = selectedAlbum.trackingId || selectedAlbum.trackingIdAlbum;
                            setSelectedAlbum(null);
                            onNavigateAddSongToAlbum(tid);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition shadow-xs"
                        >
                          + Ajouter le 1er morceau
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                      {modalSongs.map((song, idx) => (
                        <div
                          key={song.trackingIdSong || song.trackingId || idx}
                          className="p-2.5 rounded-xl bg-gray-50 hover:bg-teal-50/60 border border-gray-100 flex items-center justify-between text-xs transition group/sng"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-gray-400 font-mono w-4 text-center font-bold">{idx + 1}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate group-hover/sng:text-teal-900">{song.titre}</p>
                              <p className="text-[11px] text-gray-500 truncate">{song.artiste || selectedAlbum.nomArtiste}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onPlaySong(song)}
                            className="p-1.5 rounded-lg bg-white border border-gray-200 text-teal-600 hover:bg-teal-600 hover:text-white transition shadow-2xs"
                            title="Écouter ce morceau"
                          >
                            <Play size={13} fill="currentColor" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="border-t pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => handleDeleteAlbum(selectedAlbum, e)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
              >
                <Trash2 size={13} />
                <span>Supprimer</span>
              </button>
              <div className="flex items-center gap-2">
                {onNavigateAddSongToAlbum && (
                  <button
                    onClick={() => {
                      const tid = selectedAlbum.trackingId || selectedAlbum.trackingIdAlbum;
                      if (tid) {
                        setSelectedAlbum(null);
                        onNavigateAddSongToAlbum(tid);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>+ Ajouter un morceau</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="px-4 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
