import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { getEventsByDate, getEventsByDateRange, getUpcomingEvents } from '../lib/database';
import { formatDate } from '../lib/utils';

const today = new Date().toLocaleDateString('sv-SE');


const getEventStyles = (tipo) => {
  const mapping = {
    'REUNIAO_CLIENTE': { dot: 'bg-primary-fixed border-primary-fixed', card: 'bg-primary-fixed/5 border-primary-fixed/20 shadow-[0_0_15px_rgba(var(--primary-glow),0.1)]', text: 'text-primary-fixed' },
    'PRAZO_ENTREGA':   { dot: 'bg-error border-error', card: 'bg-error/5 border-error/20', text: 'text-error' },
    'PESSOAL':         { dot: 'bg-on-surface-variant border-on-surface-variant', card: 'bg-surface-container-high border-outline-variant/20', text: 'text-on-surface-variant' },
    'PROFISSIONAL':    { dot: 'bg-primary-fixed/60 border-primary-fixed/60', card: 'bg-surface-container-low border-outline-variant/10', text: 'text-on-surface/80' }
  };
  return mapping[tipo] || mapping['PROFISSIONAL'];
};

const Agenda = ({ openEvent }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('dia'); // 'dia' | 'periodo'
  const [selectedDate, setSelectedDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const days = useMemo(() => {
    const base = new Date();
    const startOfWeek = new Date(base);
    startOfWeek.setDate(base.getDate() - base.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isoDate = d.toLocaleDateString('sv-SE');
      return {
        day: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        date: d.getDate(),
        fullDate: isoDate,
        isToday: isoDate === today,
      };
    });
  }, []);

  useEffect(() => {
    load();
  }, [user, mode, selectedDate, startDate, endDate]);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      let data;
      if (mode === 'dia') {
        data = await getEventsByDate(user.id, selectedDate);
        // Se for hoje e estiver vazio, busca próximos
        if (selectedDate === today && data.length === 0) {
          data = await getUpcomingEvents(user.id, 10);
        }
      } else {
        if (endDate < startDate) return;
        data = await getEventsByDateRange(user.id, startDate, endDate);
      }
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatEventDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  const periodoLabel = mode === 'dia'
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : `${new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} → ${new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">

      {/* ── Cabeçalho ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">
            {periodoLabel}
          </p>
          <h2 className="font-headline font-extrabold text-3xl text-on-surface tracking-[-0.04em]">Agenda</h2>
        </div>
        <button
          onClick={openEvent}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-fixed text-on-primary font-bold hover:brightness-110 transition-all active:scale-95"
        >
          <Icon name="add" className="text-base" />
          <span className="font-label text-[10px] uppercase tracking-widest">Novo Evento</span>
        </button>
      </div>

      {/* ── Toggle modo ── */}
      <div className="flex bg-on-surface/5 rounded-xl p-1 mb-6 w-fit">
        {[{ key: 'dia', label: 'Por dia', icon: 'today' }, { key: 'periodo', label: 'Por período', icon: 'date_range' }].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label text-[10px] uppercase tracking-widest font-bold transition-all ${
              mode === key
                ? 'bg-primary-fixed text-on-primary shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon name={icon} className="text-[16px]" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'dia' ? (
          <motion.div key="dia" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Seletor de semana */}
            <div className="flex gap-2 mb-10 overflow-x-auto pb-1">
              {days.map(({ day, date, fullDate, isToday }) => {
                const isSelected = selectedDate === fullDate;
                return (
                  <button
                    key={fullDate}
                    onClick={() => setSelectedDate(fullDate)}
                    className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl min-w-[56px] transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-primary-fixed text-on-primary shadow-lg shadow-primary-fixed/20'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/10'
                    }`}
                  >
                    <span className="font-label text-[9px] uppercase tracking-widest">{day}</span>
                    <span className={`font-headline font-bold text-lg leading-none ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>
                      {date}
                    </span>
                    {isToday && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="periodo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Seletor de período */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <div className="flex-1 space-y-1">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Data início</label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface font-body text-sm outline-none focus:border-primary-fixed/40 transition-all"
                />
              </div>
              <div className="flex items-end pb-0 sm:pb-0 justify-center">
                <div className="h-12 flex items-center">
                  <Icon name="arrow_forward" className="text-on-surface-variant text-base" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Data fim</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-12 bg-on-surface/5 border border-outline-variant/10 rounded-xl px-4 text-on-surface font-body text-sm outline-none focus:border-primary-fixed/40 transition-all"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={load}
                  className="h-12 px-5 rounded-xl bg-primary-fixed text-on-primary font-label text-[10px] uppercase tracking-widest font-bold hover:brightness-110 active:scale-95 transition-all"
                >
                  Buscar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Timeline ── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline font-bold text-xl text-on-surface tracking-tight">
            {events.length} {events.length === 1 ? 'evento' : 'eventos'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Sincronizado</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin mx-auto" />
          </div>
        ) : events.length > 0 ? (
          <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/20">
            {events.map((e) => {
              const eventDateStr = e.data_inicio ? e.data_inicio.split('T')[0] : '';
              const isEventToday = eventDateStr === today;
              const relativeDay = formatDate(eventDateStr);
              const styles = getEventStyles(e.tipo);
              const hora = e.horario || (e.data_inicio ? new Date(e.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');

              return (
                <div key={e.id} className="relative group">
                  <div className={`absolute -left-8 top-1 w-[23px] h-[23px] rounded-full z-10 border-2 transition-colors ${
                    isEventToday 
                      ? 'bg-primary-fixed border-primary-fixed shadow-[0_0_10px_rgba(var(--primary-glow),0.4)]' 
                      : `${styles.dot} group-hover:brightness-110`
                  }`} />
                  <div className={`p-4 rounded-xl transition-all cursor-pointer border ${
                    isEventToday 
                      ? 'bg-primary-fixed/5 border-primary-fixed/20' 
                      : styles.card
                  } group-hover:scale-[1.01] duration-300`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-label text-xs uppercase tracking-widest font-bold ${isEventToday ? 'text-primary-fixed' : styles.text}`}>
                          {relativeDay === 'Hoje' ? 'HOJE' : relativeDay} • {hora}
                        </span>
                        {e.tag && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest text-on-surface-variant leading-none">
                            {e.tag}
                          </span>
                        )}
                        {isEventToday && (
                          <span className="font-label text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary font-extrabold animate-pulse ml-auto">AO VIVO</span>
                        )}
                      </div>
                      <Icon name="chevron_right" className="text-on-surface-variant text-base shrink-0 mt-0.5" />
                    </div>
                    <h4 className={`font-body font-semibold text-sm mb-1 ${isEventToday ? 'text-on-surface' : 'text-on-surface/90'}`}>{e.titulo}</h4>
                    {e.descricao && <p className="text-on-surface-variant text-xs leading-relaxed">{e.descricao}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20">
            <Icon name="event_busy" className="text-on-surface-variant/40 text-4xl mb-4" />
            <p className="text-on-surface-variant text-sm px-10">Nenhum compromisso encontrado neste período.</p>
            <button onClick={openEvent} className="mt-4 text-primary-fixed font-label text-[10px] uppercase tracking-widest font-bold hover:underline">
              Criar evento agora
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Agenda;
