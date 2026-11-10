# Requisitos do MVP

Consolidado das decisões de 10/11/2026. Fonte completa: avaliação pedagógica (link em `docs/README.md`).

## Contexto

- Usuária única: a filha (9 anos, 3º ano), treino contínuo, independente de edital aberto.
- Alvo: qualquer colégio de alto padrão (sem edital específico).
- Material escolar atual: Sistema Positivo.
- Dispositivo: tablet Android, uso em paisagem, **sem caneta** (só toque).
- Questões: geradas, revisadas e dosadas por IA; pai revisa por amostragem (opcional).

## Escopo da aluna

1. **Início**: missão do dia, atalhos (simulado, caça aos erros, estudar), XP/nível, sequência de dias, progresso por trilha.
2. **Questão**: múltipla escolha com 5 alternativas, figuras geradas por código (SVG), áudio do enunciado, folha de rascunho para o dedo, botão "Achei um erro".
3. **Correção comentada**: resposta dela × certa, explicação do porquê, link para a pílula do tópico.
4. **Fim da sessão**: nota 0–10 com peso por dificuldade, acertos por trilha, recorde pessoal, XP, medalha.
5. **Minha evolução**: notas por trilha ao longo do tempo, marcando mudança de nível; mapa de conquistas; medalhas.
6. **Estudar (pílulas)**: explicação curta → exemplo resolvido → 2–3 exercícios → mini-checagem.

## Trilhas do MVP

Português, Matemática, Raciocínio Lógico e Produção de Texto, no nível **Base (3º ano)**. Conhecimentos Gerais pode entrar depois.

## Modos

- **Treino**: tamanho adaptativo (ponto de partida ~10 questões), qualquer formato.
- **Prova**: predefinições — Bolsão padrão (20 questões, 10 PT + 10 MAT, 90 min), Alto padrão completo (20 + redação), Treino rápido (12). Resistência treinada em blocos de 10 até chegar a 20 seguidas.
- **Caça aos erros**: 5 questões erradas anteriormente, XP em dobro.

## Pontuação

- Fácil = 3, média = 4, difícil = 5 pontos (inspirado no Canguru).
- Nota = pontos obtidos ÷ pontos possíveis × 10.
- Histórico guardado por trilha e por habilidade.

## Painel do administrador

- Indicadores: sessões na semana, nota média, tempo de tela, sinais de cansaço.
- Desempenho por trilha com sugestão da IA.
- Controles: nível por trilha, predefinição do Modo Prova, mistura de dificuldade, progressão (automática/manual/travada), limite diário de tela, IA ajusta tamanho do treino, "até onde a turma chegou" no Positivo.
- Fila opcional de revisão de questões (aprovar/editar/desativar).
- Correção de redação com rubrica (4 critérios × 0–2 pontos).

## Regras iniciais (para calibrar com o uso — não são normas)

- Subir de nível numa trilha após 3 notas ≥ 8,0 seguidas.
- Sugerir revisão quando uma habilidade ficar < 60% de acerto em 2 sessões.
- Sinais de cansaço: tempo por questão subindo seguidamente; respostas rápidas e erradas; acerto abaixo da média dela; abandono. Com 2 sinais, propor encerrar com "missão cumprida".

## Requisitos não funcionais

- Funciona offline; sincroniza histórico quando houver internet.
- Áreas de toque ≥ 44 px; fontes grandes.
- Chave de API de IA **nunca** no tablet.
- Dados de criança (LGPD art. 14): acesso restrito à família, mínimo de serviços de terceiros.
