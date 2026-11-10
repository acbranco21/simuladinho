# App — Simulador de Bolsa

App web instalável (PWA) em React + TypeScript + Vite. Funciona sem internet e guarda o histórico no próprio tablet (IndexedDB via Dexie).

## O que já funciona (versão 0.1)

- **Início**: missão do dia, caça aos erros, XP/nível, sequência de dias, acerto por trilha.
- **Questão**: múltipla escolha, figuras desenhadas por código (sequência de formas, relógio), texto de apoio, "ouvir enunciado" (voz do próprio aparelho), rascunho para o dedo com lápis/borracha/limpar, "Achei um erro".
- **Correção comentada**: resposta dela × certa, explicação, erro provável, dica, XP. Propõe encerrar com "missão cumprida" quando detecta 2 sinais de cansaço.
- **Fim da sessão**: nota 0–10 com peso por dificuldade, acertos por trilha, XP, sequência, recordes.
- **Motor** (`src/motor/`): montagem intercalada da sessão com mistura de dificuldade, pontuação, sinais de cansaço, tamanho adaptativo do treino, progressão de nível, gamificação. Coberto por testes.

Ainda não: Simulado de prova, Estudar (pílulas), Minha evolução, painel do administrador, questões geradas por IA. O banco atual tem **11 questões de exemplo escritas à mão** em `src/dados/questoes-exemplo.json`.

## Rodar no Mac

Precisa do Node.js (versão LTS, em https://nodejs.org). Depois, no Terminal:

```bash
cd ~/Documents/simulador-bolsa/app
npm install        # só na primeira vez
npm run dev        # abre em http://localhost:5173
npm test           # roda os testes do motor
npm run build      # gera a versão final em dist/
```

Para abrir no tablet na mesma rede Wi-Fi: `npm run dev -- --host` e acesse o endereço "Network" que aparecer. Nesse modo o app abre, mas **instalar e funcionar offline exige HTTPS**: isso vem quando o app for publicado num endereço seguro (próximo passo).

## Onde mexer

| Quero… | Arquivo |
| --- | --- |
| Trocar o nome dela | `src/config.ts` → `NOME_ALUNA` |
| Mudar nível por trilha ou mistura de dificuldade (até existir o painel) | `src/config.ts` |
| Ajustar regras de cansaço, tamanho, progressão, XP | `src/motor/sinais.ts`, `tamanho.ts`, `progressao.ts`, `gamificacao.ts` |
| Adicionar questões | `src/dados/questoes-exemplo.json` (formato em `../conteudo/questoes/schema-questao.json`) |
| Cores e tamanhos | `src/index.css` |

## Estrutura

```
src/
├── aluna/      telas da aluna (Inicio, QuestaoTela, Correcao, Fim, Rascunho, Mascote, Progresso)
├── motor/      regras puras + testes (motor.test.ts)
├── figuras/    desenho SVG a partir de parâmetros
├── dados/      banco local (db.ts) e questões de exemplo
├── config.ts   ajustes provisórios
└── App.tsx     fluxo da sessão
```
