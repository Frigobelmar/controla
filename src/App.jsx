import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Painel from './pages/Painel';
import Financeiro from './pages/Financeiro';
import Agenda from './pages/Agenda';
import Ajustes from './pages/Ajustes';
import Lancamento from './pages/Lancamento';
import AgenteIA from './components/AgenteIA';
import NovoEvento from './components/NovoEvento';
import NovaTarefa from './components/NovaTarefa';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const [activeTab, setActiveTab] = useState('painel');
  const [transactionModal, setTransactionModal] = useState(null); // 'expense', 'income', or null
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const { session } = useAuth();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (!session) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'painel':     return <Painel setTab={setActiveTab} openTransaction={setTransactionModal} openAI={() => setIsAIModalOpen(true)} openTask={() => setIsTaskModalOpen(true)} />;
      case 'financeiro': return <Financeiro setTab={setActiveTab} openTransaction={setTransactionModal} />;
      case 'agenda':     return <Agenda openEvent={() => setIsEventModalOpen(true)} />;
      case 'ajustes':    return <Ajustes />;
      default:           return <Painel setTab={setActiveTab} openTransaction={setTransactionModal} openAI={() => setIsAIModalOpen(true)} openTask={() => setIsTaskModalOpen(true)} />;
    }
  };

  return (
    <div className={`font-body text-on-surface antialiased bg-primary-fixed/5 min-h-screen relative overflow-x-hidden ${isDarkMode ? '' : 'light-mode'}`}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      {renderPage()}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Transaction Overlay Modal */}
      <AnimatePresence>
        {transactionModal && (
          <Lancamento 
            type={transactionModal} 
            onBack={() => setTransactionModal(null)} 
          />
        )}
      </AnimatePresence>

      {/* AI Agent Floating Drawer */}
      <AnimatePresence>
        {isAIModalOpen && (
          <AgenteIA onClose={() => setIsAIModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <AnimatePresence>
        {isEventModalOpen && (
          <NovoEvento onBack={() => setIsEventModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <NovaTarefa onBack={() => setIsTaskModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
