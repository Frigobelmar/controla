import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const AgenteIA = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Olá! Sou o assistente inteligente do Controla+. Como posso ajudar com suas finanças hoje?',
      timestamp: new Date(),
    },
    {
      id: 2,
      role: 'assistant',
      content: 'Notei que você tem 3 faturas vencendo esta semana. Gostaria que eu fizesse uma projeção de saldo?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMsg]);
    setInputValue('');

    // Simulando resposta da IA
    setTimeout(() => {
      const aiMsg = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Entendido. Estou processando sua solicitação baseada nos dados do seu dashboard...',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-surface border-l border-outline-variant/20 z-[70] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-glow),0.3)]">
              <Icon name="smart_toy" className="text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface text-lg leading-tight">Agente IA</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse" />
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Online e Analisando</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-primary-fixed text-on-primary rounded-tr-none shadow-lg' 
                  : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/10 shadow-sm'
              }`}>
                <p className="font-body text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-outline-variant/10 bg-surface-container-low">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pergunte sobre seus gastos..."
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl py-4 pl-4 pr-14 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-fixed/50 transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-lg bg-primary-fixed text-on-primary disabled:bg-surface-container-highest disabled:text-on-surface-variant transition-all hover:brightness-110 active:scale-95 shadow-md"
            >
              <Icon name="send" className="text-lg" />
            </button>
          </form>
          <p className="text-[10px] text-on-surface-variant text-center mt-4 uppercase tracking-[0.1em]">
            O Agente IA utiliza dados anonimizados para insights
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default AgenteIA;
