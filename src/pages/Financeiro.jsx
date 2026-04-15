import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../components/Icon';
import GerenciarCategorias from '../components/GerenciarCategorias';
import { BancoBadge, BANCOS } from '../components/GerenciarContas';
import { useAuth } from '../contexts/AuthContext';
import { getTransactions, getSummaryStats, getCategorySpending, recordPartialPayment, updateTransaction, getCategories } from '../lib/database';
import ModalPagamento from '../components/ModalPagamento';
import { formatDate } from '../lib/utils';

const filters = ['Todos', 'Receitas', 'Despesas'];
const viewTabs = ['Extrato', 'Metas'];

// ── Barra de progresso da meta ────────────────────────────────────────────────
const MetaBar = ({ gasto, meta }) => {
  const pct = meta > 0 ? Math.min((gasto / meta) * 100, 100) : 0;
  const over = meta > 0 && gasto > meta;
  return (
    <div className="w-full h-1.5 bg-on-surface/10 rounded-full overflow-hidden mt-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full rounded-full ${over ? 'bg-error' : pct > 80 ? 'bg-amber-400' : 'bg-primary-fixed'}`}
      />
    </div>
  );
};

// ── Card de categoria com meta ────────────────────────────────────────────────
const CatMetaCard = ({ cat, formatCurrency }) => {
  const hasMeta = cat.meta != null && cat.meta > 0;
  const pct = hasMeta ? Math.min((cat.gasto / cat.meta) * 100, 100) : null;
  const over = hasMeta && cat.gasto > cat.meta;
  const pctColor = over ? 'text-error' : pct > 80 ? 'text-amber-400' : 'text-primary-fixed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-surface-container-low rounded-xl"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            cat.tipo === 'despesa' ? 'bg-error/10 text-error' : 'bg-primary-fixed/10 text-primary-fixed'
          }`}>
            <Icon name={cat.icone || 'category'} className="text-[18px]" />
          </div>
          <div>
            <p className="font-body font-semibold text-on-surface text-sm">{cat.nome}</p>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              {cat.tipo === 'despesa' ? 'Despesa' : 'Receita'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-headline font-bold text-sm ${cat.tipo === 'despesa' ? 'text-error' : 'text-primary-fixed'}`}>
            {formatCurrency(cat.gasto)}
          </p>
          {hasMeta && (
            <p className={`font-label text-[10px] font-bold ${pctColor}`}>
              {pct?.toFixed(0)}% da meta
            </p>
          )}
        </div>
      </div>

      {hasMeta ? (
        <>
          <MetaBar gasto={cat.gasto} meta={cat.meta} />
          <div className="flex justify-between mt-1">
            <span className="text-on-surface-variant text-[10px]">Gasto</span>
            <span className={`text-[10px] font-semibold ${over ? 'text-error' : 'text-on-surface-variant'}`}>
              Meta: {formatCurrency(cat.meta)}
              {over && <span className="ml-1 text-error">⚠ Excedeu!</span>}
            </span>
          </div>
        </>
      ) : (
        <p className="text-on-surface-variant/50 text-[10px] mt-2 italic">Sem meta definida</p>
      )}
    </motion.div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const Financeiro = ({ setTab, openTransaction }) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [activeView, setActiveView] = useState('Extrato');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ saldo: 0, receitas: 0, despesas: 0 });
  const [catSpending, setCatSpending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMetas, setLoadingMetas] = useState(false);
  const [isCategoriasOpen, setIsCategoriasOpen] = useState(false);
  const [pagamentoTx, setPagamentoTx] = useState(null);
  const [loadingPagamento, setLoadingPagamento] = useState(false);

  // Novos filtros
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [periodType, setPeriodType] = useState('Mês'); // Todos, Mês, 7dias, 30dias, Custom
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        let startDate = null;
        let endDate = null;

        if (periodType === 'Mês') {
          const start = new Date();
          start.setDate(1);
          startDate = start.toISOString().split('T')[0];
        } else if (periodType === '7dias') {
          const start = new Date();
          start.setDate(start.getDate() - 7);
          startDate = start.toISOString().split('T')[0];
        } else if (periodType === '30dias') {
          const start = new Date();
          start.setDate(start.getDate() - 30);
          startDate = start.toISOString().split('T')[0];
        } else if (periodType === 'Custom') {
          startDate = customDates.start;
          endDate = customDates.end;
        }

        const [txData, statsData, catsData] = await Promise.all([
          getTransactions(user.id, { 
            type: activeFilter,
            status: selectedStatus,
            categoryId: selectedCategory === 'Todos' ? null : selectedCategory,
            startDate,
            endDate
          }),
          getSummaryStats(user.id),
          getCategories(user.id)
        ]);

        setTransactions(txData);
        setStats(statsData);
        setAllCategories(catsData);
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, activeFilter, selectedStatus, selectedCategory, periodType, customDates]);

  // Carrega dados de metas quando a aba é aberta
  useEffect(() => {
    if (activeView !== 'Metas' || !user) return;
    setLoadingMetas(true);
    getCategorySpending(user.id)
      .then(data => {
        const normalized = data.map(c => ({ ...c, tipo: c.tipo?.toLowerCase() || 'despesa' }));
        setCatSpending(normalized);
      })
      .catch(console.error)
      .finally(() => setLoadingMetas(false));
  }, [activeView, user, isCategoriasOpen]); // recarrega ao fechar o modal de categorias

  const formatCurrency = (val) =>
    Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


  // ── Cálculos de metas agregadas ──────────────────────────────────────────
  const handlePagamento = async (txId, valor, tipo, proximaData) => {
    setLoadingPagamento(true);
    try {
      if (tipo === 'total') {
        const tx = transactions.find(t => t.id === txId);
        await updateTransaction(txId, {
          description: tx.descricao,
          value: tx.valor,
          categoryId: tx.categoria_id,
          contaId: tx.conta_id,
          date: tx.data_vencimento,
          type: tx.tipo === 'RECEBER' ? 'receita' : 'despesa',
          status: 'PAGO',
        });
      } else {
        await recordPartialPayment(txId, valor, proximaData);
      }
      // Recarrega lista
      const txData = await getTransactions(user.id, { type: activeFilter });
      setTransactions(txData);
      setPagamentoTx(null);
    } catch (err) {
      alert('Erro ao registrar pagamento: ' + (err.message || err));
    } finally {
      setLoadingPagamento(false);
    }
  };

  const despesasCat = catSpending.filter(c => c.tipo === 'despesa');
  const catComMeta = despesasCat.filter(c => c.meta != null && c.meta > 0);
  const totalMeta = catComMeta.reduce((a, c) => a + parseFloat(c.meta), 0);
  const totalGasto = catComMeta.reduce((a, c) => a + c.gasto, 0);
  const catExcedidas = catComMeta.filter(c => c.gasto > c.meta).length;

  return (
    <>
      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">

        {/* ── Header da página ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
            <h2 className="font-headline font-extrabold text-3xl text-on-surface tracking-[-0.04em]">
              Finanças
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openTransaction('expense')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all text-sm"
            >
              <Icon name="remove_circle_outline" className="text-base" />
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">Despesa</span>
            </button>
            <button
              onClick={() => openTransaction('income')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-fixed/10 border border-primary-fixed/20 text-primary-fixed hover:bg-primary-fixed/20 transition-all text-sm"
            >
              <Icon name="add_circle_outline" className="text-base" />
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">Receita</span>
            </button>
            <button
              onClick={() => setIsCategoriasOpen(true)}
              title="Gerenciar Categorias"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:border-primary-fixed/30 transition-all"
            >
              <Icon name="tune" className="text-base" />
            </button>
          </div>
        </div>

        {/* ── Resumo mensal ── */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 p-6 rounded-xl bg-surface-container-low relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/5 rounded-full blur-3xl -mr-10 -mt-10" />
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Saldo do Mês</p>
              <p className={`font-headline font-extrabold text-3xl text-glow tracking-[-0.04em] ${stats.saldo >= 0 ? 'text-primary-fixed' : 'text-error'}`}>
                {loading ? '...' : formatCurrency(stats.saldo)}
              </p>
              <div className={`flex items-center gap-1.5 mt-2 text-xs ${stats.saldo >= 0 ? 'text-primary-fixed-dim' : 'text-error/70'}`}>
                <Icon name={stats.saldo >= 0 ? 'trending_up' : 'trending_down'} className="text-sm" />
                <span>{stats.saldo >= 0 ? 'Positivo este mês' : 'Negativo este mês'}</span>
              </div>
            </div>

            <div className="p-6 rounded-xl glass-panel border border-outline-variant/10">
              <div className="flex justify-between items-start mb-4">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Entradas</p>
                <Icon name="arrow_upward" className="text-primary-fixed" />
              </div>
              <p className="font-headline font-bold text-2xl text-on-surface">
                {loading ? '...' : formatCurrency(stats.receitas)}
              </p>
              <p className="text-on-surface-variant text-xs mt-1">Total acumulado</p>
            </div>

            <div className="p-6 rounded-xl glass-panel border border-outline-variant/10">
              <div className="flex justify-between items-start mb-4">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Saídas</p>
                <Icon name="arrow_downward" className="text-error" />
              </div>
              <p className="font-headline font-bold text-2xl text-on-surface">
                {loading ? '...' : formatCurrency(stats.despesas)}
              </p>
              <p className="text-on-surface-variant text-xs mt-1">Total de gastos</p>
            </div>
          </div>
        </section>

        {/* ── View Tabs: Extrato / Metas ── */}
        <div className="flex gap-2 mb-6">
          {viewTabs.map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-label text-[10px] uppercase tracking-widest transition-all ${
                activeView === v
                  ? 'bg-primary-fixed text-on-primary font-bold shadow'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
              }`}
            >
              <Icon name={v === 'Extrato' ? 'receipt_long' : 'track_changes'} className="text-sm" />
              {v}
            </button>
          ))}
        </div>

        {/* ══════════ EXTRATO ══════════ */}
        <AnimatePresence mode="wait">
          {activeView === 'Extrato' && (
            <motion.div
              key="extrato"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Filtros Avançados */}
              <div className="space-y-4 mb-8">
                {/* Linha 1: Tipo e Status */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex bg-surface-container-high/50 p-1 rounded-xl border border-outline-variant/10">
                    {filters.map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-4 py-1.5 rounded-lg font-label text-[10px] uppercase tracking-widest transition-all ${
                          activeFilter === f
                            ? 'bg-primary-fixed text-on-primary font-bold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="flex bg-surface-container-high/50 p-1 rounded-xl border border-outline-variant/10">
                    {['Todos', 'Pago', 'Pendente'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedStatus(s)}
                        className={`px-4 py-1.5 rounded-lg font-label text-[10px] uppercase tracking-widest transition-all ${
                          selectedStatus === s
                            ? 'bg-primary-fixed text-on-primary font-bold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Linha 2: Período e Categoria */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Seletor de Período */}
                  <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/10">
                    <Icon name="calendar_month" className="text-on-surface-variant text-sm ml-2" />
                    <select
                      value={periodType}
                      onChange={(e) => setPeriodType(e.target.value)}
                      className="bg-transparent border-none text-[10px] font-label uppercase tracking-widest text-on-surface focus:ring-0 cursor-pointer pr-8"
                    >
                      <option value="Tudo">Tudo</option>
                      <option value="Mês">Este Mês</option>
                      <option value="7dias">Últimos 7 dias</option>
                      <option value="30dias">Últimos 30 dias</option>
                      <option value="Custom">Personalizado</option>
                    </select>
                  </div>

                  {/* Datas Customizadas (se selecionado) */}
                  {periodType === 'Custom' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="date"
                        value={customDates.start}
                        onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                        className="bg-surface-container-low border border-outline-variant/10 rounded-lg px-2 py-1 text-[10px] font-body text-on-surface outline-none focus:border-primary-fixed/30"
                      />
                      <span className="text-on-surface-variant text-[10px]">até</span>
                      <input
                        type="date"
                        value={customDates.end}
                        onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                        className="bg-surface-container-low border border-outline-variant/10 rounded-lg px-2 py-1 text-[10px] font-body text-on-surface outline-none focus:border-primary-fixed/30"
                      />
                    </motion.div>
                  )}

                  {/* Seletor de Categoria */}
                  <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/10">
                    <Icon name="category" className="text-on-surface-variant text-sm ml-2" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent border-none text-[10px] font-label uppercase tracking-widest text-on-surface focus:ring-0 cursor-pointer pr-8 max-w-[150px]"
                    >
                      <option value="Todos">Todas Categorias</option>
                      {allCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Transações */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline font-bold text-xl text-on-surface tracking-tight">
                    Histórico de Transações
                  </h3>
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {transactions.length} registros
                  </span>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    <div className="py-20 text-center">
                      <div className="w-8 h-8 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin mx-auto" />
                    </div>
                  ) : transactions.length > 0 ? (
                    transactions.map((t) => (
                      <div
                        key={t.id}
                        className="group flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors"
                      >
                        {/* Lado esquerdo — clicável para editar */}
                        <div
                          className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                          onClick={() => openTransaction(t)}
                        >
                          <div className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 ${
                            t.tipo === 'RECEBER'
                              ? 'bg-primary-fixed/10 text-primary-fixed'
                              : 'bg-error/10 text-error'
                          }`}>
                            <Icon name={t.categorias?.icone || (t.tipo === 'RECEBER' ? 'add_circle' : 'remove_circle')} className="text-[18px]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-body font-semibold text-on-surface text-sm truncate">{t.descricao}</p>
                              {t.status === 'PAGO' && (
                                <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest bg-primary-fixed/10 text-primary-fixed px-1.5 py-0.5 rounded-md">Pago</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                              {t.categorias?.nome || 'Sem categoria'} · {formatDate(t.data_vencimento)}
                              {t.contas_bancarias && (
                                <>
                                  <span className="opacity-40">·</span>
                                  <div className="flex items-center gap-1 bg-surface-container-high/50 px-1.5 py-0.5 rounded-md">
                                    <BancoBadge
                                      logoKey={BANCOS.find(b => b.nome === t.contas_bancarias.banco_nome || b.codigo === t.contas_bancarias.banco_codigo)?.logoKey}
                                      cor={t.contas_bancarias.banco_cor}
                                      banco={{ sigla: t.contas_bancarias.banco_nome?.slice(0,1) }}
                                      size="sm"
                                    />
                                    <span className="text-[10px] font-medium leading-none">{t.contas_bancarias.nome}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lado direito — valor + botão pagar */}
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <p className={`font-headline font-bold text-sm ${
                            t.tipo === 'RECEBER' ? 'text-primary-fixed' : 'text-error'
                          } ${t.status === 'PAGO' ? 'opacity-50 line-through' : ''}`}>
                            {t.tipo === 'RECEBER' ? '+' : '-'} {formatCurrency(t.valor)}
                          </p>

                          {t.status !== 'PAGO' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPagamentoTx(t); }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-fixed text-on-primary text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shrink-0"
                            >
                              <Icon name="payments" className="text-sm" />
                              Pagar
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/20">
                      <Icon name="history" className="text-on-surface-variant/40 text-4xl mb-4" />
                      <p className="text-on-surface-variant text-sm">Nenhuma transação encontrada.</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* ══════════ METAS ══════════ */}
          {activeView === 'Metas' && (
            <motion.div
              key="metas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loadingMetas ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <>
                  {/* Resumo de metas */}
                  {catComMeta.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="p-5 rounded-xl bg-surface-container-low">
                        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Total Orçado</p>
                        <p className="font-headline font-bold text-2xl text-on-surface">{formatCurrency(totalMeta)}</p>
                        <p className="text-on-surface-variant text-xs mt-1">{catComMeta.length} categoria(s) com meta</p>
                      </div>
                      <div className="p-5 rounded-xl bg-surface-container-low">
                        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Total Gasto</p>
                        <p className={`font-headline font-bold text-2xl ${totalGasto > totalMeta ? 'text-error' : 'text-on-surface'}`}>
                          {formatCurrency(totalGasto)}
                        </p>
                        <MetaBar gasto={totalGasto} meta={totalMeta} />
                      </div>
                      <div className="p-5 rounded-xl bg-surface-container-low">
                        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Categorias Excedidas</p>
                        <p className={`font-headline font-bold text-2xl ${catExcedidas > 0 ? 'text-error' : 'text-primary-fixed'}`}>
                          {catExcedidas}
                        </p>
                        <p className="text-on-surface-variant text-xs mt-1">
                          {catExcedidas === 0 ? '✓ Tudo dentro do orçamento' : 'Atenção: metas ultrapassadas'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Seção Despesas */}
                  {despesasCat.length > 0 && (
                    <section className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon name="arrow_downward" className="text-error text-sm" />
                        <h3 className="font-headline font-bold text-on-surface">Despesas por Categoria</h3>
                        <span className="ml-auto font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                          {despesasCat.length} categorias
                        </span>
                      </div>
                      <div className="space-y-3">
                        {despesasCat
                          .sort((a, b) => b.gasto - a.gasto)
                          .map(cat => (
                            <CatMetaCard key={cat.id} cat={cat} formatCurrency={formatCurrency} />
                          ))}
                      </div>
                    </section>
                  )}

                  {/* Seção Receitas */}
                  {catSpending.filter(c => c.tipo === 'receita').length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon name="arrow_upward" className="text-primary-fixed text-sm" />
                        <h3 className="font-headline font-bold text-on-surface">Receitas por Categoria</h3>
                      </div>
                      <div className="space-y-3">
                        {catSpending
                          .filter(c => c.tipo === 'receita')
                          .sort((a, b) => b.gasto - a.gasto)
                          .map(cat => (
                            <CatMetaCard key={cat.id} cat={cat} formatCurrency={formatCurrency} />
                          ))}
                      </div>
                    </section>
                  )}

                  {catSpending.length === 0 && (
                    <div className="py-20 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant/20">
                      <Icon name="track_changes" className="text-on-surface-variant/40 text-4xl mb-4" />
                      <p className="text-on-surface-variant text-sm mb-2">Nenhuma categoria criada ainda.</p>
                      <button
                        onClick={() => setIsCategoriasOpen(true)}
                        className="text-primary-fixed text-xs font-bold uppercase tracking-widest hover:underline"
                      >
                        Gerenciar Categorias
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <AnimatePresence>
        {isCategoriasOpen && (
          <GerenciarCategorias onClose={() => setIsCategoriasOpen(false)} />
        )}
      </AnimatePresence>

      {pagamentoTx && (
        <ModalPagamento
          transacao={pagamentoTx}
          onClose={() => setPagamentoTx(null)}
          onConfirm={handlePagamento}
          loading={loadingPagamento}
        />
      )}
    </>
  );
};

export default Financeiro;
