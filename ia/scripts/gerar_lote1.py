"""Gera o lote 1 do banco de questões.

Matemática e Lógica: respostas CALCULADAS por código; distratores derivados de erros típicos.
Português: itens escritos à mão (abaixo), conferidos por revisão às cegas.
Saída: questoes-lote1.json no formato de conteudo/questoes/schema-questao.json.
"""
import json
import random
import sys

rng = random.Random(20261110)
LETRAS = ['A', 'B', 'C', 'D', 'E']
QUESTOES = []


def pontos(d):
    return 3 if d <= 2 else (4 if d == 3 else 5)


def montar(id_, trilha, bloco, hab, nivel, dif, enunciado, correta, erradas, explicacao, dica=None,
           formato='multipla_escolha', figura=None, texto_apoio=None, figs=None):
    """correta: texto; erradas: lista de (texto, erro_tipico). figs: dict texto -> figura (alternativas visuais)."""
    assert len(erradas) == 4, (id_, erradas)
    textos = [correta] + [e[0] for e in erradas]
    assert len(set(textos)) == 5, (id_, textos)
    itens = [(correta, None)] + list(erradas)
    rng.shuffle(itens)
    alternativas = []
    gabarito = None
    for letra, (txt, erro) in zip(LETRAS, itens):
        alt = {'letra': letra, 'texto': txt, 'erro_tipico': erro}
        if figs:
            alt['figura'] = figs[txt]
        alternativas.append(alt)
        if erro is None:
            gabarito = letra
    q = {
        'id': id_, 'trilha': trilha, 'bloco': bloco, 'habilidade': hab, 'nivel': nivel,
        'dificuldade': dif, 'pontos': pontos(dif), 'formato': formato, 'positivo_unidade': None,
        'texto_apoio': texto_apoio, 'enunciado': enunciado, 'figura': figura,
        'alternativas': alternativas, 'gabarito': gabarito, 'explicacao': explicacao,
        'dica': dica, 'pilula_id': None, 'revisao': {'status': 'gerada'},
    }
    assert len(enunciado) <= 280, id_
    QUESTOES.append(q)


def completar(correto, candidatos, extras):
    """Remove repetidos/inválidos e completa com extras até 4 distratores."""
    vistos = {str(correto)}
    saida = []
    for valor, erro in candidatos + extras:
        if valor is None or str(valor) in vistos:
            continue
        if isinstance(valor, int) and valor < 0:
            continue
        vistos.add(str(valor))
        saida.append((str(valor), erro))
        if len(saida) == 4:
            break
    assert len(saida) == 4, (correto, candidatos)
    return saida


def digitos(n, casas=3):
    return [(n // 10 ** i) % 10 for i in range(casas)]  # unidades, dezenas, centenas


# ---------------------------------------------------------------- MATEMÁTICA
HAB_ADD = 'Adição e subtração com reagrupamento'
CONTEXTOS_ADD = [
    'Uma escola tem {a} alunos de manhã e {b} à tarde. Quantos alunos ela tem ao todo?',
    'Num sítio havia {a} galinhas e chegaram mais {b}. Quantas galinhas há agora?',
    'Lia leu {a} páginas em março e {b} em abril. Quantas páginas ela leu nos dois meses?',
    'Quanto é {a} + {b}?',
    'Um caminhão levou {a} sacas de milho de manhã e {b} à tarde. Quantas sacas levou no dia?',
]


def sem_vai_um(a, b):
    da, db = digitos(a), digitos(b)
    return sum(((x + y) % 10) * 10 ** i for i, (x, y) in enumerate(zip(da, db)))


def esquece_vai_um(a, b, casa):
    """Soma com 'vai um', mas esquece o da casa indicada (0 = unidades, 1 = dezenas)."""
    da, db = digitos(a), digitos(b)
    total, carry = 0, 0
    for i in range(3):
        s = da[i] + db[i] + carry
        total += (s % 10) * 10 ** i
        carry = 0 if i == casa else s // 10
    return total + carry * 1000


n = 0
while n < 10:
    a, b = rng.randint(120, 689), rng.randint(105, 299)
    if a + b >= 1000 or (a % 10 + b % 10) < 10:
        continue
    c = a + b
    tens_carry = (a // 10 % 10 + b // 10 % 10 + 1) >= 10
    dif = 3 if tens_carry else 2
    erradas = completar(c, [
        (sem_vai_um(a, b), 'Não fez nenhum "vai um"'),
        (esquece_vai_um(a, b, 0), 'Esqueceu o "vai um" das unidades'),
        (esquece_vai_um(a, b, 1) if tens_carry else None, 'Esqueceu o "vai um" das dezenas'),
        (a - b if a > b else None, 'Fez subtração em vez de adição'),
    ], [(c + 100, 'Errou a soma das centenas'), (c - 10, 'Errou a soma das dezenas'), (c + 1, 'Errou a soma das unidades')])
    n += 1
    u = a % 10 + b % 10
    explic = f'Somando as unidades: {a % 10} + {b % 10} = {u}, fica {u % 10} e vai 1. Continue pelas dezenas e centenas lembrando do "vai um". Resultado: {c}.'
    montar(f'mat-add-{n:04d}', 'matematica', 'mat-numeros', HAB_ADD, 'base', dif,
           CONTEXTOS_ADD[n % len(CONTEXTOS_ADD)].format(a=a, b=b), str(c), erradas, explic,
           'Comece pelas unidades e não esqueça o "vai um".')

CONTEXTOS_SUB = [
    'Quanto é {a} − {b}?',
    'Uma biblioteca tinha {a} livros e emprestou {b}. Quantos livros ficaram?',
    'Pedro juntou {a} figurinhas e deu {b} para o primo. Com quantas ficou?',
]
n = 0
while n < 10:
    a, b = rng.randint(310, 980), rng.randint(105, 299)
    if a - b < 100 or (a % 10) >= (b % 10) or (a // 10) % 10 == 0:
        continue
    c = a - b
    da, db = digitos(a), digitos(b)
    abs_dig = sum(abs(x - y) * 10 ** i for i, (x, y) in enumerate(zip(da, db)))
    dif = 3 if (da[1] - 1) < db[1] else 2
    erradas = completar(c, [
        (abs_dig, 'Tirou o menor do maior em cada casa, sem "emprestar"'),
        (c + 10, 'Emprestou da dezena mas não diminuiu a dezena'),
        (a + b, 'Fez adição em vez de subtração'),
        (c - 10, 'Errou a conta das dezenas'),
    ], [(c + 100, 'Errou a conta das centenas'), (c + 1, 'Errou a conta das unidades')])
    n += 1
    tmpl = CONTEXTOS_SUB[n % 3]
    explic = f'{a % 10} é menor que {b % 10}, então troque 1 dezena por 10 unidades: {a % 10 + 10} − {b % 10} = {a % 10 + 10 - b % 10}. Continue pelas dezenas e centenas. Resultado: {c}.'
    montar(f'mat-sub-{n:04d}', 'matematica', 'mat-numeros', HAB_ADD, 'base', dif, tmpl.format(a=a, b=b), str(c), erradas, explic,
           'Confira somando: o resultado + o número tirado deve dar o primeiro número.')

HAB_MD = 'Ideias de multiplicação e divisão'
# (grupo, item, item é feminino?)
OBJ_MULT = [('caixas', 'lápis', False), ('pacotes', 'balas', True), ('mesas', 'cadeiras', True), ('cestas', 'ovos', False), ('vasos', 'flores', True),
            ('carros', 'rodas', True), ('pratos', 'pastéis', False), ('sacolas', 'laranjas', True)]
for i, (grupo, item, fem) in enumerate(OBJ_MULT, 1):
    a = 4 if item == 'rodas' else rng.randint(3, 9)
    b = rng.randint(3, 8)
    c = a * b
    erradas = completar(c, [
        (a + b, 'Somou os números em vez de multiplicar'),
        (a * (b + 1), f'Contou {grupo} a mais'),
        (a * (b - 1), f'Contou {grupo} a menos'),
        (c + 2, 'Errou a tabuada'),
    ], [(c - 2, 'Errou a tabuada'), (c + 10, 'Errou a tabuada')])
    montar(f'mat-mult-{i:04d}', 'matematica', 'mat-numeros', HAB_MD, 'base', 2 if a * b <= 30 else 3,
           f'Há {b} {grupo} com {a} {item} em cada. {"Quantas" if fem else "Quantos"} {item} há ao todo?', str(c), erradas,
           f'São {b} grupos de {a}: {" + ".join([str(a)] * b)} = {c}. Ou seja, {b} × {a} = {c}.',
           'Somar o mesmo número várias vezes é multiplicar.')

# (item, item feminino?, quem, quem feminino?, verbo)
DIV = [('balas', True, 'crianças', True, 'recebeu'), ('figurinhas', True, 'amigos', False, 'recebeu'), ('lápis', False, 'estojos', False, 'ficou com'),
       ('maçãs', True, 'cestas', True, 'ficou com'), ('cadernos', False, 'alunos', False, 'recebeu'), ('bolinhas', True, 'potes', False, 'ficou com')]
for i, (item, fem_item, quem, fem_quem, verbo) in enumerate(DIV, 1):
    a, b = rng.randint(3, 9), rng.randint(2, 6)
    total = a * b
    erradas = completar(a, [
        (total - b, 'Subtraiu em vez de dividir'),
        (b, f'Respondeu o número de {quem}'),
        (a + 1, 'Errou a divisão'),
        (a - 1, 'Errou a divisão'),
    ], [(total + b, 'Somou em vez de dividir'), (a + 2, 'Errou a divisão')])
    montar(f'mat-div-{i:04d}', 'matematica', 'mat-numeros', HAB_MD, 'base', 3 if total > 30 else 2,
           (f'Foram {"repartidas" if fem_item else "repartidos"} {total} {item} igualmente entre {b} {quem}. {"Quantas" if fem_item else "Quantos"} {item} {"cada uma" if fem_quem else "cada um"} recebeu?'
            if verbo == 'recebeu' else
            f'Foram {"colocadas" if fem_item else "colocados"} {total} {item} igualmente em {b} {quem}. {"Quantas" if fem_item else "Quantos"} {item} ficaram em cada {quem[:-1]}?'), str(a), erradas,
           f'Repartir igualmente é dividir: {total} ÷ {b} = {a}, porque {b} × {a} = {total}.',
           f'Pense: qual número vezes {b} dá {total}?')

HAB_DMT = 'Dobro, metade e terço'
for i in range(1, 4):
    nn = rng.randrange(12, 49, 2)
    c = nn // 2
    erradas = completar(c, [(nn * 2, 'Calculou o dobro em vez da metade'), (nn - 2, 'Tirou só 2'), (c + 1, 'Errou a divisão por 2'), (c - 1, 'Errou a divisão por 2')], [])
    montar(f'mat-dmt-{i:04d}', 'matematica', 'mat-numeros', HAB_DMT, 'base', 1 if nn < 20 else 2,
           f'Qual é a metade de {nn}?', str(c), erradas, f'Metade é dividir em 2 partes iguais: {nn} ÷ 2 = {c}. Confira: {c} + {c} = {nn}.',
           'Metade de um número somada com ela mesma dá o número.')
for i in range(4, 7):
    nn = rng.randint(7, 45)
    c = nn * 2
    erradas = completar(c, [(nn // 2 if nn % 2 == 0 else nn + 1, 'Calculou a metade ou errou a conta'), (nn + 2, 'Somou 2 em vez de dobrar'), (c + 2, 'Errou a soma'), (c - 2, 'Errou a soma')], [(c + 10, 'Errou a soma')])
    montar(f'mat-dmt-{i:04d}', 'matematica', 'mat-numeros', HAB_DMT, 'base', 1 if nn < 20 else 2,
           f'Qual é o dobro de {nn}?', str(c), erradas,
           f'Dobro é duas vezes o número: {nn} + {nn} = {c}.', 'Dobro = o número mais ele mesmo.')
for i in range(7, 10):
    nn = rng.randrange(12, 46, 3)
    c = nn // 3
    erradas = completar(c, [(nn // 2 if nn % 2 == 0 else None, 'Calculou a metade em vez da terça parte'), (nn - 3, 'Tirou 3 em vez de dividir por 3'), (nn * 3, 'Multiplicou por 3'), (c + 1, 'Errou a divisão por 3'), (c - 1, 'Errou a divisão por 3')], [])
    montar(f'mat-dmt-{i:04d}', 'matematica', 'mat-numeros', HAB_DMT, 'base', 3,
           f'Uma fita de {nn} cm foi cortada em 3 pedaços iguais. Quantos centímetros tem cada pedaço?', str(c), erradas,
           f'Terça parte é dividir em 3 partes iguais: {nn} ÷ 3 = {c}. Confira: {c} + {c} + {c} = {nn}.', 'Que número somado 3 vezes dá o total?')


def reais(cent):
    return f'R$ {cent // 100},{cent % 100:02d}'


HAB_DIN = 'Dinheiro'
PRODUTOS = ['um lanche', 'um caderno', 'uma caneta colorida', 'um suco', 'um gibi', 'uma borracha', 'um pacote de figurinhas', 'um sorvete']
for i, prod in enumerate(PRODUTOS, 1):
    nota = rng.choice([500, 1000, 2000])
    preco = rng.randrange(150, nota - 50, 5)
    if preco % 100 == 0:
        preco += 25
    troco = nota - preco
    sem_trocar = (nota // 100 - preco // 100) * 100 + (preco % 100)
    erradas = completar(reais(troco), [
        (reais(sem_trocar), 'Subtraiu os reais e deixou os centavos do preço'),
        (reais((nota // 100 - preco // 100) * 100), 'Subtraiu só os reais e esqueceu os centavos'),
        (reais(nota + preco), 'Somou em vez de subtrair'),
        (reais(troco + 100), 'Esqueceu de trocar 1 real por 100 centavos'),
    ], [(reais(troco - 100), 'Errou a conta dos reais'), (reais(troco + 50), 'Errou a conta dos centavos')])
    montar(f'mat-din-{i:04d}', 'matematica', 'mat-grandezas', HAB_DIN, 'base', 3,
           f'Ana comprou {prod} que custa {reais(preco)} e pagou com uma nota de {reais(nota).replace(",00", "")}. Quanto ela recebeu de troco?',
           reais(troco), erradas,
           f'Troco = valor pago − preço. {reais(nota)} − {reais(preco)} = {reais(troco)}. Confira: {reais(troco)} + {reais(preco)} = {reais(nota)}.',
           'Para conferir o troco, some o troco com o preço.')

HAB_HORA = 'Horas em relógio analógico e digital'


def txt_hora(h, m):
    hs = '1 hora' if h == 1 else f'{h} horas'
    return f'{hs} em ponto' if m == 0 else f'{hs} e {m} minutos'


horarios = [(3, 0), (7, 30), (9, 15), (2, 45), (10, 30), (4, 15), (8, 45), (5, 10), (11, 20), (6, 40)]
for i, (h, m) in enumerate(horarios, 1):
    trocado_h = 12 if m == 0 else m // 5
    cand = [
        (txt_hora(trocado_h, h * 5) if trocado_h != h else None, 'Trocou o ponteiro das horas com o dos minutos'),
        (txt_hora(h, m // 5) if m else None, 'Leu o número apontado como se fosse o minuto'),
        (txt_hora(h % 12 + 1, m), 'Arredondou a hora para o número seguinte'),
        (txt_hora(h, (m + 30) % 60), 'Contou os minutos de forma errada'),
    ]
    extras = [(txt_hora(h - 1 if h > 1 else 12, m), 'Leu a hora anterior'), (txt_hora(h, (m + 15) % 60), 'Contou os minutos de forma errada')]
    erradas = completar(txt_hora(h, m), cand, extras)
    expl_m = 'O ponteiro grande está no 12: hora em ponto.' if m == 0 else f'O ponteiro grande está no {m // 5}: {m // 5} × 5 = {m} minutos.'
    montar(f'mat-hora-{i:04d}', 'matematica', 'mat-grandezas', HAB_HORA, 'base', 2 if m % 15 == 0 else 3,
           'Que horas o relógio está marcando?', txt_hora(h, m), erradas,
           (f'O ponteiro pequeno está no {h}. {expl_m}' if m == 0 else f'O ponteiro pequeno está entre o {h} e o {h % 12 + 1}: ainda são {h} horas. {expl_m}'),
           'No ponteiro grande, cada número vale 5 minutos.', figura={'tipo': 'relogio', 'parametros': {'hora': h, 'minuto': m}})

# ---------------------------------------------------------------- LÓGICA
FORMAS = ['circulo', 'quadrado', 'triangulo', 'estrela', 'losango']
NOME = {'circulo': 'Círculo', 'quadrado': 'Quadrado', 'triangulo': 'Triângulo', 'estrela': 'Estrela', 'losango': 'Losango'}
FIGS = {NOME[f]: {'tipo': 'forma', 'parametros': {'forma': f}} for f in FORMAS}
padroes = []
for periodo in (2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4):
    while True:
        p = [rng.choice(FORMAS) for _ in range(periodo)]
        if len(set(p)) >= 2 and p[0] != p[-1] and tuple(p) not in [tuple(x) for x in padroes]:
            # evita padrões que também seriam lidos com período menor
            if periodo == 4 and p[:2] == p[2:]:
                continue
            padroes.append(p)
            break
for i, p in enumerate(padroes, 1):
    k = len(p)
    tam = {2: 5, 3: 6 if i % 2 else 7, 4: 7}[k]
    mostrados = [p[j % k] for j in range(tam)]
    resp = p[tam % k]
    ultima = mostrados[-1]
    erradas = []
    for f in FORMAS:
        if f == resp:
            continue
        if f == ultima:
            erro = 'Repetiu a última figura sem seguir o padrão'
        elif f in p:
            erro = 'Pulou uma posição do padrão'
        else:
            erro = 'Escolheu uma figura que não aparece na sequência'
        erradas.append((NOME[f], erro))
    grupo = ', '.join(NOME[f].lower() for f in p)
    dif = {2: 1, 3: 2, 4: 3}[k]
    montar(f'log-seq-{i:04d}', 'logica', 'log-visual', 'Sequências de figuras e números' if k > 2 else 'Padrões de cor e forma', 'base', dif,
           'Qual figura continua a sequência?', NOME[resp], erradas,
           f'O grupo que se repete é: {grupo}. Seguindo o grupo, a próxima figura é {NOME[resp].lower()}.',
           'Encontre o pedaço que se repete e conte quantas figuras ele tem.', formato='sequencia_visual',
           figura={'tipo': 'sequencia_formas', 'parametros': {'itens': mostrados}}, figs=FIGS)

for i in range(1, 16):
    passo = [2, 3, 5, 10, 4, 2, 3, 5, 10, -2, -5, -10, 6, -3, 9][i - 1]
    if passo > 0:
        inicio = rng.randint(1, 30)
    else:
        inicio = rng.randint(60, 99)
    seq = [inicio + passo * j for j in range(5)]
    c = seq[-1] + passo
    erradas = completar(c, [
        (seq[-1] + passo + 1, 'Errou a conta do salto'),
        (seq[-1] + passo - 1, 'Errou a conta do salto'),
        (seq[-1] + (1 if passo > 0 else -1), 'Contou de 1 em 1 em vez de seguir o salto'),
        (seq[-1] + 2 * passo, 'Pulou um número da sequência'),
    ], [(seq[-1] - passo, 'Voltou na sequência em vez de avançar')])
    sentido = 'aumenta' if passo > 0 else 'diminui'
    montar(f'log-num-{i:04d}', 'logica', 'log-visual', 'Sequências de figuras e números', 'base', 2 if passo in (2, 5, 10) else 3,
           f'Qual número vem depois? {", ".join(map(str, seq))}, ___', str(c), erradas,
           f'A sequência {sentido} de {abs(passo)} em {abs(passo)}: {seq[-1]} {"+" if passo > 0 else "−"} {abs(passo)} = {c}.',
           'Veja quanto muda de um número para o outro.')

BAL = [('maçãs', 'abacaxi', 'abacaxis'), ('laranjas', 'melão', 'melões'), ('bolinhas', 'cubo', 'cubos'), ('peras', 'melancia', 'melancias'),
       ('cenouras', 'repolho', 'repolhos'), ('blocos', 'bola', 'bolas'), ('limões', 'mamão', 'mamões'), ('tampinhas', 'carrinho', 'carrinhos')]
for i, (peq, gr, grs) in enumerate(BAL, 1):
    a, nn = rng.randint(2, 5), rng.randint(2, 4)
    c = a * nn
    um = 'um' if gr in ('abacaxi', 'melão', 'cubo', 'repolho', 'mamão', 'carrinho') else 'uma'
    erradas = completar(c, [(a + nn, 'Somou em vez de multiplicar'), (nn, f'Repetiu o número de {grs}'), (c - a, f'Contou um {gr} a menos' if um == 'um' else f'Contou uma {gr} a menos'), (c + a, f'Contou um {gr} a mais' if um == 'um' else f'Contou uma {gr} a mais')], [(c + 1, 'Errou a conta')])
    montar(f'log-bal-{i:04d}', 'logica', 'log-visual', 'Balanças e equivalências', 'avanco', 3,
           f'Na balança, {a} {peq} pesam o mesmo que {um} {gr}. Quantas {peq} pesam o mesmo que {nn} {grs}?' if peq not in ('blocos', 'limões') else
           f'Na balança, {a} {peq} pesam o mesmo que {um} {gr}. Quantos {peq} pesam o mesmo que {nn} {grs}?',
           str(c), erradas, f'Cada {gr} vale {a} {peq}. Para {nn} {grs}: {" + ".join([str(a)] * nn)} = {c}.',
           f'Troque cada {gr} por {a} {peq} e conte.')

# ---------------------------------------------------------------- PORTUGUÊS (escrito à mão)
PT = []  # (id, bloco, hab, nivel, dif, enunciado, correta, erradas, explicacao, dica, texto_apoio)
CERTO = 'Qual palavra está escrita do jeito certo?'
MPB = 'M antes de P e B'
PT += [
    ('pt-mpb-0001', 'pt-gramatica', MPB, 'base', 1, CERTO, 'tempo', [('tenpo', 'Usou N antes de P'), ('tempu', 'Escreveu como fala, com U no final'), ('tenpu', 'Usou N antes de P e U no final'), ('temppo', 'Dobrou o P sem necessidade')], 'Antes de P e de B usamos M, nunca N: tempo, campo, sombra.', 'Lembre de outras palavras: tampa, bomba.', None),
    ('pt-mpb-0002', 'pt-gramatica', MPB, 'base', 2, CERTO, 'lâmpada', [('lânpada', 'Usou N antes de P'), ('lampada', 'Esqueceu o acento'), ('lanpada', 'Usou N antes de P e esqueceu o acento'), ('lâmpda', 'Esqueceu uma vogal')], 'Antes de P usamos M: lâmpada. E ela tem acento no LÂM, a sílaba mais forte.', 'Fale devagar: LÂM-pa-da.', None),
    ('pt-mpb-0003', 'pt-gramatica', MPB, 'base', 1, CERTO, 'samba', [('sanba', 'Usou N antes de B'), ('samva', 'Trocou B por V'), ('sanva', 'Usou N antes de B e trocou B por V'), ('çamba', 'Começou com Ç, mas nenhuma palavra começa com Ç')], 'Antes de B usamos M: samba, bombom, tambor.', 'M antes de P e B, sempre.', None),
    ('pt-mpb-0004', 'pt-gramatica', MPB, 'base', 1, CERTO, 'tambor', [('tanbor', 'Usou N antes de B'), ('tambô', 'Escreveu como fala, sem o R final'), ('tanbô', 'Usou N antes de B e tirou o R'), ('tambôr', 'Colocou acento sem necessidade')], 'Antes de B usamos M: tambor. E o R do final precisa aparecer, mesmo que a gente fale fraquinho.', 'Fale devagar: tam-BOR.', None),
    ('pt-mpb-0005', 'pt-gramatica', MPB, 'base', 2, CERTO, 'embora', [('enbora', 'Usou N antes de B'), ('imbora', 'Escreveu como fala, com I'), ('inbora', 'Usou I e N antes de B'), ('embóra', 'Colocou acento sem necessidade')], 'Antes de B usamos M: embora. E a palavra começa com E, mesmo que às vezes a gente fale "imbora".', 'M antes de P e B.', None),
    ('pt-mpb-0006', 'pt-gramatica', MPB, 'base', 1, CERTO, 'compras', [('conpras', 'Usou N antes de P'), ('comprras', 'Dobrou o R sem necessidade'), ('conprras', 'Usou N antes de P e dobrou o R'), ('cômpras', 'Colocou acento sem necessidade')], 'Antes de P usamos M: compras.', 'Lembre: campo, tempo, compras.', None),
]
SSR = 'S/SS e R/RR'
PT += [
    ('pt-ss-0001', 'pt-gramatica', SSR, 'base', 2, 'Qual opção completa a palavra MA__Ã (a fruta vermelha)?', 'Ç', [('SS', 'SS também tem som de S, mas essa palavra se escreve com Ç'), ('S', 'S sozinho entre vogais tem som de Z'), ('C', 'C antes de A tem som de K'), ('Z', 'Trocou o som de S pelo de Z')], 'Maçã se escreve com Ç. O Ç antes de A, O e U tem som de S.', 'Lembre de outras: cabeça, palhaço, açúcar.', None),
    ('pt-ss-0002', 'pt-gramatica', SSR, 'base', 2, 'Qual opção completa a palavra CA__A (o lugar onde a gente mora)?', 'S', [('SS', 'SS tem som de S, mas aqui o som é de Z'), ('Z', 'O som é de Z, mas essa palavra se escreve com S'), ('Ç', 'Ç tem som de S, mas aqui o som é de Z'), ('C', 'C antes de A tem som de K')], 'Entre duas vogais, um S sozinho tem som de Z: casa, mesa, rosa.', 'Fale devagar: ca-ZA. Som de Z entre vogais, muitas vezes, é S.', None),
    ('pt-ss-0003', 'pt-gramatica', SSR, 'base', 2, 'Qual opção completa a palavra A__ADO (frango ___ no forno)?', 'SS', [('S', 'S sozinho entre vogais tem som de Z'), ('Ç', 'Essa palavra se escreve com SS'), ('Z', 'Trocou o som de S pelo de Z'), ('C', 'C antes de A tem som de K')], 'Entre duas vogais, para ter som de S usamos SS: assado, pássaro, pêssego.', 'Um S sozinho entre vogais vira som de Z.', None),
    ('pt-ss-0004', 'pt-gramatica', SSR, 'base', 2, 'Qual opção completa a palavra PE__OA?', 'SS', [('S', 'S sozinho entre vogais tem som de Z'), ('Ç', 'Ç não é usado antes de O nesta palavra'), ('Z', 'Trocou o som de S pelo de Z'), ('C', 'C antes de O tem som de K')], 'Pessoa se escreve com SS: entre vogais, SS tem som de S.', 'Fale devagar: pes-SO-a.', None),
    ('pt-ss-0005', 'pt-gramatica', SSR, 'base', 2, 'Qual opção completa a palavra ME__A (móvel onde fazemos as refeições)?', 'S', [('SS', 'SS tem som de S, mas aqui o som é de Z'), ('Z', 'O som é de Z, mas essa palavra se escreve com S'), ('Ç', 'Ç tem som de S, mas aqui o som é de Z'), ('C', 'C antes de A tem som de K')], 'Mesa se escreve com S. Entre vogais, um S sozinho tem som de Z.', 'Parecida com casa e rosa.', None),
    ('pt-ss-0006', 'pt-gramatica', SSR, 'base', 2, 'Qual opção completa a palavra CABE__A?', 'Ç', [('SS', 'SS também tem som de S, mas essa palavra se escreve com Ç'), ('S', 'S sozinho entre vogais tem som de Z'), ('C', 'C antes de A tem som de K'), ('Z', 'Trocou o som de S pelo de Z')], 'Cabeça se escreve com Ç. Antes de A, O e U, o Ç tem som de S.', 'Lembre de maçã e palhaço.', None),
    ('pt-rr-0001', 'pt-gramatica', SSR, 'base', 2, CERTO, 'terra', [('tera', 'R sozinho entre vogais tem som fraco'), ('terrra', 'Usou R demais'), ('teha', 'Escreveu como fala, com H'), ('térra', 'Colocou acento sem necessidade')], 'Entre vogais, para o som forte de R usamos RR: terra, carro, cachorro.', 'R sozinho entre vogais tem som fraco, como em "caro".', None),
    ('pt-rr-0002', 'pt-gramatica', SSR, 'base', 2, CERTO, 'cachorro', [('cachoro', 'R sozinho entre vogais tem som fraco'), ('caxorro', 'Usou X no lugar de CH'), ('caxoro', 'Usou X e um R só'), ('cachorrro', 'Usou R demais')], 'Cachorro tem CH e RR: o RR dá o som forte entre vogais.', 'Fale devagar: ca-CHOR-ro.', None),
    ('pt-rr-0003', 'pt-gramatica', SSR, 'base', 3, CERTO, 'honra', [('honrra', 'Depois de N, um R só já tem som forte'), ('onra', 'Esqueceu o H do começo'), ('onrra', 'Esqueceu o H e dobrou o R'), ('honrá', 'Colocou acento sem necessidade')], 'Depois de N, um R sozinho já tem som forte: honra, genro. Não precisa de RR.', 'Só usamos RR entre duas vogais.', None),
    ('pt-rr-0004', 'pt-gramatica', SSR, 'base', 2, CERTO, 'barata', [('barrata', 'RR deixa o som forte, mas aqui o som é fraco'), ('varata', 'Trocou B por V'), ('barrrata', 'Usou R demais'), ('baratta', 'Dobrou o T sem necessidade')], 'Em barata, o R tem som fraco, então usamos um R só.', 'Fale devagar: ba-RA-ta.', None),
]
LU = 'L/U no fim de sílaba'
PT += [
    ('pt-lu-0001', 'pt-gramatica', LU, 'base', 2, CERTO, 'papel', [('papeu', 'Escreveu como fala, com U'), ('papél', 'Colocou acento sem necessidade'), ('papeo', 'Trocou L por O'), ('pappel', 'Dobrou o P sem necessidade')], 'Papel termina com L, mesmo que a gente fale "papeu". O plural ajuda: papéis.', 'Pense no plural ou em palavras da família.', None),
    ('pt-lu-0002', 'pt-gramatica', LU, 'base', 2, CERTO, 'anzol', [('anzou', 'Escreveu como fala, com U'), ('ansol', 'Usou S no lugar de Z'), ('anzól', 'Colocou acento sem necessidade'), ('ansou', 'Usou S e terminou com U')], 'Anzol termina com L. O plural ajuda: anzóis.', 'Palavras que terminam em L no singular mudam para IS no plural.', None),
    ('pt-lu-0003', 'pt-gramatica', LU, 'base', 3, CERTO, 'chapéu', [('chapél', 'Trocou o U do final por L'), ('xapéu', 'Usou X no lugar de CH'), ('chapeu', 'Esqueceu o acento'), ('xapél', 'Usou X e trocou U por L')], 'Chapéu termina com U e tem acento. O plural ajuda: chapéus (e não "chapéis").', 'Pense no plural: chapéus.', None),
    ('pt-lu-0004', 'pt-gramatica', LU, 'base', 2, CERTO, 'calça', [('cauça', 'Escreveu como fala, com U'), ('calsa', 'Usou S no lugar de Ç'), ('calca', 'Esqueceu a cedilha'), ('caussa', 'Usou U e SS')], 'Calça se escreve com L e Ç.', 'Lembre de outras com L: alface, salto.', None),
]
AC = 'Sílaba tônica e acentuação'
PT += [
    ('pt-ac-0001', 'pt-gramatica', AC, 'base', 2, 'Em qual palavra a sílaba mais forte é a ÚLTIMA?', 'café', [('bola', 'A sílaba forte é BO, a penúltima'), ('casa', 'A sílaba forte é CA, a penúltima'), ('lápis', 'A sílaba forte é LÁ, a penúltima'), ('pássaro', 'A sílaba forte é PÁS, a antepenúltima')], 'Em ca-FÉ, a sílaba mais forte é a última.', 'Fale cada palavra devagar, como se estivesse chamando alguém.', None),
    ('pt-ac-0002', 'pt-gramatica', AC, 'base', 3, 'Em qual palavra a sílaba mais forte é a ANTEPENÚLTIMA (a terceira, contando do final)?', 'pássaro', [('janela', 'A sílaba forte é NE, a penúltima'), ('sofá', 'A sílaba forte é FÁ, a última'), ('mesa', 'A sílaba forte é ME, a penúltima'), ('boneca', 'A sílaba forte é NE, a penúltima')], 'Em PÁS-sa-ro, a sílaba mais forte é a terceira de trás para a frente.', 'Separe as sílabas e conte do final para o começo.', None),
    ('pt-ac-0003', 'pt-gramatica', AC, 'base', 2, 'Qual destas palavras está escrita corretamente?', 'você', [('vocé', 'Usou acento agudo, mas o som é fechado (ê)'), ('voce', 'Esqueceu o acento'), ('vôce', 'Colocou o acento na sílaba errada'), ('vocè', 'Usou um acento que não serve para esta palavra')], 'Você tem acento circunflexo (^) no Ê, porque o som é fechado.', 'Fale: vo-CÊ. O som é fechado, como em "ipê".', None),
    ('pt-ac-0004', 'pt-gramatica', AC, 'base', 2, CERTO, 'árvore', [('arvore', 'Esqueceu o acento'), ('arvóre', 'Colocou o acento na sílaba errada'), ('árvori', 'Escreveu como fala, com I no final'), ('arvori', 'Esqueceu o acento e escreveu com I')], 'Em ÁR-vo-re, a sílaba forte é a antepenúltima, e toda palavra assim leva acento.', 'Fale devagar: ÁR-vo-re.', None),
]
CL = 'Substantivo, adjetivo e verbo'
PT += [
    ('pt-cl-0001', 'pt-gramatica', CL, 'base', 2, 'Na frase "O gato preto dormiu no sofá", qual palavra é um ADJETIVO (diz como algo é)?', 'preto', [('gato', 'É um substantivo: nome de um animal'), ('dormiu', 'É um verbo: indica uma ação'), ('sofá', 'É um substantivo: nome de uma coisa'), ('no', 'É uma palavrinha de ligação')], 'Preto diz como o gato é. Palavras que dão características são adjetivos.', 'Pergunte: como é o gato?', None),
    ('pt-cl-0002', 'pt-gramatica', CL, 'base', 2, 'Na frase "Maria correu até a escola", qual palavra é um VERBO (indica ação)?', 'correu', [('Maria', 'É um substantivo: nome de uma pessoa'), ('escola', 'É um substantivo: nome de um lugar'), ('até', 'É uma palavrinha de ligação'), ('a', 'É uma palavrinha que vem antes do nome')], 'Correu indica o que Maria fez: é uma ação, por isso é verbo.', 'Pergunte: o que Maria fez?', None),
    ('pt-cl-0003', 'pt-gramatica', CL, 'base', 1, 'Qual palavra é um SUBSTANTIVO (nome de pessoa, animal, lugar ou coisa)?', 'cadeira', [('bonito', 'É um adjetivo: diz como algo é'), ('pular', 'É um verbo: indica uma ação'), ('cantou', 'É um verbo: indica uma ação'), ('feliz', 'É um adjetivo: diz como alguém está')], 'Cadeira é nome de uma coisa, então é substantivo.', 'Dá para colocar "a" ou "o" antes? A cadeira.', None),
    ('pt-cl-0004', 'pt-gramatica', CL, 'base', 2, 'Qual palavra é um SUBSTANTIVO PRÓPRIO (nome específico, escrito com letra maiúscula)?', 'Guarapuava', [('cidade', 'É um substantivo comum: serve para qualquer cidade'), ('rio', 'É um substantivo comum: serve para qualquer rio'), ('escola', 'É um substantivo comum: serve para qualquer escola'), ('menina', 'É um substantivo comum: serve para qualquer menina')], 'Guarapuava é o nome de uma cidade específica, por isso é substantivo próprio e começa com letra maiúscula.', 'Nomes próprios começam com letra maiúscula.', None),
    ('pt-cl-0005', 'pt-gramatica', CL, 'base', 3, 'Na frase "As flores amarelas cresceram no jardim", quantos SUBSTANTIVOS existem?', '2', [('1', 'Contou só "flores" e esqueceu "jardim"'), ('3', 'Contou "amarelas", que é adjetivo'), ('4', 'Contou palavras que não são substantivos'), ('6', 'Contou todas as palavras da frase')], 'Os substantivos são "flores" e "jardim": nomes de coisas. "Amarelas" é adjetivo e "cresceram" é verbo.', 'Procure os nomes de coisas, pessoas, animais ou lugares.', None),
    ('pt-cl-0006', 'pt-gramatica', CL, 'base', 2, 'Como chamamos um grupo de muitas abelhas juntas?', 'enxame', [('cardume', 'Cardume é grupo de peixes'), ('rebanho', 'Rebanho é grupo de ovelhas ou bois'), ('matilha', 'Matilha é grupo de cães'), ('alcateia', 'Alcateia é grupo de lobos')], 'Enxame é o coletivo de abelhas.', 'Coletivo é o nome de um grupo.', None),
    ('pt-cl-0007', 'pt-gramatica', CL, 'base', 2, 'Como chamamos um grupo de muitos peixes nadando juntos?', 'cardume', [('enxame', 'Enxame é grupo de abelhas'), ('alcateia', 'Alcateia é grupo de lobos'), ('rebanho', 'Rebanho é grupo de ovelhas ou bois'), ('constelação', 'Constelação é grupo de estrelas')], 'Cardume é o coletivo de peixes.', 'Coletivo é o nome de um grupo.', None),
]
PL = 'Singular e plural'
PT += [
    ('pt-pl-0001', 'pt-gramatica', PL, 'base', 3, 'Qual é o plural de PÃO?', 'pães', [('pãos', 'Só colocou S no final'), ('pões', 'Mudou o som da palavra'), ('pãoes', 'Juntou ÃO com ES'), ('paes', 'Esqueceu o til')], 'Pão vira pães no plural. Palavras com ÃO podem fazer o plural de jeitos diferentes: pães, mãos, limões.', 'Pense em "dois pães".', None),
    ('pt-pl-0002', 'pt-gramatica', PL, 'base', 2, 'Qual é o plural de FLOR?', 'flores', [('flors', 'Só colocou S no final'), ('florzes', 'Colocou Z sem necessidade'), ('frores', 'Trocou L por R'), ('flôres', 'Colocou acento sem necessidade')], 'Palavras que terminam em R ganham ES no plural: flor, flores; cor, cores.', 'Pense em "cor, cores".', None),
    ('pt-pl-0003', 'pt-gramatica', PL, 'base', 2, 'Qual é o plural de ANIMAL?', 'animais', [('animals', 'Só colocou S no final'), ('animales', 'Usou o plural de outra língua'), ('animaus', 'Escreveu como fala'), ('animãos', 'Confundiu com palavras terminadas em ÃO')], 'Palavras que terminam em AL trocam o L por IS: animal, animais; jornal, jornais.', 'Pense em "jornal, jornais".', None),
]
PO = 'Pontuação e tipos de frase'
PT += [
    ('pt-po-0001', 'pt-gramatica', PO, 'base', 2, 'Qual sinal deve terminar a frase: "Você vai à festa amanhã__"', 'Ponto de interrogação (?)', [('Ponto final (.)', 'O ponto final é para afirmar, e a frase é uma pergunta'), ('Ponto de exclamação (!)', 'A exclamação mostra emoção, e a frase é uma pergunta'), ('Vírgula (,)', 'A vírgula não termina frases'), ('Dois-pontos (:)', 'Os dois-pontos anunciam algo que vem depois')], 'A frase faz uma pergunta, então termina com ponto de interrogação.', 'Leia a frase em voz alta: ela pergunta ou afirma?', None),
    ('pt-po-0002', 'pt-gramatica', PO, 'base', 2, 'Qual sinal deve terminar a frase: "Que susto você me deu__"', 'Ponto de exclamação (!)', [('Ponto de interrogação (?)', 'A frase não pergunta nada: ela mostra emoção'), ('Ponto final (.)', 'A frase mostra surpresa, então pede exclamação'), ('Vírgula (,)', 'A vírgula não termina frases'), ('Reticências (...)', 'Reticências mostram que algo ficou sem terminar')], 'A frase mostra surpresa, uma emoção, então termina com ponto de exclamação.', 'Frases de surpresa, alegria ou susto usam exclamação.', None),
    ('pt-po-0003', 'pt-gramatica', PO, 'base', 1, 'Qual frase é uma PERGUNTA?', 'Onde está meu caderno?', [('Meu caderno está na mesa.', 'É uma afirmação'), ('Que caderno lindo!', 'É uma exclamação'), ('Pegue o caderno.', 'É um pedido'), ('O caderno é azul.', 'É uma afirmação')], 'Perguntas terminam com ponto de interrogação e esperam uma resposta.', 'Procure o sinal de interrogação.', None),
]
LOC, ASS, GEN, INF = 'Localizar informação explícita', 'Identificar o assunto do texto', 'Reconhecer gêneros: poema, receita, bilhete, notícia, HQ', 'Inferir informação implícita'
TA = 'Bia, fui ao mercado comprar leite e pão. Volto às 5 horas. Seu almoço está na geladeira. Beijos, Mamãe.'
TB = 'Suco de laranja. Ingredientes: 4 laranjas, 1 copo de água e gelo. Modo de fazer: corte as laranjas ao meio, esprema e misture o suco com a água. Coloque gelo e sirva.'
TC = 'Na quinta-feira, os alunos da Escola Vila Verde plantaram 30 mudas de árvores perto do rio. A professora Ana explicou que as árvores ajudam a proteger a água. No próximo mês, a turma vai voltar para regar as mudas.'
TD = 'O vento passa ligeiro,\nbalança o varal inteiro.\nA camiseta vira bandeira,\na meia dança a tarde inteira.'
NT = 'Não está escrito no texto'
PT += [
    ('pt-lei-a001', 'pt-leitura', LOC, 'base', 1, 'Por que a mãe saiu de casa?', 'Para comprar leite e pão no mercado', [('Para levar Bia à escola', NT), ('Para fazer o almoço', 'O almoço já estava pronto, na geladeira'), ('Para ir ao médico', NT), ('Para visitar a avó', NT)], 'O bilhete diz: "fui ao mercado comprar leite e pão".', 'Volte ao texto e procure a palavra "mercado".', TA),
    ('pt-lei-a002', 'pt-leitura', GEN, 'base', 2, 'Que tipo de texto é esse?', 'Bilhete', [('Receita', 'Receita ensina a preparar algo'), ('Poema', 'Poema é escrito em versos'), ('Notícia', 'Notícia conta um fato para muitas pessoas'), ('História em quadrinhos', 'HQ tem desenhos e balões de fala')], 'É um bilhete: uma mensagem curta para uma pessoa, com quem escreve no final (Mamãe).', 'Para quem a mensagem foi escrita?', TA),
    ('pt-lei-a003', 'pt-leitura', LOC, 'base', 1, 'Onde está o almoço de Bia?', 'Na geladeira', [('No mercado', 'O mercado é onde a mãe foi'), ('Na mesa', NT), ('No forno', NT), ('Na escola', NT)], 'O bilhete diz: "Seu almoço está na geladeira".', 'Procure a palavra "almoço" no texto.', TA),
    ('pt-lei-b001', 'pt-leitura', LOC, 'base', 1, 'Quantas laranjas a receita usa?', '4', [('1', 'Confundiu com o copo de água'), ('2', NT), ('3', NT), ('5', NT)], 'Nos ingredientes está escrito: "4 laranjas".', 'Leia a parte dos ingredientes.', TB),
    ('pt-lei-b002', 'pt-leitura', ASS, 'base', 2, 'Para que serve esse texto?', 'Ensinar a fazer um suco', [('Contar uma história de aventura', 'Não há personagens nem aventura'), ('Dar uma notícia', 'Não conta um fato que aconteceu'), ('Convidar para uma festa', 'Não há convite'), ('Vender laranjas', 'Não há preço nem oferta')], 'É uma receita: lista os ingredientes e ensina o modo de fazer.', 'Repare nas partes "Ingredientes" e "Modo de fazer".', TB),
    ('pt-lei-b003', 'pt-leitura', LOC, 'base', 2, 'O que se faz logo depois de cortar as laranjas?', 'Espremer as laranjas', [('Colocar gelo', 'O gelo vem quase no fim'), ('Servir o suco', 'Servir é o último passo'), ('Comprar as laranjas', NT), ('Lavar o copo', NT)], 'O modo de fazer diz: "corte as laranjas ao meio, esprema...". Espremer vem logo depois de cortar.', 'Leia os passos na ordem.', TB),
    ('pt-lei-c001', 'pt-leitura', LOC, 'base', 1, 'Quantas mudas os alunos plantaram?', '30', [('3', 'Leu só um pedaço do número'), ('13', NT), ('20', NT), ('40', NT)], 'O texto diz: "plantaram 30 mudas de árvores".', 'Procure o número no texto.', TC),
    ('pt-lei-c002', 'pt-leitura', LOC, 'base', 2, 'Onde as mudas foram plantadas?', 'Perto do rio', [('Dentro da escola', NT), ('Na praça', NT), ('No quintal da professora', NT), ('Numa fazenda', NT)], 'O texto diz: "plantaram 30 mudas de árvores perto do rio".', 'Procure a palavra "plantaram".', TC),
    ('pt-lei-c003', 'pt-leitura', LOC, 'base', 2, 'Segundo a professora, por que é importante plantar árvores perto do rio?', 'Porque as árvores ajudam a proteger a água', [('Porque deixam a escola mais bonita', NT), ('Porque dão frutas', NT), ('Porque fazem sombra para os alunos', NT), ('Porque o rio estava seco', NT)], 'A professora explicou que "as árvores ajudam a proteger a água".', 'Procure o que a professora Ana explicou.', TC),
    ('pt-lei-c004', 'pt-leitura', ASS, 'base', 3, 'Qual é o assunto principal da notícia?', 'Alunos plantando árvores perto do rio', [('Um passeio de barco no rio', NT), ('A professora ganhando um prêmio', NT), ('Uma festa na escola', NT), ('Uma chuva forte na cidade', NT)], 'A notícia inteira fala dos alunos que plantaram mudas perto do rio e vão voltar para regar.', 'Sobre o que fala o texto do começo ao fim?', TC),
    ('pt-lei-d001', 'pt-leitura', LOC, 'base', 2, 'No poema, o que o vento balança?', 'O varal', [('A bandeira da escola', 'No poema, a camiseta só parece uma bandeira'), ('As árvores', NT), ('A janela', NT), ('Um barco', NT)], 'O poema diz: "balança o varal inteiro".', 'Leia o segundo verso.', TD),
    ('pt-lei-d002', 'pt-leitura', GEN, 'base', 2, 'Que tipo de texto é esse?', 'Poema', [('Receita', 'Receita ensina a preparar algo'), ('Bilhete', 'Bilhete é uma mensagem para alguém'), ('Notícia', 'Notícia conta um fato que aconteceu'), ('Carta', 'Carta tem destinatário e assinatura')], 'É um poema: escrito em versos (linhas curtas) e com rimas.', 'Repare nas linhas curtas e nos sons parecidos no fim.', TD),
    ('pt-lei-d003', 'pt-leitura', GEN, 'base', 3, 'Quais palavras do poema rimam entre si?', 'ligeiro e inteiro', [('vento e varal', 'Começam com o mesmo som, mas não rimam'), ('camiseta e meia', 'Não terminam com o mesmo som'), ('passa e dança', 'Não terminam com o mesmo som'), ('bandeira e tarde', 'Não terminam com o mesmo som')], 'Rimam as palavras que terminam com o mesmo som: ligei-RO e intei-RO.', 'Olhe o fim de cada verso.', TD),
    ('pt-inf-0001', 'pt-leitura', INF, 'avanco', 3, 'Como provavelmente estava o tempo?', 'Chuvoso', [('Ensolarado e quente', 'Guarda-chuva e botas de borracha não combinam com sol forte'), ('Com neve', 'Nada no texto fala de neve'), ('Seco e sem nuvens', 'Guarda-chuva indica chuva'), ('Com muito calor', 'As pistas indicam chuva, não calor')], 'O texto não diz que chovia, mas dá pistas: guarda-chuva e botas de borracha.', 'Procure as pistas: o que Lucas levou?', 'Lucas olhou pela janela, pegou o guarda-chuva e calçou as botas de borracha antes de sair.'),
    ('pt-inf-0002', 'pt-leitura', INF, 'avanco', 2, 'Como Ana provavelmente estava?', 'Com sono', [('Com fome', 'Não há pistas de comida'), ('Brava', 'Não há pistas de raiva'), ('Muito animada', 'Bocejar não combina com animação'), ('Com frio', 'Não há pistas de frio')], 'O texto não diz "sono", mas dá pistas: bocejou, esfregou os olhos e deitou a cabeça.', 'O que costumamos fazer quando estamos com sono?', 'Ana bocejou, esfregou os olhos e deitou a cabeça na mesa.'),
]
for (id_, bloco, hab, nivel, dif, enun, correta, erradas, expl, dica, apoio) in PT:
    montar(id_, 'portugues', bloco, hab, nivel, dif, enun, correta, erradas, expl, dica, texto_apoio=apoio)

# ---------------------------------------------------------------- SAÍDA
ids = [q['id'] for q in QUESTOES]
assert len(ids) == len(set(ids)), 'ids repetidos'
json.dump(QUESTOES, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(QUESTOES), Counter(q['trilha'] for q in QUESTOES), Counter(q['gabarito'] for q in QUESTOES))
