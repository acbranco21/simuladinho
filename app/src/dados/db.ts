import Dexie, { type EntityTable } from 'dexie'
import type { RespostaRegistro, Trilha } from '../tipos'
import { atualizarSequencia, diaLocal } from '../motor/gamificacao'
import { TAMANHO, proximoTamanhoTreino } from '../motor/tamanho'

export interface SessaoRegistro {
  id?: number
  modo: 'treino' | 'caca_erros'
  inicio: number
  fim: number
  nota: number
  concluida: boolean
  sinais: number
  xpGanho: number
  questoes: number
}

export interface RespostaDb extends RespostaRegistro {
  id?: number
  sessaoId: number
}

export interface Perfil {
  id: 'aluna'
  xp: number
  sequencia: number
  ultimoDia: string | null
  tamanhoTreino: number
  recordes: Partial<Record<Trilha, number>>
}

export interface Contestacao {
  id?: number
  questaoId: string
  em: number
}

/** Banco local no tablet (IndexedDB). Tudo funciona sem internet. */
export const db = new Dexie('simulador-bolsa') as Dexie & {
  sessoes: EntityTable<SessaoRegistro, 'id'>
  respostas: EntityTable<RespostaDb, 'id'>
  perfil: EntityTable<Perfil, 'id'>
  contestacoes: EntityTable<Contestacao, 'id'>
}

db.version(1).stores({
  sessoes: '++id, inicio, modo',
  respostas: '++id, sessaoId, questaoId, trilha, em',
  perfil: 'id',
  contestacoes: '++id, questaoId',
})

const PERFIL_INICIAL: Perfil = { id: 'aluna', xp: 0, sequencia: 0, ultimoDia: null, tamanhoTreino: TAMANHO.inicialTreino, recordes: {} }

export async function lerPerfil(): Promise<Perfil> {
  return (await db.perfil.get('aluna')) ?? PERFIL_INICIAL
}

export interface ResultadoSalvo {
  perfil: Perfil
  novosRecordes: Trilha[]
}

/** Salva a sessão, as respostas e atualiza XP, sequência, recordes e tamanho do próximo treino. */
export async function salvarSessao(
  sessao: Omit<SessaoRegistro, 'id'>,
  respostas: RespostaRegistro[],
  notaPorTrilha: Partial<Record<Trilha, number>>,
): Promise<ResultadoSalvo> {
  return db.transaction('rw', db.sessoes, db.respostas, db.perfil, async () => {
    const sessaoId = (await db.sessoes.add(sessao)) as number
    await db.respostas.bulkAdd(respostas.map((r) => ({ ...r, sessaoId })))

    const perfil = await lerPerfil()
    const novosRecordes: Trilha[] = []
    const recordes = { ...perfil.recordes }
    if (sessao.concluida) {
      for (const [t, nota] of Object.entries(notaPorTrilha) as [Trilha, number][]) {
        if (recordes[t] !== undefined && nota > recordes[t]!) novosRecordes.push(t)
        if (recordes[t] === undefined || nota > recordes[t]!) recordes[t] = nota
      }
    }
    const historico = (await db.sessoes.where('modo').equals('treino').sortBy('inicio')).map((s) => ({ concluida: s.concluida, sinais: s.sinais }))
    const hoje = diaLocal(new Date(sessao.fim))
    const atualizado: Perfil = {
      ...perfil,
      xp: perfil.xp + sessao.xpGanho,
      sequencia: atualizarSequencia(perfil.sequencia, perfil.ultimoDia, hoje),
      ultimoDia: hoje,
      recordes,
      tamanhoTreino: sessao.modo === 'treino' ? proximoTamanhoTreino(perfil.tamanhoTreino, historico) : perfil.tamanhoTreino,
    }
    await db.perfil.put(atualizado)
    return { perfil: atualizado, novosRecordes }
  })
}

/** Taxa de acerto histórica por trilha (0–1). */
export async function acertoPorTrilha(): Promise<Partial<Record<Trilha, { acerto: number; total: number }>>> {
  const todas = await db.respostas.toArray()
  const r: Partial<Record<Trilha, { acerto: number; total: number }>> = {}
  for (const x of todas) {
    const atual = r[x.trilha] ?? { acerto: 0, total: 0 }
    atual.total += 1
    if (x.correta) atual.acerto += 1
    r[x.trilha] = atual
  }
  for (const v of Object.values(r)) if (v) v.acerto = v.acerto / v.total
  return r
}

/** Questões que ela errou e ainda não acertou depois, mais recentes primeiro. */
export async function idsParaCacaAosErros(): Promise<string[]> {
  const todas = await db.respostas.orderBy('em').reverse().toArray()
  const resolvidas = new Set<string>()
  const pendentes: string[] = []
  for (const r of todas) {
    if (r.correta) resolvidas.add(r.questaoId)
    else if (!resolvidas.has(r.questaoId) && !pendentes.includes(r.questaoId)) pendentes.push(r.questaoId)
  }
  return pendentes
}

export async function contestar(questaoId: string): Promise<void> {
  await db.contestacoes.add({ questaoId, em: Date.now() })
}

export async function idsContestados(): Promise<Set<string>> {
  return new Set((await db.contestacoes.toArray()).map((c) => c.questaoId))
}
