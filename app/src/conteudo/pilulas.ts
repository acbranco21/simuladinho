import type { Figura, Trilha } from '../tipos'

/** Uma "pílula" de estudo: explicação curta, regras, exemplo resolvido e prática com questões da mesma habilidade. */
export interface Pilula {
  id: string
  trilha: Trilha
  /** Igual ao campo `habilidade` das questões (liga a pílula à prática). */
  habilidade: string
  titulo: string
  resumo: string
  regras: string[]
  exemplo: { pergunta: string; figura?: Figura; passos: string[]; resposta: string }
  dica: string
}

export const PILULAS: Pilula[] = [
  // ------------------------------------------------------------ PORTUGUÊS
  {
    id: 'pilula-m-antes-p-b',
    trilha: 'portugues',
    habilidade: 'M antes de P e B',
    titulo: 'M antes de P e B',
    resumo: 'Antes das letras P e B, usamos sempre M, nunca N. Antes das outras consoantes, usamos N.',
    regras: ['Com M: campo, tempo, sombra, samba, lâmpada.', 'Com N: canto, banda, ponte, menta.'],
    exemplo: {
      pergunta: 'Como se escreve: CA__PO?',
      passos: ['Olhe a letra que vem logo depois do espaço: é P.', 'Antes de P, sempre M.'],
      resposta: 'campo',
    },
    dica: 'Pense em "M de mão dada com P e B".',
  },
  {
    id: 'pilula-s-ss-r-rr',
    trilha: 'portugues',
    habilidade: 'S/SS e R/RR',
    titulo: 'S, SS, Ç, R e RR',
    resumo: 'Entre duas vogais, uma letra sozinha tem som fraco e a letra dobrada tem som forte.',
    regras: [
      'S sozinho entre vogais tem som de Z: casa, mesa, rosa.',
      'SS entre vogais tem som de S: pássaro, assado, pessoa.',
      'Ç antes de A, O e U tem som de S: maçã, cabeça, açúcar. Nenhuma palavra começa com Ç.',
      'R sozinho entre vogais tem som fraco: barata, caro.',
      'RR entre vogais tem som forte: carro, terra, cachorro.',
      'No começo da palavra e depois de N, L ou S, um R só já é forte: rato, honra, guelra, Israel.',
    ],
    exemplo: {
      pergunta: 'Qual opção completa PÁ__ARO: S ou SS?',
      passos: ['O espaço está entre duas vogais (A e A).', 'O som é de S, não de Z.', 'Entre S e SS, o som de S entre vogais pede SS.'],
      resposta: 'pássaro (com SS)',
    },
    dica: 'Fale a palavra devagar e preste atenção: o som é forte ou fraco?',
  },
  {
    id: 'pilula-l-u',
    trilha: 'portugues',
    habilidade: 'L/U no fim de sílaba',
    titulo: 'L ou U no fim da palavra',
    resumo: 'Muitas vezes falamos "u", mas escrevemos L. No fim da palavra, o plural ajuda a descobrir.',
    regras: [
      'Palavras com L no fim mudam para IS no plural: papel → papéis, anzol → anzóis, animal → animais.',
      'Palavras com U no fim só ganham S no plural: chapéu → chapéus, céu → céus.',
      'Verbo no passado termina com U: cantou, bebeu, partiu.',
      'No meio da palavra (calça, alto, soldado) é preciso memorizar: leia bastante e observe.',
    ],
    exemplo: {
      pergunta: 'Papel ou papeu?',
      passos: ['Pense no plural: dois papéis.', 'Apareceu IS no plural, então a palavra termina com L.'],
      resposta: 'papel',
    },
    dica: 'Na dúvida, diga o plural em voz alta.',
  },
  {
    id: 'pilula-silaba-tonica',
    trilha: 'portugues',
    habilidade: 'Sílaba tônica e acentuação',
    titulo: 'Sílaba mais forte e acento',
    resumo: 'Toda palavra tem uma sílaba falada mais forte: a sílaba tônica. Contamos a posição de trás para a frente.',
    regras: [
      'Última sílaba forte: ca-FÉ, so-FÁ, a-VÔ.',
      'Penúltima sílaba forte: ME-sa, LÁ-pis, ja-NE-la.',
      'Antepenúltima sílaba forte: PÁS-sa-ro, ÁR-vo-re. Todas essas levam acento.',
      'Acento agudo (´) indica som aberto: café. Acento circunflexo (^) indica som fechado: você, avô.',
    ],
    exemplo: {
      pergunta: 'Qual é a sílaba mais forte de ÁRVORE?',
      passos: ['Separe as sílabas: ár-vo-re.', 'Fale chamando alguém: ÁR-vo-re.', 'A forte é a terceira de trás para a frente.'],
      resposta: 'ÁR (antepenúltima)',
    },
    dica: 'Fale a palavra como se estivesse chamando alguém de longe.',
  },
  {
    id: 'pilula-classes',
    trilha: 'portugues',
    habilidade: 'Substantivo, adjetivo e verbo',
    titulo: 'Substantivo, adjetivo e verbo',
    resumo: 'Cada palavra tem uma função: dar nome, dizer como algo é ou contar uma ação.',
    regras: [
      'Substantivo dá nome a pessoa, animal, lugar ou coisa: gato, escola, cadeira.',
      'Substantivo próprio é um nome específico e começa com letra maiúscula: Maria, Guarapuava.',
      'Adjetivo diz como algo é: preto, bonito, feliz.',
      'Verbo indica ação: correr, cantou, dormiu.',
      'Coletivo é o nome de um grupo: enxame (abelhas), cardume (peixes), rebanho (ovelhas ou bois), matilha (cães), alcateia (lobos).',
    ],
    exemplo: {
      pergunta: 'Na frase "O cachorro pequeno latiu", qual é cada palavra?',
      passos: ['Cachorro dá nome a um animal: substantivo.', 'Pequeno diz como o cachorro é: adjetivo.', 'Latiu conta o que ele fez: verbo.'],
      resposta: 'cachorro = substantivo, pequeno = adjetivo, latiu = verbo',
    },
    dica: 'Pergunte: é nome? diz como é? diz o que fez?',
  },
  {
    id: 'pilula-plural',
    trilha: 'portugues',
    habilidade: 'Singular e plural',
    titulo: 'Singular e plural',
    resumo: 'O plural indica mais de um. O jeito de formar depende do final da palavra.',
    regras: [
      'Na maioria das palavras, só acrescentamos S: casa → casas.',
      'Terminadas em R ou Z ganham ES: flor → flores, luz → luzes. Terminadas em S com a última sílaba forte também: mês → meses.',
      'Terminadas em S com a sílaba forte antes do fim não mudam: o lápis → os lápis, o ônibus → os ônibus.',
      'Terminadas em M trocam o M por NS: homem → homens, jardim → jardins.',
      'Terminadas em AL, EL, OL, UL trocam o L por IS: animal → animais, azul → azuis.',
      'Terminadas em ÃO podem virar ÕES, ÃES ou ÃOS: limão → limões, pão → pães, mão → mãos. Essas é preciso memorizar.',
    ],
    exemplo: {
      pergunta: 'Qual é o plural de JORNAL?',
      passos: ['A palavra termina em AL.', 'Trocamos o L por IS.'],
      resposta: 'jornais',
    },
    dica: 'Diga "dois…" ou "duas…" antes da palavra e escute.',
  },
  {
    id: 'pilula-pontuacao',
    trilha: 'portugues',
    habilidade: 'Pontuação e tipos de frase',
    titulo: 'Pontuação e tipos de frase',
    resumo: 'O sinal no fim da frase mostra se ela afirma, pergunta ou mostra emoção.',
    regras: [
      'Ponto final (.) para afirmar ou negar: Hoje está frio.',
      'Ponto de interrogação (?) para perguntar: Você vem amanhã?',
      'Ponto de exclamação (!) para emoção, surpresa ou susto: Que lindo!',
      'Vírgula (,) separa itens de uma lista e marca pausas. Ela não termina frase.',
      'Travessão (—) mostra a fala de um personagem.',
    ],
    exemplo: {
      pergunta: 'Qual sinal termina: "Que dia lindo__"',
      passos: ['A frase não pergunta nada.', 'Ela mostra uma emoção de alegria.'],
      resposta: 'ponto de exclamação (!)',
    },
    dica: 'Leia em voz alta: sua voz sobe numa pergunta e fica animada numa exclamação.',
  },
  {
    id: 'pilula-localizar',
    trilha: 'portugues',
    habilidade: 'Localizar informação explícita',
    titulo: 'Achar a resposta no texto',
    resumo: 'Quando a resposta está escrita no texto, o segredo é voltar ao texto e procurar, em vez de lembrar.',
    regras: [
      'Leia a pergunta e descubra a palavra-chave.',
      'Volte ao texto e procure essa palavra.',
      'Leia a frase inteira onde ela aparece.',
      'Escolha a alternativa que diz o mesmo que o texto.',
    ],
    exemplo: {
      pergunta: 'Texto: "Seu almoço está na geladeira." Onde está o almoço?',
      passos: ['Palavra-chave: almoço.', 'No texto: "Seu almoço está na geladeira".'],
      resposta: 'na geladeira',
    },
    dica: 'Não confie só na memória: confira no texto antes de responder.',
  },
  {
    id: 'pilula-assunto',
    trilha: 'portugues',
    habilidade: 'Identificar o assunto do texto',
    titulo: 'Qual é o assunto do texto?',
    resumo: 'O assunto é aquilo de que o texto fala do começo ao fim, não um detalhe que aparece uma vez.',
    regras: [
      'Pergunte: sobre o que é o texto inteiro?',
      'Desconfie de alternativas que falam de um detalhe só.',
      'Desconfie de alternativas com coisas que não estão no texto.',
    ],
    exemplo: {
      pergunta: 'Um texto conta que alunos plantaram árvores perto do rio e vão voltar para regá-las. Qual é o assunto?',
      passos: ['O começo fala do plantio.', 'O fim fala de voltar para regar.', 'O que une tudo é o plantio das árvores.'],
      resposta: 'alunos plantando árvores perto do rio',
    },
    dica: 'Tente resumir o texto numa frase curta.',
  },
  {
    id: 'pilula-generos',
    trilha: 'portugues',
    habilidade: 'Reconhecer gêneros: poema, receita, bilhete, notícia, HQ',
    titulo: 'Tipos de texto',
    resumo: 'Cada tipo de texto tem um jeito próprio. Repare na forma e no objetivo.',
    regras: [
      'Bilhete: mensagem curta para alguém, com o nome de quem escreveu no fim.',
      'Receita: lista de ingredientes e modo de fazer.',
      'Poema: escrito em versos (linhas curtas), muitas vezes com rimas.',
      'Notícia: conta um fato que aconteceu, dizendo quando e onde.',
      'História em quadrinhos: desenhos em quadros e falas em balões.',
    ],
    exemplo: {
      pergunta: '"Ingredientes: 2 ovos e 1 xícara de farinha. Modo de fazer: misture tudo…" Que tipo de texto é?',
      passos: ['Tem lista de ingredientes.', 'Tem modo de fazer.'],
      resposta: 'receita',
    },
    dica: 'Pergunte: para que serve esse texto?',
  },
  {
    id: 'pilula-inferir',
    trilha: 'portugues',
    habilidade: 'Inferir informação implícita',
    titulo: 'Descobrir pelas pistas',
    resumo: 'Às vezes a resposta não está escrita. O texto dá pistas e nós juntamos as pistas, como um detetive.',
    regras: ['Procure as ações e os objetos citados.', 'Pense: o que essas pistas mostram juntas?', 'Escolha a resposta que combina com todas as pistas.'],
    exemplo: {
      pergunta: '"Pedro tirou o casaco e ligou o ventilador." Como estava o dia?',
      passos: ['Pista 1: tirou o casaco.', 'Pista 2: ligou o ventilador.', 'As duas pistas combinam com calor.'],
      resposta: 'quente',
    },
    dica: 'A resposta certa precisa combinar com todas as pistas, não só com uma.',
  },
  // ------------------------------------------------------------ MATEMÁTICA
  {
    id: 'pilula-reagrupamento',
    trilha: 'matematica',
    habilidade: 'Adição e subtração com reagrupamento',
    titulo: 'Contas com "vai um" e "empresta"',
    resumo: 'Na conta armada, começamos sempre pelas unidades e seguimos para as dezenas e as centenas.',
    regras: [
      'Adição: se a soma de uma casa passar de 9, escreva a unidade e "vai 1" para a casa seguinte.',
      'Subtração: se o número de cima for menor, pegue 1 da casa da esquerda (ela fica com 1 a menos). Esse 1 vale 10 na sua casa.',
      'Para conferir uma subtração, some o resultado com o número tirado.',
    ],
    exemplo: {
      pergunta: 'Quanto é 356 + 178?',
      passos: ['Unidades: 6 + 8 = 14. Escreva 4 e vai 1.', 'Dezenas: 5 + 7 + 1 = 13. Escreva 3 e vai 1.', 'Centenas: 3 + 1 + 1 = 5.'],
      resposta: '534',
    },
    dica: 'Escreva o "vai um" pequenininho em cima da casa seguinte para não esquecer.',
  },
  {
    id: 'pilula-mult-div',
    trilha: 'matematica',
    habilidade: 'Ideias de multiplicação e divisão',
    titulo: 'Multiplicar e dividir',
    resumo: 'Multiplicar é somar grupos iguais. Dividir é repartir em partes iguais. Uma desfaz a outra.',
    regras: [
      'Multiplicar: 3 caixas com 4 lápis = 4 + 4 + 4 = 3 × 4 = 12.',
      'Dividir: 12 lápis em 3 caixas iguais = 12 ÷ 3 = 4 em cada.',
      'Se 3 × 4 = 12, então 12 ÷ 3 = 4 e 12 ÷ 4 = 3.',
    ],
    exemplo: {
      pergunta: 'Há 5 pacotes com 6 balas em cada. Quantas balas ao todo?',
      passos: ['São 5 grupos de 6.', '6 + 6 + 6 + 6 + 6 = 30, ou 5 × 6 = 30.'],
      resposta: '30 balas',
    },
    dica: 'Na divisão, pergunte: qual número vezes o número de grupos dá o total?',
  },
  {
    id: 'pilula-dobro-metade',
    trilha: 'matematica',
    habilidade: 'Dobro, metade e terço',
    titulo: 'Dobro, metade e terço',
    resumo: 'Dobro é duas vezes. Metade é dividir em 2 partes iguais. A terça parte é dividir em 3 partes iguais.',
    regras: ['Dobro de 7 = 7 + 7 = 14.', 'Metade de 18 = 18 ÷ 2 = 9.', 'A terça parte de 12 = 12 ÷ 3 = 4.'],
    exemplo: {
      pergunta: 'Qual é a metade de 26?',
      passos: ['Separe: 26 = 20 + 6.', 'Metade de 20 é 10 e metade de 6 é 3.', '10 + 3 = 13. Confira: 13 + 13 = 26.'],
      resposta: '13',
    },
    dica: 'Para conferir a metade, some o resultado com ele mesmo.',
  },
  {
    id: 'pilula-dinheiro',
    trilha: 'matematica',
    habilidade: 'Dinheiro',
    titulo: 'Dinheiro e troco',
    resumo: '1 real vale 100 centavos. Troco é quanto volta: valor pago menos o preço.',
    regras: [
      'Troco = valor pago − preço.',
      'Se os centavos não dão para tirar, troque 1 real por 100 centavos.',
      'Confira: troco + preço = valor pago.',
    ],
    exemplo: {
      pergunta: 'Paguei R$ 10,00 por um lanche de R$ 6,40. Qual é o troco?',
      passos: ['Não dá para tirar 40 centavos de 0 centavos.', 'Troque 1 real: fica R$ 9 e 100 centavos.', '100 − 40 = 60 centavos e 9 − 6 = 3 reais.'],
      resposta: 'R$ 3,60',
    },
    dica: 'Confira sempre somando o troco com o preço.',
  },
  {
    id: 'pilula-horas',
    trilha: 'matematica',
    habilidade: 'Horas em relógio analógico e digital',
    titulo: 'Ler as horas no relógio de ponteiros',
    resumo: 'O ponteiro pequeno mostra as horas. O ponteiro grande mostra os minutos.',
    regras: [
      'Quando o ponteiro grande aponta para um número, cada número vale 5 minutos: no 3 são 15, no 6 são 30, no 9 são 45.',
      'Ponteiro grande no 12: hora em ponto.',
      'O ponteiro pequeno anda devagar: se está entre o 8 e o 9, ainda são 8 horas.',
    ],
    exemplo: {
      pergunta: 'Que horas o relógio marca?',
      figura: { tipo: 'relogio', parametros: { hora: 8, minuto: 15 } },
      passos: ['O ponteiro pequeno passou do 8, mas não chegou ao 9: são 8 horas.', 'O ponteiro grande está no 3: 3 × 5 = 15 minutos.'],
      resposta: '8 horas e 15 minutos',
    },
    dica: 'Conte de 5 em 5 a partir do 12 até o ponteiro grande.',
  },
  // ------------------------------------------------------------ LÓGICA
  {
    id: 'pilula-sequencias',
    trilha: 'logica',
    habilidade: 'Sequências de figuras e números',
    titulo: 'Sequências',
    resumo: 'Numa sequência existe uma regra que se repete. Descubra a regra e continue.',
    regras: [
      'Figuras: ache o grupo que se repete e conte quantas figuras ele tem.',
      'Números: veja quanto muda de um número para o próximo.',
      'Teste a regra em todos os números antes de responder.',
    ],
    exemplo: {
      pergunta: 'Qual número vem depois? 5, 8, 11, 14, ___',
      passos: ['De 5 para 8: +3. De 8 para 11: +3. De 11 para 14: +3.', 'A regra é somar 3: 14 + 3 = 17.'],
      resposta: '17',
    },
    dica: 'Escreva a diferença entre cada par de números no rascunho.',
  },
  {
    id: 'pilula-padroes',
    trilha: 'logica',
    habilidade: 'Padrões de cor e forma',
    titulo: 'Padrões de forma',
    resumo: 'Um padrão é um grupo de figuras que se repete sempre na mesma ordem.',
    regras: ['Encontre onde o grupo começa a se repetir.', 'Conte quantas figuras tem o grupo.', 'Continue o grupo a partir do ponto em que a sequência parou.'],
    exemplo: {
      pergunta: 'Qual figura continua a sequência?',
      figura: { tipo: 'sequencia_formas', parametros: { itens: ['circulo', 'circulo', 'quadrado', 'circulo', 'circulo'] } },
      passos: ['O grupo é: círculo, círculo, quadrado.', 'Depois de dois círculos vem um quadrado.'],
      resposta: 'quadrado',
    },
    dica: 'Aponte com o dedo e fale o nome de cada figura em voz alta.',
  },
  {
    id: 'pilula-balancas',
    trilha: 'logica',
    habilidade: 'Balanças e equivalências',
    titulo: 'Balanças em equilíbrio',
    resumo: 'Quando a balança está equilibrada, os dois lados pesam o mesmo. Podemos trocar uma coisa pela outra.',
    regras: ['Descubra quanto vale uma coisa grande em coisas pequenas.', 'Troque cada coisa grande pelas pequenas.', 'Conte ou multiplique.'],
    exemplo: {
      pergunta: '2 maçãs pesam o mesmo que 1 abacaxi. Quantas maçãs pesam o mesmo que 3 abacaxis?',
      passos: ['Cada abacaxi vale 2 maçãs.', '3 abacaxis = 2 + 2 + 2.'],
      resposta: '6 maçãs',
    },
    dica: 'Desenhe no rascunho: cada abacaxi vira duas bolinhas.',
  },
]

export const PILULA_POR_HABILIDADE = new Map(PILULAS.map((p) => [p.habilidade, p]))
