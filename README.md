# aurora-safeguard

Transposição do exercício `05-safeguard-prompt-injection-z` do curso
**Engenharia de Software com IA Aplicada** (prof. Erick Wendel) para o
domínio do projeto **Aurora**.

## O que este repositório demonstra

- Prompt injection e por que system prompt **não** é mecanismo de segurança
- Guardrails baseados em LLM (safeguard model) como camada de defesa
- MCP filesystem como fronteira de ferramentas expostas ao LLM
- RBAC aplicado ao contexto educacional do Aurora

## Contexto do domínio

Aurora é uma aplicação educacional acessível (Comunicação Aumentativa e
Alternativa + tecnologia assistiva). O recurso em foco é **"Revisar meu
texto"**, que corrige gramática sem alterar o sentido do texto produzido
pelo estudante.

Neste repositório, a Aurora é reduzida ao mínimo necessário para
demonstrar os conceitos de segurança acima — não é a aplicação completa.

## Status

Em construção — **Fase 0 (setup)**.

## Referências
UNIPDS