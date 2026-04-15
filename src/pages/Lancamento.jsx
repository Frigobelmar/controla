import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/Icon';
import { BancoBadge } from '../components/GerenciarContas';
import { useAuth } from '../contexts/AuthContext';
import { getCategories, saveTransaction, updateTransaction, deleteTransaction, createCategory, getContas, uploadAnexo } from '../lib/database';

const ICONES_RAPIDOS = [
  'fastfood', 'directions_car', 'home', 'school', 'local_hospital',
  'shopping_cart', 'flight', 'sports_esports', 'fitness_center', 'pets',
  'attach_money', 'work', 'trending_up', 'savings', 'card_giftcard',
  'receipt_long', 'local_gas_station', 'restaurant', 'phone_android', 'wifi',
];

const Lancamento = ({ type = 'expense', onBack, initialData = null }) => {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [repetitionType, setRepetitionType] = useState('single'); // single, fixed, installments
  const [numInstallments, setNumInstallments] = useState('2');
  const [dbCategories, setDbCategories] = useState([]);
  const [contas, setContas] = useState([]);
  const [contaId, setContaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [anexos, setAnexos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [partialValue, setPartialValue] = useState('');
  const [showPartial, setShowPartial] = useState(false);

  // ── Nova categoria inline ─────────────────────────────────────────────────
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatNome, setNewCatNome] = useState('');
  const [newCatIcone, setNewCatIcone] = useState('receipt_long');
  const [savingCat, setSavingCat] = useState(false);
  const [catError, setCatError] = useState('');
  const newCatInputRef = useRef(null);

  const isExpense = type === 'expense';
  const isEditing = !!initialData;
  const themeColor = isExpense ? 'text-error' : 'text-primary-fixed';
  const bgColor    = isExpense ? 'bg-error/10'  : 'bg-primary-fixed/10';
  const accentBg   = isExpense ? 'bg-error'     : 'bg-primary-fixed';
  const accentText = isExpense ? 'text-error'   : 'text-primary-fixed';
  const borderAccent = isExpense ? 'border-error/30' : 'border-primary-fixed/30';

  useEffect(() => {
    loadCategories();
    loadContas();

    if (initialData) {
      setDescription(initialData.descricao || '');
      setCategory(initialData.categoria_id || '');
      setContaId(initialData.conta_id || '');
      setDate(initialData.data_vencimento || new Date().toLocaleDateString('sv-SE'));
      if (initialData.valor) {
        const formatted = parseFloat(initialData.valor).toLocaleString('pt-BR', {
          style: 'currency', currency: 'BRL',
        });
        setValue(formatted);
      }
      setIsPaid(initialData.status === 'PAGO');
      setAnexos(initialData.anexos || []);
    }
  }, [user, type, initialData]);

  async function loadContas() {
    if (!user) return;
    try {
      const data = await getContas(user.id);
      setContas(data);
      // Seleciona a conta padrão automaticamente
      const padrao = data.find(c => c.padrao);
      if (padrao && !initialData) setContaId(padrao.id);
    } catch (e) {
      console.error('Erro ao carregar contas:', e);
    }
  }

  async function loadCategories() {
    if (!user) return;
    try {
      const data = await getCategories(user.id, type);
      setDbCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  }

  const handleValueChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val === '') { setValue(''); return; }
    const numericValue = (parseInt(val) / 100).toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL',
    });
    setValue(numericValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || loading) return;
    setLoading(true);
    try {
      const numericVal = parseFloat(
        value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
      );
      const txData = {
        value: numericVal,
        description,
        categoryId: category,
        contaId: contaId || null,
        date,
        type,
        status: isPaid ? 'PAGO' : 'PENDENTE',
        anexos: anexos,
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
      alert(`Erro ao salvar lançamento: ${err.message || 'Verifique sua conexão e os dados inseridos.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const results = await Promise.all(
        files.map(file => uploadAnexo(user.id, file))
      );
      setAnexos(prev => [...prev, ...results]);
    } catch (err) {
      console.error('Erro no upload:', err);
      alert('Falha ao enviar arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const removeAnexo = (index) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
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

  // ── Criar categoria nova inline ───────────────────────────────────────────
  async function handleCreateCategory() {
    if (!newCatNome.trim()) return;
    setSavingCat(true);
    setCatError('');
    try {
      const nova = await createCategory(user.id, {
        nome: newCatNome.trim(),
        icone: newCatIcone,
        tipo: type === 'expense' ? 'despesa' : 'receita',
      });
      const normalized = { ...nova, tipo: nova.tipo?.toLowerCase() };
      setDbCategories(prev => [...prev, normalized]);
      setCategory(nova.id); // seleciona automaticamente
      setNewCatNome('');
      setNewCatIcone('receipt_long');
      setShowNewCat(false);
    } catch (e) {
      setCatError(e?.message ?? 'Erro ao criar categoria.');
    } finally {
      setSavingCat(false);
    }
  }

  function openNewCat() {
    setShowNewCat(true);
    setNewCatNome('');
    setNewCatIcone('receipt_long');
    setCatError('');
    setTimeout(() => newCatInputRef.current?.focus(), 100);
  }

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
              {isEditing ? 'Editar' : 'Novo'} Lançamento:{' '}
              <span className={themeColor}>{isExpense ? 'Despesa' : 'Receita'}</span>
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
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">
                  Descrição
                </label>
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
                <div className="flex items-center justify-between ml-1">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Categoria
                  </label>
                  {!showNewCat && (
                    <button
                      type="button"
                      onClick={openNewCat}
                      className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${accentText} hover:opacity-80 transition-opacity`}
                    >
                      <Icon name="add_circle_outline" className="text-sm" />
                      Nova Categoria
                    </button>
                  )}
                </div>

                {/* ── Mini-formulário de nova categoria ── */}
                <AnimatePresence>
                  {showNewCat && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className={`p-4 rounded-2xl border ${borderAccent} bg-on-surface/3 mb-3 space-y-3`}>
                        <div className="flex items-center justify-between">
                          <p className={`font-label text-[10px] uppercase tracking-widest font-bold ${accentText}`}>
                            Nova Categoria
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowNewCat(false)}
                            className="text-on-surface-variant hover:text-on-surface transition-colors"
                          >
                            <Icon name="close" className="text-sm" />
                          </button>
                        </div>

                        {/* Nome */}
                        <input
                          ref={newCatInputRef}
                          type="text"
                          value={newCatNome}
                          onChange={(e) => setNewCatNome(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                          placeholder="Nome da categoria"
                          className="w-full h-10 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface text-sm font-body outline-none focus:border-primary-fixed/30 transition-all"
                        />

                        {/* Seletor de ícone */}
                        <div className="flex flex-wrap gap-1.5">
                          {ICONES_RAPIDOS.map((ic) => (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => setNewCatIcone(ic)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-[16px] ${
                                newCatIcone === ic
                                  ? `${accentBg} text-white`
                                  : 'bg-on-surface/5 text-on-surface-variant hover:bg-on-surface/10'
                              }`}
                            >
                              <Icon name={ic} className="text-[16px]" />
                            </button>
                          ))}
                        </div>

                        {catError && (
                          <p className="text-error text-[10px] font-bold uppercase tracking-widest">{catError}</p>
                        )}

                        {/* Botões */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={savingCat || !newCatNome.trim()}
                            className={`flex-1 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 ${accentBg} text-white hover:brightness-110`}
                          >
                            {savingCat
                              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <><Icon name="add" className="text-sm" /> Criar e Selecionar</>
                            }
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewCat(false)}
                            className="h-9 px-4 rounded-xl bg-on-surface/10 text-on-surface-variant text-xs hover:bg-on-surface/20 transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Grid de categorias existentes */}
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
                        <span className="text-[8px] font-label uppercase tracking-widest font-bold text-on-surface truncate w-full px-1 text-center">
                          {cat.nome}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  !showNewCat && (
                    <div className="p-4 bg-on-surface/5 rounded-xl border border-dashed border-outline-variant/20 text-center">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Nenhuma categoria ainda</p>
                      <button
                        type="button"
                        onClick={openNewCat}
                        className={`mt-2 text-[9px] font-bold uppercase tracking-widest ${accentText} hover:opacity-80`}
                      >
                        + Criar primeira categoria
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* Repetition Options */}
              {!isEditing && (
                <div className="space-y-4 pt-2">
                  <div className="flex bg-on-surface/5 p-1 rounded-2xl border border-outline-variant/10">
                    {[
                      { id: 'single',       label: 'Único',     icon: 'event' },
                      { id: 'fixed',        label: 'Fixo',      icon: 'refresh' },
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

              {/* Data de Vencimento */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">
                  Data de Vencimento
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    <Icon name="calendar_today" className="text-sm" />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-12 bg-on-surface/5 border border-outline-variant/10 rounded-xl pl-11 pr-4 text-on-surface font-body focus:border-primary-fixed/30 focus:ring-0 transition-all outline-none appearance-none"
                  />
                </div>
              </div>

              {/* Conta Bancária */}

              {contas.length > 0 && (
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Conta</label>
                  <div className="grid grid-cols-2 gap-2">
                    {contas.map(conta => (
                      <button
                        key={conta.id}
                        type="button"
                        onClick={() => setContaId(conta.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          contaId === conta.id
                            ? `${bgColor} border-primary-fixed/40`
                            : 'bg-on-surface/5 border-transparent opacity-60 hover:opacity-100 hover:bg-on-surface/10'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0 shadow"
                          style={{ backgroundColor: conta.banco_cor || '#6B7280' }}
                        >
                          {conta.banco_nome?.slice(0,2).toUpperCase() || '??'}
                        </div>
                        <div className="text-left min-w-0">
                          <p className={`font-bold text-[10px] uppercase tracking-widest truncate ${contaId === conta.id ? themeColor : 'text-on-surface'}`}>
                            {conta.nome}
                          </p>
                          {conta.banco_nome && (
                            <p className="text-on-surface-variant text-[9px] truncate">{conta.banco_nome}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status de Pagamento */}
              <div 
                onClick={() => setIsPaid(!isPaid)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isPaid 
                    ? `${bgColor} ${borderAccent}`
                    : 'bg-on-surface/5 border-transparent opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? accentBg : 'bg-on-surface/10'}`}>
                    <Icon name={isPaid ? 'task_alt' : 'schedule'} className={isPaid ? 'text-white' : 'text-on-surface-variant'} />
                  </div>
                  <div>
                    <p className={`font-label text-xs uppercase tracking-widest font-bold ${isPaid ? accentText : 'text-on-surface'}`}>
                      {isExpense ? (isPaid ? 'Despesa Paga' : 'Despesa Pendente') : (isPaid ? 'Receita Recebida' : 'Receita Pendente')}
                    </p>
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-tighter">
                      {isPaid ? 'O valor será debitado do saldo' : 'O lançamento ficará aguardando pagamento'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-all ${isPaid ? accentBg : 'bg-on-surface/20'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPaid ? 'left-7' : 'left-1'}`} />
                </div>
              </div>

              {/* Anexos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Anexos</label>
                  <label className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${accentText} hover:opacity-80 transition-opacity cursor-pointer`}>
                    <Icon name="attach_file" className="text-sm" />
                    Anexar Arquivo
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {uploading && (
                  <div className="flex items-center gap-3 p-4 bg-on-surface/5 rounded-2xl border border-dashed border-outline-variant/30 animate-pulse">
                    <div className="w-5 h-5 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Enviando arquivos...</span>
                  </div>
                )}

                {anexos.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {anexos.map((anexo, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-on-surface/3 border border-outline-variant/5 rounded-xl group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <a 
                            href={anexo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 min-w-0 hover:opacity-70 transition-opacity"
                          >
                            <Icon name="description" className="text-on-surface-variant text-base" />
                            <span className="text-[11px] font-medium text-on-surface truncate">{anexo.name}</span>
                          </a>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeAnexo(idx)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-on-surface/5 text-on-surface-variant hover:bg-error/10 hover:text-error transition-all"
                        >
                          <Icon name="close" className="text-[12px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagamento Parcial */}
              {isEditing && initialData?.status === 'PENDENTE' && (
                <div className="space-y-3 p-4 bg-primary-fixed/5 border border-primary-fixed/10 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-label text-[10px] uppercase tracking-widest text-primary-fixed-dim font-bold">Pagamento Parcial?</h4>
                      <p className="text-[9px] text-on-surface-variant/60 leading-tight">Registre apenas o que foi pago agora.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPartial(!showPartial)}
                      className={`px-3 py-1.5 rounded-lg font-label text-[9px] uppercase tracking-widest transition-all ${
                        showPartial ? 'bg-primary-fixed text-on-primary' : 'bg-on-surface/5 text-on-surface-variant'
                      }`}
                    >
                      {showPartial ? 'Cancelar' : 'Informar Valor'}
                    </button>
                  </div>

                  {showPartial && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-2"
                    >
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 font-label text-[10px]">R$</span>
                        <input
                          type="text"
                          value={partialValue}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val === '') { setPartialValue(''); return; }
                            const numericValue = (parseInt(val) / 100).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });
                            setPartialValue(numericValue);
                          }}
                          placeholder="0,00"
                          className="w-full h-12 pl-10 pr-4 bg-surface border border-outline-variant/30 rounded-xl font-headline font-bold text-lg text-on-surface focus:ring-1 focus:ring-primary-fixed transition-all outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!partialValue) return;
                          setLoading(true);
                          try {
                            const numericVal = parseFloat(partialValue.replace(/\./g, '').replace(',', '.'));
                            await recordPartialPayment(initialData.id, numericVal);
                            if (onBack) onBack(); // Fecha o modal
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading || !partialValue}
                        className="w-full h-10 bg-primary-fixed/20 text-primary-fixed-dim rounded-lg font-label text-[9px] uppercase tracking-[0.1em] font-bold hover:bg-primary-fixed/30 transition-all border border-primary-fixed/30"
                      >
                        {loading ? 'Processando...' : 'Confirmar Pagamento de Parte do Valor'}
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!value || !category || loading}
              className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 font-label font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale ${
                isExpense
                  ? 'bg-error text-white shadow-lg shadow-error/20'
                  : 'bg-primary-fixed text-on-primary shadow-lg shadow-primary-fixed/20'
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
