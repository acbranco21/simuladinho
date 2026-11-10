import type { RespostaRegistro, Trilha } from '../tipos'

export type Sinal = 'tempo_subindo' | 'chute' | 'queda_acerto'

/** Parâmetros iniciais — propostos para calibrar com o uso, não são normas. */
export const LIMITES = {
  /** Resposta mais rápida que isso e errada conta como possível chute. */
  chuteMs: 4000,
  /** Quantos chutes nas últimas 4 respostas disparam o sinal. */
  chutesNaJanela: 2,
  /** Queda de acerto (pontos percentuais) em relação à média dela. */
  quedaAcerto: 0.25,
  /** Mínimo de sinais distintos para propor encerrar. */
  sinaisParaEncerrar: 2,
}

/**
 * Detecta sinais de cansaço/tédio na sessão atual.
 * @param respostas respostas da sessão, em ordem
 * @param mediaAcerto taxa histórica de acerto dela por trilha (0–1), se houver
 */
export function detectarSinais(
  respostas: Pick<RespostaRegistro, 'tempoMs' | 'correta' | 'trilha'>[],
  mediaAcerto: Partial<Record<Trilha, number>> = {},
): Sinal[] {
  const sinais: Sinal[] = []

  // 1) Tempo por questão subindo 3 vezes seguidas (4 últimas respostas crescentes).
  if (respostas.length >= 4) {
    const t = respostas.slice(-4).map((r) => r.tempoMs)
    if (t[0] < t[1] && t[1] < t[2] && t[2] < t[3]) sinais.push('tempo_subindo')
  }

  // 2) Respostas rápidas e erradas.
  const janela = respostas.slice(-4)
  const chutes = janela.filter((r) => !r.correta && r.tempoMs < LIMITES.chuteMs).length
  if (chutes >= LIMITES.chutesNaJanela) sinais.push('chute')

  // 3) Acerto das últimas 4 bem abaixo da média histórica das trilhas envolvidas.
  if (janela.length === 4) {
    const medias = janela.map((r) => mediaAcerto[r.trilha]).filter((m): m is number => m !== undefined)
    if (medias.length === 4) {
      const esperado = medias.reduce((a, b) => a + b, 0) / 4
      const obtido = janela.filter((r) => r.correta).length / 4
      if (obtido < esperado - LIMITES.quedaAcerto) sinais.push('queda_acerto')
    }
  }

  return sinais
}

export function deveProporEncerrar(sinais: Sinal[]): boolean {
  return new Set(sinais).size >= LIMITES.sinaisParaEncerrar
}
