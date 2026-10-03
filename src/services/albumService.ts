import { API_BASE_URL } from '../config/api';
import { Album } from '../types';

export const albumService = {
  /** Récupère tous les albums avec statut calculé */
  async getAll(): Promise<Album[]> {
    const res = await fetch(`${API_BASE_URL}/albums/all`);
    if (!res.ok) throw new Error('Impossible de charger les albums');
    const data = await res.json();
    const list: Album[] = Array.isArray(data) ? data : data.albums || [];
    return list.map((a: any, idx: number) => ({
      ...a,
      trackingId: a.trackingId || a.trackingIdAlbum || '',
      trackingIdAlbum: a.trackingIdAlbum || a.trackingId || '',
      titreAlbum: a.titreAlbum || 'Album sans titre',
      nomArtiste: a.nomArtiste || 'Artiste',
      imageAlbum: a.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
      order: a.order !== undefined ? a.order : idx,
      isFree: a.isFree !== undefined ? a.isFree : (idx === 0),
      isVip: a.isVip !== undefined ? a.isVip : (idx > 0),
      isOverridden: a.isOverridden || false,
    }));
  },

  /** Force un album en gratuit */
  async setFree(trackingId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/albums/${trackingId}/access`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFree: true, isVip: false }),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour');
    return res.json();
  },

  /** Force un album en VIP (verrouillé) */
  async setVip(trackingId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/albums/${trackingId}/access`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFree: false, isVip: true }),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour');
    return res.json();
  },

  /** Retire l'override (retour à la règle par défaut) */
  async reset(trackingId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/albums/${trackingId}/reset`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Erreur lors du reset');
    return res.json();
  },
};
