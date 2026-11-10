import { useEffect, useRef, useState } from 'react'
import { Figura } from '../figuras/Figura'
import { NOMES_TRILHA, type Letra, type Questao } from '../tipos'
import { Rascunho } from './Rascunho'

interface Props {
  questoes: Questao[]
  minutos: number
  onEntregar: (escolhas: (Letra | null)[], temposMs: number[], porTempo: boolean) => void
  onSair: () => void
}

/** Simulado no formato da prova real: sem correção durante a prova, com tempo, navegação livre e entrega no fim. */
export function Simulado({ questoes, minutos, onEntregar, onSair }: Props) {
  const [indice, setIndice] = useState(0)
  const [escolhas, setEscolhas] = useState<(Letra | null)[]>(() => questoes.map(() => null))
  const [restanteS, setRestanteS] = useState(minutos * 60)
  const [verTodas, setVerTodas] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const tempos = useRef<number[]>(questoes.map(() => 0))
  const desde = useRef(Date.now())
  const entregue = useRef(false)

  const registrarTempo = () => {
    tempos.current[indice] += Date.now() - desde.current
    desde.current = Date.now()
  }

  const entregar = (porTempo: boolean) => {
    if (entregue.current) return
    entregue.current = true
    registrarTempo()
    onEntregar(escolhas, tempos.current, porTempo)
  }

  useEffect(() => {
    const t = window.setInterval(() => setRestanteS((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (restanteS === 0) entregar(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restanteS])

  const ir = (i: number) => {
    registrarTempo()
    setIndice(i)
    setVerTodas(false)
  }

  const q = questoes[indice]
  const escolha = escolhas[indice]
  const respondidas = escolhas.filter((e) => e !== null).length
  const emBranco = questoes.length - respondidas
  const min = Math.ceil(restanteS / 60)
  const pouco = restanteS <= 5 * 60
  const comFiguras = q.alternativas.every((a) => a.figura)

  return (
    <div className="tela questao simulado">
      <header className="topo-sessao">
        <button type="button" className="icone branco" aria-label="Sair do simulado" onClick={onSair}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="progresso">
          <div className="progresso-texto">
            <span>Simulado de prova · {indice < questoes.length / 2 ? 'Português' : 'Matemática'}</span>
            <span>
              Questão {indice + 1} de {questoes.length} · {respondidas} respondidas
            </span>
          </div>
          <div className="progresso-barras" style={{ gridTemplateColumns: `repeat(${questoes.length}, minmax(0, 1fr))` }}>
            {questoes.map((_, i) => (
              <div key={i} style={{ background: i === indice ? '#2F6FED' : escolhas[i] ? '#1B2340' : '#D9DEEA' }} />
            ))}
          </div>
        </div>
        <div className={`relogio-prova ${pouco ? 'pouco' : ''}`} role="timer" aria-live={pouco ? 'polite' : 'off'}>
          {min} min
        </div>
        <button type="button" className="botao-contorno pequeno" onClick={() => setVerTodas(!verTodas)}>
          {verTodas ? 'Voltar à questão' : 'Ver todas'}
        </button>
      </header>

      {verTodas ? (
        <section className="cartao grade-questoes">
          <h2>Todas as questões</h2>
          <p className="secundario">Toque numa questão para ir até ela. As em branco aparecem com borda tracejada.</p>
          <div className="grade-numeros">
            {questoes.map((qq, i) => (
              <button key={qq.id} type="button" className={`numero-questao ${escolhas[i] ? 'respondida' : 'branco'} ${i === indice ? 'atual' : ''}`} onClick={() => ir(i)}>
                <span>{i + 1}</span>
                <small>{escolhas[i] ?? '—'}</small>
              </button>
            ))}
          </div>
          <button type="button" className="botao-laranja" onClick={() => setConfirmar(true)}>
            Entregar a prova
          </button>
        </section>
      ) : (
        <div className="corpo-questao">
          <section className="cartao enunciado">
            <div className="etiquetas">
              <span className="etiqueta azul">{NOMES_TRILHA[q.trilha]}</span>
            </div>
            {q.texto_apoio && <p className="texto-apoio">{q.texto_apoio}</p>}
            <h1>{q.enunciado}</h1>
            {q.figura && (
              <div className="area-figura">
                <Figura figura={q.figura} />
              </div>
            )}
            <div className={comFiguras ? 'alternativas grade' : 'alternativas lista'} role="radiogroup" aria-label="Alternativas">
              {q.alternativas.map((a) => (
                <button
                  key={a.letra}
                  type="button"
                  role="radio"
                  aria-checked={escolha === a.letra}
                  aria-label={`Alternativa ${a.letra}: ${a.texto}`}
                  className={`alternativa ${escolha === a.letra ? 'selecionada' : ''}`}
                  onClick={() => setEscolhas(escolhas.map((e, i) => (i === indice ? (e === a.letra ? null : a.letra) : e)))}
                >
                  <span className="letra">{a.letra}</span>
                  {a.figura ? <Figura figura={a.figura} tamanho={52} /> : <span className="alt-texto">{a.texto}</span>}
                </button>
              ))}
            </div>
            <div className="rodape-questao">
              <button type="button" className="botao-contorno pequeno" disabled={indice === 0} onClick={() => ir(indice - 1)}>
                Anterior
              </button>
              {indice + 1 < questoes.length ? (
                <button type="button" className="botao-azul" onClick={() => ir(indice + 1)}>
                  {escolha ? 'Próxima' : 'Pular por enquanto'}
                </button>
              ) : (
                <button type="button" className="botao-laranja" onClick={() => setConfirmar(true)}>
                  Entregar a prova
                </button>
              )}
            </div>
          </section>
          <Rascunho chave={q.id} />
        </div>
      )}

      {confirmar && (
        <div className="fundo-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-entregar">
          <div className="cartao modal">
            <h2 id="titulo-entregar">Entregar a prova?</h2>
            <p>{emBranco === 0 ? 'Você respondeu todas as questões.' : `Ainda ${emBranco === 1 ? 'há 1 questão' : `há ${emBranco} questões`} em branco. Questão em branco conta como errada.`}</p>
            <div className="botoes-linha">
              <button type="button" className="botao-laranja pequeno" onClick={() => entregar(false)}>
                Sim, entregar
              </button>
              <button type="button" className="botao-contorno pequeno" onClick={() => setConfirmar(false)}>
                Revisar mais
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
