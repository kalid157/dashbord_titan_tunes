import React, { useState } from 'react';
import {
  ArrowLeft,
  Terminal,
  Play,
  Copy,
  Check,
  Code,
  Radio,
  Clock,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
import { Song, Playlist } from '../types';

interface ApiConsolePageProps {
  onBack: () => void;
  songs: Song[];
  playlists: Playlist[];
  onDataMutated: () => void;
}

interface EndpointDef {
  id: string;
  category: 'playlist' | 'song' | 'album' | 'user' | 'stats' | 'other';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  defaultParams?: Record<string, string>;
  defaultBody?: Record<string, unknown>;
}

export const ApiConsolePage: React.FC<ApiConsolePageProps> = ({
  onBack,
  songs,
  playlists,
  onDataMutated,
}) => {
  const sampleSongId = songs[0]?.trackingIdSong || 'sng_9a8b1c2d';
  const samplePlaylistId = playlists[0]?.trackingIdPlaylist || 'pl_01_hitstitan';
  const sampleClientId = playlists[0]?.clientTrackingId || 'client_admin_root';

  const endpoints: EndpointDef[] = [
    // PLAYLIST ENDPOINTS
    {
      id: 'pl_all',
      category: 'playlist',
      method: 'GET',
      path: '/playlist/all',
      description: 'Lister toutes les playlists',
    },
    {
      id: 'pl_get',
      category: 'playlist',
      method: 'GET',
      path: '/playlist/get/{trackingId}',
      description: 'Obtenir une playlist par UUID',
      defaultParams: { trackingId: samplePlaylistId },
    },
    {
      id: 'pl_all_for_one',
      category: 'playlist',
      method: 'GET',
      path: '/playlist/allForOne/{trackingIdClient}',
      description: 'Lister les playlists d\'un client',
      defaultParams: { trackingIdClient: sampleClientId },
    },
    {
      id: 'pl_create',
      category: 'playlist',
      method: 'POST',
      path: '/playlist/create/{trackingIdClient}',
      description: 'Créer une nouvelle playlist pour un client',
      defaultParams: { trackingIdClient: sampleClientId },
      defaultBody: {
        titre: 'Chill Afro Beats 2026',
        imageAlbum: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
        visibilite: true,
      },
    },
    {
      id: 'pl_change_visibilite',
      category: 'playlist',
      method: 'PUT',
      path: '/playlist/changeVisibilite/{trackingIdPlaylist}',
      description: 'Changer la visibilité d\'une playlist (publique / privée)',
      defaultParams: { trackingIdPlaylist: samplePlaylistId },
      defaultBody: { visibilite: false },
    },
    {
      id: 'pl_add_song',
      category: 'playlist',
      method: 'POST',
      path: '/playlist/addSong',
      description: 'Ajouter une chanson à une playlist',
      defaultBody: {
        trackingIdPlaylist: samplePlaylistId,
        trackingIdSong: sampleSongId,
      },
    },
    {
      id: 'pl_remove_song',
      category: 'playlist',
      method: 'DELETE',
      path: '/playlist/removeSongForPlaylist/{trackingIdPlaylist}/{trackingIdSong}',
      description: 'Supprimer une chanson d\'une playlist',
      defaultParams: {
        trackingIdPlaylist: samplePlaylistId,
        trackingIdSong: sampleSongId,
      },
    },
    {
      id: 'pl_get_all_song_for_playlist',
      category: 'playlist',
      method: 'GET',
      path: '/playlist/getAllSongForPlaylist/{trackingIdSong}',
      description: 'Lister les playlists contenant une chanson',
      defaultParams: { trackingIdSong: sampleSongId },
    },
    {
      id: 'pl_update',
      category: 'playlist',
      method: 'PUT',
      path: '/playlist/update/{trackingIdClient}/{trackingIdPlaylist}',
      description: 'Mettre à jour le titre ou la couverture d\'une playlist',
      defaultParams: {
        trackingIdClient: sampleClientId,
        trackingIdPlaylist: samplePlaylistId,
      },
      defaultBody: {
        titre: 'Titan Top Hits Updated',
        imageAlbum: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80',
        visibilite: true,
      },
    },

    // CATEGORY ENDPOINTS (Swagger)
    {
      id: 'cat_create',
      category: 'other',
      method: 'POST',
      path: '/categorie/create',
      description: 'Créer une catégorie musicale (Swagger)',
      defaultBody: {
        nomCategorie: 'Afrobeat',
      },
    },
    {
      id: 'cat_get_all',
      category: 'other',
      method: 'GET',
      path: '/categorie/getAll',
      description: 'Lister toutes les catégories (Swagger)',
    },
    {
      id: 'cat_delete',
      category: 'other',
      method: 'DELETE',
      path: '/categorie/delete/{trackingId}',
      description: 'Supprimer une catégorie par son trackingId',
      defaultParams: { trackingId: 'a9aec7d0-810b-40a0-8727-08b7990e3978' },
    },

    // SONG ENDPOINTS (Swagger)
    {
      id: 'song_create_swagger',
      category: 'song',
      method: 'POST',
      path: '/song/create',
      description: 'Créer un son (Swagger: titre, audio, albumTrackingId, categorieTrackingId)',
      defaultBody: {
        titre: 'ahibebou',
        audio: 'https://dn710201.ca.archive.org/0/items/darkmp3-ru-meiway-200-zoblazo/darkmp3-ru-meiway-ahibebou.mp3',
        albumTrackingId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        categorieTrackingId: 'a9aec7d0-810b-40a0-8727-08b7990e3978',
      },
    },
    {
      id: 'song_get_all',
      category: 'song',
      method: 'GET',
      path: '/song/getAll',
      description: 'Lister toutes les chansons (/song/getAll)',
    },
    {
      id: 'song_get',
      category: 'song',
      method: 'GET',
      path: '/song/get/{trackingIdSong}',
      description: 'Obtenir une chanson spécifique',
      defaultParams: { trackingIdSong: sampleSongId },
    },
    {
      id: 'song_update',
      category: 'song',
      method: 'PUT',
      path: '/song/update/{trackingIdSong}',
      description: 'Mettre à jour les métadonnées d\'une chanson (Swagger: titre, audio, albumTrackingId, categorieTrackingId)',
      defaultParams: { trackingIdSong: sampleSongId },
      defaultBody: {
        titre: 'Bad-Boy-feat.Aya-Nakamura',
        audio: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3',
        albumTrackingId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        categorieTrackingId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
    },
    {
      id: 'song_update_audio',
      category: 'song',
      method: 'PUT',
      path: '/song/updateAudio/{trackingIdSong}',
      description: 'Mettre à jour l\'audio d\'une chanson sur MinIO (Swagger multipart)',
      defaultParams: { trackingIdSong: sampleSongId },
      defaultBody: {
        audio: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3',
      },
    },
    {
      id: 'song_upload',
      category: 'song',
      method: 'POST',
      path: '/song/upload',
      description: 'Uploader une chanson avec fichier audio ou payload',
      defaultBody: {
        titre: 'Uploaded Track 2026',
        artiste: 'Titan Producer',
        audio: 'https://cdn.freesound.org/previews/568/568600_11861866-lq.mp3',
        imageAlbum: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      },
    },
    {
      id: 'song_delete',
      category: 'song',
      method: 'DELETE',
      path: '/song/delete/{trackingIdSong}',
      description: 'Supprimer une chanson du catalogue',
      defaultParams: { trackingIdSong: '162b7252-f615-42bf-8a70-93c480ff6482' },
    },

    // ALBUMS (Swagger)
    {
      id: 'album_all',
      category: 'album',
      method: 'GET',
      path: '/albums/all',
      description: 'Lister tous les albums',
    },
    {
      id: 'album_create',
      category: 'album',
      method: 'POST',
      path: '/albums/create',
      description: 'Créer un album (schéma Swagger)',
      defaultBody: {
        titreAlbum: 'Titan Fusion 2026',
        artisteTrackingId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        imageAlbum: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
      },
    },
    {
      id: 'album_update',
      category: 'album',
      method: 'PUT',
      path: '/albums/update/{trackingId}',
      description: 'Mettre à jour un album (titreAlbum, artisteTrackingId, imageAlbum)',
      defaultParams: { trackingId: 'alb_titan_01' },
      defaultBody: {
        titreAlbum: 'Titanium Waves Vol. 1 (Deluxe)',
        artisteTrackingId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        imageAlbum: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
      },
    },
    {
      id: 'album_update_image',
      category: 'album',
      method: 'PUT',
      path: '/albums/updateImage/{trackingId}',
      description: 'Mettre à jour l\'image d\'un album sur MinIO',
      defaultParams: { trackingId: 'alb_titan_01' },
      defaultBody: {
        image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
      },
    },
    {
      id: 'album_delete',
      category: 'album',
      method: 'DELETE',
      path: '/albums/delete/{trackingId}',
      description: 'Supprimer un album par son trackingId',
      defaultParams: { trackingId: 'alb_titan_01' },
    },

    // STATS ENDPOINTS (Swagger)
    {
      id: 'stats_most_liked',
      category: 'stats',
      method: 'GET',
      path: '/stats/songWithMostLike',
      description: 'Chanson la plus likée (Swagger exact)',
    },
    {
      id: 'stats_song_plays',
      category: 'stats',
      method: 'GET',
      path: '/stats/nbrTotalEcoute/{trackingIdSong}',
      description: 'Nombre total d\'écoutes d\'une chanson',
      defaultParams: { trackingIdSong: '162b7252-f615-42bf-8a70-93c480ff6482' },
    },

    // USER / ARTIST (Swagger)
    {
      id: 'user_register_artist',
      category: 'user',
      method: 'POST',
      path: '/user/registerArtist',
      description: 'Créer un artiste (génère trackingId & code connexion)',
      defaultBody: {
        firstName: 'Jean',
        lastName: 'Dupont',
        alias: 'DJ Titan Sound',
        phone: '+33612345678',
        email: 'jean.dupont@music.com',
        password: 'Password123!',
        description: 'Producteur et artiste afro-fusion international.',
      },
    },

    // OTHER
    {
      id: 'notif_broadcast',
      category: 'other',
      method: 'POST',
      path: '/notification/broadcast',
      description: 'Diffuser une notification aux abonnés',
      defaultBody: {
        title: '🔥 Nouveauté disponible !',
        body: 'Venez écouter la playlist Titan Hits 2026.',
        targetAudience: 'Tous les abonnés',
      },
    },
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(endpoints[0]);
  const [paramValues, setParamValues] = useState<Record<string, string>>(
    endpoints[0].defaultParams || {}
  );
  const [jsonBody, setJsonBody] = useState<string>(
    endpoints[0].defaultBody ? JSON.stringify(endpoints[0].defaultBody, null, 2) : ''
  );

  const [isExecuting, setIsExecuting] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<unknown | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setParamValues(ep.defaultParams || {});
    setJsonBody(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setResponseStatus(null);
    setResponseData(null);
  };

  const getResolvedUrl = () => {
    let url = selectedEndpoint.path;
    Object.entries(paramValues).forEach(([key, val]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(val));
    });
    return url;
  };

  const executeRequest = async () => {
    setIsExecuting(true);
    const start = performance.now();
    const resolvedPath = getResolvedUrl();

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
      };

      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && jsonBody.trim()) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = jsonBody;
      }

      const res = await fetch(resolvedPath, options);
      const latency = Math.round(performance.now() - start);
      setResponseStatus(res.status);
      setResponseLatency(latency);

      const data = await res.json();
      setResponseData(data);

      if (['POST', 'PUT', 'DELETE'].includes(selectedEndpoint.method)) {
        onDataMutated();
      }
    } catch (err: unknown) {
      setResponseStatus(500);
      setResponseLatency(Math.round(performance.now() - start));
      setResponseData({
        error: true,
        message: err instanceof Error ? err.message : 'Erreur de connexion API',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const generateCurl = () => {
    const url = `${window.location.origin}${getResolvedUrl()}`;
    if (selectedEndpoint.method === 'GET') {
      return `curl -X GET "${url}"`;
    }
    if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method)) {
      return `curl -X ${selectedEndpoint.method} "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${jsonBody.replace(/\n\s*/g, ' ')}'`;
    }
    return `curl -X ${selectedEndpoint.method} "${url}"`;
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
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
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-[#FF8A00]" />
          <h2 className="text-base font-semibold text-gray-800">Console API REST Titan Tunes</h2>
        </div>
        <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Radio size={10} className="animate-pulse" /> Live Server 3000
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left column: Endpoints selector */}
        <div className="md:col-span-5 space-y-3">
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Endpoints disponibles</span>
              <span className="font-mono text-[10px] text-gray-400">({endpoints.length})</span>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-1 pr-1 text-xs">
              {endpoints.map((ep) => {
                const isSelected = selectedEndpoint.id === ep.id;
                const methodColor =
                  ep.method === 'GET'
                    ? 'text-blue-600 bg-blue-50 border-blue-200'
                    : ep.method === 'POST'
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                    : ep.method === 'PUT'
                    ? 'text-amber-600 bg-amber-50 border-amber-200'
                    : 'text-red-600 bg-red-50 border-red-200';

                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2 border ${
                      isSelected
                        ? 'bg-orange-50/70 border-[#FF8A00] shadow-xs'
                        : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono border ${methodColor} shrink-0 mt-0.5`}
                    >
                      {ep.method}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] font-semibold text-gray-900 truncate">
                        {ep.path}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{ep.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Request builder & response viewer */}
        <div className="md:col-span-7 space-y-3">
          {/* Request Header */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded font-mono uppercase ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-blue-100 text-blue-700'
                      : selectedEndpoint.method === 'POST'
                      ? 'bg-emerald-100 text-emerald-700'
                      : selectedEndpoint.method === 'PUT'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-xs font-semibold text-gray-900 truncate">
                  {getResolvedUrl()}
                </span>
              </div>

              <button
                onClick={copyCurl}
                className="text-[11px] text-gray-500 hover:text-black flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md transition shrink-0"
                title="Copier la commande cURL"
              >
                {copiedCurl ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>cURL</span>
              </button>
            </div>

            <p className="text-xs text-gray-600">{selectedEndpoint.description}</p>

            {/* Path Parameters */}
            {selectedEndpoint.defaultParams && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                  Paramètres URL
                </label>
                <div className="space-y-1.5">
                  {Object.keys(selectedEndpoint.defaultParams).map((paramKey) => (
                    <div key={paramKey} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-[11px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 w-36 truncate">
                        {`{${paramKey}}`}
                      </span>
                      <input
                        type="text"
                        value={paramValues[paramKey] || ''}
                        onChange={(e) =>
                          setParamValues({ ...paramValues, [paramKey]: e.target.value })
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono outline-none focus:border-[#FF8A00]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body Editor */}
            {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                  Corps de la requête JSON (Payload)
                </label>
                <textarea
                  rows={5}
                  value={jsonBody}
                  onChange={(e) => setJsonBody(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-950 text-emerald-400 font-mono text-[11px] outline-none border border-gray-800"
                />
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={executeRequest}
              disabled={isExecuting}
              className="w-full py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#e07b00] active:scale-[0.99] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-orange-500/25 cursor-pointer disabled:opacity-60"
            >
              {isExecuting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>Exécuter la requête API</span>
                </>
              )}
            </button>
          </div>

          {/* Response Viewer */}
          {responseData !== null && (
            <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-md space-y-2 border border-gray-800 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-300">Réponse HTTP :</span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      responseStatus && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {responseStatus}
                  </span>
                </div>
                {responseLatency !== null && (
                  <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                    <Clock size={11} /> {responseLatency}ms
                  </span>
                )}
              </div>

              <pre className="max-h-64 overflow-y-auto text-[11px] font-mono text-gray-200 bg-gray-950 p-3 rounded-xl border border-gray-800">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
