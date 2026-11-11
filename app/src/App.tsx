import { useCallback, useEffect, useRef, useState } from 'react'
import { Painel } from './admin/Painel'
import { Pin } from './admin/Pin'
import { Correcao } from './aluna/Correcao'
import { Estudar } from './aluna/Estudar'
import { Evolucao } from './aluna/Evolucao'
import { Fim } from './aluna/Fim'
import { Inicio } from './aluna/Inicio'
import { LicaoTela } from './aluna/LicaoTela'
import { ProjetoVida } from './aluna/ProjetoVida'
import { PilulaTela } from './aluna/PilulaTela'
import type { EstadoPasso } from './aluna/Progresso'
import { QuestaoTela } from './aluna/QuestaoTela'
import { Simulado } from './aluna/Simulado'
import { SimuladoResultado } from './aluna/SimuladoResultado'
import type { Configuracao } from './config'
import { definirTema, type Tema } from './tema'
import { PILULA_POR_HABILIDADE } from './conteudo/pilulas'
import { MODULOS_PV, type LicaoPV } from './conteudo/projeto-vida'
import {
  acertoPorTrilha,
  concluirLicao,
  contestar,
  db,
  hashPin,
  idsBloqueados,
  idsParaCacaAosErros,
  lerConfig,
  lerPerfil,
  licoesConcluidas,
  licoesDeHoje,
  marcarPilula,
  pilulasAprendidas,
  salvarConfig,
  salvarSessao,
  sessoesDeHoje,
  type Perfil,
} from './dados/db'
import exemplos from './dados/questoes-exemplo.json'
import lote1 from './dados/questoes-lote1.json'
import { pilulasSugeridas } from './motor/conquistas'
import { XP, diaLocal, xpDaResposta } from './motor/gamificacao'
import { licoesDisponiveis, type ProgressoAluna } from './motor/projetoVida'
import { habilidadeMaisFraca, minutosNoDia } from './motor/painel'
import { calcularNota, pontosDaQuestao, resumoPorTrilha, type ResumoTrilha } from './motor/pontuacao'
import { criarSorteio, montarCacaAosErros, montarSessao } from './motor/sessao'
import { minutosDoSimulado, montarSimulado } from './motor/simulado'
import { deveProporEncerrar, detectarSinais, type Sinal } from './motor/sinais'
import { TAMANHO } from './motor/tamanho'
import type { Letra, Questao, RespostaRegistro, Trilha } from './tipos'

const BANCO = [...exemplos, ...lote1] as Questao[]
const HABILIDADES_COM_PILULA = new Set(PILULA_POR_HABILIDADE.keys())

type Modo = 'treino' | 'caca_erros' | 'pilula'
type Tela = 'inicio' | 'questao' | 'correcao' | 'fim' | 'pin' | 'painel' | 'simulado' | 'resultadoSimulado' | 'estudar' | 'pilula' | 'evolucao' | 'projetoVida' | 'licao'

interface Sessao {
  modo: Modo
  questoes: Questao[]
  indice: number
  respostas: RespostaRegistro[]
  inicio: number
  inicioQuestao: number
  sinais: Set<Sinal>
  propostaFeita: boolean
  proporEncerrar: boolean
  /** Habilidade praticada, no modo 'pilula'. */
  habilidade?: string
}

interface Resultado {
  nota: number
  resumo: ResumoTrilha[]
  xpGanho: number
  sequencia: number
  novosRecordes: Trilha[]
  erros: number
  subiuDeNivel: Trilha[]
  sugeridas: { habilidade: string; titulo: string }[]
  aprendeu: string | null
  modo: Modo
}

interface SimuladoAtivo {
  questoes: Questao[]
  minutos: number
  inicio: number
}

interface ResultadoSimulado {
  questoes: Questao[]
  escolhas: (Letra | null)[]
  nota: number
  resumo: ResumoTrilha[]
  minutosUsados: number
  minutosTotal: number
  porTempo: boolean
  xpGanho: number
  novosRecordes: Trilha[]
  sugeridas: { habilidade: string; titulo: string }[]
}

function comTitulo(habs: string[]) {
  return habs.map((h) => ({ habilidade: h, titulo: PILULA_POR_HABILIDADE.get(h)!.titulo }))
}

export default function App() {
  const [tela, setTela] = useState<Tela>('inicio')
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [acerto, setAcerto] = useState<Partial<Record<Trilha, { acerto: number; total: number }>>>({})
  const [errosPendentes, setErrosPendentes] = useState<string[]>([])
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [minutosHoje, setMinutosHoje] = useState(0)
  const [aprendidas, setAprendidas] = useState<Set<string>>(new Set())
  const [recomendadas, setRecomendadas] = useState<Set<string>>(new Set())
  const [simulado, setSimulado] = useState<SimuladoAtivo | null>(null)
  const [resultadoSimulado, setResultadoSimulado] = useState<ResultadoSimulado | null>(null)
  const [pilulaAtual, setPilulaAtual] = useState<string | null>(null)
  const [progressoPV, setProgressoPV] = useState<ProgressoAluna>({ sessoesConcluidas: 0, concluidas: new Map() })
  const [licaoAtual, setLicaoAtual] = useState<{ licao: LicaoPV; inicio: number; xpGanho: number | null } | null>(null)
  const salvando = useRef(false)

  const recarregar = useCallback(async () => {
    const [p, a, e, c, hoje, apr, respostas, licoesHoje, concluidas, sessoesConcluidas] = await Promise.all([
      lerPerfil(),
      acertoPorTrilha(),
      idsParaCacaAosErros(),
      lerConfig(),
      sessoesDeHoje(),
      pilulasAprendidas(),
      db.respostas.toArray(),
      licoesDeHoje(),
      licoesConcluidas(),
      db.sessoes.filter((s) => s.concluida).count(),
    ])
    setPerfil(p)
    setConfig(c)
    setMinutosHoje(minutosNoDia([...hoje, ...licoesHoje], new Date()))
    setProgressoPV({ sessoesConcluidas, matematica: a.matematica, concluidas })
    setAcerto(a)
    setErrosPendentes(e)
    setAprendidas(apr)
    // Recomendadas: a habilidade mais fraca de cada trilha (abaixo de 60%) e as erradas recentemente.
    const rec = new Set<string>()
    for (const t of c.trilhasAtivas) {
      const f = habilidadeMaisFraca(respostas.filter((r) => r.trilha === t))
      if (f && f.acerto < 0.6) rec.add(f.habilidade)
    }
    for (const h of pilulasSugeridas(respostas.slice(-20), HABILIDADES_COM_PILULA, 5)) rec.add(h)
    setRecomendadas(rec)
  }, [])

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  useEffect(() => {
    if (config) definirTema(config.tema)
  }, [config])

  const trocarTema = async (tema: Tema) => {
    if (!config) return
    const nova = { ...config, tema }
    await salvarConfig(nova)
    setConfig(nova)
  }

  const comecar = (modo: Modo, questoes: Questao[], habilidade?: string) => {
    if (!questoes.length) return
    const agora = Date.now()
    setSessao({ modo, questoes, indice: 0, respostas: [], inicio: agora, inicioQuestao: agora, sinais: new Set(), propostaFeita: false, proporEncerrar: false, habilidade })
    setTela('questao')
  }

  const iniciarTreino = async () => {
    const p = perfil ?? (await lerPerfil())
    const c = config ?? (await lerConfig())
    const excluir = await idsBloqueados()
    const tamanho = c.iaAjustaTamanho ? p.tamanhoTreino : c.tamanhoTreinoFixo
    comecar('treino', montarSessao(BANCO, { tamanho, trilhas: c.trilhasAtivas, nivelPorTrilha: c.nivelPorTrilha, mistura: c.mistura, excluir }))
  }

  const iniciarCaca = async () => {
    const ids = await idsParaCacaAosErros()
    const excluir = await idsBloqueados()
    comecar('caca_erros', montarCacaAosErros(BANCO.filter((q) => !excluir.has(q.id)), ids, TAMANHO.cacaAosErros))
  }

  const questoesDaPilula = async (habilidade: string) => {
    const excluir = await idsBloqueados()
    const sorteio = criarSorteio()
    return BANCO.filter((q) => q.habilidade === habilidade && !excluir.has(q.id))
      .map((q) => ({ q, r: sorteio() }))
      .sort((a, b) => a.r - b.r)
      .slice(0, 3)
      .map((x) => x.q)
  }

  const iniciarPratica = async (habilidade: string) => {
    comecar('pilula', await questoesDaPilula(habilidade), habilidade)
  }

  const iniciarSimulado = async () => {
    const c = config ?? (await lerConfig())
    const excluir = await idsBloqueados()
    const questoes = montarSimulado(BANCO, c.simulado, c.nivelPorTrilha, c.mistura, excluir)
    if (!questoes.length) return
    setSimulado({ questoes, minutos: minutosDoSimulado(c.simulado), inicio: Date.now() })
    setTela('simulado')
  }

  const abrirPilula = (habilidade: string) => {
    setPilulaAtual(habilidade)
    setTela('pilula')
  }

  const finalizar = async (s: Sessao, concluida: boolean) => {
    if (salvando.current) return
    salvando.current = true
    try {
      const caca = s.modo === 'caca_erros'
      const xpRespostas = s.respostas.reduce((t, r) => t + xpDaResposta(r.correta, caca), 0)
      const xpGanho = xpRespostas + (concluida && s.respostas.length ? XP.bonusSessao : 0)
      const nota = calcularNota(s.respostas)
      const resumo = resumoPorTrilha(s.respostas)
      const notaPorTrilha: Partial<Record<Trilha, number>> = {}
      for (const r of resumo) notaPorTrilha[r.trilha] = calcularNota(s.respostas.filter((x) => x.trilha === r.trilha))

      if (s.respostas.length) {
        // Prática de pílula não conta para recordes nem para subir de nível (são poucas questões, de um assunto só).
        const salvo = await salvarSessao(
          { modo: s.modo, inicio: s.inicio, fim: Date.now(), nota, concluida, sinais: s.sinais.size, xpGanho, questoes: s.respostas.length, nivelPorTrilha: config?.nivelPorTrilha },
          s.respostas,
          s.modo === 'pilula' ? {} : notaPorTrilha,
        )
        let aprendeu: string | null = null
        if (concluida && s.modo === 'pilula' && s.habilidade) {
          const acertos = s.respostas.filter((r) => r.correta).length
          if (acertos >= Math.ceil((s.respostas.length * 2) / 3)) {
            await marcarPilula(s.habilidade, acertos, s.respostas.length)
            aprendeu = PILULA_POR_HABILIDADE.get(s.habilidade)?.titulo ?? s.habilidade
          }
        }
        await recarregar()
        if (concluida) {
          const erros = await idsParaCacaAosErros()
          setResultado({
            nota,
            resumo,
            xpGanho,
            sequencia: salvo.perfil.sequencia,
            novosRecordes: salvo.novosRecordes,
            erros: Math.min(TAMANHO.cacaAosErros, erros.length),
            subiuDeNivel: salvo.subiuDeNivel,
            sugeridas: s.modo === 'pilula' ? [] : comTitulo(pilulasSugeridas(s.respostas, HABILIDADES_COM_PILULA)),
            aprendeu,
            modo: s.modo,
          })
          setSessao(null)
          setTela('fim')
          return
        }
      }
      setSessao(null)
      setTela(s.modo === 'pilula' ? 'pilula' : 'inicio')
    } finally {
      salvando.current = false
    }
  }

  const entregarSimulado = async (escolhas: (Letra | null)[], temposMs: number[], porTempo: boolean) => {
    if (!simulado || salvando.current) return
    salvando.current = true
    try {
      const agora = Date.now()
      const respostas: RespostaRegistro[] = simulado.questoes.map((q, i) => ({
        questaoId: q.id,
        trilha: q.trilha,
        habilidade: q.habilidade,
        pontos: pontosDaQuestao(q),
        escolha: escolhas[i],
        correta: escolhas[i] === q.gabarito,
        tempoMs: temposMs[i],
        em: agora,
      }))
      const nota = calcularNota(respostas)
      const resumo = resumoPorTrilha(respostas)
      const notaPorTrilha: Partial<Record<Trilha, number>> = {}
      for (const r of resumo) notaPorTrilha[r.trilha] = calcularNota(respostas.filter((x) => x.trilha === r.trilha))
      const xpGanho = respostas.reduce((t, r) => t + (r.escolha ? xpDaResposta(r.correta) : 0), 0) + XP.bonusSessao
      const salvo = await salvarSessao(
        { modo: 'simulado', inicio: simulado.inicio, fim: agora, nota, concluida: true, sinais: 0, xpGanho, questoes: respostas.length, nivelPorTrilha: config?.nivelPorTrilha },
        respostas,
        notaPorTrilha,
      )
      await recarregar()
      setResultadoSimulado({
        questoes: simulado.questoes,
        escolhas,
        nota,
        resumo,
        minutosUsados: Math.max(1, Math.round((agora - simulado.inicio) / 60000)),
        minutosTotal: simulado.minutos,
        porTempo,
        xpGanho,
        novosRecordes: salvo.novosRecordes,
        sugeridas: comTitulo(pilulasSugeridas(respostas, HABILIDADES_COM_PILULA)),
      })
      setSimulado(null)
      setTela('resultadoSimulado')
    } finally {
      salvando.current = false
    }
  }

  const confirmar = (letra: Letra) => {
    if (!sessao) return
    const q = sessao.questoes[sessao.indice]
    const registro: RespostaRegistro = {
      questaoId: q.id,
      trilha: q.trilha,
      habilidade: q.habilidade,
      pontos: pontosDaQuestao(q),
      escolha: letra,
      correta: letra === q.gabarito,
      tempoMs: Date.now() - sessao.inicioQuestao,
      em: Date.now(),
    }
    const respostas = [...sessao.respostas, registro]
    const medias: Partial<Record<Trilha, number>> = {}
    for (const [t, v] of Object.entries(acerto)) if (v && v.total >= 8) medias[t as Trilha] = v.acerto
    const sinais = new Set([...sessao.sinais, ...detectarSinais(respostas, medias)])
    const propor = sessao.modo !== 'pilula' && !sessao.propostaFeita && deveProporEncerrar([...sinais])
    setSessao({ ...sessao, respostas, sinais, proporEncerrar: propor, propostaFeita: sessao.propostaFeita || propor })
    setTela('correcao')
  }

  const proxima = () => {
    if (!sessao) return
    if (sessao.indice + 1 >= sessao.questoes.length) {
      void finalizar(sessao, true)
      return
    }
    setSessao({ ...sessao, indice: sessao.indice + 1, inicioQuestao: Date.now(), proporEncerrar: false })
    setTela('questao')
  }

  const achouErro = async () => {
    if (!sessao) return
    await contestar(sessao.questoes[sessao.indice].id)
    const questoes = sessao.questoes.filter((_, i) => i !== sessao.indice)
    if (sessao.indice >= questoes.length) {
      void finalizar({ ...sessao, questoes }, true)
      return
    }
    setSessao({ ...sessao, questoes, inicioQuestao: Date.now() })
  }

  if (!perfil || !config) return <div className="carregando">Carregando…</div>

  if (tela === 'pin') {
    return (
      <Pin
        criar={!config.pinHash}
        onVoltar={() => setTela('inicio')}
        onConfirmar={async (pin) => {
          const h = await hashPin(pin)
          if (!config.pinHash) {
            const nova = { ...config, pinHash: h }
            await salvarConfig(nova)
            setConfig(nova)
          } else if (h !== config.pinHash) {
            return false
          }
          setTela('painel')
          return true
        }}
      />
    )
  }

  if (tela === 'painel') {
    return (
      <Painel
        banco={BANCO}
        onConfigSalva={setConfig}
        onSair={() => {
          void recarregar()
          setTela('inicio')
        }}
      />
    )
  }

  if (tela === 'simulado' && simulado) {
    return (
      <Simulado
        questoes={simulado.questoes}
        minutos={simulado.minutos}
        onEntregar={(e, t, porTempo) => void entregarSimulado(e, t, porTempo)}
        onSair={() => {
          setSimulado(null)
          setTela('inicio')
        }}
      />
    )
  }

  if (tela === 'resultadoSimulado' && resultadoSimulado) {
    return <SimuladoResultado {...resultadoSimulado} onEstudar={abrirPilula} onInicio={() => setTela('inicio')} />
  }

  if (tela === 'estudar') {
    return <Estudar trilhas={config.trilhasAtivas} aprendidas={aprendidas} recomendadas={recomendadas} onAbrir={abrirPilula} onVoltar={() => setTela('inicio')} />
  }

  if (tela === 'pilula' && pilulaAtual) {
    const p = PILULA_POR_HABILIDADE.get(pilulaAtual)!
    return (
      <PilulaTela
        key={p.id}
        pilula={p}
        aprendida={aprendidas.has(p.habilidade)}
        questoesDisponiveis={BANCO.filter((q) => q.habilidade === p.habilidade).length}
        onPraticar={() => void iniciarPratica(p.habilidade)}
        onVoltar={() => setTela('estudar')}
      />
    )
  }

  if (tela === 'projetoVida') {
    return (
      <ProjetoVida
        cfg={config.projetoVida}
        progresso={progressoPV}
        hoje={diaLocal(new Date())}
        limiteAtingido={config.limiteDiarioMin > 0 && minutosHoje >= config.limiteDiarioMin}
        onAbrir={(licao) => {
          setLicaoAtual({ licao, inicio: Date.now(), xpGanho: null })
          setTela('licao')
        }}
        onVoltar={() => setTela('inicio')}
      />
    )
  }

  if (tela === 'licao' && licaoAtual) {
    const voltar = () => {
      setLicaoAtual(null)
      setTela('projetoVida')
    }
    return (
      <LicaoTela
        key={licaoAtual.licao.id}
        licao={licaoAtual.licao}
        xpGanho={licaoAtual.xpGanho}
        onTerminar={() => {
          const atual = licaoAtual
          void concluirLicao(atual.licao.id, atual.licao.modulo, atual.inicio, Date.now()).then(async ({ xpGanho }) => {
            setLicaoAtual((l) => (l && l.licao.id === atual.licao.id ? { ...l, xpGanho } : l))
            await recarregar()
          })
        }}
        onVoltar={voltar}
        onSair={voltar}
      />
    )
  }

  if (tela === 'evolucao') {
    return <Evolucao config={config} perfil={perfil} onVoltar={() => setTela('inicio')} />
  }

  if (tela === 'fim' && resultado) {
    return (
      <Fim
        {...resultado}
        onCacaAosErros={() => void iniciarCaca()}
        onEstudar={abrirPilula}
        onInicio={() => setTela(resultado.modo === 'pilula' ? 'estudar' : 'inicio')}
      />
    )
  }

  if (sessao && (tela === 'questao' || tela === 'correcao')) {
    const titulo = sessao.modo === 'treino' ? 'Treino do dia' : sessao.modo === 'caca_erros' ? 'Caça aos erros' : `Praticar: ${PILULA_POR_HABILIDADE.get(sessao.habilidade ?? '')?.titulo ?? ''}`
    const passos: EstadoPasso[] = sessao.questoes.map((_, i) => {
      const r = sessao.respostas[i]
      if (r) return r.correta ? 'certo' : 'errado'
      return i === sessao.indice ? 'atual' : 'futuro'
    })
    const q = sessao.questoes[sessao.indice]
    if (tela === 'questao') {
      return (
        <QuestaoTela
          key={q.id}
          questao={q}
          titulo={titulo}
          passos={passos}
          indice={sessao.indice}
          onConfirmar={confirmar}
          onSair={() => void finalizar(sessao, false)}
          onContestar={() => void achouErro()}
        />
      )
    }
    const r = sessao.respostas[sessao.indice]
    return (
      <Correcao
        questao={q}
        escolha={r.escolha as Letra}
        xp={xpDaResposta(r.correta, sessao.modo === 'caca_erros')}
        titulo={titulo}
        passos={passos}
        indice={sessao.indice}
        ultima={sessao.indice + 1 >= sessao.questoes.length}
        proporEncerrar={sessao.proporEncerrar}
        onProxima={proxima}
        onEncerrar={() => void finalizar(sessao, true)}
        onSair={() => void finalizar(sessao, false)}
      />
    )
  }

  const limiteAtingido = config.limiteDiarioMin > 0 && minutosHoje >= config.limiteDiarioMin
  return (
    <Inicio
      perfil={perfil}
      config={config}
      acerto={acerto}
      errosPendentes={errosPendentes.length}
      limiteAtingido={limiteAtingido}
      recomendadas={recomendadas.size}
      projetoVida={config.projetoVida.ativo ? licoesDisponiveis(config.projetoVida, progressoPV, diaLocal(new Date()), MODULOS_PV.map((m) => m.id)) : null}
      onProjetoVida={() => setTela('projetoVida')}
      onTrocarTema={() => void trocarTema(config.tema === 'caderno' ? 'classico' : 'caderno')}
      onTreino={() => void iniciarTreino()}
      onCacaAosErros={() => void iniciarCaca()}
      onSimulado={() => void iniciarSimulado()}
      onEstudar={() => setTela('estudar')}
      onEvolucao={() => setTela('evolucao')}
      onAreaPais={() => setTela('pin')}
    />
  )
}
