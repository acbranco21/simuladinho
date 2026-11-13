/**
 * Projeto de Vida — trilha de formação integral (BNCC: competências gerais 6, 8 e 9; educação financeira como tema transversal).
 *
 * Regras pedagógicas (ver docs/projeto-de-vida.md):
 * - Não entra na nota nem no simulado; dá XP por lição concluída.
 * - Atividades "certa": uma resposta correta, as outras explicam com gentileza por que não; ela tenta de novo.
 * - Atividades "escolha": todas as opções são boas; cada uma tem um retorno. A escolha NÃO é guardada.
 * - Emoções: só personagens. O app nunca pergunta nem registra o que a criança está sentindo.
 */

export type ModuloPV = 'metas' | 'dinheiro' | 'ideias' | 'emocoes'

export interface OpcaoPV {
  texto: string
  retorno: string
  /** Só em atividades "certa". */
  correta?: boolean
}

export interface AtividadePV {
  tipo: 'certa' | 'escolha'
  pergunta: string
  opcoes: OpcaoPV[]
  /** Só em "certa": trecho da história que tem a resposta, mostrado depois do 2º erro (para ela não acertar no chute). */
  pista?: string
}

export interface LicaoPV {
  id: string
  modulo: ModuloPV
  /** Série de referência (3º, 4º ou 5º ano). No modo automático, só abre quando a aluna alcança essa série. */
  serie: 3 | 4 | 5
  titulo: string
  historia: string[]
  /** A ideia principal, em uma frase. */
  ideia: string
  atividades: AtividadePV[]
  /** Desafio fora da tela, para fazer com um adulto. */
  comAdulto: string
}

export interface ModuloInfo {
  id: ModuloPV
  nome: string
  tema: string
  descricao: string
  /** Referência na BNCC, para o painel dos pais. */
  bncc: string
  /** Texto mostrado enquanto o módulo ainda está trancado. */
  comoLiberar: string
  cor: 'azul' | 'laranja' | 'verde' | 'roxo'
}

export const MODULOS_PV: ModuloInfo[] = [
  {
    id: 'emocoes',
    nome: 'Emoções e convivência',
    tema: 'Educação emocional',
    descricao: 'Dar nome ao que sentimos, se acalmar e se colocar no lugar do outro.',
    bncc: 'Competências gerais 8 (autoconhecimento e autocuidado) e 9 (empatia e cooperação)',
    comoLiberar: 'Abre depois do primeiro treino completo.',
    cor: 'roxo',
  },
  {
    id: 'metas',
    nome: 'Meus sonhos e metas',
    tema: 'Projeto de vida',
    descricao: 'Transformar sonhos em passos pequenos e não desistir quando fica difícil.',
    bncc: 'Competência geral 6 (trabalho e projeto de vida)',
    comoLiberar: 'Abre depois de 3 treinos completos.',
    cor: 'azul',
  },
  {
    id: 'dinheiro',
    nome: 'Dinheiro e escolhas',
    tema: 'Educação financeira',
    descricao: 'Troco, cofrinho, preciso ou quero, e comparar antes de comprar.',
    bncc: 'Tema contemporâneo transversal (educação financeira) ligado a Matemática: sistema monetário',
    comoLiberar: 'Abre quando você tiver 20 questões de Matemática com 60% de acerto.',
    cor: 'verde',
  },
  {
    id: 'ideias',
    nome: 'Ideias que resolvem',
    tema: 'Empreendedorismo',
    descricao: 'Perceber um problema, testar uma ideia e aprender com o resultado.',
    bncc: 'Competência geral 6 (trabalho e projeto de vida); referência: educação empreendedora (JEPP/Sebrae)',
    comoLiberar: 'Abre depois de uma lição de "Meus sonhos e metas" e uma de "Dinheiro e escolhas".',
    cor: 'laranja',
  },
]

export const LICOES_PV: LicaoPV[] = [
  // ---------------------------------------------------------------- EMOÇÕES
  {
    id: 'pv-emo-1',
    modulo: 'emocoes',
    serie: 3,
    titulo: 'Dando nome ao que sente',
    historia: [
      'Davi estava jogando um jogo de tabuleiro com a prima. Ele se esforçou muito e ficou quase o jogo inteiro na frente. Na última rodada, ela passou e ganhou.',
      'Ninguém riu dele, e a prima jogou direitinho, sem trapaça. Mesmo assim, Davi ficou com o rosto vermelho, cruzou os braços e disse: "Esse jogo é chato!"',
      'A avó chegou perto e perguntou, com calma: "Você tentou tanto e não deu certo, né?" Davi pensou um pouco e respondeu: "Estou frustrado." Só de dizer isso, ele já se sentiu um pouco melhor.',
    ],
    ideia: 'Dar nome ao que a gente sente ajuda a entender o que está acontecendo por dentro.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'Depois de perder o jogo, qual palavra descreve melhor o que Davi sentia?',
        opcoes: [
          { texto: 'Frustrado', retorno: 'Isso! Frustração é o que a gente sente quando tenta muito e não consegue. Davi se esforçou e perdeu na última rodada.', correta: true },
          { texto: 'Triste', retorno: 'Tristeza costuma deixar a gente quieto e sem energia, às vezes com vontade de chorar. Davi ficou vermelho e cheio de energia. Existe uma palavra mais certinha.' },
          { texto: 'Com vergonha', retorno: 'Vergonha aparece quando achamos que os outros estão rindo ou olhando para nós. A história conta que ninguém riu dele.' },
          { texto: 'Com raiva da prima', retorno: 'Raiva de alguém aparece quando achamos que a pessoa fez algo errado. A prima jogou direitinho, sem trapaça. O incômodo de Davi era outro.' },
        ],
        pista: 'Releia: "Ele se esforçou muito e ficou quase o jogo inteiro na frente. Na última rodada, ela passou e ganhou." E a avó disse: "Você tentou tanto e não deu certo".',
      },
      {
        tipo: 'certa',
        pergunta: 'A amiga da Lia passou a tarde fazendo um desenho para ela. Lia deu um sorriso enorme e um abraço apertado na amiga. O que Lia sente?',
        opcoes: [
          { texto: 'Gratidão', retorno: 'Isso! Gratidão é a alegria de perceber que alguém fez algo por nós. O abraço é o jeito dela de agradecer.', correta: true },
          { texto: 'Orgulho', retorno: 'Orgulho é a alegria por algo que nós mesmos fizemos. Quem fez o desenho foi a amiga.' },
          { texto: 'Surpresa', retorno: 'Talvez ela tenha se surpreendido, mas o abraço apertado na amiga mostra mais do que surpresa: ela está agradecendo.' },
          { texto: 'Alívio', retorno: 'Alívio vem quando uma preocupação acaba. Lia não estava preocupada com nada.' },
        ],
        pista: 'Olhe para quem fez o desenho e para o que Lia fez depois: deu um abraço apertado na amiga.',
      },
      {
        tipo: 'certa',
        pergunta: 'Qual frase é verdadeira sobre as emoções?',
        opcoes: [
          { texto: 'Todas as emoções são normais. O que importa é o que fazemos com elas.', retorno: 'Exatamente! Sentir raiva, medo ou tristeza é normal. Podemos escolher como agir.', correta: true },
          { texto: 'Só a alegria é uma emoção boa.', retorno: 'Todas as emoções têm uma função. O medo, por exemplo, nos protege do perigo.' },
          { texto: 'Menino não pode chorar.', retorno: 'Todo mundo pode chorar, menino ou menina, criança ou adulto. Chorar é um jeito de pôr a emoção para fora.' },
          { texto: 'Sentir raiva é proibido.', retorno: 'Sentir raiva não é proibido. O que não vale é machucar alguém por causa dela.' },
        ],
      },
    ],
    comAdulto: 'Se quiser, conte para um adulto de confiança uma emoção que você sentiu hoje e o que aconteceu.',
  },
  {
    id: 'pv-emo-prova',
    modulo: 'emocoes',
    serie: 3,
    titulo: 'Nervoso antes da prova',
    historia: [
      'Amanhã tem prova de Matemática. Na hora de dormir, Maia sentiu a barriga gelada e o coração batendo rápido. Pensou: "E se eu errar tudo?"',
      'O pai sentou na cama e explicou: "Isso se chama nervosismo. É o corpo avisando que a prova é importante para você. Até gente que estudou muito sente isso."',
      'Os dois respiraram juntos: encher a barriga de ar contando até 4, soltar contando até 4, três vezes. Depois, o pai disse: "A prova mostra o que você já aprendeu e o que ainda vai aprender. Ela não mostra quem você é."',
    ],
    ideia: 'Ficar nervoso antes de uma prova é normal. Dá para perceber os sinais no corpo, respirar e fazer o seu melhor.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'Quais sinais no corpo mostravam que Maia estava nervosa?',
        opcoes: [
          { texto: 'Barriga gelada e coração batendo rápido', retorno: 'Isso! O nervosismo muitas vezes aparece primeiro no corpo, antes de a gente perceber o que está pensando.', correta: true },
          { texto: 'Bocejos e olhos pesados', retorno: 'Esses são sinais de sono. A história conta outros sinais que a Maia sentiu.' },
          { texto: 'Vontade de rir sem parar', retorno: 'Isso costuma aparecer quando estamos alegres ou achando graça. Releia o começo da história.' },
          { texto: 'Rosto vermelho e braços cruzados', retorno: 'Esses sinais apareceram no Davi, que estava frustrado. A Maia sentiu outros.' },
        ],
        pista: 'Releia o começo: "Maia sentiu a barriga gelada e o coração batendo rápido."',
      },
      {
        tipo: 'certa',
        pergunta: 'Na hora da prova, o nervoso voltou. O que pode ajudar Maia?',
        opcoes: [
          { texto: 'Respirar do jeito que treinou e começar por uma questão que ela sabe', retorno: 'Isso! A respiração acalma o corpo, e acertar a primeira questão dá confiança para as outras.', correta: true },
          { texto: 'Responder tudo bem rápido para acabar logo', retorno: 'Com pressa a gente lê errado e erra o que sabia. Primeiro, acalmar o corpo.' },
          { texto: 'Ficar pensando "vou errar tudo"', retorno: 'Esse pensamento deixa o nervoso maior. Existe algo que ela treinou com o pai.' },
          { texto: 'Entregar a prova em branco', retorno: 'Desistir tira a chance de mostrar o que ela aprendeu. Tem um jeito de se acalmar e tentar.' },
        ],
        pista: 'O que Maia e o pai fizeram juntos na noite anterior? Releia a última parte da história.',
      },
      {
        tipo: 'certa',
        pergunta: 'Qual frase é verdadeira?',
        opcoes: [
          { texto: 'A prova mostra o que eu já aprendi e o que ainda vou aprender. Não mostra quem eu sou.', retorno: 'Exatamente! Errar uma questão só mostra um assunto para estudar mais.', correta: true },
          { texto: 'Quem fica nervoso é porque não sabe a matéria.', retorno: 'Não é verdade. O pai da Maia explicou: até quem estudou muito fica nervoso.' },
          { texto: 'Se eu errar uma questão, sou ruim em tudo.', retorno: 'Uma questão errada mostra só um assunto para treinar mais. Ninguém é ruim em tudo por causa de um erro.' },
          { texto: 'Ficar nervoso é proibido.', retorno: 'Sentir nervoso é normal e não é proibido. O que ajuda é saber o que fazer com ele.' },
        ],
      },
    ],
    comAdulto: 'Antes da próxima prova, faça com um adulto a respiração do 4 e combinem uma frase de coragem, como "Eu me preparei e vou fazer o meu melhor".',
  },
  {
    id: 'pv-emo-2',
    modulo: 'emocoes',
    serie: 4,
    titulo: 'Acalmar antes de agir',
    historia: [
      'Bia passou a tarde fazendo um desenho para a feira da escola.',
      'O irmão mais novo esbarrou na mesa, o suco caiu e molhou o desenho. Foi sem querer, mas Bia sentiu uma raiva enorme subindo.',
      'Ela lembrou do que a professora ensinou: antes de falar, respirar fundo. Encheu a barriga de ar devagar, soltou devagar, três vezes. Depois conseguiu conversar.',
    ],
    ideia: 'A raiva é normal. Respirar e esperar um pouco ajuda a escolher o que fazer com ela.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'O que pode ajudar Bia a se acalmar antes de falar com o irmão?',
        opcoes: [
          { texto: 'Respirar fundo, bem devagar, algumas vezes', retorno: 'Isso! Respirar devagar ajuda o corpo a se acalmar.', correta: true },
          { texto: 'Molhar algo do irmão também', retorno: 'Fazer o mesmo com ele deixaria os dois chateados. Que tal algo que ajude a acalmar?' },
          { texto: 'Gritar bem alto', retorno: 'Gritar pode assustar o irmão e não traz o desenho de volta. Tente outra opção.' },
          { texto: 'Guardar a raiva e nunca falar sobre isso', retorno: 'Guardar para sempre também não ajuda. Primeiro a gente se acalma, depois conversa.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Já mais calma, qual frase ajuda mais a resolver?',
        opcoes: [
          { texto: '"Fiquei triste porque meu desenho molhou. Pode tomar mais cuidado perto da mesa?"', retorno: 'Ótimo! Ela disse o que sentiu e pediu o que precisa, sem ofender.', correta: true },
          { texto: '"Você estraga tudo!"', retorno: 'Essa frase ataca o irmão, e foi sem querer. Procure uma que explique o que ela sentiu.' },
          { texto: '"Nunca mais falo com você."', retorno: 'Isso afasta os dois e não resolve. Tente outra.' },
          { texto: 'Não dizer nada e sair batendo a porta', retorno: 'Bater a porta mostra a raiva, mas não ajuda o irmão a entender. Tente outra.' },
        ],
      },
      {
        tipo: 'escolha',
        pergunta: 'Qual jeito de se acalmar você gostaria de experimentar um dia?',
        opcoes: [
          { texto: 'Respirar contando até 4 para encher e até 4 para soltar', retorno: 'Dá para fazer em qualquer lugar, até na sala de aula.' },
          { texto: 'Beber um copo de água e dar uma pausa', retorno: 'Uma pausa curta já ajuda a cabeça a esfriar.' },
          { texto: 'Conversar com um adulto de confiança', retorno: 'Falar com alguém que gosta de você ajuda muito.' },
          { texto: 'Desenhar ou mexer o corpo um pouco', retorno: 'Mexer o corpo ou desenhar ajuda a emoção a passar.' },
        ],
      },
    ],
    comAdulto: 'Experimente com um adulto a respiração do 4: encher a barriga contando até 4 e soltar contando até 4, três vezes.',
  },
  {
    id: 'pv-emo-3',
    modulo: 'emocoes',
    serie: 5,
    titulo: 'No lugar do outro',
    historia: [
      'Rafa chegou à escola no meio do ano. Ele veio de outra cidade e fala com um sotaque diferente.',
      'No recreio, Téo viu Rafa sentado sozinho. Alguns colegas imitavam o jeito dele falar e davam risada.',
      'Téo lembrou do primeiro dia dele em uma escola nova, quando também não conhecia ninguém.',
    ],
    ideia: 'Empatia é imaginar como o outro se sente e agir para ajudar.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'Como Rafa provavelmente está se sentindo?',
        opcoes: [
          { texto: 'Sozinho e triste', retorno: 'Isso. Estar num lugar novo, sem amigos, e ouvir risadas sobre você deixa qualquer um triste.', correta: true },
          { texto: 'Orgulhoso', retorno: 'Pense: ele está sozinho e riem dele. Isso deixaria alguém orgulhoso?' },
          { texto: 'Entediado', retorno: 'Pode até ser, mas a história mostra algo mais forte: ele está sozinho e riem dele.' },
          { texto: 'Bravo com o Téo', retorno: 'O Téo não fez nada com o Rafa: quem ria eram outros colegas. Pense em como é estar sozinho enquanto riem de você.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Qual atitude do Téo mostra empatia?',
        opcoes: [
          { texto: 'Chamar o Rafa para brincar junto', retorno: 'Isso! Um convite simples pode mudar o dia de alguém.', correta: true },
          { texto: 'Rir junto para não ficar de fora', retorno: 'Rir junto aumenta a tristeza do Rafa. Pense no que você gostaria que fizessem por você.' },
          { texto: 'Fingir que não viu nada', retorno: 'Fingir que não viu deixa o Rafa sozinho. Existe algo melhor a fazer.' },
          { texto: 'Imitar o sotaque também', retorno: 'Imitar o jeito de alguém falar para rir dele machuca. Tente outra opção.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Se os colegas continuarem rindo do Rafa todos os dias, o que é importante fazer?',
        opcoes: [
          { texto: 'Contar para um professor ou outro adulto de confiança', retorno: 'Isso mesmo. Quando alguém é provocado sempre, os adultos precisam saber para ajudar. Isso não é fofoca, é proteção.', correta: true },
          { texto: 'Ficar quieto para não se meter', retorno: 'Quando a provocação se repete, ficar quieto deixa o Rafa sem ajuda. Um adulto pode resolver.' },
          { texto: 'Resolver brigando com os colegas', retorno: 'Brigar pode machucar alguém e piorar a situação. Existe um caminho mais seguro.' },
          { texto: 'Rir também, assim param de rir de você', retorno: 'Isso mantém o Rafa sozinho e triste. Tente outra opção.' },
        ],
      },
    ],
    comAdulto: 'Converse com um adulto sobre uma vez em que alguém ajudou você quando você estava sozinho ou chateado.',
  },

  // ---------------------------------------------------------------- METAS
  {
    id: 'pv-metas-1',
    modulo: 'metas',
    serie: 3,
    titulo: 'Sonho grande, passo pequeno',
    historia: [
      'Téo sonha em ler sozinho um livro de aventura de 100 páginas.',
      'No começo, o livro parecia grande demais. Então a mãe deu uma ideia: "E se você ler 10 páginas por dia?"',
      'Todo dia, Téo marcava um X no calendário depois de ler. Ver os X aumentando deixava ele animado para continuar.',
    ],
    ideia: 'Um sonho grande fica possível quando a gente divide em passos pequenos.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'Téo lê 10 páginas por dia. O livro tem 100 páginas. Em quantos dias ele termina?',
        opcoes: [
          { texto: '10 dias', retorno: 'Isso! 10 páginas × 10 dias = 100 páginas.', correta: true },
          { texto: '5 dias', retorno: 'Em 5 dias ele leria 5 × 10 = 50 páginas. Ainda falta metade.' },
          { texto: '20 dias', retorno: 'Em 20 dias ele leria 200 páginas, o dobro do livro. Tente de novo.' },
          { texto: '100 dias', retorno: 'Seriam 100 dias se ele lesse só 1 página por dia. Mas ele lê 10.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Qual destas é uma META, ou seja, algo que dá para fazer e saber se conseguiu?',
        opcoes: [
          { texto: 'Ler 10 páginas hoje', retorno: 'Isso! Dá para fazer hoje e, no fim do dia, saber se conseguiu.', correta: true },
          { texto: 'Ser bom em tudo', retorno: 'Ninguém é bom em tudo, e não dá para saber quando chegou lá. Uma meta precisa ser mais clara.' },
          { texto: 'Nunca errar', retorno: 'Todo mundo erra, e é errando que se aprende. Essa não é uma boa meta.' },
          { texto: 'Ser feliz para sempre', retorno: 'É um desejo bonito, mas não dá para medir. Uma meta é algo que você consegue conferir.' },
        ],
      },
      {
        tipo: 'escolha',
        pergunta: 'Que tipo de sonho você gostaria de transformar em passos pequenos?',
        opcoes: [
          { texto: 'Aprender algo novo, como um instrumento ou um esporte', retorno: 'Que legal! Um primeiro passo pode ser praticar 10 minutos por dia.' },
          { texto: 'Ler um livro inteiro sozinho', retorno: 'Comece escolhendo o livro e quantas páginas por dia dá para ler.' },
          { texto: 'Juntar dinheiro para algo que eu quero', retorno: 'No módulo "Dinheiro e escolhas" você aprende a planejar isso.' },
          { texto: 'Ajudar alguém ou cuidar de um animal', retorno: 'Pense em uma ajuda pequena que dá para fazer nesta semana.' },
        ],
      },
    ],
    comAdulto: 'Conte para um adulto um sonho seu e escolham juntos o primeiro passo pequeno.',
  },
  {
    id: 'pv-metas-2',
    modulo: 'metas',
    serie: 4,
    titulo: 'Quando dá errado',
    historia: [
      'Bia quer pular corda 50 vezes sem parar. No primeiro dia, tropeçou no pulo 12.',
      'Ela ficou chateada e pensou em desistir. Depois, descansou um pouco e tentou de novo, contando de 10 em 10.',
      'No dia seguinte, chegou a 18 pulos. No outro, a 27. Ainda não eram 50, mas ela estava melhorando.',
    ],
    ideia: 'Errar faz parte de aprender. O que conta é tentar de novo, talvez de outro jeito.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'O que mostra que Bia está aprendendo?',
        opcoes: [
          { texto: 'Ela tentou de novo e foi pulando mais vezes a cada dia', retorno: 'Isso! De 12 para 18 e depois para 27: ela está evoluindo.', correta: true },
          { texto: 'Ela tropeçou no pulo 12', retorno: 'Tropeçar é normal no começo. O que mostra aprendizado é o que veio depois.' },
          { texto: 'Ela ficou chateada', retorno: 'Ficar chateada é normal, mas não é isso que mostra que ela está aprendendo.' },
          { texto: 'Ela ainda não chegou a 50', retorno: 'Ela ainda não chegou, mas está chegando mais perto. Procure o que mostra o avanço.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Ontem Bia pulou 18 vezes. Hoje pulou 27. Quantos pulos a mais ela deu hoje?',
        opcoes: [
          { texto: '9 pulos', retorno: 'Isso! 27 − 18 = 9.', correta: true },
          { texto: '7 pulos', retorno: 'Confira: 18 + 7 = 25, não 27.' },
          { texto: '11 pulos', retorno: 'Confira: 18 + 11 = 29, passou de 27.' },
          { texto: '45 pulos', retorno: '45 é 18 + 27. A pergunta quer saber a diferença, então é subtração.' },
        ],
      },
      {
        tipo: 'escolha',
        pergunta: 'Quando algo fica difícil, o que você acha que pode ajudar?',
        opcoes: [
          { texto: 'Descansar um pouco e tentar de novo', retorno: 'Às vezes o corpo e a cabeça só precisam de uma pausa.' },
          { texto: 'Pedir ajuda para alguém', retorno: 'Pedir ajuda é coisa de quem quer aprender, não de quem é fraco.' },
          { texto: 'Dividir em partes menores', retorno: 'Foi o que a Bia fez ao contar de 10 em 10.' },
          { texto: 'Tentar de um jeito diferente', retorno: 'Se um jeito não funciona, testar outro é uma ótima ideia.' },
        ],
      },
    ],
    comAdulto: 'Pergunte a um adulto sobre algo que ele demorou para aprender e como ele conseguiu.',
  },
  {
    id: 'pv-metas-3',
    modulo: 'metas',
    serie: 5,
    titulo: 'Meu plano de uma semana',
    historia: [
      'Davi vai apresentar um trabalho sobre os planetas na feira de ciências daqui a 5 dias.',
      'Ele fez um plano: dia 1, pesquisar; dia 2, anotar o mais importante; dia 3, fazer o cartaz; dia 4, ensaiar; dia 5, apresentar.',
      'A cada passo concluído, ele marcava um ✓ na lista colada na geladeira.',
    ],
    ideia: 'Um plano tem passos em ordem, e a gente pode ajustar quando algo muda.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'Qual ordem de passos faz mais sentido?',
        opcoes: [
          { texto: 'Pesquisar → fazer o cartaz → ensaiar', retorno: 'Isso! Primeiro se aprende o assunto, depois se prepara o material, depois se treina.', correta: true },
          { texto: 'Ensaiar → pesquisar → fazer o cartaz', retorno: 'Como ensaiar sem saber ainda o que vai falar? Tente outra ordem.' },
          { texto: 'Fazer o cartaz → ensaiar → pesquisar', retorno: 'O cartaz precisa do que foi pesquisado. Pesquisar no final fica tarde.' },
          { texto: 'Ensaiar → fazer o cartaz → pesquisar', retorno: 'A pesquisa vem antes de tudo, porque é ela que diz o que vai no cartaz e na fala.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'No dia 3, Davi ficou doente e não conseguiu fazer o cartaz. Qual é um bom ajuste no plano?',
        opcoes: [
          { texto: 'Fazer o cartaz no dia 4 e ensaiar no dia 5 de manhã, antes da feira', retorno: 'Boa! Ele mudou a ordem dos dias e manteve todos os passos.', correta: true },
          { texto: 'Desistir da feira', retorno: 'Ainda dá tempo. Um plano pode ser ajustado em vez de abandonado.' },
          { texto: 'Apresentar sem cartaz e sem ensaiar', retorno: 'Pular dois passos deixa a apresentação mais difícil. Dá para reorganizar os dias.' },
          { texto: 'Pedir para outra pessoa fazer tudo', retorno: 'Pedir ajuda é ótimo, mas o trabalho é do Davi. Ele pode reorganizar os dias que restam.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Como Davi pode saber se o plano está funcionando?',
        opcoes: [
          { texto: 'Marcando cada passo concluído na lista', retorno: 'Isso! A lista mostra o que já foi feito e o que falta.', correta: true },
          { texto: 'Esperando o último dia para ver', retorno: 'No último dia pode ser tarde para ajustar. É melhor acompanhar um pouco a cada dia.' },
          { texto: 'Não pensando nisso', retorno: 'Sem acompanhar, fica difícil perceber se algo está atrasado.' },
          { texto: 'Contando quantos dias faltam, sem olhar os passos', retorno: 'Contar os dias ajuda, mas sem olhar os passos ele não sabe se está em dia.' },
        ],
      },
    ],
    comAdulto: 'Monte com um adulto um plano de 3 passos para algo desta semana e cole numa parede para marcar ✓.',
  },

  // ---------------------------------------------------------------- DINHEIRO
  {
    id: 'pv-din-1',
    modulo: 'dinheiro',
    serie: 3,
    titulo: 'Preciso ou quero?',
    historia: [
      'Nina levou R$ 10,00 para a cantina da escola.',
      'Na cantina tinha: suco por R$ 4,00, pastel por R$ 5,00, figurinhas por R$ 3,00 e bala por R$ 2,00.',
      'Nina estava com fome e com sede, mas também queria as figurinhas novas. Ela precisava escolher.',
    ],
    ideia: 'Necessidade é o que a gente precisa. Desejo é o que a gente quer. Os dois existem, mas o dinheiro tem limite.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'Nina comprou um pastel de R$ 5,00 e pagou com uma nota de R$ 10,00. Quanto recebeu de troco?',
        opcoes: [
          { texto: 'R$ 5,00', retorno: 'Isso! 10 − 5 = 5.', correta: true },
          { texto: 'R$ 3,00', retorno: 'Confira: 5 + 3 = 8, não 10.' },
          { texto: 'R$ 10,00', retorno: 'Se ela recebesse R$ 10,00 de volta, o pastel teria saído de graça!' },
          { texto: 'R$ 15,00', retorno: 'O troco nunca é maior do que o dinheiro que a gente deu. É uma subtração.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Qual destas coisas é uma NECESSIDADE?',
        opcoes: [
          { texto: 'Beber água quando está com sede', retorno: 'Isso! Água é algo de que o corpo precisa.', correta: true },
          { texto: 'Figurinhas novas', retorno: 'Figurinhas são divertidas, mas são um desejo. Dá para viver sem elas.' },
          { texto: 'Um brinquedo igual ao do amigo', retorno: 'Querer o que o amigo tem é normal, mas é um desejo, não uma necessidade.' },
          { texto: 'Uma bala', retorno: 'Bala é gostosa, mas é um desejo. O corpo não precisa dela.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Nina tem R$ 10,00. Ela quer o suco (R$ 4,00) e o pastel (R$ 5,00). Dá para comprar os dois?',
        opcoes: [
          { texto: 'Sim. Gasta R$ 9,00 e sobra R$ 1,00.', retorno: 'Isso! 4 + 5 = 9, e 10 − 9 = 1.', correta: true },
          { texto: 'Sim. Gasta R$ 9,00 e sobram R$ 2,00.', retorno: 'Os R$ 9,00 estão certos, mas confira o que sobra: 10 − 9.' },
          { texto: 'Não. Falta R$ 1,00.', retorno: 'Some de novo: 4 + 5 = 9. Ela tem 10, então não falta.' },
          { texto: 'Não. Faltam R$ 9,00.', retorno: 'Os dois juntos custam R$ 9,00, e ela tem R$ 10,00. Dá para comprar.' },
        ],
      },
    ],
    comAdulto: 'No mercado ou na padaria com um adulto, encontre uma coisa que é necessidade e outra que é desejo.',
  },
  {
    id: 'pv-din-2',
    modulo: 'dinheiro',
    serie: 4,
    titulo: 'O cofrinho',
    historia: [
      'Davi quer comprar uma bola que custa R$ 30,00.',
      'Toda semana ele recebe uma pequena mesada e decidiu guardar R$ 5,00 no cofrinho.',
      'Para não esquecer, desenhou uma bola dividida em pedaços e pinta um pedaço a cada semana.',
    ],
    ideia: 'Guardar um pouco de cada vez ajuda a conquistar algo maior depois. Isso se chama poupar.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'Guardando R$ 5,00 por semana, em quantas semanas Davi junta R$ 30,00?',
        opcoes: [
          { texto: '6 semanas', retorno: 'Isso! 6 × 5 = 30.', correta: true },
          { texto: '5 semanas', retorno: 'Em 5 semanas ele teria 5 × 5 = 25. Ainda faltariam R$ 5,00.' },
          { texto: '25 semanas', retorno: 'Seria muito tempo! Pense: quantos R$ 5,00 cabem em R$ 30,00?' },
          { texto: '35 semanas', retorno: '35 é 30 + 5. Aqui a pergunta é quantas vezes o 5 cabe no 30.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Na 3ª semana, Davi gastou os R$ 5,00 em balas em vez de guardar. Agora, quantas semanas ele vai levar no total?',
        opcoes: [
          { texto: '7 semanas', retorno: 'Isso! Uma semana sem guardar empurra a meta uma semana para frente.', correta: true },
          { texto: '6 semanas', retorno: 'Em 6 semanas ele guardou só em 5 delas: 5 × 5 = 25. Ainda falta.' },
          { texto: '5 semanas', retorno: 'Se ele guardou menos, a meta não pode chegar mais cedo.' },
          { texto: '8 semanas', retorno: 'Ele perdeu só uma semana de guardar. Conte de novo.' },
        ],
      },
      {
        tipo: 'escolha',
        pergunta: 'Que ideia poderia ajudar Davi a chegar mais rápido na bola?',
        opcoes: [
          { texto: 'Guardar um pouco mais por semana, se der', retorno: 'Guardando R$ 6,00, por exemplo, ele chegaria em 5 semanas.' },
          { texto: 'Procurar a mesma bola mais barata em outra loja', retorno: 'Comparar preços pode diminuir a meta.' },
          { texto: 'Combinar com a família uma tarefa extra para ganhar um pouco a mais', retorno: 'Sempre combinando antes com os adultos de casa.' },
          { texto: 'Pedir a bola de presente de aniversário', retorno: 'Também vale! E o dinheiro guardado pode virar outra meta.' },
        ],
      },
    ],
    comAdulto: 'Combine com um adulto uma meta de cofrinho e desenhem juntos um quadro para pintar a cada vez que guardar.',
  },
  {
    id: 'pv-din-3',
    modulo: 'dinheiro',
    serie: 5,
    titulo: 'Comparar antes de comprar',
    historia: [
      'Lia precisa de 12 lápis de cor para a escola e tem R$ 25,00.',
      'Na loja A, a caixa com 12 lápis custa R$ 24,00. Na loja B, a caixa com 24 lápis custa R$ 36,00.',
      'Ela pegou papel e lápis para fazer as contas antes de decidir.',
    ],
    ideia: 'Mais barato por unidade nem sempre é a melhor compra. É preciso ver o que você precisa e quanto você tem.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'Quanto custa cada lápis na loja A?',
        opcoes: [
          { texto: 'R$ 2,00', retorno: 'Isso! 24 ÷ 12 = 2.', correta: true },
          { texto: 'R$ 1,00', retorno: 'Se cada um custasse R$ 1,00, os 12 custariam R$ 12,00, não R$ 24,00.' },
          { texto: 'R$ 3,00', retorno: 'Se cada um custasse R$ 3,00, os 12 custariam R$ 36,00.' },
          { texto: 'R$ 12,00', retorno: '12 é a quantidade de lápis. Divida o preço pela quantidade.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'E quanto custa cada lápis na loja B?',
        opcoes: [
          { texto: 'R$ 1,50', retorno: 'Isso! 36 ÷ 24 = 1,5. Na loja B, cada lápis sai mais barato.', correta: true },
          { texto: 'R$ 2,00', retorno: 'Com R$ 2,00 cada, os 24 custariam R$ 48,00.' },
          { texto: 'R$ 1,00', retorno: 'Com R$ 1,00 cada, os 24 custariam R$ 24,00.' },
          { texto: 'R$ 12,00', retorno: '12 é a diferença entre 36 e 24. Aqui é preciso dividir o preço pela quantidade.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Lia precisa de 12 lápis e tem R$ 25,00. Qual é a melhor escolha?',
        opcoes: [
          { texto: 'Loja A: gasta R$ 24,00 e leva exatamente o que precisa', retorno: 'Isso! A loja B é mais barata por lápis, mas custa R$ 36,00, e ela só tem R$ 25,00.', correta: true },
          { texto: 'Loja B, porque cada lápis é mais barato', retorno: 'Cada lápis é mais barato, mas a caixa custa R$ 36,00 e ela só tem R$ 25,00. Não dá.' },
          { texto: 'Comprar nas duas lojas', retorno: 'Juntas custariam R$ 60,00. E ela só precisa de 12 lápis.' },
          { texto: 'Não comprar nada', retorno: 'Ela precisa dos lápis para a escola, e uma das opções cabe no dinheiro dela.' },
        ],
      },
    ],
    comAdulto: 'No mercado, compare com um adulto dois tamanhos do mesmo produto e descubram qual sai mais barato por unidade.',
  },

  // ---------------------------------------------------------------- IDEIAS
  {
    id: 'pv-ide-1',
    modulo: 'ideias',
    serie: 3,
    titulo: 'Enxergar o problema',
    historia: [
      'Na escola da Bia, a fila do bebedouro fica enorme no recreio. Muita gente fica sem tempo de brincar.',
      'Bia ficou observando e percebeu uma coisa: a maioria das crianças estava enchendo a garrafinha inteira bem na hora do recreio.',
      'Ela pensou: "E se a gente enchesse as garrafinhas antes da aula?"',
    ],
    ideia: 'Toda boa ideia começa quando alguém percebe um problema e pensa em como melhorar.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'Qual foi o problema que a Bia percebeu?',
        opcoes: [
          { texto: 'A fila do bebedouro demora muito no recreio', retorno: 'Isso! Ela observou e entendeu o que estava causando a fila.', correta: true },
          { texto: 'O bebedouro está quebrado', retorno: 'A história não fala em bebedouro quebrado: ele funciona, mas tem gente demais na mesma hora. Releia o segundo parágrafo.' },
          { texto: 'O recreio é muito comprido', retorno: 'Na história, o recreio parece até curto, porque a fila toma tempo de brincar.' },
          { texto: 'As crianças não levam garrafinha', retorno: 'É o contrário: a história conta que elas levam a garrafinha e enchem inteira bem na hora do recreio.' },
        ],
        pista: 'Releia o começo: "a fila do bebedouro fica enorme no recreio. Muita gente fica sem tempo de brincar."',
      },
      {
        tipo: 'escolha',
        pergunta: 'Que ideia você acha que poderia ajudar?',
        opcoes: [
          { texto: 'Encher as garrafinhas antes da aula começar', retorno: 'Foi a ideia da Bia. Agora é testar para ver se funciona.' },
          { texto: 'Um cartaz lembrando de encher a garrafinha antes do recreio', retorno: 'Um lembrete ajuda as pessoas a mudarem o hábito.' },
          { texto: 'Pedir à escola para ver se dá para ter outro bebedouro', retorno: 'Às vezes a solução precisa da ajuda dos adultos.' },
          { texto: 'Fazer uma fila só para quem quer encher garrafa', retorno: 'Separar as filas pode deixar tudo mais rápido.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Antes de pôr a ideia em prática, o que é bom fazer?',
        opcoes: [
          { texto: 'Conversar com os colegas e a professora para saber o que acham', retorno: 'Isso! Ouvir as pessoas ajuda a melhorar a ideia antes de testar.', correta: true },
          { texto: 'Fazer sem contar para ninguém', retorno: 'Se ninguém souber, fica difícil a ideia funcionar. Ela depende de todos.' },
          { texto: 'Desistir porque parece difícil', retorno: 'Ainda nem testou! Vale tentar antes de desistir.' },
          { texto: 'Esperar alguém resolver', retorno: 'Pode ser que ninguém resolva. Quem percebeu o problema pode começar.' },
        ],
      },
    ],
    comAdulto: 'Observe sua casa ou sua escola e conte para um adulto um pequeno problema que você percebeu e uma ideia para melhorar.',
  },
  {
    id: 'pv-ide-2',
    modulo: 'ideias',
    serie: 4,
    titulo: 'Testar e melhorar',
    historia: [
      'A turma do Téo montou uma barraca de limonada na festa da escola para juntar dinheiro para um passeio.',
      'No primeiro dia, muitas pessoas compraram, mas deixaram metade no copo. A limonada estava azeda demais.',
      'No dia seguinte, eles perguntaram o que as pessoas acharam, mudaram a receita e venderam muito mais.',
    ],
    ideia: 'Quem cria algo testa, escuta as pessoas e melhora. Errar no começo faz parte.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'No primeiro dia, as pessoas deixaram metade da limonada. O que a turma deve fazer?',
        opcoes: [
          { texto: 'Perguntar o que acharam e ajustar a receita', retorno: 'Isso! Ouvir quem usa o que você faz é o melhor jeito de melhorar.', correta: true },
          { texto: 'Culpar as pessoas por não gostarem', retorno: 'As pessoas estão dando uma pista. É melhor aprender com ela.' },
          { texto: 'Fazer igual, só que mais rápido', retorno: 'Se a limonada continuar azeda, o problema continua.' },
          { texto: 'Fechar a barraca para sempre', retorno: 'Um primeiro dia ruim não significa que a ideia é ruim. Dá para melhorar.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Cada copo custa R$ 3,00. No segundo dia, venderam 15 copos. Quanto dinheiro ganharam com as vendas?',
        opcoes: [
          { texto: 'R$ 45,00', retorno: 'Isso! 15 × 3 = 45.', correta: true },
          { texto: 'R$ 18,00', retorno: '18 é 15 + 3. Como são 15 copos de R$ 3,00, é uma multiplicação.' },
          { texto: 'R$ 30,00', retorno: 'R$ 30,00 seriam 10 copos. Eles venderam 15.' },
          { texto: 'R$ 53,00', retorno: 'Passou um pouco. Confira: 15 × 3.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Os limões e o açúcar custaram R$ 20,00. Dos R$ 45,00, quanto sobrou para o passeio?',
        opcoes: [
          { texto: 'R$ 25,00', retorno: 'Isso! 45 − 20 = 25. O que sobra depois de pagar os custos se chama lucro.', correta: true },
          { texto: 'R$ 45,00', retorno: 'Antes, é preciso pagar os limões e o açúcar. Esse dinheiro também saiu da venda.' },
          { texto: 'R$ 65,00', retorno: '65 é 45 + 20. Os custos são tirados, não somados.' },
          { texto: 'R$ 15,00', retorno: 'Confira a conta: 45 − 20.' },
        ],
      },
    ],
    comAdulto: 'Pense com um adulto em algo que você faz (um desenho, uma receita, uma brincadeira) e pergunte a alguém como você pode melhorar.',
  },
  {
    id: 'pv-ide-3',
    modulo: 'ideias',
    serie: 5,
    titulo: 'Ideias que ajudam pessoas',
    historia: [
      'No prédio da Nina mora dona Cida, que tem 80 anos. Nina percebeu que ela tinha dificuldade para carregar as sacolas do mercado.',
      'Com a autorização dos pais, Nina perguntou à dona Cida se ela queria ajuda. Ela disse que sim, nas sextas-feiras.',
      'Nina chamou mais dois amigos do prédio. Eles combinaram quem ajudaria em cada sexta.',
    ],
    ideia: 'Empreender não é só ganhar dinheiro. É perceber o que as pessoas precisam e organizar uma solução.',
    atividades: [
      {
        tipo: 'certa',
        pergunta: 'O que a Nina fez de diferente?',
        opcoes: [
          { texto: 'Percebeu uma necessidade, perguntou e organizou uma solução', retorno: 'Isso! Ela observou, ouviu a dona Cida e organizou um grupo.', correta: true },
          { texto: 'Esperou alguém do prédio resolver', retorno: 'Na história, foi a própria Nina que começou.' },
          { texto: 'Ajudou sem perguntar se a dona Cida queria', retorno: 'Nina fez diferente: ela perguntou antes. Saber o que a pessoa quer é muito importante.' },
          { texto: 'Cobrou pela ajuda', retorno: 'Na história, a ajuda era um gesto de cuidado. Nem toda ideia precisa ganhar dinheiro.' },
        ],
      },
      {
        tipo: 'certa',
        pergunta: 'Para o grupo funcionar, o que é mais importante combinar?',
        opcoes: [
          { texto: 'Quem ajuda em cada sexta-feira', retorno: 'Isso! Com tudo combinado, ninguém esquece e ninguém fica com trabalho demais.', correta: true },
          { texto: 'Quem é o chefe que manda em todo mundo', retorno: 'Em um bom grupo, todos combinam juntos. Mais importante é dividir as tarefas.' },
          { texto: 'Quem vai ganhar mais elogios', retorno: 'O objetivo é ajudar a dona Cida, não ganhar elogios.' },
          { texto: 'Nada, cada um ajuda quando lembrar', retorno: 'Sem combinar, pode ser que ninguém apareça numa sexta.' },
        ],
      },
      {
        tipo: 'escolha',
        pergunta: 'Que tipo de ideia você gostaria de criar um dia?',
        opcoes: [
          { texto: 'Uma ideia para ajudar pessoas', retorno: 'Comece observando quem está perto de você.' },
          { texto: 'Uma ideia para cuidar da natureza ou dos animais', retorno: 'Pequenas ações, como separar o lixo, já fazem diferença.' },
          { texto: 'Uma invenção nova', retorno: 'Toda invenção começa com um desenho ou um teste simples.' },
          { texto: 'Um pequeno negócio', retorno: 'Um negócio também resolve um problema de alguém, e sempre com um adulto junto.' },
        ],
      },
    ],
    comAdulto: 'Pense com um adulto em alguém da família ou da vizinhança que poderia receber uma pequena ajuda sua, e combinem como fazer com segurança.',
  },
]

export const LICOES_POR_MODULO: Map<ModuloPV, LicaoPV[]> = new Map(
  MODULOS_PV.map((m) => [m.id, LICOES_PV.filter((l) => l.modulo === m.id).sort((a, b) => a.serie - b.serie)]),
)
