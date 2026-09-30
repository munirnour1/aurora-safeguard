import type { GraphState } from '../state.ts';

export function routeAfterGuardrails(state: GraphState): 'chat' | 'blocked' {
  if (!state.guardrailsEnabled) {
    return 'chat';
  }

  const check = state.guardrailCheck;
  if (!check || check.safe) {
    return 'chat';
  }

  return 'blocked';
}