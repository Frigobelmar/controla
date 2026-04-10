import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { getCategories, createCategory, deleteCategory } from '../lib/database';

const ICONES = [
  'fastfood', 'directions_car', 'home', 'school', 'local_hospital',
  'shopping_cart', 'flight', 'sports_esports', 'fitness_center', 'pets',
  'attach_money', 'work', 'trending_up', 'savings', 'card_giftcard',
  'receipt_long', 'local_gas_station', 'restaurant', 'phone_android', 'wifi',
];

const GerenciarCategorias = ({ onClose }) => {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('despesa');

  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('receipt_long');

  useEffect(() => {
    load();
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getCategories(user.id);
      const normalized = data.map(cat => ({
        ...cat,
        tipo: cat.tipo?.toLowerCase() || 'despesa'
      }));
      setCategorias(normalized);
    } catch (e) {
      setError('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const nova = await createCategory(user.id, { nome: nome.trim(), icone, tipo: activeTab });
      const normalizedNova = {
        ...nova,
        tipo: nova.tipo?.toLowerCase() || activeTab
      };
      setCategorias((prev) => [...prev, normalizedNova]);
      setNome('');
      setIcone('receipt_long');
    } catch (e) {
      setError(e?.message ?? 'Erro ao criar categoria.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCategory(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError('Erro ao excluir categoria.');
    }
  }

  const filtradas = categorias.filter((c) => c.tipo === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-surface rounded-[2rem] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/10">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Configurações</p>
            <h2 className="font-headline font-bold text-xl text-on-surface">Categorias</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <Icon name="close" className="text-on-surface-variant text-[18px]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-on-surface/5 mx-6 mt-4 rounded-xl p-1">
          {['despesa', 'receita'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-lg font-headline font-bold text-sm capitalize transition-all ${
                activeTab === t
                  ? t === 'despesa' ? 'bg-error text-white shadow' : 'bg-primary-fixed text-on-primary shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t === 'despesa' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Formulário nova categoria */}
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-2">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da categoria"
                className="flex-1 h-11 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface text-sm font-body outline-none focus:border-primary-fixed/30 transition-all"
              />
              <button
                type="submit"
                disabled={saving || !nome.trim()}
                className={`h-11 px-4 rounded-xl font-bold text-sm transition-all disabled:opacity-40 ${
                  activeTab === 'despesa'
                    ? 'bg-error text-white hover:brightness-110'
                    : 'bg-primary-fixed text-on-primary hover:brightness-110'
                }`}
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="add" className="text-[18px]" />}
              </button>
            </div>

            {/* Seletor de ícone */}
            <div className="flex flex-wrap gap-2">
              {ICONES.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcone(ic)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    icone === ic
                      ? activeTab === 'despesa' ? 'bg-error text-white' : 'bg-primary-fixed text-on-primary'
                      : 'bg-on-surface/5 text-on-surface-variant hover:bg-on-surface/10'
                  }`}
                >
                  <Icon name={ic} className="text-[18px]" />
                </button>
              ))}
            </div>
          </form>

          {error && <p className="text-error text-xs font-bold uppercase tracking-widest text-center">{error}</p>}

          {/* Lista de categorias */}
          <div className="space-y-2">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin" />
              </div>
            ) : filtradas.length === 0 ? (
              <p className="text-on-surface-variant text-xs text-center py-6">Nenhuma categoria criada.</p>
            ) : (
              <AnimatePresence>
                {filtradas.map((cat) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        cat.tipo === 'despesa' ? 'bg-error/10 text-error' : 'bg-primary-fixed/10 text-primary-fixed'
                      }`}>
                        <Icon name={cat.icone || 'category'} className="text-[18px]" />
                      </div>
                      <span className="font-body font-semibold text-on-surface text-sm">{cat.nome}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors"
                    >
                      <Icon name="delete_outline" className="text-[16px]" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GerenciarCategorias;
