import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { getSummaryStats, getUpcomingTransactions, getUpcomingEvents } from '../lib/database';
import { formatDate } from '../lib/utils';

const today = new Date().toLocaleDateString('sv-SE');

const formatCurrency = (val) =>
  Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const getEventStyles = (tipo) => {
  const mapping = {
    'REUNIAO_CLIENTE': { dot: 'bg-primary-fixed border-primary-fixed', card: 'bg-primary-fixed/5 border-primary-fixed/20 shadow-[0_0_15px_rgba(var(--primary-glow),0.1)]', text: 'text-primary-fixed' },
    'PRAZO_ENTREGA':   { dot: 'bg-error border-error', card: 'bg-error/5 border-error/20', text: 'text-error' },
    'PESSOAL':         { dot: 'bg-on-surface-variant border-on-surface-variant', card: 'bg-surface-container-high border-outline-variant/20', text: 'text-on-surface-variant' },
    'PROFISSIONAL':    { dot: 'bg-primary-fixed/60 border-primary-fixed/60', card: 'bg-surface-container-low border-outline-variant/10', text: 'text-on-surface/80' }
  };
  return mapping[tipo] || mapping['PROFISSIONAL'];
};

const Painel = ({ setTab, openTransaction, openAI, openTask }) => {
  const { user } = useAuth();
  const [stats, setStats]             = useState({ saldo: 0, receitas: 0, despesas: 0 });
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [statsData, txData, evData] = await Promise.all([
          getSummaryStats(user.id),
          getUpcomingTransactions(user.id, 8),
          getUpcomingEvents(user.id, 6),
        ]);
        setStats(statsData);
        setTransactions(txData);
        setEvents(evData);
      } catch (err) {
        console.error('Erro ao carregar painel:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">

      {/* ── Hero: Saldo Total ── */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 p-8 rounded-xl bg-surface-container-low relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/5 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="flex justify-between items-start mb-2">
              <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">Saldo Previsto</p>
              <div className="text-right">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Saldo Atual (Pago)</p>
                <p className={`font-bold text-sm ${stats.saldo >= 0 ? 'text-primary-fixed' : 'text-error'}`}>
                  {loading ? '...' : formatCurrency(stats.saldo)}
                </p>
              </div>
            </div>
            <h2 className="font-headline font-extrabold text-on-surface tracking-[-0.04em] mb-4 text-4xl md:text-5xl">
              <span className={stats.saldoTotal >= 0 ? "text-primary-fixed text-glow" : "text-error text-glow"}>
                {loading ? '...' : formatCurrency(stats.saldoTotal)}
              </span>
            </h2>
            <div className="flex items-center gap-2 text-primary-fixed-dim text-sm font-medium">
              <Icon name="trending_up" className="text-sm" />
              <span>Mês atual · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-80">
            <div className="p-5 rounded-xl glass-panel border border-outline-variant/10">
              <div className="flex justify-between items-start mb-2">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Receitas (Total)</span>
                <Icon name="arrow_upward" className="text-primary-fixed text-sm" />
              </div>
              <p className="font-headline font-bold text-2xl text-on-surface mb-2">
                {loading ? '...' : formatCurrency(stats.receitasTotal)}
              </p>
              <div className="flex justify-between text-[11px] font-medium border-t border-outline-variant/10 pt-2">
                <span className="text-on-surface-variant">Recebido: <span className="text-primary-fixed">{loading ? '...' : formatCurrency(stats.receitas)}</span></span>
                <span className="text-on-surface-variant">Pendente: <span className="text-on-surface">{loading ? '...' : formatCurrency(stats.receitasPendentes)}</span></span>
              </div>
            </div>
            <div className="p-5 rounded-xl glass-panel border border-outline-variant/10">
              <div className="flex justify-between items-start mb-2">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Despesas (Total)</span>
                <Icon name="arrow_downward" className="text-error text-sm" />
              </div>
              <p className="font-headline font-bold text-2xl text-on-surface mb-2">
                {loading ? '...' : formatCurrency(stats.despesasTotal)}
              </p>
              <div className="flex justify-between text-[11px] font-medium border-t border-outline-variant/10 pt-2">
                <span className="text-on-surface-variant">Pago: <span className="text-error">{loading ? '...' : formatCurrency(stats.despesas)}</span></span>
                <span className="text-on-surface-variant">Pendente: <span className="text-on-surface">{loading ? '...' : formatCurrency(stats.despesasPendentes)}</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button onClick={() => openTransaction('expense')} className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-high/50 backdrop-blur-md border border-outline-variant/10 hover:border-outline-variant/20 hover:bg-surface-container-high transition-all group active:scale-95 duration-300 shadow-sm">
            <Icon name="outbox" className="text-error mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">Despesa</span>
          </button>
          <button onClick={() => openTransaction('income')} className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-high/50 backdrop-blur-md border border-outline-variant/10 hover:border-outline-variant/20 hover:bg-surface-container-high transition-all group active:scale-95 duration-300 shadow-sm">
            <Icon name="move_to_inbox" className="text-primary-fixed mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">Receita</span>
          </button>
          <button onClick={openTask} className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-high/50 backdrop-blur-md border border-outline-variant/10 hover:border-outline-variant/20 hover:bg-surface-container-high transition-all group active:scale-95 duration-300 shadow-sm">
            <Icon name="add_task" className="text-on-surface mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">Nova Tarefa</span>
          </button>
          <button onClick={openAI} className="flex flex-col items-center justify-center p-6 rounded-xl bg-primary-fixed border border-primary-fixed/30 hover:brightness-110 transition-all group active:scale-95 relative overflow-hidden shadow-[0_0_20px_rgba(var(--primary-glow),0.2)]">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
            <Icon name="smart_toy" className="text-on-primary mb-3 group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }} />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-primary">Agente IA</span>
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
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Contas e Pagamentos</h3>
            <button
              onClick={() => setTab('financeiro')}
              className="font-label text-[10px] uppercase tracking-widest text-primary-fixed hover:underline transition-all"
            >
              Ver tudo
            </button>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20">
              <Icon name="payments" className="text-on-surface-variant/40 text-4xl mb-3" />
              <p className="text-on-surface-variant text-sm">Nenhum lançamento para hoje ou próximos dias.</p>
              <button onClick={() => openTransaction('expense')} className="mt-3 text-primary-fixed font-label text-[10px] uppercase tracking-widest font-bold hover:underline">
                Adicionar lançamento
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => {
                const isReceita = t.tipo === 'RECEBER';
                const vence = formatDate(t.data_vencimento);
                const isHoje = vence === 'Hoje';
                return (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 ${isReceita ? 'bg-primary-fixed/10 text-primary-fixed' : 'bg-error/10 text-error'}`}>
                        <Icon name={t.categorias?.icone || (isReceita ? 'add_circle' : 'remove_circle')} className="text-[18px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-body font-semibold text-on-surface text-sm leading-tight">{t.descricao}</p>
                          {t.anexos?.length > 0 && <span className="text-[10px] opacity-40">📎</span>}
                        </div>
                        <p className="text-on-surface-variant text-xs mt-0.5">
                          {t.categorias?.nome || 'Sem categoria'} • <span className={t.status === 'PAGO' ? 'text-primary-fixed' : 'text-error'}>{t.status === 'PAGO' ? 'PAGO' : 'PENDENTE'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                      <p className={`font-headline font-bold text-sm ${isReceita ? 'text-primary-fixed' : 'text-error'} ${t.status !== 'PAGO' ? 'opacity-60' : ''}`}>
                        {isReceita ? '+' : '-'} {formatCurrency(t.valor)}
                      </p>
                      <span className={`font-label text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        isHoje
                          ? 'bg-error/15 text-error font-bold'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {vence}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Agenda de Hoje */}
        <section className="lg:col-span-5">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Agenda</h3>
            <button
              onClick={() => setTab('agenda')}
              className="font-label text-[10px] uppercase tracking-widest text-primary-fixed hover:underline transition-all"
            >
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </button>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20">
              <Icon name="event" className="text-on-surface-variant/40 text-4xl mb-3" />
              <p className="text-on-surface-variant text-sm">Sem eventos agendados.</p>
              <button onClick={() => setTab('agenda')} className="mt-3 text-primary-fixed font-label text-[10px] uppercase tracking-widest font-bold hover:underline">
                Abrir agenda
              </button>
            </div>
          ) : (
            <div className="relative pl-7 space-y-4 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/20">
              {events.map((e) => {
                const eventDateStr = e.data_inicio ? e.data_inicio.split('T')[0] : '';
                const relativeDay = formatDate(eventDateStr);
                const isToday = eventDateStr === today;
                const hora = e.horario || (e.data_inicio ? new Date(e.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');
                const styles = getEventStyles(e.tipo);
                
                return (
                  <div key={e.id} className="relative group cursor-pointer">
                    <div className={`absolute -left-7 top-1 w-[19px] h-[19px] rounded-full border-2 transition-colors ${
                      isToday 
                        ? 'bg-primary-fixed border-primary-fixed shadow-[0_0_10px_rgba(var(--primary-glow),0.4)]' 
                        : `${styles.dot} group-hover:brightness-110`
                    }`} />
                    <div className={`p-4 rounded-xl transition-all border ${
                      isToday 
                        ? 'bg-primary-fixed/5 border-primary-fixed/20 shadow-sm' 
                        : styles.card
                    } group-hover:scale-[1.01] duration-300`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-label text-[10px] uppercase tracking-widest font-bold ${isToday ? 'text-primary-fixed' : styles.text}`}>
                            {relativeDay === 'Hoje' ? '' : `${relativeDay} • `}{hora}
                          </span>
                          {e.tag && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest text-on-surface-variant leading-none">{e.tag}</span>
                          )}
                        </div>
                        {isToday && (
                          <span className="font-label text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary font-extrabold animate-pulse">HOJE</span>
                        )}
                      </div>
                      <h4 className={`font-body font-semibold text-sm ${isToday ? 'text-on-surface' : 'text-on-surface/90'}`}>{e.titulo}</h4>
                      {e.descricao && <p className="text-on-surface-variant text-xs mt-1 leading-relaxed line-clamp-2">{e.descricao}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default Painel;
