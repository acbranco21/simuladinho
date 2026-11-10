import { describe, expect, it } from 'vitest'
import banco from '../dados/questoes-exemplo.json'
import type { Questao, RespostaRegistro } from '../tipos'
import { atualizarSequencia, nivelDoXp, xpDaResposta } from './gamificacao'
import { calcularNota, formatarNota, pontosDaQuestao, resumoPorTrilha } from './pontuacao'
import { avaliarProgressao, habilidadesParaRevisar } from './progressao'
import { montarCacaAosErros, montarSessao } from './sessao'
import { deveProporEncerrar, detectarSinais } from './sinais'
import { proximoTamanhoTreino } from './tamanho'

const questoes = banco as Questao[]

function resp(p: Partial<RespostaRegistro>): RespostaRegistro {
  return { questaoId: 'x', trilha: 'matematica', habilidade: 'h', pontos: 3, escolha: 'A', correta: true, tempoMs: 10000, em: 0, ...p }
}

describe('pontuação', () => {
  it('converte dificuldade em pontos', () => {
    expect(pontosDaQuestao({ dificuldade: 1 })).toBe(3)
    expect(pontosDaQuestao({ dificuldade: 3 })).toBe(4)
    expect(pontosDaQuestao({ dificuldade: 5 })).toBe(5)
  })
  it('calcula nota ponderada de 0 a 10', () => {
    // 3 + 4 certos, 5 errado → 7 / 12 × 10 = 5,8
    expect(calcularNota([resp({ pontos: 3 }), resp({ pontos: 4 }), resp({ pontos: 5, correta: false })])).toBe(5.8)
    expect(calcularNota([])).toBe(0)
    expect(formatarNota(8.2)).toBe('8,2')
  })
  it('resume por trilha', () => {
    const r = resumoPorTrilha([resp({ trilha: 'logica' }), resp({ trilha: 'logica', correta: false })])
    expect(r).toEqual([{ trilha: 'logica', acertos: 1, total: 2 }])
  })
})

describe('sinais de cansaço', () => {
  it('detecta tempo subindo', () => {
    const r = [1, 2, 3, 4].map((s) => resp({ tempoMs: s * 10000 }))
    expect(detectarSinais(r)).toContain('tempo_subindo')
  })
  it('detecta chute (rápido e errado)', () => {
    const r = [resp({}), resp({}), resp({ correta: false, tempoMs: 1500 }), resp({ correta: false, tempoMs: 2000 })]
    expect(detectarSinais(r)).toContain('chute')
  })
  it('detecta queda de acerto em relação à média', () => {
    const r = [resp({ correta: false }), resp({ correta: false }), resp({ correta: false }), resp({})]
    expect(detectarSinais(r, { matematica: 0.9 })).toContain('queda_acerto')
  })
  it('propõe encerrar com 2 sinais distintos', () => {
    expect(deveProporEncerrar(['chute'])).toBe(false)
    expect(deveProporEncerrar(['chute', 'tempo_subindo'])).toBe(true)
  })
})

describe('tamanho adaptativo', () => {
  it('reduz após sessão abandonada ou cansada', () => {
    expect(proximoTamanhoTreino(10, [{ concluida: false, sinais: 0 }])).toBe(8)
    expect(proximoTamanhoTreino(6, [{ concluida: true, sinais: 2 }])).toBe(6)
  })
  it('aumenta após 3 sessões tranquilas', () => {
    const ok = { concluida: true, sinais: 0 }
    expect(proximoTamanhoTreino(10, [ok, ok, ok])).toBe(12)
    expect(proximoTamanhoTreino(10, [ok, ok])).toBe(10)
  })
})

describe('progressão', () => {
  it('sobe após 3 notas ≥ 8 no modo automático', () => {
    expect(avaliarProgressao('base', [7, 8, 8.5, 9], 'automatica')).toBe('avanco')
    expect(avaliarProgressao('base', [8, 9, 7.9], 'automatica')).toBe('base')
    expect(avaliarProgressao('base', [9, 9, 9], 'travada')).toBe('base')
  })
  it('lista habilidades fracas em 2 sessões', () => {
    expect(habilidadesParaRevisar([{ a: 0.5, b: 0.9 }, { a: 0.4 }, { b: 0.5 }])).toEqual(['a'])
  })
})

describe('montagem de sessão', () => {
  const base = { trilhas: ['portugues', 'matematica', 'logica'] as const, nivelPorTrilha: {}, mistura: { facil: 40, media: 40, dificil: 20 } }
  it('respeita tamanho, nível e exclusões', () => {
    const s = montarSessao(questoes, { ...base, trilhas: [...base.trilhas], tamanho: 5, semente: 1 })
    expect(s).toHaveLength(5)
    expect(s.every((q) => q.nivel === 'base')).toBe(true)
  })
  it('não repete questões e evita trilha repetida em sequência quando possível', () => {
    const s = montarSessao(questoes, { ...base, trilhas: [...base.trilhas], tamanho: 20, semente: 7 })
    expect(new Set(s.map((q) => q.id)).size).toBe(s.length)
    const repeticoes = s.filter((q, i) => i > 0 && s[i - 1].trilha === q.trilha).length
    expect(repeticoes).toBeLessThanOrEqual(2)
  })
  it('caça aos erros devolve erradas únicas', () => {
    const ids = [questoes[0].id, questoes[0].id, questoes[1].id]
    expect(montarCacaAosErros(questoes, ids, 5).map((q) => q.id)).toEqual([questoes[0].id, questoes[1].id])
  })
})

describe('gamificação', () => {
  it('nunca tira XP e dobra na caça aos erros', () => {
    expect(xpDaResposta(false)).toBeGreaterThan(0)
    expect(xpDaResposta(true, true)).toBe(20)
    expect(nivelDoXp(450)).toEqual({ nivel: 3, progresso: 0.25 })
  })
  it('sequência tolera 1 dia de folga', () => {
    expect(atualizarSequencia(5, '2026-11-10', '2026-11-11')).toBe(6)
    expect(atualizarSequencia(5, '2026-11-10', '2026-11-12')).toBe(6)
    expect(atualizarSequencia(5, '2026-11-10', '2026-11-14')).toBe(1)
    expect(atualizarSequencia(5, '2026-11-10', '2026-11-10')).toBe(5)
  })
})

describe('banco de exemplo', () => {
  it('cada questão tem 5 alternativas e gabarito válido', () => {
    for (const q of questoes) {
      expect(q.alternativas.map((a) => a.letra)).toEqual(['A', 'B', 'C', 'D', 'E'])
      const certa = q.alternativas.find((a) => a.letra === q.gabarito)!
      expect(certa.erro_tipico).toBeNull()
      expect(q.alternativas.filter((a) => a.erro_tipico === null)).toHaveLength(1)
      expect(q.enunciado.length).toBeLessThanOrEqual(280)
    }
  })
})
