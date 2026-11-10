# Design

As telas vivas (editáveis e navegáveis) estão no canvas:
https://claude.ai/artifact/WdnV9qLXSVL4H3TnS8Xm3y

A pasta `telas/` guarda uma cópia das fontes de 10/11/2026, como referência para o desenvolvimento:

| Arquivo | Tela |
| --- | --- |
| `Main.dc.html` | 1. Início da aluna |
| `Questao.dc.html` | 2. Questão + rascunho |
| `Feedback.dc.html` | 3. Correção comentada |
| `Resultado.dc.html` | 4. Fim da sessão |
| `Evolucao.dc.html` | 5. Minha evolução |
| `Admin.dc.html` | 6. Painel do administrador |
| `canvas.json` | Posição das telas no canvas |

Esses arquivos dependem do ambiente do canvas para renderizar; abertos direto no navegador, servem como referência de layout, cores e textos, não como app.

## Tokens visuais

| Token | Valor |
| --- | --- |
| Fundo | `#F4F6FB` |
| Texto | `#1B2340` |
| Texto secundário | `#4D5675` |
| Primária (azul) | `#2F6FED` (hover `#1F4FB8`) |
| Destaque (laranja) | `#F28C28` |
| Acerto | `#1F9D55` |
| Fonte da aluna | Nunito 500–900 |
| Fonte do painel | Inter 400–700 |
| Raio de cartões | 20–28 px (aluna), 16 px (painel) |
| Área mínima de toque | 44 px |
