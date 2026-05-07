# Diretiva: Protocolo de Início de Sessão

**Versão:** 1.0  
**Data de criação:** 2026-04-14  
**Atualizado em:** 2026-04-14  
**Tipo:** Protocolo obrigatório — executar ANTES de qualquer ação

---

## Objetivo

Garantir que o agente Antigravity comece cada sessão com contexto completo sobre o estado atual do projeto, evitando trabalho duplicado, sobreposição de arquivos e execuções sem contexto.

---

## Protocolo (Execute nesta ordem)

### Passo 1 — Localizar a diretriz relevante

```
1. Liste os arquivos em directives/
2. Identifique qual diretriz se aplica à tarefa do usuário
3. Leia a diretriz completa antes de qualquer outra ação
```

**Se não houver diretriz para a tarefa:** pergunte ao usuário se deve criar uma. Não improvise.

---

### Passo 2 — Inventariar scripts disponíveis

```
1. Liste os arquivos em execution/
2. Identifique quais scripts já existem para a tarefa
3. Leia o script antes de executar ou modificar
```

**Regra:** nunca crie um script novo sem verificar se já existe um.

---

### Passo 3 — Verificar estado residual

```
1. Verifique se a pasta .tmp/ existe
2. Liste os arquivos em .tmp/
3. Identifique se há estado da sessão anterior que pode ser reutilizado
```

**Atenção:** arquivos em `.tmp/` são transitórios. Se houver dúvida sobre validade, pergunte ao usuário antes de reutilizar.

---

### Passo 4 — Validar variáveis de ambiente

```
python execution/validate_env.py
```

Se houver variáveis faltando, liste-as e peça ao usuário antes de prosseguir.

---

### Passo 5 — Confirmar escopo com o usuário

Antes de criar ou modificar qualquer arquivo, apresente:

```
✅ Diretriz lida: directives/nome.md
✅ Scripts disponíveis: execution/script.py
✅ Estado .tmp/: [vazio | N arquivos encontrados]
✅ Variáveis de ambiente: [OK | FALTANDO: X, Y]

Confirme: [descrição do que será feito]
```

---

## Quando pular este protocolo

**Nunca pule.** Se o tempo for curto, ao menos faça os passos 1 e 3.

---

## Sinais de alerta durante a sessão

Se você observar qualquer um destes sinais, pare e avise o usuário:

- Erros repetidos no mesmo ponto do código (mais de 2 tentativas)
- Restrições ou contexto esquecido no meio da sessão
- Output que contradiz a diretriz lida no início
- Desvio de escopo (você está fazendo algo além do acordado)

**Ação:** informe ao usuário, sugira iniciar sessão nova e execute novamente este protocolo.

---

## Encerramento de Sessão

Antes de encerrar:

1. Revise as diretivas modificadas nesta sessão
2. Adicione a seção `## Aprendizados` em cada diretriz modificada com:
   - Data
   - O que mudou e por quê
3. Confirme que novos scripts estão testados e referenciados na diretriz

---

## Aprendizados (Learnings)

<!-- 2026-04-14 — Protocolo criado como parte do DOE Framework v1.0 -->
<!-- 2026-04-14 — Scripts PowerShell com caracteres especiais (acentos, emojis) falham por encoding no Windows. Usar apenas ASCII puro nas strings de Write-Host em scripts .ps1. -->
<!-- 2026-04-14 — Python nao esta instalado por padrao via PATH no ambiente Windows do usuario. O alias da Microsoft Store em C:\Users\...\WindowsApps\python.exe nao resolve. Ao referenciar Python em diretivas, verificar disponibilidade com `where.exe py` antes de usar. -->
<!-- 2026-04-14 — O bootstrap foi testado com sucesso em .tmp\test_bootstrap, criando toda a estrutura corretamente. -->
<!-- 2026-04-15 — Implementado sistema avançado de pagamentos: uso de 'status' para fluxo de caixa, lógica de 'splitting' (divisão) para pagamentos parciais mantendo a data original, e integração com Supabase Storage para gestão de anexos múltiplo. Requisito 'links que abrem em nova aba' implementado com target="_blank". -->
<!-- 2026-04-15 — Adicionado campo de data de vencimento (input type="date") no modal de Lançamentos para permitir edição de datas retroativas ou futuras, integrado ao fluxo de save/update do Supabase. -->

