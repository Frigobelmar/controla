const N8N_WEBHOOK = 'https://teste.berthia.com.br/webhook/controla_autenticacao%20';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Falha ao contatar o serviço de WhatsApp.' });
    }

    const data = await response.json().catch(() => ({}));
    return res.status(200).json(data);
  } catch (err) {
    const msg = err.name === 'TimeoutError'
      ? 'Tempo limite esgotado ao contatar o serviço.'
      : 'Erro interno ao enviar o código.';
    return res.status(500).json({ error: msg });
  }
}
