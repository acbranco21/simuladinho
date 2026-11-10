import { useState } from 'react'

interface Props {
  /** true = criar PIN novo (pede duas vezes). */
  criar: boolean
  onConfirmar: (pin: string) => Promise<boolean>
  onVoltar: () => void
}

/** Teclado numérico de 4 dígitos para entrar na área dos pais. */
export function Pin({ criar, onConfirmar, onVoltar }: Props) {
  const [pin, setPin] = useState('')
  const [primeiro, setPrimeiro] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  const titulo = criar ? (primeiro ? 'Confirme o PIN' : 'Crie um PIN de 4 números') : 'Digite o PIN'

  const digitar = async (d: string) => {
    setErro('')
    const novo = (pin + d).slice(0, 4)
    setPin(novo)
    if (novo.length < 4) return
    if (criar && !primeiro) {
      setPrimeiro(novo)
      setPin('')
      return
    }
    if (criar && primeiro !== novo) {
      setErro('Os PINs não são iguais. Comece de novo.')
      setPrimeiro(null)
      setPin('')
      return
    }
    const ok = await onConfirmar(novo)
    if (!ok) {
      setErro('PIN incorreto.')
      setPin('')
    }
  }

  return (
    <div className="tela pin">
      <div className="cartao pin-caixa">
        <h1>Área dos pais</h1>
        <p className="subtitulo">{titulo}</p>
        {criar && !primeiro && <p className="pin-nota">O PIN fica guardado só neste tablet. Se esquecer, será preciso apagar os dados do app no navegador.</p>}
        <div className="pin-pontos" aria-label={`${pin.length} de 4 números digitados`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={i < pin.length ? 'cheio' : ''} />
          ))}
        </div>
        {erro && (
          <p className="pin-erro" role="alert">
            {erro}
          </p>
        )}
        <div className="pin-teclado">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" onClick={() => void digitar(d)}>
              {d}
            </button>
          ))}
          <button type="button" className="pin-acao" onClick={onVoltar}>
            Voltar
          </button>
          <button type="button" onClick={() => void digitar('0')}>
            0
          </button>
          <button type="button" className="pin-acao" aria-label="Apagar" onClick={() => setPin(pin.slice(0, -1))}>
            ⌫
          </button>
        </div>
      </div>
    </div>
  )
}
