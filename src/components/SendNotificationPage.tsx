import React, { useState } from 'react';
import {
  ArrowLeft,
  BellRing,
  Send,
  Image as ImageIcon,
  Info,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { api } from '../services/api';
import { AppNotification } from '../types';

interface SendNotificationPageProps {
  onBack: () => void;
  onNotificationSent: (notification: AppNotification) => void;
  recentNotifications: AppNotification[];
}

export const SendNotificationPage: React.FC<SendNotificationPageProps> = ({
  onBack,
  onNotificationSent,
  recentNotifications,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [targetAudience, setTargetAudience] = useState('Tous les abonnés');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const sampleNotifications = [
    {
      title: '🔥 Nouveau hit disponible !',
      body: 'Écoutez le nouveau single "Sunset Chillout" dès maintenant sur Titan Tunes.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: '🎉 Playlist de la semaine mise à jour',
      body: 'Découvrez 15 nouveaux morceaux exclusifs ajoutés à Titan Top Hits 2026.',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleFillDemo = (sample = sampleNotifications[0]) => {
    setTitle(sample.title);
    setBody(sample.body);
    setImage(sample.image);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Veuillez entrer le titre de la notification');
      return;
    }
    if (!body.trim()) {
      setErrorMsg('Veuillez rédiger le message de la notification');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Calls endpoint: /notification/broadcast
      const result = await api.broadcastNotification({
        title: title.trim(),
        body: body.trim(),
        image: image.trim() || undefined,
        targetAudience,
      });

      if (result.success && result.notification) {
        setSuccessMsg('Notification envoyée avec succès 🚀');
        onNotificationSent(result.notification);
        setTimeout(() => {
          onBack();
        }, 1200);
      } else {
        setErrorMsg(result.message || 'Erreur lors de l\'envoi de la notification');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top AppBar */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black font-medium text-sm transition"
        >
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>
        <h2 className="text-base font-semibold text-gray-800">Envoyer une notification</h2>
        <button
          type="button"
          onClick={() => handleFillDemo()}
          className="text-xs text-[#FF8A00] font-medium hover:underline flex items-center gap-1"
        >
          <Sparkles size={13} />
          Exemple
        </button>
      </div>

      {/* Header Info Box */}
      <div className="p-4 rounded-xl bg-[#FF8A00]/10 border border-[#FF8A00]/30 flex items-start gap-3">
        <Info className="text-[#FF8A00] shrink-0 mt-0.5" size={20} />
        <p className="text-xs text-gray-700 leading-relaxed">
          Cette notification push sera transmise instantanément sur les smartphones de vos abonnés Titan Tunes.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg} Redirection en cours...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Field: Titre Notification */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-800 block">Titre de la notification</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FF8A00]">
              <BellRing size={19} />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: 🔥 Nouveau single disponible !"
              required
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-gray-300 focus:border-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00]/20 text-sm outline-none transition shadow-sm"
            />
          </div>
        </div>

        {/* Field: Corps / Message */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-800 block">Message (Corps)</label>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Écrivez le message de la notification ici..."
            required
            className="w-full p-3.5 rounded-xl bg-white border border-gray-300 focus:border-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00]/20 text-sm outline-none transition shadow-sm resize-none"
          />
        </div>

        {/* Field: Image URL (Optionnel) */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-800 block">URL de l&apos;image d&apos;accroche (Optionnel)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FF8A00]">
              <ImageIcon size={19} />
            </div>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://...jpg"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-gray-300 focus:border-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00]/20 text-sm outline-none transition shadow-sm font-mono text-xs"
            />
          </div>
        </div>

        {/* Audience Target */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-800 block">Audience ciblée</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Users size={18} />
            </div>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border border-gray-300 focus:border-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00]/20 text-sm outline-none transition shadow-sm"
            >
              <option value="Tous les abonnés">Tous les abonnés (Broadcast global)</option>
              <option value="Abonnés VIP / Premium">Abonnés VIP / Premium</option>
              <option value="Nouveaux auditeurs (30 derniers jours)">Nouveaux auditeurs (30 derniers jours)</option>
            </select>
          </div>
        </div>

        {/* Live Smartphone Push Preview */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
            <Smartphone size={14} />
            <span>Aperçu de la notification sur mobile</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-900 text-white shadow-lg border border-gray-800">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#FF8A00] flex items-center justify-center text-[9px] font-black text-white">
                  T
                </div>
                <span className="font-semibold text-gray-200">TITAN TUNES</span>
              </div>
              <span>Maintenant</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h6 className="text-xs font-bold text-white truncate">
                  {title || 'Titre de la notification'}
                </h6>
                <p className="text-[11px] text-gray-300 line-clamp-2 mt-0.5 leading-relaxed">
                  {body || 'Votre message apparaîtra ici tel qu\'il sera lu par les utilisateurs.'}
                </p>
              </div>

              {image && (
                <img
                  src={image}
                  alt="Notif Preview"
                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-13 rounded-full bg-[#FF8A00] hover:bg-[#e67c00] active:scale-[0.99] text-white font-semibold text-base shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                <span>Diffuser la notification</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* History of recent notifications */}
      {recentNotifications.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Historique des envois récents ({recentNotifications.length})
          </h4>
          <div className="space-y-2">
            {recentNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs flex items-start gap-2.5 text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF8A00] flex items-center justify-center shrink-0 mt-0.5">
                  <BellRing size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 truncate">{notif.title}</span>
                    <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-1">
                      {new Date(notif.sentAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] truncate mt-0.5">{notif.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
