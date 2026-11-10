/** Valores iniciais propostos (a calibrar com o uso). */
export const TAMANHO = {
  inicialTreino: 10,
  minimo: 6,
  maximo: 20,
  passo: 2,
  /** Sessões seguidas sem sinais para aumentar o tamanho. */
  sessoesParaAumentar: 3,
  cacaAosErros: 5,
}

export interface HistoricoSessao {
  concluida: boolean
  /** Quantidade de sinais distintos registrados na sessão. */
  sinais: number
}

/**
 * Decide o tamanho do próximo treino diário a partir do tamanho atual e das sessões anteriores
 * (mais recente por último).
 */
export function proximoTamanhoTreino(atual: number, historico: HistoricoSessao[]): number {
  const ultima = historico.at(-1)
  if (!ultima) return atual
  if (!ultima.concluida || ultima.sinais >= 2) {
    return Math.max(TAMANHO.minimo, atual - TAMANHO.passo)
  }
  const recentes = historico.slice(-TAMANHO.sessoesParaAumentar)
  if (recentes.length === TAMANHO.sessoesParaAumentar && recentes.every((s) => s.concluida && s.sinais === 0)) {
    return Math.min(TAMANHO.maximo, atual + TAMANHO.passo)
  }
  return atual
}
