import type { Colecao, Nivel, Questao, Serie, Trilha } from '../tipos'
import { pontosDaQuestao } from './pontuacao'

export interface MisturaDificuldade {
  facil: number
  media: number
  dificil: number
}

export interface OpcoesSessao {
  tamanho: number
  trilhas: Trilha[]
  nivelPorTrilha: Partial<Record<Trilha, Nivel>>
  mistura: MisturaDificuldade
  /** Questões que não devem aparecer (contestadas, desativadas). */
  excluir?: Set<string>
  /** Semente para sorteio reproduzível (testes). */
  semente?: number
  /**
   * Série em que a aluna está. Com ela, o nível da trilha vira um intervalo de séries:
   * base = só a série atual; avanço = até 1 série acima; desafio = até 2 acima.
   */
  serieAtual?: Serie
  /** Treino livre: só questões desta série (vale mais que serieAtual). */
  serieFixa?: Serie
  /** Coleções escolhidas. Se não houver questões suficientes nelas, completa com as outras coleções. */
  colecoes?: Colecao[]
}

const SERIE_DO_NIVEL: Record<Nivel, Serie> = { base: 3, avanco: 4, desafio: 5 }
const ACIMA: Record<Nivel, number> = { base: 0, avanco: 1, desafio: 2 }
export const serieDa = (q: Questao): Serie => q.serie ?? SERIE_DO_NIVEL[q.nivel]
export const colecaoDa = (q: Questao): Colecao => q.colecao ?? 'base'

/** Gerador pseudoaleatório simples e determinístico (mulberry32). */
export function criarSorteio(semente = Date.now()): () => number {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function embaralhar<T>(lista: T[], sortear: () => number): T[] {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(sortear() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/** Liberadas = nível da trilha e níveis abaixo (quem está no Avanço também revê a Base). */
function nivelLiberado(questao: Nivel, daTrilha: Nivel): boolean {
  const ordem: Nivel[] = ['base', 'avanco', 'desafio']
  return ordem.indexOf(questao) <= ordem.indexOf(daTrilha)
}

/**
 * Monta uma sessão de treino: filtra por trilha e nível, respeita a mistura de dificuldade
 * quando há questões suficientes e intercala as trilhas (prática intercalada).
 */
export function montarSessao(banco: Questao[], op: OpcoesSessao): Questao[] {
  const sortear = criarSorteio(op.semente)
  const serieOk = (q: Questao) => {
    const s = serieDa(q)
    if (op.serieFixa) return s === op.serieFixa
    if (op.serieAtual) return s >= op.serieAtual && s <= op.serieAtual + ACIMA[op.nivelPorTrilha[q.trilha] ?? 'base']
    return nivelLiberado(q.nivel, op.nivelPorTrilha[q.trilha] ?? 'base')
  }
  const possiveis = banco.filter(
    (q) => op.trilhas.includes(q.trilha) && serieOk(q) && !op.excluir?.has(q.id) && q.revisao.status !== 'desativada' && q.revisao.status !== 'contestada',
  )
  const naColecao = op.colecoes ? possiveis.filter((q) => op.colecoes!.includes(colecaoDa(q))) : possiveis
  // a coleção escolhida vem primeiro; se faltar questão, completa com as outras coleções da mesma série
  const elegiveis = naColecao.length >= op.tamanho ? naColecao : [...naColecao, ...embaralhar(possiveis.filter((q) => !naColecao.includes(q)), sortear).slice(0, op.tamanho - naColecao.length)]
  const tamanho = Math.min(op.tamanho, elegiveis.length)

  // Cotas por faixa de pontos.
  const total = op.mistura.facil + op.mistura.media + op.mistura.dificil || 1
  const cotas: Record<3 | 4 | 5, number> = {
    3: Math.round((tamanho * op.mistura.facil) / total),
    4: Math.round((tamanho * op.mistura.media) / total),
    5: 0,
  }
  cotas[5] = Math.max(0, tamanho - cotas[3] - cotas[4])

  const porFaixa: Record<3 | 4 | 5, Questao[]> = { 3: [], 4: [], 5: [] }
  for (const q of embaralhar(elegiveis, sortear)) porFaixa[pontosDaQuestao(q)].push(q)

  const escolhidas: Questao[] = []
  for (const faixa of [3, 4, 5] as const) escolhidas.push(...porFaixa[faixa].splice(0, cotas[faixa]))
  // Completa com o que sobrou se alguma faixa não tinha questões suficientes.
  const sobra = embaralhar([...porFaixa[3], ...porFaixa[4], ...porFaixa[5]], sortear)
  while (escolhidas.length < tamanho && sobra.length) escolhidas.push(sobra.shift()!)

  return intercalarPorTrilha(escolhidas)
}

/** Reordena para evitar duas questões da mesma trilha em sequência, quando possível. */
export function intercalarPorTrilha(questoes: Questao[]): Questao[] {
  const filas = new Map<Trilha, Questao[]>()
  for (const q of questoes) filas.set(q.trilha, [...(filas.get(q.trilha) ?? []), q])
  const resultado: Questao[] = []
  let anterior: Trilha | null = null
  while (resultado.length < questoes.length) {
    const opcoes = [...filas.entries()].filter(([t, f]) => f.length && t !== anterior).sort((a, b) => b[1].length - a[1].length)
    const [trilha, fila] = opcoes[0] ?? [...filas.entries()].find(([, f]) => f.length)!
    resultado.push(fila.shift()!)
    anterior = trilha
  }
  return resultado
}

/** Caça aos erros: questões erradas mais recentemente que ainda estão ativas. */
export function montarCacaAosErros(banco: Questao[], idsErradosRecentes: string[], n: number): Questao[] {
  const porId = new Map(banco.map((q) => [q.id, q]))
  const unicos = [...new Set(idsErradosRecentes)]
  return unicos
    .map((id) => porId.get(id))
    .filter((q): q is Questao => !!q && q.revisao.status !== 'desativada')
    .slice(0, n)
}
