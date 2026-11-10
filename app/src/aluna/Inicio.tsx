import type { Configuracao } from '../config'
import { minutosDoSimulado } from '../motor/simulado'
import { nivelDoXp } from '../motor/gamificacao'
import type { Perfil } from '../dados/db'
import { NOMES_TRILHA, type Trilha } from '../tipos'
import { Mascote } from './Mascote'

interface Props {
  perfil: Perfil
  config: Configuracao
  limiteAtingido: boolean
  onAreaPais: () => void
  acerto: Partial<Record<Trilha, { acerto: number; total: number }>>
  errosPendentes: number
  recomendadas: number
  onTreino: () => void
  onCacaAosErros: () => void
  onSimulado: () => void
  onEstudar: () => void
  onEvolucao: () => void
}

export function Inicio({ perfil, config, limiteAtingido, onAreaPais, acerto, errosPendentes, recomendadas, onTreino, onCacaAosErros, onSimulado, onEstudar, onEvolucao }: Props) {
  const { nivel, progresso } = nivelDoXp(perfil.xp)
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
            <span>
              Nível {nivel} · {perfil.xp.toLocaleString('pt-BR')} XP
            </span>
            <div className="barra">
              <div style={{ width: `${Math.round(progresso * 100)}%` }} />
            </div>
          </div>
          <div className="chip">
            {perfil.sequencia} {perfil.sequencia === 1 ? 'dia seguido' : 'dias seguidos'}
          </div>
          <button type="button" className="icone branco" aria-label="Área dos pais" title="Área dos pais" onClick={onAreaPais}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4D5675" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="grade-inicio">
        <section className="missao">
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
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </span>
            <span className="atalho-texto">
              <strong>Caça aos erros</strong>
              <span>{errosPendentes > 0 ? `${Math.min(5, errosPendentes)} questões para revisar · XP em dobro` : 'Nenhum erro para revisar ainda'}</span>
            </span>
          </button>
          <button type="button" className="atalho" onClick={onSimulado} disabled={limiteAtingido}>
            <span className="atalho-icone laranja" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l3 2M9 2h6" />
              </svg>
            </span>
            <span className="atalho-texto">
              <strong>Simulado de prova</strong>
              <span>
                {config.simulado.questoes} questões de Português e Matemática · {minutosDoSimulado(config.simulado)} min
              </span>
            </span>
          </button>
          <button type="button" className="atalho" onClick={onEstudar}>
            <span className="atalho-icone azul" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
                <path d="M4 19V5M9 8h6" />
              </svg>
            </span>
            <span className="atalho-texto">
              <strong>Estudar</strong>
              <span>{recomendadas > 0 ? `${recomendadas} ${recomendadas === 1 ? 'assunto recomendado' : 'assuntos recomendados'} para você` : 'Explicações curtas com exemplos'}</span>
            </span>
          </button>
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
