export type EstadoPasso = 'certo' | 'errado' | 'atual' | 'futuro'

const COR: Record<EstadoPasso, string> = {
  certo: '#1F9D55',
  errado: '#F28C28',
  atual: '#2F6FED',
  futuro: '#D9DEEA',
}

export function Progresso({ titulo, passos, atual }: { titulo: string; passos: EstadoPasso[]; atual: number }) {
  return (
    <div className="progresso">
      <div className="progresso-texto">
        <span>{titulo}</span>
        <span>
          Questão {atual + 1} de {passos.length}
        </span>
      </div>
      <div className="progresso-barras" style={{ gridTemplateColumns: `repeat(${passos.length}, minmax(0, 1fr))` }}>
        {passos.map((p, i) => (
          <div key={i} style={{ background: COR[p] }} />
        ))}
      </div>
    </div>
  )
}
