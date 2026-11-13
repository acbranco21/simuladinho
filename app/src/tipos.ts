// Tipos compartilhados. Espelham conteudo/questoes/schema-questao.json.

export type Trilha = 'portugues' | 'matematica' | 'logica' | 'conhecimentos'
export type Nivel = 'base' | 'avanco' | 'desafio'
export type Letra = 'A' | 'B' | 'C' | 'D' | 'E'
/** Série escolar (3º ao 9º ano do fundamental). */
export type Serie = 3 | 4 | 5 | 6 | 7 | 8 | 9
export const SERIES: Serie[] = [3, 4, 5, 6, 7, 8, 9]
/** Coleções próprias (questões originais), por perfil de prova. */
export type Colecao = 'base' | 'bolsa' | 'olimpico'
export const COLECOES: { id: Colecao; nome: string; descricao: string }[] = [
  { id: 'base', nome: 'Base BNCC', descricao: 'O conteúdo da série, direto ao ponto' },
  { id: 'bolsa', nome: 'Prova de Bolsa', descricao: 'Enunciados longos, várias etapas, como nas provas de colégio' },
  { id: 'olimpico', nome: 'Desafio Olímpico', descricao: 'Raciocínio, padrões e problemas para pensar fora da caixa' },
]
export type FormaNome = 'circulo' | 'quadrado' | 'triangulo' | 'estrela' | 'losango'

export interface Figura {
  tipo: string
  parametros: Record<string, unknown>
}

export interface Alternativa {
  letra: Letra
  texto: string
  figura?: Figura | null
  erro_tipico: string | null
}

export interface Questao {
  id: string
  trilha: Trilha
  bloco: string
  habilidade: string
  nivel: Nivel
  /** Série da questão. Questões antigas sem o campo: base = 3º, avanço = 4º, desafio = 5º (ver dados/banco.ts). */
  serie?: Serie
  /** Coleção própria; sem o campo = 'base'. */
  colecao?: Colecao
  dificuldade: number
  pontos?: 3 | 4 | 5
  formato: string
  positivo_unidade?: string | null
  texto_apoio?: string | null
  enunciado: string
  figura?: Figura | null
  alternativas: Alternativa[]
  gabarito: Letra
  explicacao: string
  dica?: string | null
  pilula_id?: string | null
  revisao: { status: string }
}

export interface RespostaRegistro {
  questaoId: string
  trilha: Trilha
  habilidade: string
  pontos: 3 | 4 | 5
  /** null = deixada em branco (só no simulado). */
  escolha: Letra | null
  correta: boolean
  tempoMs: number
  em: number
}

export const NOMES_TRILHA: Record<Trilha, string> = {
  portugues: 'Português',
  matematica: 'Matemática',
  logica: 'Lógica',
  conhecimentos: 'Conhecimentos',
}
