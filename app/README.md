# App — Simuladinho

App web instalável (PWA) em React + TypeScript + Vite. Funciona sem internet e guarda o histórico no próprio tablet (IndexedDB via Dexie).

Publicado em **https://acbranco21.github.io/simuladinho/**.

## O que já funciona (versão 0.6.1)

- **Início**: missão do dia, caça aos erros, XP/nível, sequência de dias, acerto por trilha.
- **Questão**: múltipla escolha, figuras desenhadas por código (sequência de formas, relógio), texto de apoio, "ouvir enunciado" (voz do próprio aparelho), rascunho para o dedo com lápis/borracha/limpar, "Achei um erro".
- **Correção comentada**: resposta dela × certa, explicação, erro provável, dica, XP. Propõe encerrar com "missão cumprida" quando detecta 2 sinais de cansaço.
- **Fim da sessão**: nota 0–10 com peso por dificuldade, acertos por trilha, XP, sequência, recordes.
- **Séries do 3º ao 9º ano e coleções**: cada questão tem série e coleção. São três coleções próprias, escritas para o Simuladinho no estilo de cada tipo de prova: *Base BNCC* (conteúdo da série, direto), *Prova de Bolsa* (enunciados longos, várias etapas) e *Desafio Olímpico* (raciocínio e padrões). A coleção é escolhida na tela de Treino livre ou no painel; "Misturar todas" é o padrão. Se a coleção escolhida tiver poucas questões numa série, a sessão completa com as outras. Não usamos material nem marcas de sistemas de ensino (Positivo, Pitágoras, Poliedro etc.) nem questões de olimpíadas, que têm direitos reservados.
- **Treino do dia**: fica na série atual dela (definida no painel) e sobe até 2 séries conforme o nível de cada trilha (Base +0, Avanço +1, Desafio +2).
- **Treino livre**: ela escolhe qualquer série do 3º ao 9º ano, as matérias e a coleção. Não conta para subir de nível, para recordes nem para as médias do painel.
- **Simulado oficial**: cobra a série seguinte à dela (3º ano → prova do 4º), com alta dificuldade (75% difíceis, 25% médias, nenhuma fácil); se faltar questão na série, completa com a série dela. Metade Português, metade Matemática, cada bloco em ordem crescente de dificuldade; tempo da prova real (4,5 min por questão); sem correção durante a prova; navegação livre, questões em branco e entrega com confirmação; entrega automática quando o tempo acaba; resultado com correção comentada. Formato (10 ou 20 questões) definido no painel. A tela inicial mostra a série cobrada.
- **Estudar**: 19 pílulas, uma por habilidade do banco (explicação, regras, exemplo resolvido passo a passo, dica, ouvir em voz alta). Prática de até 3 questões; acertando 2 de 3, o assunto fica marcado como aprendido. Assuntos recomendados com base nos erros. Ao fim de treinos e simulados aparecem botões "Estudar: …" para os assuntos errados.
- **Minha evolução**: gráfico das notas por trilha nos últimos 12 treinos e simulados, com marca de mudança de nível; mapa de conquistas por habilidade (acende com pílula aprendida ou 80% de acerto em 5+ questões); 9 medalhas de esforço e domínio.
- **Projeto de Vida** (fora da nota e do simulado): 4 módulos — Emoções e convivência, Meus sonhos e metas, Dinheiro e escolhas, Ideias que resolvem — com 3 lições cada (3º, 4º e 5º ano); Emoções tem uma 4ª, "Nervoso antes da prova". Cada lição tem história curta, a grande ideia, 3 perguntas com retorno comentado (opções embaralhadas, "ver a história de novo") e um desafio fora da tela com um adulto. Liberação automática pelo avanço (uma lição nova por dia, só até a série que ela já alcançou em Matemática); depois de 2 erros aparece uma pista da história ou manual pelo responsável no painel (automático / liberado / bloqueado). Só guarda que a lição foi feita, nunca as escolhas dela. Detalhes em `docs/projeto-de-vida.md`.
- **Dois visuais, à escolha:** *Caderno* (padrão: folha quadriculada, coruja e ícones desenhados a lápis de cor, molduras feitas à mão, títulos em letra de forma manuscrita) ou *Clássico* (o visual original). A aluna troca pelo botão na tela inicial; o responsável também pode trocar no painel. No caderno, a coruja se desenha sozinha ao acertar, ao concluir uma lição e no fim do treino ou simulado (desligado se o aparelho pede menos movimento). Arte em `../arte/`.
- **Painel do administrador** (cadeado na tela inicial, protegido por PIN de 4 números):
  - Indicadores: sessões em 7 dias, nota média, tempo de tela hoje, sessões com cansaço/abandono, questões respondidas.
  - Desempenho por trilha: nível, média das 5 últimas notas, tendência, habilidade mais fraca e sugestão.
  - Controles: nome dela, série atual (3º ao 9º), coleção de questões, visual do app, trilhas ativas, nível por trilha, mistura de dificuldade, progressão (automática/manual/travada), limite diário de tela, tamanho do treino adaptativo ou fixo, unidade atual do Positivo.
  - Fila de revisão: questões contestadas por ela, com acerto atípico e uma amostra semanal; aprovar, desativar ou reativar.
  - Cópia de segurança: baixar e restaurar o histórico (arquivo JSON).
- **Motor** (`src/motor/`): montagem intercalada da sessão com mistura de dificuldade, pontuação, sinais de cansaço, tamanho adaptativo do treino, progressão de nível, gamificação. Coberto por testes.

Ainda não: produção de texto (redação) e edição de questões pelo painel. O banco tem 424 questões: 11 exemplos escritos à mão, o lote 1 (151, 3º ano) e o lote 2 (262, do 4º ao 9º ano nas três coleções; gerado por `../ia/scripts/gerar_lote2.py`). Do 6º ao 9º o volume ainda é pequeno (cerca de 43 por série).

## Rodar no Mac

Precisa do Node.js (versão LTS, em https://nodejs.org). Depois, no Terminal:

```bash
cd ~/Documents/simuladinho/app
npm install        # só na primeira vez
npm run dev        # abre em http://localhost:5173
npm test           # roda os testes do motor
npm run build      # gera a versão final em dist/
```

Para abrir no tablet na mesma rede Wi-Fi: `npm run dev -- --host` e acesse o endereço "Network" que aparecer. Nesse modo o app abre, mas instalar e funcionar offline exige HTTPS: use o endereço publicado.

## Onde mexer

| Quero… | Arquivo |
| --- | --- |
| Nome, nível, mistura, limite de tela | Pelo painel do administrador no app (valores iniciais em `src/config.ts`) |
| Ajustar regras de cansaço, tamanho, progressão, XP | `src/motor/sinais.ts`, `tamanho.ts`, `progressao.ts`, `gamificacao.ts` |
| Adicionar questões | novo lote em `src/dados/`, registrado em `src/dados/banco.ts` (cada questão com `serie` e `colecao`; formato em `../conteudo/questoes/schema-questao.json`) |
| Cores e tamanhos | `src/index.css` |

## Estrutura

```
src/
├── aluna/      telas da aluna (Inicio, QuestaoTela, Correcao, Fim, Rascunho, Mascote, Progresso)
├── admin/      área dos pais (Pin, Painel)
├── conteudo/   pílulas de estudo (pilulas.ts)
├── motor/      regras puras + testes (motor.test.ts)
├── figuras/    desenho SVG a partir de parâmetros
├── dados/      banco local (db.ts) e questões de exemplo
├── config.ts   ajustes provisórios
└── App.tsx     fluxo da sessão
```
