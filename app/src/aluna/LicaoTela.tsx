import { useMemo, useState } from 'react'
import { MODULOS_PV, type LicaoPV, type OpcaoPV } from '../conteudo/projeto-vida'
import { Mascote } from './Mascote'

interface Props {
  licao: LicaoPV
  /** XP ganho ao concluir (null enquanto não terminou; 0 se já tinha feito antes). */
  xpGanho: number | null
  /** Chamado uma vez, ao responder a última pergunta: é aqui que a lição é registrada. */
  onTerminar: () => void
  onVoltar: () => void
  /** Sair no meio: nada é registrado. */
  onSair: () => void
}

function ouvir(textos: string[]) {
  if (!('speechSynthesis' in window)) return
  const fala = new SpeechSynthesisUtterance(textos.join(' '))
  fala.lang = 'pt-BR'
  fala.rate = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(fala)
}

function BotaoOuvir({ textos }: { textos: string[] }) {
  return (
    <button type="button" className="icone branco" aria-label="Ouvir" onClick={() => ouvir(textos)}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F6FED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9z" />
        <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
      </svg>
    </button>
  )
}

/** Passo 0 = história; 1..n = atividades; n+1 = fim. As escolhas não são salvas em lugar nenhum. */
export function LicaoTela({ licao, xpGanho, onTerminar, onVoltar, onSair }: Props) {
  const [passo, setPasso] = useState(0)
  const [tentadas, setTentadas] = useState<number[]>([])
  const [escolhida, setEscolhida] = useState<number | null>(null)
  const [verHistoria, setVerHistoria] = useState(false)
  // Embaralha as opções de cada atividade (a certa não fica sempre no mesmo lugar). Estável durante a lição.
  const ordens = useMemo(
    () =>
      licao.atividades.map((a) => {
        const idx = a.opcoes.map((_, i) => i)
        for (let i = idx.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[idx[i], idx[j]] = [idx[j], idx[i]]
        }
        return idx
      }),
    [licao],
  )
  const modulo = MODULOS_PV.find((m) => m.id === licao.modulo)!
  const total = licao.atividades.length

  const avancar = () => {
    if (passo === total) onTerminar()
    setTentadas([])
    setEscolhida(null)
    setVerHistoria(false)
    setPasso(passo + 1)
  }

  const topo = (
    <header className="topo-sessao">
      <button type="button" className="icone branco" aria-label="Sair da lição" onClick={passo > total ? onVoltar : onSair}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="titulo-pilula">
        <span className={`etiqueta ${modulo.cor}`}>
          {modulo.nome} · {licao.serie}º ano
        </span>
        <h1 className="titulo-grande">{licao.titulo}</h1>
      </div>
      <div className="pontos-licao" aria-label={`Etapa ${Math.min(passo, total + 1) + 1} de ${total + 2}`}>
        {Array.from({ length: total + 2 }, (_, i) => (
          <span key={i} className={i < passo ? 'feito' : i === passo ? 'atual' : ''} />
        ))}
      </div>
    </header>
  )

  if (passo === 0) {
    return (
      <div className="tela licao">
        {topo}
        <div className="corpo-licao">
          <section className="cartao historia-pv">
            <div className="historia-topo">
              <Mascote tamanho={56} />
              <BotaoOuvir textos={licao.historia} />
            </div>
            {licao.historia.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
          <aside className="cartao ideia-pv">
            <span className="rotulo-pv">A grande ideia</span>
            <p>{licao.ideia}</p>
          </aside>
        </div>
        <footer className="rodape-pilula">
          <span className="secundario">Leia a história. Depois, {total} perguntas rápidas.</span>
          <button type="button" className="botao-laranja" onClick={avancar}>
            Vamos lá
          </button>
        </footer>
      </div>
    )
  }

  if (passo > total) {
    return (
      <div className="tela licao">
        {topo}
        <div className="fim-licao">
          <Mascote tamanho={96} feliz desenhar />
          <h2>Lição concluída!</h2>
          <p className="ideia-fim">{licao.ideia}</p>
          {!!xpGanho && <span className="etiqueta laranja grande">+{xpGanho} XP</span>}
          <section className="cartao com-adulto">
            <span className="rotulo-pv">Desafio fora da tela</span>
            <p>{licao.comAdulto}</p>
          </section>
          <button type="button" className="botao-laranja" onClick={onVoltar}>
            Voltar ao Projeto de Vida
          </button>
        </div>
      </div>
    )
  }

  const atividade = licao.atividades[passo - 1]
  const opcao: OpcaoPV | null = escolhida === null ? null : atividade.opcoes[escolhida]
  const resolvida = !!opcao && (atividade.tipo === 'escolha' || opcao.correta)

  const escolher = (i: number) => {
    if (resolvida) return
    setEscolhida(i)
    if (atividade.tipo === 'certa' && !atividade.opcoes[i].correta) setTentadas([...tentadas, i])
  }

  return (
    <div className="tela licao">
      {topo}
      <section className="cartao atividade-pv">
        <div className="pergunta-pv">
          <h2>{atividade.pergunta}</h2>
          <BotaoOuvir textos={[atividade.pergunta, ...atividade.opcoes.map((o) => o.texto)]} />
        </div>
        {atividade.tipo === 'escolha' && <p className="secundario">Não tem resposta errada. Escolha a que combina com você.</p>}
        <div className="opcoes-pv">
          {ordens[passo - 1].map((i) => {
            const o = atividade.opcoes[i]
            const classe = escolhida === i && resolvida ? (atividade.tipo === 'certa' ? 'certa' : 'escolhida') : tentadas.includes(i) ? 'tentada' : ''
            return (
              <button key={o.texto} type="button" className={`opcao-pv ${classe}`} disabled={resolvida || tentadas.includes(i)} onClick={() => escolher(i)}>
                {o.texto}
              </button>
            )
          })}
        </div>
        <button type="button" className="link rever-historia" onClick={() => setVerHistoria(!verHistoria)} aria-expanded={verHistoria}>
          {verHistoria ? 'Esconder a história' : 'Ver a história de novo'}
        </button>
        {verHistoria && (
          <div className="texto-apoio historia-apoio">
            {licao.historia.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}
        {!resolvida && tentadas.length >= 2 && (
          <div className="texto-apoio pista-pv" role="note">
            <strong>Pista: </strong>
            {atividade.pista ?? 'A resposta está na história. Toque em "Ver a história de novo" e procure o trecho que fala disso.'}
          </div>
        )}
        {opcao && (
          <div className={`retorno-pv ${resolvida ? (atividade.tipo === 'certa' ? 'verde' : 'azul') : 'laranja'}`} role="status">
            {opcao.retorno}
            {!resolvida && <strong> Tente outra opção.</strong>}
          </div>
        )}
      </section>
      <footer className="rodape-pilula">
        <span className="secundario">
          Pergunta {passo} de {total}
        </span>
        <button type="button" className="botao-laranja" onClick={avancar} disabled={!resolvida}>
          {passo === total ? 'Concluir' : 'Próxima'}
        </button>
      </footer>
    </div>
  )
}
