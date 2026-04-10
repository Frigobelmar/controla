import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { saveEvent } from '../lib/database';

const CORES = [
  { bg: 'bg-primary-fixed/10', text: 'text-primary-fixed', valor: 'verde' },
  { bg: 'bg-error/10',         text: 'text-error',         valor: 'vermelho' },
  { bg: 'bg-blue-500/10',      text: 'text-blue-400',      valor: 'azul' },
  { bg: 'bg-amber-500/10',     text: 'text-amber-400',     valor: 'amarelo' },
  { bg: 'bg-purple-500/10',    text: 'text-purple-400',    valor: 'roxo' },
  { bg: 'bg-pink-500/10',      text: 'text-pink-400',      valor: 'rosa' },
];

const ICONES_CAT = ['event', 'groups', 'smart_toy', 'receipt_long', 'local_hospital', 'school', 'fitness_center', 'flight', 'home', 'work'];

const DEFAULTS = [
  { id: 'reuniao',  label: 'Reunião',  icone: 'groups',    cor: 'verde' },
  { id: 'ia',       label: 'IA',       icone: 'smart_toy', cor: 'verde' },
  { id: 'fiscal',   label: 'Fiscal',   icone: 'receipt_long', cor: 'vermelho' },
  { id: 'lembrete', label: 'Lembrete', icone: 'event',     cor: 'amarelo' },
];

function loadCats() {
  try {
    const raw = localStorage.getItem('cats_evento');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCats(cats) {
  localStorage.setItem('cats_evento', JSON.stringify(cats));
}

const NovoEvento = ({ onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [gerenciar, setGerenciar] = useState(false);
  const [customCats, setCustomCats] = useState(loadCats);
  const [newLabel, setNewLabel] = useState('');
  const [newIcone, setNewIcone] = useState('event');
  const [newCor, setNewCor]     = useState('verde');

  const allCats = [...DEFAULTS, ...customCats];

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    tag: 'Reunião',
    description: '',
  });

  useEffect(() => {
    saveCats(customCats);
  }, [customCats]);

  function addCat() {
    if (!newLabel.trim()) return;
    const nova = { id: Date.now().toString(), label: newLabel.trim(), icone: newIcone, cor: newCor };
    setCustomCats((prev) => [...prev, nova]);
    setNewLabel('');
    setNewIcone('event');
    setNewCor('verde');
  }

  function deleteCat(id) {
    setCustomCats((prev) => prev.filter((c) => c.id !== id));
    if (formData.tag === allCats.find((c) => c.id === id)?.label) {
      setFormData((f) => ({ ...f, tag: 'Reunião' }));
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || loading) return;
    setLoading(true);
    try {
      await saveEvent(user.id, formData);
      onBack();
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      alert('Erro ao salvar evento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const corClass = (cor) => CORES.find((c) => c.valor === cor) ?? CORES[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onBack}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-surface rounded-3xl overflow-hidden border border-outline-variant/10 shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">
              {gerenciar ? 'Categorias' : 'Novo Evento'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGerenciar((v) => !v)}
              title="Gerenciar categorias"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                gerenciar ? 'bg-primary-fixed text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="category" className="text-[18px]" />
            </button>
            <button onClick={onBack} className="p-2 rounded-full hover:bg-on-surface/5 text-on-surface-variant transition-colors">
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-8 pb-8">
          <AnimatePresence mode="wait">

            {/* ── Painel Gerenciar Categorias ── */}
            {gerenciar ? (
              <motion.div key="gerenciar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 pt-2">

                {/* Formulário nova categoria */}
                <div className="space-y-3 p-4 bg-surface-container-low rounded-2xl">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Nova categoria</p>
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Nome da categoria"
                    onKeyDown={(e) => e.key === 'Enter' && addCat()}
                    className="w-full h-11 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface text-sm outline-none focus:border-primary-fixed/40 transition-all"
                  />

                  {/* Seletor de ícone */}
                  <div>
                    <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-2">Ícone</p>
                    <div className="flex flex-wrap gap-2">
                      {ICONES_CAT.map((ic) => (
                        <button
                          key={ic} type="button" onClick={() => setNewIcone(ic)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            newIcone === ic ? 'bg-primary-fixed text-on-primary' : 'bg-on-surface/5 text-on-surface-variant hover:bg-on-surface/10'
                          }`}
                        >
                          <Icon name={ic} className="text-[18px]" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seletor de cor */}
                  <div>
                    <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-2">Cor</p>
                    <div className="flex gap-2">
                      {CORES.map((c) => (
                        <button
                          key={c.valor} type="button" onClick={() => setNewCor(c.valor)}
                          className={`w-8 h-8 rounded-lg ${c.bg} ${c.text} flex items-center justify-center transition-all ${
                            newCor === c.valor ? 'ring-2 ring-offset-1 ring-offset-surface-container-low ring-primary-fixed scale-110' : ''
                          }`}
                        >
                          <Icon name="circle" className="text-[12px]" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button" onClick={addCat} disabled={!newLabel.trim()}
                    className="w-full h-10 rounded-xl bg-primary-fixed text-on-primary font-label text-[10px] uppercase tracking-widest font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
                  >
                    Adicionar Categoria
                  </button>
                </div>

                {/* Lista */}
                <div className="space-y-2">
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Todas as categorias</p>
                  {allCats.map((cat) => {
                    const cc = corClass(cat.cor);
                    const isDefault = DEFAULTS.some((d) => d.id === cat.id);
                    return (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cc.bg} ${cc.text}`}>
                            <Icon name={cat.icone} className="text-[18px]" />
                          </div>
                          <span className="font-body font-semibold text-on-surface text-sm">{cat.label}</span>
                          {isDefault && (
                            <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">Padrão</span>
                          )}
                        </div>
                        {!isDefault && (
                          <button
                            type="button" onClick={() => deleteCat(cat.id)}
                            className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors"
                          >
                            <Icon name="delete_outline" className="text-[16px]" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button" onClick={() => setGerenciar(false)}
                  className="w-full py-3 rounded-2xl bg-primary-fixed text-on-primary font-headline font-bold hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  Concluído
                </button>
              </motion.div>

            ) : (

              /* ── Formulário Novo Evento ── */
              <motion.form key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSubmit} className="space-y-6 pt-2">

                <div>
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Título do Evento</label>
                  <input
                    type="text" required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Sync com IA Agent"
                    className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-fixed/50 transition-all font-body"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Data</label>
                    <input
                      type="date" required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface focus:outline-none focus:border-primary-fixed/50 transition-all font-body text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Horário</label>
                    <input
                      type="time" required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface focus:outline-none focus:border-primary-fixed/50 transition-all font-body text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Categoria</label>
                    <button
                      type="button" onClick={() => setGerenciar(true)}
                      className="flex items-center gap-1 text-primary-fixed font-label text-[9px] uppercase tracking-widest hover:underline"
                    >
                      <Icon name="edit" className="text-[12px]" />
                      Gerenciar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allCats.map((cat) => {
                      const cc = corClass(cat.cor);
                      const isSelected = formData.tag === cat.label;
                      return (
                        <button
                          key={cat.id} type="button"
                          onClick={() => setFormData({ ...formData, tag: cat.label })}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all font-label text-[10px] uppercase tracking-widest ${
                            isSelected
                              ? 'bg-primary-fixed text-on-primary border-primary-fixed shadow-lg shadow-primary-fixed/20'
                              : `bg-on-surface/5 border-outline-variant/10 ${cc.text} hover:border-outline-variant/20`
                          }`}
                        >
                          <Icon name={cat.icone} className="text-[14px]" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Descrição (Opcional)</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes do compromisso..."
                    className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-fixed/50 transition-all font-body text-sm resize-none"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-5 rounded-2xl bg-primary-fixed text-on-primary font-headline font-bold text-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(175,255,10,0.15)]"
                >
                  {loading
                    ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    : 'Agendar Evento'
                  }
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default NovoEvento;
