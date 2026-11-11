import { describe, expect, it } from 'vitest'
import { LICOES_PV, MODULOS_PV } from '../conteudo/projeto-vida'
import { liberadoPeloAvanco, licoesDisponiveis, situacaoLicoes, situacaoModulo, type ConfigProjetoVida, type ProgressoAluna } from './projetoVida'

const AUTO: ConfigProjetoVida = { ativo: true, modulos: {} }
const prog = (p: Partial<ProgressoAluna>): ProgressoAluna => ({ sessoesConcluidas: 0, concluidas: new Map(), ...p })
const TODOS = MODULOS_PV.map((m) => m.id)

describe('Projeto de Vida: conteúdo', () => {
  it('cada lição tem história, 3 atividades e desafio com adulto', () => {
    expect(LICOES_PV).toHaveLength(12)
    for (const l of LICOES_PV) {
      expect(l.historia.length, l.id).toBeGreaterThan(0)
      expect(l.atividades, l.id).toHaveLength(3)
      expect(l.comAdulto.length, l.id).toBeGreaterThan(10)
    }
    expect(new Set(LICOES_PV.map((l) => l.id)).size).toBe(LICOES_PV.length)
  })

  it('atividade "certa" tem exatamente uma correta; "escolha" não marca nenhuma', () => {
    for (const l of LICOES_PV)
      for (const a of l.atividades) {
        const certas = a.opcoes.filter((o) => o.correta).length
        expect(certas, `${l.id}: ${a.pergunta}`).toBe(a.tipo === 'certa' ? 1 : 0)
        expect(a.opcoes.every((o) => o.retorno.length > 5), a.pergunta).toBe(true)
      }
  })

  it('cada módulo tem uma lição de 3º, 4º e 5º ano', () => {
    for (const m of TODOS) expect(LICOES_PV.filter((l) => l.modulo === m).map((l) => l.serie).sort()).toEqual([3, 4, 5])
  })
})

describe('Projeto de Vida: liberação', () => {
  it('emoções abre após o primeiro treino; metas após 3', () => {
    expect(liberadoPeloAvanco('emocoes', prog({}))).toBe(false)
    expect(liberadoPeloAvanco('emocoes', prog({ sessoesConcluidas: 1 }))).toBe(true)
    expect(liberadoPeloAvanco('metas', prog({ sessoesConcluidas: 2 }))).toBe(false)
    expect(liberadoPeloAvanco('metas', prog({ sessoesConcluidas: 3 }))).toBe(true)
  })

  it('dinheiro exige 20 questões de Matemática com 60% de acerto', () => {
    expect(liberadoPeloAvanco('dinheiro', prog({ matematica: { total: 19, acerto: 0.9 } }))).toBe(false)
    expect(liberadoPeloAvanco('dinheiro', prog({ matematica: { total: 20, acerto: 0.55 } }))).toBe(false)
    expect(liberadoPeloAvanco('dinheiro', prog({ matematica: { total: 20, acerto: 0.6 } }))).toBe(true)
  })

  it('ideias exige uma lição de metas e uma de dinheiro', () => {
    const so1 = prog({ concluidas: new Map([['pv-metas-1', '2026-11-01']]) })
    expect(liberadoPeloAvanco('ideias', so1)).toBe(false)
    const ambas = prog({ concluidas: new Map([['pv-metas-1', '2026-11-01'], ['pv-din-1', '2026-11-02']]) })
    expect(liberadoPeloAvanco('ideias', ambas)).toBe(true)
  })

  it('controle manual vence a regra automática', () => {
    const p = prog({})
    expect(situacaoModulo('ideias', { ativo: true, modulos: { ideias: 'liberado' } }, p)).toBe('aberto')
    expect(situacaoModulo('emocoes', { ativo: true, modulos: { emocoes: 'bloqueado' } }, prog({ sessoesConcluidas: 9 }))).toBe('bloqueado')
  })

  it('no automático, uma lição nova por dia e em ordem', () => {
    const p = prog({ sessoesConcluidas: 1, concluidas: new Map([['pv-emo-1', '2026-11-10']]) })
    const hoje = situacaoLicoes('emocoes', AUTO, p, '2026-11-10').map((x) => x.situacao)
    expect(hoje).toEqual(['concluida', 'amanha', 'trancada'])
    const amanha = situacaoLicoes('emocoes', AUTO, p, '2026-11-11').map((x) => x.situacao)
    expect(amanha).toEqual(['concluida', 'disponivel', 'trancada'])
  })

  it('liberado manualmente abre todas as lições de uma vez', () => {
    const s = situacaoLicoes('dinheiro', { ativo: true, modulos: { dinheiro: 'liberado' } }, prog({}), '2026-11-10').map((x) => x.situacao)
    expect(s).toEqual(['disponivel', 'disponivel', 'disponivel'])
  })

  it('bloquear não apaga o que já foi concluído', () => {
    const p = prog({ sessoesConcluidas: 5, concluidas: new Map([['pv-emo-1', '2026-11-01']]) })
    const s = situacaoLicoes('emocoes', { ativo: true, modulos: { emocoes: 'bloqueado' } }, p, '2026-11-10').map((x) => x.situacao)
    expect(s).toEqual(['concluida', 'trancada', 'trancada'])
  })

  it('trilha desativada não mostra lições disponíveis', () => {
    const p = prog({ sessoesConcluidas: 5 })
    expect(licoesDisponiveis(AUTO, p, '2026-11-10', TODOS)).toBe(2)
    expect(licoesDisponiveis({ ...AUTO, ativo: false }, p, '2026-11-10', TODOS)).toBe(0)
  })
})
