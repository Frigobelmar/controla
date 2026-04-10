import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

const NovoEvento = ({ onBack }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    tag: 'Reunião',
    description: '',
  });

  const tags = [
    { label: 'Reunião', color: 'bg-surface-container-highest text-on-surface-variant' },
    { label: 'IA',      color: 'bg-primary-fixed/10 text-primary-fixed' },
    { label: 'Fiscal',  color: 'bg-error/10 text-error' },
    { label: 'Lembrete', color: 'bg-secondary-container text-secondary' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Evento salvo:', formData);
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onBack}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-surface rounded-3xl overflow-hidden border border-outline-variant/10 shadow-2xl"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">Novo Evento</h2>
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-on-surface/5 text-on-surface-variant transition-colors"
            >
              <Icon name="close" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Título do Evento</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Sync com IA Agent"
                className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-fixed/50 transition-all font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Data</label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface focus:outline-none focus:border-primary-fixed/50 transition-all font-body text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Horário</label>
                <input 
                  type="time" 
                  required
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface focus:outline-none focus:border-primary-fixed/50 transition-all font-body text-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3 block">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => setFormData({...formData, tag: tag.label})}
                    className={`px-4 py-2 rounded-xl border transition-all font-label text-[10px] uppercase tracking-widest ${
                      formData.tag === tag.label 
                        ? 'bg-primary-fixed text-on-primary border-primary-fixed shadow-lg shadow-primary-fixed/20' 
                        : 'bg-on-surface/5 border-outline-variant/10 text-on-surface-variant hover:border-outline-variant/20'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Descrição (Opcional)</label>
              <textarea 
                rows="3"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Detalhes do compromisso..."
                className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-fixed/50 transition-all font-body text-sm resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-5 rounded-2xl bg-primary-fixed text-on-primary font-headline font-bold text-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(175,255,10,0.15)] mt-4"
            >
              Agendar Evento
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NovoEvento;
