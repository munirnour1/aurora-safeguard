import { readFileSync } from 'fs';
import usersData from '../data/users.json' with { type: 'json' };

export type User = {
  username: string;
  role: 'admin' | 'member';
  permissions: string[];
  displayName: string;
};

export const users: Record<string, User> = usersData as Record<string, User>;

export const prompts = {
  blocked: readFileSync('./prompts/blocked.txt', 'utf-8'),
  system: readFileSync('./prompts/system.txt', 'utf-8'),
  guardrails: readFileSync('./prompts/guardrails.txt', 'utf-8'),
};

export type ModelConfig = {
  apiKey: string;
  httpReferer: string;
  xTitle: string;

  provider: {
    sort: { by: string; partition: string };
  };

  models: string[];
  temperature: number;
  maxTokens: number;
  guardrailsModel: string;
};

export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: process.env.OPENROUTER_HTTP_REFERER ?? '',
  xTitle: process.env.OPENROUTER_X_TITLE ?? 'Aurora - Guardrails',
  models: ['qwen/qwen-2.5-7b-instruct'],
  guardrailsModel: 'openai/gpt-oss-safeguard-20b',
  provider: {
    sort: { by: 'price', partition: 'none' },
  },
  temperature: Number(process.env.TEMPERATURE ?? 0.7),
  maxTokens: Number(process.env.MAX_TOKENS ?? 1000),
};

export function getUser(username: string): User | undefined {
  return users[username];
}