import { describe, expect, it } from 'vitest'
import exemplos from '../dados/questoes-exemplo.json'
import lote1 from '../dados/questoes-lote1.json'
import type { Questao, RespostaRegistro } from '../tipos'
import { atualizarSequencia, nivelDoXp, xpDaResposta } from './gamificacao'
import { calcularNota, formatarNota, pontosDaQuestao, resumoPorTrilha } from './pontuacao'
import { avaliarProgressao, habilidadesParaRevisar } from './progressao'
import { montarCacaAosErros, montarSessao } from './sessao'
import { deveProporEncerrar, detectarSinais } from './sinais'
import { proximoTamanhoTreino } from './tamanho'

const questoes = [...exemplos, ...lote1] as Questao[]

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

describe('banco de questões', () => {
  it('ids únicos', () => {
    expect(new Set(questoes.map((q) => q.id)).size).toBe(questoes.length)
  })
  it('alternativas com textos diferentes', () => {
    for (const q of questoes) expect(new Set(q.alternativas.map((a) => a.texto)).size).toBe(5)
  })
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

import { desempenhoPorTrilha, habilidadeMaisFraca, indicadores, minutosNoDia, questoesAtipicas, tendencia } from './painel'

describe('painel do administrador', () => {
  const agora = new Date(2026, 10, 10, 20, 0)
  const h = (hora: number, min = 0) => new Date(2026, 10, 10, hora, min).getTime()
  it('soma minutos de hoje e ignora outros dias', () => {
    const s = [
      { inicio: h(9), fim: h(9, 12) },
      { inicio: h(18), fim: h(18, 8) },
      { inicio: new Date(2026, 10, 9, 18).getTime(), fim: new Date(2026, 10, 9, 19).getTime() },
    ]
    expect(minutosNoDia(s, agora)).toBe(20)
  })
  it('calcula indicadores', () => {
    const s = [
      { id: 1, inicio: h(9), fim: h(9, 10), nota: 6, concluida: true, sinais: 0 },
      { id: 2, inicio: h(10), fim: h(10, 5), nota: 8, concluida: true, sinais: 2 },
      { id: 3, inicio: h(11), fim: h(11, 2), nota: 0, concluida: false, sinais: 0 },
    ]
    const i = indicadores(s, 25, agora)
    expect(i).toEqual({ sessoes7d: 3, notaMedia5: 7, minutosHoje: 17, sessoesComCansaco7d: 2, questoesRespondidas: 25 })
  })
  it('tendência compara as 3 últimas com as 3 anteriores', () => {
    expect(tendencia([5, 5, 5, 7, 7, 7])).toBe('subindo')
    expect(tendencia([8, 8, 8, 6, 6, 6])).toBe('caindo')
    expect(tendencia([7, 7, 7, 7.2, 7, 7])).toBe('estavel')
    expect(tendencia([7, 8])).toBe('poucos_dados')
  })
  it('habilidade mais fraca exige 3 respostas', () => {
    const r = [
      ...Array(3).fill({ habilidade: 'a', correta: false }),
      ...Array(2).fill({ habilidade: 'b', correta: false }),
      ...Array(3).fill({ habilidade: 'c', correta: true }),
    ]
    expect(habilidadeMaisFraca(r)).toEqual({ habilidade: 'a', acerto: 0, total: 3 })
  })
  it('questões atípicas: 5+ respostas e menos de 20% de acerto', () => {
    const r = [...Array(5).fill({ questaoId: 'x', correta: false }), ...Array(5).fill({ questaoId: 'y', correta: true })]
    expect(questoesAtipicas(r).map((q) => q.questaoId)).toEqual(['x'])
  })
  it('sugere subir quando há 3 notas ≥ 8 no nível atual', () => {
    const sessoes = [1, 2, 3].map((id) => ({ id, inicio: h(8 + id), fim: h(8 + id, 5), nota: 9, concluida: true, sinais: 0, nivelPorTrilha: { matematica: 'base' as const } }))
    const respostas = sessoes.map((s) => ({ sessaoId: s.id, questaoId: 'q', trilha: 'matematica' as const, habilidade: 'h', pontos: 3 as const, correta: true, em: s.inicio }))
    const [linha] = desempenhoPorTrilha(['matematica'], { matematica: 'base' }, 'manual', sessoes, respostas)
    expect(linha.sugestao).toBe('Pronta para subir de nível')
    expect(linha.media5).toBe(10)
  })
})

import { minutosDoSimulado, montarSimulado } from './simulado'
import { calcularMedalhas, mapaDeConquistas, pilulasSugeridas } from './conquistas'
import { PILULAS } from '../conteudo/pilulas'

describe('simulado', () => {
  it('tem metade Português, metade Matemática, em ordem crescente de dificuldade', () => {
    const s = montarSimulado(questoes, { questoes: 20 }, 3, undefined, new Set(), 3)
    expect(s).toHaveLength(20)
    expect(s.slice(0, 10).every((q) => q.trilha === 'portugues')).toBe(true)
    expect(s.slice(10).every((q) => q.trilha === 'matematica')).toBe(true)
    const pts = (q: Questao) => (q.dificuldade <= 2 ? 3 : q.dificuldade === 3 ? 4 : 5)
    for (const bloco of [s.slice(0, 10), s.slice(10)]) for (let i = 1; i < bloco.length; i++) expect(pts(bloco[i])).toBeGreaterThanOrEqual(pts(bloco[i - 1]))
    expect(minutosDoSimulado({ questoes: 20 })).toBe(90)
    expect(minutosDoSimulado({ questoes: 10 })).toBe(45)
  })
})

describe('conquistas', () => {
  it('medalhas por esforço e domínio', () => {
    const r = Array(10).fill({ trilha: 'logica', habilidade: 'Sequências de figuras e números', correta: true })
    const m = calcularMedalhas([{ modo: 'simulado', concluida: true, nota: 10, questoes: 10 }], r, 2, 0)
    const ganhas = m.filter((x) => x.conquistada).map((x) => x.id)
    expect(ganhas).toEqual(['primeira-missao', 'detetive-padroes', 'primeiro-simulado', 'nota-10'])
  })
  it('mapa acende por pílula ou por 80% de acerto em 5+', () => {
    const r = [...Array(4).fill({ habilidade: 'a', correta: true }), { habilidade: 'a', correta: false }, ...Array(4).fill({ habilidade: 'b', correta: true })]
    expect(mapaDeConquistas(['a', 'b', 'c'], r, new Set(['c'])).map((x) => x.motivo)).toEqual(['acerto', null, 'pilula'])
  })
  it('sugere pílulas das habilidades erradas', () => {
    const r = [{ habilidade: 'x', correta: false }, { habilidade: 'y', correta: true }, { habilidade: 'x', correta: false }, { habilidade: 'z', correta: false }]
    expect(pilulasSugeridas(r, new Set(['x', 'z']))).toEqual(['x', 'z'])
  })
  it('toda habilidade do banco tem pílula e toda pílula tem questões', () => {
    const habs = new Set(questoes.map((q) => q.habilidade))
    const pils = new Set(PILULAS.map((p) => p.habilidade))
    for (const h of habs) expect(pils.has(h), h).toBe(true)
    for (const p of pils) expect(habs.has(p), p).toBe(true)
  })
})
