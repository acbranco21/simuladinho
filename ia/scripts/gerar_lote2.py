"""Gera o lote 2 do banco: 4º ao 9º ano, nas três coleções próprias.

Coleções (questões ORIGINAIS; nenhuma copiada de sistema de ensino, olimpíada ou prova):
  base     · Base BNCC: o conteúdo da série, direto
  bolsa    · Prova de Bolsa: enunciado contextualizado, várias etapas
  olimpico · Desafio Olímpico: raciocínio, padrões, contagem

Matemática e Lógica: respostas CALCULADAS por código; distratores = erros típicos nomeados.
Português: itens escritos à mão (lote2_portugues.py), textos de apoio originais.
Dificuldade 1–5 (pontos 3/4/5). O 4º ano tem mais itens difíceis: é a série do simulado oficial
de quem está no 3º ano.
Saída: app/src/dados/questoes-lote2.json
"""
import json
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
rng = random.Random(20261112)
LETRAS = ['A', 'B', 'C', 'D', 'E']
QUESTOES = []
NIVEL = {3: 'base', 4: 'avanco'}


def pontos(d):
    return 3 if d <= 2 else (4 if d == 3 else 5)


def montar(id_, serie, colecao, trilha, bloco, hab, dif, enunciado, correta, erradas, explicacao,
           dica=None, texto_apoio=None):
    """correta: texto; erradas: 4 tuplas (texto, erro_tipico)."""
    correta = str(correta)
    erradas = [(str(t), e) for t, e in erradas]
    assert len(erradas) == 4, (id_, erradas)
    assert all(e for _, e in erradas), id_
    textos = [correta] + [t for t, _ in erradas]
    assert len(set(textos)) == 5, (id_, textos)
    itens = [(correta, None)] + erradas
    rng.shuffle(itens)
    alternativas, gabarito = [], None
    for letra, (txt, erro) in zip(LETRAS, itens):
        alternativas.append({'letra': letra, 'texto': txt, 'erro_tipico': erro})
        if erro is None:
            gabarito = letra
    assert len(enunciado) <= 420, (id_, len(enunciado))
    QUESTOES.append({
        'id': id_, 'trilha': trilha, 'bloco': bloco, 'habilidade': hab,
        'nivel': NIVEL.get(serie, 'desafio'), 'serie': serie, 'colecao': colecao,
        'dificuldade': dif, 'pontos': pontos(dif), 'formato': 'multipla_escolha',
        'positivo_unidade': None, 'texto_apoio': texto_apoio, 'enunciado': enunciado, 'figura': None,
        'alternativas': alternativas, 'gabarito': gabarito, 'explicacao': explicacao, 'dica': dica,
        'pilula_id': None, 'revisao': {'status': 'gerada'},
    })


def fn(n):
    """Número no formato brasileiro: 12.345 / 3,5 / -7."""
    if isinstance(n, float) and not n.is_integer():
        s = f'{n:.2f}'.rstrip('0').rstrip('.')
        inteiro, dec = s.split('.') if '.' in s else (s, '')
        return f'{int(inteiro):,}'.replace(',', '.') + (',' + dec if dec else '')
    return f'{int(n):,}'.replace(',', '.')


def reais(v):
    """R$ com duas casas: reais(12.5) -> 'R$ 12,50'."""
    c = round(v * 100)
    return f'R$ {c // 100:,}'.replace(',', '.') + f',{c % 100:02d}'


def distratores(correto, candidatos, extras=(), fmt=fn):
    """4 distratores únicos e diferentes do correto, a partir de (valor, erro)."""
    vistos, saida = {fmt(correto)}, []
    for valor, erro in list(candidatos) + list(extras):
        if valor is None:
            continue
        t = fmt(valor)
        if t in vistos:
            continue
        vistos.add(t)
        saida.append((t, erro))
        if len(saida) == 4:
            return saida
    raise AssertionError((correto, candidatos))


def perto(v, passos=(1, -1, 2, -2, 10, -10)):
    if isinstance(v, str):
        return []  # respostas em texto: os distratores vêm todos dos erros típicos
    return [(v + p, 'Errou a conta por pouco') for p in passos]


CONT = {}


def novo_id(prefixo):
    CONT[prefixo] = CONT.get(prefixo, 0) + 1
    return f'{prefixo}-{CONT[prefixo]:03d}'


# ===================================================================== MATEMÁTICA
def mat(serie, colecao, bloco, hab, dif, enun, correto, cands, expl, dica=None, fmt=fn, extras=()):
    montar(novo_id(f'l2-mat{serie}'), serie, colecao, 'matematica', bloco, hab, dif, enun, fmt(correto),
           distratores(correto, cands, list(extras) + perto(correto), fmt), expl, dica)


def mat4():
    s = 4
    for _ in range(2):  # multiplicação com dois algarismos
        a, b = rng.randint(23, 68), rng.randint(14, 39)
        p1, p2 = a * (b % 10), a * (b // 10)
        mat(s, 'base', 'mat-operacoes', 'Multiplicação por número de dois algarismos', 4, f'Quanto é {a} × {b}?', a * b,
            [(p1 + p2, 'Não deslocou a segunda linha (esqueceu que é dezena)'), (a * b + 10, 'Errou um "vai um"'), (a + b, 'Somou em vez de multiplicar'), (p1, 'Multiplicou só pelas unidades')],
            f'{a} × {b % 10} = {fn(p1)} e {a} × {b // 10}0 = {fn(p2 * 10)}. Somando: {fn(a * b)}.', 'Separe o número de baixo em dezenas e unidades.')
    for _ in range(2):  # divisão com resto em problema
        d = rng.choice([6, 7, 8, 9]); q = rng.randint(12, 31); r = rng.randint(1, d - 1); n = d * q + r
        mat(s, 'base', 'mat-operacoes', 'Divisão com resto', 3, f'{n} figurinhas serão guardadas em envelopes com {d} figurinhas cada. Quantos envelopes ficam completos?', q,
            [(q + 1, 'Contou o envelope incompleto'), (r, 'Respondeu o resto'), (n - d, 'Subtraiu em vez de dividir'), (q - 1, 'Errou a tabuada')],
            f'{n} ÷ {d} = {q} e sobram {r}. Ficam {q} envelopes completos.')
    n = rng.choice([24, 32, 36, 40, 48]); k = rng.choice([3, 4]); den = rng.choice([x for x in (4, 6, 8) if n % x == 0 and x > k])
    mat(s, 'base', 'mat-fracoes', 'Fração de uma quantidade', 3, f'Quanto é {k}/{den} de {n}?', n // den * k,
        [(n // den, 'Calculou só 1/' + str(den)), (n // k, 'Dividiu pelo numerador'), (n - n // den * k, 'Calculou a parte que sobra'), (n * k // den + den, 'Somou o denominador')],
        f'1/{den} de {n} é {n // den}. Então {k}/{den} é {k} × {n // den} = {n // den * k}.', 'Primeiro ache 1 parte, depois pegue quantas partes o numerador pede.')
    # Prova de Bolsa (várias etapas, difícil)
    cx, por, turmas = 12, 24, rng.choice([6, 8, 9])
    tot = cx * por
    mat(s, 'bolsa', 'mat-problemas', 'Problema de várias etapas', 4,
        f'A escola comprou {cx} caixas com {por} lápis em cada uma. Os lápis foram repartidos igualmente entre {turmas} turmas. Quantos lápis cada turma recebeu?', tot // turmas,
        [(tot, 'Parou na multiplicação'), (por // turmas * cx if por % turmas == 0 else tot // turmas + 4, 'Dividiu só uma caixa'), (tot - turmas, 'Subtraiu em vez de dividir'), (cx * turmas, 'Multiplicou os números errados')],
        f'Total: {cx} × {por} = {tot} lápis. Repartindo: {tot} ÷ {turmas} = {tot // turmas}.')
    preco, qtd, nota = rng.choice([12.5, 8.75, 14.25]), 3, 50
    mat(s, 'bolsa', 'mat-dinheiro', 'Troco com várias compras', 4,
        f'Rita comprou {qtd} cadernos de {reais(preco)} cada um e pagou com uma nota de {reais(nota)}. Quanto recebeu de troco?', nota - qtd * preco,
        [(nota - preco, 'Descontou só um caderno'), (qtd * preco, 'Respondeu o gasto'), (nota - qtd * preco - 1, 'Errou os centavos'), (nota - qtd * int(preco), 'Ignorou os centavos')],
        f'Gasto: {qtd} × {reais(preco)} = {reais(qtd * preco)}. Troco: {reais(nota)} − {reais(qtd * preco)} = {reais(nota - qtd * preco)}.', fmt=reais)
    alunos, lugares = rng.choice([(137, 40), (213, 45), (98, 30)])
    mat(s, 'bolsa', 'mat-problemas', 'Divisão com resto: arredondar para cima', 5,
        f'{alunos} alunos vão a um passeio. Cada ônibus leva no máximo {lugares} alunos. Qual é o menor número de ônibus necessário?', -(-alunos // lugares),
        [(alunos // lugares, 'Esqueceu os alunos que sobraram'), (alunos % lugares, 'Respondeu o resto'), (-(-alunos // lugares) + 1, 'Pediu um ônibus a mais'), (alunos - lugares, 'Subtraiu')],
        f'{alunos} ÷ {lugares} = {alunos // lugares} e sobram {alunos % lugares}. Os que sobram precisam de mais um ônibus: {-(-alunos // lugares)}.')
    h, m, dh, dm = 14, 35, 1, 50
    fim = (h * 60 + m + dh * 60 + dm)
    mat(s, 'bolsa', 'mat-medidas', 'Duração e horário', 4,
        f'Um filme começou às {h}h{m:02d} e durou {dh} hora e {dm} minutos. A que horas terminou?', f'{fim // 60}h{fim % 60:02d}',
        [(f'{h + dh}h{m + dm}', 'Somou os minutos passando de 60'), (f'{h + dh}h{(m + dm) % 60:02d}', 'Não passou a hora a mais'), (f'{fim // 60 + 1}h{fim % 60:02d}', 'Somou uma hora a mais'), (f'{h + dh}h{dm:02d}', 'Trocou os minutos')],
        f'{h}h{m:02d} + 1h = {h + 1}h{m:02d}. Mais {dm} min: {m} + {dm} = {m + dm} min = 1h{m + dm - 60:02d}. Termina às {fim // 60}h{fim % 60:02d}.', fmt=str)
    a, b = rng.choice([(6, 4), (8, 5), (7, 6)])
    mat(s, 'bolsa', 'mat-geometria', 'Perímetro em situação', 4,
        f'Um canteiro retangular mede {a} m por {b} m. Quantos metros de tela são necessários para cercá-lo, deixando uma abertura de 1 m para o portão?', 2 * (a + b) - 1,
        [(2 * (a + b), 'Esqueceu a abertura do portão'), (a * b, 'Calculou a área'), (a + b - 1, 'Somou só dois lados'), (a * b - 1, 'Usou a área')],
        f'Perímetro: {a} + {b} + {a} + {b} = {2 * (a + b)} m. Sem o portão: {2 * (a + b) - 1} m.')
    # Desafio Olímpico
    k = rng.choice([5, 7, 9])
    n = sum(1 for x in range(10, 100) if x // 10 + x % 10 == k)
    mat(s, 'olimpico', 'mat-raciocinio', 'Contagem organizada', 5, f'Quantos números de dois algarismos têm a soma dos algarismos igual a {k}?', n,
        [(n + 1, 'Contou o número que começa com zero'), (n - 1, 'Esqueceu um número'), (k, 'Respondeu a própria soma'), (2 * n, 'Contou cada número duas vezes')],
        f'Liste pela dezena: {", ".join(str(x) for x in range(10, 100) if x // 10 + x % 10 == k)}. São {n}.', 'Organize: dezena 1, dezena 2, …')
    g = rng.choice([3, 4])
    quad = sum(i * i for i in range(1, g + 1))
    mat(s, 'olimpico', 'mat-raciocinio', 'Contar quadrados numa grade', 5, f'Numa grade de {g} × {g} quadradinhos, quantos quadrados de todos os tamanhos existem?', quad,
        [(g * g, 'Contou só os pequenos'), (g * g + 1, 'Somou só o quadrado grande'), (quad - 1, 'Esqueceu o quadrado grande'), (2 * g, 'Contou as linhas')],
        f'Tamanho 1: {g * g}; ' + '; '.join(f'tamanho {t}: {(g - t + 1) ** 2}' for t in range(2, g + 1)) + f'. Total: {quad}.')
    t = rng.choice([20, 25, 30])
    formas = sum(1 for d in range(t // 10 + 1) if (t - 10 * d) % 5 == 0)
    mat(s, 'olimpico', 'mat-raciocinio', 'Formas de pagar', 5, f'De quantas maneiras diferentes dá para pagar {t} centavos usando só moedas de 5 e de 10 centavos?', formas,
        [(formas + 1, 'Contou uma forma impossível'), (formas - 1, 'Esqueceu a forma só com moedas de 5'), (t // 5, 'Contou as moedas de 5'), (t // 10, 'Contou as moedas de 10')],
        f'Use 0, 1, … moedas de 10 e complete com moedas de 5: {formas} maneiras.')
    idade_b = rng.randint(5, 9); soma = idade_b * 3 + 8
    mat(s, 'olimpico', 'mat-raciocinio', 'Problema de idades', 5,
        f'Ana tem o dobro da idade de Bia. Daqui a 4 anos, a soma das idades das duas será {soma}. Quantos anos Bia tem hoje?', idade_b,
        [(2 * idade_b, 'Respondeu a idade da Ana'), (idade_b + 4, 'Respondeu a idade daqui a 4 anos'), (soma // 3, 'Ignorou os 4 anos'), (soma // 2, 'Dividiu a soma por 2')],
        f'Daqui a 4 anos, as duas terão juntas 8 anos a mais. Hoje somam {soma - 8}, que são 3 partes iguais (Bia 1, Ana 2): {soma - 8} ÷ 3 = {idade_b}.', 'Teste valores: se Bia tem 5, Ana tem 10…')
    p = rng.choice([3, 4])
    mat(s, 'olimpico', 'mat-raciocinio', 'Padrão com palitos', 5,
        f'Com 4 palitos se forma 1 quadrado. Colocando quadrados lado a lado numa fila, 2 quadrados usam 7 palitos e 3 quadrados usam 10. Quantos palitos são precisos para {p * 4} quadrados?', 3 * p * 4 + 1,
        [(4 * p * 4, 'Contou 4 palitos para cada quadrado'), (3 * p * 4, 'Esqueceu o primeiro palito'), (3 * p * 4 + 4, 'Somou um quadrado a mais'), (10 * p, 'Multiplicou o 10')],
        f'Cada quadrado novo usa 3 palitos e o primeiro usa 4: 1 + 3 × {p * 4} = {3 * p * 4 + 1}.')
    # base difíceis extras (simulado de 4º precisa de difíceis)
    a, b = rng.randint(120, 480), rng.randint(3, 8)
    mat(s, 'base', 'mat-operacoes', 'Multiplicação e divisão inversas', 4, f'Pensei num número, multipliquei por {b} e obtive {a * b}. Em que número pensei?', a,
        [(a * b * b, 'Multiplicou de novo'), (a * b - b, 'Subtraiu'), (a + b, 'Somou'), (a * b // 2, 'Dividiu por 2')], f'A operação inversa da multiplicação é a divisão: {fn(a * b)} ÷ {b} = {a}.')
    num = rng.choice([4325, 6078, 7409])
    mat(s, 'base', 'mat-numeros', 'Valor posicional', 4, f'No número {fn(num)}, quanto vale o algarismo {str(num)[1]}?', int(str(num)[1]) * 100,
        [(int(str(num)[1]), 'Deu o algarismo, não o valor'), (int(str(num)[1]) * 10, 'Pensou que era dezena'), (int(str(num)[1]) * 1000, 'Pensou que era unidade de milhar'), (num, 'Deu o número todo')],
        f'O algarismo {str(num)[1]} está na casa das centenas: vale {int(str(num)[1]) * 100}.')


def mat5():
    s = 5
    for den, a, b in [(8, 3, 2), (12, 5, 4)]:
        mat(s, 'base', 'mat-fracoes', 'Adição de frações com mesmo denominador', 3, f'Quanto é {a}/{den} + {b}/{den}?', f'{a + b}/{den}',
            [(f'{a + b}/{2 * den}', 'Somou os denominadores'), (f'{a * b}/{den}', 'Multiplicou os numeradores'), (f'{a + b}/{den * den}', 'Multiplicou os denominadores'), (f'{a - b}/{den}', 'Subtraiu')],
            f'Com o mesmo denominador, somam-se só os numeradores: {a} + {b} = {a + b}. Resultado {a + b}/{den}.', fmt=str)
    for p, v in [(25, 80), (10, 350)]:
        mat(s, 'base', 'mat-porcentagem', 'Porcentagem simples', 3, f'Quanto é {p}% de {v}?', v * p // 100,
            [(v - v * p // 100, 'Calculou o que sobra'), (v // p, 'Dividiu pelo número da porcentagem'), (p, 'Respondeu a porcentagem'), (v * p // 10, 'Errou a vírgula')],
            f'{p}% é {p} de cada 100. {v} × {p} ÷ 100 = {v * p // 100}.')
    a, b, c = rng.choice([(4, 3, 2), (5, 2, 3)])
    mat(s, 'base', 'mat-geometria', 'Volume com cubinhos', 4, f'Uma caixa é preenchida com cubinhos: {a} de comprimento, {b} de largura e {c} de altura. Quantos cubinhos cabem?', a * b * c,
        [(a + b + c, 'Somou as medidas'), (a * b, 'Contou só uma camada'), (2 * (a * b + a * c + b * c), 'Calculou a superfície'), (a * b * c + a, 'Contou uma fileira a mais')],
        f'Uma camada tem {a} × {b} = {a * b} cubinhos; com {c} camadas: {a * b * c}.')
    # bolsa
    preco = rng.choice([120, 160, 240])
    mat(s, 'bolsa', 'mat-porcentagem', 'Desconto', 4, f'Um tênis custa {reais(preco)}. Na liquidação, tem 25% de desconto. Quanto passa a custar?', preco * 0.75,
        [(preco * 0.25, 'Respondeu o valor do desconto'), (preco - 25, 'Descontou 25 reais'), (preco * 1.25, 'Somou em vez de descontar'), (preco * 0.5, 'Descontou a metade')],
        f'25% de {reais(preco)} = {reais(preco * 0.25)}. Preço: {reais(preco)} − {reais(preco * 0.25)} = {reais(preco * 0.75)}.', fmt=reais)
    ov, bisc, quer = 3, 12, rng.choice([30, 36, 48])
    if quer % 4:
        quer = 36
    mat(s, 'bolsa', 'mat-proporcao', 'Proporção em receita', 4, f'Uma receita usa {ov} ovos para fazer {bisc} biscoitos. Quantos ovos são precisos para {quer} biscoitos?', quer * ov // bisc,
        [(quer // ov, 'Dividiu pelo número de ovos'), (quer - bisc + ov, 'Somou a diferença'), (quer * ov // bisc + 1, 'Arredondou para mais'), (ov * 2, 'Só dobrou')],
        f'{bisc} biscoitos → {ov} ovos, então cada ovo rende {bisc // ov} biscoitos. {quer} ÷ {bisc // ov} = {quer * ov // bisc} ovos.')
    esc, cm = rng.choice([(50000, 6), (20000, 8)])
    km = esc * cm / 100000
    mat(s, 'bolsa', 'mat-proporcao', 'Escala de mapa', 5, f'Num mapa, a escala é 1 : {fn(esc)} (1 cm no mapa = {fn(esc)} cm reais). Duas cidades estão a {cm} cm no mapa. Qual a distância real?', f'{fn(km)} km',
        [(f'{fn(km * 10)} km', 'Errou a conversão de unidades'), (f'{fn(esc * cm)} km', 'Não converteu centímetros'), (f'{fn(km / 10)} km', 'Dividiu a mais'), (f'{fn(cm)} km', 'Usou só a medida do mapa')],
        f'{cm} × {fn(esc)} cm = {fn(esc * cm)} cm = {fn(esc * cm / 100)} m = {fn(km)} km.', fmt=str)
    notas = [7, 8, 7, 9]
    falta = 4 * 8 + 8 - sum(notas)
    mat(s, 'bolsa', 'mat-estatistica', 'Média', 5, f'Bia tirou {", ".join(map(str, notas))} em quatro provas. Que nota precisa tirar na quinta para que a média das cinco seja 8?', falta,
        [(8, 'Pensou que bastava tirar a média'), (sum(notas) // 4, 'Calculou a média atual'), (falta - 1, 'Errou a soma'), (10, 'Chutou a nota máxima')],
        f'Para média 8 em 5 provas, a soma precisa ser 40. Ela tem {sum(notas)}. Falta {falta}.')
    litros, km_l = rng.choice([(45, 12), (38, 11)])
    mat(s, 'bolsa', 'mat-problemas', 'Problema de várias etapas', 4, f'Um carro faz {km_l} km com 1 litro. Com o tanque de {litros} litros, quantos quilômetros percorre?', litros * km_l,
        [(litros + km_l, 'Somou'), (litros * km_l // 10, 'Errou a vírgula'), (litros * km_l - km_l, 'Esqueceu um litro'), (litros * 10, 'Arredondou para 10 km')], f'{litros} × {km_l} = {litros * km_l} km.')
    # olímpico
    n = rng.choice([50, 100, 40])
    mat(s, 'olimpico', 'mat-raciocinio', 'Soma de Gauss', 5, f'Quanto é 1 + 2 + 3 + … + {n}?', n * (n + 1) // 2,
        [(n * n // 2, 'Esqueceu de somar um par'), (n * (n + 1), 'Não dividiu por 2'), (n * (n - 1) // 2, 'Parou um número antes'), (n * 10, 'Estimou')],
        f'Junte em pares que somam {n + 1}: 1 + {n}, 2 + {n - 1}… São {n // 2} pares: {n // 2} × {n + 1} = {n * (n + 1) // 2}.', 'Some o primeiro com o último.')
    e = rng.choice([10, 14, 21])
    mat(s, 'olimpico', 'mat-raciocinio', 'Último algarismo de potência', 5, f'Qual é o algarismo das unidades de 2 multiplicado por ele mesmo {e} vezes (2^{e})?', pow(2, e) % 10,
        [((pow(2, e) % 10 + 2) % 10, 'Errou a posição no ciclo'), (2, 'Achou que sempre termina em 2'), (0, 'Pensou que termina em zero'), ((pow(2, e) % 10 + 6) % 10 or 5, 'Errou o ciclo')],
        f'As unidades das potências de 2 repetem 2, 4, 8, 6. Como {e} deixa resto {e % 4 or 4} na divisão por 4, a unidade é {pow(2, e) % 10}.')
    for lim, a, b in [(60, 3, 4), (100, 4, 6)]:
        c = sum(1 for x in range(1, lim + 1) if x % a == 0 or x % b == 0)
        mat(s, 'olimpico', 'mat-raciocinio', 'Múltiplos: contar sem repetir', 5, f'De 1 a {lim}, quantos números são múltiplos de {a} ou de {b}?', c,
            [(lim // a + lim // b, 'Contou duas vezes os múltiplos dos dois'), (lim // a, f'Contou só os de {a}'), (c - 1, 'Esqueceu um número'), (lim // (a * b), 'Contou só os comuns')],
            f'Múltiplos de {a}: {lim // a}. De {b}: {lim // b}. Dos dois ao mesmo tempo (mmc {a * b // math.gcd(a, b)}): {lim // (a * b // math.gcd(a, b))}. Total: {c}.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Maior número com regras', 5, 'Qual é o maior número de três algarismos, todos diferentes, cuja soma dos algarismos é 12?', 930,
        [(966, 'Repetiu algarismo'), (921, 'Não maximizou a dezena'), (840, 'Começou pelo 8'), (912, 'Trocou a ordem')],
        'Comece com 9 na centena; para o maior possível, a dezena vem logo depois: 9 + 3 + 0 = 12 → 930.')


def mat6():
    s = 6
    for a, b in [(12, 18), (24, 36)]:
        g = math.gcd(a, b)
        mat(s, 'base', 'mat-numeros', 'MDC', 3, f'Qual é o máximo divisor comum de {a} e {b}?', g,
            [(a * b // g, 'Calculou o MMC'), (g // 2, 'Achou um divisor comum, mas não o maior'), (b - a, 'Subtraiu'), (a, 'Deu o menor número')], f'Divisores comuns de {a} e {b}: o maior é {g}.')
    mat(s, 'base', 'mat-fracoes', 'Adição de frações com denominadores diferentes', 4, 'Quanto é 1/3 + 1/4?', '7/12',
        [('2/7', 'Somou numeradores e denominadores'), ('1/12', 'Multiplicou'), ('2/12', 'Não converteu os numeradores'), ('7/7', 'Somou tudo')], '1/3 = 4/12 e 1/4 = 3/12. Soma: 7/12.', fmt=str)
    mat(s, 'base', 'mat-numeros', 'Potências', 3, 'Quanto é 2^5 (2 elevado a 5)?', 32, [(10, 'Multiplicou 2 × 5'), (25, 'Fez 5 × 5'), (16, 'Elevou a 4'), (7, 'Somou')], '2 × 2 × 2 × 2 × 2 = 32.')
    mat(s, 'base', 'mat-geometria', 'Ângulos suplementares', 3, 'Dois ângulos são suplementares (somam 180°). Um deles mede 47°. Quanto mede o outro?', 133,
        [(43, 'Usou 90° (complementar)'), (227, 'Somou'), (143, 'Errou a subtração'), (180, 'Respondeu a soma')], '180° − 47° = 133°.', fmt=lambda v: f'{v}°')
    # bolsa
    a, b = rng.choice([(12, 18), (15, 20)])
    l = a * b // math.gcd(a, b)
    mat(s, 'bolsa', 'mat-numeros', 'MMC em problema', 4, f'Um ônibus sai do terminal a cada {a} minutos e outro a cada {b} minutos. Saíram juntos às 7h. Depois de quantos minutos sairão juntos de novo?', l,
        [(a * b, 'Multiplicou sem procurar o menor'), (a + b, 'Somou'), (math.gcd(a, b), 'Calculou o MDC'), (b - a, 'Subtraiu')], f'É o menor múltiplo comum: mmc({a}, {b}) = {l} minutos.')
    a, b = 48, 60
    mat(s, 'bolsa', 'mat-numeros', 'MDC em problema', 4, f'Há {a} canetas azuis e {b} vermelhas. Quer-se montar o maior número possível de kits iguais, sem sobrar canetas. Quantos kits?', math.gcd(a, b),
        [(a * b // math.gcd(a, b), 'Calculou o MMC'), (a + b, 'Somou'), (6, 'Achou um divisor comum menor'), (b - a, 'Subtraiu')], f'O maior divisor comum de {a} e {b} é {math.gcd(a, b)}: {math.gcd(a, b)} kits.')
    tot, gasto = 1200, rng.choice([(1, 4), (2, 5)])
    resto = tot - tot * gasto[0] // gasto[1]
    mat(s, 'bolsa', 'mat-fracoes', 'Fração em problema de etapas', 5, f'Ana tinha {reais(tot)}. Gastou {gasto[0]}/{gasto[1]} com o aluguel e, do que sobrou, metade com compras. Quanto lhe restou?', resto / 2,
        [(resto, 'Esqueceu as compras'), (tot / 2, 'Fez a metade do total'), (tot * gasto[0] / gasto[1], 'Respondeu o aluguel'), (tot - tot * gasto[0] / gasto[1] - tot / 2, 'Tirou metade do total')],
        f'Aluguel: {reais(tot * gasto[0] / gasto[1])}. Sobrou {reais(resto)}. Metade: {reais(resto / 2)}.', fmt=reais)
    mat(s, 'bolsa', 'mat-porcentagem', 'Porcentagem em situação', 4, 'Numa escola de 640 alunos, 35% vão de ônibus. Quantos alunos NÃO vão de ônibus?', 416,
        [(224, 'Calculou quem vai de ônibus'), (605, 'Subtraiu 35'), (65, 'Respondeu a porcentagem'), (406, 'Errou a conta')], '35% de 640 = 224. Não vão: 640 − 224 = 416 (65%).')
    mat(s, 'bolsa', 'mat-decimais', 'Decimais em compras', 4, 'Um quilo de queijo custa R$ 42,80. Quanto custam 250 gramas?', 10.70,
        [(42.80 / 2, 'Fez a metade'), (42.80 / 25, 'Dividiu por 25'), (10.20, 'Errou os centavos'), (42.80 * 0.4, 'Usou 40%')], '250 g é 1/4 de quilo: R$ 42,80 ÷ 4 = R$ 10,70.', fmt=reais)
    # olímpico
    mat(s, 'olimpico', 'mat-raciocinio', 'Números primos', 5, 'Quantos números primos existem entre 20 e 50?', 7,
        [(6, 'Esqueceu um primo'), (8, 'Contou um número que não é primo'), (5, 'Esqueceu dois primos'), (15, 'Contou os ímpares')], 'São 23, 29, 31, 37, 41, 43 e 47: 7 primos.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Divisores', 5, 'Quantos divisores positivos tem o número 36?', 9,
        [(8, 'Esqueceu um divisor'), (6, 'Contou só os divisores menores que 10'), (12, 'Contou divisores repetidos'), (4, 'Contou só os primos com potências')], '1, 2, 3, 4, 6, 9, 12, 18, 36: 9 divisores.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Algarismos usados', 5, 'Para numerar as páginas de um livro de 1 a 120, quantos algarismos são escritos?', 9 + 180 + 63,
        [(120, 'Contou páginas'), (9 + 180, 'Parou no 99'), (360, 'Contou 3 algarismos por página'), (9 + 180 + 60, 'Esqueceu a página 100')], '1–9: 9. 10–99: 90 × 2 = 180. 100–120: 21 × 3 = 63. Total: 252.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Resto de divisão', 5, 'Qual é o resto da divisão de 2026 por 9?', 2026 % 9,
        [(0, 'Achou que é divisível'), (2026 % 9 + 1, 'Errou a soma dos algarismos'), (2026 % 7, 'Dividiu por 7'), (8, 'Chutou o maior resto')], 'A soma dos algarismos 2 + 0 + 2 + 6 = 10 deixa resto 1 por 9. O resto é 1.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Frações de frações', 5, 'Metade de um terço de um número é 7. Qual é o número?', 42,
        [(21, 'Desfez só a metade'), (14, 'Desfez só o terço'), (7, 'Respondeu o próprio 7'), (35, 'Somou as frações')], 'Um terço do número é 14; o número é 42.')


def mat7():
    s = 7
    for a, b in [(-8, 13), (-15, 6)]:
        mat(s, 'base', 'mat-inteiros', 'Números inteiros', 3, f'De manhã a temperatura era {a} °C e subiu {b} °C. Qual a nova temperatura?', a + b,
            [(-(a + b), 'Errou o sinal'), (a - b, 'Diminuiu'), (b - a, 'Somou os valores sem sinal'), (abs(a) + b, 'Ignorou o sinal negativo')], f'{a} + {b} = {a + b}.', fmt=lambda v: f'{v} °C')
    for a, b, c in [(3, 7, 25), (5, 4, 39)]:
        mat(s, 'base', 'mat-algebra', 'Equação do 1º grau', 3, f'Resolva: {a}x + {b} = {c}.', (c - b) // a,
            [((c + b) // a, 'Somou em vez de subtrair'), (c - b, 'Esqueceu de dividir'), ((c - b) // a + 1, 'Errou a divisão'), (c // a, 'Ignorou o termo')], f'{a}x = {c} − {b} = {c - b}; x = {(c - b) // a}.')
    mat(s, 'base', 'mat-geometria', 'Ângulos do triângulo', 3, 'Num triângulo, dois ângulos medem 48° e 67°. Quanto mede o terceiro?', 65,
        [(115, 'Somou os dois'), (245, 'Usou 360°'), (75, 'Errou a conta'), (90, 'Achou que era reto')], '180° − 48° − 67° = 65°.', fmt=lambda v: f'{v}°')
    # bolsa
    mat(s, 'bolsa', 'mat-proporcao', 'Regra de três inversa', 5, '6 pedreiros constroem um muro em 10 dias. Em quantos dias 4 pedreiros, no mesmo ritmo, constroem o mesmo muro?', 15,
        [(7, 'Usou regra de três direta (6,7)'), (12, 'Somou 2 dias'), (8, 'Subtraiu'), (20, 'Dobrou')], 'Menos pedreiros → mais dias. 6 × 10 = 60 "dias-pedreiro"; 60 ÷ 4 = 15 dias.')
    mat(s, 'bolsa', 'mat-porcentagem', 'Aumento e desconto', 5, 'Um produto de R$ 200,00 teve aumento de 10% e depois desconto de 10%. Quanto custa agora?', 198.0,
        [(200.0, 'Achou que um anula o outro'), (180.0, 'Só deu o desconto'), (220.0, 'Só deu o aumento'), (202.0, 'Inverteu')], 'Com aumento: R$ 220,00. Desconto de 10% de 220 = 22: R$ 198,00.', fmt=reais)
    mat(s, 'bolsa', 'mat-algebra', 'Equação em problema', 4, 'Pai e filho têm juntos 52 anos. O pai tem 28 anos a mais que o filho. Qual a idade do filho?', 12,
        [(40, 'Respondeu a idade do pai'), (24, 'Dividiu 52 − 4'), (26, 'Dividiu 52 por 2'), (14, 'Dividiu 28 por 2')], 'x + (x + 28) = 52 → 2x = 24 → x = 12.')
    mat(s, 'bolsa', 'mat-proporcao', 'Razão em mistura', 4, 'Uma tinta é feita misturando azul e branco na razão 2 : 3. Para 15 litros de tinta, quantos litros de azul?', 6,
        [(10, 'Usou a parte do branco somada errado'), (9, 'Calculou o branco'), (5, 'Dividiu 15 por 3'), (7.5, 'Fez a metade')], '2 + 3 = 5 partes; 15 ÷ 5 = 3 litros por parte; azul: 2 × 3 = 6 litros.')
    mat(s, 'bolsa', 'mat-geometria', 'Área de figura composta', 5, 'Um terreno em forma de L é um retângulo de 12 m × 8 m do qual foi retirado um canto de 4 m × 3 m. Qual a área do terreno?', 84,
        [(96, 'Esqueceu de tirar o canto'), (12, 'Calculou só o canto'), (40, 'Calculou o perímetro'), (108, 'Somou o canto')], '12 × 8 = 96; canto: 4 × 3 = 12; área: 96 − 12 = 84 m².', fmt=lambda v: f'{fn(v)} m²')
    # olímpico
    mat(s, 'olimpico', 'mat-raciocinio', 'Inteiros: soma de sequência', 5, 'Quanto é 1 − 2 + 3 − 4 + 5 − 6 + … + 99 − 100?', -50,
        [(50, 'Errou o sinal'), (0, 'Achou que se anulam'), (-100, 'Contou 100 pares'), (5050, 'Somou tudo')], 'Em pares (1 − 2), (3 − 4)… cada par dá −1. São 50 pares: −50.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Equação com balança', 5, '3 maçãs e 2 peras pesam 800 g. 1 maçã e 2 peras pesam 500 g. Quanto pesa uma maçã?', 150,
        [(100, 'Dividiu 300 por 3'), (300, 'Não dividiu por 2'), (175, 'Errou a pera'), (200, 'Chutou')], 'A diferença entre as balanças é 2 maçãs = 300 g. Uma maçã: 150 g.', fmt=lambda v: f'{v} g')
    mat(s, 'olimpico', 'mat-raciocinio', 'Velocidade média', 5, 'Um ciclista vai a 20 km/h e volta pelo mesmo caminho a 30 km/h. Qual a velocidade média na viagem toda?', 24,
        [(25, 'Fez a média simples'), (50, 'Somou'), (10, 'Subtraiu'), (26, 'Errou a conta')], 'Para 60 km na ida: 3 h; na volta: 2 h. 120 km em 5 h = 24 km/h.', fmt=lambda v: f'{v} km/h')
    mat(s, 'olimpico', 'mat-raciocinio', 'Porcentagem de porcentagem', 5, 'Numa turma, 60% são meninas e 25% das meninas usam óculos. Que porcentagem da turma são meninas de óculos?', 15,
        [(25, 'Usou só 25%'), (85, 'Somou'), (35, 'Subtraiu'), (40, 'Calculou os meninos')], '25% de 60% = 0,25 × 60% = 15%.', fmt=lambda v: f'{v}%')
    mat(s, 'olimpico', 'mat-raciocinio', 'Divisibilidade', 5, 'Qual é o menor número de 4 algarismos divisível por 2, 3 e 5 ao mesmo tempo?', 1020,
        [(1000, 'Não é divisível por 3'), (1030, 'Não é divisível por 3'), (1005, 'Não é par'), (1200, 'Não é o menor')], 'Precisa ser múltiplo de 30. 30 × 34 = 1020.')


def mat8():
    s = 8
    mat(s, 'base', 'mat-numeros', 'Notação científica', 3, 'Como se escreve 45.000.000 em notação científica?', '4,5 × 10^7',
        [('4,5 × 10^6', 'Contou uma casa a menos'), ('45 × 10^7', 'Não deixou um só algarismo antes da vírgula'), ('4,5 × 10^8', 'Contou uma casa a mais'), ('0,45 × 10^8', 'Usou mantissa menor que 1')], 'A vírgula anda 7 casas: 4,5 × 10^7.', fmt=str)
    for x in [3, -2]:
        mat(s, 'base', 'mat-algebra', 'Valor numérico', 3, f'Qual é o valor de x² − 4x + 5 para x = {x}?', x * x - 4 * x + 5,
            [(x * x + 4 * x + 5, 'Errou o sinal de −4x'), (-x * x - 4 * x + 5, 'Fez (−x)² com sinal negativo'), (2 * x - 4 * x + 5, 'Fez x² como 2x'), (x * x - 4 * x - 5, 'Trocou o sinal do 5')], f'{x}² − 4·({x}) + 5 = {x * x} − ({4 * x}) + 5 = {x * x - 4 * x + 5}.')
    mat(s, 'base', 'mat-algebra', 'Sistema de equações', 4, 'Se x + y = 10 e x − y = 4, quanto vale x?', 7, [(3, 'Respondeu y'), (14, 'Somou sem dividir'), (6, 'Dividiu errado'), (5, 'Fez a média')], 'Somando: 2x = 14 → x = 7.')
    mat(s, 'base', 'mat-geometria', 'Ângulos internos de polígono', 3, 'Qual é a soma dos ângulos internos de um hexágono?', 720,
        [(1080, 'Usou n × 180'), (360, 'Usou o quadrilátero'), (540, 'Usou o pentágono'), (900, 'Usou o heptágono')], '(n − 2) × 180° = 4 × 180° = 720°.', fmt=lambda v: f'{v}°')
    # bolsa
    mat(s, 'bolsa', 'mat-estatistica', 'Média ponderada', 4, 'Numa escola, a nota final é: prova (peso 3) e trabalho (peso 2). Leo tirou 6 na prova e 9 no trabalho. Qual sua nota final?', 7.2,
        [(7.5, 'Fez a média simples'), (15, 'Somou'), (7.8, 'Inverteu os pesos'), (7, 'Arredondou')], '(6 × 3 + 9 × 2) ÷ 5 = 36 ÷ 5 = 7,2.')
    mat(s, 'bolsa', 'mat-geometria', 'Área do círculo', 4, 'Uma pizza tem 30 cm de diâmetro. Qual a área aproximada (use π = 3,14)?', 706.5,
        [(2826, 'Usou o diâmetro como raio'), (94.2, 'Calculou o comprimento'), (47.1, 'Usou π × raio'), (900, 'Fez o quadrado')], 'Raio = 15 cm. Área = 3,14 × 15² = 3,14 × 225 = 706,5 cm².', fmt=lambda v: f'{fn(v)} cm²')
    mat(s, 'bolsa', 'mat-algebra', 'Sistema em problema', 5, 'Num estacionamento há carros e motos: 30 veículos e 100 rodas. Quantas motos há?', 10,
        [(20, 'Respondeu os carros'), (15, 'Dividiu ao meio'), (25, 'Dividiu 100 por 4'), (50, 'Dividiu 100 por 2')], 'c + m = 30 e 4c + 2m = 100 → 2c = 40 → c = 20, m = 10.')
    mat(s, 'bolsa', 'mat-porcentagem', 'Porcentagem acumulada', 5, 'O preço de um produto subiu 20% em janeiro e mais 20% em fevereiro. Qual foi o aumento total?', 44,
        [(40, 'Somou as porcentagens'), (20, 'Contou um mês só'), (42, 'Errou a conta'), (48, 'Errou a conta')], '100 → 120 → 144: aumento de 44%.', fmt=lambda v: f'{v}%')
    mat(s, 'bolsa', 'mat-proporcao', 'Proporção e unidades', 4, 'Uma torneira vaza 1 gota por segundo. 20 gotas fazem 1 mL. Quantos litros vazam em 1 dia?', 4.32,
        [(43.2, 'Errou a vírgula'), (86.4, 'Não dividiu por 20'), (0.432, 'Errou a vírgula'), (1.44, 'Usou 8 horas')], '1 dia = 86.400 s → 86.400 gotas ÷ 20 = 4.320 mL = 4,32 L.', fmt=lambda v: f'{fn(v)} L')
    # olímpico
    mat(s, 'olimpico', 'mat-raciocinio', 'Produto notável', 5, 'Quanto é 1001² − 999²?', 4000,
        [(2, 'Subtraiu as bases'), (4, 'Achou que é (1001 − 999)²'), (2000, 'Esqueceu um fator'), (0, 'Achou que se anulam')], 'a² − b² = (a + b)(a − b) = 2000 × 2 = 4000.', 'Use a² − b² = (a + b)(a − b).')
    mat(s, 'olimpico', 'mat-raciocinio', 'Último algarismo', 5, 'Qual é o algarismo das unidades de 7^2026?', 9,
        [(7, 'Achou que sempre termina em 7'), (3, 'Errou o ciclo'), (1, 'Errou o ciclo'), (49, 'Fez 7²')], 'Ciclo das unidades de 7: 7, 9, 3, 1. 2026 deixa resto 2 por 4 → 9.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Diagonais', 5, 'Quantas diagonais tem um polígono de 10 lados?', 35,
        [(45, 'Contou também os lados'), (70, 'Contou cada diagonal duas vezes'), (10, 'Respondeu os lados'), (20, 'Errou a fórmula')], 'n(n − 3)/2 = 10 × 7 ÷ 2 = 35.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Potências de 2', 5, 'Quanto é 2^10 + 2^10?', '2^11',
        [('2^20', 'Somou os expoentes'), ('4^10', 'Somou as bases'), ('4^20', 'Somou tudo'), ('2^100', 'Multiplicou os expoentes')], '2^10 + 2^10 = 2 × 2^10 = 2^11.', fmt=str)
    mat(s, 'olimpico', 'mat-raciocinio', 'Média e soma', 5, 'A média de 5 números é 12. Retirando um deles, a média passa a 10. Qual número foi retirado?', 20,
        [(2, 'Subtraiu as médias'), (12, 'Achou que era a média'), (10, 'Respondeu a nova média'), (22, 'Errou a soma')], 'Soma: 5 × 12 = 60. Sem ele: 4 × 10 = 40. Retirado: 20.')


def mat9():
    s = 9
    for r1, r2 in [(2, 5), (-3, 4)]:
        b, c = -(r1 + r2), r1 * r2
        eq = f'x² {"−" if b < 0 else "+"} {"" if abs(b) == 1 else abs(b)}x {"−" if c < 0 else "+"} {abs(c)} = 0'
        mat(s, 'base', 'mat-algebra', 'Equação do 2º grau', 4, f'Quais são as raízes de {eq}?', f'{r1} e {r2}',
            [(f'{-r1} e {-r2}', 'Trocou os sinais das raízes'), (f'{r1} e {-r2}', 'Errou um sinal'), (f'{abs(b)} e {abs(c)}', 'Usou os coeficientes'), (f'{r1 + 1} e {r2 - 1}', 'Errou a fatoração')],
            f'Soma das raízes = {r1 + r2}, produto = {r1 * r2}: as raízes são {r1} e {r2}.', fmt=str)
    for a, b in [(6, 8), (5, 12)]:
        c = int(math.hypot(a, b))
        mat(s, 'base', 'mat-geometria', 'Teorema de Pitágoras', 3, f'Os catetos de um triângulo retângulo medem {a} cm e {b} cm. Quanto mede a hipotenusa?', c,
            [(a + b, 'Somou os catetos'), (a * b // 2, 'Calculou a área'), (c + 1, 'Errou a raiz'), (a * a + b * b, 'Esqueceu a raiz')], f'h² = {a}² + {b}² = {a * a + b * b} → h = {c} cm.', fmt=lambda v: f'{v} cm')
    mat(s, 'base', 'mat-algebra', 'Função afim', 3, 'Dada f(x) = 3x − 7, quanto vale f(5)?', 8, [(22, 'Somou o 7'), (15, 'Esqueceu o −7'), (-8, 'Errou o sinal'), (1, 'Fez 5 − 7 × 3 errado')], 'f(5) = 3 × 5 − 7 = 8.')
    # bolsa
    mat(s, 'bolsa', 'mat-financeira', 'Juros simples', 4, 'Um empréstimo de R$ 2.000,00 a juros simples de 3% ao mês. Quanto se paga de juros em 6 meses?', 360.0,
        [(60.0, 'Calculou um mês só'), (2360.0, 'Respondeu o montante'), (180.0, 'Usou 3 meses'), (388.1, 'Usou juros compostos aproximados')], '3% de 2.000 = 60 por mês; × 6 = R$ 360,00.', fmt=reais)
    mat(s, 'bolsa', 'mat-probabilidade', 'Probabilidade', 4, 'Uma urna tem 5 bolas azuis, 3 vermelhas e 2 verdes. Sorteando uma, qual a probabilidade de NÃO ser azul?', '1/2',
        [('1/5', 'Calculou só verdes'), ('3/10', 'Calculou só vermelhas'), ('3/5', 'Dividiu não azuis pelas azuis'), ('2/3', 'Esqueceu as verdes')], 'Não azuis: 5 de 10 = 1/2.', fmt=str)
    mat(s, 'bolsa', 'mat-geometria', 'Pitágoras em situação', 5, 'Uma escada de 5 m está apoiada num muro, com o pé a 3 m do muro. A que altura ela toca o muro?', 4,
        [(8, 'Somou'), (2, 'Subtraiu'), (34 ** 0.5, 'Somou os quadrados'), (5, 'Usou o comprimento')], 'h² + 3² = 5² → h² = 16 → h = 4 m.', fmt=lambda v: f'{fn(round(v, 2))} m')
    mat(s, 'bolsa', 'mat-algebra', 'Função em problema', 4, 'Uma corrida de táxi custa R$ 5,00 de bandeirada mais R$ 2,50 por km. Quantos km rodou quem pagou R$ 40,00?', 14,
        [(16, 'Esqueceu a bandeirada'), (18, 'Somou a bandeirada'), (35, 'Não dividiu'), (12, 'Errou a divisão')], '40 − 5 = 35; 35 ÷ 2,50 = 14 km.', fmt=lambda v: f'{v} km')
    mat(s, 'bolsa', 'mat-geometria', 'Semelhança', 5, 'Um poste projeta sombra de 6 m no mesmo instante em que uma vara de 1,5 m projeta sombra de 2 m. Qual a altura do poste?', 4.5,
        [(8, 'Inverteu a razão'), (5.5, 'Somou as diferenças'), (3, 'Dividiu a sombra por 2'), (9, 'Multiplicou errado')], 'Razão altura/sombra: 1,5/2 = 0,75. Poste: 0,75 × 6 = 4,5 m.', fmt=lambda v: f'{fn(v)} m')
    # olímpico
    mat(s, 'olimpico', 'mat-raciocinio', 'Soma e produto', 5, 'Dois números somam 10 e o produto deles é 21. Quanto é a soma dos quadrados deles?', 58,
        [(100, 'Elevou a soma'), (42, 'Dobrou o produto'), (79, 'Somou 100 − 21'), (121, 'Errou')], 'a² + b² = (a + b)² − 2ab = 100 − 42 = 58.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Comissões', 5, 'De 6 alunos, quantas duplas diferentes podem ser formadas?', 15,
        [(30, 'Contou a ordem'), (12, 'Fez 6 × 2'), (36, 'Fez 6 × 6'), (6, 'Contou alunos')], '6 × 5 ÷ 2 = 15 (a ordem não importa).')
    mat(s, 'olimpico', 'mat-raciocinio', 'Raiz e potência', 5, 'Quanto é √(16 + 9) − √16 − √9?', -2,
        [(0, 'Achou que a raiz se distribui'), (2, 'Errou o sinal'), (12, 'Somou as raízes'), (-7, 'Subtraiu tudo')], '√25 − 4 − 3 = 5 − 7 = −2.')
    mat(s, 'olimpico', 'mat-raciocinio', 'Probabilidade com dois dados', 5, 'Lançando dois dados comuns, qual a probabilidade de a soma ser 7?', '1/6',
        [('1/12', 'Contou só metade dos pares'), ('7/36', 'Usou o 7 no numerador'), ('1/11', 'Contou as somas possíveis'), ('1/36', 'Contou um par só')], 'São 6 pares em 36: 6/36 = 1/6.', fmt=str)
    mat(s, 'olimpico', 'mat-raciocinio', 'Sequência e termo geral', 5, 'Na sequência 3, 7, 11, 15, …, qual é o 50º termo?', 199,
        [(200, 'Usou 4 × 50'), (203, 'Contou um termo a mais'), (195, 'Contou um termo a menos'), (153, 'Somou 3 × 50')], 'aₙ = 3 + (n − 1) × 4 = 3 + 196 = 199.')


# ===================================================================== LÓGICA
def log(serie, colecao, hab, dif, enun, correto, cands, expl, dica=None, fmt=fn):
    montar(novo_id(f'l2-log{serie}'), serie, colecao, 'logica', 'log-raciocinio', hab, dif, enun, fmt(correto),
           distratores(correto, cands, perto(correto), fmt), expl, dica)


DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
NOMES = ['Ana', 'Bruno', 'Caio', 'Duda', 'Enzo', 'Flora']


def logica(serie):
    s = serie
    dif_base = 3 if s <= 5 else 4
    # sequências (base): regras crescem com a série
    seqs = {
        4: [([5, 9, 13, 17], 21, 'soma 4'), ([3, 6, 12, 24], 48, 'dobra')],
        5: [([2, 5, 11, 23], 47, 'dobra e soma 1'), ([1, 4, 9, 16], 25, 'quadrados')],
        6: [([1, 1, 2, 3, 5, 8], 13, 'cada termo é a soma dos dois anteriores'), ([2, 6, 12, 20, 30], 42, 'somas 4, 6, 8, 10, 12')],
        7: [([1, 8, 27, 64], 125, 'cubos'), ([4, 7, 13, 25, 49], 97, 'dobra e diminui 1')],
        8: [([2, 3, 5, 7, 11, 13], 17, 'números primos'), ([1, 3, 2, 6, 3, 9, 4], 12, 'intercaladas: 1,2,3,4… e 3,6,9…')],
        9: [([1, 2, 6, 24, 120], 720, 'multiplica por 2, 3, 4, 5, 6'), ([0, 3, 8, 15, 24], 35, 'n² − 1')],
    }[s]
    for seq, prox, regra in seqs:
        log(s, 'base', 'Sequências numéricas', dif_base, f'Qual número vem a seguir? {", ".join(map(str, seq))}, …', prox,
            [(seq[-1] + (seq[-1] - seq[-2]), 'Repetiu a última diferença'), (seq[-1] * 2, 'Dobrou'), (prox + 1, 'Errou a conta'), (prox - 2, 'Errou a regra')], f'Regra: {regra}. Próximo: {prox}.')
    n = {4: 15, 5: 45, 6: 100, 7: 200, 8: 365, 9: 1000}[s]
    hoje = rng.randint(0, 6)
    log(s, 'base', 'Calendário', dif_base, f'Hoje é {DIAS[hoje]}. Que dia da semana será daqui a {n} dias?', DIAS[(hoje + n) % 7],
        [(DIAS[(hoje + n + 1) % 7], 'Contou um dia a mais'), (DIAS[(hoje + n - 1) % 7], 'Contou um dia a menos'), (DIAS[hoje], 'Achou que volta ao mesmo dia'), (DIAS[(hoje + n % 10) % 7], 'Usou só o último algarismo'), (DIAS[(hoje + n + 2) % 7], 'Errou o resto da divisão'), (DIAS[(hoje + n - 2) % 7], 'Errou o resto da divisão')],
        f'A semana repete a cada 7 dias. {n} ÷ 7 deixa resto {n % 7}: ande {n % 7} dias a partir de {DIAS[hoje]}.', fmt=str)
    # contagem (bolsa)
    cont = {
        4: ('Lia tem 3 blusas e 4 saias. Quantas combinações diferentes de blusa e saia ela pode montar?', 12, [(7, 'Somou'), (3, 'Contou só blusas'), (4, 'Contou só saias'), (24, 'Dobrou')], '3 × 4 = 12.'),
        5: ('Um lanche tem 3 tipos de pão, 4 recheios e 2 sucos. Quantos lanches diferentes (1 de cada) podem ser montados?', 24, [(9, 'Somou'), (12, 'Esqueceu o suco'), (8, 'Esqueceu o pão'), (48, 'Dobrou')], '3 × 4 × 2 = 24.'),
        6: ('Numa corrida com 6 atletas, de quantas maneiras podem ficar ouro, prata e bronze?', 120, [(18, 'Fez 6 × 3'), (20, 'Não contou a ordem'), (216, 'Permitiu repetir atletas'), (720, 'Ordenou todos')], '6 × 5 × 4 = 120.'),
        7: ('Quantas senhas de 3 algarismos diferentes podem ser formadas com os algarismos de 0 a 9?', 720, [(1000, 'Permitiu repetir'), (120, 'Não contou a ordem'), (30, 'Somou'), (504, 'Tirou o zero')], '10 × 9 × 8 = 720.'),
        8: ('Numa reunião, 12 pessoas se cumprimentaram, cada par uma única vez. Quantos apertos de mão?', 66, [(132, 'Contou cada aperto duas vezes'), (144, 'Fez 12 × 12'), (24, 'Fez 12 × 2'), (11, 'Contou os de uma pessoa')], '12 × 11 ÷ 2 = 66.'),
        9: ('De 8 alunos, quantas comissões de 3 podem ser formadas?', 56, [(336, 'Contou a ordem'), (24, 'Fez 8 × 3'), (512, 'Permitiu repetir'), (28, 'Fez comissões de 2')], '8 × 7 × 6 ÷ (3 × 2 × 1) = 56.'),
    }[s]
    log(s, 'bolsa', 'Contagem', dif_base + 1, cont[0], cont[1], cont[2], cont[3])
    # ordenação (bolsa)
    pessoas = rng.sample(NOMES, 4)
    # "mais alto/baixo" (não "maior/menor", que a criança pode ler como "mais velho"), concordando com o nome.
    FEM = {'Ana', 'Flora', 'Duda', 'Bia', 'Lia', 'Nina', 'Maia', 'Rita', 'Clara', 'Júlia', 'Luana', 'Sofia'}
    alt = lambda n, adj: adj[:-1] + 'a' if n in FEM else adj
    pistas = f'{pessoas[0]} é {alt(pessoas[0], "mais alto")} que {pessoas[1]}. {pessoas[2]} é {alt(pessoas[2], "mais baixo")} que {pessoas[1]}. {pessoas[3]} é {alt(pessoas[3], "mais alto")} que {pessoas[0]}.'
    log(s, 'bolsa', 'Ordenação', dif_base, f'{pistas} Quem é a pessoa mais baixa?', pessoas[2],
        [(pessoas[1], 'Parou na segunda pista'), (pessoas[0], 'Inverteu a primeira pista'), (pessoas[3], 'Inverteu o sentido'), ('Não dá para saber', 'Não juntou as pistas')],
        f'Ordem do mais alto ao mais baixo: {pessoas[3]}, {pessoas[0]}, {pessoas[1]}, {pessoas[2]}.', fmt=str)
    # verdade e mentira (bolsa)
    a_, b_, c_ = [('Ana', 'Bruno', 'Caio'), ('Lia', 'Theo', 'Davi'), ('Nina', 'Igor', 'Rafa'), ('Bia', 'Leo', 'Téo'), ('Clara', 'Hugo', 'Gabi'), ('Malu', 'Otto', 'Iara')][s - 4]
    objeto = ['o vaso', 'a janela', 'o copo', 'o abajur', 'o relógio', 'a luminária'][s - 4]
    log(s, 'bolsa', 'Verdade e mentira', dif_base + 1,
        f'Um dos três quebrou {objeto}. {a_} diz: "Foi {"o" if b_ in ("Bruno", "Theo", "Igor", "Leo", "Hugo", "Otto") else "a"} {b_}". {b_} diz: "Não fui eu". {c_} diz: "Não fui eu". Só um deles fala a verdade. Quem quebrou?', c_,
        [(a_, 'Não testou cada hipótese'), (b_, f'Acreditou em {a_}'), ('Ninguém', 'Achou contradição'), ('Não dá para saber', 'Não testou as hipóteses')],
        f'Teste cada um: se fosse {b_}, {a_} e {c_} diriam a verdade (2). Se fosse {a_}, {b_} e {c_} diriam a verdade (2). Se fosse {c_}, só {b_} diz a verdade (1). Foi {c_}.', fmt=str)
    # casa dos pombos (olímpico)
    cores = {4: 3, 5: 4, 6: 5, 7: 4, 8: 6, 9: 5}[s]
    k = 2 if s <= 6 else 3
    garantia = cores * (k - 1) + 1
    log(s, 'olimpico', 'Princípio da casa dos pombos', 5,
        f'Numa gaveta escura há meias de {cores} cores, muitas de cada. Quantas meias é preciso tirar, no mínimo, para ter certeza de pegar {k} da mesma cor?', garantia,
        [(cores, 'Pegou uma de cada cor'), (k, 'Pensou na melhor sorte'), (cores * k, 'Multiplicou'), (garantia + cores, 'Pegou demais')],
        f'No pior caso, tira {k - 1} de cada cor ({cores * (k - 1)} meias). A próxima garante {k} iguais: {garantia}.', 'Pense no pior azar possível.')
    # relógio / padrão (olímpico)
    if s >= 7:
        h = {7: 3, 8: 8, 9: 4}[s]
        ang = abs(30 * h - 165)  # h:30
        ang = min(ang, 360 - ang)
        log(s, 'olimpico', 'Ângulo dos ponteiros', 5, f'Qual o menor ângulo entre os ponteiros de um relógio às {h}h30?', ang,
            [(abs(30 * h - 180), 'Esqueceu que o ponteiro das horas anda'), (30 * h, 'Usou só a hora'), (ang + 15, 'Errou o meio passo'), (180, 'Achou que é raso')],
            f'Minutos no 6 (180°). Horas: {h} × 30° + 15° = {30 * h + 15}°. Diferença: {ang}°.', fmt=lambda v: f'{v}°')
    else:
        n = {4: 10, 5: 20, 6: 50}[s]
        log(s, 'olimpico', 'Padrões', 5, f'Escrevendo os números de 1 a {n}, quantas vezes se escreve o algarismo 1?', sum(str(x).count('1') for x in range(1, n + 1)),
            [(n // 10 + 1, 'Contou só as dezenas'), (sum(1 for x in range(1, n + 1) if '1' in str(x)), 'Contou números, não algarismos (11 tem dois 1)'), (n // 10, 'Contou pouco'), (n // 5, 'Estimou')],
            'Conte nas unidades e nas dezenas separadamente (o 11 tem dois algarismos 1).')
    # completar até 15 com problemas extras por série
    extras = {
        4: [('olimpico', 'Se 3 gatos pegam 3 ratos em 3 minutos, quantos gatos pegam 6 ratos em 6 minutos?', 3, [(6, 'Dobrou sem pensar no tempo'), (12, 'Dobrou duas vezes'), (9, 'Somou'), (1, 'Dividiu')], 'Cada gato pega 1 rato a cada 3 min; em 6 min, 2 ratos. 6 ratos ÷ 2 = 3 gatos.'),
            ('bolsa', 'Uma lesma sobe 3 m de dia e escorrega 2 m à noite. Em quantos dias sai de um poço de 10 m?', 8, [(10, 'Contou 1 m por dia até o fim'), (5, 'Dividiu 10 por 2'), (9, 'Esqueceu que no último dia não escorrega'), (7, 'Contou um dia a menos')], 'Ao fim de 7 dias está a 7 m; no 8º dia sobe 3 m e chega a 10 m.'),
            ('base', 'Quantos triângulos há numa figura formada por um triângulo com uma linha do vértice de cima até o meio da base?', 3, [(2, 'Esqueceu o grande'), (4, 'Contou demais'), (1, 'Contou só o grande'), (6, 'Contou os lados')], 'Os dois pequenos e o grande: 3.'),
            ('olimpico', 'Um relógio atrasa 2 minutos por hora. Foi acertado ao meio-dia. Que horas marcará quando forem 18h de verdade?', '17h48', [('17h58', 'Atrasou só uma vez'), ('18h12', 'Adiantou'), ('17h50', 'Errou a conta'), ('18h00', 'Ignorou o atraso')], '6 horas × 2 min = 12 min de atraso: 17h48.'),
            ('base', 'Qual figura completa: ○ □ △ ○ □ △ ○ □ ?', '△', [('○', 'Repetiu o primeiro'), ('□', 'Repetiu o último'), ('◇', 'Inventou figura'), ('☆', 'Inventou figura')], 'O padrão repete de 3 em 3: ○ □ △.')],
        5: [('olimpico', 'Numa fila, Ana é a 7ª da frente para trás e a 12ª de trás para a frente. Quantas pessoas há na fila?', 18, [(19, 'Contou Ana duas vezes'), (17, 'Esqueceu a Ana'), (5, 'Subtraiu'), (84, 'Multiplicou')], '6 antes + Ana + 11 depois = 18.'),
            ('bolsa', 'Três amigos dividem uma conta: Leo pagou o dobro de Mia, e Mia pagou o triplo de Noé. A conta foi R$ 100,00. Quanto Noé pagou?', 10, [(30, 'Calculou a Mia'), (60, 'Calculou o Leo'), (33, 'Dividiu por 3'), (20, 'Errou as partes')], 'Noé 1 parte, Mia 3, Leo 6: 10 partes = 100 → 1 parte = 10.'),
            ('base', 'Em código, A = 1, B = 2, C = 3… Quanto vale a palavra BOLA somando as letras?', 2 + 15 + 12 + 1, [(4, 'Contou letras'), (31, 'Errou a conta'), (29, 'Errou o L'), (32, 'Errou o O')], 'B 2 + O 15 + L 12 + A 1 = 30.'),
            ('olimpico', 'Quantos números de três algarismos usam só os algarismos 1, 2 e 3, sem repetir?', 6, [(27, 'Permitiu repetir'), (3, 'Contou os algarismos'), (9, 'Fez 3 × 3'), (12, 'Errou')], '3 × 2 × 1 = 6.'),
            ('base', 'Uma torneira enche um balde em 6 minutos. Duas torneiras iguais, juntas, enchem em quanto tempo?', '3 minutos', [('12 minutos', 'Dobrou'), ('6 minutos', 'Ignorou a segunda'), ('2 minutos', 'Dividiu por 3'), ('4 minutos', 'Errou')], 'Com o dobro de água por minuto, o tempo cai pela metade: 3 minutos.')],
        6: [('olimpico', 'Um número de dois algarismos, somado ao número com os algarismos trocados, dá 99. A diferença entre os algarismos é 3. Qual o maior número possível?', 63, [(36, 'Deu o menor'), (96, 'Soma não dá 99'), (72, 'Diferença não é 3'), (54, 'Diferença não é 3')], 'Se soma dos algarismos é 9 (11 × 9 = 99) e diferença 3: 6 e 3 → 63.'),
            ('bolsa', 'Uma pilha tem 5 caixas: cada uma pesa 2 kg a mais que a de cima. A de cima pesa 3 kg. Quanto pesa a pilha?', 35, [(15, 'Usou 3 kg em todas'), (25, 'Esqueceu os acréscimos'), (11, 'Deu a de baixo'), (40, 'Errou')], '3 + 5 + 7 + 9 + 11 = 35 kg.'),
            ('base', 'Complete a analogia: 2 está para 8 assim como 3 está para…', 27, [(12, 'Pensou em × 4'), (9, 'Elevou ao quadrado'), (6, 'Dobrou'), (24, 'Errou')], '2³ = 8 e 3³ = 27.'),
            ('olimpico', 'Quantos quadrados perfeitos há entre 1 e 200?', 14, [(13, 'Esqueceu o 1'), (15, 'Incluiu 225'), (10, 'Estimou'), (20, 'Errou')], '1², 2², …, 14² = 196 ≤ 200 < 225 = 15². São 14.'),
            ('base', 'Se todo gato é felino e Mimi é um gato, então:', 'Mimi é felino', [('Todo felino é gato', 'Inverteu a frase'), ('Mimi não é felino', 'Negou a conclusão'), ('Nada se pode concluir', 'Não aplicou a regra'), ('Todo felino se chama Mimi', 'Generalizou')], 'Mimi está entre os gatos, e todos os gatos estão entre os felinos.')],
        7: [('olimpico', 'Um caracol dá 3 voltas numa pista circular em 12 minutos. Quantas voltas dá em 1 hora e meia?', 22.5, [(18, 'Usou 1h12'), (30, 'Usou 2 horas'), (15, 'Usou 1 hora'), (27, 'Errou')], '1 volta a cada 4 min; 90 min ÷ 4 = 22,5 voltas.'),
            ('bolsa', 'Ana, Bia e Clara têm profissões diferentes: médica, professora e engenheira. Ana não é médica. Bia não é professora nem médica. Qual a profissão de Clara?', 'Médica', [('Professora', 'Inverteu'), ('Engenheira', 'Atribuiu a de Bia'), ('Não dá para saber', 'Não usou a eliminação'), ('Médica ou professora', 'Parou no meio')], 'Bia é engenheira. Ana, que não é médica, é professora. Clara é médica.'),
            ('base', 'Qual o próximo termo: A, C, F, J, …?', 'O', [('M', 'Somou 3'), ('N', 'Somou 4'), ('P', 'Somou 6'), ('K', 'Somou 1')], 'Pula 1, 2, 3, 4 letras: J + 5 = O.'),
            ('olimpico', 'O produto das idades de três irmãos é 36 e a soma é 13. Quais são as idades se o mais velho é único?', '2, 2 e 9', [('1, 6 e 6', 'Dois mais velhos iguais'), ('3, 3 e 4', 'Soma dá 10'), ('1, 4 e 9', 'Produto dá 36, soma 14'), ('2, 3 e 6', 'Soma dá 11')], 'Com soma 13: (2,2,9) e (1,6,6). Como há um mais velho único: 2, 2 e 9.'),
            ('base', 'Se chove, a rua molha. A rua não está molhada. Então:', 'Não choveu', [('Choveu', 'Ignorou a regra'), ('Pode ter chovido', 'Não aplicou a contrapositiva'), ('A rua vai molhar', 'Inventou'), ('Nada se conclui', 'Não aplicou a regra')], 'Se chovesse, a rua estaria molhada. Como não está, não choveu.')],
        8: [('olimpico', 'Numa sala, cada pessoa conhece exatamente 3 outras. Há 10 pessoas. Quantos pares de conhecidos existem?', 15, [(30, 'Contou cada par duas vezes'), (10, 'Contou pessoas'), (13, 'Somou'), (45, 'Contou todos os pares')], '10 × 3 ÷ 2 = 15.'),
            ('bolsa', 'Uma prova tem 20 questões: +5 por acerto, −2 por erro. Leo respondeu todas e fez 58 pontos. Quantas acertou?', 14, [(12, 'Errou a conta'), (6, 'Contou os erros'), (16, 'Errou o sistema'), (11, 'Dividiu 58 por 5')], 'a + e = 20; 5a − 2e = 58 → 7a = 98 → a = 14.'),
            ('base', 'Quantos anagramas tem a palavra AMOR?', 24, [(4, 'Contou letras'), (16, 'Fez 4 × 4'), (12, 'Dividiu por 2'), (256, 'Permitiu repetir')], '4! = 4 × 3 × 2 × 1 = 24.'),
            ('olimpico', 'Qual a probabilidade de tirar duas caras em dois lançamentos de moeda?', '1/4', [('1/2', 'Considerou um lançamento'), ('1/3', 'Contou 3 resultados'), ('2/4', 'Contou cara-coroa'), ('1', 'Achou certo')], 'CC, CK, KC, KK: 1 em 4.'),
            ('base', 'Negação de "Todos os alunos passaram":', 'Algum aluno não passou', [('Nenhum aluno passou', 'Negou forte demais'), ('Todos os alunos não passaram', 'Mesma coisa que nenhum'), ('Alguns alunos passaram', 'Não é negação'), ('Todos passaram', 'Repetiu')], 'Basta um aluno não ter passado para a frase ser falsa.')],
        9: [('olimpico', 'Quantos números de 1 a 1000 não são divisíveis nem por 2 nem por 5?', 400, [(500, 'Tirou só os pares'), (300, 'Tirou os múltiplos de 10 duas vezes'), (600, 'Contou o contrário'), (450, 'Errou')], 'Divisíveis por 2: 500; por 5: 200; por 10: 100. Por 2 ou 5: 600. Restam 400.'),
            ('bolsa', 'Uma caixa tem bolas numeradas de 1 a 20. Sorteando uma, qual a probabilidade de ser múltiplo de 3 ou de 4?', '1/2', [('11/20', 'Contou o 12 duas vezes'), ('6/20', 'Só múltiplos de 3'), ('5/20', 'Só de 4'), ('1/3', 'Usou 1/3')], 'Múltiplos de 3: 6; de 4: 5; de 12: 1. Total 10 de 20 = 1/2.'),
            ('base', 'Quantos anagramas tem a palavra BANANA?', 60, [(720, 'Ignorou letras repetidas'), (120, 'Descontou só os N'), (36, 'Errou'), (6, 'Contou letras')], '6! ÷ (3! × 2!) = 720 ÷ 12 = 60.'),
            ('olimpico', 'Em 7 lançamentos de moeda, qual o número de resultados com exatamente 2 caras?', 21, [(14, 'Fez 7 × 2'), (42, 'Contou a ordem'), (128, 'Contou todos'), (7, 'Contou só uma cara')], 'C(7, 2) = 7 × 6 ÷ 2 = 21.'),
            ('base', '"Se estudo, passo." Qual frase é equivalente?', 'Se não passei, não estudei', [('Se passei, estudei', 'É a recíproca'), ('Se não estudo, não passo', 'É a contrária'), ('Estudo e não passo', 'É a negação'), ('Passo e não estudo', 'Inventou')], 'A contrapositiva (se não B, então não A) é equivalente.')],
    }[s]
    for col, enun, correto, cands, expl in extras:
        dif = 5 if col == 'olimpico' else dif_base + (1 if col == 'bolsa' else 0)
        log(s, col, 'Raciocínio lógico', min(dif, 5), enun, correto, cands, expl, fmt=(str if isinstance(correto, str) else fn))


def main():
    for f in (mat4, mat5, mat6, mat7, mat8, mat9):
        f()
    for serie in range(4, 10):
        logica(serie)
    from lote2_portugues import gerar_portugues
    gerar_portugues(montar, novo_id, rng)
    destino = os.path.join(os.path.dirname(__file__), '..', '..', 'app', 'src', 'dados', 'questoes-lote2.json')
    with open(destino, 'w', encoding='utf-8') as fh:
        json.dump(QUESTOES, fh, ensure_ascii=False, indent=1)
    from collections import Counter
    c = Counter((q['serie'], q['trilha']) for q in QUESTOES)
    for k in sorted(c):
        print(k, c[k])
    print('total', len(QUESTOES))


if __name__ == '__main__':
    main()
