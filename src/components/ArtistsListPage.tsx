import React, { useState } from 'react';
import {
  ArrowLeft,
  UserCheck,
  User,
  KeyRound,
  Phone,
  Mail,
  Copy,
  Check,
  Disc,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Info,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { Artist } from '../types';

interface ArtistsListPageProps {
  onBack: () => void;
  artists: Artist[];
  onRefreshArtists: () => void;
  onNavigateToRegisterArtist: () => void;
  onNavigateToCreateAlbumWithArtist: (artisteTrackingId: string) => void;
  showEndpoints?: boolean;
}

export const ArtistsListPage: React.FC<ArtistsListPageProps> = ({
  onBack,
  artists,
  onRefreshArtists,
  onNavigateToRegisterArtist,
  onNavigateToCreateAlbumWithArtist,
  showEndpoints = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ARTIST' | 'CLIENT'>('ALL');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedArtistForRaw, setSelectedArtistForRaw] = useState<Artist | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredArtists = artists.filter((a) => {
    if (roleFilter === 'ARTIST' && a.role === 'CLIENT') return false;
    if (roleFilter === 'CLIENT' && a.role !== 'CLIENT') return false;

    const q = searchQuery.toLowerCase();
    return (
      a.alias.toLowerCase().includes(q) ||
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.trackingId.toLowerCase().includes(q) ||
      (a.connectionCode && a.connectionCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black font-medium text-sm transition"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold text-gray-900">Artistes Enregistrés</h2>
          <span className="text-xs text-gray-500 font-mono">
            {artists.length} artiste{artists.length > 1 ? 's' : ''} au total
          </span>
        </div>
        <button
          type="button"
          onClick={onNavigateToRegisterArtist}
          className="py-1.5 px-3 rounded-xl bg-[#FF8A00] hover:bg-[#e07b00] text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
        >
          <Plus size={14} />
          <span>Nouvel Artiste</span>
        </button>
      </div>

      {/* Info card */}
      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-start gap-3">
        <Info size={20} className="text-[#FF8A00] shrink-0 mt-0.5" />
        <div className="text-xs text-orange-950 space-y-1">
          <p className="font-semibold">
            Gestion des Artistes & Codes de Connexion
          </p>
          <p className="text-orange-900/80">
            {showEndpoints
              ? "Chaque artiste dispose d'un artisteTrackingId (nécessaire pour créer ses albums via /albums/create) et d'un code pour se connecter généré lors de son inscription."
              : "Retrouvez ici tous les artistes du label avec leurs codes d'accès sécurisés et gérez leurs discographies."}
          </p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par alias, nom, email, trackingId ou code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-xs focus:border-[#FF8A00] outline-none shadow-xs"
          />
        </div>
        <button
          type="button"
          onClick={onRefreshArtists}
          className="py-2.5 px-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
        >
          <RefreshCw size={14} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Role Filters Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setRoleFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            roleFilter === 'ALL'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous ({artists.length})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('ARTIST')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            roleFilter === 'ARTIST'
              ? 'bg-[#FF8A00] text-white shadow-xs'
              : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
          }`}
        >
          Artistes ({artists.filter((a) => a.role !== 'CLIENT').length})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('CLIENT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            roleFilter === 'CLIENT'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
          }`}
        >
          Clients / Utilisateurs ({artists.filter((a) => a.role === 'CLIENT').length})
        </button>
      </div>

      {/* Artists Cards Grid */}
      {filteredArtists.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-gray-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF8A00] flex items-center justify-center mx-auto">
            <UserCheck size={24} />
          </div>
          <p className="text-sm font-semibold text-gray-700">Aucun profil trouvé</p>
          <p className="text-xs text-gray-400">
            {roleFilter === 'CLIENT'
              ? 'Aucun client trouvé dans Swagger /user/allClient.'
              : 'Enregistrez votre premier artiste via le formulaire ou rechargez les données depuis Swagger.'}
          </p>
          <button
            type="button"
            onClick={onNavigateToRegisterArtist}
            className="mt-2 py-2 px-4 rounded-xl bg-[#FF8A00] text-white text-xs font-bold shadow-xs hover:bg-[#e07b00]"
          >
            Créer un artiste maintenant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArtists.map((artist) => (
            <div
              key={artist.trackingId}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header with Avatar & Alias */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold text-lg shadow-sm ${
                        artist.role === 'CLIENT'
                          ? 'bg-gradient-to-tr from-blue-500 to-indigo-600'
                          : 'bg-gradient-to-tr from-[#FF8A00] to-[#E8A23F]'
                      }`}
                    >
                      {artist.alias.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm">{artist.alias}</h3>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            artist.role === 'CLIENT'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {artist.role === 'CLIENT' ? 'CLIENT' : 'ARTISTE'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {artist.firstName} {artist.lastName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <ShieldCheck size={11} />
                    <span>Actif</span>
                  </span>
                </div>

                {/* Connection Code Badge (Highlight) */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#FF8A00] tracking-wider flex items-center gap-1">
                      <KeyRound size={11} />
                      Code pour se connecter
                    </span>
                    <div className="font-mono text-sm font-extrabold text-orange-900 mt-0.5">
                      {artist.connectionCode || 'ART-882194'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(artist.connectionCode || 'ART-882194', `code_${artist.trackingId}`)
                    }
                    className="p-1.5 rounded-xl bg-white text-orange-700 hover:text-black hover:bg-orange-100 transition shadow-xs"
                    title="Copier le code de connexion"
                  >
                    {copiedField === `code_${artist.trackingId}` ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                {/* Tracking ID (Required for Albums) */}
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/70 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-600">artisteTrackingId</span>
                    <span className="text-[10px] text-gray-400">UUID</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-gray-800 break-all select-all">
                    <span className="truncate pr-2">{artist.trackingId}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(artist.trackingId, `tid_${artist.trackingId}`)}
                      className="p-1 text-gray-500 hover:text-[#FF8A00] transition shrink-0"
                      title="Copier le trackingId"
                    >
                      {copiedField === `tid_${artist.trackingId}` ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Details: Email & Phone & Bio */}
                <div className="space-y-1 text-xs text-gray-600 pt-1">
                  {artist.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{artist.email}</span>
                    </div>
                  )}
                  {artist.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-gray-400 shrink-0" />
                      <span>{artist.phone}</span>
                    </div>
                  )}
                  {artist.description && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 pt-1 italic">
                      &quot;{artist.description}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToCreateAlbumWithArtist(artist.trackingId)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#00BFA6] hover:bg-[#00a892] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Disc size={13} />
                  <span>Créer un album</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedArtistForRaw(artist)}
                  className="py-2 px-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-mono transition"
                  title="Voir les détails bruts"
                >
                  JSON
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw JSON Modal */}
      {selectedArtistForRaw && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Détails Swagger : {selectedArtistForRaw.alias}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  trackingId: {selectedArtistForRaw.trackingId}
                </p>
              </div>
              <button
                onClick={() => setSelectedArtistForRaw(null)}
                className="text-gray-400 hover:text-black text-xs font-semibold p-1"
              >
                Fermer
              </button>
            </div>

            <div className="p-3 bg-gray-900 rounded-2xl text-[11px] font-mono text-emerald-400 max-h-64 overflow-y-auto">
              <pre>
                {JSON.stringify(
                  selectedArtistForRaw.rawResponse || selectedArtistForRaw,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(
                    JSON.stringify(selectedArtistForRaw, null, 2),
                    'raw_json'
                  );
                }}
                className="py-2 px-3 rounded-xl border text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                {copiedField === 'raw_json' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>Copier JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedArtistForRaw(null)}
                className="py-2 px-4 rounded-xl bg-black text-white text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
