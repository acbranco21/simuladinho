# App — Simuladinho

App web instalável (PWA) em React + TypeScript + Vite. Funciona sem internet e guarda o histórico no próprio tablet (IndexedDB via Dexie).

Publicado em **https://acbranco21.github.io/simuladinho/**.

## O que já funciona (versão 0.2)

- **Início**: missão do dia, caça aos erros, XP/nível, sequência de dias, acerto por trilha.
- **Questão**: múltipla escolha, figuras desenhadas por código (sequência de formas, relógio), texto de apoio, "ouvir enunciado" (voz do próprio aparelho), rascunho para o dedo com lápis/borracha/limpar, "Achei um erro".
- **Correção comentada**: resposta dela × certa, explicação, erro provável, dica, XP. Propõe encerrar com "missão cumprida" quando detecta 2 sinais de cansaço.
- **Fim da sessão**: nota 0–10 com peso por dificuldade, acertos por trilha, XP, sequência, recordes.
- **Painel do administrador** (cadeado na tela inicial, protegido por PIN de 4 números):
  - Indicadores: sessões em 7 dias, nota média, tempo de tela hoje, sessões com cansaço/abandono, questões respondidas.
  - Desempenho por trilha: nível, média das 5 últimas notas, tendência, habilidade mais fraca e sugestão.
  - Controles: nome dela, trilhas ativas, nível por trilha, mistura de dificuldade, progressão (automática/manual/travada), limite diário de tela, tamanho do treino adaptativo ou fixo, unidade atual do Positivo.
  - Fila de revisão: questões contestadas por ela, com acerto atípico e uma amostra semanal; aprovar, desativar ou reativar.
  - Cópia de segurança: baixar e restaurar o histórico (arquivo JSON).
- **Motor** (`src/motor/`): montagem intercalada da sessão com mistura de dificuldade, pontuação, sinais de cansaço, tamanho adaptativo do treino, progressão de nível, gamificação. Coberto por testes.

Ainda não: Simulado de prova, Estudar (pílulas), Minha evolução, correção de redação e edição de questões pelo painel. O banco tem 162 questões: 11 exemplos escritos à mão e o lote 1 (151, ver `../ia/LOTES.md`).

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
├── motor/      regras puras + testes (motor.test.ts)
├── figuras/    desenho SVG a partir de parâmetros
├── dados/      banco local (db.ts) e questões de exemplo
├── config.ts   ajustes provisórios
└── App.tsx     fluxo da sessão
```
