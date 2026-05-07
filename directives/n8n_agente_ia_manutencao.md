# Diretriz: Manutenção do Workflow n8n (Agente IA)

**Versão:** 1.0  
**Data:** 2026-04-16  
**Tipo:** Operacional / n8n

---

## Objetivo

Documentar a estrutura e os padrões de manutenção do workflow **CONTROLA+ WhatsApp Agente IA v2**. Esta diretriz garante que futuras alterações no workflow sigam o padrão de centralização de variáveis e segurança.

---

## Arquitetura do Workflow

O workflow segue um fluxo de 5 camadas principais:
1. **Entrada (Webhook):** Recebe dados da Evolution API.
2. **Configuração (Set):** Nó "Configurações Supabase" que mapeia variáveis globais do n8n para o fluxo atual.
3. **Autenticação:** Verifica se o número de telefone está cadastrado na tabela `configuracao_dono`.
4. **Agente IA (LangChain):** Orquestra o processamento de linguagem natural e o uso de ferramentas.
5. **Saída:** Envia a resposta de volta via Evolution API.

---

## Gerenciamento de Variáveis

### Variáveis Globais (n8n Settings)
Todas as credenciais **DEVEM** ser configuradas nas variáveis globais do n8n:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_INSTANCE`

### Nó de Configuração (Check-in)
Ao modificar um nó de ferramenta, nunca use URLs fixas. Use as referências:
- `{{ $vars.SUPABASE_URL }}`
- `{{ $vars.SUPABASE_SERVICE_KEY }}`

---

## Padrão para Ferramentas (ToolCode)

Cada ferramenta (Tool) deve retornar um objeto com a propriedade `response` (string).
Exemplo de estrutura base:

```javascript
try {
  const resp = await fetch(`{{ $vars.SUPABASE_URL }}/rest/v1/tabela`, {
    method: 'POST',
    headers: {
      'apikey': '{{ $vars.SUPABASE_SERVICE_KEY }}',
      'Authorization': `Bearer {{ $vars.SUPABASE_SERVICE_KEY }}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });
  // ... tratamento
  return { response: "Sucesso!" };
} catch (err) {
  return { response: "Erro: " + err.message };
}
```

---

## Aprendizados (Learnings)

<!-- 2026-04-16 — Workflow refatorado para remover valores hardcoded. Adicionado nó "Configurações Supabase" (Set) como ponte inicial. -->
<!-- 2026-04-16 — Ferramentas converteram jsCode para formato de expressão (=) para permitir interpolação direta das variáveis globais do n8n dentro das template strings. -->
