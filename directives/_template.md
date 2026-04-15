# Diretiva: [NOME DA TAREFA]

**Versão:** 1.0  
**Data de criação:** AAAA-MM-DD  
**Atualizado em:** AAAA-MM-DD  
**Script associado:** `execution/nome_do_script.py`

---

## Objetivo

> Descreva em 1–3 frases o que esta diretiva realiza e por que ela existe.

---

## Entradas (Inputs)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nome_do_campo` | string | ✅ | Descrição do campo |
| `outro_campo` | lista | ❌ | Descrição do campo opcional |

**Fonte dos dados:** (ex: arquivo `.tmp/dados.json`, variável de ambiente, input do usuário)

---

## Ferramentas e Scripts

- **Script principal:** `execution/nome_do_script.py`
  - O que faz: ...
  - Como executar: `python execution/nome_do_script.py`
- **Scripts auxiliares:** (se houver)

**Variáveis de ambiente necessárias:**
```
NOME_DA_VARIAVEL=descrição do que é
```

---

## Saídas (Outputs)

| Saída | Localização | Formato |
|-------|-------------|---------|
| Resultado principal | `Planilha Google / .tmp/arquivo.json` | JSON / CSV |
| Log de execução | `.tmp/log_AAAA-MM-DD.txt` | texto |

---

## Fluxo de Execução

```
1. [Passo 1] → descrição
2. [Passo 2] → descrição
3. [Passo 3] → descrição
```

---

## Edge Cases (Casos Extremos)

- **Se X acontecer:** faça Y
- **Se a API retornar erro 429 (rate limit):** aguarde N segundos e tente novamente
- **Se o arquivo de entrada estiver vazio:** encerre sem erro, registre no log

---

## Checklist de Execução

- [ ] Variáveis de ambiente carregadas (`python execution/validate_env.py`)
- [ ] Pasta `.tmp/` existe e está acessível
- [ ] Script testado com dados de amostra antes do run completo
- [ ] Saída verificada manualmente

---

## Aprendizados (Learnings)

<!-- Adicione aqui os aprendizados após cada sessão -->
<!-- Formato: AAAA-MM-DD — Descrição do que foi aprendido -->
