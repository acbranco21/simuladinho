import { useState } from 'react'
import type { Pilula } from '../conteudo/pilulas'
import { Figura } from '../figuras/Figura'
import { NOMES_TRILHA } from '../tipos'
import { Mascote } from './Mascote'

interface Props {
  pilula: Pilula
  aprendida: boolean
  questoesDisponiveis: number
  onPraticar: () => void
  onVoltar: () => void
}

function ouvir(p: Pilula) {
  if (!('speechSynthesis' in window)) return
  const fala = new SpeechSynthesisUtterance([p.titulo, p.resumo, ...p.regras].join('. '))
  fala.lang = 'pt-BR'
  fala.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(fala)
}

export function PilulaTela({ pilula: p, aprendida, questoesDisponiveis, onPraticar, onVoltar }: Props) {
  const [passos, setPassos] = useState(0)
  const todos = passos >= p.exemplo.passos.length
  const n = Math.min(3, questoesDisponiveis)
  return (
    <div className="tela pilula">
      <header className="topo-sessao">
        <button type="button" className="icone branco" aria-label="Voltar para Estudar" onClick={onVoltar}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="titulo-pilula">
          <span className="etiqueta azul">{NOMES_TRILHA[p.trilha]}</span>
          <h1 className="titulo-grande">{p.titulo}</h1>
        </div>
        <button type="button" className="icone branco" aria-label="Ouvir a explicação" onClick={() => ouvir(p)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F6FED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9z" />
            <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
          </svg>
        </button>
      </header>

      <div className="corpo-pilula">
        <section className="cartao explicacao-pilula">
          <div className="explicacao-topo">
            <Mascote tamanho={56} />
            <p className="resumo-pilula">{p.resumo}</p>
          </div>
          <ul className="regras">
            {p.regras.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <div className="dica">Dica: {p.dica}</div>
        </section>

        <section className="cartao exemplo-pilula">
          <h2>Exemplo resolvido</h2>
          <p className="pergunta-exemplo">{p.exemplo.pergunta}</p>
          {p.exemplo.figura && (
            <div className="area-figura">
              <Figura figura={p.exemplo.figura} />
            </div>
          )}
          <ol className="passos">
            {p.exemplo.passos.slice(0, passos).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {todos ? (
            <div className="resposta-certa">
              <span>
                <small>Resposta</small>
                <strong>{p.exemplo.resposta}</strong>
              </span>
            </div>
          ) : (
            <button type="button" className="botao-contorno pequeno" onClick={() => setPassos(passos + 1)}>
              {passos === 0 ? 'Mostrar o primeiro passo' : 'Próximo passo'}
            </button>
          )}
        </section>
      </div>

      <footer className="rodape-pilula">
        <span className="secundario">{aprendida ? 'Você já aprendeu este assunto. Pode praticar de novo quando quiser.' : `Acerte ${Math.ceil((n * 2) / 3)} de ${n} para marcar como aprendido.`}</span>
        <button type="button" className="botao-laranja" onClick={onPraticar} disabled={n === 0}>
          Praticar {n} {n === 1 ? 'questão' : 'questões'}
        </button>
      </footer>
    </div>
  )
}
