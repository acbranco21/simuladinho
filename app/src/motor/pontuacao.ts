import type { Questao, RespostaRegistro, Trilha } from '../tipos'

/** Fácil (1–2) = 3 pontos, média (3) = 4, difícil (4–5) = 5. Inspirado no Canguru. */
export function pontosDaQuestao(q: Pick<Questao, 'dificuldade' | 'pontos'>): 3 | 4 | 5 {
  if (q.pontos) return q.pontos
  if (q.dificuldade <= 2) return 3
  if (q.dificuldade === 3) return 4
  return 5
}

/** Nota de 0 a 10 com uma casa decimal: pontos obtidos ÷ pontos possíveis × 10. */
export function calcularNota(respostas: Pick<RespostaRegistro, 'pontos' | 'correta'>[]): number {
  const possiveis = respostas.reduce((s, r) => s + r.pontos, 0)
  if (possiveis === 0) return 0
  const obtidos = respostas.reduce((s, r) => s + (r.correta ? r.pontos : 0), 0)
  return Math.round((obtidos / possiveis) * 100) / 10
}

export interface ResumoTrilha {
  trilha: Trilha
  acertos: number
  total: number
}

export function resumoPorTrilha(respostas: Pick<RespostaRegistro, 'trilha' | 'correta'>[]): ResumoTrilha[] {
  const mapa = new Map<Trilha, ResumoTrilha>()
  for (const r of respostas) {
    const atual = mapa.get(r.trilha) ?? { trilha: r.trilha, acertos: 0, total: 0 }
    atual.total += 1
    if (r.correta) atual.acertos += 1
    mapa.set(r.trilha, atual)
  }
  return [...mapa.values()]
}

/** Formata 8.2 → "8,2" (padrão brasileiro). */
export function formatarNota(n: number): string {
  return n.toFixed(1).replace('.', ',')
}
