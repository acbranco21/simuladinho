import type { Figura as FiguraTipo, FormaNome } from '../tipos'

const COR: Record<FormaNome, string> = {
  triangulo: '#2F6FED',
  circulo: '#F28C28',
  quadrado: '#1B2340',
  estrela: '#1F9D55',
  losango: '#7B4FD6',
}

export function Forma({ forma, tamanho = 56 }: { forma: FormaNome; tamanho?: number }) {
  const c = COR[forma]
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 56 56" aria-hidden="true">
      {forma === 'triangulo' && <path d="M28 6 L52 48 L4 48 Z" fill={c} />}
      {forma === 'circulo' && <circle cx="28" cy="28" r="23" fill={c} />}
      {forma === 'quadrado' && <rect x="6" y="6" width="44" height="44" rx="4" fill={c} />}
      {forma === 'estrela' && <path d="M28 4 L34 21 L52 21 L37 32 L43 50 L28 39 L13 50 L19 32 L4 21 L22 21 Z" fill={c} />}
      {forma === 'losango' && <path d="M28 4 L52 28 L28 52 L4 28 Z" fill={c} />}
    </svg>
  )
}

function Relogio({ hora, minuto }: { hora: number; minuto: number }) {
  const angMin = (minuto / 60) * 360
  const angHora = ((hora % 12) / 12) * 360 + (minuto / 60) * 30
  const ponta = (ang: number, r: number) => {
    const rad = ((ang - 90) * Math.PI) / 180
    return { x: 100 + r * Math.cos(rad), y: 100 + r * Math.sin(rad) }
  }
  const m = ponta(angMin, 70)
  const h = ponta(angHora, 45)
  return (
    <svg width="180" height="180" viewBox="0 0 200 200" role="img" aria-label="Relógio de ponteiros">
      <circle cx="100" cy="100" r="92" fill="#FFFFFF" stroke="#1B2340" strokeWidth="6" />
      {Array.from({ length: 12 }, (_, i) => {
        const p = ponta(i * 30, 74)
        return (
          <text key={i} x={p.x} y={p.y + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1B2340" fontFamily="Nunito, sans-serif">
            {i === 0 ? 12 : i}
          </text>
        )
      })}
      <line x1="100" y1="100" x2={h.x} y2={h.y} stroke="#1B2340" strokeWidth="9" strokeLinecap="round" />
      <line x1="100" y1="100" x2={m.x} y2={m.y} stroke="#2F6FED" strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="7" fill="#1B2340" />
    </svg>
  )
}

/** Desenha a figura da questão a partir dos parâmetros (nunca imagem pronta). */
export function Figura({ figura, tamanho }: { figura: FiguraTipo; tamanho?: number }) {
  const p = figura.parametros
  if (figura.tipo === 'forma') return <Forma forma={p.forma as FormaNome} tamanho={tamanho} />
  if (figura.tipo === 'relogio') return <Relogio hora={Number(p.hora)} minuto={Number(p.minuto)} />
  if (figura.tipo === 'sequencia_formas') {
    const itens = p.itens as FormaNome[]
    return (
      <div className="sequencia" role="img" aria-label={`Sequência: ${itens.join(', ')} e um espaço vazio`}>
        {itens.map((f, i) => (
          <Forma key={i} forma={f} />
        ))}
        <span className="lacuna">?</span>
      </div>
    )
  }
  return <div className="figura-desconhecida">Figura "{figura.tipo}" ainda não implementada</div>
}
