import type { Nivel, Trilha } from './tipos'
import type { MisturaDificuldade } from './motor/sessao'

/** Troque pelo nome dela. */
export const NOME_ALUNA = '[NOME DELA]'

/** Trilhas com questões objetivas no MVP (Redação entra com o painel do administrador). */
export const TRILHAS_ATIVAS: Trilha[] = ['portugues', 'matematica', 'logica']

/** Enquanto o painel do administrador não existe, os ajustes ficam aqui. */
export const NIVEL_POR_TRILHA: Partial<Record<Trilha, Nivel>> = {
  portugues: 'base',
  matematica: 'base',
  logica: 'base',
}

export const MISTURA_PADRAO: MisturaDificuldade = { facil: 40, media: 40, dificil: 20 }
