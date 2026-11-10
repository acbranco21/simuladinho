import { useCallback, useEffect, useRef, useState } from 'react'
import { Correcao } from './aluna/Correcao'
import { Fim } from './aluna/Fim'
import { Inicio } from './aluna/Inicio'
import type { EstadoPasso } from './aluna/Progresso'
import { QuestaoTela } from './aluna/QuestaoTela'
import { MISTURA_PADRAO, NIVEL_POR_TRILHA, TRILHAS_ATIVAS } from './config'
import { acertoPorTrilha, contestar, idsContestados, idsParaCacaAosErros, lerPerfil, salvarSessao, type Perfil } from './dados/db'
import exemplos from './dados/questoes-exemplo.json'
import lote1 from './dados/questoes-lote1.json'
import { XP, xpDaResposta } from './motor/gamificacao'
import { calcularNota, pontosDaQuestao, resumoPorTrilha, type ResumoTrilha } from './motor/pontuacao'
import { montarCacaAosErros, montarSessao } from './motor/sessao'
import { deveProporEncerrar, detectarSinais, type Sinal } from './motor/sinais'
import { TAMANHO } from './motor/tamanho'
import type { Letra, Questao, RespostaRegistro, Trilha } from './tipos'

const BANCO = [...exemplos, ...lote1] as Questao[]

type Modo = 'treino' | 'caca_erros'
type Tela = 'inicio' | 'questao' | 'correcao' | 'fim'

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
}

interface Resultado {
  nota: number
  resumo: ResumoTrilha[]
  xpGanho: number
  sequencia: number
  novosRecordes: Trilha[]
  erros: number
}

export default function App() {
  const [tela, setTela] = useState<Tela>('inicio')
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [acerto, setAcerto] = useState<Partial<Record<Trilha, { acerto: number; total: number }>>>({})
  const [errosPendentes, setErrosPendentes] = useState<string[]>([])
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const salvando = useRef(false)

  const recarregar = useCallback(async () => {
    const [p, a, e] = await Promise.all([lerPerfil(), acertoPorTrilha(), idsParaCacaAosErros()])
    setPerfil(p)
    setAcerto(a)
    setErrosPendentes(e)
  }, [])

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  const comecar = (modo: Modo, questoes: Questao[]) => {
    if (!questoes.length) return
    const agora = Date.now()
    setSessao({ modo, questoes, indice: 0, respostas: [], inicio: agora, inicioQuestao: agora, sinais: new Set(), propostaFeita: false, proporEncerrar: false })
    setTela('questao')
  }

  const iniciarTreino = async () => {
    const p = perfil ?? (await lerPerfil())
    const excluir = await idsContestados()
    comecar('treino', montarSessao(BANCO, { tamanho: p.tamanhoTreino, trilhas: TRILHAS_ATIVAS, nivelPorTrilha: NIVEL_POR_TRILHA, mistura: MISTURA_PADRAO, excluir }))
  }

  const iniciarCaca = async () => {
    const ids = await idsParaCacaAosErros()
    const excluir = await idsContestados()
    comecar('caca_erros', montarCacaAosErros(BANCO.filter((q) => !excluir.has(q.id)), ids, TAMANHO.cacaAosErros))
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
        const salvo = await salvarSessao(
          { modo: s.modo, inicio: s.inicio, fim: Date.now(), nota, concluida, sinais: s.sinais.size, xpGanho, questoes: s.respostas.length },
          s.respostas,
          notaPorTrilha,
        )
        await recarregar()
        if (concluida) {
          const erros = await idsParaCacaAosErros()
          setResultado({ nota, resumo, xpGanho, sequencia: salvo.perfil.sequencia, novosRecordes: salvo.novosRecordes, erros: Math.min(TAMANHO.cacaAosErros, erros.length) })
          setSessao(null)
          setTela('fim')
          return
        }
      }
      setSessao(null)
      setTela('inicio')
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
    const propor = !sessao.propostaFeita && deveProporEncerrar([...sinais])
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

  if (!perfil) return <div className="carregando">Carregando…</div>

  if (tela === 'fim' && resultado) {
    return <Fim {...resultado} onCacaAosErros={() => void iniciarCaca()} onInicio={() => setTela('inicio')} />
  }

  if (sessao && (tela === 'questao' || tela === 'correcao')) {
    const titulo = sessao.modo === 'treino' ? 'Treino do dia' : 'Caça aos erros'
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
        escolha={r.escolha}
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

  return <Inicio perfil={perfil} acerto={acerto} errosPendentes={errosPendentes.length} onTreino={() => void iniciarTreino()} onCacaAosErros={() => void iniciarCaca()} />
}
