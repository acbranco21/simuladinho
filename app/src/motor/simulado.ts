import type { Nivel, Questao, Trilha } from '../tipos'
import { pontosDaQuestao } from './pontuacao'
import { criarSorteio, montarSessao, type MisturaDificuldade } from './sessao'

export interface FormatoSimulado {
  questoes: 10 | 20
}

/** Tempo da prova real de referência: 20 questões em 90 minutos (4,5 min por questão). */
export function minutosDoSimulado(f: FormatoSimulado): number {
  return Math.round(f.questoes * 4.5)
}

/**
 * Monta um simulado como as provas de bolsa: metade Português, metade Matemática,
 * cada bloco em ordem crescente de dificuldade (como no Canguru).
 */
export function montarSimulado(
  banco: Questao[],
  formato: FormatoSimulado,
  nivelPorTrilha: Partial<Record<Trilha, Nivel>>,
  mistura: MisturaDificuldade,
  excluir: Set<string>,
  semente?: number,
): Questao[] {
  const metade = formato.questoes / 2
  const sorteio = criarSorteio(semente)
  const bloco = (t: Trilha, s: number) =>
    montarSessao(banco, { tamanho: metade, trilhas: [t], nivelPorTrilha, mistura, excluir, semente: s }).sort((a, b) => pontosDaQuestao(a) - pontosDaQuestao(b))
  const s1 = Math.floor(sorteio() * 1e9)
  const s2 = Math.floor(sorteio() * 1e9)
  return [...bloco('portugues', s1), ...bloco('matematica', s2)]
}
