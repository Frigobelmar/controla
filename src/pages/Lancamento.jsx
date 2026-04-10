import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { getCategories, saveTransaction, updateTransaction, deleteTransaction } from '../lib/database';

const Lancamento = ({ type = 'expense', onBack, initialData = null }) => {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [repetitionType, setRepetitionType] = useState('single'); // single, fixed, installments
  const [numInstallments, setNumInstallments] = useState('2');
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const isExpense = type === 'expense';
  const isEditing = !!initialData;
  const themeColor = isExpense ? 'text-error' : 'text-primary-fixed';
  const bgColor = isExpense ? 'bg-error/10' : 'bg-primary-fixed/10';

  useEffect(() => {
    async function loadCategories() {
      if (!user) return;
      try {
        const data = await getCategories(user.id, type);
        setDbCategories(data);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }
    }
    loadCategories();

    if (initialData) {
      setDescription(initialData.descricao || '');
      setCategory(initialData.categoria_id || '');
      setDate(initialData.data_vencimento || new Date().toISOString().split('T')[0]);
      
      // Formata o valor inicial para R$
      if (initialData.valor) {
        const formatted = (parseFloat(initialData.valor)).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        setValue(formatted);
      }
    }
  }, [user, type, initialData]);

  const handleValueChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      setValue('');
      return;
    }
    const numericValue = (parseInt(val) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    setValue(numericValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || loading) return;

    setLoading(true);
    try {
      const numericVal = parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
      
      const txData = {
        value: numericVal,
        description,
        categoryId: category,
        date,
        type,
        installments: repetitionType === 'installments' ? parseInt(numInstallments) : 1,
        isFixed: repetitionType === 'fixed'
      };

      if (isEditing) {
        await updateTransaction(initialData.id, txData);
      } else {
        await saveTransaction(user.id, txData);
      }
      
      onBack();
    } catch (err) {
      console.error('Erro ao salvar lançamento:', err);
      alert('Erro ao salvar lançamento. Verifique se as categorias foram criadas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || loading) return;
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;

    setLoading(true);
    try {
      await deleteTransaction(initialData.id);
      onBack();
    } catch (err) {
      console.error('Erro ao excluir lançamento:', err);
      alert('Erro ao excluir lançamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onBack}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-surface rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] border border-outline-variant/10"
      >
        <div className="p-8">
          
          {/* Internal Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
              {isEditing ? 'Editar' : 'Novo'} Lançamento: <span className={themeColor}>{isExpense ? 'Despesa' : 'Receita'}</span>
            </h2>
            <div className="flex items-center gap-2">
              {isEditing && (
                <button 
                  onClick={handleDelete}
                  title="Excluir"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-error/5 text-error hover:bg-error/10 transition-colors"
                >
                  <Icon name="delete" className="text-sm" />
                </button>
              )}
              <button 
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-on-surface/5 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Icon name="close" className="text-sm" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Value input (Large) */}
            <div className="text-center">
              <input
                autoFocus
                type="text"
                placeholder="R$ 0,00"
                value={value}
                onChange={handleValueChange}
                className={`w-full bg-transparent border-none text-center font-headline font-extrabold text-5xl md:text-6xl focus:ring-0 ${themeColor} tracking-tighter`}
              />
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Supermercado, Aluguel..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-12 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface font-body focus:border-primary-fixed/30 focus:ring-0 transition-all outline-none"
                />
              </div>

              {/* Category Grid */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Categoria</label>
                {dbCategories.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {dbCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                          category === cat.id 
                            ? `${bgColor} border-primary-fixed/40` 
                            : 'bg-on-surface/5 border-transparent grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:bg-on-surface/10'
                        }`}
                      >
                        <Icon name={cat.icone || 'category'} className={`text-lg mb-2 ${category === cat.id ? themeColor : 'text-on-surface'}`} />
                        <span className="text-[8px] font-label uppercase tracking-widest font-bold text-on-surface truncate w-full px-1">
                          {cat.nome}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-on-surface/5 rounded-xl border border-dashed border-outline-variant/20 text-center">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Nenhuma categoria encontrada</p>
                    <p className="text-[8px] text-on-surface-variant/60 mt-1">Crie categorias nos ajustes para continuar.</p>
                  </div>
                )}
              </div>

              {/* Repetition Options */}
              {!isEditing && (
                <div className="space-y-4 pt-2">
                  <div className="flex bg-on-surface/5 p-1 rounded-2xl border border-outline-variant/10">
                    {[
                      { id: 'single', label: 'Único', icon: 'event' },
                      { id: 'fixed', label: 'Fixo', icon: 'refresh' },
                      { id: 'installments', label: 'Parcelado', icon: 'reorder' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRepetitionType(opt.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                          repetitionType === opt.id 
                            ? 'bg-surface shadow-sm text-primary-fixed font-bold' 
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <Icon name={opt.icon} className="text-sm" />
                        <span className="font-label text-[9px] uppercase tracking-wider">{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {repetitionType === 'installments' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 bg-primary-fixed/5 border border-primary-fixed/10 p-4 rounded-2xl"
                    >
                      <div className="flex-1">
                        <p className="font-label text-[9px] uppercase tracking-widest text-primary-fixed-dim mb-1 font-bold">Número de Parcelas</p>
                        <p className="text-[8px] text-on-surface-variant/60 leading-tight">O valor será repetido mensalmente.</p>
                      </div>
                      <input 
                        type="number" 
                        min="2"
                        max="120"
                        value={numInstallments}
                        onChange={(e) => setNumInstallments(e.target.value)}
                        className="w-16 h-10 bg-surface border border-primary-fixed/20 rounded-lg text-center font-bold text-on-surface focus:ring-1 focus:ring-primary-fixed transition-all outline-none"
                      />
                    </motion.div>
                  )}

                  {repetitionType === 'fixed' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-primary-fixed/5 border border-primary-fixed/10 p-4 rounded-2xl flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-fixed/10 flex items-center justify-center text-primary-fixed">
                        <Icon name="event_repeat" className="text-sm" />
                      </div>
                      <div>
                        <p className="font-label text-[9px] uppercase tracking-widest text-primary-fixed-dim font-bold">Recorrência Mensal</p>
                        <p className="text-[8px] text-on-surface-variant/60">Este lançamento será marcado como fixo.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Data</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-12 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface font-body focus:border-primary-fixed/30 transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={!value || !category || loading}
              className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 font-label font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale ${
                isExpense ? 'bg-error text-white shadow-lg shadow-error/20' : 'bg-primary-fixed text-on-primary shadow-lg shadow-primary-fixed/20'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Icon name={isEditing ? 'check_circle' : (isExpense ? 'remove_circle_outline' : 'add_circle_outline')} className="text-base" />
                  <span>{isEditing ? 'Salvar Alterações' : `Lançar ${isExpense ? 'Despesa' : 'Receita'}`}</span>
                </>
              )}
            </button>

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Lancamento;
