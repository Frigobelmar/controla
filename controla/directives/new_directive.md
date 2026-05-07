# Diretiva: Como Criar Novas Diretivas

**Versão:** 1.0  
**Data de criação:** 2026-04-14  
**Atualizado em:** 2026-04-14

---

## Objetivo

Orientar o agente e o usuário sobre o processo correto de criar uma nova diretiva DOE, garantindo que ela seja útil, completa e sustentável ao longo do tempo.

---

## Quando criar uma nova diretiva?

Crie uma diretiva quando houver uma **tarefa recorrente** que:
- Envolve múltiplos passos
- Usa ferramentas externas ou APIs
- Tem decisões de borde que precisam ser documentadas
- Já foi executada mais de uma vez manualmente

**Não crie** uma diretiva para tarefas únicas e simples. Use apenas um comentário no script.

---

## Processo de criação

### 1. Pergunte ao usuário antes de criar

```
Identifico que esta tarefa não tem diretriz. Posso criar directives/[nome].md?
```

Nunca crie uma diretriz sem aprovação.

### 2. Copie o template

```powershell
Copy-Item directives\_template.md directives\nome_da_tarefa.md
```

### 3. Preencha todos os campos

Campos obrigatórios:
- [ ] Objetivo (1–3 frases)
- [ ] Entradas com tipos e se são obrigatórias
- [ ] Scripts associados (existentes ou a criar)
- [ ] Saídas esperadas
- [ ] Pelo menos 2 edge cases relevantes
- [ ] Checklist de execução

### 4. Referencie o script

Se um script de execução for criado junto:
- Mencione o caminho completo em "Ferramentas e Scripts"
- Documente como executar
- Liste as variáveis de ambiente necessárias

### 5. Teste antes de declarar pronto

Não marque a diretriz como "pronta" sem ao menos uma execução de teste bem-sucedida.

---

## Convenções de nomenclatura

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Tarefa de dados | `processar_[fonte].md` | `processar_planilha.md` |
| Integração de API | `integrar_[servico].md` | `integrar_sheets.md` |
| Relatório | `relatorio_[tipo].md` | `relatorio_mensal.md` |
| Manutenção | `manutencao_[o_que].md` | `manutencao_backups.md` |
| Pipeline | `pipeline_[nome].md` | `pipeline_clientes.md` |

Use sempre **snake_case**, sem acentos, em português.

---

## Atualizando diretivas existentes

Você pode **sugerir** atualizações livremente, mas **só modifique** com aprovação do usuário — exceto quando estiver adicionando uma seção `## Aprendizados` no encerramento de sessão.

A seção de aprendizados pode ser adicionada sem aprovação prévia ao encerrar a sessão.

---

## Aprendizados (Learnings)

<!-- 2026-04-14 — Diretiva criada como parte do DOE Framework v1.0 -->
