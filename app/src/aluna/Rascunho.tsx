import { useEffect, useRef, useState } from 'react'

/** Folha de rascunho para desenhar com o dedo (sem caneta). Limpa a cada questão. */
export function Rascunho({ chave }: { chave: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const desenhando = useRef(false)
  const [ferramenta, setFerramenta] = useState<'lapis' | 'borracha'>('lapis')

  // Ajusta o canvas ao tamanho real (considerando a densidade da tela) e limpa ao trocar de questão.
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ajustar = () => {
      const r = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      c.width = Math.round(r.width * dpr)
      c.height = Math.round(r.height * dpr)
      const ctx = c.getContext('2d')
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    ajustar()
    window.addEventListener('resize', ajustar)
    return () => window.removeEventListener('resize', ajustar)
  }, [chave])

  const ponto = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const iniciar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    desenhando.current = true
    const ctx = e.currentTarget.getContext('2d')!
    const { x, y } = ponto(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!desenhando.current) return
    const ctx = e.currentTarget.getContext('2d')!
    const { x, y } = ponto(e)
    ctx.globalCompositeOperation = ferramenta === 'borracha' ? 'destination-out' : 'source-over'
    ctx.lineWidth = ferramenta === 'borracha' ? 28 : 6
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1B2340'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const parar = () => {
    desenhando.current = false
  }

  const limpar = () => {
    const c = canvasRef.current
    if (!c) return
    c.getContext('2d')?.clearRect(0, 0, c.width, c.height)
  }

  return (
    <aside className="cartao rascunho">
      <div className="rascunho-topo">
        <h2>Rascunho</h2>
        <div className="rascunho-ferramentas">
          <button type="button" aria-label="Lápis" aria-pressed={ferramenta === 'lapis'} className={`icone ${ferramenta === 'lapis' ? 'ativo' : ''}`} onClick={() => setFerramenta('lapis')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 20l4-1L19 8l-3-3L5 16z" />
            </svg>
          </button>
          <button type="button" aria-label="Borracha" aria-pressed={ferramenta === 'borracha'} className={`icone ${ferramenta === 'borracha' ? 'ativo' : ''}`} onClick={() => setFerramenta('borracha')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 21h13M5 14l8-8 6 6-8 8H8z" />
            </svg>
          </button>
          <button type="button" className="botao-pequeno" onClick={limpar}>
            Limpar
          </button>
        </div>
      </div>
      <canvas
        key={chave}
        ref={canvasRef}
        className="rascunho-area"
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={parar}
        onPointerCancel={parar}
        aria-label="Área de rascunho: desenhe com o dedo"
      />
    </aside>
  )
}
