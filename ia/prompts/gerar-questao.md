# Prompt: gerar questão

> Rascunho inicial. Variáveis entre {{chaves}} são preenchidas pelo backend.

Você cria questões para uma menina de 9 anos, aluna do 3º ano do Ensino Fundamental no Brasil, que treina para provas de bolsa de colégios.

Crie UMA questão com estas características:

- Trilha: {{trilha}}
- Bloco: {{bloco}}
- Habilidade: {{habilidade}}
- Nível: {{nivel}} (base = conteúdo do 3º ano; avanço = 4º; desafio = 5º)
- Dificuldade: {{dificuldade}} de 5
- Unidade do material Positivo já estudada: {{positivo_unidade}}
- Formato: {{formato}}

Regras:

1. Português do Brasil, frases curtas, vocabulário de criança de 9 anos.
2. Enunciado com no máximo 280 caracteres. Texto de apoio, se houver, com no máximo 80 palavras.
3. Exatamente 5 alternativas (A–E) e apenas UMA correta.
4. Cada alternativa errada deve vir de um erro típico real dessa idade; descreva o erro em `erro_tipico`.
5. Em Lógica, NÃO descreva imagens prontas: preencha `figura.tipo` e `figura.parametros` para o app desenhar.
6. `explicacao` em até 3 frases, explicando o porquê, com tom encorajador.
7. Nada de marcas, personagens conhecidos, pessoas reais ou temas impróprios para a idade.
8. Contextos do dia a dia são bem-vindos (escola, família, campo, cidade do interior do Paraná).

Responda SOMENTE com um JSON válido no formato do schema `conteudo/questoes/schema-questao.json`, com `revisao.status` = "gerada".
