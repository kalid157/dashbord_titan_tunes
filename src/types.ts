export interface Category {
  trackingId: string;
  nomCategorie: string;
  createdAt?: string;
}

export interface Song {
  trackingIdSong: string;
  trackingId?: string;
  titre: string;
  artiste: string;
  audio: string;
  albumTrackingId?: string;
  categorieTrackingId?: string;
  nomCategorie?: string;
  imageAlbum?: string;
  duree?: string;
  genre?: string;
  albumId?: string;
  createdAt?: string;
  plays?: number;
  likes?: number;
  total_liked?: number;
}

export interface Playlist {
  trackingIdPlaylist: string;
  titre: string;
  imageAlbum: string;
  clientTrackingId: string;
  visibilite: boolean; // true = public, false = private
  songs: Song[];
  createdAt?: string;
}

export interface Album {
  trackingIdAlbum: string;
  trackingId?: string;
  titreAlbum: string;
  artisteTrackingId?: string;
  nomArtiste?: string;
  imageAlbum: string;
  genre?: string;
  annee?: number;
  songs?: Song[];
  createdAt?: string;
}

export interface Artist {
  trackingId: string; // or artisteTrackingId / trackingIdUser
  firstName: string;
  lastName: string;
  alias: string;
  phone: string;
  email: string;
  password?: string;
  description: string;
  connectionCode: string; // Code pour se connecter généré
  token?: string;
  createdAt: string;
  rawResponse?: Record<string, unknown>;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  image?: string;
  sentAt: string;
  targetAudience: string;
}

export interface MostLikedSong {
  titre: string;
  total_liked: number;
}

export interface SongPlaysStat {
  trackingIdSong: string;
  nbrTotalEcoute: number;
}

export interface DashboardStats {
  songsCount: number;
  playlistsCount: number;
  albumsCount: number;
  artistsCount?: number;
  categoriesCount?: number;
  notificationsCount: number;
  totalPlays: number;
  mostLikedSong?: MostLikedSong;
}

export interface BackendConfig {
  targetUrl: string;
  swaggerUrl: string;
  isConnected: boolean;
  mode: 'proxy_with_fallback' | 'proxy_strict' | 'browser_direct' | 'mock';
  latency?: number;
  lastChecked?: string;
  errorMessage?: string;
}

export type AdminRoute =
  | 'dashboard'
  | 'add_song'
  | 'add_album'
  | 'add_playlist'
  | 'register_artist'
  | 'manage_artists'
  | 'manage_categories'
  | 'add_category'
  | 'notification'
  | 'manage_songs'
  | 'manage_playlists'
  | 'manage_albums'
  | 'api_console'
  | 'swagger_view';


