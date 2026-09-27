import React, { useState } from 'react';
import {
  ArrowLeft,
  UserCheck,
  User,
  KeyRound,
  Phone,
  Mail,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Disc,
} from 'lucide-react';
import { api } from '../services/api';
import { Artist } from '../types';

interface RegisterArtistPageProps {
  onBack: () => void;
  onArtistCreated: (artist: Artist) => void;
  onNavigateToCreateAlbum?: (artisteTrackingId: string) => void;
  onNavigateToArtistsList?: () => void;
  backendConfig?: {
    isConnected: boolean;
    targetUrl: string;
    swaggerUrl: string;
  };
}

export const RegisterArtistPage: React.FC<RegisterArtistPageProps> = ({
  onBack,
  onArtistCreated,
  onNavigateToCreateAlbum,
  onNavigateToArtistsList,
  backendConfig,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdArtist, setCreatedArtist] = useState<Artist | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFillDemo = () => {
    setFirstName('Aïssatou');
    setLastName('Sall');
    setAlias('Aïcha Star');
    setPhone('+221 77 450 12 34');
    setEmail('aicha.star@titantunes.io');
    setPassword('TitanPass@2026');
    setDescription(
      'Artiste auteure-interprète Afro-pop et RnB, originaire de Dakar. Nominée aux Titan Awards 2026.'
    );
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim() && (!firstName.trim() || !lastName.trim())) {
      setErrorMsg('Veuillez renseigner le nom d\'artiste (alias) ou prénom & nom');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Veuillez renseigner une adresse email valide');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Endpoint /user/registerArtist avec schéma Swagger exact:
      // { firstName, lastName, alias, phone, email, password, description }
      const res = await api.registerArtist({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        alias: alias.trim() || `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        email: email.trim(),
        password: password.trim() || 'TitanSecure2026!',
        description: description.trim(),
      });

      if (res.success && res.artist) {
        setCreatedArtist(res.artist);
        onArtistCreated(res.artist);
      } else {
        setErrorMsg(res.message || 'Erreur lors de la création de l\'artiste');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black font-medium text-sm transition"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold text-gray-900">Créer un Artiste</h2>
          <span className="text-[11px] font-mono text-[#FF8A00] font-semibold">
            POST /user/registerArtist
          </span>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-xs text-[#FF8A00] font-semibold hover:underline flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg"
        >
          <Sparkles size={13} />
          <span>Exemple</span>
        </button>
      </div>

      {/* Target Status Banner */}
      <div className="p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF8A00] animate-ping" />
          <span className="text-gray-700">
            Schéma Swagger <strong>/user/registerArtist</strong> : Génère un <strong>trackingId</strong> et un <strong>code de connexion</strong>.
          </span>
        </div>
        {onNavigateToArtistsList && (
          <button
            type="button"
            onClick={onNavigateToArtistsList}
            className="text-xs font-semibold text-[#FF8A00] hover:underline"
          >
            Voir tous les artistes →
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Card Modal when artist is created */}
      {createdArtist && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-orange-50 border-2 border-emerald-300 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Artiste Créé avec Succès
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">{createdArtist.alias}</h3>
                <p className="text-xs text-gray-500">
                  {createdArtist.firstName} {createdArtist.lastName} • {createdArtist.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCreatedArtist(null)}
              className="text-xs text-gray-400 hover:text-gray-700 underline"
            >
              Fermer
            </button>
          </div>

          {/* Key Credentials Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {/* Tracking ID */}
            <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-gray-700">artisteTrackingId (UUID)</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Requis pour /albums/create</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl font-mono text-xs text-gray-800 break-all select-all">
                <span className="truncate pr-2">{createdArtist.trackingId}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdArtist.trackingId, 'trackingId')}
                  className="shrink-0 p-1 text-gray-500 hover:text-[#FF8A00] transition"
                  title="Copier le Tracking ID"
                >
                  {copiedField === 'trackingId' ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Connection Code */}
            <div className="p-3.5 bg-white rounded-2xl border border-orange-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-orange-800">
                <span className="font-bold flex items-center gap-1">
                  <KeyRound size={13} className="text-[#FF8A00]" />
                  Code pour se connecter
                </span>
                <span className="text-[10px] bg-orange-100 text-[#FF8A00] font-bold px-1.5 py-0.5 rounded">
                  Accès Artiste
                </span>
              </div>
              <div className="flex items-center justify-between bg-orange-50/70 border border-orange-200/50 p-2 rounded-xl font-mono text-sm font-bold text-[#FF8A00]">
                <span>{createdArtist.connectionCode}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdArtist.connectionCode, 'code')}
                  className="shrink-0 p-1 text-orange-600 hover:text-black transition"
                  title="Copier le code de connexion"
                >
                  {copiedField === 'code' ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action: Create album directly for this artist */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {onNavigateToCreateAlbum && (
              <button
                type="button"
                onClick={() => onNavigateToCreateAlbum(createdArtist.trackingId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#00BFA6] hover:bg-[#00a892] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Disc size={15} />
                <span>Créer un album avec cet artiste</span>
              </button>
            )}
            {onNavigateToArtistsList && (
              <button
                type="button"
                onClick={onNavigateToArtistsList}
                className="py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition"
              >
                Voir tous les artistes ({createdArtist.alias})
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-mono transition"
            >
              {showRawJson ? 'Masquer JSON' : 'JSON Réponse'}
            </button>
          </div>

          {showRawJson && (
            <div className="p-3 bg-gray-900 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
              <pre>{JSON.stringify(createdArtist.rawResponse || createdArtist, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alias / Stage Name */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[13px] font-semibold text-gray-800 block">
              Nom de scène / Alias <span className="text-[#FF8A00]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FF8A00]">
                <User size={18} />
              </div>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Ex: Kaly Malik, Burna Boy, Tiakola..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none text-sm"
                required
              />
            </div>
            <p className="text-[11px] text-gray-500">Nom public sous lequel paraîtront les albums et chansons.</p>
          </div>

          {/* First Name */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-800 block">
              Prénom (firstName)
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex: Kalidou"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none text-sm"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-800 block">
              Nom de famille (lastName)
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ex: Malik"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none text-sm"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-800 block">
              Email <span className="text-[#FF8A00]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artiste@titantunes.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none text-sm"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-800 block">
              Téléphone (phone)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone size={16} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 77 123 45 67"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[13px] font-semibold text-gray-800 block">
              Mot de passe initial (password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <KeyRound size={16} />
              </div>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Laissez vide pour mot de passe généré automatiquement"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none text-sm font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[13px] font-semibold text-gray-800 block">
              Biographie / Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Courte présentation de l'artiste, style musical, univers artistique..."
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#FF8A00] outline-none text-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A00] to-[#E8A23F] hover:from-[#e07b00] hover:to-[#d08f30] text-white font-bold text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserCheck size={18} />
              <span>Enregistrer l&apos;Artiste (/user/registerArtist)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
