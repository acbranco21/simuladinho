import { PILULAS } from '../conteudo/pilulas'
import { NOMES_TRILHA, type Trilha } from '../tipos'

interface Props {
  trilhas: Trilha[]
  aprendidas: Set<string>
  recomendadas: Set<string>
  onAbrir: (habilidade: string) => void
  onVoltar: () => void
}

export function Estudar({ trilhas, aprendidas, recomendadas, onAbrir, onVoltar }: Props) {
  return (
    <div className="tela estudar">
      <header className="topo-sessao">
        <button type="button" className="icone branco" aria-label="Voltar ao início" onClick={onVoltar}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h1 className="titulo-grande">Estudar</h1>
          <p className="subtitulo">
            Escolha um assunto: leia a explicação, veja o exemplo e pratique 3 questões. {aprendidas.size} de {PILULAS.filter((p) => trilhas.includes(p.trilha)).length} aprendidos.
          </p>
        </div>
      </header>
      {trilhas.map((t) => (
        <section key={t}>
          <h2 className="titulo-secao">{NOMES_TRILHA[t]}</h2>
          <div className="grade-pilulas">
            {PILULAS.filter((p) => p.trilha === t).map((p) => {
              const ok = aprendidas.has(p.habilidade)
              const rec = !ok && recomendadas.has(p.habilidade)
              return (
                <button key={p.id} type="button" className={`cartao pilula-cartao ${ok ? 'aprendida' : ''}`} onClick={() => onAbrir(p.habilidade)}>
                  <strong>{p.titulo}</strong>
                  <span>{p.resumo}</span>
                  <span className={`etiqueta ${ok ? 'verde' : rec ? 'laranja' : 'cinza'}`}>{ok ? 'Aprendido' : rec ? 'Recomendado para você' : 'Novo'}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
