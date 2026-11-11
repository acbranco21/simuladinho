# Projeto de Vida — decisões pedagógicas (v0.4)

Pedido do responsável (11/11/2026): incluir Projeto de Vida, educação financeira, empreendedorismo e educação emocional, liberados conforme o avanço da aluna ou manualmente pelo pai ou professor.

A avaliação completa, com fontes, está no documento vivo de avaliação pedagógica (seção "Projeto de Vida").

## Enquadramento na BNCC

| Módulo | Referência |
| --- | --- |
| Meus sonhos e metas | Competência geral 6 — Trabalho e projeto de vida (nos anos iniciais é transversal; componente próprio só no Ensino Médio) |
| Dinheiro e escolhas | Educação financeira: tema contemporâneo transversal, trabalhado sobretudo em Matemática (sistema monetário) |
| Ideias que resolvem | Não é componente da BNCC; ligado à competência 6. Referência prática: JEPP/Sebrae |
| Emoções e convivência | Competências gerais 8 (autoconhecimento e autocuidado) e 9 (empatia e cooperação) |

## Decisões

- **Fora da nota e do simulado.** As provas de bolsa não cobram esses temas. Dá 15 XP por lição concluída (só na primeira vez) e conta para a sequência de dias e para o limite de tempo de tela.
- **Formato:** história curta → "a grande ideia" → 3 perguntas → desafio fora da tela com um adulto.
  - Perguntas `certa`: uma resposta correta; as outras explicam com gentileza por que não; ela tenta de novo.
  - Perguntas `escolha`: todas as opções são boas; cada uma tem um retorno. A escolha não é guardada.
- **Educação emocional só com personagens.** O app nunca pergunta nem registra como a criança está se sentindo. Sem diagnóstico, sem rótulo, sem pontuação de emoção.
- **Privacidade:** a tabela `licoesPV` guarda só id da lição, módulo, início e fim.

## Liberação

| Módulo | Regra automática |
| --- | --- |
| Emoções e convivência | 1 sessão concluída |
| Meus sonhos e metas | 3 sessões concluídas |
| Dinheiro e escolhas | 20 questões de Matemática com 60% de acerto |
| Ideias que resolvem | 1 lição de Metas + 1 de Dinheiro |

Dentro de um módulo automático: lições em ordem, uma nova por dia. No painel, cada módulo pode ficar **Automático**, **Liberado agora** (todas as lições abertas) ou **Bloqueado** (o que já foi feito continua registrado). A trilha inteira pode ser desligada.

O controle pelo **professor** depende da versão para escolas (contas e turmas — ver avaliação de arquitetura). O modelo de configuração (`ConfigProjetoVida`) já é o mesmo que a turma usará.

## Limites

- Os valores das regras de liberação são propostas, não normas; ajuste em `app/src/motor/projetoVida.ts` (`REGRAS_PV`).
- O conteúdo foi escrito e revisado pela IA, sem revisão de pedagogo ou psicólogo infantil. Antes de levar o módulo emocional a escolas, vale essa revisão.
