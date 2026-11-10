import type { Nivel } from '../tipos'

export type ModoProgressao = 'automatica' | 'manual' | 'travada'

/** Regra inicial proposta: 3 notas seguidas ≥ 8,0 na trilha. A calibrar. */
export const PROGRESSAO = { notaMinima: 8, sessoesSeguidas: 3, acertoMinimoHabilidade: 0.6 }

const ORDEM: Nivel[] = ['base', 'avanco', 'desafio']

export function proximoNivel(nivel: Nivel): Nivel {
  const i = ORDEM.indexOf(nivel)
  return ORDEM[Math.min(i + 1, ORDEM.length - 1)]
}

/**
 * Retorna o novo nível da trilha (ou o mesmo).
 * @param notasDaTrilha notas da trilha no nível atual, mais recente por último
 */
export function avaliarProgressao(nivel: Nivel, notasDaTrilha: number[], modo: ModoProgressao): Nivel {
  if (modo !== 'automatica' || nivel === 'desafio') return nivel
  const ultimas = notasDaTrilha.slice(-PROGRESSAO.sessoesSeguidas)
  if (ultimas.length === PROGRESSAO.sessoesSeguidas && ultimas.every((n) => n >= PROGRESSAO.notaMinima)) {
    return proximoNivel(nivel)
  }
  return nivel
}

/**
 * Habilidades com acerto abaixo do mínimo em pelo menos 2 sessões.
 * @param porSessao para cada sessão, o acerto (0–1) de cada habilidade praticada
 */
export function habilidadesParaRevisar(porSessao: Record<string, number>[]): string[] {
  const contagem = new Map<string, number>()
  for (const sessao of porSessao) {
    for (const [hab, acerto] of Object.entries(sessao)) {
      if (acerto < PROGRESSAO.acertoMinimoHabilidade) contagem.set(hab, (contagem.get(hab) ?? 0) + 1)
    }
  }
  return [...contagem.entries()].filter(([, n]) => n >= 2).map(([h]) => h)
}
