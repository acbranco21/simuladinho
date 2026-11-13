import type { Colecao, Questao, Serie, Trilha } from '../tipos'
import { pontosDaQuestao } from './pontuacao'
import { criarSorteio, montarSessao, serieDa, type MisturaDificuldade } from './sessao'

export interface FormatoSimulado {
  questoes: 10 | 20
}

/** O simulado oficial é de ALTA dificuldade: só médias e difíceis, com predominância de difíceis. */
export const MISTURA_OFICIAL: MisturaDificuldade = { facil: 0, media: 25, dificil: 75 }

/** Série cobrada no simulado oficial: a seguinte à cadastrada (até o 9º ano). */
export function serieDoSimulado(serieAtual: Serie): Serie {
  return Math.min(9, serieAtual + 1) as Serie
}

/** Tempo da prova real de referência: 20 questões em 90 minutos (4,5 min por questão). */
export function minutosDoSimulado(f: FormatoSimulado): number {
  return Math.round(f.questoes * 4.5)
}

/**
 * Monta o simulado oficial como as provas de bolsa: metade Português, metade Matemática,
 * da série seguinte à da aluna, alta dificuldade, cada bloco em ordem crescente de pontos (como no Canguru).
 * Se a série-alvo não tiver questões suficientes de uma matéria, completa com a série atual.
 */
export function montarSimulado(
  banco: Questao[],
  formato: FormatoSimulado,
  serieAlvo: Serie,
  colecoes: Colecao[] | undefined,
  excluir: Set<string>,
  semente?: number,
): Questao[] {
  const metade = formato.questoes / 2
  const sorteio = criarSorteio(semente)
  const bloco = (t: Trilha) => {
    const base = { tamanho: metade, trilhas: [t], nivelPorTrilha: {}, mistura: MISTURA_OFICIAL, colecoes, semente: Math.floor(sorteio() * 1e9) }
    const daSerie = montarSessao(banco, { ...base, serieFixa: serieAlvo, excluir })
    if (daSerie.length < metade && serieAlvo > 3) {
      const usados = new Set([...excluir, ...daSerie.map((q) => q.id)])
      daSerie.push(...montarSessao(banco, { ...base, tamanho: metade - daSerie.length, serieFixa: (serieAlvo - 1) as Serie, excluir: usados }))
    }
    return daSerie.sort((a, b) => pontosDaQuestao(a) - pontosDaQuestao(b) || serieDa(a) - serieDa(b))
  }
  return [...bloco('portugues'), ...bloco('matematica')]
}
