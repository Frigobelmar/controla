import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

const NovaTarefa = ({ onBack }) => {
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    dueTime: '',
    priority: 'Média',
    tag: 'Financeiro',
    description: '',
  });

  const priorities = [
    { label: 'Baixa', color: 'bg-secondary-container text-secondary border-outline-variant/20' },
    { label: 'Média', color: 'bg-primary-fixed/10 text-primary-fixed border-primary-fixed/30' },
    { label: 'Alta',  color: 'bg-error/10 text-error border-error/30' },
  ];

  const tags = [
    { label: 'Financeiro', icon: 'payments' },
    { label: 'IA', icon: 'smart_toy' },
    { label: 'Admin', icon: 'description' },
    { label: 'Outros', icon: 'more_horiz' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Tarefa salva:', formData);
    // Aqui no futuro adicionaremos a lógica de salvar no estado global ou BD
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
            <h2 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">Nova Tarefa</h2>
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-on-surface/5 text-on-surface-variant transition-colors"
            >
              <Icon name="close" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">O que precisa ser feito?</label>
              <input 
                type="text" 
                required
                autoFocus
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Revisar fluxo de caixa"
                className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-fixed/50 transition-all font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Data e Horário */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Vencimento</label>
                  <input 
                    type="date" 
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface focus:outline-none focus:border-primary-fixed/50 transition-all font-body text-sm"
                  />
                </div>
                <div>
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Horário</label>
                  <input 
                    type="time" 
                    value={formData.dueTime}
                    onChange={e => setFormData({...formData, dueTime: e.target.value})}
                    className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface focus:outline-none focus:border-primary-fixed/50 transition-all font-body text-sm"
                  />
                </div>
              </div>

              {/* Prioridade */}
              <div className="col-span-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Prioridade</label>
                <div className="flex gap-2">
                  {priorities.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p.label})}
                      className={`flex-1 py-2.5 rounded-lg border text-[10px] font-bold uppercase tracking-tighter transition-all ${
                        formData.priority === p.label 
                          ? 'bg-primary-fixed text-on-primary border-primary-fixed scale-105 shadow-lg shadow-primary-fixed/20' 
                          : 'bg-on-surface/5 border-outline-variant/10 text-on-surface-variant'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Categorias / Tags */}
            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3 block">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setFormData({...formData, tag: t.label})}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                      formData.tag === t.label 
                        ? 'bg-primary-fixed/20 border-primary-fixed/50 text-primary-fixed' 
                        : 'bg-on-surface/5 border-outline-variant/10 text-on-surface-variant hover:border-outline-variant/20'
                    }`}
                  >
                    <Icon name={t.icon} className="text-sm" />
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block">Detalhes (Opcional)</label>
              <textarea 
                rows="3"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Adicione notas ou observações..."
                className="w-full bg-on-surface/5 border border-outline-variant/10 rounded-xl py-4 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-fixed/50 transition-all font-body text-sm resize-none"
              />
            </div>

            {/* Botão Salvar */}
            <button 
              type="submit"
              className="w-full py-5 rounded-2xl bg-primary-fixed text-on-primary font-headline font-bold text-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(175,255,10,0.15)] mt-4"
            >
              Adicionar Tarefa
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NovaTarefa;
