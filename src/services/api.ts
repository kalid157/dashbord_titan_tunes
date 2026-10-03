import { Song, Playlist, Album, Artist, Category, AppNotification, DashboardStats } from '../types';

export const api = {
  // ================= SONGS =================
  async getAllSongs(): Promise<Song[]> {
    try {
      // First try /song/getAll as specified by Swagger
      const res = await fetch('/song/getAll');
      if (res.ok) {
        const data = await res.json();
        const rawSongs: any[] = Array.isArray(data) ? data : data.songs || [];
        return rawSongs.map((s) => ({
          ...s,
          trackingIdSong: s.trackingIdSong || s.trackingId || '',
          trackingId: s.trackingId || s.trackingIdSong || '',
          titre: s.titre || '',
          artiste: s.artiste || 'Artiste Inconnu',
          audio: s.audio || '',
          imageAlbum: s.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
        }));
      }
    } catch {
      // Fallback
    }

    try {
      const res2 = await fetch('/song/all');
      if (!res2.ok) throw new Error('Erreur lors du chargement des chansons');
      const data2 = await res2.json();
      const rawSongs: any[] = Array.isArray(data2) ? data2 : data2.songs || [];
      return rawSongs.map((s) => ({
        ...s,
        trackingIdSong: s.trackingIdSong || s.trackingId || '',
        trackingId: s.trackingId || s.trackingIdSong || '',
        titre: s.titre || '',
        artiste: s.artiste || 'Artiste Inconnu',
        audio: s.audio || '',
        imageAlbum: s.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
      }));
    } catch {
      const res3 = await fetch('/song/get/all');
      const data3 = await res3.json();
      return (data3.songs || []).map((s: any) => ({
        ...s,
        trackingIdSong: s.trackingIdSong || s.trackingId || '',
        trackingId: s.trackingId || s.trackingIdSong || '',
      }));
    }
  },

  async getSong(trackingIdSong: string): Promise<Song> {
    const res = await fetch(`/song/get/${trackingIdSong}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Chanson introuvable');
    return data.song;
  },

  // Swagger: POST /song/create
  // Payload: { titre: string, audio: string, albumTrackingId: uuid, categorieTrackingId: uuid }
  async createSong(payload: {
    titre: string;
    audio: string;
    albumTrackingId: string;
    categorieTrackingId: string;
    artiste?: string;
    imageAlbum?: string;
    genre?: string;
  }): Promise<{
    success: boolean;
    message: string;
    trackingId?: string;
    titre?: string;
    audio?: string;
    artiste?: string;
    song?: Song;
    origin?: 'swagger_real' | 'local_fallback';
  }> {
    const swaggerPayload = {
      titre: payload.titre.trim(),
      audio: payload.audio.trim(),
      albumTrackingId: payload.albumTrackingId.trim(),
      categorieTrackingId: payload.categorieTrackingId.trim(),
      // Backward compatibility fields
      artiste: payload.artiste || '',
      imageAlbum: payload.imageAlbum || '',
      genre: payload.genre || '',
    };

    const clientMode = localStorage.getItem('backend_client_mode') || 'proxy';
    const clientTarget = (localStorage.getItem('backend_target_url') || 'https://titan-tune-reset.onrender.com').replace(/\/$/, '');

    // Browser direct call if configured
    if (clientMode === 'browser_direct') {
      try {
        const res = await fetch(`${clientTarget}/song/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(swaggerPayload),
        });
        const data = await res.json();
        const isSuccess = res.ok && data.success !== false && (Boolean(data.trackingId) || data.success === true || !data.error);
        const resolvedTrackingId = data.trackingId || data.trackingIdSong || data.song?.trackingIdSong || 'sng_new';
        const resolvedTitre = data.titre || data.song?.titre || payload.titre;
        const resolvedAudio = data.audio || data.song?.audio || payload.audio;
        const resolvedArtiste = data.artiste || data.song?.artiste || payload.artiste || 'Artiste Inconnu';

        return {
          ...data,
          success: isSuccess,
          message: data.message || 'Morceau créé avec succès sur le backend Swagger ✅',
          trackingId: resolvedTrackingId,
          titre: resolvedTitre,
          audio: resolvedAudio,
          artiste: resolvedArtiste,
          origin: 'swagger_real',
          song: data.song || {
            trackingIdSong: resolvedTrackingId,
            trackingId: resolvedTrackingId,
            titre: resolvedTitre,
            artiste: resolvedArtiste,
            audio: resolvedAudio,
            imageAlbum: payload.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
          },
        };
      } catch (err: unknown) {
        console.warn('Browser direct call failed, falling back to proxy', err);
      }
    }

    // Default Proxy route
    const res = await fetch('/song/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(swaggerPayload),
    });
    const isFallback = res.headers.get('X-Backend-Origin') === 'local-mock-fallback';
    const data = await res.json();
    const isSuccess = res.ok && data.success !== false && (Boolean(data.trackingId) || data.success === true || !data.error);
    const resolvedTrackingId = data.trackingId || data.trackingIdSong || data.song?.trackingIdSong || 'sng_new';
    const resolvedTitre = data.titre || data.song?.titre || payload.titre;
    const resolvedAudio = data.audio || data.song?.audio || payload.audio;
    const resolvedArtiste = data.artiste || data.song?.artiste || payload.artiste || 'Artiste Inconnu';

    return {
      ...data,
      success: isSuccess,
      message: data.message || 'Morceau créé avec succès sur le backend Swagger ✅',
      trackingId: resolvedTrackingId,
      titre: resolvedTitre,
      audio: resolvedAudio,
      artiste: resolvedArtiste,
      origin: isFallback ? 'local_fallback' : 'swagger_real',
      song: data.song || {
        trackingIdSong: resolvedTrackingId,
        trackingId: resolvedTrackingId,
        titre: resolvedTitre,
        artiste: resolvedArtiste,
        audio: resolvedAudio,
        imageAlbum: payload.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
      },
    };
  },

  async addSong(params: {
    titre: string;
    artiste: string;
    audio: string;
    imageAlbum: string;
    genre?: string;
    albumId?: string;
    duree?: string;
  }): Promise<{ success: boolean; message: string; song?: Song }> {
    const res = await fetch('/song/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async uploadSong(formData: FormData): Promise<{ success: boolean; message: string; song?: Song }> {
    const res = await fetch('/song/upload', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async deleteSong(trackingIdSong: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/song/delete/${trackingIdSong}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async updateSong(
    trackingIdSong: string,
    payload: {
      titre: string;
      audio: string;
      albumTrackingId?: string;
      categorieTrackingId?: string;
      artiste?: string;
      imageAlbum?: string;
      genre?: string;
    }
  ): Promise<{ success: boolean; message: string; song?: Song }> {
    const swaggerPayload = {
      titre: payload.titre.trim(),
      audio: payload.audio.trim(),
      albumTrackingId: (payload.albumTrackingId || '').trim(),
      categorieTrackingId: (payload.categorieTrackingId || '').trim(),
      artiste: payload.artiste,
      imageAlbum: payload.imageAlbum,
      genre: payload.genre,
    };
    const res = await fetch(`/song/update/${trackingIdSong}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(swaggerPayload),
    });
    return res.json();
  },

  async updateAudio(
    trackingIdSong: string,
    payload: { audio?: string; file?: File | Blob }
  ): Promise<{ success: boolean; message: string; song?: Song }> {
    if (payload.file) {
      const formData = new FormData();
      formData.append('audio', payload.file);
      formData.append('audioFile', payload.file);
      const res = await fetch(`/song/updateAudio/${trackingIdSong}`, {
        method: 'PUT',
        body: formData,
      });
      return res.json();
    } else {
      const res = await fetch(`/song/updateAudio/${trackingIdSong}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: payload.audio }),
      });
      return res.json();
    }
  },

  // ================= PLAYLISTS =================
  async getAllPlaylists(): Promise<Playlist[]> {
    const res = await fetch('/playlist/all');
    const data = await res.json();
    return data.playlists || [];
  },

  async getPlaylistsForClient(trackingIdClient: string): Promise<Playlist[]> {
    const res = await fetch(`/playlist/allForOne/${trackingIdClient}`);
    const data = await res.json();
    return data.playlists || [];
  },

  async getPlaylist(trackingId: string): Promise<Playlist> {
    const res = await fetch(`/playlist/get/${trackingId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Playlist introuvable');
    return data.playlist;
  },

  async createPlaylist(
    trackingIdClient: string,
    payload: {
      titre: string;
      imageAlbum?: string;
      visibilite?: boolean;
      songIds?: string[];
    }
  ): Promise<{ success: boolean; message: string; playlist?: Playlist }> {
    const res = await fetch(`/playlist/create/${trackingIdClient}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async changeVisibilite(
    trackingIdPlaylist: string,
    visibilite?: boolean
  ): Promise<{ success: boolean; message: string; visibilite: boolean; playlist?: Playlist }> {
    const res = await fetch(`/playlist/changeVisibilite/${trackingIdPlaylist}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visibilite !== undefined ? { visibilite } : {}),
    });
    return res.json();
  },

  async addSongToPlaylist(
    trackingIdPlaylist: string,
    trackingIdSong: string
  ): Promise<{ success: boolean; message: string; playlist?: Playlist }> {
    const res = await fetch('/playlist/addSong', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingIdPlaylist, trackingIdSong }),
    });
    return res.json();
  },

  async removeSongFromPlaylist(
    trackingIdPlaylist: string,
    trackingIdSong: string
  ): Promise<{ success: boolean; message: string; playlist?: Playlist }> {
    const res = await fetch(`/playlist/removeSongForPlaylist/${trackingIdPlaylist}/${trackingIdSong}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getAllPlaylistsForSong(trackingIdSong: string): Promise<Playlist[]> {
    const res = await fetch(`/playlist/getAllSongForPlaylist/${trackingIdSong}`);
    const data = await res.json();
    return data.playlists || [];
  },

  async updatePlaylist(
    trackingIdClient: string,
    trackingIdPlaylist: string,
    payload: {
      titre?: string;
      imageAlbum?: string;
      visibilite?: boolean;
    }
  ): Promise<{ success: boolean; message: string; playlist?: Playlist }> {
    const res = await fetch(`/playlist/update/${trackingIdClient}/${trackingIdPlaylist}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // ================= ALBUMS =================
  async getAllAlbums(): Promise<Album[]> {
    try {
      const res = await fetch('/albums/all');
      if (res.ok) {
        const data = await res.json();
        const rawList: any[] = Array.isArray(data) ? data : data.albums || [];
        return rawList.map((a: any) => ({
          ...a,
          trackingIdAlbum: a.trackingIdAlbum || a.trackingId || '',
          trackingId: a.trackingId || a.trackingIdAlbum || '',
          titreAlbum: a.titreAlbum || '',
          nomArtiste: a.nomArtiste || '',
          imageAlbum: a.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
          songs: a.songs || [],
        }));
      }
    } catch {
      // try fallback endpoint
    }

    try {
      const res2 = await fetch('/album/all');
      const data2 = await res2.json();
      const rawList2: any[] = Array.isArray(data2) ? data2 : data2.albums || [];
      return rawList2.map((a: any) => ({
        ...a,
        trackingIdAlbum: a.trackingIdAlbum || a.trackingId || '',
        trackingId: a.trackingId || a.trackingIdAlbum || '',
        titreAlbum: a.titreAlbum || '',
        nomArtiste: a.nomArtiste || '',
        imageAlbum: a.imageAlbum || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
        songs: a.songs || [],
      }));
    } catch {
      return [];
    }
  },

  async createAlbum(payload: {
    titreAlbum: string;
    artisteTrackingId: string;
    imageAlbum: string;
    nomArtiste?: string;
    genre?: string;
    annee?: number;
  }): Promise<{
    success: boolean;
    message: string;
    trackingId?: string;
    album?: Album;
    origin?: 'swagger_real' | 'local_fallback';
    errorDetails?: string;
  }> {
    // Exact Swagger Schema:
    // { "titreAlbum": "...", "artisteTrackingId": "...", "imageAlbum": "..." }
    const swaggerPayload = {
      titreAlbum: payload.titreAlbum.trim(),
      artisteTrackingId: payload.artisteTrackingId.trim(),
      imageAlbum: payload.imageAlbum.trim(),
      // Backward compatibility aliases
      nomArtiste: payload.nomArtiste || '',
      artist: payload.nomArtiste || '',
      title: payload.titreAlbum.trim(),
      genre: payload.genre || 'Afrobeats',
      annee: payload.annee || 2026,
    };

    const clientMode = localStorage.getItem('backend_client_mode') || 'proxy';
    const clientTarget = (localStorage.getItem('backend_target_url') || 'https://titan-tune-reset.onrender.com').replace(/\/$/, '');

    const normalizeAlbumResponse = (data: any, isFallback: boolean): {
      success: boolean;
      message: string;
      trackingId: string;
      album: Album;
      origin: 'swagger_real' | 'local_fallback';
    } => {
      const albumTrackingId =
        data.trackingId ||
        data.trackingIdAlbum ||
        (data.album && (data.album.trackingId || data.album.trackingIdAlbum)) ||
        '';

      const resolvedAlbum: Album = {
        trackingIdAlbum: albumTrackingId,
        trackingId: albumTrackingId,
        titreAlbum: data.titreAlbum || (data.album && data.album.titreAlbum) || payload.titreAlbum,
        nomArtiste: data.nomArtiste || (data.album && data.album.nomArtiste) || payload.nomArtiste || 'Artiste',
        imageAlbum: data.imageAlbum || (data.album && data.album.imageAlbum) || payload.imageAlbum,
        artisteTrackingId: data.artisteTrackingId || (data.album && data.album.artisteTrackingId) || payload.artisteTrackingId,
        genre: data.genre || (data.album && data.album.genre) || payload.genre || 'Afrobeats',
        annee: data.annee || (data.album && data.album.annee) || payload.annee || new Date().getFullYear(),
        songs: data.songs || (data.album && data.album.songs) || [],
        createdAt: data.createdAt || (data.album && data.album.createdAt) || new Date().toISOString(),
      };

      return {
        success: true,
        message: data.message || 'Album créé avec succès sur le backend Swagger ✅',
        trackingId: albumTrackingId,
        album: resolvedAlbum,
        origin: isFallback ? 'local_fallback' : 'swagger_real',
      };
    };

    // If client requested Direct Browser mode:
    if (clientMode === 'browser_direct') {
      try {
        const res = await fetch(`${clientTarget}/albums/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(swaggerPayload),
        });
        if (res.ok) {
          const data = await res.json();
          return normalizeAlbumResponse(data, false);
        }
      } catch (err: unknown) {
        // Fallback to /album/create
        try {
          const res2 = await fetch(`${clientTarget}/album/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(swaggerPayload),
          });
          if (res2.ok) {
            const data2 = await res2.json();
            return normalizeAlbumResponse(data2, false);
          }
        } catch {
          return {
            success: false,
            message: `Échec d'appel direct vers ${clientTarget}. Vérifiez le tunnel HTTPS ou l'accès CORS.`,
            errorDetails: err instanceof Error ? err.message : String(err),
          };
        }
      }
    }

    // Default: Via Express Proxy (trying /albums/create then /album/create)
    try {
      const res = await fetch('/albums/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swaggerPayload),
      });

      const isFallback = res.headers.get('X-Backend-Origin') === 'local-mock-fallback';
      if (res.ok) {
        const data = await res.json();
        return normalizeAlbumResponse(data, isFallback);
      } else {
        const errText = await res.text();
        let errJson: any = {};
        try {
          errJson = JSON.parse(errText);
        } catch {
          errJson = { message: errText };
        }
        return {
          success: false,
          message: errJson.message || `Erreur serveur (HTTP ${res.status})`,
        };
      }
    } catch {
      // Try /album/create fallback
      try {
        const res2 = await fetch('/album/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(swaggerPayload),
        });
        if (res2.ok) {
          const data2 = await res2.json();
          return normalizeAlbumResponse(data2, true);
        }
      } catch (fallbackErr) {
        return {
          success: false,
          message: fallbackErr instanceof Error ? fallbackErr.message : 'Erreur réseau',
        };
      }
      return {
        success: false,
        message: "Erreur lors de la création de l'album",
      };
    }
  },

  async deleteAlbum(trackingId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/albums/delete/${trackingId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch {
      const res = await fetch(`/album/delete/${trackingId}`, {
        method: 'DELETE',
      });
      return await res.json();
    }
  },

  // Swagger: PUT /albums/update/{trackingId}
  // Schema: { "titreAlbum": "string", "artisteTrackingId": "uuid", "imageAlbum": "string" }
  async updateAlbum(
    trackingId: string,
    payload: {
      titreAlbum: string;
      artisteTrackingId: string;
      imageAlbum: string;
      nomArtiste?: string;
      genre?: string;
      annee?: number;
    }
  ): Promise<{ success: boolean; message: string; trackingId?: string; album?: Album }> {
    const swaggerPayload = {
      titreAlbum: payload.titreAlbum.trim(),
      artisteTrackingId: payload.artisteTrackingId.trim(),
      imageAlbum: payload.imageAlbum.trim(),
      nomArtiste: payload.nomArtiste,
      genre: payload.genre,
      annee: payload.annee,
    };
    try {
      const res = await fetch(`/albums/update/${trackingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swaggerPayload),
      });
      return await res.json();
    } catch {
      const res2 = await fetch(`/album/update/${trackingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swaggerPayload),
      });
      return await res2.json();
    }
  },

  // Swagger: PUT /albums/updateImage/{trackingId}
  // Multipart form-data with parameter "image"
  // Response: { "trackingId": "uuid", "titreAlbum": "string", "nomArtiste": "string", "imageAlbum": "string" }
  async updateAlbumImage(
    trackingId: string,
    payload: { image?: string; file?: File | Blob }
  ): Promise<{
    success: boolean;
    message?: string;
    trackingId?: string;
    titreAlbum?: string;
    nomArtiste?: string;
    imageAlbum?: string;
  }> {
    if (payload.file) {
      const formData = new FormData();
      formData.append('image', payload.file);
      const res = await fetch(`/albums/updateImage/${trackingId}`, {
        method: 'PUT',
        body: formData,
      });
      return await res.json();
    } else {
      const res = await fetch(`/albums/updateImage/${trackingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: payload.image }),
      });
      return await res.json();
    }
  },

  // ================= ARTISTS & USERS (/user/allArtist & /user/allClient) =================
  async getAllArtists(): Promise<Artist[]> {
    const list: Artist[] = [];
    const seenIds = new Set<string>();

    // 1. Fetch artists from /user/allArtist
    try {
      const res = await fetch('/user/allArtist');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          const rawArtists: any[] = Array.isArray(data) ? data : data.artists || [];
          rawArtists.forEach((a: any) => {
            const trackingId = a.trackingId || a.id || '';
            if (trackingId && !seenIds.has(trackingId)) {
              seenIds.add(trackingId);
              list.push({
                trackingId,
                firstName: a.firstName || a.FirstName || '',
                lastName: a.lastName || a.LastName || '',
                alias: a.alias || a.Alias || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Artiste',
                phone: a.phone || a.Phone || '',
                email: a.email || a.Email || '',
                password: a.password || a.Password || '',
                description: a.description || 'Artiste enregistré sur Swagger',
                connectionCode: a.connectionCode || a.activation_code || (a.password ? a.password.slice(0, 10) : 'ART-KEY'),
                createdAt: a.createdAt || new Date().toISOString(),
                role: 'ARTIST',
                rawResponse: a,
              });
            }
          });
        } catch {
          // ignore parse error
        }
      }
    } catch (err) {
      console.warn('Erreur lecture /user/allArtist', err);
    }

    // 2. Fetch clients from /user/allClient (like John Doe, Kofi Mensah, Marie Dupont...)
    try {
      const resClient = await fetch('/user/allClient');
      if (resClient.ok) {
        const textClient = await resClient.text();
        try {
          const dataClient = JSON.parse(textClient);
          const rawClients: any[] = Array.isArray(dataClient) ? dataClient : dataClient.clients || [];
          rawClients.forEach((c: any) => {
            const trackingId = c.trackingId || c.id || '';
            if (trackingId && !seenIds.has(trackingId)) {
              seenIds.add(trackingId);
              const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim();
              list.push({
                trackingId,
                firstName: c.firstName || '',
                lastName: c.lastName || '',
                alias: c.alias || fullName || 'Client',
                phone: c.phone || '',
                email: c.email || '',
                password: c.password || '',
                description: c.description || 'Compte Client enregistré sur Swagger',
                connectionCode: c.connectionCode || 'CLIENT-KEY',
                createdAt: c.createdAt || new Date().toISOString(),
                role: 'CLIENT',
                rawResponse: c,
              });
            }
          });
        } catch {
          // ignore parse error
        }
      }
    } catch (err) {
      console.warn('Erreur lecture /user/allClient', err);
    }

    // 3. Fallback to /user/all if list empty
    if (list.length === 0) {
      try {
        const res2 = await fetch('/user/all');
        if (res2.ok) {
          const text2 = await res2.text();
          const data2 = JSON.parse(text2);
          const rawList2: any[] = Array.isArray(data2) ? data2 : data2.artists || [];
          rawList2.forEach((a: any) => {
            const trackingId = a.trackingId || '';
            if (trackingId && !seenIds.has(trackingId)) {
              seenIds.add(trackingId);
              list.push({
                trackingId,
                firstName: a.firstName || '',
                lastName: a.lastName || '',
                alias: a.alias || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Artiste',
                phone: a.phone || '',
                email: a.email || '',
                password: a.password || '',
                description: a.description || '',
                connectionCode: 'ART-KEY',
                createdAt: new Date().toISOString(),
                role: 'ARTIST',
                rawResponse: a,
              });
            }
          });
        }
      } catch {
        // fallback
      }
    }

    // 4. Merge with local storage
    const storedLocal = localStorage.getItem('titan_registered_artists');
    if (storedLocal) {
      try {
        const localArr: Artist[] = JSON.parse(storedLocal);
        localArr.forEach((la) => {
          if (la.trackingId && !seenIds.has(la.trackingId)) {
            seenIds.add(la.trackingId);
            list.push(la);
          }
        });
      } catch {
        // ignore
      }
    }

    return list;
  },

  async registerArtist(payload: {
    firstName: string;
    lastName: string;
    alias: string;
    phone: string;
    email: string;
    password?: string;
    description: string;
  }): Promise<{
    success: boolean;
    message: string;
    trackingId?: string;
    artisteTrackingId?: string;
    connectionCode?: string;
    artist?: Artist;
    origin?: 'swagger_real' | 'local_fallback';
    errorDetails?: string;
  }> {
    // Exact Swagger Schema:
    // { firstName, lastName, alias, phone, email, password, description }
    const swaggerPayload = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      alias: payload.alias.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      password: payload.password || 'TitanSecure2026!',
      description: payload.description.trim(),
    };

    const clientMode = localStorage.getItem('backend_client_mode') || 'proxy';
    const clientTarget = (localStorage.getItem('backend_target_url') || 'https://titan-tune-reset.onrender.com').replace(/\/$/, '');

    let resultData: any;
    let isRealSwagger = false;

    if (clientMode === 'browser_direct') {
      try {
        const res = await fetch(`${clientTarget}/user/registerArtist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(swaggerPayload),
        });
        resultData = await res.json();
        isRealSwagger = true;
      } catch (err: unknown) {
        return {
          success: false,
          message: `Échec d'appel direct vers ${clientTarget}/user/registerArtist`,
          errorDetails: err instanceof Error ? err.message : String(err),
        };
      }
    } else {
      // Express proxy
      const res = await fetch('/user/registerArtist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swaggerPayload),
      });
      isRealSwagger = res.headers.get('X-Backend-Origin') !== 'local-mock-fallback';
      resultData = await res.json();
    }

    // Backend responds with { activation_code: "...", content: { trackingId, FirstName, LastName, ... } }
    const artistContent = resultData.content || resultData.artist || resultData.user || resultData;
    const resolvedTrackingId =
      artistContent.trackingId ||
      resultData.trackingId ||
      resultData.artisteTrackingId ||
      (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`);

    const resolvedConnectionCode =
      resultData.activation_code ||
      resultData.connectionCode ||
      artistContent.connectionCode ||
      artistContent.activation_code ||
      `ART-${Math.floor(100000 + Math.random() * 900000)}`;

    const createdArtistObj: Artist = {
      trackingId: resolvedTrackingId,
      firstName: artistContent.FirstName || payload.firstName.trim(),
      lastName: artistContent.LastName || payload.lastName.trim(),
      alias: artistContent.Alias || payload.alias.trim() || `${payload.firstName} ${payload.lastName}`.trim(),
      phone: artistContent.Phone || payload.phone.trim(),
      email: artistContent.Email || payload.email.trim(),
      password: artistContent.Password || payload.password,
      description: artistContent.description || payload.description.trim(),
      connectionCode: resolvedConnectionCode,
      createdAt: new Date().toISOString(),
      rawResponse: resultData,
    };

    try {
      const stored = localStorage.getItem('titan_registered_artists');
      const list: Artist[] = stored ? JSON.parse(stored) : [];
      list.unshift(createdArtistObj);
      localStorage.setItem('titan_registered_artists', JSON.stringify(list));
    } catch {}

    return {
      success: resultData.success !== false,
      message: resultData.message || `Artiste créé avec succès ! Code de connexion : ${resolvedConnectionCode} 🔑`,
      trackingId: resolvedTrackingId,
      artisteTrackingId: resolvedTrackingId,
      connectionCode: resolvedConnectionCode,
      artist: createdArtistObj,
      origin: isRealSwagger ? 'swagger_real' : 'local_fallback',
    };
  },

  // ================= CATEGORIES =================
  async getAllCategories(): Promise<Category[]> {
    try {
      // First try /categories/all (live Swagger)
      const res = await fetch('/categories/all');
      if (res.ok) {
        const data = await res.json();
        const list: Category[] = Array.isArray(data) ? data : data.categories || [];
        return list;
      }
    } catch {
      // Fallback
    }

    try {
      const res2 = await fetch('/categorie/getAll');
      if (res2.ok) {
        const data2 = await res2.json();
        return Array.isArray(data2) ? data2 : data2.categories || [];
      }
    } catch {
      // Fallback
    }

    try {
      const res3 = await fetch('/categorie/all');
      if (res3.ok) {
        const data3 = await res3.json();
        return Array.isArray(data3) ? data3 : data3.categories || [];
      }
    } catch {}

    return [];
  },

  // Swagger: POST /categories/create or /categorie/create
  // Payload: { "nomCategorie": "string" }
  async createCategory(payload: { nomCategorie: string }): Promise<{
    success: boolean;
    message: string;
    trackingId?: string;
    nomCategorie?: string;
    category?: Category;
    origin?: 'swagger_real' | 'local_fallback';
  }> {
    const swaggerPayload = {
      nomCategorie: payload.nomCategorie.trim(),
    };

    const clientMode = localStorage.getItem('backend_client_mode') || 'proxy';
    const clientTarget = (localStorage.getItem('backend_target_url') || 'https://titan-tune-reset.onrender.com').replace(/\/$/, '');

    // Browser direct call if configured
    if (clientMode === 'browser_direct') {
      try {
        const res = await fetch(`${clientTarget}/categories/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
          body: JSON.stringify(swaggerPayload),
        });
        const data = await res.json();
        return {
          ...data,
          origin: 'swagger_real',
        };
      } catch (err) {
        console.warn('Browser direct createCategory failed', err);
      }
    }

    // Default Proxy route: try /categories/create then /categorie/create
    try {
      const res = await fetch('/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swaggerPayload),
      });
      const isFallback = res.headers.get('X-Backend-Origin') === 'local-mock-fallback';
      const data = await res.json();
      return {
        ...data,
        origin: isFallback ? 'local_fallback' : 'swagger_real',
        trackingId: data.trackingId || data.category?.trackingId,
        nomCategorie: data.nomCategorie || data.category?.nomCategorie || payload.nomCategorie,
      };
    } catch {
      const res2 = await fetch('/categorie/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swaggerPayload),
      });
      const data2 = await res2.json();
      return {
        ...data2,
        trackingId: data2.trackingId || data2.category?.trackingId,
        nomCategorie: data2.nomCategorie || data2.category?.nomCategorie || payload.nomCategorie,
      };
    }
  },

  async deleteCategory(trackingId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/categories/delete/${trackingId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch {
      const res2 = await fetch(`/categorie/delete/${trackingId}`, {
        method: 'DELETE',
      });
      return await res2.json();
    }
  },

  // ================= NOTIFICATIONS =================
  async getAllNotifications(): Promise<AppNotification[]> {
    try {
      const res = await fetch('/notification/all');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          return Array.isArray(data) ? data : data.notifications || [];
        } catch {
          return [];
        }
      }
    } catch {
      // Safe fallback on 401 or network error
    }
    return [];
  },

  async broadcastNotification(payload: {
    title: string;
    body: string;
    image?: string;
    targetAudience?: string;
  }): Promise<{ success: boolean; message: string; notification?: AppNotification }> {
    const res = await fetch('/notification/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // ================= STATS =================
  async getStats(): Promise<DashboardStats> {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      songsCount: 4,
      playlistsCount: 3,
      albumsCount: 2,
      notificationsCount: 1,
      totalPlays: 8760,
      mostLikedSong: {
        titre: 'Bad-Boy-feat.Aya-Nakamura',
        total_liked: 1,
      },
    };
  },

  // Swagger: GET /stats/songWithMostLike - Chanson la plus likée
  // Response: { "titre": "Bad-Boy-feat.Aya-Nakamura", "total_liked": 1 }
  async getSongWithMostLike(): Promise<{ titre: string; total_liked: number }> {
    try {
      const res = await fetch('/stats/songWithMostLike');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      titre: 'Bad-Boy-feat.Aya-Nakamura',
      total_liked: 1,
    };
  },

  // Swagger: GET /stats/nbrTotalEcoute/{trackingIdSong} - Nombre total d'écoutes
  async getSongPlays(trackingIdSong: string): Promise<number> {
    try {
      const res = await fetch(`/stats/nbrTotalEcoute/${trackingIdSong}`);
      if (res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (typeof json === 'number') return json;
          if (typeof json.nbrTotalEcoute === 'number') return json.nbrTotalEcoute;
          if (typeof json.count === 'number') return json.count;
        } catch {
          const parsed = parseInt(text, 10);
          if (!isNaN(parsed)) return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return 0;
  },

  // ================= SWAGGER BACKEND =================
  async getBackendStatus(): Promise<{
    targetUrl: string;
    swaggerUrl: string;
    isConnected: boolean;
    mode: 'proxy_with_fallback' | 'proxy_strict' | 'browser_direct' | 'mock';
    latency?: number;
    errorMessage?: string;
    lastChecked?: string;
  }> {
    try {
      const res = await fetch('/api/backend/status');
      if (res.ok) {
        const data = await res.json();
        const clientMode = localStorage.getItem('backend_client_mode');
        if (clientMode === 'browser_direct') {
          data.mode = 'browser_direct';
        }
        return data;
      }
    } catch {
      // Fallback
    }
    return {
      targetUrl: 'https://titan-tune-reset.onrender.com',
      swaggerUrl: 'https://titan-tune-reset.onrender.com/swagger-ui/index.html',
      isConnected: false,
      mode: 'proxy_with_fallback',
      errorMessage: 'Backend inaccessible',
    };
  },

  async updateBackendConfig(payload: {
    targetUrl?: string;
    mode?: 'proxy_with_fallback' | 'proxy_strict' | 'browser_direct' | 'mock';
  }): Promise<{
    success: boolean;
    targetUrl: string;
    swaggerUrl: string;
    mode: 'proxy_with_fallback' | 'proxy_strict' | 'browser_direct' | 'mock';
  }> {
    const res = await fetch('/api/backend/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

