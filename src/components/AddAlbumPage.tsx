import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Disc,
  User,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { Album, Artist } from '../types';

interface AddAlbumPageProps {
  onBack: () => void;
  onAlbumAdded: (album: Album) => void;
  artists?: Artist[];
  initialArtisteTrackingId?: string;
  onNavigateToRegisterArtist?: () => void;
  backendConfig?: {
    isConnected: boolean;
    targetUrl: string;
    swaggerUrl: string;
  };
  onOpenConnectModal?: () => void;
  showEndpoints?: boolean;
}

export const AddAlbumPage: React.FC<AddAlbumPageProps> = ({
  onBack,
  onAlbumAdded,
  artists = [],
  initialArtisteTrackingId,
  onNavigateToRegisterArtist,
  showEndpoints = false,
}) => {
  const [titreAlbum, setTitreAlbum] = useState('');
  const [artisteTrackingId, setArtisteTrackingId] = useState(
    initialArtisteTrackingId || '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  );
  const [imageAlbum, setImageAlbum] = useState('');
  const [selectedArtistName, setSelectedArtistName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createdAlbumInfo, setCreatedAlbumInfo] = useState<{
    trackingId?: string;
    titreAlbum: string;
    artisteTrackingId: string;
  } | null>(null);

  const sampleCovers = [
    { label: 'Wave Vinyl', url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80' },
    { label: 'Neon Studio', url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80' },
    { label: 'Live Concert', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80' },
    { label: 'Vintage Gold', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
  ];

  // Sync initial artist if passed
  useEffect(() => {
    if (initialArtisteTrackingId) {
      setArtisteTrackingId(initialArtisteTrackingId);
      const match = artists.find((a) => a.trackingId === initialArtisteTrackingId);
      if (match) setSelectedArtistName(match.alias || `${match.firstName} ${match.lastName}`);
    } else if (artists.length > 0 && !artisteTrackingId) {
      setArtisteTrackingId(artists[0].trackingId);
      setSelectedArtistName(artists[0].alias || `${artists[0].firstName} ${artists[0].lastName}`);
    } else if (artists.length > 0 && artisteTrackingId) {
      const match = artists.find((a) => a.trackingId === artisteTrackingId);
      if (match) {
        setSelectedArtistName(match.alias || `${match.firstName} ${match.lastName}`);
      } else {
        setSelectedArtistName(artists[0].alias || `${artists[0].firstName} ${artists[0].lastName}`);
        setArtisteTrackingId(artists[0].trackingId);
      }
    }
  }, [initialArtisteTrackingId, artists]);

  const handleSelectArtist = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setArtisteTrackingId(val);
    const match = artists.find((a) => a.trackingId === val);
    if (match) {
      setSelectedArtistName(match.alias || `${match.firstName} ${match.lastName}`);
    } else {
      setSelectedArtistName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titreAlbum.trim()) {
      setErrorMsg("Veuillez entrer le titre de l'album");
      return;
    }
    if (!artisteTrackingId.trim()) {
      setErrorMsg("Veuillez sélectionner un artiste pour cet album");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const chosenCover = (imageAlbum || sampleCovers[0].url).trim();
      const result = await api.createAlbum({
        titreAlbum: titreAlbum.trim(),
        artisteTrackingId: artisteTrackingId.trim(),
        imageAlbum: chosenCover,
        nomArtiste: selectedArtistName || (artists.length > 0 ? (artists[0].alias || `${artists[0].firstName} ${artists[0].lastName}`) : 'Artiste'),
      });

      if (result.success && result.album) {
        setCreatedAlbumInfo({
          trackingId: result.trackingId || result.album.trackingId || result.album.trackingIdAlbum,
          titreAlbum: result.album.titreAlbum,
          artisteTrackingId: result.album.artisteTrackingId || artisteTrackingId,
        });

        setSuccessMsg("Album créé avec succès ! 🎉");
        onAlbumAdded(result.album);
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        setErrorMsg(result.message || "Erreur lors de la création de l'album");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-10 max-w-2xl mx-auto">
      {/* Top AppBar: Seulement "Créer un album", pas d'Exemple ni d'endpoint */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black font-medium text-sm transition cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>

        <h2 className="text-lg font-bold text-gray-900 text-center">Créer un album</h2>

        {/* Espace pour garder le centrage parfait */}
        <div className="w-16" />
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          {createdAlbumInfo && (
            <p className="text-xs text-emerald-700 pl-6">
              Album « {createdAlbumInfo.titreAlbum} » ajouté à votre catalogue.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {/* Champ 1: Titre de l'album */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-800 block">
            Titre de l&apos;album <span className="text-[#FF8A00]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#00BFA6]">
              <Disc size={19} />
            </div>
            <input
              type="text"
              value={titreAlbum}
              onChange={(e) => setTitreAlbum(e.target.value)}
              placeholder="Ex: Afro Renaissance, Sounds From Africa..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00BFA6] focus:ring-2 focus:ring-[#00BFA6]/20 outline-none text-sm transition"
              required
            />
          </div>
        </div>

        {/* Champ 2: Artiste rattaché (L'artisteTrackingId est sélectionné automatiquement en arrière-plan) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <User size={16} className="text-[#FF8A00]" />
              <span>Artiste rattaché</span>
              <span className="text-[#FF8A00]">*</span>
            </label>
            {onNavigateToRegisterArtist && (
              <button
                type="button"
                onClick={onNavigateToRegisterArtist}
                className="text-xs text-[#FF8A00] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Créer un artiste</span>
              </button>
            )}
          </div>

          {artists.length > 0 ? (
            <select
              value={artisteTrackingId}
              onChange={handleSelectArtist}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 focus:border-[#00BFA6] focus:ring-2 focus:ring-[#00BFA6]/20 outline-none transition"
              required
            >
              <option value="">-- Choisir un artiste --</option>
              {artists.map((a) => (
                <option key={a.trackingId} value={a.trackingId}>
                  {a.alias ? `${a.alias} (${a.firstName} ${a.lastName})` : `${a.firstName} ${a.lastName}`}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span>Aucun artiste enregistré pour le moment.</span>
              {onNavigateToRegisterArtist && (
                <button
                  type="button"
                  onClick={onNavigateToRegisterArtist}
                  className="font-bold underline text-amber-900"
                >
                  Ajouter un artiste
                </button>
              )}
            </div>
          )}

          {/* En mode développeur uniquement, affichage discret */}
          {showEndpoints && (
            <p className="text-[11px] font-mono text-gray-400">
              artisteTrackingId (sélectionné en arrière-plan) : {artisteTrackingId}
            </p>
          )}
        </div>

        {/* Champ 3: Pochette d'album */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800 block">
            Pochette d&apos;album
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <ImageIcon size={19} />
            </div>
            <input
              type="url"
              value={imageAlbum}
              onChange={(e) => setImageAlbum(e.target.value)}
              placeholder="https://... ou choisissez un modèle ci-dessous"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00BFA6] focus:ring-2 focus:ring-[#00BFA6]/20 outline-none text-sm transition"
            />
          </div>

          {/* Couvertures suggérées */}
          <div className="pt-2">
            <span className="text-xs text-gray-500 font-medium block mb-2">Couvertures suggérées :</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {sampleCovers.map((cov, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageAlbum(cov.url)}
                  className={`group relative rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                    imageAlbum === cov.url
                      ? 'border-[#00BFA6] ring-2 ring-[#00BFA6]/20'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={cov.url}
                    alt={cov.label}
                    className="w-full h-18 object-cover group-hover:scale-105 transition"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-1 truncate text-center font-medium">
                    {cov.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton Créer l'album */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00BFA6] to-[#008f7d] hover:from-[#00a892] hover:to-[#007a6b] text-white font-bold text-sm transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Disc size={18} />
                <span>Créer l&apos;album</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
