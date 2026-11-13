import { describe, expect, it } from 'vitest'
import { BANCO } from '../dados/banco'
import { pontosDaQuestao } from './pontuacao'
import { colecaoDa, montarSessao, serieDa } from './sessao'
import { montarSimulado, serieDoSimulado } from './simulado'
import { SERIES, type Trilha } from '../tipos'

const MISTA = { facil: 40, media: 40, dificil: 20 }
const TODAS: Trilha[] = ['portugues', 'matematica', 'logica']

describe('banco do 3º ao 9º ano', () => {
  it('toda série tem questões de Português, Matemática e Lógica', () => {
    for (const s of SERIES) for (const t of TODAS) expect(BANCO.filter((q) => q.serie === s && q.trilha === t).length, `${s}º ${t}`).toBeGreaterThanOrEqual(10)
  })
  it('do 4º ao 9º ano há as três coleções', () => {
    for (const s of SERIES.filter((x) => x >= 4)) for (const c of ['base', 'bolsa', 'olimpico'] as const) expect(BANCO.some((q) => q.serie === s && q.colecao === c), `${s}º ${c}`).toBe(true)
  })
  it('ids únicos e gabarito válido', () => {
    expect(new Set(BANCO.map((q) => q.id)).size).toBe(BANCO.length)
    for (const q of BANCO) expect(q.alternativas.some((a) => a.letra === q.gabarito), q.id).toBe(true)
  })
})

describe('simulado oficial', () => {
  it('cobra a série seguinte à cadastrada, em alta dificuldade', () => {
    expect(serieDoSimulado(3)).toBe(4)
    expect(serieDoSimulado(9)).toBe(9)
    const s = montarSimulado(BANCO, { questoes: 20 }, serieDoSimulado(3), undefined, new Set(), 7)
    expect(s).toHaveLength(20)
    expect(s.every((q) => serieDa(q) === 4)).toBe(true)
    expect(s.slice(0, 10).every((q) => q.trilha === 'portugues')).toBe(true)
    expect(s.every((q) => pontosDaQuestao(q) >= 4)).toBe(true)
    expect(s.filter((q) => pontosDaQuestao(q) === 5).length).toBeGreaterThanOrEqual(12)
  })
  it('completa com a série anterior quando a série-alvo não basta', () => {
    const s = montarSimulado(BANCO, { questoes: 20 }, 9, ['olimpico'], new Set(), 2)
    expect(s).toHaveLength(20)
  })
})

describe('treino livre e coleções', () => {
  it('treino livre do 9º ano só traz questões do 9º ano', () => {
    const s = montarSessao(BANCO, { tamanho: 10, trilhas: TODAS, nivelPorTrilha: {}, mistura: MISTA, serieFixa: 9, semente: 1 })
    expect(s).toHaveLength(10)
    expect(s.every((q) => serieDa(q) === 9)).toBe(true)
  })
  it('coleção escolhida vem primeiro', () => {
    const s = montarSessao(BANCO, { tamanho: 10, trilhas: TODAS, nivelPorTrilha: {}, mistura: MISTA, serieFixa: 6, colecoes: ['olimpico'], semente: 4 })
    expect(s.every((q) => colecaoDa(q) === 'olimpico')).toBe(true)
  })
  it('sem questões suficientes na coleção, completa com as outras da mesma série', () => {
    const s = montarSessao(BANCO, { tamanho: 10, trilhas: TODAS, nivelPorTrilha: {}, mistura: MISTA, serieFixa: 3, colecoes: ['olimpico'], semente: 5 })
    expect(s).toHaveLength(10)
    expect(s.every((q) => serieDa(q) === 3)).toBe(true)
  })
  it('treino do dia fica na série da aluna (nível base) e sobe com o nível', () => {
    const base = montarSessao(BANCO, { tamanho: 12, trilhas: TODAS, nivelPorTrilha: {}, mistura: MISTA, serieAtual: 3, semente: 6 })
    expect(base.every((q) => serieDa(q) === 3)).toBe(true)
    const avanco = montarSessao(BANCO, { tamanho: 40, trilhas: ['matematica'], nivelPorTrilha: { matematica: 'avanco' }, mistura: MISTA, serieAtual: 3, semente: 6 })
    expect(avanco.every((q) => serieDa(q) <= 4)).toBe(true)
    expect(avanco.some((q) => serieDa(q) === 4)).toBe(true)
  })
})

describe('treino livre fora das médias do painel', () => {
  it('ignora sessões livres na nota média e nas notas por trilha', async () => {
    const { indicadores, notasPorTrilhaPorSessao } = await import('./painel')
    const agora = new Date(2026, 10, 12, 12)
    const t = agora.getTime()
    const sessoes = [
      { id: 1, inicio: t - 3000, fim: t - 2000, nota: 8, concluida: true, sinais: 0, modo: 'treino' },
      { id: 2, inicio: t - 1000, fim: t, nota: 2, concluida: true, sinais: 0, modo: 'livre' },
    ]
    expect(indicadores(sessoes, 0, agora).notaMedia5).toBe(8)
    const respostas = [
      { sessaoId: 1, trilha: 'matematica' as const, pontos: 3, correta: true },
      { sessaoId: 2, trilha: 'matematica' as const, pontos: 5, correta: false },
    ]
    expect(notasPorTrilhaPorSessao(sessoes, respostas as never).get('matematica')!.map((x) => x.sessaoId)).toEqual([1])
  })
})
