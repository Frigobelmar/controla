import React, { useState } from 'react';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
      enabled ? 'bg-primary-fixed' : 'bg-surface-container-highest'
    }`}
  >
    <span
      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
        enabled ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>
);

const SettingRow = ({ icon, label, description, action }) => (
  <div className="flex items-center justify-between py-4 border-b border-outline-variant/10 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
        <Icon name={icon} className="text-on-surface-variant text-[18px]" />
      </div>
      <div>
        <p className="font-body font-semibold text-on-surface text-sm">{label}</p>
        {description && <p className="text-on-surface-variant text-xs">{description}</p>}
      </div>
    </div>
    {action}
  </div>
);

const Ajustes = () => {
  const { signOut } = useAuth();
  const [prefs, setPrefs] = useState({
    notifVencimento: true,
    notifIA:         true,
    whatsapp:        true,
    darkMode:        true,
    biometria:       false,
    relatorio:       true,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-10">
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">
          Configurações
        </p>
        <h2 className="font-headline font-extrabold text-3xl text-on-surface tracking-[-0.04em]">
          Ajustes
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Coluna esquerda ── */}
        <div className="lg:col-span-5 space-y-4">

          {/* Perfil */}
          <div className="p-6 rounded-xl bg-surface-container-low">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center border-2 border-primary-fixed/20">
                <Icon name="person" className="text-on-surface-variant" style={{ fontSize: 28 }} />
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface text-lg">Usuário</p>
                <p className="text-on-surface-variant text-sm">Administrador</p>
              </div>
              <button className="ml-auto p-2 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
                <Icon name="edit" className="text-[18px]" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Transações', value: '128' },
                { label: 'Este mês',   value: 'R$ 12k' },
                { label: 'Agentes IA', value: '3' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg bg-surface-container">
                  <p className="font-headline font-bold text-on-surface text-lg">{value}</p>
                  <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Integração WhatsApp */}
          <div className="p-6 rounded-xl bg-surface-container-low">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="chat" className="text-primary-fixed text-[20px]" />
              <h3 className="font-headline font-bold text-on-surface">WhatsApp IA</h3>
              <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed/10 border border-primary-fixed/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse" />
                <span className="font-label text-[9px] uppercase tracking-widest text-primary-fixed">Conectado</span>
              </span>
            </div>
            <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
              Seu agente IA está ativo e monitorando mensagens financeiras no WhatsApp.
              Última sincronização: há 2 minutos.
            </p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-error/10 text-error border border-error/20 font-label text-[10px] uppercase tracking-widest hover:bg-error/20 transition-colors">
                Desconectar
              </button>
              <button className="flex-1 py-2 rounded-lg bg-primary-fixed text-on-primary font-label text-[10px] uppercase tracking-widest font-bold hover:brightness-110 transition-all">
                Configurar
              </button>
            </div>
          </div>

        </div>

        {/* ── Coluna direita ── */}
        <div className="lg:col-span-7 space-y-4">

          {/* Notificações */}
          <div className="p-6 rounded-xl bg-surface-container-low">
            <h3 className="font-headline font-bold text-on-surface mb-1">Notificações</h3>
            <p className="text-on-surface-variant text-xs mb-5">
              Gerencie os alertas do app e do agente IA.
            </p>
            <SettingRow
              icon="notification_important"
              label="Alertas de Vencimento"
              description="Avisa 1 dia antes do vencimento"
              action={<Toggle enabled={prefs.notifVencimento} onChange={() => toggle('notifVencimento')} />}
            />
            <SettingRow
              icon="smart_toy"
              label="Notificações do Agente IA"
              description="Análises e sugestões automáticas"
              action={<Toggle enabled={prefs.notifIA} onChange={() => toggle('notifIA')} />}
            />
            <SettingRow
              icon="chat"
              label="Alertas via WhatsApp"
              description="Receba resumos diários no chat"
              action={<Toggle enabled={prefs.whatsapp} onChange={() => toggle('whatsapp')} />}
            />
            <SettingRow
              icon="summarize"
              label="Relatório Semanal"
              description="Toda segunda-feira às 08:00"
              action={<Toggle enabled={prefs.relatorio} onChange={() => toggle('relatorio')} />}
            />
          </div>

          {/* Preferências */}
          <div className="p-6 rounded-xl bg-surface-container-low">
            <h3 className="font-headline font-bold text-on-surface mb-1">Preferências</h3>
            <p className="text-on-surface-variant text-xs mb-5">
              Personalização visual e de segurança.
            </p>
            <SettingRow
              icon="dark_mode"
              label="Modo Escuro"
              description="Interface escura (recomendado)"
              action={<Toggle enabled={prefs.darkMode} onChange={() => toggle('darkMode')} />}
            />
            <SettingRow
              icon="fingerprint"
              label="Biometria"
              description="Acesso rápido com digital"
              action={<Toggle enabled={prefs.biometria} onChange={() => toggle('biometria')} />}
            />
            <SettingRow
              icon="language"
              label="Idioma"
              description="Português (Brasil)"
              action={<Icon name="chevron_right" className="text-on-surface-variant" />}
            />
          </div>

          {/* Segurança */}
          <div className="p-6 rounded-xl bg-surface-container-low">
            <h3 className="font-headline font-bold text-on-surface mb-1">Segurança</h3>
            <p className="text-on-surface-variant text-xs mb-5">
              Proteção da sua conta e dados.
            </p>
            <SettingRow
              icon="lock"
              label="Alterar Senha"
              description="Atualizada há 3 meses"
              action={<button className="text-primary-fixed text-[10px] font-bold uppercase tracking-widest hover:underline">Alterar</button>}
            />
            <SettingRow
              icon="devices"
              label="Dispositivos Conectados"
              description="2 sessões ativas no momento"
              action={<Icon name="chevron_right" className="text-on-surface-variant" />}
            />
            <SettingRow
              icon="history"
              label="Log de Atividades"
              description="Ver histórico de acessos"
              action={<Icon name="chevron_right" className="text-on-surface-variant" />}
            />
          </div>

          {/* Ações da Conta */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => signOut()}
              className="w-full py-4 rounded-xl bg-surface-container-high text-error font-headline font-bold flex items-center justify-center gap-2 hover:bg-error/10 transition-colors"
            >
              <Icon name="logout" />
              Sair da Conta
            </button>
            <p className="text-[9px] text-center text-on-surface-variant uppercase tracking-widest">
              Controla+ Financial Institutional Edition
            </p>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Ajustes;
