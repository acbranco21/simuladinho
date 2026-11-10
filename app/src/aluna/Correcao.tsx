import { Figura } from '../figuras/Figura'
import type { Letra, Questao } from '../tipos'
import { Mascote } from './Mascote'
import { Progresso, type EstadoPasso } from './Progresso'

interface Props {
  questao: Questao
  escolha: Letra
  xp: number
  titulo: string
  passos: EstadoPasso[]
  indice: number
  ultima: boolean
  proporEncerrar: boolean
  onProxima: () => void
  onEncerrar: () => void
  onSair: () => void
}

export function Correcao({ questao, escolha, xp, titulo, passos, indice, ultima, proporEncerrar, onProxima, onEncerrar, onSair }: Props) {
  const acertou = escolha === questao.gabarito
  const dela = questao.alternativas.find((a) => a.letra === escolha)!
  const certa = questao.alternativas.find((a) => a.letra === questao.gabarito)!

  return (
    <div className="tela correcao">
      <header className="topo-sessao">
        <button type="button" className="icone branco" aria-label="Sair da sessão" onClick={onSair}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <Progresso titulo={titulo} passos={passos} atual={indice} />
      </header>

      <div className="corpo-questao">
        <section className="cartao enunciado">
          {questao.texto_apoio && <p className="texto-apoio">{questao.texto_apoio}</p>}
          <h1>{questao.enunciado}</h1>
          {questao.figura && (
            <div className="area-figura">
              <Figura figura={questao.figura} />
            </div>
          )}
          <div className="comparacao">
            {!acertou && (
              <div className="resposta-dela">
                {dela.figura && <Figura figura={dela.figura} tamanho={48} />}
                <span>
                  <small>Sua resposta</small>
                  <strong>
                    {dela.letra} · {dela.texto}
                  </strong>
                </span>
              </div>
            )}
            <div className="resposta-certa">
              {certa.figura && <Figura figura={certa.figura} tamanho={48} />}
              <span>
                <small>{acertou ? 'Você acertou!' : 'Resposta certa'}</small>
                <strong>
                  {certa.letra} · {certa.texto}
                </strong>
              </span>
            </div>
          </div>
          <div className="rodape-questao">
            <span />
            <button type="button" className="botao-azul" onClick={onProxima}>
              {ultima ? 'Ver resultado' : 'Próxima questão'}
            </button>
          </div>
        </section>

        <aside className="lateral-correcao">
          <div className="cartao explicacao">
            <div className="explicacao-topo">
              <Mascote tamanho={56} feliz={acertou} />
              <strong>{acertou ? 'Muito bem!' : 'Quase lá!'}</strong>
            </div>
            <p>{questao.explicacao}</p>
            {!acertou && dela.erro_tipico && <p className="secundario">O que pode ter acontecido: {dela.erro_tipico.charAt(0).toLowerCase() + dela.erro_tipico.slice(1)}.</p>}
            {questao.dica && <div className="dica">Dica: {questao.dica}</div>}
          </div>
          <div className="xp-ganho">
            +{xp} XP {acertou ? 'pelo acerto' : 'por tentar · esta questão volta na Caça aos erros'}
          </div>
          {proporEncerrar && !ultima && (
            <div className="cartao proposta-encerrar">
              <strong>Que tal uma pausa?</strong>
              <p>Você já treinou bastante hoje. Pode encerrar agora e guardar sua missão como cumprida.</p>
              <div className="botoes-linha">
                <button type="button" className="botao-laranja pequeno" onClick={onEncerrar}>
                  Missão cumprida
                </button>
                <button type="button" className="botao-contorno pequeno" onClick={onProxima}>
                  Continuar
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
