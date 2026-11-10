# Simulador de Provas de Bolsa

Aplicativo de treino gamificado para provas de bolsa de colégios de alto padrão, feito para uma aluna do 3º ano do Ensino Fundamental (material Positivo), usado em tablet Android, com painel de administrador para o pai.

## Status

| Etapa | Situação |
| --- | --- |
| 1. Avaliação pedagógica | Concluída (ver `docs/`) |
| 2. Escopo do MVP e telas | Telas desenhadas (ver `design/`) |
| 3. Banco inicial de questões gerado por IA | A fazer (ver `ia/` e `conteudo/`) |
| 4. Desenvolvimento do app (aluna + administrador) | A fazer (ver `app/`) |
| 5. Teste com ela por 2–3 semanas | A fazer |

## Estrutura de pastas

```
simulador-bolsa/
├── README.md                  ← este arquivo
├── docs/                      ← avaliação pedagógica, requisitos do MVP, decisões técnicas
├── design/
│   └── telas/                 ← fontes das 6 telas (.dc.html) + layout do canvas
├── conteudo/
│   ├── matriz-curricular.json ← matérias × séries × habilidades (base para gerar questões)
│   ├── questoes/              ← formato (schema) das questões + exemplos
│   └── pilulas/               ← conteúdo didático curto por tópico
├── ia/
│   ├── README.md              ← pipeline de geração/revisão e regra de tamanho de sessão
│   └── prompts/               ← prompts de geração e de revisão independente
└── app/                       ← código do aplicativo (a iniciar)
```

## Links de trabalho

- Avaliação pedagógica (documento vivo): https://claude.ai/artifact/4nsiZiT4NvzAcmkviYQyV9
- Telas do MVP (canvas de design): https://claude.ai/artifact/WdnV9qLXSVL4H3TnS8Xm3y

## Próximo passo

Confirmar a stack proposta em `docs/decisoes-tecnicas.md` e iniciar o app em `app/`.
