import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Icon from '../components/Icon';
import GerenciarCategorias from '../components/GerenciarCategorias';
import { useAuth } from '../contexts/AuthContext';
import { getTransactions, getSummaryStats } from '../lib/database';

const filters = ['Todos', 'Receitas', 'Despesas'];

const Financeiro = ({ setTab, openTransaction }) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ saldo: 0, receitas: 0, despesas: 0 });
  const [loading, setLoading] = useState(true);
  const [isCategoriasOpen, setIsCategoriasOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const [txData, statsData] = await Promise.all([
          getTransactions(user.id, { type: activeFilter }),
          getSummaryStats(user.id)
        ]);
        setTransactions(txData);
        setStats(statsData);
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, activeFilter]);

  const formatCurrency = (val) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

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
            Extrato Financeiro
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
      <section className="mb-10">
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

      {/* ── Filtro tabs ── */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full font-label text-[10px] uppercase tracking-widest transition-all ${
              activeFilter === f
                ? 'bg-primary-fixed text-on-primary font-bold'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Transações ── */}
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
                onClick={() => openTransaction(t)}
                className="group flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                    t.tipo === 'RECEBER'
                      ? 'bg-primary-fixed/10 text-primary-fixed'
                      : 'bg-error/10 text-error'
                  }`}>
                    <Icon name={t.categorias?.icone || (t.tipo === 'RECEBER' ? 'add_circle' : 'remove_circle')} className="text-[18px]" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-on-surface text-sm">{t.descricao}</p>
                    <p className="text-on-surface-variant text-xs">
                      {t.categorias?.nome || 'Sem categoria'} · {formatDate(t.data_vencimento)}
                    </p>
                  </div>
                </div>
                <p className={`font-headline font-bold text-sm ${
                  t.tipo === 'RECEBER' ? 'text-primary-fixed' : 'text-error'
                }`}>
                  {t.tipo === 'RECEBER' ? '+' : '-'} {formatCurrency(t.valor)}
                </p>
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

    </main>

    <AnimatePresence>
      {isCategoriasOpen && (
        <GerenciarCategorias onClose={() => setIsCategoriasOpen(false)} />
      )}
    </AnimatePresence>
    </>
  );
};

export default Financeiro;
