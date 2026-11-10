// Tipos compartilhados. Espelham conteudo/questoes/schema-questao.json.

export type Trilha = 'portugues' | 'matematica' | 'logica' | 'conhecimentos'
export type Nivel = 'base' | 'avanco' | 'desafio'
export type Letra = 'A' | 'B' | 'C' | 'D' | 'E'
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
  escolha: Letra
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
