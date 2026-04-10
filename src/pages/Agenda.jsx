import React, { useState } from 'react';
import Icon from '../components/Icon';

const days = [
  { day: 'Dom', date: 19, active: false },
  { day: 'Seg', date: 20, active: false },
  { day: 'Ter', date: 21, active: true  },
  { day: 'Qua', date: 22, active: false },
  { day: 'Qui', date: 23, active: false },
  { day: 'Sex', date: 24, active: false },
  { day: 'Sáb', date: 25, active: false },
];

const events = [
  {
    id: 1,
    time: '09:00',
    end:  '10:30',
    title: 'Review Mensal com IA Agent',
    description: 'Análise preditiva de fluxo de caixa para o Q4 e ajustes de orçamento operacional.',
    tag: 'IA',
    tagColor: 'bg-primary-fixed/10 text-primary-fixed',
    done: true,
  },
  {
    id: 2,
    time: '12:00',
    end:  '13:00',
    title: 'Almoço com Sócios',
    description: 'Discussão sobre expansão do portfólio de investimentos para Q1 2024.',
    tag: 'Reunião',
    tagColor: 'bg-surface-container-highest text-on-surface-variant',
    done: false,
  },
  {
    id: 3,
    time: '14:00',
    end:  '15:00',
    title: 'Aprovação de Reembolsos',
    description: 'Verificar solicitações da equipe de vendas pendentes no WhatsApp.',
    tag: 'Aprovação',
    tagColor: 'bg-error/10 text-error',
    done: false,
  },
  {
    id: 4,
    time: '16:00',
    end:  '16:30',
    title: 'Sync com Contador',
    description: 'Alinhamento sobre obrigações fiscais do trimestre e DAS MEI.',
    tag: 'Fiscal',
    tagColor: 'bg-surface-container-highest text-on-surface-variant',
    done: false,
  },
  {
    id: 5,
    time: '17:30',
    end:  null,
    title: 'Fechamento do Dia',
    description: 'Sincronização automática de extratos bancários via integração whats-finance.',
    tag: 'Auto',
    tagColor: 'bg-primary-fixed/10 text-primary-fixed',
    done: false,
  },
];

const Agenda = ({ openEvent }) => {
  const [selectedDay, setSelectedDay] = useState(21);

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">

      {/* ── Cabeçalho ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">
            Outubro 2023
          </p>
          <h2 className="font-headline font-extrabold text-3xl text-on-surface tracking-[-0.04em]">
            Agenda
          </h2>
        </div>
        <button 
          onClick={openEvent}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-fixed text-on-primary font-bold hover:brightness-110 transition-all active:scale-95"
        >
          <Icon name="add" className="text-base" />
          <span className="font-label text-[10px] uppercase tracking-widest">Novo Evento</span>
        </button>
      </div>

      {/* ── Seletor de semana ── */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-1">
        {days.map(({ day, date, active: defaultActive }) => {
          const isSelected = selectedDay === date;
          return (
            <button
              key={date}
              onClick={() => setSelectedDay(date)}
              className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl min-w-[56px] transition-all active:scale-95 ${
                isSelected
                  ? 'bg-primary-fixed text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="font-label text-[9px] uppercase tracking-widest">{day}</span>
              <span className={`font-headline font-bold text-lg leading-none ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>
                {date}
              </span>
              {defaultActive && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── Timeline ── */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-bold text-xl text-on-surface tracking-tight">
              {selectedDay === 21 ? 'Hoje' : `${selectedDay} Out`} — {events.length} eventos
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Ao vivo
              </span>
            </div>
          </div>

          <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/20">
            {events.map((e) => (
              <div key={e.id} className="relative group">
                <div className={`absolute -left-8 top-1 w-[23px] h-[23px] rounded-full z-10 border-2 transition-colors ${
                  e.done
                    ? 'bg-primary-fixed border-primary-fixed'
                    : 'bg-surface-dim border-outline-variant group-hover:border-primary-fixed/50'
                }`}>
                  {e.done && (
                    <Icon name="check" className="text-on-primary absolute inset-0 flex items-center justify-center" style={{ fontSize: 13, lineHeight: '19px', paddingLeft: 2 }} />
                  )}
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-label text-[10px] uppercase tracking-[0.1em] text-primary-fixed font-bold">
                        {e.time}{e.end ? ` – ${e.end}` : ''}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${e.tagColor}`}>
                        {e.tag}
                      </span>
                    </div>
                    <Icon name="chevron_right" className="text-on-surface-variant text-base shrink-0 mt-0.5" />
                  </div>
                  <h4 className="font-body font-semibold text-on-surface text-sm mb-1">{e.title}</h4>
                  <p className="text-on-surface-variant text-xs leading-relaxed">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Resumo do dia ── */}
        <section className="lg:col-span-5 space-y-4">
          <h3 className="font-headline font-bold text-xl text-on-surface tracking-tight mb-6">
            Resumo do Dia
          </h3>

          <div className="p-5 rounded-xl bg-surface-container-low">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary-fixed/10 flex items-center justify-center">
                <Icon name="smart_toy" className="text-primary-fixed text-[18px]" />
              </div>
              <div>
                <p className="font-body font-semibold text-on-surface text-sm">Agente IA ativo</p>
                <p className="text-on-surface-variant text-xs">Monitorando agenda</p>
              </div>
            </div>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              Você tem <span className="text-primary-fixed font-semibold">5 eventos</span> hoje.
              1 reunião de IA às 09:00 e 1 aprovação financeira às 14:00 requerem sua atenção.
            </p>
          </div>

          <div className="p-5 rounded-xl glass-panel border border-outline-variant/10">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
              Distribuição de tempo
            </p>
            <div className="space-y-3">
              {[
                { label: 'Reuniões',   pct: 60, color: 'bg-primary-fixed' },
                { label: 'Revisões',   pct: 25, color: 'bg-on-surface-variant' },
                { label: 'Automático', pct: 15, color: 'bg-secondary-container' },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-on-surface-variant text-xs">{label}</span>
                    <span className="font-label text-[10px] text-on-surface-variant">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-low">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
              Próximos dias
            </p>
            {[
              { date: '22 Out', title: 'Vencimento Google Cloud', icon: 'cloud_queue' },
              { date: '25 Out', title: 'Vencimento Aluguel',       icon: 'store'       },
              { date: '31 Out', title: 'Fechamento Mensal',         icon: 'analytics'   },
            ].map(({ date, title, icon }) => (
              <div key={date} className="flex items-center gap-3 py-2.5 border-b border-outline-variant/10 last:border-0">
                <Icon name={icon} className="text-on-surface-variant text-[18px]" />
                <div>
                  <p className="text-on-surface text-xs font-semibold">{title}</p>
                  <p className="text-on-surface-variant text-[10px]">{date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
};

export default Agenda;
