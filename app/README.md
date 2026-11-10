# App — Simuladinho

App web instalável (PWA) em React + TypeScript + Vite. Funciona sem internet e guarda o histórico no próprio tablet (IndexedDB via Dexie).

Publicado em **https://acbranco21.github.io/simuladinho/**.

## O que já funciona (versão 0.3)

- **Início**: missão do dia, caça aos erros, XP/nível, sequência de dias, acerto por trilha.
- **Questão**: múltipla escolha, figuras desenhadas por código (sequência de formas, relógio), texto de apoio, "ouvir enunciado" (voz do próprio aparelho), rascunho para o dedo com lápis/borracha/limpar, "Achei um erro".
- **Correção comentada**: resposta dela × certa, explicação, erro provável, dica, XP. Propõe encerrar com "missão cumprida" quando detecta 2 sinais de cansaço.
- **Fim da sessão**: nota 0–10 com peso por dificuldade, acertos por trilha, XP, sequência, recordes.
- **Simulado de prova**: metade Português, metade Matemática, cada bloco em ordem crescente de dificuldade; tempo da prova real (4,5 min por questão); sem correção durante a prova; navegação livre, questões em branco e entrega com confirmação; entrega automática quando o tempo acaba; resultado com correção comentada. Formato (10 ou 20 questões) definido no painel.
- **Estudar**: 19 pílulas, uma por habilidade do banco (explicação, regras, exemplo resolvido passo a passo, dica, ouvir em voz alta). Prática de até 3 questões; acertando 2 de 3, o assunto fica marcado como aprendido. Assuntos recomendados com base nos erros. Ao fim de treinos e simulados aparecem botões "Estudar: …" para os assuntos errados.
- **Minha evolução**: gráfico das notas por trilha nos últimos 12 treinos e simulados, com marca de mudança de nível; mapa de conquistas por habilidade (acende com pílula aprendida ou 80% de acerto em 5+ questões); 9 medalhas de esforço e domínio.
- **Painel do administrador** (cadeado na tela inicial, protegido por PIN de 4 números):
  - Indicadores: sessões em 7 dias, nota média, tempo de tela hoje, sessões com cansaço/abandono, questões respondidas.
  - Desempenho por trilha: nível, média das 5 últimas notas, tendência, habilidade mais fraca e sugestão.
  - Controles: nome dela, trilhas ativas, nível por trilha, mistura de dificuldade, progressão (automática/manual/travada), limite diário de tela, tamanho do treino adaptativo ou fixo, unidade atual do Positivo.
  - Fila de revisão: questões contestadas por ela, com acerto atípico e uma amostra semanal; aprovar, desativar ou reativar.
  - Cópia de segurança: baixar e restaurar o histórico (arquivo JSON).
- **Motor** (`src/motor/`): montagem intercalada da sessão com mistura de dificuldade, pontuação, sinais de cansaço, tamanho adaptativo do treino, progressão de nível, gamificação. Coberto por testes.

Ainda não: produção de texto (redação) e edição de questões pelo painel. O banco tem 162 questões: 11 exemplos escritos à mão e o lote 1 (151, ver `../ia/LOTES.md`).

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
| Adicionar questões | novo lote em `src/dados/` (formato em `../conteudo/questoes/schema-questao.json`) |
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
