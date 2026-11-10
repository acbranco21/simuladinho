import { useEffect, useState } from 'react'
import type { Configuracao } from '../config'
import { PILULAS } from '../conteudo/pilulas'
import { db, pilulasAprendidas, type Perfil } from '../dados/db'
import { calcularMedalhas, mapaDeConquistas, type ItemMapa, type Medalha } from '../motor/conquistas'
import { notasPorTrilhaPorSessao } from '../motor/painel'
import { NOMES_TRILHA, type Trilha } from '../tipos'

const CORES: Record<Trilha, string> = { portugues: '#2F6FED', matematica: '#F28C28', logica: '#1B2340', conhecimentos: '#1F9D55' }
const NIVEL_CURTO = { base: 'Base', avanco: 'Avanço', desafio: 'Desafio' }

interface Ponto {
  x: number
  nota: number
}

interface Dados {
  series: { trilha: Trilha; pontos: Ponto[] }[]
  total: number
  marcas: { x: number; texto: string }[]
  mapa: { trilha: Trilha; itens: (ItemMapa & { titulo: string })[] }[]
  medalhas: Medalha[]
}

const MAX_SESSOES = 12

export function Evolucao({ config, perfil, onVoltar }: { config: Configuracao; perfil: Perfil; onVoltar: () => void }) {
  const [dados, setDados] = useState<Dados | null>(null)
  const [trilhaMapa, setTrilhaMapa] = useState<Trilha>(config.trilhasAtivas[0])

  useEffect(() => {
    void (async () => {
      const [sessoes, respostas, aprendidas] = await Promise.all([db.sessoes.orderBy('inicio').toArray(), db.respostas.toArray(), pilulasAprendidas()])
      const validas = sessoes.filter((s) => s.concluida && (s.modo === 'treino' || s.modo === 'simulado')).slice(-MAX_SESSOES)
      const notas = notasPorTrilhaPorSessao(
        validas.map((s) => ({ ...s, id: s.id! })),
        respostas,
      )
      const indice = new Map(validas.map((s, i) => [s.id!, i]))
      const series = config.trilhasAtivas.map((t) => ({ trilha: t, pontos: (notas.get(t) ?? []).map((n) => ({ x: indice.get(n.sessaoId)!, nota: n.nota })) }))
      const marcas = config.historicoNiveis
        .map((h) => {
          const i = validas.findIndex((s) => s.inicio >= h.em)
          return i < 0 ? null : { x: i - 0.5, texto: `${NOMES_TRILHA[h.trilha]} → ${NIVEL_CURTO[h.para]}` }
        })
        .filter((m): m is { x: number; texto: string } => !!m && m.x >= 0)
      const mapa = config.trilhasAtivas.map((t) => {
        const ps = PILULAS.filter((p) => p.trilha === t)
        const itens = mapaDeConquistas(
          ps.map((p) => p.habilidade),
          respostas,
          aprendidas,
        ).map((it) => ({ ...it, titulo: ps.find((p) => p.habilidade === it.habilidade)!.titulo }))
        return { trilha: t, itens }
      })
      setDados({ series, total: validas.length, marcas, mapa, medalhas: calcularMedalhas(sessoes, respostas, perfil.sequencia, aprendidas.size) })
    })()
  }, [config, perfil])

  if (!dados) return <div className="carregando">Carregando…</div>

  // Gráfico desenhado à mão (SVG), notas 0–10.
  const W = 760
  const H = 340
  const esq = 44
  const dir = 20
  const topo = 24
  const base = 290
  const n = Math.max(dados.total, 2)
  const xPx = (x: number) => esq + (x * (W - esq - dir)) / (n - 1)
  const yPx = (nota: number) => base - (nota / 10) * (base - topo)
  const mapaAtual = dados.mapa.find((m) => m.trilha === trilhaMapa) ?? dados.mapa[0]
  const dominadas = mapaAtual?.itens.filter((i) => i.dominada).length ?? 0

  return (
    <div className="tela evolucao">
      <header className="topo-sessao">
        <button type="button" className="icone branco" aria-label="Voltar ao início" onClick={onVoltar}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="titulo-grande">Minha evolução</h1>
      </header>

      <div className="corpo-evolucao">
        <section className="cartao grafico">
          <div className="secao-topo">
            <h2>Notas nos últimos treinos e simulados</h2>
            <div className="legenda">
              {dados.series.map((s) => (
                <span key={s.trilha}>
                  <i style={{ background: CORES[s.trilha] }} />
                  {NOMES_TRILHA[s.trilha]}
                </span>
              ))}
            </div>
          </div>
          {dados.total === 0 ? (
            <p className="secundario vazio">Termine um treino para ver seu gráfico aparecer aqui.</p>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Gráfico de linhas com as notas de ${dados.series.map((s) => NOMES_TRILHA[s.trilha]).join(', ')} nos últimos ${dados.total} treinos e simulados`}>
              {[0, 5, 10].map((v) => (
                <g key={v}>
                  <line x1={esq} x2={W - dir} y1={yPx(v)} y2={yPx(v)} stroke="#E6EAF3" strokeWidth="1.5" />
                  <text x={esq - 10} y={yPx(v) + 5} textAnchor="end" fontSize="14" fontWeight="700" fill="#4D5675">
                    {v}
                  </text>
                </g>
              ))}
              {dados.marcas.map((m, i) => (
                <g key={i}>
                  <line x1={xPx(m.x)} x2={xPx(m.x)} y1={topo} y2={base} stroke="#F28C28" strokeWidth="2" strokeDasharray="6 6" />
                  <text x={xPx(m.x) + 6} y={topo + 14 + i * 18} fontSize="13" fontWeight="800" fill="#8A4300">
                    {m.texto}
                  </text>
                </g>
              ))}
              {dados.series.map((s) => (
                <g key={s.trilha}>
                  {s.pontos.length > 1 && (
                    <polyline points={s.pontos.map((p) => `${xPx(p.x)},${yPx(p.nota)}`).join(' ')} fill="none" stroke={CORES[s.trilha]} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                  )}
                  {s.pontos.map((p) => (
                    <circle key={p.x} cx={xPx(p.x)} cy={yPx(p.nota)} r="5" fill={CORES[s.trilha]} />
                  ))}
                </g>
              ))}
              <text x={(W + esq) / 2} y={H - 10} textAnchor="middle" fontSize="14" fontWeight="700" fill="#4D5675">
                do mais antigo para o mais recente
              </text>
            </svg>
          )}
          <p className="secundario pequeno-texto">Quando o nível sobe, as questões ficam mais difíceis e a nota pode cair um pouco. Isso é normal: é sinal de que você avançou.</p>
        </section>

        <aside className="lateral-evolucao">
          <section className="cartao">
            <h2>Mapa de conquistas</h2>
            <div className="abas" role="tablist">
              {dados.mapa.map((m) => (
                <button key={m.trilha} type="button" role="tab" aria-selected={m.trilha === trilhaMapa} className={m.trilha === trilhaMapa ? 'ativa' : ''} onClick={() => setTrilhaMapa(m.trilha)}>
                  {NOMES_TRILHA[m.trilha]}
                </button>
              ))}
            </div>
            <div className="mapa">
              {mapaAtual?.itens.map((i) => (
                <div key={i.habilidade} className={`casa-mapa ${i.dominada ? 'acesa' : ''}`} title={i.motivo === 'pilula' ? 'Aprendido em Estudar' : i.motivo === 'acerto' ? '80% de acerto ou mais' : 'Ainda não dominado'}>
                  {i.titulo}
                </div>
              ))}
            </div>
            <p className="secundario pequeno-texto">
              {dominadas} de {mapaAtual?.itens.length ?? 0} assuntos dominados
            </p>
          </section>
          <section className="cartao">
            <h2>Medalhas</h2>
            <div className="medalhas">
              {dados.medalhas.map((m) => (
                <div key={m.id} className={`medalha ${m.conquistada ? 'ganha' : ''}`}>
                  <strong>{m.nome}</strong>
                  <small>{m.descricao}</small>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
