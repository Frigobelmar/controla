import { supabase } from './supabase';

/**
 * Upload de Anexos
 */
export async function uploadAnexo(userId, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from('anexos_transacoes')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('anexos_transacoes')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    name: file.name,
    type: file.type,
    size: file.size,
    path: filePath
  };
}

/**
 * Contas Bancárias
 */
export async function getContas(userId) {
  const { data, error } = await supabase
    .from('contas_bancarias')
    .select('*')
    .eq('user_id', userId)
    .eq('ativa', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createConta(userId, conta) {
  // Se for a primeira conta ou marcada como padrão, remove o padrão das outras
  if (conta.padrao) {
    await supabase
      .from('contas_bancarias')
      .update({ padrao: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('contas_bancarias')
    .insert([{
      user_id:      userId,
      nome:         conta.nome,
      tipo:         conta.tipo || 'CORRENTE',
      banco_nome:   conta.banco_nome || null,
      banco_codigo: conta.banco_codigo || null,
      banco_cor:    conta.banco_cor || null,
      agencia:      conta.agencia || null,
      conta:        conta.conta || null,
      saldo_inicial: conta.saldo_inicial ?? 0,
      padrao:       conta.padrao ?? false,
      ativa:        true,
    }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteConta(id) {
  const { error } = await supabase
    .from('contas_bancarias')
    .update({ ativa: false })
    .eq('id', id);
  if (error) throw error;
}

export async function setContaPadrao(userId, id) {
  await supabase
    .from('contas_bancarias')
    .update({ padrao: false })
    .eq('user_id', userId);

  const { error } = await supabase
    .from('contas_bancarias')
    .update({ padrao: true })
    .eq('id', id);
  if (error) throw error;
}

export async function getContaSaldos(userId) {
  // Retorna saldo calculado (saldo_inicial + entradas - saídas) por conta
  const { data: contas, error: ce } = await supabase
    .from('contas_bancarias')
    .select('*')
    .eq('user_id', userId)
    .eq('ativa', true);
  if (ce) throw ce;

  const { data: txs, error: te } = await supabase
    .from('transacoes_financeiras')
    .select('valor, tipo, conta_id')
    .eq('user_id', userId);
  if (te) throw te;

  return (contas ?? []).map(conta => {
    const contaTxs = (txs ?? []).filter(t => t.conta_id === conta.id);
    const entradas = contaTxs.filter(t => t.tipo === 'RECEBER').reduce((s, t) => s + parseFloat(t.valor), 0);
    const saidas   = contaTxs.filter(t => t.tipo === 'PAGAR').reduce((s, t) => s + parseFloat(t.valor), 0);
    return {
      ...conta,
      saldo: parseFloat(conta.saldo_inicial || 0) + entradas - saidas,
      entradas,
      saidas,
    };
  });
}

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
      tipo: dbType,
      meta: category.meta ? parseFloat(category.meta) : null
    }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function updateCategoryMeta(id, meta) {
  const { data, error } = await supabase
    .from('categorias')
    .update({ meta: meta !== null && meta !== '' ? parseFloat(meta) : null })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function getCategorySpending(userId) {
  // Gastos do mês atual agrupados por categoria
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startISO = startOfMonth.toLocaleDateString('sv-SE');

  const { data: cats, error: catErr } = await supabase
    .from('categorias')
    .select('id, nome, icone, tipo, meta')
    .eq('user_id', userId);
  if (catErr) throw catErr;

  const { data: txs, error: txErr } = await supabase
    .from('transacoes_financeiras')
    .select('valor, tipo, categoria_id')
    .eq('user_id', userId)
    .gte('data_vencimento', startISO);
  if (txErr) throw txErr;

  return (cats ?? []).map(cat => {
    const gasto = (txs ?? [])
      .filter(t => t.categoria_id === cat.id)
      .reduce((acc, t) => acc + parseFloat(t.valor), 0);
    return { ...cat, gasto };
  });
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) throw error;
}

export async function updateCategory(id, { nome, icone, meta }) {
  const updates = {};
  if (nome !== undefined) updates.nome = nome;
  if (icone !== undefined) updates.icone = icone;
  if (meta !== undefined) updates.meta = meta !== null && meta !== '' ? parseFloat(meta) : null;

  const { data, error } = await supabase
    .from('categorias')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
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
      conta_id: transaction.contaId || null,
      data_vencimento: dueDate.toISOString().split('T')[0],
      tipo: dbType,
      forma_pagamento: 'DINHEIRO',
      status: transaction.status || 'PENDENTE',
      anexos: transaction.anexos || null,
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
      conta_id: transaction.contaId,
      data_vencimento: transaction.date,
      tipo: dbType,
      status: transaction.status,
      anexos: transaction.anexos || null,
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
  const { error } = await supabase.from('transacoes_financeiras').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Registra um pagamento parcial dividindo a transação
 */
export async function recordPartialPayment(txId, valorPago, proximaData) {
  // 1. Buscar transação original
  const { data: original, error: fetchError } = await supabase
    .from('transacoes_financeiras')
    .select('*')
    .eq('id', txId)
    .single();

  if (fetchError) throw fetchError;

  const valorRestante = original.valor - valorPago;

  if (valorRestante <= 0) {
    // Pagamento total ou maior que o valor
    return await updateTransaction(txId, {
      ...original,
      value: original.valor,
      status: 'PAGO',
      date: original.data_vencimento,
      type: original.tipo === 'RECEBER' ? 'receita' : 'despesa'
    });
  }

  // 2. Atualizar a original para o valor pago e status PAGO
  await supabase
    .from('transacoes_financeiras')
    .update({
      valor: valorPago,
      status: 'PAGO',
      data_atualizacao: new Date().toISOString()
    })
    .eq('id', txId);

  // 3. Criar uma nova transação com o saldo restante (apenas colunas válidas)
  const { data: newTx, error: createError } = await supabase
    .from('transacoes_financeiras')
    .insert([{
      user_id: original.user_id,
      descricao: `${original.descricao} (Restante)`,
      valor: valorRestante,
      categoria_id: original.categoria_id,
      conta_id: original.conta_id,
      data_vencimento: proximaData || original.data_vencimento,
      tipo: original.tipo,
      forma_pagamento: original.forma_pagamento || 'DINHEIRO',
      status: 'PENDENTE',
      anexos: original.anexos || null,
      recorrente: original.recorrente || false,
      parcelado: original.parcelado || false,
      total_parcelas: original.total_parcelas || null,
      frequencia_recorrencia: original.frequencia_recorrencia || null,
    }])
    .select();

  if (createError) throw createError;
  return newTx[0];
}

export async function getUpcomingTransactions(userId, limit = 10) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('transacoes_financeiras')
    .select('*, categorias (nome, icone), contas_bancarias!transacoes_financeiras_conta_id_fkey (nome, banco_nome, banco_cor, banco_codigo)')
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
      categorias (nome, icone),
      contas_bancarias!transacoes_financeiras_conta_id_fkey (nome, banco_nome, banco_cor, banco_codigo)
    `)
    .eq('user_id', userId)
    .order('data_vencimento', { ascending: false });

  if (options.limit) query = query.limit(options.limit);
  
  if (options.type && options.type !== 'Todos') {
    const dbType = options.type === 'Receitas' ? 'RECEBER' : 'PAGAR';
    query = query.eq('tipo', dbType);
  }

  if (options.startDate) {
    query = query.gte('data_vencimento', options.startDate);
  }
  if (options.endDate) {
    query = query.lte('data_vencimento', options.endDate);
  }
  if (options.categoryId) {
    query = query.eq('categoria_id', options.categoryId);
  }
  if (options.status && options.status !== 'Todos') {
    query = query.eq('status', options.status.toUpperCase());
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
    'Cliente': 'REUNIAO_CLIENTE',
    'IA': 'PROFISSIONAL',
    'Fiscal': 'PRAZO_ENTREGA',
    'Lembrete': 'PESSOAL',
    'Pessoal': 'PESSOAL',
    'Saúde': 'PESSOAL',
    'Pagar': 'PRAZO_ENTREGA',
    'Vencimento': 'PRAZO_ENTREGA',
    'Trabalho': 'PROFISSIONAL',
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

export async function getUpcomingEvents(userId, limit = 10) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startISO = startOfToday.toISOString();
  
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('user_id', userId)
    .gte('data_inicio', startISO)
    .order('data_inicio', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
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
  // Pega as transações do mês atual para os cards
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startISO = startOfMonth.toLocaleDateString('sv-SE');

  const { data, error } = await supabase
    .from('transacoes_financeiras')
    .select('valor, tipo, status')
    .eq('user_id', userId)
    .gte('data_vencimento', startISO);

  if (error) throw error;

  // Valores Pagos
  const receitasPagas = data
    .filter(t => t.tipo === 'RECEBER' && t.status === 'PAGO')
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);

  const despesasPagas = data
    .filter(t => t.tipo === 'PAGAR' && t.status === 'PAGO')
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);

  // Valores Pendentes
  const receitasPendentes = data
    .filter(t => t.tipo === 'RECEBER' && t.status !== 'PAGO')
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);

  const despesasPendentes = data
    .filter(t => t.tipo === 'PAGAR' && t.status !== 'PAGO')
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);

  // Totais Previstos
  const receitasTotal = receitasPagas + receitasPendentes;
  const despesasTotal = despesasPagas + despesasPendentes;

  return {
    receitas: receitasPagas,
    despesas: despesasPagas,
    saldo: receitasPagas - despesasPagas,
    receitasPendentes,
    despesasPendentes,
    receitasTotal,
    despesasTotal,
    saldoTotal: receitasTotal - despesasTotal
  };
}

/**
 * Preferências do Usuário
 */
export async function getUserPreferences(userId) {
  const { data, error } = await supabase
    .from('preferencias_usuario')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar preferências:', error);
    return null;
  }
  return data;
}

export async function updateUserPreferences(userId, prefs) {
  const { data, error } = await supabase
    .from('preferencias_usuario')
    .upsert({
      user_id: userId,
      notif_vencimento: prefs.notifVencimento,
      notif_ia: prefs.notifIA,
      whatzap: prefs.whatsapp,
      phone: prefs.whatsapp, // Salvando também na coluna 'phone'
      dark_mode: prefs.darkMode,
      biometria: prefs.biometria,
      relatorio_semanal: prefs.relatorio,
      data_atualizacao: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('Erro ao atualizar preferências:', error);
    throw error;
  }
  return data[0];
}
