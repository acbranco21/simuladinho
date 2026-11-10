/** Recompensa esforço, evolução e domínio — nunca tira pontos por erro. */
export const XP = {
  acerto: 10,
  tentativa: 5,
  bonusSessao: 20,
  multiplicadorCacaAosErros: 2,
  porNivel: 200,
}

export function xpDaResposta(correta: boolean, cacaAosErros = false): number {
  const base = correta ? XP.acerto : XP.tentativa
  return cacaAosErros ? base * XP.multiplicadorCacaAosErros : base
}

export function nivelDoXp(xp: number): { nivel: number; progresso: number } {
  return { nivel: Math.floor(xp / XP.porNivel) + 1, progresso: (xp % XP.porNivel) / XP.porNivel }
}

/** Dia local no formato AAAA-MM-DD. */
export function diaLocal(data: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`
}

function diasEntre(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number)
  const [yb, mb, db] = b.split('-').map(Number)
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000)
}

/**
 * Atualiza a sequência de dias. Permite 1 "dia de folga" sem zerar (pulo de 1 dia mantém a sequência).
 */
export function atualizarSequencia(sequencia: number, ultimoDia: string | null, hoje: string): number {
  if (!ultimoDia) return 1
  const d = diasEntre(ultimoDia, hoje)
  if (d <= 0) return sequencia
  if (d <= 2) return sequencia + 1
  return 1
}
