import { useState } from 'react'
import { Figura } from '../figuras/Figura'
import type { Letra, Questao } from '../tipos'
import { NOMES_TRILHA } from '../tipos'
import { Progresso, type EstadoPasso } from './Progresso'
import { Rascunho } from './Rascunho'

interface Props {
  questao: Questao
  titulo: string
  passos: EstadoPasso[]
  indice: number
  onConfirmar: (letra: Letra) => void
  onSair: () => void
  onContestar: () => void
}

function ouvir(q: Questao) {
  if (!('speechSynthesis' in window)) return
  const texto = [q.texto_apoio, q.enunciado, ...q.alternativas.map((a) => `${a.letra}: ${a.texto}`)].filter(Boolean).join('. ')
  const fala = new SpeechSynthesisUtterance(texto)
  fala.lang = 'pt-BR'
  fala.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(fala)
}

export function QuestaoTela({ questao, titulo, passos, indice, onConfirmar, onSair, onContestar }: Props) {
  const [escolha, setEscolha] = useState<Letra | null>(null)
  const comFiguras = questao.alternativas.every((a) => a.figura)

  return (
    <div className="tela questao">
      <header className="topo-sessao">
        <button type="button" className="icone branco" aria-label="Sair da sessão" onClick={onSair}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <Progresso titulo={titulo} passos={passos} atual={indice} />
        <button type="button" className="icone branco" aria-label="Ouvir o enunciado" onClick={() => ouvir(questao)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F6FED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9z" />
            <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
          </svg>
        </button>
      </header>

      <div className="corpo-questao">
        <section className="cartao enunciado">
          <div className="etiquetas">
            <span className="etiqueta azul">{NOMES_TRILHA[questao.trilha]}</span>
            <span className="etiqueta cinza">Nível {questao.dificuldade} de 5</span>
          </div>
          {questao.texto_apoio && <p className="texto-apoio">{questao.texto_apoio}</p>}
          <h1>{questao.enunciado}</h1>
          {questao.figura && (
            <div className="area-figura">
              <Figura figura={questao.figura} />
            </div>
          )}
          <div className={comFiguras ? 'alternativas grade' : 'alternativas lista'} role="radiogroup" aria-label="Alternativas">
            {questao.alternativas.map((a) => (
              <button
                key={a.letra}
                type="button"
                role="radio"
                aria-checked={escolha === a.letra}
                aria-label={`Alternativa ${a.letra}: ${a.texto}`}
                className={`alternativa ${escolha === a.letra ? 'selecionada' : ''}`}
                onClick={() => setEscolha(a.letra)}
              >
                <span className="letra">{a.letra}</span>
                {a.figura ? <Figura figura={a.figura} tamanho={52} /> : <span className="alt-texto">{a.texto}</span>}
              </button>
            ))}
          </div>
          <div className="rodape-questao">
            <button type="button" className="link" onClick={onContestar}>
              Achei um erro
            </button>
            <button type="button" className="botao-azul" disabled={!escolha} onClick={() => escolha && onConfirmar(escolha)}>
              {escolha ? 'Confirmar resposta' : 'Escolha uma resposta'}
            </button>
          </div>
        </section>
        <Rascunho chave={questao.id} />
      </div>
    </div>
  )
}
