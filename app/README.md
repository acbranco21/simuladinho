# App

Pasta reservada para o código do aplicativo (aluna + painel do administrador).

Ainda vazia de propósito: a stack depende da confirmação em `../docs/decisoes-tecnicas.md`.

## Estrutura prevista (se a proposta de PWA for confirmada)

```
app/
├── src/
│   ├── aluna/          ← telas 1–5
│   ├── admin/          ← tela 6 (com PIN)
│   ├── motor/          ← sessão, pontuação, progressão, sinais de cansaço
│   ├── figuras/        ← desenho SVG a partir de parâmetros
│   └── dados/          ← IndexedDB, estoque offline, sincronização
├── public/
└── backend/            ← função de geração/revisão de questões (guarda a chave da API)
```

## Ordem sugerida de desenvolvimento

1. Motor de sessão + pontuação, usando as questões de `../conteudo/questoes/exemplos/`.
2. Telas da aluna (Início → Questão → Correção → Fim).
3. Armazenamento offline e histórico.
4. Backend de geração + revisão por IA.
5. Painel do administrador.
6. Gamificação completa (medalhas, mapa de conquistas) e evolução.
