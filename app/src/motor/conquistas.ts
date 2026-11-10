import type { Trilha } from '../tipos'

export interface RespostaConquista {
  trilha: Trilha
  habilidade: string
  correta: boolean
}

export interface SessaoConquista {
  modo: string
  concluida: boolean
  nota: number
  questoes: number
}

export interface Medalha {
  id: string
  nome: string
  descricao: string
  conquistada: boolean
}

const LEITURA = ['Localizar informação explícita', 'Identificar o assunto do texto', 'Reconhecer gêneros: poema, receita, bilhete, notícia, HQ', 'Inferir informação implícita']

/** Medalhas recompensam esforço, hábito e domínio — nunca comparação com outras crianças. */
export function calcularMedalhas(sessoes: SessaoConquista[], respostas: RespostaConquista[], sequencia: number, pilulasAprendidas: number): Medalha[] {
  const concluidas = sessoes.filter((s) => s.concluida)
  const acertos = (f: (r: RespostaConquista) => boolean) => respostas.filter((r) => r.correta && f(r)).length
  const m = (id: string, nome: string, descricao: string, ok: boolean): Medalha => ({ id, nome, descricao, conquistada: ok })
  return [
    m('primeira-missao', 'Primeira missão', 'Terminar o primeiro treino', concluidas.length >= 1),
    m('sequencia-7', 'Sete dias seguidos', 'Treinar 7 dias seguidos', sequencia >= 7),
    m('detetive-padroes', 'Detetive dos Padrões', 'Acertar 10 questões de lógica', acertos((r) => r.trilha === 'logica') >= 10),
    m('mestre-tabuada', 'Mestre da Tabuada', 'Acertar 10 questões de multiplicação e divisão', acertos((r) => r.habilidade === 'Ideias de multiplicação e divisão') >= 10),
    m('leitora-atenta', 'Leitora Atenta', 'Acertar 10 questões de leitura de textos', acertos((r) => LEITURA.includes(r.habilidade)) >= 10),
    m('cacadora-erros', 'Caçadora de Erros', 'Terminar 3 sessões de Caça aos erros', concluidas.filter((s) => s.modo === 'caca_erros').length >= 3),
    m('primeiro-simulado', 'Primeiro Simulado', 'Entregar um simulado de prova', concluidas.some((s) => s.modo === 'simulado')),
    m('nota-10', 'Nota 10', 'Tirar 10 numa sessão com pelo menos 5 questões', concluidas.some((s) => s.nota === 10 && s.questoes >= 5)),
    m('estudiosa', 'Estudiosa', 'Aprender 3 assuntos na área Estudar', pilulasAprendidas >= 3),
  ]
}

export interface ItemMapa {
  habilidade: string
  dominada: boolean
  motivo: 'pilula' | 'acerto' | null
}

/** Uma habilidade acende no mapa quando a pílula foi aprendida ou há 80% de acerto em pelo menos 5 questões. */
export function mapaDeConquistas(habilidades: string[], respostas: Pick<RespostaConquista, 'habilidade' | 'correta'>[], aprendidas: Set<string>): ItemMapa[] {
  return habilidades.map((h) => {
    if (aprendidas.has(h)) return { habilidade: h, dominada: true, motivo: 'pilula' }
    const rs = respostas.filter((r) => r.habilidade === h)
    const ok = rs.length >= 5 && rs.filter((r) => r.correta).length / rs.length >= 0.8
    return { habilidade: h, dominada: ok, motivo: ok ? 'acerto' : null }
  })
}

/** Habilidades a estudar depois de uma sessão: as que tiveram erro, sem repetir, na ordem em que apareceram. */
export function pilulasSugeridas(respostas: Pick<RespostaConquista, 'habilidade' | 'correta'>[], existentes: Set<string>, max = 3): string[] {
  const saida: string[] = []
  for (const r of respostas) if (!r.correta && existentes.has(r.habilidade) && !saida.includes(r.habilidade)) saida.push(r.habilidade)
  return saida.slice(0, max)
}
