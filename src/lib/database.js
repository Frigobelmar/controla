import { supabase } from './supabase';

/**
 * Categorias
 */
export async function getCategories(_userId, type) {
  let query = supabase.from('categorias').select('*');
  
  if (type) {
    const dbType = type === 'receita' || type === 'income' ? 'RECEITA' : 'DESPESA';
    query = query.eq('tipo', dbType);
  }
  
  const { data, error } = await query.order('nome');
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(userId, category) {
  const dbType = category.tipo === 'receita' || category.tipo === 'income' ? 'RECEITA' : 'DESPESA';
  
  const { data, error } = await supabase
    .from('categorias')
    .insert([{ 
      user_id: userId,
      nome: category.nome, 
      icone: category.icone, 
      tipo: dbType 
    }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Transações Financeiras
 */
export async function saveTransaction(userId, transaction) {
  const dbType = transaction.type === 'receita' || transaction.type === 'income' ? 'RECEBER' : 'PAGAR';
  const installments = transaction.installments || 1;
  const isRecurrent = transaction.isFixed || false;

  const insertions = [];
  const baseDateStr = transaction.date || new Date().toISOString().split('T')[0];
  
  // Criar múltiplas inserções se for parcelado
  for (let i = 0; i < installments; i++) {
    const dueDate = new Date(baseDateStr + 'T12:00:00'); // Usar T12:00:00 para evitar problemas de fuso horário
    dueDate.setMonth(dueDate.getMonth() + i);
    
    insertions.push({
      user_id: userId,
      descricao: installments > 1 ? `${transaction.description} (${i + 1}/${installments})` : transaction.description,
      valor: transaction.value,
      categoria_id: transaction.categoryId,
      data_vencimento: dueDate.toISOString().split('T')[0],
      tipo: dbType,
      forma_pagamento: 'DINHEIRO',
      status: 'PENDENTE',
      recorrente: isRecurrent,
      parcelado: installments > 1,
      total_parcelas: installments > 1 ? installments : null,
      frequencia_recorrencia: isRecurrent ? 'MENSAL' : null
    });
  }

  const { data, error } = await supabase
    .from('transacoes_financeiras')
    .insert(insertions)
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateTransaction(id, transaction) {
  const dbType = transaction.type === 'receita' || transaction.type === 'income' ? 'RECEBER' : 'PAGAR';

  const { data, error } = await supabase
    .from('transacoes_financeiras')
    .update({
      descricao: transaction.description,
      valor: transaction.value,
      categoria_id: transaction.categoryId,
      data_vencimento: transaction.date,
      tipo: dbType,
      data_atualizacao: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteTransaction(id) {
  // Se houver parcelas, o banco deve lidar via cascade ou deletamos manualmente
  // Por segurança, vamos deletar parcelas associadas primeiro se o cascade não estiver configurado
  await supabase.from('parcelas').delete().eq('transacao_id', id);
  
  const { error } = await supabase
    .from('transacoes_financeiras')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getUpcomingTransactions(userId, limit = 10) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('transacoes_financeiras')
    .select('*, categorias (nome, icone)')
    .eq('user_id', userId)
    .gte('data_vencimento', today)
    .order('data_vencimento', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getTransactions(userId, options = {}) {
  let query = supabase
    .from('transacoes_financeiras')
    .select(`
      *,
      categorias (nome, icone)
    `)
    .eq('user_id', userId)
    .order('data_vencimento', { ascending: false });

  if (options.limit) query = query.limit(options.limit);
  if (options.type && options.type !== 'Todos') {
    const dbType = options.type === 'Receitas' ? 'RECEBER' : 'PAGAR';
    query = query.eq('tipo', dbType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Agenda / Eventos
 */
export async function saveEvent(userId, event) {
  const tagMapping = {
    'Reunião': 'REUNIAO_CLIENTE',
    'IA': 'PROFISSIONAL',
    'Fiscal': 'PROFISSIONAL',
    'Lembrete': 'PESSOAL'
  };
  const tipo = tagMapping[event.tag] || 'PROFISSIONAL';

  const { data, error } = await supabase
    .from('agendamentos')
    .insert([{
      user_id: userId,
      titulo: event.title,
      descricao: event.description,
      data_inicio: `${event.date}T${event.time || '00:00'}:00`,
      tipo: tipo,
      status: 'ATIVO'
    }])
    .select();

  if (error) throw error;
  return data[0];
}

export async function getEventsByDate(userId, date) {
  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('user_id', userId)
    .gte('data_inicio', startOfDay)
    .lte('data_inicio', endOfDay)
    .order('data_inicio', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getEventsByDateRange(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('user_id', userId)
    .gte('data_inicio', `${startDate}T00:00:00`)
    .lte('data_inicio', `${endDate}T23:59:59`)
    .order('data_inicio', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Tarefas
 */
export async function saveTask(userId, task) {
  const { data, error } = await supabase
    .from('tarefas')
    .insert([{
      user_id: userId,
      titulo: task.title,
      descricao: task.description,
      data_vencimento: task.dueDate,
      horario_vencimento: task.dueTime,
      prioridade: task.priority,
      tag: task.tag,
      concluida: false
    }])
    .select();

  if (error) throw error;
  return data[0];
}

export async function getTasks(userId) {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('user_id', userId)
    .order('data_vencimento', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Dashboard Stats
 */
export async function getSummaryStats(userId) {
  // Simplificação: pega as transações do mês atual para os cards
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startISO = startOfMonth.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transacoes_financeiras')
    .select('valor, tipo')
    .eq('user_id', userId)
    .gte('data_vencimento', startISO);

  if (error) throw error;

  const receitas = data
    .filter(t => t.tipo === 'RECEBER')
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);
  
  const despesas = data
    .filter(t => t.tipo === 'PAGAR')
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas
  };
}
