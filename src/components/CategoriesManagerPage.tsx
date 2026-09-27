import React, { useState } from 'react';
import {
  ArrowLeft,
  Tag,
  Plus,
  Trash2,
  Search,
  Check,
  Music,
  Code2,
} from 'lucide-react';
import { Category, BackendConfig } from '../types';
import { api } from '../services/api';

interface CategoriesManagerPageProps {
  onBack: () => void;
  categories: Category[];
  onRefreshCategories: () => void;
  onNavigateAddSongWithCategory?: (categoryTrackingId: string) => void;
  backendConfig?: BackendConfig;
  showEndpoints?: boolean;
}

export const CategoriesManagerPage: React.FC<CategoriesManagerPageProps> = ({
  onBack,
  categories,
  onRefreshCategories,
  onNavigateAddSongWithCategory,
  showEndpoints = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [nomCategorie, setNomCategorie] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    trackingId: string;
    nomCategorie: string;
  } | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomCategorie.trim()) {
      setErrorMsg('Veuillez entrer le nom de la catégorie');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.createCategory({
        nomCategorie: nomCategorie.trim(),
      });

      if (res.success && res.trackingId) {
        setSuccessResult({
          trackingId: res.trackingId,
          nomCategorie: res.nomCategorie || nomCategorie.trim(),
        });
        setNomCategorie('');
        onRefreshCategories();
      } else {
        setErrorMsg(res.message || 'Erreur lors de la création de la catégorie');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur de communication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Supprimer définitivement la catégorie "${cat.nomCategorie}" ?`)) return;
    try {
      await api.deleteCategory(cat.trackingId);
      onRefreshCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.nomCategorie.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sampleSuggestions = ['Afrobeat', 'Amapiano', 'Zoblazo', 'Afro-Pop', 'Coupé-Décalé', 'Highlife', 'Bikutsi', 'Kizomba'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
            title="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Catégories Musicales</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {categories.length}
              </span>
            </div>
            {showEndpoints ? (
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                POST /categorie/create &bull; GET /categorie/getAll
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">
                Genres et styles pour organiser vos morceaux
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setIsCreateModalOpen(true);
            setSuccessResult(null);
            setErrorMsg(null);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {/* Swagger Documentation Box - Masqué par défaut sauf si showEndpoints activé */}
      {showEndpoints && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/70 to-orange-50/70 border border-amber-200/80 text-xs text-gray-700 space-y-2">
          <div className="flex items-center justify-between font-semibold text-amber-900">
            <span className="flex items-center gap-1.5">
              <Code2 size={16} className="text-amber-600" />
              Schémas d&apos;intégration Swagger /categorie
            </span>
            <span className="font-mono text-[11px] bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded">
              Swagger 2.0 / OpenAPI
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-white/90 p-3 rounded-lg border border-amber-200 font-mono text-[11px]">
              <p className="font-semibold text-gray-500 mb-1 text-[10px]">PAYLOAD (POST /categorie/create)</p>
              <pre className="text-amber-800 overflow-x-auto">{`{\n  "nomCategorie": "string"\n}`}</pre>
            </div>
            <div className="bg-white/90 p-3 rounded-lg border border-amber-200 font-mono text-[11px]">
              <p className="font-semibold text-gray-500 mb-1 text-[10px]">RÉPONSE (GET /categorie/getAll)</p>
              <pre className="text-emerald-800 overflow-x-auto">{`{\n  "trackingId": "uuid",\n  "nomCategorie": "Afrobeat"\n}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une catégorie (Afrobeat, Amapiano, etc.)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition shadow-xs"
          />
        </div>
      </div>

      {/* Categories Grid - Affiche uniquement les catégories créées (Afrobeat, Amapiano, etc.) sans trackingId */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.trackingId}
            className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Tag size={19} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 group-hover:text-amber-600 transition">
                    {cat.nomCategorie}
                  </h4>
                  <span className="text-[11px] text-gray-400 font-medium">Style musical</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteCategory(cat)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                title="Supprimer la catégorie"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Actions & bouton de création */}
            <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
              {showEndpoints && (
                <div className="text-[10px] font-mono text-gray-400 truncate">
                  ID: {cat.trackingId}
                </div>
              )}

              {onNavigateAddSongWithCategory && (
                <button
                  onClick={() => onNavigateAddSongWithCategory(cat.trackingId)}
                  className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-800 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Music size={13} />
                  <span>Ajouter un morceau {cat.nomCategorie}</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 text-xs bg-white rounded-2xl border border-dashed border-gray-200">
            Aucune catégorie trouvée correspondant à votre recherche.
          </div>
        )}
      </div>

      {/* Modal Nouvelle Catégorie */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Nouvelle Catégorie</h3>
                  <p className="text-[11px] text-gray-500">Ajoutez un genre musical au catalogue</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMsg}
              </div>
            )}

            {successResult ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Check size={18} className="text-emerald-600" />
                  <span>Catégorie « {successResult.nomCategorie} » créée avec succès !</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (onNavigateAddSongWithCategory) {
                        onNavigateAddSongWithCategory(successResult.trackingId);
                      }
                      setIsCreateModalOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Créer un morceau avec ce genre →
                  </button>
                  <button
                    onClick={() => {
                      setSuccessResult(null);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-semibold text-xs hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Ajouter une autre
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Nom de la catégorie *
                  </label>
                  <input
                    type="text"
                    value={nomCategorie}
                    onChange={(e) => setNomCategorie(e.target.value)}
                    placeholder="Ex: Afrobeat, Amapiano, Zoblazo..."
                    required
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs outline-none transition"
                  />
                </div>

                {/* Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-gray-400 font-medium">Suggestions :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleSuggestions.map((s, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setNomCategorie(s)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-amber-50 hover:text-amber-800 border border-gray-200 transition cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Création...' : 'Créer la catégorie'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
