import { useState } from 'react'
import { COLECOES, NOMES_TRILHA, SERIES, type Colecao, type Serie, type Trilha } from '../tipos'

interface Props {
  serieAtual: Serie
  serieInicial: Serie
  colecaoInicial: Colecao | 'todas'
  trilhasIniciais: Trilha[]
  /** Quantas questões existem para a série escolhida (por coleção), para avisar quando forem poucas. */
  contar: (serie: Serie, colecao: Colecao | 'todas', trilhas: Trilha[]) => number
  limiteAtingido: boolean
  onComecar: (serie: Serie, colecao: Colecao | 'todas', trilhas: Trilha[]) => void
  onVoltar: () => void
}

const TRILHAS: Trilha[] = ['portugues', 'matematica', 'logica']

/** Treino livre: a aluna escolhe qualquer série do 3º ao 9º ano. Não conta para subir de nível nem para recordes. */
export function TreinoLivre({ serieAtual, serieInicial, colecaoInicial, trilhasIniciais, contar, limiteAtingido, onComecar, onVoltar }: Props) {
  const [serie, setSerie] = useState<Serie>(serieInicial)
  const [colecao, setColecao] = useState<Colecao | 'todas'>(colecaoInicial)
  const [trilhas, setTrilhas] = useState<Trilha[]>(trilhasIniciais.length ? trilhasIniciais : TRILHAS)
  const disponiveis = contar(serie, colecao, trilhas)
  const alternar = (t: Trilha) => setTrilhas((ts) => (ts.includes(t) ? (ts.length > 1 ? ts.filter((x) => x !== t) : ts) : [...ts, t]))
  const rotulo = (s: Serie) => (s === serieAtual ? 'sua série' : s === serieAtual + 1 ? 'próximo ano' : s > serieAtual + 1 ? 'desafio' : 'revisão')

  return (
    <div className="tela treino-livre">
      <header className="topo-sessao">
        <button type="button" className="icone branco" aria-label="Voltar ao início" onClick={onVoltar}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h1 className="titulo-grande">Treino livre</h1>
          <p className="subtitulo">Escolha a série e treine o quanto quiser. Aqui você pode ir muito além do seu ano!</p>
        </div>
      </header>

      <section className="cartao bloco-escolha">
        <h2 className="titulo-secao">Série</h2>
        <div className="grade-series" role="radiogroup" aria-label="Série">
          {SERIES.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={serie === s} className={`serie-chip ${serie === s ? 'ativa' : ''} ${s > serieAtual + 1 ? 'alem' : ''}`} onClick={() => setSerie(s)}>
              <strong>{s}º ano</strong>
              <small>{rotulo(s)}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="linha-escolhas">
        <section className="cartao bloco-escolha">
          <h2 className="titulo-secao">Matérias</h2>
          <div className="chips">
            {TRILHAS.map((t) => (
              <button key={t} type="button" aria-pressed={trilhas.includes(t)} className={`chip-escolha ${trilhas.includes(t) ? 'ativa' : ''}`} onClick={() => alternar(t)}>
                {NOMES_TRILHA[t]}
              </button>
            ))}
          </div>
        </section>
        <section className="cartao bloco-escolha">
          <h2 className="titulo-secao">Coleção</h2>
          <div className="chips">
            <button type="button" aria-pressed={colecao === 'todas'} className={`chip-escolha ${colecao === 'todas' ? 'ativa' : ''}`} onClick={() => setColecao('todas')} title="Mistura as três coleções">
              Misturar todas
            </button>
            {COLECOES.map((c) => (
              <button key={c.id} type="button" aria-pressed={colecao === c.id} className={`chip-escolha ${colecao === c.id ? 'ativa' : ''}`} onClick={() => setColecao(c.id)} title={c.descricao}>
                {c.nome}
              </button>
            ))}
          </div>
          <p className="secundario pequeno-texto">{colecao === 'todas' ? 'Questões das três coleções, misturadas.' : COLECOES.find((c) => c.id === colecao)!.descricao + '.'} A coleção escolhida vale também para o treino do dia e o simulado.</p>
        </section>
      </div>

      <footer className="rodape-pilula">
        <span className="secundario">
          {limiteAtingido
            ? 'Por hoje é só! Amanhã tem mais.'
            : disponiveis < 10
              ? `Esta escolha tem só ${disponiveis} questões${colecao !== 'todas' ? '; vamos completar com outras coleções' : ''}.`
              : `${disponiveis} questões disponíveis para esta escolha.`}
        </span>
        <button type="button" className="botao-laranja" disabled={limiteAtingido || !disponiveis} onClick={() => onComecar(serie, colecao, trilhas)}>
          Começar {serie}º ano
        </button>
      </footer>
    </div>
  )
}
