/** `claro`: versão branca para usar sobre fundo azul. */
export function Mascote({ tamanho = 64, feliz = false, claro = false }: { tamanho?: number; feliz?: boolean; claro?: boolean }) {
  const corpo = claro ? '#FFFFFF' : '#2F6FED'
  const olho = claro ? '#2F6FED' : '#FFFFFF'
  const pupila = claro ? '#FFFFFF' : '#1B2340'
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="34" r="26" fill={corpo} />
      <circle cx="23" cy="30" r="9" fill={olho} />
      <circle cx="41" cy="30" r="9" fill={olho} />
      <circle cx="24" cy="31" r="4" fill={pupila} />
      <circle cx="40" cy="31" r="4" fill={pupila} />
      {feliz ? (
        <path d="M26 42 Q32 48 38 42" fill="none" stroke="#F28C28" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M28 40 L32 45 L36 40 Z" fill="#F28C28" />
      )}
      <path d="M12 14 L20 22 M52 14 L44 22" stroke={corpo} strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
