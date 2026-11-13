import { LICOES_POR_MODULO, type LicaoPV, type ModuloPV } from '../conteudo/projeto-vida'

/** Como o responsável (ou, na versão escolar, o professor) controla cada módulo. */
export type EstadoModulo = 'auto' | 'liberado' | 'bloqueado'

export interface ConfigProjetoVida {
  ativo: boolean
  modulos: Partial<Record<ModuloPV, EstadoModulo>>
}

export const PV_PADRAO: ConfigProjetoVida = { ativo: true, modulos: {} }

/** XP por lição concluída pela primeira vez. Não há nota. */
export const XP_LICAO = 15

/** Regras de liberação automática (valores propostos, ajustáveis). */
export const REGRAS_PV = {
  emocoesSessoes: 1,
  metasSessoes: 3,
  dinheiroQuestoesMat: 20,
  dinheiroAcertoMat: 0.6,
}

export interface ProgressoAluna {
  /** Sessões concluídas (treino, caça aos erros, simulado ou pílula). */
  sessoesConcluidas: number
  matematica?: { acerto: number; total: number }
  /** Lição concluída → dia local (AAAA-MM-DD) da primeira conclusão. */
  concluidas: Map<string, string>
  /**
   * Série que ela já alcançou (série atual + o quanto subiu em Matemática: Base +0, Avanço +1, Desafio +2).
   * No modo automático, uma lição só abre se a série dela for no máximo esta. Sem valor: sem trava por série.
   */
  serieAlcancada?: number
}

/** Série alcançada a partir da série atual e do nível de Matemática. */
export function serieAlcancada(serieAtual: number, nivelMatematica: 'base' | 'avanco' | 'desafio' = 'base'): number {
  return serieAtual + { base: 0, avanco: 1, desafio: 2 }[nivelMatematica]
}

function moduloTemConcluida(m: ModuloPV, p: ProgressoAluna): boolean {
  return (LICOES_POR_MODULO.get(m) ?? []).some((l) => p.concluidas.has(l.id))
}

/** O módulo abriria sozinho, pelo avanço da aluna? */
export function liberadoPeloAvanco(m: ModuloPV, p: ProgressoAluna): boolean {
  switch (m) {
    case 'emocoes':
      return p.sessoesConcluidas >= REGRAS_PV.emocoesSessoes
    case 'metas':
      return p.sessoesConcluidas >= REGRAS_PV.metasSessoes
    case 'dinheiro':
      return !!p.matematica && p.matematica.total >= REGRAS_PV.dinheiroQuestoesMat && p.matematica.acerto >= REGRAS_PV.dinheiroAcertoMat
    case 'ideias':
      return moduloTemConcluida('metas', p) && moduloTemConcluida('dinheiro', p)
  }
}

export type SituacaoModulo = 'aberto' | 'trancado' | 'bloqueado'

export function situacaoModulo(m: ModuloPV, cfg: ConfigProjetoVida, p: ProgressoAluna): SituacaoModulo {
  const estado = cfg.modulos[m] ?? 'auto'
  if (estado === 'bloqueado') return 'bloqueado'
  if (estado === 'liberado') return 'aberto'
  return liberadoPeloAvanco(m, p) ? 'aberto' : 'trancado'
}

export type SituacaoLicao = 'concluida' | 'disponivel' | 'amanha' | 'trancada' | 'serie'

/**
 * Situação de cada lição do módulo.
 * - Módulo trancado/bloqueado: todas trancadas (as concluídas continuam concluídas).
 * - Automático: em ordem, uma nova por dia (a próxima abre no dia seguinte à conclusão da anterior),
 *   e só até a série que ela alcançou ('serie': espera ela avançar em Matemática).
 * - Liberado manualmente: todas disponíveis.
 */
export function situacaoLicoes(m: ModuloPV, cfg: ConfigProjetoVida, p: ProgressoAluna, hoje: string): { licao: LicaoPV; situacao: SituacaoLicao }[] {
  const licoes = LICOES_POR_MODULO.get(m) ?? []
  const sm = situacaoModulo(m, cfg, p)
  const manual = (cfg.modulos[m] ?? 'auto') === 'liberado'
  return licoes.map((licao, i) => {
    if (p.concluidas.has(licao.id)) return { licao, situacao: 'concluida' }
    if (sm !== 'aberto') return { licao, situacao: 'trancada' }
    if (manual) return { licao, situacao: 'disponivel' }
    if (p.serieAlcancada !== undefined && licao.serie > p.serieAlcancada) return { licao, situacao: 'serie' }
    if (i === 0) return { licao, situacao: 'disponivel' }
    const anterior = p.concluidas.get(licoes[i - 1].id)
    if (!anterior) return { licao, situacao: 'trancada' }
    return { licao, situacao: anterior < hoje ? 'disponivel' : 'amanha' }
  })
}

/** Quantas lições estão esperando por ela agora (para o atalho da tela inicial). */
export function licoesDisponiveis(cfg: ConfigProjetoVida, p: ProgressoAluna, hoje: string, modulos: ModuloPV[]): number {
  if (!cfg.ativo) return 0
  return modulos.reduce((t, m) => t + situacaoLicoes(m, cfg, p, hoje).filter((x) => x.situacao === 'disponivel').length, 0)
}
