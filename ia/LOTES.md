# Lotes de questões

| Lote | Data | Questões | Como foi feito | Revisão |
| --- | --- | --- | --- | --- |
| Exemplos | 10/11/2026 | 11 | Escritas à mão | Conferência manual |
| 1 | 10/11/2026 | 151 (61 Matemática, 52 Português, 38 Lógica) | Matemática e Lógica geradas por `scripts/gerar_lote1.py` (respostas calculadas por código, alternativas erradas a partir de erros típicos); Português escrito à mão | Revisão às cegas por agente independente: 151/151 respostas coincidiram com o gabarito; 13 apontamentos de redação/concordância corrigidos no gerador (`revisoes/lote1-revisao-cega.json`) |

Arquivo usado pelo app: `app/src/dados/questoes-lote1.json`.

Para gerar de novo: `python3 ia/scripts/gerar_lote1.py app/src/dados/questoes-lote1.json` (a semente fixa reproduz o mesmo lote).
Observação: as correções de concordância foram feitas depois da revisão às cegas e conferidas manualmente, não por uma segunda revisão às cegas.

## Lote 2 — séries 4º a 9º, três coleções (262 questões)

Gerado por `scripts/gerar_lote2.py` (+ `scripts/lote2_portugues.py`), semente fixa 20261112. Coleções próprias: Base BNCC, Prova de Bolsa e Desafio Olímpico, escritas para o Simuladinho, sem material de sistemas de ensino nem questões de olimpíadas. 4º ano: 47 questões (13 Lógica, 17 Matemática, 17 Português); 5º ao 9º: 43 por série (13/15/15). Validação automática: 5 alternativas distintas e um único gabarito por questão; gabaritos revisados à mão. Arquivo: `app/src/dados/questoes-lote2.json`.
