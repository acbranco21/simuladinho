import type { Nivel, Trilha } from './tipos'
import type { MisturaDificuldade } from './motor/sessao'
import type { ModoProgressao } from './motor/progressao'
import type { FormatoSimulado } from './motor/simulado'

export const NOME_APP = 'Simuladinho'

/** Ajustes que o administrador muda no painel. Ficam salvos no tablet (IndexedDB). */
export interface Configuracao {
  id: 'config'
  nomeAluna: string
  trilhasAtivas: Trilha[]
  nivelPorTrilha: Partial<Record<Trilha, Nivel>>
  mistura: MisturaDificuldade
  progressao: ModoProgressao
  /** Minutos por dia; 0 = sem limite. */
  limiteDiarioMin: number
  /** Se false, usa `tamanhoTreinoFixo`. */
  iaAjustaTamanho: boolean
  tamanhoTreinoFixo: number
  /** Simulado de prova: 10 questões (treino de resistência, 45 min) ou 20 (prova completa, 90 min). */
  simulado: FormatoSimulado
  /** Até onde a turma chegou no material Positivo, por trilha (texto livre). */
  positivoUnidade: Partial<Record<Trilha, string>>
  /** Hash do PIN do painel (SHA-256), ou null se ainda não foi criado. */
  pinHash: string | null
  /** Registro das mudanças de nível, para o gráfico de evolução. */
  historicoNiveis: { trilha: Trilha; de: Nivel; para: Nivel; em: number; motivo: 'automatica' | 'manual' }[]
}

/** Trilhas com questões objetivas disponíveis hoje. */
export const TRILHAS_DISPONIVEIS: Trilha[] = ['portugues', 'matematica', 'logica']

export const CONFIG_PADRAO: Configuracao = {
  id: 'config',
  nomeAluna: '',
  trilhasAtivas: ['portugues', 'matematica', 'logica'],
  nivelPorTrilha: { portugues: 'base', matematica: 'base', logica: 'base' },
  mistura: { facil: 40, media: 40, dificil: 20 },
  progressao: 'automatica',
  limiteDiarioMin: 30,
  iaAjustaTamanho: true,
  tamanhoTreinoFixo: 10,
  simulado: { questoes: 10 },
  positivoUnidade: {},
  pinHash: null,
  historicoNiveis: [],
}
