# Simuladinho

Aplicativo de treino gamificado para provas de bolsa de colégios de alto padrão, feito para uma aluna do 3º ano do Ensino Fundamental (material Positivo), usado em tablet Android, com painel de administrador para o pai.

## Status

| Etapa | Situação |
| --- | --- |
| 1. Avaliação pedagógica | Concluída (ver `docs/`) |
| 2. Escopo do MVP e telas | Telas desenhadas (ver `design/`) |
| 3. Banco inicial de questões gerado por IA | Lote 1 pronto: 151 questões revisadas às cegas (ver `ia/LOTES.md`) |
| 4. Desenvolvimento do app (aluna + administrador) | v0.5: treino, simulado, estudar, evolução, Projeto de Vida, painel e visual caderno (ver `app/README.md`) |
| 5. Teste com ela por 2–3 semanas | Em andamento (instalado no tablet em 10/11/2026) |

## Estrutura de pastas

```
simuladinho/
├── README.md                  ← este arquivo
├── docs/                      ← avaliação pedagógica, requisitos do MVP, decisões técnicas
├── design/
│   └── telas/                 ← fontes das 6 telas (.dc.html) + layout do canvas
├── conteudo/
│   ├── matriz-curricular.json ← matérias × séries × habilidades (base para gerar questões)
│   ├── questoes/              ← formato (schema) das questões + exemplos
│   └── pilulas/               ← conteúdo didático curto por tópico
├── arte/                      ← desenhos a lápis de cor feitos em código (anidoodle)
├── ia/
│   ├── README.md              ← pipeline de geração/revisão e regra de tamanho de sessão
│   └── prompts/               ← prompts de geração e de revisão independente
└── app/                       ← código do aplicativo (a iniciar)
```

## App publicado

**https://acbranco21.github.io/simuladinho/** — publicado automaticamente pelo GitHub Actions (`.github/workflows/deploy.yml`) a cada envio para a branch `main`. Os testes rodam antes; se falharem, nada é publicado.

## Links de trabalho

- Avaliação pedagógica (documento vivo): https://claude.ai/artifact/4nsiZiT4NvzAcmkviYQyV9
- Telas do MVP (canvas de design): https://claude.ai/artifact/WdnV9qLXSVL4H3TnS8Xm3y

## Próximo passo

Produção de texto (redação) com correção pelo painel e lote 2 de questões (Avanço e Desafio).
