/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Monitor,
  Music,
  Bell,
  RefreshCw,
  Terminal,
  Radio,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Menu,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from 'lucide-react';
import { api } from './services/api';
import { Song, Playlist, Album, Artist, Category, AppNotification, DashboardStats, AdminRoute, BackendConfig } from './types';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/AdminDashboard';
import { AddSongPage } from './components/AddSongPage';
import { AddAlbumPage } from './components/AddAlbumPage';
import { AddPlaylistPage } from './components/AddPlaylistPage';
import { RegisterArtistPage } from './components/RegisterArtistPage';
import { ArtistsListPage } from './components/ArtistsListPage';
import { CategoriesManagerPage } from './components/CategoriesManagerPage';
import { SendNotificationPage } from './components/SendNotificationPage';
import { SongsManagerPage } from './components/SongsManagerPage';
import { PlaylistsManagerPage } from './components/PlaylistsManagerPage';
import { AlbumsManagerPage } from './components/AlbumsManagerPage';
import { ApiConsolePage } from './components/ApiConsolePage';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { SwaggerConnectModal } from './components/SwaggerConnectModal';
import { SwaggerViewerPage } from './components/SwaggerViewerPage';
import { AlbumManager } from './pages/AlbumManager';
import { SongManager } from './pages/SongManager';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AdminRoute>('dashboard');
  const [routeHistory, setRouteHistory] = useState<AdminRoute[]>(['dashboard']);
  const [showEndpoints, setShowEndpoints] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Dark / Light Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('titan_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('titan_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Data states
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedArtistForAlbum, setSelectedArtistForAlbum] = useState<string | undefined>(undefined);
  const [selectedAlbumForSong, setSelectedAlbumForSong] = useState<string | undefined>(undefined);
  const [selectedCategoryForSong, setSelectedCategoryForSong] = useState<string | undefined>(undefined);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    songsCount: 0,
    playlistsCount: 0,
    albumsCount: 0,
    artistsCount: 0,
    categoriesCount: 0,
    notificationsCount: 0,
    totalPlays: 0,
  });

  // Swagger Backend state (Directly active by default for Render)
  const [backendConfig, setBackendConfig] = useState<BackendConfig>({
    targetUrl: 'https://titan-tune-reset.onrender.com',
    swaggerUrl: 'https://titan-tune-reset.onrender.com/swagger-ui/index.html',
    isConnected: true,
    mode: 'proxy_with_fallback',
  });
  const [isSwaggerModalOpen, setIsSwaggerModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [currentPlayingSong, setCurrentPlayingSong] = useState<Song | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type?: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const loadAllData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        api.getAllSongs(),
        api.getAllPlaylists(),
        api.getAllAlbums(),
        api.getAllArtists(),
        api.getAllCategories(),
        api.getAllNotifications(),
        api.getStats(),
        api.getBackendStatus(),
      ]);

      const songsData = results[0].status === 'fulfilled' ? results[0].value : [];
      const playlistsData = results[1].status === 'fulfilled' ? results[1].value : [];
      const albumsData = results[2].status === 'fulfilled' ? results[2].value : [];
      const artistsData = results[3].status === 'fulfilled' ? results[3].value : [];
      const categoriesData = results[4].status === 'fulfilled' ? results[4].value : [];
      const notifsData = results[5].status === 'fulfilled' ? results[5].value : [];
      const statsData = results[6].status === 'fulfilled' ? results[6].value : null;
      const bStatus = results[7].status === 'fulfilled' ? results[7].value : null;

      // Enrich albums with their songs based on albumTrackingId
      const enrichedAlbums = albumsData.map((album) => {
        const albumId = album.trackingId || album.trackingIdAlbum;
        const matchedSongs = songsData.filter(
          (s) =>
            s.albumTrackingId &&
            (s.albumTrackingId === albumId ||
              s.albumTrackingId === album.trackingId ||
              s.albumTrackingId === album.trackingIdAlbum)
        );
        return {
          ...album,
          songs: matchedSongs.length > 0 ? matchedSongs : album.songs || [],
        };
      });

      if (songsData && songsData.length > 0) setSongs(songsData);
      if (playlistsData && playlistsData.length > 0) setPlaylists(playlistsData);
      if (enrichedAlbums && enrichedAlbums.length > 0) setAlbums(enrichedAlbums);
      if (artistsData && artistsData.length > 0) setArtists(artistsData);
      if (categoriesData && categoriesData.length > 0) setCategories(categoriesData);
      if (notifsData && notifsData.length > 0) setNotifications(notifsData);

      if (bStatus) {
        setBackendConfig(bStatus);
      } else {
        // Fallback status probe
        api.getBackendStatus().then(setBackendConfig).catch(() => {});
      }

      setStats({
        ...(statsData || {}),
        songsCount: songsData.length,
        playlistsCount: playlistsData.length,
        albumsCount: albumsData.length,
        artistsCount: artistsData.length,
        categoriesCount: categoriesData.length,
        notificationsCount: notifsData.length,
        totalPlays: statsData?.totalPlays || 52300,
      });
    } catch (err) {
      console.error('Erreur chargement données', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('backend_target_url');
    if (saved && saved.includes('localhost:8081')) {
      localStorage.setItem('backend_target_url', 'https://titan-tune-reset.onrender.com');
    }
    loadAllData();
  }, [loadAllData]);

  // Navigation handlers (mimicking GoRouter context.push/pop)
  const navigateTo = (route: AdminRoute) => {
    setRouteHistory((prev) => [...prev, route]);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    if (routeHistory.length > 1) {
      const newHistory = [...routeHistory];
      newHistory.pop();
      const prevRoute = newHistory[newHistory.length - 1] || 'dashboard';
      setRouteHistory(newHistory);
      setCurrentRoute(prevRoute);
    } else {
      setCurrentRoute('dashboard');
    }
  };

  // Content mutation listeners
  const handleSongAdded = (song: Song) => {
    setSongs((prev) => [song, ...prev]);
    showToast(`Chanson "${song.titre}" ajoutée ✅`);
    loadAllData();
  };

  const handleAlbumAdded = (album: Album) => {
    setAlbums((prev) => [album, ...prev]);
    showToast(`Album "${album.titreAlbum}" créé ✅`);
    loadAllData();
  };

  const handlePlaylistAdded = (playlist: Playlist) => {
    setPlaylists((prev) => [playlist, ...prev]);
    showToast(`Playlist "${playlist.titre}" créée ✅`);
    loadAllData();
  };

  const handleNotificationSent = (notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Notification diffusée aux abonnés 🚀`);
    loadAllData();
  };

  const handleSongDeleted = (trackingIdSong: string) => {
    setSongs((prev) => prev.filter((s) => s.trackingIdSong !== trackingIdSong));
    showToast('Chanson supprimée avec succès');
    loadAllData();
  };

  const handleSongUpdated = (updated: Song) => {
    setSongs((prev) =>
      prev.map((s) => (s.trackingIdSong === updated.trackingIdSong ? updated : s))
    );
    showToast('Chanson mise à jour avec succès');
    loadAllData();
  };

  const handlePlaylistUpdated = (updated: Playlist) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.trackingIdPlaylist === updated.trackingIdPlaylist ? updated : p))
    );
    showToast('Playlist mise à jour avec succès');
  };

  const handleArtistCreated = (artist: Artist) => {
    setArtists((prev) => [artist, ...prev]);
    showToast(`Artiste "${artist.alias}" créé ! Code: ${artist.connectionCode} 🔑`);
    loadAllData();
  };

  const handleAlbumDeleted = (trackingId: string) => {
    setAlbums((prev) => prev.filter((a) => a.trackingId !== trackingId && a.trackingIdAlbum !== trackingId));
    showToast('Album supprimé avec succès ✅');
    loadAllData();
  };

  // Render current view
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'register_artist':
        return (
          <RegisterArtistPage
            onBack={navigateBack}
            onArtistCreated={handleArtistCreated}
            onNavigateToCreateAlbum={(artistTrackingId) => {
              setSelectedArtistForAlbum(artistTrackingId);
              navigateTo('add_album');
            }}
            onNavigateToArtistsList={() => navigateTo('manage_artists')}
            backendConfig={backendConfig}
          />
        );
      case 'manage_artists':
        return (
          <ArtistsListPage
            onBack={navigateBack}
            artists={artists}
            onRefreshArtists={loadAllData}
            onNavigateToRegisterArtist={() => navigateTo('register_artist')}
            onNavigateToCreateAlbumWithArtist={(artistTrackingId) => {
              setSelectedArtistForAlbum(artistTrackingId);
              navigateTo('add_album');
            }}
          />
        );
      case 'add_song':
        return (
          <AddSongPage
            onBack={navigateBack}
            onSongAdded={handleSongAdded}
            onPlaySong={(s) => setCurrentPlayingSong(s)}
            albums={albums}
            categories={categories}
            initialAlbumTrackingId={selectedAlbumForSong}
            initialCategorieTrackingId={selectedCategoryForSong}
            onNavigateToAddAlbum={() => {
              setSelectedArtistForAlbum(undefined);
              navigateTo('add_album');
            }}
            onNavigateToCategories={() => navigateTo('manage_categories')}
            onRefreshCategories={loadAllData}
            backendConfig={backendConfig}
            showEndpoints={showEndpoints}
          />
        );
      case 'manage_categories':
      case 'add_category':
        return (
          <CategoriesManagerPage
            onBack={navigateBack}
            categories={categories}
            onRefreshCategories={loadAllData}
            onNavigateAddSongWithCategory={(catId) => {
              setSelectedCategoryForSong(catId);
              navigateTo('add_song');
            }}
            backendConfig={backendConfig}
            showEndpoints={showEndpoints}
          />
        );
      case 'add_album':
        return (
          <AddAlbumPage
            onBack={navigateBack}
            onAlbumAdded={handleAlbumAdded}
            artists={artists}
            initialArtisteTrackingId={selectedArtistForAlbum}
            onNavigateToRegisterArtist={() => navigateTo('register_artist')}
            backendConfig={backendConfig}
            onOpenConnectModal={() => setIsSwaggerModalOpen(true)}
            showEndpoints={showEndpoints}
          />
        );
      case 'add_playlist':
        return (
          <AddPlaylistPage
            onBack={navigateBack}
            onPlaylistAdded={handlePlaylistAdded}
            availableSongs={songs}
          />
        );
      case 'notification':
        return (
          <SendNotificationPage
            onBack={navigateBack}
            onNotificationSent={handleNotificationSent}
            recentNotifications={notifications}
          />
        );
      case 'manage_songs':
        return (
          <SongsManagerPage
            onBack={navigateBack}
            onNavigateAddSong={() => {
              setSelectedAlbumForSong(undefined);
              setSelectedCategoryForSong(undefined);
              navigateTo('add_song');
            }}
            onNavigateToAccessManager={() => navigateTo('song_access_manager')}
            songs={songs}
            albums={albums}
            categories={categories}
            onPlaySong={(s) => setCurrentPlayingSong(s)}
            onSongDeleted={handleSongDeleted}
            onSongUpdated={handleSongUpdated}
            showEndpoints={showEndpoints}
          />
        );
      case 'manage_playlists':
        return (
          <PlaylistsManagerPage
            onBack={navigateBack}
            onNavigateAddPlaylist={() => navigateTo('add_playlist')}
            playlists={playlists}
            availableSongs={songs}
            onPlaySong={(s) => setCurrentPlayingSong(s)}
            onPlaylistUpdated={handlePlaylistUpdated}
            onPlaylistsReload={loadAllData}
          />
        );
      case 'manage_albums':
        return (
          <AlbumsManagerPage
            onBack={navigateBack}
            onNavigateAddAlbum={() => {
              setSelectedArtistForAlbum(undefined);
              navigateTo('add_album');
            }}
            onNavigateToAccessManager={() => navigateTo('album_access_manager')}
            albums={albums}
            songs={songs}
            artists={artists}
            onPlaySong={(s) => setCurrentPlayingSong(s)}
            onAlbumDeleted={handleAlbumDeleted}
            onAlbumUpdated={(updated) => {
              setAlbums((prev) =>
                prev.map((a) =>
                  a.trackingId === updated.trackingId || a.trackingIdAlbum === updated.trackingIdAlbum
                    ? updated
                    : a
                )
              );
              showToast(`Album "${updated.titreAlbum}" mis à jour ✅`);
              loadAllData();
            }}
            onNavigateAddSongToAlbum={(albId) => {
              setSelectedAlbumForSong(albId);
              navigateTo('add_song');
            }}
            showEndpoints={showEndpoints}
          />
        );
      case 'album_access_manager':
        return (
          <AlbumManager
            onBack={navigateBack}
            onRefreshGlobal={loadAllData}
          />
        );
      case 'song_access_manager':
        return (
          <SongManager
            onBack={navigateBack}
            onPlaySong={(s) => setCurrentPlayingSong(s)}
            onRefreshGlobal={loadAllData}
          />
        );
      case 'api_console':
        return (
          <ApiConsolePage
            onBack={navigateBack}
            songs={songs}
            playlists={playlists}
            onDataMutated={loadAllData}
          />
        );
      case 'swagger_view':
        return (
          <SwaggerViewerPage
            onBack={navigateBack}
            config={backendConfig}
            onOpenConnectModal={() => setIsSwaggerModalOpen(true)}
            onConfigUpdated={(cfg) => setBackendConfig(cfg)}
          />
        );
      case 'dashboard':
      default:
        return (
          <AdminDashboard
            onNavigate={navigateTo}
            stats={stats}
            backendConfig={backendConfig}
            onOpenSwaggerSettings={() => setIsSwaggerModalOpen(true)}
            songs={songs}
            artists={artists}
            onPlaySong={(s) => setCurrentPlayingSong(s)}
            showEndpoints={showEndpoints}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex font-sans selection:bg-[#FF8A00]/20 selection:text-black">
      {/* Left Sidebar Layout */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        stats={stats}
        backendConfig={backendConfig}
        onOpenSwaggerSettings={() => setIsSwaggerModalOpen(true)}
        showEndpoints={showEndpoints}
        onToggleShowEndpoints={setShowEndpoints}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={setIsMobileFrame}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-2xs px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 w-full">
            {/* Mobile Drawer Trigger & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer"
                title="Ouvrir le menu latéral"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm md:text-base text-gray-900 tracking-tight">
                    {currentRoute === 'dashboard' ? 'Tableau de bord' :
                     currentRoute === 'manage_songs' ? 'Catalogue des Morceaux' :
                     currentRoute === 'manage_albums' ? 'Discographies & Albums' :
                     currentRoute === 'manage_artists' ? 'Artistes' :
                     currentRoute === 'manage_categories' ? 'Catégories & Genres' :
                     currentRoute === 'manage_playlists' ? 'Gestion des Playlists' :
                     currentRoute === 'notification' ? 'Diffusions & Notifications' :
                     currentRoute === 'add_song' ? 'Ajouter un morceau' :
                     currentRoute === 'add_album' ? 'Créer un album' :
                     currentRoute === 'register_artist' ? 'Enregistrer un artiste' :
                     currentRoute === 'api_console' ? 'Console API' : 'Swagger OpenAPI'}
                  </h1>

                  {!showEndpoints && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Interface Facile
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Header Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Dev Mode / Endpoint Visibility Switcher */}
              <button
                onClick={() => setShowEndpoints(!showEndpoints)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border cursor-pointer ${
                  showEndpoints
                    ? 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
                title={showEndpoints ? 'Masquer les endpoints techniques pour simplifier' : 'Afficher les endpoints techniques de développement'}
              >
                {showEndpoints ? (
                  <>
                    <Eye size={13} className="text-[#FF8A00]" />
                    <span className="hidden sm:inline">Endpoints API</span>
                    <span className="text-[10px] font-bold text-orange-600">ON</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={13} className="text-gray-400" />
                    <span className="hidden sm:inline">Endpoints masqués</span>
                  </>
                )}
              </button>

              {/* Dark / Light Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs text-xs font-semibold text-gray-700 hover:text-black"
                title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={14} className="text-amber-400" />
                    <span className="hidden sm:inline">Clair</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-gray-600" />
                    <span className="hidden sm:inline">Sombre</span>
                  </>
                )}
              </button>

              {/* Quick Swagger Status Pill Button */}
              <button
                onClick={() => setIsSwaggerModalOpen(true)}
                className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-semibold transition flex items-center gap-1.5 border cursor-pointer ${
                  backendConfig.isConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
                title="Liaison Swagger (https://titan-tune-reset.onrender.com)"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="hidden sm:inline">Backend</span>
                <span>{backendConfig.isConnected ? 'Render' : 'En attente'}</span>
              </button>

              <button
                onClick={loadAllData}
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition cursor-pointer"
                title="Actualiser les données"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>

              {/* Flutter Smartphone Mockup toggle */}
              <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs">
                <button
                  onClick={() => setIsMobileFrame(false)}
                  className={`p-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    !isMobileFrame
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'text-gray-500 hover:text-black'
                  }`}
                  title="Vue Plein Écran Web"
                >
                  <Monitor size={15} />
                </button>
                <button
                  onClick={() => setIsMobileFrame(true)}
                  className={`p-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    isMobileFrame
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'text-gray-500 hover:text-black'
                  }`}
                  title="Aperçu Mobile Flutter (Cadre Téléphone)"
                >
                  <Smartphone size={15} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col justify-start">
          {isMobileFrame ? (
            /* Phone Frame simulator */
            <div className="flex justify-center py-4">
              <div className="w-full max-w-[420px] bg-white rounded-[40px] shadow-2xl border-[10px] border-gray-900 overflow-hidden relative flex flex-col min-h-[720px] max-h-[880px]">
                {/* Dynamic Island / Speaker notch */}
                <div className="bg-gray-900 h-6 w-full flex items-center justify-center relative shrink-0">
                  <div className="w-24 h-4 bg-black rounded-full" />
                </div>

                {/* Status bar */}
                <div className="px-6 py-1 flex items-center justify-between text-[11px] font-semibold text-gray-600 shrink-0">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5">
                    <Radio size={10} className="text-emerald-500" />
                    <span>5G</span>
                    <div className="w-4 h-2 border border-gray-500 rounded-xs p-0.5">
                      <div className="w-full h-full bg-black rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Phone Content viewport */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#F8F9FA]">
                  {renderCurrentPage()}
                </div>

                {/* Home indicator bar */}
                <div className="bg-white py-1.5 flex justify-center shrink-0">
                  <div className="w-32 h-1 bg-gray-400 rounded-full" />
                </div>
              </div>
            </div>
          ) : (
            /* Standard Responsive Layout */
            <div className="w-full">{renderCurrentPage()}</div>
          )}
        </main>

        {/* Persistent Audio Player Bar avec enchaînement continu, aléatoire et boucle */}
        <AudioPlayerBar
          currentSong={currentPlayingSong}
          songs={songs}
          onSelectSong={(song) => setCurrentPlayingSong(song)}
          onClose={() => setCurrentPlayingSong(null)}
        />
      </div>

      {/* Toast Floating Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Swagger Connect & Settings Modal */}
      <SwaggerConnectModal
        isOpen={isSwaggerModalOpen}
        onClose={() => setIsSwaggerModalOpen(false)}
        config={backendConfig}
        onConfigUpdated={(cfg) => setBackendConfig(cfg)}
        onRefreshData={loadAllData}
      />
    </div>
  );
}

