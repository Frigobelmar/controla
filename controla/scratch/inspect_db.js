import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbxgowunqkawvzhaxbev.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieGdvd3VucWthd3Z6aGF4YmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzgzNzksImV4cCI6MjA1OTg1NDM3OX0.VmAW3Up2JBwqA3xOX4F-dQ_oX0eKE3O'; // Using the full key from logic if possible, or just the part I saw

// Wait, the key in .env was truncated or obfuscated in the output or I just saw the mask?
// "sb_publishable_..." looks like a Supabase Publishable Key.
// Actually, I'll just use a simpler script that doesn't need external libs if possible, but I need @supabase/supabase-js.

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTable(tableName) {
  console.log(`Inspecting ${tableName}...`);
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    console.error(`Error fetching ${tableName}:`, error.message);
  } else {
    console.log(`${tableName} columns:`, data.length > 0 ? Object.keys(data[0]) : 'Empty table');
  }
}

async function run() {
  await inspectTable('transacoes_financeiras');
  await inspectTable('agendamentos');
  await inspectTable('tarefas');
  await inspectTable('categorias');
}

run();
