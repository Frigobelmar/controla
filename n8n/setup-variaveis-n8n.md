# Configuração de Variáveis do n8n — CONTROLA+

## Variáveis Obrigatórias no n8n

Acesse **Settings → Variables** no seu n8n e cadastre:

| Variável | Descrição | Onde obter |
|----------|-----------|------------|
| `SUPABASE_URL` | URL do projeto Supabase | Dashboard Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Chave pública (anon) | Dashboard Supabase → Settings → API |
| `SUPABASE_SERVICE_KEY` | Chave de serviço (service_role) ⚠️ | Dashboard Supabase → Settings → API |
| `OPENAI_API_KEY` | Chave da API OpenAI | platform.openai.com |
| `EVOLUTION_API_URL` | URL base da Evolution API | Ex: `https://evolution.seudominio.com` |
| `EVOLUTION_API_KEY` | Chave da Evolution API | Painel da Evolution API |
| `EVOLUTION_INSTANCE` | Nome da instância WhatsApp | Ex: `controla` |

> ⚠️ **IMPORTANTE**: O `SUPABASE_SERVICE_KEY` (service_role) bypassa o RLS do Supabase.
> Use-o APENAS no n8n (backend). NUNCA exponha no frontend.

---

## Credencial OpenAI no n8n

O nó **GPT-4o-mini** usa credencial do tipo `openAiApi`. Configure em:
**Settings → Credentials → New → OpenAI**

Preencha com sua `OPENAI_API_KEY` e nomeie como `OpenAI API`.

---

## Webhook URL

Após importar o workflow, o endpoint do WhatsApp será:

```
https://SEU_N8N.com/webhook/whatsapp-controla
```

Configure este URL no painel da **Evolution API** como webhook de mensagens recebidas.

---

## Ferramentas do Agente IA

O agente possui 8 ferramentas disponíveis:

| Ferramenta | O que faz |
|------------|-----------|
| `criar_lancamento` | Registra despesa ou receita |
| `listar_lancamentos` | Consulta histórico financeiro |
| `criar_categoria` | Adiciona nova categoria |
| `listar_categorias` | Lista categorias disponíveis |
| `criar_agendamento` | Cria evento na agenda |
| `listar_agendamentos` | Consulta compromissos futuros |
| `consultar_resumo` | Mostra saldo e balanço mensal |
| `criar_tarefa` | Adiciona tarefa/lembrete |

---

## Exemplos de mensagens suportadas

**Lançamentos:**
- "Gastei R$ 45 no almoço hoje"
- "Recebi meu salário de R$ 3500 hoje"
- "Paguei R$ 120 de academia, débito automático"
- "Uber custou 23 reais"

**Categorias:**
- "Cria uma categoria chamada Delivery com emoji 🍕"
- "Quais categorias tenho cadastradas?"
- "Cria categoria Freelance para receitas com meta de 2000"

**Agendamentos:**
- "Marca reunião com cliente João amanhã às 14h"
- "Prazo de entrega do projeto sexta-feira às 18h"
- "O que tenho marcado essa semana?"

**Financeiro:**
- "Qual meu saldo do mês?"
- "Quanto gastei em abril?"
- "Mostra meus últimos 5 lançamentos"

**Tarefas:**
- "Lembra de pagar o IPTU até dia 20"
- "Cria tarefa urgente: ligar para o banco"
