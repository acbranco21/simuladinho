// Cálculos do painel do administrador. Funções puras, cobertas por testes.
import type { Nivel, Trilha } from '../tipos'
import { calcularNota } from './pontuacao'
import { PROGRESSAO, avaliarProgressao, type ModoProgressao } from './progressao'

export interface RespostaPainel {
  sessaoId: number
  questaoId: string
  trilha: Trilha
  habilidade: string
  pontos: 3 | 4 | 5
  correta: boolean
  em: number
}

export interface SessaoPainel {
  id: number
  inicio: number
  fim: number
  nota: number
  concluida: boolean
  sinais: number
  nivelPorTrilha?: Partial<Record<Trilha, Nivel>>
}

const DIA = 86400000

/** Minutos de uso no dia de `agora` (soma da duração das sessões iniciadas hoje). */
export function minutosNoDia(sessoes: Pick<SessaoPainel, 'inicio' | 'fim'>[], agora: Date): number {
  const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime()
  const ms = sessoes.filter((s) => s.inicio >= inicioDia && s.inicio < inicioDia + DIA).reduce((t, s) => t + Math.max(0, s.fim - s.inicio), 0)
  return Math.round(ms / 60000)
}

export interface Indicadores {
  sessoes7d: number
  notaMedia5: number | null
  minutosHoje: number
  sessoesComCansaco7d: number
  questoesRespondidas: number
}

export function indicadores(sessoes: SessaoPainel[], totalRespostas: number, agora: Date): Indicadores {
  const desde = agora.getTime() - 7 * DIA
  const recentes = sessoes.filter((s) => s.inicio >= desde)
  const ultimas = [...sessoes].filter((s) => s.concluida).sort((a, b) => a.inicio - b.inicio).slice(-5)
  return {
    sessoes7d: recentes.length,
    notaMedia5: ultimas.length ? Math.round((ultimas.reduce((t, s) => t + s.nota, 0) / ultimas.length) * 10) / 10 : null,
    minutosHoje: minutosNoDia(sessoes, agora),
    sessoesComCansaco7d: recentes.filter((s) => s.sinais >= 2 || !s.concluida).length,
    questoesRespondidas: totalRespostas,
  }
}

/** Nota de cada trilha em cada sessão, em ordem cronológica. */
export function notasPorTrilhaPorSessao(sessoes: SessaoPainel[], respostas: RespostaPainel[]): Map<Trilha, { sessaoId: number; nota: number; nivel?: Nivel }[]> {
  const porSessao = new Map<number, RespostaPainel[]>()
  for (const r of respostas) porSessao.set(r.sessaoId, [...(porSessao.get(r.sessaoId) ?? []), r])
  const saida = new Map<Trilha, { sessaoId: number; nota: number; nivel?: Nivel }[]>()
  for (const s of [...sessoes].sort((a, b) => a.inicio - b.inicio)) {
    const rs = porSessao.get(s.id) ?? []
    const trilhas = new Set(rs.map((r) => r.trilha))
    for (const t of trilhas) {
      const nota = calcularNota(rs.filter((r) => r.trilha === t))
      saida.set(t, [...(saida.get(t) ?? []), { sessaoId: s.id, nota, nivel: s.nivelPorTrilha?.[t] }])
    }
  }
  return saida
}

export type Tendencia = 'subindo' | 'estavel' | 'caindo' | 'poucos_dados'

/** Compara a média das 3 últimas notas com a das 3 anteriores (diferença mínima de 0,5). */
export function tendencia(notas: number[]): Tendencia {
  if (notas.length < 4) return 'poucos_dados'
  const ult = notas.slice(-3)
  const ant = notas.slice(-6, -3)
  const m = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  const d = m(ult) - m(ant)
  if (d >= 0.5) return 'subindo'
  if (d <= -0.5) return 'caindo'
  return 'estavel'
}

/** Habilidade com menor taxa de acerto (mínimo de 3 respostas). */
export function habilidadeMaisFraca(respostas: Pick<RespostaPainel, 'habilidade' | 'correta'>[]): { habilidade: string; acerto: number; total: number } | null {
  const mapa = new Map<string, { ok: number; total: number }>()
  for (const r of respostas) {
    const v = mapa.get(r.habilidade) ?? { ok: 0, total: 0 }
    v.total += 1
    if (r.correta) v.ok += 1
    mapa.set(r.habilidade, v)
  }
  let pior: { habilidade: string; acerto: number; total: number } | null = null
  for (const [habilidade, v] of mapa) {
    if (v.total < 3) continue
    const acerto = v.ok / v.total
    if (!pior || acerto < pior.acerto) pior = { habilidade, acerto, total: v.total }
  }
  return pior
}

export interface LinhaTrilha {
  trilha: Trilha
  nivel: Nivel
  media5: number | null
  tendencia: Tendencia
  fraca: { habilidade: string; acerto: number; total: number } | null
  sugestao: string
}

export function desempenhoPorTrilha(
  trilhas: Trilha[],
  nivelAtual: Partial<Record<Trilha, Nivel>>,
  modo: ModoProgressao,
  sessoes: SessaoPainel[],
  respostas: RespostaPainel[],
): LinhaTrilha[] {
  const notas = notasPorTrilhaPorSessao(sessoes, respostas)
  return trilhas.map((t) => {
    const nivel = nivelAtual[t] ?? 'base'
    const todas = (notas.get(t) ?? []).map((n) => n.nota)
    const doNivel = (notas.get(t) ?? []).filter((n) => (n.nivel ?? 'base') === nivel).map((n) => n.nota)
    const ult = todas.slice(-5)
    const fraca = habilidadeMaisFraca(respostas.filter((r) => r.trilha === t))
    let sugestao = 'Manter o nível'
    if (!todas.length) sugestao = 'Ainda sem treinos'
    else if (avaliarProgressao(nivel, doNivel, 'automatica') !== nivel) sugestao = modo === 'automatica' ? 'Vai subir de nível no próximo treino' : 'Pronta para subir de nível'
    else if (fraca && fraca.acerto < PROGRESSAO.acertoMinimoHabilidade) sugestao = `Reforçar: ${fraca.habilidade}`
    return {
      trilha: t,
      nivel,
      media5: ult.length ? Math.round((ult.reduce((a, b) => a + b, 0) / ult.length) * 10) / 10 : null,
      tendencia: tendencia(todas),
      fraca,
      sugestao,
    }
  })
}

/** Questões com acerto atípico: pelo menos 5 respostas e menos de 20% de acerto. */
export function questoesAtipicas(respostas: Pick<RespostaPainel, 'questaoId' | 'correta'>[]): { questaoId: string; acerto: number; total: number }[] {
  const mapa = new Map<string, { ok: number; total: number }>()
  for (const r of respostas) {
    const v = mapa.get(r.questaoId) ?? { ok: 0, total: 0 }
    v.total += 1
    if (r.correta) v.ok += 1
    mapa.set(r.questaoId, v)
  }
  return [...mapa.entries()]
    .filter(([, v]) => v.total >= 5 && v.ok / v.total < 0.2)
    .map(([questaoId, v]) => ({ questaoId, acerto: v.ok / v.total, total: v.total }))
}
