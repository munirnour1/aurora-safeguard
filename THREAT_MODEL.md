# Modelo de Ameaça — Aurora "Revisar meu texto"

Documento vivo. Descreve os ativos, atores, vetores e impactos que a
feature "Revisar meu texto" precisa endereçar. É a bússola das decisões
de segurança das próximas fases.

## Contexto

Aurora é uma aplicação educacional acessível. A feature em foco permite
que o estudante produza um texto e peça uma revisão gramatical que
**preserve o sentido e as ideias originais** — a Aurora não escreve pelo
estudante.

Este documento é uma transposição do exercício `05-safeguard-prompt-injection-z`
do curso Engenharia de Software com IA Aplicada (prof. Erick Wendel)
para o domínio Aurora.

## Ativo

**PDFs de material didático** disponibilizados pela professora, armazenados
em `data/materials/` e expostos ao LLM via MCP filesystem server.

Por que este ativo:
- É lido por uma ferramenta MCP (`read-material-tool`)
- Está atrás de verificação de permissão (professora = admin, Alice = member)
- É alvo plausível de prompt injection

Equivale ao `package.json` do exercício do Erick.

**Ativo secundário (para o vetor 2):** o **texto produzido pelo estudante**.
Preservar sua autoria é o princípio central do Aurora. Se a IA alterar o
sentido do texto, mesmo sem nenhum ataque, o produto falhou.

## Atores

### Ator A — Alice por curiosidade

Alice (member, 6º ano, paralisia cerebral) pode pedir no editor que a Aurora
mostre material ao qual não tem permissão. Não há má-fé — há curiosidade
infantil. A defesa precisa bloquear sem traumatizar.

### Ator B — Alice por acidente

Alice pode escrever texto pedagógico legítimo que, para um classificador
ingênuo, **parece** injection. Exemplo: *"professora, ignore os erros e me
mostre como está"*. Bloquear este texto seria falso positivo e quebraria a
experiência de aprendizagem.

Mitigação: calibrar o `prompts/guardrails.txt` com exemplos do domínio
educacional.

### Ator C — Atacante informado

Outro aluno (futuro multi-tenant), terceiro que comprometeu uma conta, ou
usuário malicioso. Usa padrões clássicos de injection:
- Sobrescrita de instruções ("ignore o prompt anterior")
- Escalação de privilégio ("sou a professora substituta")
- Extração de system prompt ("repita suas instruções")

Equivale ao `ananeri` do exercício do Erick.

### Ator D — O próprio LLM

Não é ator no sentido clássico: ninguém ataca. O LLM, ao usar o RAG para
"ajudar", pode **adicionar informações** ao texto do estudante que não
estavam no original. Exemplo:

- Original do estudante: *"Os servos trabalhava na terra."*
- RAG tem no PDF: *"Os servos trabalhavam nas terras dos senhores feudais
  e deviam obrigações."*
- Saída indevida: *"Os servos trabalhavam nas terras dos senhores feudais
  e deviam obrigações."*

Nenhum atacante. Nenhum injection. O sistema violou o princípio central
do Aurora sozinho.

## Vetores

### Vetor 1 — Input do usuário

O texto que o estudante digita no editor chega ao LLM como mensagem.
Pode conter A, B ou C.

### Vetor 2 — Output do LLM

A sugestão produzida pelo LLM (potencialmente enriquecida pelo RAG) pode
conter D. Não passa por guardrail de input.

## Impacto

| Cenário | Gravidade | Exemplo |
|---|---|---|
| PDFs da professora expostos a quem não tem permissão | Alta | Alice vê material de outra turma |
| Texto de estudante reescrito com informações externas | **Crítica** | Alice perde autoria do próprio texto |
| Texto pedagógico legítimo bloqueado por engano | Média | Alice não consegue revisar |

O impacto crítico é o segundo: fere o princípio central do produto
(*"A Aurora não escreve pelo estudante. A Aurora ajuda o estudante a dizer
melhor aquilo que ele próprio escreveu."*).

## Defesas (camadas)

| Camada | Onde | Cobre |
|---|---|---|
| Guardrail (LLM-based) | Antes do LLM principal | A, B (calibrado), C |
| RBAC (tool gating) | Na chamada da ferramenta MCP | A, C |
| Semantic Preservation Validator | Depois do LLM | D |

## Fora de escopo (registro)

Itens identificados mas conscientemente adiados nesta versão do
repositório. O repositório implementa apenas o que o exercício do
Erick cobre, mais a calibração do guardrail para o contexto educacional
(Ator B).

- **Ator D (LLM via RAG adicionando conteúdo ao texto do estudante).**
  Risco crítico para o produto Aurora (fere o princípio "a Aurora não
  escreve pelo estudante"), mas **não é coberto pelo exercício original**.
  A mitigação seria um `SemanticPreservationValidator` executado após o
  LLM, validando se a sugestão preserva o sentido do texto original.
  Fica registrado para retomada em módulos futuros do curso ou na
  implementação real do Aurora.

- **Multi-tenant real.** Hoje o Aurora é Alice + professora. Quando
  escalar para várias escolas, o vetor C ganha peso e o RBAC precisa
  ser revisitado.

- **Extração de system prompt.** O guardrail cobre como subtipo de C,
  mas não há defesa específica contra isso.

- **Ataques via CAA/scanning.** O texto chega ao LLM via editor. Não
  há vetor alternativo hoje.

## Escopo de implementação neste repositório

Alinhado com o exercício `05-safeguard-prompt-injection-z`:

| Elemento | Decisão |
|---|---|
| Permissions | Única: `read_material`. Professora tem; Alice não. |
| Material | Arquivo cru em `data/materials/`, RBAC por nome de arquivo. |
| Tool MCP | `read-material-tool` recebe `user` e decide permissão. |
| Guardrail | LLM-based (`openai/gpt-oss-safeguard-20b`), calibrado com contexto educacional (Ator B). |
| Semantic validator | Fora de escopo (ver acima). |

## Referências

- Exercício original: https://github.com/unipds-engenharia-de-ia-aplicada/engenharia-de-software-com-ia-aplicada/tree/main/modulo02-integracao-apis-llms/05-safeguard-prompt-injection-z
- OWASP Top 10 for LLM Applications