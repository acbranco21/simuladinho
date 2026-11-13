import Dexie, { type EntityTable } from 'dexie'
import { CONFIG_PADRAO, type Configuracao } from '../config'
import type { Nivel, RespostaRegistro, Trilha } from '../tipos'
import { atualizarSequencia, diaLocal } from '../motor/gamificacao'
import { XP_LICAO } from '../motor/projetoVida'
import type { ModuloPV } from '../conteudo/projeto-vida'
import { avaliarProgressao } from '../motor/progressao'
import { TAMANHO, proximoTamanhoTreino } from '../motor/tamanho'
import { notasPorTrilhaPorSessao } from '../motor/painel'

export interface SessaoRegistro {
  id?: number
  modo: 'treino' | 'caca_erros' | 'simulado' | 'pilula' | 'livre'
  inicio: number
  fim: number
  nota: number
  concluida: boolean
  sinais: number
  xpGanho: number
  questoes: number
  /** Nível de cada trilha no momento da sessão (para a regra de progressão). */
  nivelPorTrilha?: Partial<Record<Trilha, Nivel>>
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

/** Decisão do administrador sobre uma questão (sobrepõe o status do banco). */
export interface StatusQuestao {
  questaoId: string
  status: 'aprovada_admin' | 'desativada'
  em: number
}

/** Pílula (assunto) marcada como aprendida na área Estudar. */
export interface PilulaAprendida {
  habilidade: string
  em: number
  acertos: number
  total: number
}

/** Uma vez em que ela fez uma lição de Projeto de Vida. Não guarda as escolhas dela, só que a lição foi feita. */
export interface LicaoFeita {
  id?: number
  licaoId: string
  modulo: ModuloPV
  inicio: number
  fim: number
}

/**
 * Banco local no tablet (IndexedDB). Tudo funciona sem internet.
 * O nome 'simulador-bolsa' é mantido de propósito: o histórico continua após a troca do nome do app.
 */
export const db = new Dexie('simulador-bolsa') as Dexie & {
  sessoes: EntityTable<SessaoRegistro, 'id'>
  respostas: EntityTable<RespostaDb, 'id'>
  perfil: EntityTable<Perfil, 'id'>
  contestacoes: EntityTable<Contestacao, 'id'>
  config: EntityTable<Configuracao, 'id'>
  statusQuestoes: EntityTable<StatusQuestao, 'questaoId'>
  pilulas: EntityTable<PilulaAprendida, 'habilidade'>
  licoesPV: EntityTable<LicaoFeita, 'id'>
}

db.version(1).stores({
  sessoes: '++id, inicio, modo',
  respostas: '++id, sessaoId, questaoId, trilha, em',
  perfil: 'id',
  contestacoes: '++id, questaoId',
})
db.version(2).stores({
  config: 'id',
  statusQuestoes: 'questaoId',
})
db.version(3).stores({
  pilulas: 'habilidade',
})
db.version(4).stores({
  licoesPV: '++id, licaoId, inicio',
})

const PERFIL_INICIAL: Perfil = { id: 'aluna', xp: 0, sequencia: 0, ultimoDia: null, tamanhoTreino: TAMANHO.inicialTreino, recordes: {} }

export async function lerPerfil(): Promise<Perfil> {
  return (await db.perfil.get('aluna')) ?? PERFIL_INICIAL
}

export async function lerConfig(): Promise<Configuracao> {
  const salva = await db.config.get('config')
  return { ...CONFIG_PADRAO, ...salva, id: 'config' }
}

export async function salvarConfig(c: Configuracao): Promise<void> {
  await db.config.put(c)
}

export interface ResultadoSalvo {
  perfil: Perfil
  novosRecordes: Trilha[]
  subiuDeNivel: Trilha[]
}

/** Salva a sessão, as respostas e atualiza XP, sequência, recordes, tamanho do treino e nível (se automático). */
export async function salvarSessao(
  sessao: Omit<SessaoRegistro, 'id'>,
  respostas: RespostaRegistro[],
  notaPorTrilha: Partial<Record<Trilha, number>>,
): Promise<ResultadoSalvo> {
  return db.transaction('rw', [db.sessoes, db.respostas, db.perfil, db.config], async () => {
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
    const todasSessoes = await db.sessoes.orderBy('inicio').toArray()
    const historico = todasSessoes.filter((s) => s.modo === 'treino').map((s) => ({ concluida: s.concluida, sinais: s.sinais }))
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

    // Progressão automática: 3 notas seguidas ≥ 8 na trilha, dentro do nível atual.
    const config = await lerConfig()
    const subiuDeNivel: Trilha[] = []
    if (config.progressao === 'automatica' && sessao.concluida) {
      const todasRespostas = await db.respostas.toArray()
      const notas = notasPorTrilhaPorSessao(
        todasSessoes.filter((s) => s.concluida).map((s) => ({ ...s, id: s.id! })),
        todasRespostas,
      )
      const nivelPorTrilha = { ...config.nivelPorTrilha }
      const historicoNiveis = [...config.historicoNiveis]
      for (const t of Object.keys(notaPorTrilha) as Trilha[]) {
        const atual = nivelPorTrilha[t] ?? 'base'
        const doNivel = (notas.get(t) ?? []).filter((n) => (n.nivel ?? 'base') === atual).map((n) => n.nota)
        const novo = avaliarProgressao(atual, doNivel, 'automatica')
        if (novo !== atual) {
          nivelPorTrilha[t] = novo
          historicoNiveis.push({ trilha: t, de: atual, para: novo, em: sessao.fim, motivo: 'automatica' })
          subiuDeNivel.push(t)
        }
      }
      if (subiuDeNivel.length) await db.config.put({ ...config, nivelPorTrilha, historicoNiveis })
    }
    return { perfil: atualizado, novosRecordes, subiuDeNivel }
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

/** Questões fora de circulação: contestadas (sem aprovação posterior) ou desativadas pelo administrador. */
export async function idsBloqueados(): Promise<Set<string>> {
  const [contest, status] = await Promise.all([db.contestacoes.toArray(), db.statusQuestoes.toArray()])
  const decisao = new Map(status.map((s) => [s.questaoId, s]))
  const bloqueados = new Set<string>()
  for (const c of contest) {
    const d = decisao.get(c.questaoId)
    if (!d || (d.status === 'aprovada_admin' && d.em < c.em)) bloqueados.add(c.questaoId)
  }
  for (const s of status) if (s.status === 'desativada') bloqueados.add(s.questaoId)
  return bloqueados
}

export async function decidirQuestao(questaoId: string, status: StatusQuestao['status']): Promise<void> {
  await db.statusQuestoes.put({ questaoId, status, em: Date.now() })
}

/** Minutos de uso hoje. */
export async function sessoesDeHoje(): Promise<SessaoRegistro[]> {
  const agora = new Date()
  const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime()
  return db.sessoes.where('inicio').aboveOrEqual(inicioDia).toArray()
}

export async function marcarPilula(habilidade: string, acertos: number, total: number): Promise<void> {
  await db.pilulas.put({ habilidade, em: Date.now(), acertos, total })
}

export async function pilulasAprendidas(): Promise<Set<string>> {
  return new Set((await db.pilulas.toArray()).map((p) => p.habilidade))
}

/** Lição concluída → dia local da primeira conclusão. */
export async function licoesConcluidas(): Promise<Map<string, string>> {
  const todas = await db.licoesPV.orderBy('inicio').toArray()
  const m = new Map<string, string>()
  for (const l of todas) if (!m.has(l.licaoId)) m.set(l.licaoId, diaLocal(new Date(l.fim)))
  return m
}

export async function licoesDeHoje(): Promise<LicaoFeita[]> {
  const agora = new Date()
  const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime()
  return db.licoesPV.where('inicio').aboveOrEqual(inicioDia).toArray()
}

/** Registra a lição. XP só na primeira vez; conta para a sequência de dias e para o tempo de tela. */
export async function concluirLicao(licaoId: string, modulo: ModuloPV, inicio: number, fim: number): Promise<{ perfil: Perfil; xpGanho: number }> {
  return db.transaction('rw', [db.licoesPV, db.perfil], async () => {
    const primeira = (await db.licoesPV.where('licaoId').equals(licaoId).count()) === 0
    await db.licoesPV.add({ licaoId, modulo, inicio, fim })
    const perfil = await lerPerfil()
    const xpGanho = primeira ? XP_LICAO : 0
    const hoje = diaLocal(new Date(fim))
    const atualizado: Perfil = { ...perfil, xp: perfil.xp + xpGanho, sequencia: atualizarSequencia(perfil.sequencia, perfil.ultimoDia, hoje), ultimoDia: hoje }
    await db.perfil.put(atualizado)
    return { perfil: atualizado, xpGanho }
  })
}

/** Cópia de segurança completa (sem o PIN). */
export async function exportarDados(): Promise<string> {
  const [sessoes, respostas, perfil, contestacoes, config, statusQuestoes, pilulas, licoesPV] = await Promise.all([
    db.sessoes.toArray(),
    db.respostas.toArray(),
    db.perfil.toArray(),
    db.contestacoes.toArray(),
    db.config.toArray(),
    db.statusQuestoes.toArray(),
    db.pilulas.toArray(),
    db.licoesPV.toArray(),
  ])
  const configSemPin = config.map((c) => ({ ...c, pinHash: null }))
  return JSON.stringify({ app: 'simuladinho', versao: 3, exportadoEm: new Date().toISOString(), sessoes, respostas, perfil, contestacoes, config: configSemPin, statusQuestoes, pilulas, licoesPV }, null, 1)
}

/** Restaura uma cópia de segurança (substitui os dados atuais; mantém o PIN atual). */
export async function importarDados(json: string): Promise<void> {
  const d = JSON.parse(json)
  if (d.app !== 'simuladinho' || !Array.isArray(d.sessoes) || !Array.isArray(d.respostas)) throw new Error('Arquivo não é uma cópia do Simuladinho')
  const pinAtual = (await lerConfig()).pinHash
  await db.transaction('rw', [db.sessoes, db.respostas, db.perfil, db.contestacoes, db.config, db.statusQuestoes, db.pilulas, db.licoesPV], async () => {
    await Promise.all([db.sessoes.clear(), db.respostas.clear(), db.perfil.clear(), db.contestacoes.clear(), db.config.clear(), db.statusQuestoes.clear(), db.pilulas.clear(), db.licoesPV.clear()])
    await db.sessoes.bulkAdd(d.sessoes)
    await db.respostas.bulkAdd(d.respostas)
    await db.perfil.bulkAdd(d.perfil ?? [])
    await db.contestacoes.bulkAdd(d.contestacoes ?? [])
    await db.statusQuestoes.bulkAdd(d.statusQuestoes ?? [])
    await db.pilulas.bulkAdd(d.pilulas ?? [])
    await db.licoesPV.bulkAdd(d.licoesPV ?? [])
    for (const c of d.config ?? []) await db.config.put({ ...c, pinHash: pinAtual })
  })
}

/** PIN guardado só como hash SHA-256. É uma trava simples para a criança, não proteção forte. */
export async function hashPin(pin: string): Promise<string> {
  const dados = new TextEncoder().encode(`simuladinho:${pin}`)
  const h = await crypto.subtle.digest('SHA-256', dados)
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
