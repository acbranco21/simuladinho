import { useSyncExternalStore } from 'react'

/** Visual do app: 'caderno' (folha quadriculada, desenhos a lápis de cor) ou 'classico' (o visual original). */
export type Tema = 'caderno' | 'classico'

let atual: Tema = 'caderno'
const ouvintes = new Set<() => void>()

/** Troca o visual: liga/desliga a camada de CSS (caderno.css só vale sob html.tema-caderno) e avisa os componentes. */
export function definirTema(t: Tema) {
  document.documentElement.classList.toggle('tema-caderno', t === 'caderno')
  if (t === atual) return
  atual = t
  ouvintes.forEach((f) => f())
}

export function useTema(): Tema {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f)
      return () => ouvintes.delete(f)
    },
    () => atual,
  )
}
