import { API_BASE_URL } from '../config/api';
import { Song } from '../types';

export const songService = {
  /** Récupère tous les morceaux avec statut calculé */
  async getAll(): Promise<Song[]> {
    const res = await fetch(`${API_BASE_URL}/song/getAll`);
    if (!res.ok) throw new Error('Impossible de charger les morceaux');
    const data = await res.json();
    const list: Song[] = Array.isArray(data) ? data : data.songs || [];
    return list.map((s: any, idx: number) => ({
      ...s,
      trackingId: s.trackingId || s.trackingIdSong || '',
      trackingIdSong: s.trackingIdSong || s.trackingId || '',
      titre: s.titre || 'Morceau sans titre',
      artiste: s.artiste || 'Artiste',
      audio: s.audio || '',
      order: s.order !== undefined ? s.order : idx,
      isFree: s.isFree !== undefined ? s.isFree : (idx === 0),
      isVip: s.isVip !== undefined ? s.isVip : (idx > 0),
      isOverridden: s.isOverridden || false,
    }));
  },

  /** Force un morceau en gratuit */
  async setFree(trackingId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/song/${trackingId}/access`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFree: true, isVip: false }),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour');
    return res.json();
  },

  /** Force un morceau en VIP (verrouillé) */
  async setVip(trackingId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/song/${trackingId}/access`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFree: false, isVip: true }),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour');
    return res.json();
  },

  /** Retire l'override (retour à la règle par défaut) */
  async reset(trackingId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/song/${trackingId}/reset`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Erreur lors du reset');
    return res.json();
  },
};
