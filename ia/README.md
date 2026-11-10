# IA: geração, revisão e dosagem

## Pipeline de cada questão

1. **Gerar** (`prompts/gerar-questao.md`): recebe trilha, bloco, habilidade, nível, dificuldade e unidade do Positivo; devolve JSON no formato de `conteudo/questoes/schema-questao.json`.
2. **Revisar às cegas** (`prompts/revisar-questao.md`): outra chamada resolve a questão **sem ver o gabarito**. Se a letra não bater, a questão volta para reescrita (no máximo 2 tentativas) ou é descartada.
3. **Checar por código**:
   - exatamente 5 alternativas e 1 gabarito válido;
   - contas recalculadas (Matemática);
   - padrões de figuras conferidos (Lógica);
   - enunciado ≤ 280 caracteres; vocabulário simples.
4. **Calibrar pelo uso**: taxa de acerto real recalcula a dificuldade; acerto muito fora do esperado manda para a fila do administrador.
5. **"Achei um erro"**: tira a questão de circulação até nova revisão.

Mesmo com as camadas, não há garantia de erro zero; a fila de amostragem do administrador (≈5 por semana no início) é opcional, mas recomendada.

## Estoque offline

O tablet guarda um estoque de questões aprovadas por trilha/nível. Quando houver internet e o estoque estiver baixo, o backend gera um novo lote. A chave da API fica só no backend.

## Tamanho da sessão (valores iniciais, a calibrar)

| Sessão | Início | Ajuste |
| --- | --- | --- |
| Treino diário | ~10 questões | ±2 conforme sinais |
| Caça aos erros | 5 | fixo |
| Modo Prova | blocos de 10 com pausa | cresce até 20 seguidas |

Sinais de cansaço/tédio: tempo por questão subindo seguidamente; resposta rápida e errada (chute); acerto abaixo da média dela no assunto; abandono. Com 2 sinais na mesma sessão → propor encerrar com "missão cumprida".
