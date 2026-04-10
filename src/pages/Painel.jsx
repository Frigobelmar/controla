import React from 'react';
import Icon from '../components/Icon';

const Painel = ({ setTab, openTransaction, openAI, openTask }) => (
  <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">

    {/* ── Hero: Saldo Total ── */}
    <section className="mb-12">
      <div className="flex flex-col md:flex-row gap-6">

        {/* Main balance card */}
        <div className="flex-1 p-8 rounded-xl bg-surface-container-low relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Saldo Total
          </p>
          <h2 className="font-headline font-extrabold text-on-surface tracking-[-0.04em] mb-4 text-4xl md:text-5xl">
            <span className="text-primary-fixed text-glow">R$ 12.450,00</span>
          </h2>
          <div className="flex items-center gap-2 text-primary-fixed-dim text-sm font-medium">
            <Icon name="trending_up" className="text-sm" />
            <span>+12.5% em relação ao mês anterior</span>
          </div>
        </div>

        {/* Secondary cards */}
        <div className="flex flex-col gap-4 w-full md:w-80">
          <div className="p-6 rounded-xl glass-panel border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Receitas
              </span>
              <Icon name="arrow_upward" className="text-primary-fixed" />
            </div>
            <p className="font-headline font-bold text-2xl text-on-surface">R$ 8.920,00</p>
          </div>
          <div className="p-6 rounded-xl glass-panel">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Despesas
              </span>
              <Icon name="arrow_downward" className="text-error" />
            </div>
            <p className="font-headline font-bold text-2xl text-on-surface">R$ 3.470,00</p>
          </div>
        </div>
      </div>
    </section>

    {/* ── Quick Actions ── */}
    <section className="mb-16">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button 
          onClick={() => openTransaction('expense')}
          className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-high/50 backdrop-blur-md border border-outline-variant/10 hover:border-outline-variant/20 hover:bg-surface-container-high transition-all group active:scale-95 duration-300 shadow-sm"
        >
          <Icon name="outbox" className="text-error mb-3 group-hover:scale-110 transition-transform" />
          <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">
            Despesa
          </span>
        </button>

        <button 
          onClick={() => openTransaction('income')}
          className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-high/50 backdrop-blur-md border border-outline-variant/10 hover:border-outline-variant/20 hover:bg-surface-container-high transition-all group active:scale-95 duration-300 shadow-sm"
        >
          <Icon name="move_to_inbox" className="text-primary-fixed mb-3 group-hover:scale-110 transition-transform" />
          <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">
            Receita
          </span>
        </button>

        <button 
          onClick={openTask}
          className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-high/50 backdrop-blur-md border border-outline-variant/10 hover:border-outline-variant/20 hover:bg-surface-container-high transition-all group active:scale-95 duration-300 shadow-sm"
        >
          <Icon name="add_task" className="text-on-surface mb-3 group-hover:scale-110 transition-transform" />
          <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">
            Nova Tarefa
          </span>
        </button>


        <button 
          onClick={openAI}
          className="flex flex-col items-center justify-center p-6 rounded-xl bg-primary-fixed border border-primary-fixed/30 hover:brightness-110 transition-all group active:scale-95 relative overflow-hidden shadow-[0_0_20px_rgba(var(--primary-glow),0.2)]"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
          <Icon name="smart_toy" className="text-on-primary mb-3 group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }} />
          <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-primary">
            Agente IA
          </span>
        </button>

        <button className="flex items-center justify-center p-6 rounded-xl bg-surface-container-high border border-outline-variant/10 col-span-2 md:col-span-1 hover:border-outline-variant/20 hover:bg-surface-container transition-all active:scale-95 duration-300">
          <Icon name="more_horiz" className="text-on-surface-variant" />
        </button>
      </div>
    </section>

    {/* ── Main content grid ── */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

      {/* Left: Contas e Pagamentos */}
      <section className="lg:col-span-7">
        <div className="flex justify-between items-end mb-8">
          <h3 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
            Contas e Pagamentos
          </h3>
          <a href="#" className="font-label text-[10px] uppercase tracking-widest text-primary-fixed hover:underline transition-all">
            Ver tudo
          </a>
        </div>

        <div className="space-y-4">
          {/* Urgente */}
          <div className="group flex items-center justify-between p-5 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-lg">
                <Icon name="electric_bolt" className="text-on-surface-variant" />
              </div>
              <div>
                <h4 className="font-body font-semibold text-on-surface">Energia Elétrica - Matriz</h4>
                <p className="text-on-surface-variant text-sm">Vencimento: Hoje</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-headline font-bold text-on-surface mb-1">R$ 1.240,50</p>
              <span className="px-2 py-0.5 rounded-full bg-error/10 text-error text-[9px] font-bold uppercase tracking-tighter border border-error/20">
                URGENTE
              </span>
            </div>
          </div>

          {/* Pendente 1 */}
          <div className="group flex items-center justify-between p-5 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-lg">
                <Icon name="cloud_queue" className="text-on-surface-variant" />
              </div>
              <div>
                <h4 className="font-body font-semibold text-on-surface">Assinatura Google Cloud</h4>
                <p className="text-on-surface-variant text-sm">Vencimento: 22 Out</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-headline font-bold text-on-surface mb-1">R$ 450,00</p>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[9px] font-bold uppercase tracking-tighter border border-outline-variant/20">
                PENDENTE
              </span>
            </div>
          </div>

          {/* Pendente 2 */}
          <div className="group flex items-center justify-between p-5 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-lg">
                <Icon name="store" className="text-on-surface-variant" />
              </div>
              <div>
                <h4 className="font-body font-semibold text-on-surface">Aluguel Escritório</h4>
                <p className="text-on-surface-variant text-sm">Vencimento: 25 Out</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-headline font-bold text-on-surface mb-1">R$ 5.800,00</p>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[9px] font-bold uppercase tracking-tighter border border-outline-variant/20">
                PENDENTE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Right: Agenda de Hoje */}
      <section className="lg:col-span-5">
        <div className="flex justify-between items-end mb-8">
          <h3 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
            Agenda de Hoje
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-fixed" />
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              21 Out, 2023
            </span>
          </div>
        </div>

        <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/20">

          {/* Event 1 — done */}
          <div className="relative">
            <div className="absolute -left-8 top-1 w-[23px] h-[23px] rounded-full bg-surface-dim border-2 border-primary-fixed z-10" />
            <span className="font-label text-[10px] uppercase tracking-[0.1em] text-primary-fixed font-bold">
              09:00 - 10:30
            </span>
            <h4 className="font-body font-semibold text-on-surface mt-1">Review Mensal com IA Agent</h4>
            <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
              Análise preditiva de fluxo de caixa para o Q4 e ajustes de orçamento operacional.
            </p>
          </div>

          {/* Event 2 */}
          <div className="relative">
            <div className="absolute -left-8 top-1 w-[23px] h-[23px] rounded-full bg-surface-dim border-2 border-outline-variant z-10" />
            <span className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-bold">
              14:00 - 15:00
            </span>
            <h4 className="font-body font-semibold text-on-surface mt-1">Aprovação de Reembolsos</h4>
            <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
              Verificar solicitações da equipe de vendas pendentes no WhatsApp.
            </p>
          </div>

          {/* Event 3 */}
          <div className="relative">
            <div className="absolute -left-8 top-1 w-[23px] h-[23px] rounded-full bg-surface-dim border-2 border-outline-variant z-10" />
            <span className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-bold">
              17:30
            </span>
            <h4 className="font-body font-semibold text-on-surface mt-1">Fechamento do Dia</h4>
            <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">
              Sincronização automática de extratos bancários via integração whats-finance.
            </p>
          </div>

        </div>
      </section>

    </div>
  </main>
);

export default Painel;
