import { NOME_ALUNA, TRILHAS_ATIVAS } from '../config'
import { nivelDoXp } from '../motor/gamificacao'
import type { Perfil } from '../dados/db'
import { NOMES_TRILHA, type Trilha } from '../tipos'
import { Mascote } from './Mascote'

interface Props {
  perfil: Perfil
  acerto: Partial<Record<Trilha, { acerto: number; total: number }>>
  errosPendentes: number
  onTreino: () => void
  onCacaAosErros: () => void
}

export function Inicio({ perfil, acerto, errosPendentes, onTreino, onCacaAosErros }: Props) {
  const { nivel, progresso } = nivelDoXp(perfil.xp)
  return (
    <div className="tela inicio">
      <header className="topo">
        <div className="saudacao">
          <Mascote />
          <div>
            <h1 className="titulo-grande">Olá, {NOME_ALUNA}!</h1>
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
        </div>
      </header>

      <main className="grade-inicio">
        <section className="missao">
          <span className="rotulo">Missão do dia</span>
          <h2>Treino do dia</h2>
          <p>{perfil.tamanhoTreino} questões misturadas: Português, Matemática e Lógica</p>
          <button type="button" className="botao-laranja" onClick={onTreino}>
            Começar
          </button>
        </section>

        <div className="atalhos">
          <button type="button" className="atalho" onClick={onCacaAosErros} disabled={errosPendentes === 0}>
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
          <button type="button" className="atalho" disabled>
            <span className="atalho-icone laranja" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l3 2M9 2h6" />
              </svg>
            </span>
            <span className="atalho-texto">
              <strong>Simulado de prova</strong>
              <span>Em breve</span>
            </span>
          </button>
          <button type="button" className="atalho" disabled>
            <span className="atalho-icone azul" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
                <path d="M4 19V5M9 8h6" />
              </svg>
            </span>
            <span className="atalho-texto">
              <strong>Estudar</strong>
              <span>Em breve</span>
            </span>
          </button>
        </div>
      </main>

      <section>
        <h2 className="titulo-secao">Minhas trilhas</h2>
        <div className="trilhas">
          {TRILHAS_ATIVAS.map((t) => {
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
