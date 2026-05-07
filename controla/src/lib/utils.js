/**
 * Formata uma string de data (YYYY-MM-DD) para um formato amigável.
 * Suporta labels relativos como Hoje, Ontem, Amanhã e intervalos curtos.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  // Garantir que a data seja interpretada no meio do dia para evitar problemas de timezone
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  const diffInMs = d.getTime() - today.getTime();
  const diffInDays = Math.round(diffInMs / 86400000);
  
  if (diffInDays === 0) return 'Hoje';
  if (diffInDays === 1) return 'Amanhã';
  if (diffInDays === -1) return 'Ontem';
  
  if (diffInDays > 1 && diffInDays <= 7) return `Em ${diffInDays} dias`;
  if (diffInDays < -1 && diffInDays >= -7) return `Há ${Math.abs(diffInDays)} dias`;
  
  return d.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short' 
  }).replace('.', '');
};
