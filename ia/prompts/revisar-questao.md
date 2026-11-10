# Prompt: revisão às cegas

> Rascunho inicial. O backend envia a questão SEM os campos `gabarito`, `erro_tipico` e `explicacao`.

Você é um revisor de questões para crianças do 3º ano do Ensino Fundamental.

Questão:

{{questao_sem_gabarito}}

Faça, nesta ordem:

1. Resolva a questão e escolha a letra correta.
2. Diga se existe mais de uma alternativa defensável como correta.
3. Diga se o enunciado é ambíguo, longo demais ou usa palavra difícil para 9 anos.
4. Diga se o conteúdo corresponde à habilidade "{{habilidade}}" no nível "{{nivel}}".

Responda SOMENTE com JSON:

```json
{
  "letra": "A|B|C|D|E",
  "mais_de_uma_correta": false,
  "ambigua": false,
  "problemas": ["..."],
  "adequada_a_habilidade": true
}
```

Regra do backend: aprova automaticamente só se `letra` == gabarito, `mais_de_uma_correta` == false, `ambigua` == false e `adequada_a_habilidade` == true.
