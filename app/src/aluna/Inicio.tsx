import type { Configuracao } from '../config'
import { minutosDoSimulado, serieDoSimulado } from '../motor/simulado'
import { nivelDoXp } from '../motor/gamificacao'
import type { Perfil } from '../dados/db'
import { NOMES_TRILHA, type Trilha } from '../tipos'
import { Mascote } from './Mascote'
import { ARTE } from '../arte'
import { useTema } from '../tema'

interface Props {
  perfil: Perfil
  config: Configuracao
  limiteAtingido: boolean
  onAreaPais: () => void
  acerto: Partial<Record<Trilha, { acerto: number; total: number }>>
  errosPendentes: number
  recomendadas: number
  /** Lições de Projeto de Vida disponíveis agora; null = trilha desligada. */
  projetoVida: number | null
  onProjetoVida: () => void
  onTrocarTema: () => void
  onTreino: () => void
  onCacaAosErros: () => void
  onSimulado: () => void
  onEstudar: () => void
  onTreinoLivre: () => void
  onEvolucao: () => void
}

export function Inicio({ perfil, config, limiteAtingido, onAreaPais, acerto, errosPendentes, recomendadas, projetoVida, onProjetoVida, onTrocarTema, onTreino, onCacaAosErros, onSimulado, onEstudar, onTreinoLivre, onEvolucao }: Props) {
  const { nivel, progresso } = nivelDoXp(perfil.xp)
  const caderno = useTema() === 'caderno'
  const nomes = config.trilhasAtivas.map((t) => NOMES_TRILHA[t])
  const listaTrilhas = nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : nomes[0]
  const tamanho = config.iaAjustaTamanho ? perfil.tamanhoTreino : config.tamanhoTreinoFixo
  return (
    <div className="tela inicio">
      <header className="topo">
        <div className="saudacao">
          <Mascote />
          <div>
            <h1 className="titulo-grande">{config.nomeAluna ? `Olá, ${config.nomeAluna}!` : 'Olá!'}</h1>
            <p className="subtitulo">Pronta para a missão de hoje?</p>
          </div>
        </div>
        <div className="chips">
          <div className="chip chip-xp">
            <span className="linha-xp">
              {caderno && <img src={ARTE.estrela} alt="" />}
              Nível {nivel} · {perfil.xp.toLocaleString('pt-BR')} XP
            </span>
            <div className="barra">
              <div style={{ width: `${Math.round(progresso * 100)}%` }} />
            </div>
          </div>
          <div className="chip">
            {perfil.sequencia} {perfil.sequencia === 1 ? 'dia seguido' : 'dias seguidos'}
          </div>
          <button type="button" className="chip botao-tema" onClick={onTrocarTema} aria-label={caderno ? 'Trocar para o visual clássico' : 'Trocar para o visual caderno'} title="Trocar o visual">
            {caderno ? 'Visual clássico' : 'Visual caderno'}
          </button>
          <button type="button" className="icone branco" aria-label="Área dos pais" title="Área dos pais" onClick={onAreaPais}>
            {caderno ? <img src={ARTE.cadeado} alt="" /> : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4D5675" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            )}
          </button>
        </div>
      </header>

      <main className="grade-inicio">
        <section className="missao">
          {caderno && <img className="coruja-missao" src={ARTE.coruja} alt="" aria-hidden="true" />}
          <span className="rotulo">Missão do dia</span>
          <h2>{limiteAtingido ? 'Por hoje é só!' : 'Treino do dia'}</h2>
          {limiteAtingido ? (
            <p>Você já treinou bastante hoje. Descanse e volte amanhã para continuar a sequência.</p>
          ) : (
            <>
              <p>
                {tamanho} questões misturadas: {listaTrilhas}
              </p>
              <button type="button" className="botao-laranja" onClick={onTreino}>
                Começar
              </button>
            </>
          )}
        </section>

        <div className="atalhos">
          <button type="button" className="atalho" onClick={onCacaAosErros} disabled={errosPendentes === 0 || limiteAtingido}>
            <span className="atalho-icone azul" aria-hidden="true">
              {caderno ? <img src={ARTE.lupa} alt="" /> : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              )}
            </span>
            <span className="atalho-texto">
              <strong>Caça aos erros</strong>
              <span>{errosPendentes > 0 ? `${Math.min(5, errosPendentes)} questões para revisar · XP em dobro` : 'Nenhum erro para revisar ainda'}</span>
            </span>
          </button>
          <button type="button" className="atalho" onClick={onSimulado} disabled={limiteAtingido}>
            <span className="atalho-icone laranja" aria-hidden="true">
              {caderno ? <img src={ARTE.relogio} alt="" /> : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l3 2M9 2h6" />
              </svg>
              )}
            </span>
            <span className="atalho-texto">
              <strong>Simulado de prova</strong>
              <span>
                {serieDoSimulado(config.serieAtual)}º ano · alta dificuldade · {config.simulado.questoes} questões · {minutosDoSimulado(config.simulado)} min
              </span>
            </span>
          </button>
          <button type="button" className="atalho" onClick={onTreinoLivre} disabled={limiteAtingido}>
            <span className="atalho-icone verde" aria-hidden="true">
              {caderno ? <img src={ARTE.estrela} alt="" /> : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20l5-8 4 5 3-4 4 7z" />
                <path d="M15 4l2 2-2 2M17 6h-5" />
              </svg>
              )}
            </span>
            <span className="atalho-texto">
              <strong>Treino livre</strong>
              <span>Escolha a série, do 3º ao 9º ano</span>
            </span>
          </button>
          <button type="button" className="atalho" onClick={onEstudar}>
            <span className="atalho-icone azul" aria-hidden="true">
              {caderno ? <img src={ARTE.livro} alt="" /> : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
                <path d="M4 19V5M9 8h6" />
              </svg>
              )}
            </span>
            <span className="atalho-texto">
              <strong>Estudar</strong>
              <span>{recomendadas > 0 ? `${recomendadas} ${recomendadas === 1 ? 'assunto recomendado' : 'assuntos recomendados'} para você` : 'Explicações curtas com exemplos'}</span>
            </span>
          </button>
          {projetoVida !== null && (
            <button type="button" className="atalho" onClick={onProjetoVida}>
              <span className="atalho-icone roxo" aria-hidden="true">
              {caderno ? <img src={ARTE.coracao} alt="" /> : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" />
                </svg>
              )}
            </span>
              <span className="atalho-texto">
                <strong>Projeto de Vida</strong>
                <span>{projetoVida > 0 ? `${projetoVida} ${projetoVida === 1 ? 'lição nova' : 'lições novas'} · sonhos, dinheiro, ideias e emoções` : 'Sonhos, dinheiro, ideias e emoções'}</span>
              </span>
            </button>
          )}
        </div>
      </main>

      <section>
        <div className="secao-topo">
          <h2 className="titulo-secao">Minhas trilhas</h2>
          <button type="button" className="link" onClick={onEvolucao}>
            Ver minha evolução
          </button>
        </div>
        <div className="trilhas">
          {config.trilhasAtivas.map((t) => {
            const a = acerto[t]
            const pct = a ? Math.round(a.acerto * 100) : 0
            return (
              <div key={t} className="cartao trilha">
                <strong>{NOMES_TRILHA[t]}</strong>
                <div className="barra">
                  <div style={{ width: `${pct}%` }} />
                </div>
                <span>{a ? `${pct}% de acerto em ${a.total} questões` : 'Ainda sem questões'}</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
