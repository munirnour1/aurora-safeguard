import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { buildGraph } from './graph/factory.ts';
import { getUser } from './config.ts';
import { readFileSync } from 'fs';

function parseArgs(): { username?: string; unsafe: boolean; message?: string; promptPath?: string } {
  const args = process.argv.slice(2);
  const userIndex = args.indexOf('--user');
  const messageIndex = args.indexOf('--message');
  const unsafe = args.includes('--unsafe');
  const promptPathIndex = args.indexOf('--prompt-path');

  let promptPath: string | undefined;
  if (promptPathIndex !== -1 && args[promptPathIndex + 1]) {
    promptPath = args[promptPathIndex + 1];
  }

  let username: string | undefined;
  if (userIndex !== -1 && args[userIndex + 1]) {
    username = args[userIndex + 1];
  }

  let message: string | undefined;
  if (messageIndex !== -1 && args[messageIndex + 1]) {
    message = args[messageIndex + 1];
  }

  return { username, unsafe, message, promptPath };
}

/**
 * Mostra o banner de segurança
 */
function displayBanner(username: string, role: string, guardrailsEnabled: boolean) {
  console.log('═'.repeat(70));
  console.log('  🔒 Aurora Safeguard - Demo de Guardrails & Prompt Injection');
  console.log('═'.repeat(70));
  console.log();
  console.log(`👤 Usuário: ${username} (${role})`);
  console.log(`🛡️  Guardrails: ${guardrailsEnabled ? '✅ ATIVADOS (Seguro)' : '❌ DESATIVADOS (Inseguro - Vulnerável!)'}`);
  console.log();
  console.log('─'.repeat(70));
  console.log();
}

/**
 * Ponto de entrada da CLI
 */
async function main(): Promise<void> {
  try {
    const { username, unsafe, message, promptPath } = parseArgs();

    if (!username || (!message && !promptPath)) {
      console.error('❌ Erro: flags --user e (--message ou --prompt-path) são obrigatórias');
      console.error('Uso: npm run chat -- --user <username> --message "sua mensagem" [--unsafe]');
      console.error('Usuários disponíveis: alice (member), professora (admin)');
      process.exit(1);
    }

    const prompt = message ?? readFileSync(promptPath!, 'utf-8');
    const user = getUser(username);
    if (!user) {
      console.error(`❌ Erro: usuário "${username}" não encontrado`);
      console.error('Usuários disponíveis: alice (member), professora (admin)');
      process.exit(1);
    }

    const guardrailsEnabled = !unsafe;

    const graph = await buildGraph();
    displayBanner(user.displayName, user.role, guardrailsEnabled);
    console.log(`📋 Suas permissões: ${user.permissions.length > 0 ? user.permissions.join(', ') : 'Nenhuma'}`);
    console.log();
    console.log(`Você: ${prompt}`);
    console.log();

    const result = await graph.invoke({
      user,
      guardrailsEnabled,
      messages: [new HumanMessage(prompt)],
    });

    const messages = result.messages as BaseMessage[];
    const lastMessage = messages[messages.length - 1];
    console.log(`🤖 Aurora: ${lastMessage.content}`);
    console.log();

  } catch (error) {
    console.error('Erro fatal:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();