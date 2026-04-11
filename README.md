# Controla+

O Controla+ é uma aplicação financeira moderna para gestão de lançamentos e tarefas agendadas, integrada com Supabase para persistência de dados em tempo real.

## Tecnologias

- **Frontend**: React 19 + Vite
- **Estilização**: Tailwind CSS 4
- **Backend**: Supabase (Auth, Database, RLS)

## Como Rodar Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` baseando-se no `.env.example`.
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Deploy no Vercel

Esta aplicação está pronta para ser publicada no Vercel.

### Passos para o Deploy:

1. **Importar Repositório**: Conecte sua conta do GitHub ao Vercel e importe este repositório.
2. **Configurar Variáveis de Ambiente**:
   No painel do Vercel, adicione as seguintes chaves em *Settings > Environment Variables*:
   - `VITE_SUPABASE_URL`: Sua URL do projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Sua chave anônima (anon key) do Supabase.
3. **Build e Output**:
   O Vercel deve detectar automaticamente as configurações do Vite:
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. **Deploy**: Clique em Deploy.

### Notas sobre o `vercel.json`:
O arquivo `vercel.json` incluído garante que os roteamentos de SPA funcionem corretamente e as URLs fiquem amigáveis.