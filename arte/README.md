# Arte do Simuladinho (estilo caderno)

Desenhos feitos em código, no estilo **lápis de cor** do motor [anidoodle](https://github.com/alexgreensh/anidoodle). Nada é gerado por IA de imagem: cada traço é uma função determinística (o mesmo código produz os mesmos pixels). Decisões em `BRIEF.md`.

| Arquivo | O que desenha |
| --- | --- |
| `src/canvas-core/lapis.ts` | Renderizador: lápis de cor sobre fundo transparente (o app desenha o quadriculado) |
| `src/canvas-core/simuladinho.ts` | A coruja (normal e comemorando) e os ícones: lupa, relógio, livro, coração, cadeado, estrela |
| `src/canvas-core/texturas.ts` / `ladrilho.ts` | A hachura emendável usada como máscara para colorir botões e cartões |
| `src/canvas-core/molduras.ts` | Molduras desenhadas à mão (9-slice) em 5 cores |
| `src/canvas-core/corujaDesenho.ts` | A coruja se desenhando (2 s), para os momentos especiais |
| `exportar.py` | Recorta, reduz e salva tudo em `app/src/assets/arte/` |

## Como refazer

Este diretório guarda só os arquivos do Simuladinho. Para renderizar, crie um projeto do motor e copie-os para dentro dele:

```bash
node <anidoodle>/engine/tools/scaffold.mjs ~/arte --film mascote --format 1x1 --duration 3
cp -r arte/src arte/BRIEF.md arte/exportar.py ~/arte/
cd ~/arte && npm install --omit=optional --legacy-peer-deps
node tools/still.mjs simuladinho --frames 0-210:30 --out out/ --scale 2
node tools/still.mjs texturas --frames 0-180:30 --out out/tex-{frame}.png
node tools/still.mjs ladrilho --frame 0 --out out/ladrilho.png
node tools/still.mjs molduras --frames 0-120:30 --out out/mold-{frame}.png
node tools/still.mjs corujaDesenho --frames 0-47 --out out/cd/{frame}.png
python3 exportar.py
# a animação: ver o comando ffmpeg (VP9 com transparência) no histórico do commit v0.5
```
