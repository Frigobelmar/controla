import React, { useState } from 'react';
import Icon from '../components/Icon';

const transactions = [
  { id: 1, name: 'Salário Mensal',       category: 'Trabalho',     date: 'Hoje',    amount: '+R$ 8.500,00',  type: 'income',  icon: 'payments'         },
  { id: 2, name: 'Energia Elétrica',     category: 'Moradia',      date: 'Hoje',    amount: '-R$ 1.240,50',  type: 'expense', icon: 'electric_bolt'    },
  { id: 3, name: 'Assinatura Google',    category: 'Tecnologia',   date: 'Ontem',   amount: '-R$ 450,00',    type: 'expense', icon: 'cloud_queue'      },
  { id: 4, name: 'Dividendos B3',        category: 'Investimento', date: '05 Out',  amount: '+R$ 320,75',    type: 'income',  icon: 'trending_up'      },
  { id: 5, name: 'Supermercado',         category: 'Alimentação',  date: '04 Out',  amount: '-R$ 387,20',    type: 'expense', icon: 'shopping_cart'    },
  { id: 6, name: 'Aluguel Escritório',   category: 'Moradia',      date: '03 Out',  amount: '-R$ 5.800,00',  type: 'expense', icon: 'store'            },
  { id: 7, name: 'Freelance - Design',   category: 'Trabalho',     date: '02 Out',  amount: '+R$ 2.400,00',  type: 'income',  icon: 'brush'            },
  { id: 8, name: 'Combustível',          category: 'Transporte',   date: '01 Out',  amount: '-R$ 210,00',    type: 'expense', icon: 'local_gas_station'},
];

const filters = ['Todos', 'Receitas', 'Despesas'];

const Financeiro = ({ setTab, openTransaction }) => {
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filtered = transactions.filter((t) => {
    if (activeFilter === 'Receitas') return t.type === 'income';
    if (activeFilter === 'Despesas') return t.type === 'expense';
    return true;
  });

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">

      {/* ── Header da página ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">
            Outubro 2023
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
          <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-white transition-all">
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
            <p className="font-headline font-extrabold text-3xl text-primary-fixed text-glow tracking-[-0.04em]">
              +R$ 3.332,05
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-primary-fixed-dim text-xs">
              <Icon name="trending_up" className="text-sm" />
              <span>Positivo este mês</span>
            </div>
          </div>

          <div className="p-6 rounded-xl glass-panel border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Entradas</p>
              <Icon name="arrow_upward" className="text-primary-fixed" />
            </div>
            <p className="font-headline font-bold text-2xl text-on-surface">R$ 11.220,75</p>
            <p className="text-on-surface-variant text-xs mt-1">3 transações</p>
          </div>

          <div className="p-6 rounded-xl glass-panel border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Saídas</p>
              <Icon name="arrow_downward" className="text-error" />
            </div>
            <p className="font-headline font-bold text-2xl text-on-surface">R$ 8.087,70</p>
            <p className="text-on-surface-variant text-xs mt-1">5 transações</p>
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
            {filtered.length} registros
          </span>
        </div>

        <div className="space-y-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                  t.type === 'income'
                    ? 'bg-primary-fixed/10 text-primary-fixed'
                    : 'bg-error/10 text-error'
                }`}>
                  <Icon name={t.icon} className="text-[18px]" />
                </div>
                <div>
                  <p className="font-body font-semibold text-on-surface text-sm">{t.name}</p>
                  <p className="text-on-surface-variant text-xs">
                    {t.category} · {t.date}
                  </p>
                </div>
              </div>
              <p className={`font-headline font-bold text-sm ${
                t.type === 'income' ? 'text-primary-fixed' : 'text-error'
              }`}>
                {t.amount}
              </p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
};

export default Financeiro;
