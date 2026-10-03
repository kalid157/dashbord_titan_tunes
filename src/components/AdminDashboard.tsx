import React, { useState, useEffect } from 'react';
import { AdminRoute, DashboardStats, BackendConfig, Song, Artist } from '../types';
import {
  Music,
  Disc,
  ListPlus,
  BellRing,
  ChevronRight,
  LayoutDashboard,
  Layers,
  Terminal,
  Radio,
  Sparkles,
  TrendingUp,
  Globe,
  ExternalLink,
  SlidersHorizontal,
  UserCheck,
  Users,
  KeyRound,
  Tag,
  Heart,
  Play,
  Headphones,
  CheckCircle,
  RefreshCw,
  Zap,
  ChevronLeft,
  LayoutGrid,
} from 'lucide-react';
import { api } from '../services/api';

interface AdminDashboardProps {
  onNavigate: (route: AdminRoute) => void;
  stats: DashboardStats;
  backendConfig?: BackendConfig;
  onOpenSwaggerSettings?: () => void;
  songs?: Song[];
  artists?: Artist[];
  onPlaySong?: (song: Song) => void;
  showEndpoints?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  stats,
  backendConfig,
  onOpenSwaggerSettings,
  songs = [],
  artists = [],
  onPlaySong,
  showEndpoints = false,
}) => {
  const [mostLiked, setMostLiked] = useState<{ titre: string; total_liked: number }>({
    titre: stats.mostLikedSong?.titre || 'Bad-Boy-feat.Aya-Nakamura',
    total_liked: stats.mostLikedSong?.total_liked || 1,
  });
  const [loadingMostLiked, setLoadingMostLiked] = useState(false);
  const [mostLikedSuccess, setMostLikedSuccess] = useState(false);

  // /stats/nbrTotalEcoute tester state
  const [selectedSongForPlays, setSelectedSongForPlays] = useState<string>(
    songs[0]?.trackingIdSong || '162b7252-f615-42bf-8a70-93c480ff6482'
  );
  const [testedPlays, setTestedPlays] = useState<{ trackingIdSong: string; count: number } | null>(null);
  const [loadingPlays, setLoadingPlays] = useState(false);

  // Pagination for Catalogue Complet (2 rows of 6 cards = 12 items)
  const [dashboardSongsPage, setDashboardSongsPage] = useState(1);
  const songsPerPage = 12;
  const totalDashboardPages = Math.max(1, Math.ceil(songs.length / songsPerPage));
  const paginatedDashboardSongs = songs.slice(
    (dashboardSongsPage - 1) * songsPerPage,
    dashboardSongsPage * songsPerPage
  );

  const fetchMostLiked = async () => {
    setLoadingMostLiked(true);
    try {
      // Calls Swagger: GET /stats/songWithMostLike
      const data = await api.getSongWithMostLike();
      if (data && data.titre) {
        setMostLiked(data);
        setMostLikedSuccess(true);
        setTimeout(() => setMostLikedSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMostLiked(false);
    }
  };

  const handleTestPlays = async (uuidToTest?: string) => {
    const targetUuid = uuidToTest || selectedSongForPlays;
    if (!targetUuid) return;
    setLoadingPlays(true);
    try {
      // Calls Swagger: GET /stats/nbrTotalEcoute/{trackingIdSong}
      const count = await api.getSongPlays(targetUuid);
      setTestedPlays({ trackingIdSong: targetUuid, count });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlays(false);
    }
  };

  useEffect(() => {
    fetchMostLiked();
  }, []);
  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Flutter Header Banner with Gradient */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#FF8A00] to-[#E8A23F] text-white shadow-lg shadow-orange-500/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute right-12 -top-8 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Gestion du contenu
            </h2>
            <p className="text-xs md:text-sm text-white/90 font-medium mt-0.5">
              Ajoutez albums, songs, playlists
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm border border-white/20">
            <Radio size={14} className="text-white animate-pulse" />
            <span>{showEndpoints ? 'Swagger Render' : 'Catalogue en ligne'}</span>
          </div>
        </div>
      </div>

      {/* Swagger Quick Connection Ribbon (Only visible in Developer mode or minimal) */}
      {showEndpoints && (
        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#85EA2D]/20 text-lime-700 flex items-center justify-center font-bold font-mono shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900">Swagger OpenAPI :</span>
                <span className="font-mono text-gray-500 truncate">
                  {backendConfig?.swaggerUrl || 'https://titan-tune-reset.onrender.com/swagger-ui/index.html'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    backendConfig?.isConnected ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      backendConfig?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {backendConfig?.isConnected
                    ? `Connecté à Render (${backendConfig.latency}ms)`
                    : 'Backend Render en cours de connexion'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('swagger_view')}
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition flex items-center gap-1 text-xs"
            >
              <Globe size={13} />
              <span>Spécification</span>
            </button>

            <button
              onClick={onOpenSwaggerSettings}
              className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF8A00] font-semibold transition flex items-center gap-1 text-xs"
              title="Configurer l'URL et le mode proxy"
            >
              <SlidersHorizontal size={13} />
              <span>Régler</span>
            </button>

            <a
              href={backendConfig?.swaggerUrl || 'https://titan-tune-reset.onrender.com/swagger-ui/index.html'}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#85EA2D] hover:bg-[#77d526] text-gray-950 font-bold transition flex items-center gap-1 text-xs shadow-xs"
            >
              <span>Swagger UI</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => onNavigate('manage_songs')}
          className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Morceaux</span>
            <Music size={14} className="text-[#6B4EFF] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{stats.songsCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <TrendingUp size={10} /> {showEndpoints ? '/song/getAll' : 'Catalogue complet'}
          </div>
        </button>

        <button
          onClick={() => onNavigate('manage_artists')}
          className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Artistes</span>
            <UserCheck size={14} className="text-[#FF8A00] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{stats.artistsCount !== undefined ? stats.artistsCount : artists.length}</div>
          <div className="text-[10px] text-orange-600 font-medium mt-0.5 flex items-center gap-1">
            <KeyRound size={10} /> {showEndpoints ? '/user/allArtist' : 'Comptes enregistrés'}
          </div>
        </button>

        <button
          onClick={() => onNavigate('manage_albums')}
          className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Albums</span>
            <Disc size={14} className="text-[#00BFA6] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{stats.albumsCount}</div>
          <div className="text-[10px] text-teal-600 font-medium mt-0.5">
            {showEndpoints ? '/albums/all' : 'Discographie'}
          </div>
        </button>

        <button
          onClick={() => onNavigate('manage_categories')}
          className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Catégories</span>
            <Tag size={14} className="text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{stats.categoriesCount || 4}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">
            {showEndpoints ? '/categorie/getAll' : 'Genres & styles'}
          </div>
        </button>

        <button
          onClick={() => onNavigate('manage_playlists')}
          className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Playlists</span>
            <ListPlus size={14} className="text-[#FF6B6B] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{stats.playlistsCount}</div>
          <div className="text-[10px] text-gray-400 font-medium mt-0.5">Publiques & Privées</div>
        </button>

        <button
          onClick={() => onNavigate('notification')}
          className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Diffusions</span>
            <BellRing size={14} className="text-[#FF8A00] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{stats.notificationsCount}</div>
          <div className="text-[10px] text-orange-600 font-medium mt-0.5">Notifications</div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION: STATISTIQUES & PERFORMANCES */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} className="text-[#FF8A00]" />
            <span>Performances & Statistiques</span>
          </h3>
          {showEndpoints && (
            <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              GET /stats/songWithMostLike & /stats/nbrTotalEcoute
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* CARD 1: Chanson la plus likée */}
          <div className="bg-gradient-to-br from-rose-500/10 via-pink-50 to-orange-50/40 p-4 rounded-2xl border border-rose-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-bold shadow-xs">
                  <Heart size={12} fill="currentColor" />
                  <span>Chanson la plus likée</span>
                </span>

                <button
                  onClick={fetchMostLiked}
                  disabled={loadingMostLiked}
                  className="p-1 px-2.5 rounded-lg bg-white/80 hover:bg-white text-gray-700 hover:text-rose-600 border border-rose-200 transition text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  title="Actualiser la chanson la plus populaire"
                >
                  <RefreshCw size={11} className={loadingMostLiked ? 'animate-spin' : ''} />
                  <span>{showEndpoints ? 'Tester /stats/songWithMostLike' : 'Actualiser'}</span>
                </button>
              </div>

              <div>
                {showEndpoints && (
                  <div className="text-[11px] font-mono text-gray-500">GET /stats/songWithMostLike</div>
                )}
                <h4 className="text-lg font-extrabold text-gray-900 mt-0.5 break-words">
                  {mostLiked.titre}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 shadow-xs flex items-center gap-1.5">
                    <Heart size={14} className="text-rose-600" fill="currentColor" />
                    <span className="text-xs font-bold text-rose-700">
                      {mostLiked.total_liked} Like{mostLiked.total_liked > 1 ? 's' : ''}
                    </span>
                  </div>
                  {mostLikedSuccess && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                      <CheckCircle size={12} /> À jour
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-rose-200/60 mt-3 flex items-center justify-between gap-2 relative z-10">
              {(() => {
                const matchedSong = songs.find(
                  (s) => s.titre.toLowerCase() === mostLiked.titre.toLowerCase() ||
                         s.titre.toLowerCase().includes(mostLiked.titre.toLowerCase())
                );
                return (
                  <>
                    <button
                      onClick={() => {
                        if (matchedSong && onPlaySong) {
                          onPlaySong(matchedSong);
                        } else if (songs[0] && onPlaySong) {
                          onPlaySong(songs[0]);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Play size={12} fill="white" />
                      <span>Écouter le titre</span>
                    </button>
                    <button
                      onClick={() => onNavigate('manage_songs')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-gray-800 text-xs font-semibold border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Voir au catalogue</span>
                      <ChevronRight size={13} />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          {/* CARD 2: Total d'écoutes par chanson */}
          <div className="bg-gradient-to-br from-purple-500/10 via-purple-50 to-indigo-50/40 p-4 rounded-2xl border border-purple-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-600 text-white text-[11px] font-bold shadow-xs">
                  <Headphones size={12} />
                  <span>Compteur d&apos;écoutes</span>
                </span>
                {showEndpoints && (
                  <span className="text-[11px] font-mono text-purple-700 bg-white px-2 py-0.5 rounded-lg border border-purple-200">
                    /stats/nbrTotalEcoute/{'{uuid}'}
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1.5 font-medium">
                  Nombre d&apos;écoutes cumulées pour un titre :
                </p>
                <div className="flex gap-2">
                  <select
                    value={selectedSongForPlays}
                    onChange={(e) => {
                      setSelectedSongForPlays(e.target.value);
                      handleTestPlays(e.target.value);
                    }}
                    className="flex-1 px-2.5 py-1.5 bg-white rounded-xl border border-purple-200 text-xs font-medium text-gray-900 outline-none focus:border-purple-500"
                  >
                    {songs.map((s) => (
                      <option key={s.trackingIdSong} value={s.trackingIdSong}>
                        {s.titre} - {s.artiste} {showEndpoints ? `(${s.trackingIdSong.slice(0, 8)}...)` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleTestPlays()}
                    disabled={loadingPlays}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
                  >
                    {loadingPlays ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                    <span>{showEndpoints ? 'Tester' : 'Consulter'}</span>
                  </button>
                </div>
              </div>

              {testedPlays ? (
                <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Écoutes confirmées :</span>
                    <span className="text-base font-extrabold text-purple-700 font-mono">
                      {testedPlays.count.toLocaleString()} écoutes
                    </span>
                  </div>
                  {showEndpoints && (
                    <div className="text-[10px] text-gray-400 font-mono truncate">
                      trackingIdSong: {testedPlays.trackingIdSong}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 bg-white/70 rounded-xl border border-purple-100 text-center text-xs text-gray-500">
                  {showEndpoints
                    ? 'Cliquez pour exécuter /stats/nbrTotalEcoute'
                    : 'Sélectionnez un titre pour vérifier ses écoutes'}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-purple-200/60 mt-2 flex items-center justify-between text-[11px] text-purple-800">
              <span className="font-semibold">Cumul catalogue :</span>
              <span className="font-bold font-mono">{stats.totalPlays.toLocaleString()} écoutes globales</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION: CATALOGUE COMPLET DES MORCEAUX (GRILLE 6 COLONNES & 2 LIGNES) */}
        {/* ======================================================== */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#6B4EFF] flex items-center justify-center">
                <Music size={14} />
              </div>
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Catalogue complet ({songs.length} morceaux)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:inline">
                Page {dashboardSongsPage} / {totalDashboardPages} (2 lignes / page)
              </span>
              <button
                onClick={() => onNavigate('manage_songs')}
                className="text-xs text-[#FF8A00] hover:text-orange-600 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>Gérer les morceaux</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {songs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-gray-150 dark:border-gray-800">
              <Music className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={28} />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Aucun morceau dans le catalogue</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {paginatedDashboardSongs.map((song) => (
                  <div
                    key={song.trackingIdSong}
                    className="bg-white dark:bg-[#111827] p-3 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-xs hover:border-orange-300 dark:hover:border-orange-500/40 hover:shadow-md transition text-left group relative flex flex-col justify-between"
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
                        onClick={() => onPlaySong && onPlaySong(song)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                        title="Écouter"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#FF8A00] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                          <Play size={18} fill="white" className="ml-0.5" />
                        </div>
                      </button>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white/90">
                        {song.duree || '3:20'}
                      </span>
                    </div>

                    {/* Main Title & Artist */}
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

                    {/* Bottom Metatag (Exactement le style coloré du screenshot) */}
                    <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 truncate">
                        <TrendingUp size={11} className="shrink-0 text-emerald-500" />
                        <span className="truncate">{(song.plays || 0).toLocaleString()} écoutes</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onPlaySong && onPlaySong(song)}
                        className="p-1 rounded-lg text-gray-400 hover:text-[#FF8A00] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition cursor-pointer"
                        title="Lire"
                      >
                        <Play size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls après 2 lignes */}
              {totalDashboardPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white dark:bg-[#111827] rounded-xl border border-gray-150 dark:border-gray-800 text-xs">
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                    Affichage de {(dashboardSongsPage - 1) * songsPerPage + 1} à{' '}
                    {Math.min(dashboardSongsPage * songsPerPage, songs.length)} sur {songs.length} morceaux
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDashboardSongsPage((p) => Math.max(1, p - 1))}
                      disabled={dashboardSongsPage === 1}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={12} />
                      <span>Précédent</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalDashboardPages }, (_, i) => i + 1).map((pNum) => (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => setDashboardSongsPage(pNum)}
                          className={`w-6 h-6 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center justify-center ${
                            dashboardSongsPage === pNum
                              ? 'bg-[#FF8A00] text-white shadow-xs'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {pNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDashboardSongsPage((p) => Math.min(totalDashboardPages, p + 1))}
                      disabled={dashboardSongsPage === totalDashboardPages}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Suivant</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SWAGGER ENDPOINTS COMPLETE GUIDE CHIPS (Hidden by default for simplicity!) */}
        {showEndpoints && (
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-600" />
                <span>Endpoints Swagger Opérationnels</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                Mode Développeur
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <button
                onClick={() => onNavigate('manage_songs')}
                className="p-2 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 transition text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-600 font-mono">PUT</span>
                  <ChevronRight size={12} className="text-gray-400 group-hover:text-orange-600" />
                </div>
                <p className="font-mono text-gray-800 font-semibold mt-0.5 truncate">/song/update</p>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">Modifier titre, audio, album...</p>
              </button>

              <button
                onClick={() => onNavigate('manage_songs')}
                className="p-2 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 font-mono">PUT</span>
                  <ChevronRight size={12} className="text-gray-400 group-hover:text-blue-600" />
                </div>
                <p className="font-mono text-gray-800 font-semibold mt-0.5 truncate">/song/updateAudio</p>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">MinIO multipart audio</p>
              </button>

              <button
                onClick={() => onNavigate('manage_albums')}
                className="p-2 rounded-xl bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 transition text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-600 font-mono">PUT</span>
                  <ChevronRight size={12} className="text-gray-400 group-hover:text-teal-600" />
                </div>
                <p className="font-mono text-gray-800 font-semibold mt-0.5 truncate">/albums/update</p>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">Titre, artiste & pochette</p>
              </button>

              <button
                onClick={() => onNavigate('manage_albums')}
                className="p-2 rounded-xl bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 transition text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-600 font-mono">PUT</span>
                  <ChevronRight size={12} className="text-gray-400 group-hover:text-teal-600" />
                </div>
                <p className="font-mono text-gray-800 font-semibold mt-0.5 truncate">/albums/updateImage</p>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">MinIO multipart image</p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION: ARTISTES DU LABEL ENREGISTRÉS */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#FF8A00]" />
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Artistes Enregistrés ({artists.length})
            </h3>
            {showEndpoints && (
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                GET /user/allArtist
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('register_artist')}
              className="px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF8A00] font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <UserCheck size={13} />
              <span>+ Nouvel Artiste</span>
            </button>
            <button
              onClick={() => onNavigate('manage_artists')}
              className="text-xs text-gray-500 hover:text-black font-medium transition flex items-center gap-1 cursor-pointer"
            >
              <span>Annuaire complet</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Grille des cartes artistes */}
        {artists.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
            <UserCheck size={28} className="text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">Aucun artiste enregistré pour le moment</p>
            <p className="text-xs text-gray-400">Inscrivez vos artistes pour leur rattacher leurs albums et leurs chansons.</p>
            <button
              onClick={() => onNavigate('register_artist')}
              className="mt-2 px-3 py-1.5 rounded-xl bg-[#FF8A00] text-white text-xs font-semibold hover:bg-orange-600 transition cursor-pointer"
            >
              + Inscrire un premier artiste
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {artists.map((artist) => (
              <div
                key={artist.trackingId || artist.alias}
                className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF8A00] to-[#FFB03A] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    {artist.alias ? artist.alias.charAt(0).toUpperCase() : (artist.firstName ? artist.firstName.charAt(0).toUpperCase() : 'A')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {artist.alias || `${artist.firstName} ${artist.lastName}`}
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        Actif
                      </span>
                    </div>
                    {(artist.firstName || artist.lastName) && (
                      <p className="text-xs text-gray-500 truncate">
                        {artist.firstName} {artist.lastName}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {artist.email || artist.phone || 'Pas de coordonnées'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md" title="Code d'accès">
                    <KeyRound size={11} className="text-[#FF8A00]" />
                    <span className="truncate max-w-[110px]">{artist.connectionCode || 'ART-KEY'}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('add_album')}
                    className="text-xs text-[#00BFA6] hover:text-teal-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Créer un album rattaché à cet artiste"
                  >
                    <Disc size={12} />
                    <span>Créer album</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 1: Ajouter du contenu */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-1">
          Ajouter du contenu
        </h3>

        {/* Card 0: Créer un artiste */}
        <div
          onClick={() => onNavigate('register_artist')}
          className="bg-white p-4 rounded-2xl border-2 border-orange-100 bg-gradient-to-r from-white via-white to-orange-50/50 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#FF8A00]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF8A00]/20 transition">
              <UserCheck className="text-[#FF8A00]" size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#FF8A00] transition">
                  Enregistrer un nouvel artiste
                </h4>
                {showEndpoints && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-100 text-[#FF8A00]">
                    /user/registerArtist
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Nom, alias, coordonnées et génération automatique du code de connexion
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>

        {/* Card 1: Créer un album */}
        <div
          onClick={() => onNavigate('add_album')}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#00BFA6]/10 flex items-center justify-center shrink-0 group-hover:bg-[#00BFA6]/15 transition">
              <Disc className="text-[#00BFA6]" size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#00BFA6] transition">
                  Créer un album
                </h4>
                {showEndpoints && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-50 text-[#00BFA6]">
                    /albums/create
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Titre, rattachement à un artiste et pochette officielle
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>

        {/* Card 1.5: Créer une catégorie */}
        <div
          onClick={() => onNavigate('manage_categories')}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/15 transition">
              <Tag className="text-amber-600" size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-amber-600 transition">
                  Créer une catégorie ou genre
                </h4>
                {showEndpoints && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    /categorie/create
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Classification des morceaux par genre, ambiance ou thématique
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>

        {/* Card 2: Ajouter une chanson */}
        <div
          onClick={() => onNavigate('add_song')}
          className="bg-white p-4 rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-white via-white to-orange-50/50 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#6B4EFF]/10 flex items-center justify-center shrink-0 group-hover:bg-[#6B4EFF]/20 transition">
              <Music className="text-[#6B4EFF]" size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#6B4EFF] transition">
                  Ajouter un morceau de musique
                </h4>
                {showEndpoints && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                    /song/create
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Titre, audio, choix de l&apos;album et attribution de la catégorie
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>

        {/* Card 3: Créer une playlist */}
        <div
          onClick={() => onNavigate('add_playlist')}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B6B]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF6B6B]/15 transition">
              <ListPlus className="text-[#FF6B6B]" size={24} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#FF6B6B] transition">
                Créer une playlist
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Titre, visibilité (publique/privée) et sélection des titres</p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>
      </div>

      {/* Section 2: Communication */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-1">
          Communication & Notifications
        </h3>

        {/* Card 4: Envoyer une notification */}
        <div
          onClick={() => onNavigate('notification')}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#FF8A00]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF8A00]/15 transition">
              <BellRing className="text-[#FF8A00]" size={24} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#FF8A00] transition">
                Diffuser une annonce aux abonnés
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Notification instantanée pour une sortie de titre ou d&apos;album</p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>
      </div>

      {/* Section 2.5: Gestion des accès Premium VIP / Gratuit (Nouveau / Ancien) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Monétisation & Règles d&apos;Accès (1er Gratuit 🆓 • Reste VIP 🔒)
            </h3>
            <span className="text-[10px] bg-orange-100 text-[#FF8A00] font-bold px-2 py-0.5 rounded-full">
              Nouveau
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => onNavigate('album_access_manager')}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 transition text-xl">
                🎵
              </div>
              <div className="min-w-0">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-teal-600 transition truncate">
                  Accès Albums (Gratuit & VIP)
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  1er album gratuit par artiste • Verrouillage des suivants • Forcer / Reset
                </p>
              </div>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
          </div>

          <div
            onClick={() => onNavigate('song_access_manager')}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition text-xl">
                🎤
              </div>
              <div className="min-w-0">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-indigo-600 transition truncate">
                  Accès Morceaux (Gratuit & VIP)
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  1er titre gratuit par artiste • Morceaux premium • Écoute directe
                </p>
              </div>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
          </div>
        </div>
      </div>

      {/* Section 3: Gestion & Exploration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Gestion du catalogue
          </h3>
          {showEndpoints && (
            <span className="text-[11px] text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 flex items-center gap-1">
              <Sparkles size={11} /> 15 endpoints connectés
            </span>
          )}
        </div>

        {/* Card: Catégories & Genres */}
        <div
          onClick={() => onNavigate('manage_categories')}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/15 transition">
              <Tag className="text-amber-600" size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-amber-600 transition">
                  Catégories & Styles musicaux ({stats.categoriesCount || 4})
                </h4>
                {showEndpoints && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    /categorie/getAll
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Consulter et organiser les genres musicaux disponibles
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>

        {/* Card 4.5: Annuaire des Artistes */}
        <div
          onClick={() => onNavigate('manage_artists')}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/15 transition">
              <Users className="text-[#FF8A00]" size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#FF8A00] transition">
                  Annuaire des Artistes & Accès ({stats.artistsCount !== undefined ? stats.artistsCount : artists.length})
                </h4>
                {showEndpoints && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-[#FF8A00] border border-orange-200">
                    Swagger User
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Consulter les artistes inscrits, profils et codes de connexion
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>

        {/* Card 4.8: Gérer les albums */}
        <div
          onClick={() => onNavigate('manage_albums')}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 group-hover:bg-teal-500/15 transition">
              <Disc className="text-[#00BFA6]" size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#00BFA6] transition">
                  Albums & Discographies ({stats.albumsCount})
                </h4>
                {showEndpoints && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-50 text-[#00BFA6]">
                    /albums/all
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Modifier les albums, changer la pochette ou supprimer un album
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>

        {/* Card 5: Gérer les chansons */}
        <div
          onClick={() => onNavigate('manage_songs')}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/15 transition">
              <Layers className="text-blue-600" size={24} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-blue-600 transition">
                Catalogue des Chansons ({stats.songsCount})
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Écouter, modifier le titre, remplacer le fichier audio ou supprimer
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>

        {/* Card 6: Gérer les playlists */}
        <div
          onClick={() => onNavigate('manage_playlists')}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/15 transition">
              <ListPlus className="text-purple-600" size={24} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-purple-600 transition">
                Gestion des Playlists ({stats.playlistsCount})
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Modifier la visibilité, ajouter et retirer des titres
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
        </div>

        {/* Card 7: Console API (Only visible in Developer mode) */}
        {showEndpoints && (
          <div
            onClick={() => onNavigate('api_console')}
            className="bg-white p-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-white via-white to-orange-50/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99] animate-in fade-in"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#FF8A00]/15 flex items-center justify-center shrink-0 group-hover:bg-[#FF8A00]/25 transition">
                <Terminal className="text-[#FF8A00]" size={24} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#FF8A00] transition flex items-center gap-2">
                  Console API REST
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-[#FF8A00]">
                    Swagger Live
                  </span>
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Exécuter & tester directement les requêtes HTTP
                </p>
              </div>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition shrink-0" size={18} />
          </div>
        )}
      </div>
    </div>
  );
};
