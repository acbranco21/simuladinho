# Projeto de Vida — decisões pedagógicas (v0.4, ajustado na v0.6.1)

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

Dentro de um módulo automático: lições em ordem, uma nova por dia, e só até a série que a aluna já alcançou (série atual + nível de Matemática: Base +0, Avanço +1, Desafio +2). Para quem está no 3º ano, a lição de 4º ano abre com Matemática em Avanço e a de 5º ano em Desafio; antes disso, aparece "Abre quando você avançar". "Liberado agora" ignora essa trava. No painel, cada módulo pode ficar **Automático**, **Liberado agora** (todas as lições abertas) ou **Bloqueado** (o que já foi feito continua registrado). A trilha inteira pode ser desligada.

O controle pelo **professor** depende da versão para escolas (contas e turmas — ver avaliação de arquitetura). O modelo de configuração (`ConfigProjetoVida`) já é o mesmo que a turma usará.

## Ajustes após a avaliação pedagógica (v0.6.1)

- **Liberação por série** (acima). Motivo: a lição "Comparar antes de comprar" pede divisão com resultado decimal (EF05MA08, 5º ano) e abria em três dias para uma aluna de 3º ano.
- **Nomear emoções com opções próximas** (modelo RULER): em "Dando nome ao que sente", as opções agora são frustrado × triste × com vergonha × com raiva da prima, e a história traz as pistas que separam cada uma (esforço e derrota na última rodada; ninguém riu; a prima jogou direitinho). O mesmo na pergunta da Lia (gratidão × orgulho × surpresa × alívio).
- **Nova lição "Nervoso antes da prova"** (3º ano, 2ª do módulo de emoções): sinais no corpo, respiração do 4, começar por uma questão que sabe e "a prova mostra o que você já aprendeu, não quem você é". O módulo passa a ter 4 lições (13 no total).
- **Pista depois do 2º erro**: em perguntas com resposta certa, aparece o trecho da história que tem a pista, para ela não acertar no chute.
- **Retornos que apontam onde olhar**, no lugar de "Releia a história".
- **Vocabulário**: "atitude empreendedora" → "O que a Nina fez de diferente?"; "arrecadaram" → "ganharam com as vendas"; "sobrecarregado" → "com trabalho demais".
- **Sem elogio genérico** no começo dos retornos das perguntas de escolha.
- **Opções erradas menos óbvias** em "Enxergar o problema".

## Limites

- Os valores das regras de liberação são propostas, não normas; ajuste em `app/src/motor/projetoVida.ts` (`REGRAS_PV`).
- O conteúdo foi escrito e revisado pela IA, sem revisão de pedagogo ou psicólogo infantil. Antes de levar o módulo emocional a escolas, vale essa revisão.
