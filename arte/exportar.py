# Exporta a arte renderizada (out/) para o app: recorta o transparente, reduz e salva em WebP com alfa.
# A hachura vira UMA máscara (só alfa): o app pinta qualquer cor através dela com CSS mask.
import os
from PIL import Image
APP = '/home/claude/simuladinho/app/src/assets/arte'
os.makedirs(APP, exist_ok=True)
for f in os.listdir(APP): os.remove(f'{APP}/{f}')
NOMES = ['coruja', 'coruja-feliz', 'lupa', 'relogio', 'livro', 'coracao', 'cadeado', 'estrela']
ALTURA = {'coruja': 360, 'coruja-feliz': 360}
for i, n in enumerate(NOMES):
    im = Image.open(f'out/simuladinho-{i*30}.png'); im = im.crop(im.getbbox())
    lado = ALTURA.get(n, 160); k = lado / max(im.width, im.height) if n not in ALTURA else lado / im.height
    im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS).save(f'{APP}/{n}.webp', 'WEBP', quality=82, alpha_quality=70, method=4)
# hachura emendável (ladrilho): só o alfa importa, o app pinta a cor por máscara
a = Image.open('out/ladrilho.png').convert('RGBA').split()[3]
m = Image.new('RGBA', a.size, (0, 0, 0, 0)); m.putalpha(a)
m.resize((400, 400), Image.LANCZOS).save(f'{APP}/hachura.webp', 'WEBP', quality=50, alpha_quality=45, method=4)
# molduras a lápis (9-slice)
for i, n in enumerate(['grafite', 'azul', 'laranja', 'verde', 'roxo']):
    Image.open(f'out/mold-{i*30}.png').save(f'{APP}/moldura-{n}.webp', 'WEBP', quality=85, alpha_quality=80, method=4)
tot = 0
for f in sorted(os.listdir(APP)): s = os.path.getsize(f'{APP}/{f}'); tot += s; print(f, s // 1024, 'KB')
print('total', tot // 1024, 'KB')
