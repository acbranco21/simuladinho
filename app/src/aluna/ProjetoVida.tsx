import { MODULOS_PV, type LicaoPV } from '../conteudo/projeto-vida'
import { situacaoLicoes, situacaoModulo, type ConfigProjetoVida, type ProgressoAluna, type SituacaoLicao } from '../motor/projetoVida'

interface Props {
  cfg: ConfigProjetoVida
  progresso: ProgressoAluna
  hoje: string
  limiteAtingido: boolean
  onAbrir: (licao: LicaoPV) => void
  onVoltar: () => void
}

const ROTULO: Record<SituacaoLicao, string> = {
  concluida: 'Feita',
  disponivel: 'Começar',
  amanha: 'Abre amanhã',
  trancada: 'Trancada',
}

function Cadeado() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function ProjetoVida({ cfg, progresso, hoje, limiteAtingido, onAbrir, onVoltar }: Props) {
  const modulos = MODULOS_PV.filter((m) => situacaoModulo(m.id, cfg, progresso) !== 'bloqueado')
  return (
    <div className="tela projeto-vida">
      <header className="topo-sessao">
        <button type="button" className="icone branco" aria-label="Voltar ao início" onClick={onVoltar}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h1 className="titulo-grande">Projeto de Vida</h1>
          <p className="subtitulo">
            {limiteAtingido ? 'Por hoje é só! Amanhã tem mais.' : 'Histórias curtas sobre sonhos, dinheiro, ideias e emoções. Aqui não tem nota.'}
          </p>
        </div>
      </header>

      <div className="grade-modulos">
        {modulos.map((m) => {
          const aberto = situacaoModulo(m.id, cfg, progresso) === 'aberto'
          const licoes = situacaoLicoes(m.id, cfg, progresso, hoje)
          const feitas = licoes.filter((l) => l.situacao === 'concluida').length
          return (
            <section key={m.id} className={`cartao modulo-pv ${m.cor} ${aberto ? '' : 'fechado'}`}>
              <div className="modulo-topo">
                <span className={`etiqueta ${m.cor}`}>{m.tema}</span>
                <span className="secundario">
                  {feitas} de {licoes.length}
                </span>
              </div>
              <h2>{m.nome}</h2>
              <p className="modulo-desc">{aberto ? m.descricao : m.comoLiberar}</p>
              <ol className="licoes-pv">
                {licoes.map(({ licao, situacao }) => {
                  const pode = (situacao === 'disponivel' || situacao === 'concluida') && !limiteAtingido
                  return (
                    <li key={licao.id}>
                      <button type="button" className={`licao-pv ${situacao}`} disabled={!pode} onClick={() => onAbrir(licao)}>
                        <span className="licao-nome">{licao.titulo}</span>
                        <span className="licao-estado">
                          {situacao === 'trancada' && <Cadeado />}
                          {situacao === 'concluida' ? 'Feita · refazer' : ROTULO[situacao]}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>
    </div>
  )
}
