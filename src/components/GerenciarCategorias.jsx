import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../lib/database';

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
  const [meta, setMeta] = useState('');

  // Estado de edição completo
  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editIcone, setEditIcone] = useState('');
  const [editMeta, setEditMeta] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

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
      const nova = await createCategory(user.id, {
        nome: nome.trim(),
        icone,
        tipo: activeTab,
        meta: meta !== '' ? meta : null,
      });
      const normalizedNova = {
        ...nova,
        tipo: nova.tipo?.toLowerCase() || activeTab
      };
      setCategorias((prev) => [...prev, normalizedNova]);
      setNome('');
      setIcone('receipt_long');
      setMeta('');
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

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditNome(cat.nome);
    setEditIcone(cat.icone || 'category');
    setEditMeta(cat.meta != null ? String(cat.meta) : '');
  }

  async function handleSaveEdit(id) {
    if (!editNome.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await updateCategory(id, {
        nome: editNome.trim(),
        icone: editIcone,
        meta: editMeta !== '' ? editMeta : null
      });
      setCategorias(prev =>
        prev.map(c => c.id === id ? { ...c, nome: updated.nome, icone: updated.icone, meta: updated.meta } : c)
      );
      setEditingId(null);
    } catch (e) {
      setError('Erro ao salvar alterações.');
    } finally {
      setSavingEdit(false);
    }
  }

  const formatCurrency = (val) =>
    Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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

        <div className="px-6 py-4 max-h-[65vh] overflow-y-auto space-y-4">
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

            {/* Meta de orçamento - só para despesas */}
            {activeTab === 'despesa' && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-body">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={meta}
                  onChange={(e) => setMeta(e.target.value)}
                  placeholder="Meta de gasto (opcional)"
                  className="w-full h-11 bg-on-surface/5 border border-outline-variant/10 rounded-xl pl-10 pr-4 text-on-surface text-sm font-body outline-none focus:border-error/30 transition-all"
                />
              </div>
            )}

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
                    className="flex flex-col p-3 bg-surface-container-low rounded-xl gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          cat.tipo === 'despesa' ? 'bg-error/10 text-error' : 'bg-primary-fixed/10 text-primary-fixed'
                        }`}>
                          <Icon name={cat.icone || 'category'} className="text-[18px]" />
                        </div>
                        <div>
                          <span className="font-body font-semibold text-on-surface text-sm">{cat.nome}</span>
                          {cat.tipo === 'despesa' && cat.meta != null && (
                            <p className="text-on-surface-variant text-[10px]">Meta: {formatCurrency(cat.meta)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => editingId === cat.id ? setEditingId(null) : startEdit(cat)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            editingId === cat.id
                              ? 'bg-primary-fixed/20 text-primary-fixed'
                              : 'bg-on-surface/5 text-on-surface-variant hover:bg-on-surface/10'
                          }`}
                          title="Editar"
                        >
                          <Icon name="edit" className="text-[15px]" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors"
                        >
                          <Icon name="delete_outline" className="text-[16px]" />
                        </button>
                      </div>
                    </div>

                    {/* Editor expandido inline */}
                    <AnimatePresence>
                      {editingId === cat.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden space-y-3 pt-2 mt-2 border-t border-outline-variant/10"
                        >
                          <div className="flex gap-2">
                            <input
                              value={editNome}
                              onChange={(e) => setEditNome(e.target.value)}
                              placeholder="Nome"
                              className="flex-1 h-9 bg-on-surface/5 border border-outline-variant/20 rounded-lg px-3 text-on-surface text-xs outline-none focus:border-primary-fixed/30 transition-all"
                            />
                            {cat.tipo === 'despesa' && (
                              <div className="relative w-28">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[10px]">R$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editMeta}
                                  onChange={(e) => setEditMeta(e.target.value)}
                                  placeholder="Meta"
                                  className="w-full h-9 bg-on-surface/5 border border-outline-variant/20 rounded-lg pl-6 pr-2 text-on-surface text-xs outline-none focus:border-primary-fixed/30 transition-all"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Seletor de ícone para edição */}
                          <div className="flex flex-wrap gap-1.5">
                            {ICONES.map((ic) => (
                              <button
                                key={ic}
                                type="button"
                                onClick={() => setEditIcone(ic)}
                                className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                                  editIcone === ic
                                    ? cat.tipo === 'despesa' ? 'bg-error text-white' : 'bg-primary-fixed text-on-primary'
                                    : 'bg-on-surface/5 text-on-surface-variant hover:bg-on-surface/10'
                                }`}
                              >
                                <Icon name={ic} className="text-[14px]" />
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingId(null)}
                              className="h-8 px-3 rounded-lg bg-on-surface/10 text-on-surface-variant text-xs hover:bg-on-surface/20 transition-all"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveEdit(cat.id)}
                              disabled={savingEdit || !editNome.trim()}
                              className={`h-8 px-4 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 ${
                                cat.tipo === 'despesa' ? 'bg-error text-white' : 'bg-primary-fixed text-on-primary'
                              }`}
                            >
                              {savingEdit ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <><Icon name="check" className="text-sm" /> Salvar</>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
