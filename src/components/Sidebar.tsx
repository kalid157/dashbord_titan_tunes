import React from 'react';
import {
  LayoutDashboard,
  Music,
  Disc,
  UserCheck,
  Tag,
  ListMusic,
  BellRing,
  PlusCircle,
  Code2,
  Terminal,
  Radio,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { AdminRoute, DashboardStats, BackendConfig } from '../types';

interface SidebarProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  stats: DashboardStats;
  backendConfig: BackendConfig;
  onOpenSwaggerSettings: () => void;
  showEndpoints: boolean;
  onToggleShowEndpoints: (val: boolean) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: (val: boolean) => void;
  isMobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  stats,
  backendConfig,
  onOpenSwaggerSettings,
  showEndpoints,
  onToggleShowEndpoints,
  isMobileFrame,
  onToggleMobileFrame,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
  theme,
  onToggleTheme,
}) => {
  const mainNavItems = [
    {
      route: 'dashboard' as AdminRoute,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      count: undefined,
      color: 'text-orange-500',
    },
    {
      route: 'manage_songs' as AdminRoute,
      label: 'Morceaux',
      icon: Music,
      count: stats.songsCount,
      color: 'text-indigo-500',
    },
    {
      route: 'manage_albums' as AdminRoute,
      label: 'Albums',
      icon: Disc,
      count: stats.albumsCount,
      color: 'text-teal-500',
    },
    {
      route: 'manage_artists' as AdminRoute,
      label: 'Artistes',
      icon: UserCheck,
      count: stats.artistsCount,
      color: 'text-amber-500',
    },
    {
      route: 'manage_categories' as AdminRoute,
      label: 'Catégories',
      icon: Tag,
      count: stats.categoriesCount,
      color: 'text-rose-500',
    },
    {
      route: 'manage_playlists' as AdminRoute,
      label: 'Playlists',
      icon: ListMusic,
      count: stats.playlistsCount,
      color: 'text-blue-500',
    },
    {
      route: 'notification' as AdminRoute,
      label: 'Diffusions',
      icon: BellRing,
      count: stats.notificationsCount,
      color: 'text-orange-500',
    },
  ];

  const quickActions = [
    {
      route: 'add_song' as AdminRoute,
      label: 'Nouveau morceau',
      color: 'hover:text-indigo-600 hover:bg-indigo-50',
    },
    {
      route: 'add_album' as AdminRoute,
      label: 'Nouvel album',
      color: 'hover:text-teal-600 hover:bg-teal-50',
    },
    {
      route: 'register_artist' as AdminRoute,
      label: 'Enregistrer artiste',
      color: 'hover:text-amber-600 hover:bg-amber-50',
    },
  ];

  const handleItemClick = (route: AdminRoute) => {
    onNavigate(route);
    onCloseMobileDrawer();
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div
          onClick={() => handleItemClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF8A00] to-[#E8A23F] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Music size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-gray-900 text-sm">
                TITAN TUNES
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-[#FF8A00] px-1.5 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium truncate">
              Studio & Catalogue
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobileDrawer}
          className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Navigation
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleItemClick(item.route)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={17}
                      className={isActive ? 'text-white' : item.color}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Creation Actions */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Actions rapides</span>
            <PlusCircle size={12} className="text-gray-400" />
          </div>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.route}
                onClick={() => handleItemClick(action.route)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-600 transition flex items-center justify-between cursor-pointer ${action.color}`}
              >
                <span className="truncate">{action.label}</span>
                <ChevronRight size={13} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Access & Monetization Control */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Accès & Monétisation</span>
            <span className="text-[9px] bg-orange-100 text-[#FF8A00] font-bold px-1.5 py-0.2 rounded-md">
              1er gratuit
            </span>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleItemClick('album_access_manager')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                currentRoute === 'album_access_manager'
                  ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200'
                  : 'text-gray-700 hover:text-teal-700 hover:bg-teal-50/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span>🎵</span>
                <span className="truncate">Accès Albums (VIP/Gratuit)</span>
              </div>
              <ChevronRight size={13} className="text-gray-300 shrink-0" />
            </button>
            <button
              onClick={() => handleItemClick('song_access_manager')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                currentRoute === 'song_access_manager'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                  : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span>🎤</span>
                <span className="truncate">Accès Songs (VIP/Gratuit)</span>
              </div>
              <ChevronRight size={13} className="text-gray-300 shrink-0" />
            </button>
          </div>
        </div>

        {/* Ease-of-Use & Developer Settings */}
        <div className="pt-2 border-t border-gray-100">
          <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Affichage & Options
          </div>

          {/* Theme Dark / Light Switch */}
          <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 mb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon size={15} className="text-amber-400" />
                ) : (
                  <Sun size={15} className="text-orange-500" />
                )}
                <div>
                  <div className="text-xs font-semibold text-gray-800">
                    {theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {theme === 'dark' ? 'Thème nuit activé' : 'Thème jour actif'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 hover:text-black hover:border-gray-300 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={12} className="text-amber-400" />
                    <span>Clair</span>
                  </>
                ) : (
                  <>
                    <Moon size={12} className="text-gray-500" />
                    <span>Sombre</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Toggle Endpoints switch */}
          <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {showEndpoints ? (
                  <Eye size={15} className="text-[#FF8A00]" />
                ) : (
                  <EyeOff size={15} className="text-gray-400" />
                )}
                <div>
                  <div className="text-xs font-semibold text-gray-800">
                    Mode Développeur
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {showEndpoints ? 'Endpoints API visibles' : 'Endpoints masqués'}
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEndpoints}
                  onChange={(e) => onToggleShowEndpoints(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#FF8A00]" />
              </label>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              {showEndpoints
                ? 'Les chemins techniques Swagger (/song, /albums...) sont affichés.'
                : 'Interface simplifiée : les termes techniques et endpoints sont masqués pour une utilisation facile.'}
            </p>
          </div>

          {/* Device Mockup Toggle */}
          <div className="mt-2.5 flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs">
            <span className="text-gray-600 font-medium flex items-center gap-1.5 text-[11px]">
              {isMobileFrame ? (
                <Smartphone size={14} className="text-orange-500" />
              ) : (
                <Monitor size={14} className="text-gray-500" />
              )}
              {isMobileFrame ? 'Cadre Mobile Flutter' : 'Plein écran Web'}
            </span>
            <button
              onClick={() => onToggleMobileFrame(!isMobileFrame)}
              className="text-[11px] font-semibold text-[#FF8A00] hover:underline"
            >
              Changer
            </button>
          </div>
        </div>

        {/* Technical Console & Swagger links (Discreet) */}
        {showEndpoints && (
          <div className="space-y-1 animate-in fade-in duration-150">
            <div className="px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Développeur & API
            </div>
            <button
              onClick={() => handleItemClick('api_console')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer ${
                currentRoute === 'api_console'
                  ? 'bg-orange-100 text-orange-900 font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-orange-500" />
                <span>Console API</span>
              </div>
              <ChevronRight size={12} className="text-gray-400" />
            </button>
            <button
              onClick={() => handleItemClick('swagger_view')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer ${
                currentRoute === 'swagger_view'
                  ? 'bg-lime-100 text-lime-900 font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-lime-600" />
                <span>Swagger Render</span>
              </div>
              <ChevronRight size={12} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Backend Status Ribbon (Clean & Unobtrusive) */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/60">
        <div
          onClick={onOpenSwaggerSettings}
          className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200/80 shadow-2xs hover:border-orange-200 cursor-pointer transition text-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                backendConfig.isConnected
                  ? 'bg-emerald-500 ring-2 ring-emerald-200 animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <div className="min-w-0">
              <div className="font-semibold text-gray-800 text-[11px] truncate">
                {backendConfig.isConnected ? 'Serveur Render connecté' : 'Mode local autonome'}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                {showEndpoints ? (backendConfig.swaggerUrl || 'Render (Cloud)') : 'Prêt à l\'emploi'}
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 h-screen sticky top-0 z-30 flex-col shadow-sm">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileDrawer}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
