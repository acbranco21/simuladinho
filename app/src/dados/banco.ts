import type { Colecao, Nivel, Questao, Serie } from '../tipos'
import exemplos from './questoes-exemplo.json'
import lote1 from './questoes-lote1.json'
import lote2 from './questoes-lote2.json'

const SERIE_DO_NIVEL: Record<Nivel, Serie> = { base: 3, avanco: 4, desafio: 5 }

/** Toda questão sai daqui com série e coleção preenchidas. */
export function normalizar(q: Questao): Questao & { serie: Serie; colecao: Colecao } {
  return { ...q, serie: q.serie ?? SERIE_DO_NIVEL[q.nivel], colecao: q.colecao ?? 'base' }
}

export const BANCO = ([...exemplos, ...lote1, ...lote2] as Questao[]).map(normalizar)
