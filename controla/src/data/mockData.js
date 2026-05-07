export const balanceData = {
  total: 'R$ 12.450,00',
  change: '+12,5%',
  changeLabel: '+12,5% em relação ao mês anterior',
  trend: 'up',
};

export const statsData = [
  {
    id: 'receitas',
    label: 'Receitas',
    value: 'R$ 8.920,00',
    trend: 'up',
  },
  {
    id: 'despesas',
    label: 'Despesas',
    value: 'R$ 3.470,00',
    trend: 'down',
  },
];

export const actionsData = [
  { id: 'despesa',    label: 'Despesa',    icon: 'expense',  variant: 'default' },
  { id: 'receita',   label: 'Receita',    icon: 'income',   variant: 'default' },
  { id: 'tarefa',    label: 'Nova Tarefa', icon: 'task',    variant: 'default' },
  { id: 'agente',    label: 'Agente IA',  icon: 'bot',      variant: 'accent'  },
];

export const billsData = [
  {
    id: 1,
    name: 'Energia Elétrica - Matriz',
    icon: 'zap',
    amount: 'R$ 1.240,50',
    dueLabel: 'Vencimento: Hoje',
    status: 'urgent',
    statusLabel: 'URGENTE',
  },
  {
    id: 2,
    name: 'Assinatura Google Cloud',
    icon: 'cloud',
    amount: 'R$ 450,00',
    dueLabel: 'Vencimento: 22 Out',
    status: 'pending',
    statusLabel: 'PENDENTE',
  },
  {
    id: 3,
    name: 'Aluguel Escritório',
    icon: 'building',
    amount: 'R$ 5.800,00',
    dueLabel: 'Vencimento: 25 Out',
    status: 'pending',
    statusLabel: 'PENDENTE',
  },
];

export const agendaData = {
  date: '21 OUT, 2023',
  events: [
    {
      id: 1,
      time: '09:00 - 10:30',
      title: 'Review Mensal com IA Agent',
      description: 'Análise preditiva de fluxo de caixa para o Q4 e ajustes de orçamento operacional.',
      done: true,
    },
    {
      id: 2,
      time: '14:00 - 15:00',
      title: 'Aprovação de Reembolsos',
      description: 'Verificar solicitações da equipe de vendas pendentes no WhatsApp.',
      done: false,
    },
  ],
};
