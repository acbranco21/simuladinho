# Decisões técnicas

> Proposta inicial para discussão. Nada aqui foi instalado ou confirmado ainda.

## Proposta de arquitetura

| Parte | Proposta | Por quê |
| --- | --- | --- |
| App da aluna e painel | **PWA** (app web instalável) em React + TypeScript + Vite | Roda no tablet Android pelo navegador, instala como app, funciona offline, sem publicar em loja |
| Armazenamento local | IndexedDB (ex.: biblioteca Dexie) | Histórico, estoque de questões e progresso offline |
| Offline | Service worker (ex.: vite-plugin-pwa) | Cache do app e das questões |
| Geração de questões | Pequeno backend/função serverless chamando uma API de IA | A chave da API fica no servidor, nunca no tablet |
| Sincronização e backup | A definir (ex.: banco gerenciado simples ou arquivo exportado) | Evitar perder o histórico se o tablet for trocado |
| Figuras de lógica | SVG gerado por código a partir de parâmetros | Confiável e verificável por código |

Confira nomes de bibliotecas e versões na documentação atual antes de instalar.

## Decisões em aberto

- [ ] Confirmar a stack acima (ou preferir app nativo Android, Flutter etc.).
- [ ] Onde hospedar o backend de IA e o backup.
- [ ] Qual provedor/modelo de IA para geração e revisão (e orçamento mensal).
- [ ] Voz para o "ouvir enunciado": síntese de voz do próprio Android/navegador ou serviço externo.
- [ ] Como o pai acessa o painel: mesmo tablet com PIN, ou celular/computador.
