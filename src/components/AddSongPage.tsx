import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Music,
  Link as LinkIcon,
  Play,
  CheckCircle2,
  AlertCircle,
  Tag,
  Disc,
  Plus,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { Song, Album, Category, BackendConfig } from '../types';

interface AddSongPageProps {
  onBack: () => void;
  onSongAdded: (song: Song) => void;
  onPlaySong?: (song: Song) => void;
  albums: Album[];
  categories: Category[];
  initialAlbumTrackingId?: string;
  initialCategorieTrackingId?: string;
  onNavigateToAddAlbum?: () => void;
  onNavigateToCategories?: () => void;
  onRefreshCategories?: () => void;
  backendConfig?: BackendConfig;
  showEndpoints?: boolean;
}

export const AddSongPage: React.FC<AddSongPageProps> = ({
  onBack,
  onSongAdded,
  onPlaySong,
  albums,
  categories,
  initialAlbumTrackingId,
  initialCategorieTrackingId,
  onNavigateToAddAlbum,
  onNavigateToCategories,
  onRefreshCategories,
  showEndpoints = false,
}) => {
  const [titre, setTitre] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [albumTrackingId, setAlbumTrackingId] = useState(
    initialAlbumTrackingId || (albums.length > 0 ? (albums[0].trackingId || albums[0].trackingIdAlbum) : '')
  );
  const [categorieTrackingId, setCategorieTrackingId] = useState(
    initialCategorieTrackingId || (categories.length > 0 ? categories[0].trackingId : '')
  );

  const [isManualAlbumUuid, setIsManualAlbumUuid] = useState(false);
  const [isManualCategoryUuid, setIsManualCategoryUuid] = useState(false);

  // Inline Quick Create Category Modal
  const [isQuickCategoryModalOpen, setIsQuickCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<{
    trackingId: string;
    titre: string;
    audio: string;
    artiste: string;
    origin?: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState(false);

  // Sync initial props
  useEffect(() => {
    if (initialAlbumTrackingId) {
      setAlbumTrackingId(initialAlbumTrackingId);
    } else if (albums.length > 0 && !albumTrackingId) {
      setAlbumTrackingId(albums[0].trackingId || albums[0].trackingIdAlbum);
    }
  }, [initialAlbumTrackingId, albums]);

  useEffect(() => {
    if (initialCategorieTrackingId) {
      setCategorieTrackingId(initialCategorieTrackingId);
    } else if (categories.length > 0 && !categorieTrackingId) {
      setCategorieTrackingId(categories[0].trackingId);
    }
  }, [initialCategorieTrackingId, categories]);

  // Selected album details for preview
  const selectedAlbum = albums.find(
    (a) =>
      (a.trackingId && a.trackingId === albumTrackingId) ||
      (a.trackingIdAlbum && a.trackingIdAlbum === albumTrackingId)
  );

  // Selected category details for preview
  const selectedCategory = categories.find((c) => c.trackingId === categorieTrackingId);

  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const res = await api.createCategory({ nomCategorie: newCatName.trim() });
      if (res.success && res.trackingId) {
        setCategorieTrackingId(res.trackingId);
        setIsManualCategoryUuid(false);
        setNewCatName('');
        setIsQuickCategoryModalOpen(false);
        if (onRefreshCategories) onRefreshCategories();
      } else {
        alert(res.message || 'Erreur lors de la création de la catégorie');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setErrorMsg('Veuillez entrer le titre de la chanson');
      return;
    }
    if (!audioUrl.trim()) {
      setErrorMsg("Veuillez entrer l'URL du fichier audio");
      return;
    }
    if (!albumTrackingId.trim()) {
      setErrorMsg('Veuillez sélectionner un album de rattachement');
      return;
    }
    if (!categorieTrackingId.trim()) {
      setErrorMsg('Veuillez sélectionner une catégorie musicale');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessResponse(null);

    try {
      const result = await api.createSong({
        titre: titre.trim(),
        audio: audioUrl.trim(),
        albumTrackingId: albumTrackingId.trim(),
        categorieTrackingId: categorieTrackingId.trim(),
        artiste: selectedAlbum?.nomArtiste,
        imageAlbum: selectedAlbum?.imageAlbum,
      });

      if (result.success) {
        const generatedTrackingId = result.trackingId || (result.song?.trackingIdSong || 'sng_new');
        const generatedArtiste = result.artiste || selectedAlbum?.nomArtiste || 'Artiste';

        setSuccessResponse({
          trackingId: generatedTrackingId,
          titre: result.titre || titre.trim(),
          audio: result.audio || audioUrl.trim(),
          artiste: generatedArtiste,
          origin: result.origin,
        });

        const createdSongObj: Song = result.song || {
          trackingIdSong: generatedTrackingId,
          trackingId: generatedTrackingId,
          titre: result.titre || titre.trim(),
          artiste: generatedArtiste,
          audio: result.audio || audioUrl.trim(),
          albumTrackingId: albumTrackingId.trim(),
          categorieTrackingId: categorieTrackingId.trim(),
          nomCategorie: selectedCategory?.nomCategorie,
          imageAlbum: selectedAlbum?.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
          genre: selectedCategory?.nomCategorie || 'Afrobeat',
          plays: 0,
        };

        onSongAdded(createdSongObj);
      } else {
        setErrorMsg(result.message || "Une erreur est survenue lors de l'ajout.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur de communication avec le serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const currentPayloadPreview = {
    titre: titre || 'Titre du morceau',
    audio: audioUrl || 'https://...',
    albumTrackingId: albumTrackingId || 'uuid-album',
    categorieTrackingId: categorieTrackingId || 'uuid-categorie',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto pb-10">
      {/* Top AppBar */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black font-medium text-xs sm:text-sm transition cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>

        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Créer un morceau</h2>
          {showEndpoints && (
            <span className="text-[11px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              POST /song/create
            </span>
          )}
        </div>

        {/* Espace vide pour garder le titre centré (Exemple Meiway supprimé) */}
        <div className="w-16" />
      </div>

      {/* Swagger Documentation Header Banner - Uniquement si mode endpoints activé */}
      {showEndpoints && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-orange-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-orange-900">
            <span className="flex items-center gap-1.5">
              <Code2 size={16} className="text-[#FF8A00]" />
              Spécification Swagger &bull; POST /song/create
            </span>
            <span className="font-mono text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-semibold">
              GET /song/getAll
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Pour créer une chanson, l&apos;API associe automatiquement le morceau à l&apos;album et la catégorie sélectionnés.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUCCESS MODAL / BANNER */}
      {successResponse && (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-sm space-y-3 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <span>Morceau « {successResponse.titre} » créé avec succès !</span>
            </div>
            {showEndpoints && successResponse.origin && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-200 text-emerald-900">
                {successResponse.origin === 'swagger_real' ? 'Backend Swagger :8081' : 'Synchronisé'}
              </span>
            )}
          </div>

          {showEndpoints && (
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-200 space-y-1 relative group">
              <div className="text-[10px] uppercase text-emerald-400 font-bold mb-1 flex items-center justify-between">
                <span>Schéma retourné :</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(successResponse, null, 2))}
                  className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded cursor-pointer"
                >
                  {copiedId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedId ? 'Copié' : 'Copier JSON'}</span>
                </button>
              </div>
              <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{JSON.stringify(
  {
    trackingId: successResponse.trackingId,
    titre: successResponse.titre,
    audio: successResponse.audio,
    artiste: successResponse.artiste,
  },
  null,
  2
)}
              </pre>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {onPlaySong && (
              <button
                type="button"
                onClick={() =>
                  onPlaySong({
                    trackingIdSong: successResponse.trackingId,
                    trackingId: successResponse.trackingId,
                    titre: successResponse.titre,
                    artiste: successResponse.artiste,
                    audio: successResponse.audio,
                    imageAlbum: selectedAlbum?.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
                  })
                }
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Play size={14} fill="white" />
                <span>Écouter le morceau</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition cursor-pointer"
            >
              Voir la liste des morceaux →
            </button>
            <button
              type="button"
              onClick={() => {
                setSuccessResponse(null);
                setTitre('');
                setAudioUrl('');
              }}
              className="px-3 py-2 rounded-xl text-gray-500 hover:text-gray-800 text-xs font-medium cursor-pointer"
            >
              Créer un autre morceau
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          {/* Champ 1: Titre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Music size={14} className="text-[#FF8A00]" />
              <span>Titre de la chanson</span>
              <span className="text-[#FF8A00]">*</span>
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Première danse, Amapiano Groove, Rush..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00]/20 text-xs sm:text-sm outline-none transition shadow-xs font-medium"
            />
          </div>

          {/* Champ 2: Audio URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <LinkIcon size={14} className="text-[#FF8A00]" />
              <span>Fichier audio (URL)</span>
              <span className="text-[#FF8A00]">*</span>
            </label>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://.../audio.mp3"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00]/20 text-xs outline-none transition shadow-xs font-mono text-gray-700"
            />

            {/* Quick Demo Audios */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-gray-400 font-semibold">Exemples d&apos;audio :</span>
              <button
                type="button"
                onClick={() =>
                  setAudioUrl('https://dn710201.ca.archive.org/0/items/darkmp3-ru-meiway-200-zoblazo/darkmp3-ru-meiway-ahibebou.mp3')
                }
                className="text-[10px] px-2 py-0.5 rounded bg-orange-50 hover:bg-orange-100 text-orange-800 font-medium border border-orange-200 transition cursor-pointer"
              >
                🎵 Son Démo 1
              </button>
              <button
                type="button"
                onClick={() => setAudioUrl('https://cdn.freesound.org/previews/708/708899_11861866-lq.mp3')}
                className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition cursor-pointer"
              >
                🎵 Chill Loop MP3
              </button>
            </div>
          </div>

          {/* Champ 3: Album de rattachement */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Disc size={15} className="text-[#00BFA6]" />
                <span>Album de rattachement</span>
                <span className="text-[#00BFA6]">*</span>
              </label>
              {showEndpoints && (
                <button
                  type="button"
                  onClick={() => setIsManualAlbumUuid(!isManualAlbumUuid)}
                  className="text-[11px] text-teal-700 hover:underline font-medium cursor-pointer"
                >
                  {isManualAlbumUuid ? 'Choisir dans la liste' : 'Saisir UUID manuel'}
                </button>
              )}
            </div>

            {isManualAlbumUuid && showEndpoints ? (
              <input
                type="text"
                value={albumTrackingId}
                onChange={(e) => setAlbumTrackingId(e.target.value)}
                placeholder="Ex: 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono outline-none focus:border-teal-500"
              />
            ) : (
              <div className="space-y-2">
                <select
                  value={albumTrackingId}
                  onChange={(e) => setAlbumTrackingId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium outline-none focus:border-teal-500 shadow-xs"
                >
                  <option value="">-- Choisir un album ({albums.length} disponibles) --</option>
                  {albums.map((alb) => {
                    const id = alb.trackingId || alb.trackingIdAlbum;
                    return (
                      <option key={id} value={id}>
                        {alb.titreAlbum} {alb.nomArtiste ? `— ${alb.nomArtiste}` : ''}
                      </option>
                    );
                  })}
                </select>

                <div className="flex items-center justify-between text-[11px]">
                  {selectedAlbum ? (
                    <span className="text-teal-700 font-semibold truncate">
                      Artiste associé : {selectedAlbum.nomArtiste || 'Inconnu'}
                    </span>
                  ) : (
                    <span className="text-gray-400">Sélectionnez l&apos;album pour auto-lier l&apos;artiste</span>
                  )}

                  {onNavigateToAddAlbum && (
                    <button
                      type="button"
                      onClick={onNavigateToAddAlbum}
                      className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Créer un album</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Champ 4: Catégorie musicale - SANS trackingId visible, seulement Afrobeat, Amapiano, etc. */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Tag size={15} className="text-amber-600" />
                <span>Catégorie musicale</span>
                <span className="text-amber-600">*</span>
              </label>
              {showEndpoints && (
                <button
                  type="button"
                  onClick={() => setIsManualCategoryUuid(!isManualCategoryUuid)}
                  className="text-[11px] text-amber-700 hover:underline font-medium cursor-pointer"
                >
                  {isManualCategoryUuid ? 'Choisir dans la liste' : 'Saisir UUID manuel'}
                </button>
              )}
            </div>

            {isManualCategoryUuid && showEndpoints ? (
              <input
                type="text"
                value={categorieTrackingId}
                onChange={(e) => setCategorieTrackingId(e.target.value)}
                placeholder="Ex: a9aec7d0-810b-40a0-8727-08b7990e3978"
                required
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-mono outline-none focus:border-amber-500"
              />
            ) : (
              <div className="space-y-2">
                <select
                  value={categorieTrackingId}
                  onChange={(e) => setCategorieTrackingId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium outline-none focus:border-amber-500 shadow-xs"
                >
                  <option value="">-- Choisir une catégorie ({categories.length} disponibles) --</option>
                  {categories.map((cat) => (
                    <option key={cat.trackingId} value={cat.trackingId}>
                      {cat.nomCategorie}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-[11px]">
                  {selectedCategory ? (
                    <span className="text-amber-800 font-semibold truncate">
                      Genre : {selectedCategory.nomCategorie}
                    </span>
                  ) : (
                    <span className="text-gray-400">Aucune catégorie sélectionnée</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQuickCategoryModalOpen(true)}
                      className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Ajouter une catégorie</span>
                    </button>
                    {onNavigateToCategories && (
                      <button
                        type="button"
                        onClick={onNavigateToCategories}
                        className="text-gray-500 hover:text-gray-800 text-[10px] underline cursor-pointer"
                      >
                        Gérer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF8A00] to-amber-500 hover:from-[#e67c00] hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Music size={16} />
                  <span>Créer le morceau</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Preview */}
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-700">Aperçu du morceau</span>
              <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                {selectedCategory?.nomCategorie || 'Genre musical'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={selectedAlbum?.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80'}
                alt="Album Cover"
                className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-gray-900 truncate">
                  {titre || 'Titre de la chanson'}
                </h4>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  Artiste : <span className="font-semibold text-gray-800">{selectedAlbum?.nomArtiste || 'Sélectionnez un album'}</span>
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  Album : {selectedAlbum?.titreAlbum || 'Aucun album lié'}
                </p>
              </div>

              {audioUrl && onPlaySong && (
                <button
                  type="button"
                  onClick={() =>
                    onPlaySong({
                      trackingIdSong: 'temp_preview',
                      titre: titre || 'Preview',
                      artiste: selectedAlbum?.nomArtiste || 'Artiste',
                      audio: audioUrl,
                      imageAlbum: selectedAlbum?.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80',
                    })
                  }
                  className="p-3 rounded-full bg-[#FF8A00] text-white hover:bg-orange-600 transition shadow-sm cursor-pointer shrink-0"
                  title="Écouter l'extrait"
                >
                  <Play size={16} fill="white" />
                </button>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Catégorie :</span>
                <span className="font-semibold text-gray-800">{selectedCategory?.nomCategorie || 'Non définie'}</span>
              </div>
              <div className="flex justify-between">
                <span>Album :</span>
                <span className="font-semibold text-gray-800">{selectedAlbum?.titreAlbum || 'Non défini'}</span>
              </div>
            </div>
          </div>

          {/* Swagger Payload Preview Box - visible uniquement si mode endpoints/développeur actif */}
          {showEndpoints && (
            <div className="p-4 bg-gray-900 rounded-2xl text-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Code2 size={14} />
                  Payload Swagger :
                </span>
                <span className="text-[10px] text-gray-400">POST /song/create</span>
              </div>
              <pre className="text-[11px] font-mono text-gray-300 bg-gray-950 p-3 rounded-xl overflow-x-auto leading-relaxed border border-gray-800">
{JSON.stringify(currentPayloadPreview, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Quick Create Category Modal */}
      {isQuickCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-amber-600" />
                <h3 className="font-bold text-sm text-gray-900">Ajouter une Catégorie</h3>
              </div>
              <button
                onClick={() => setIsQuickCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickCreateCategory} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Afrobeat, Amapiano, Zoblazo..."
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold cursor-pointer"
                >
                  {isCreatingCategory ? 'Création...' : 'Créer & Sélectionner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
