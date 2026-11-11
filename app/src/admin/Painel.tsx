import { useCallback, useEffect, useMemo, useState } from 'react'
import { TRILHAS_DISPONIVEIS, type Configuracao } from '../config'
import { LICOES_POR_MODULO, MODULOS_PV, type ModuloPV } from '../conteudo/projeto-vida'
import { db, decidirQuestao, exportarDados, importarDados, lerConfig, licoesConcluidas, salvarConfig, type StatusQuestao } from '../dados/db'
import { liberadoPeloAvanco, type EstadoModulo, type ProgressoAluna } from '../motor/projetoVida'
import { desempenhoPorTrilha, indicadores, minutosNoDia, questoesAtipicas, type LinhaTrilha, type Tendencia } from '../motor/painel'
import { formatarNota } from '../motor/pontuacao'
import { criarSorteio } from '../motor/sessao'
import { NOMES_TRILHA, type Nivel, type Questao, type Trilha } from '../tipos'

const NOMES_NIVEL: Record<Nivel, string> = { base: 'Base · 3º ano', avanco: 'Avanço · 4º ano', desafio: 'Desafio · 5º ano' }
const NOMES_ESTADO: Record<EstadoModulo, string> = { auto: 'Automático (pelo avanço)', liberado: 'Liberado agora', bloqueado: 'Bloqueado' }
const NOMES_TENDENCIA: Record<Tendencia, string> = { subindo: 'Subindo', estavel: 'Estável', caindo: 'Caindo', poucos_dados: 'Poucos dados' }

interface ItemFila {
  questao: Questao
  motivo: 'contestada' | 'atipica' | 'amostra'
  detalhe: string
}

interface Props {
  banco: Questao[]
  onSair: () => void
  onConfigSalva: (c: Configuracao) => void
}

function semanaDoAno(d: Date): number {
  const inicio = new Date(d.getFullYear(), 0, 1)
  return Math.floor((d.getTime() - inicio.getTime()) / (7 * 86400000))
}

export function Painel({ banco, onSair, onConfigSalva }: Props) {
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [rascunho, setRascunho] = useState<Configuracao | null>(null)
  const [dados, setDados] = useState<{ ind: ReturnType<typeof indicadores>; linhas: LinhaTrilha[]; fila: ItemFila[]; desativadas: Questao[]; pv: ProgressoAluna } | null>(null)
  const [aviso, setAviso] = useState('')
  const porId = useMemo(() => new Map(banco.map((q) => [q.id, q])), [banco])

  const carregar = useCallback(async () => {
    const [c, sessoes, respostas, contest, status, licoes, concluidas] = await Promise.all([lerConfig(), db.sessoes.toArray(), db.respostas.toArray(), db.contestacoes.toArray(), db.statusQuestoes.toArray(), db.licoesPV.toArray(), licoesConcluidas()])
    const sess = sessoes.map((s) => ({ ...s, id: s.id! }))
    const decisao = new Map<string, StatusQuestao>(status.map((s) => [s.questaoId, s]))
    const fila: ItemFila[] = []
    const naFila = new Set<string>()
    for (const ct of contest) {
      const d = decisao.get(ct.questaoId)
      const q = porId.get(ct.questaoId)
      if (!q || naFila.has(q.id) || (d && d.em > ct.em)) continue
      fila.push({ questao: q, motivo: 'contestada', detalhe: `Ela tocou em "Achei um erro" em ${new Date(ct.em).toLocaleDateString('pt-BR')}` })
      naFila.add(q.id)
    }
    for (const a of questoesAtipicas(respostas)) {
      const q = porId.get(a.questaoId)
      if (!q || naFila.has(q.id) || decisao.has(q.id)) continue
      fila.push({ questao: q, motivo: 'atipica', detalhe: `Acerto de ${Math.round(a.acerto * 100)}% em ${a.total} respostas` })
      naFila.add(q.id)
    }
    const sorteio = criarSorteio(semanaDoAno(new Date()) + new Date().getFullYear() * 100)
    const candidatas = banco.filter((q) => !decisao.has(q.id) && !naFila.has(q.id))
    for (let i = 0; i < 5 && candidatas.length; i++) {
      const q = candidatas.splice(Math.floor(sorteio() * candidatas.length), 1)[0]
      fila.push({ questao: q, motivo: 'amostra', detalhe: 'Amostra da semana (opcional)' })
    }
    const desativadas = status.filter((s) => s.status === 'desativada').map((s) => porId.get(s.questaoId)).filter((q): q is Questao => !!q)
    setConfig(c)
    setRascunho(c)
    const mat = respostas.filter((r) => r.trilha === 'matematica')
    const ind = indicadores(sess, respostas.length, new Date())
    ind.minutosHoje = minutosNoDia([...sess, ...licoes], new Date())
    setDados({
      pv: {
        sessoesConcluidas: sess.filter((x) => x.concluida).length,
        matematica: mat.length ? { total: mat.length, acerto: mat.filter((r) => r.correta).length / mat.length } : undefined,
        concluidas,
      },
      ind,
      linhas: desempenhoPorTrilha(c.trilhasAtivas, c.nivelPorTrilha, c.progressao, sess, respostas),
      fila,
      desativadas,
    })
  }, [banco, porId])

  useEffect(() => {
    void carregar()
  }, [carregar])

  if (!config || !rascunho || !dados) return <div className="carregando">Carregando…</div>

  const alterar = (parcial: Partial<Configuracao>) => setRascunho({ ...rascunho, ...parcial })
  const somaMistura = rascunho.mistura.facil + rascunho.mistura.media + rascunho.mistura.dificil
  const mudou = JSON.stringify(config) !== JSON.stringify(rascunho)

  const salvar = async () => {
    if (somaMistura !== 100) {
      setAviso('A mistura de dificuldade precisa somar 100%.')
      return
    }
    if (!rascunho.trilhasAtivas.length) {
      setAviso('Deixe pelo menos uma trilha ativa.')
      return
    }
    const historicoNiveis = [...rascunho.historicoNiveis]
    for (const t of TRILHAS_DISPONIVEIS) {
      const de = config.nivelPorTrilha[t] ?? 'base'
      const para = rascunho.nivelPorTrilha[t] ?? 'base'
      if (de !== para) historicoNiveis.push({ trilha: t, de, para, em: Date.now(), motivo: 'manual' })
    }
    const nova = { ...rascunho, nomeAluna: rascunho.nomeAluna.trim(), historicoNiveis }
    await salvarConfig(nova)
    onConfigSalva(nova)
    setAviso('Alterações salvas.')
    await carregar()
  }

  const decidir = async (id: string, s: StatusQuestao['status']) => {
    await decidirQuestao(id, s)
    setAviso(s === 'desativada' ? 'Questão desativada.' : 'Questão aprovada.')
    await carregar()
  }

  const baixar = async () => {
    const json = await exportarDados()
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `simuladinho-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setAviso('Cópia de segurança baixada.')
  }

  const restaurar = async (arquivo: File | undefined) => {
    if (!arquivo) return
    if (!window.confirm('Restaurar esta cópia vai substituir todo o histórico atual neste tablet. Continuar?')) return
    try {
      await importarDados(await arquivo.text())
      const c = await lerConfig()
      onConfigSalva(c)
      setAviso('Cópia restaurada.')
      await carregar()
    } catch (e) {
      setAviso(`Não foi possível restaurar: ${(e as Error).message}`)
    }
  }

  const { ind } = dados
  const minutosRestantes = rascunho.limiteDiarioMin ? Math.max(0, config.limiteDiarioMin - ind.minutosHoje) : null

  return (
    <div className="painel">
      <div className="painel-conteudo">
        <header className="painel-topo">
          <div>
            <h1>Painel do administrador</h1>
            <p>Dados deste tablet · atualizados ao fim de cada sessão</p>
          </div>
          <button type="button" className="botao-contorno pequeno" onClick={onSair}>
            Sair do painel
          </button>
        </header>

        {aviso && (
          <div className="painel-aviso" role="status">
            {aviso}
          </div>
        )}

        <section className="painel-kpis">
          <div className="cartao kpi">
            <small>Sessões nos últimos 7 dias</small>
            <strong>{ind.sessoes7d}</strong>
          </div>
          <div className="cartao kpi">
            <small>Nota média (últimos 5 treinos)</small>
            <strong>{ind.notaMedia5 === null ? '—' : formatarNota(ind.notaMedia5)}</strong>
          </div>
          <div className="cartao kpi">
            <small>Tempo de tela hoje</small>
            <strong>
              {ind.minutosHoje} <span>{config.limiteDiarioMin ? `de ${config.limiteDiarioMin} min` : 'min'}</span>
            </strong>
          </div>
          <div className="cartao kpi">
            <small>Sessões com cansaço ou abandono (7 dias)</small>
            <strong>{ind.sessoesComCansaco7d}</strong>
          </div>
          <div className="cartao kpi">
            <small>Questões respondidas</small>
            <strong>{ind.questoesRespondidas}</strong>
          </div>
        </section>

        <section className="cartao">
          <h2>Desempenho por trilha</h2>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Trilha</th>
                  <th>Nível</th>
                  <th>Média (5 últimas)</th>
                  <th>Tendência</th>
                  <th>Habilidade mais fraca</th>
                  <th>Sugestão</th>
                </tr>
              </thead>
              <tbody>
                {dados.linhas.map((l) => (
                  <tr key={l.trilha}>
                    <td className="forte">{NOMES_TRILHA[l.trilha]}</td>
                    <td>
                      <span className="etiqueta azul">{NOMES_NIVEL[l.nivel]}</span>
                    </td>
                    <td className="forte">{l.media5 === null ? '—' : formatarNota(l.media5)}</td>
                    <td>{NOMES_TENDENCIA[l.tendencia]}</td>
                    <td>{l.fraca ? `${l.fraca.habilidade} (${Math.round(l.fraca.acerto * 100)}% em ${l.fraca.total})` : '—'}</td>
                    <td className="secundario">{l.sugestao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {config.historicoNiveis.length > 0 && (
            <p className="secundario pequeno-texto">
              Últimas mudanças de nível:{' '}
              {config.historicoNiveis
                .slice(-3)
                .map((h) => `${NOMES_TRILHA[h.trilha]} ${NOMES_NIVEL[h.de].split(' ·')[0]} → ${NOMES_NIVEL[h.para].split(' ·')[0]} (${h.motivo === 'automatica' ? 'automática' : 'manual'}, ${new Date(h.em).toLocaleDateString('pt-BR')})`)
                .join(' · ')}
            </p>
          )}
        </section>

        <section>
          <div className="secao-topo">
            <h2>Controles</h2>
            <button type="button" className="botao-azul pequeno" disabled={!mudou} onClick={() => void salvar()}>
              {mudou ? 'Salvar alterações' : 'Tudo salvo'}
            </button>
          </div>
          <div className="painel-controles">
            <div className="cartao controle">
              <h3>Aluna</h3>
              <label className="campo">
                Nome que aparece no app
                <input type="text" value={rascunho.nomeAluna} maxLength={30} placeholder="Ex.: Ana" onChange={(e) => alterar({ nomeAluna: e.target.value })} />
              </label>
            </div>

            <div className="cartao controle">
              <h3>Trilhas e nível</h3>
              {TRILHAS_DISPONIVEIS.map((t) => (
                <div key={t} className="linha-controle">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={rascunho.trilhasAtivas.includes(t)}
                      onChange={(e) => alterar({ trilhasAtivas: e.target.checked ? [...rascunho.trilhasAtivas, t] : rascunho.trilhasAtivas.filter((x) => x !== t) })}
                    />
                    {NOMES_TRILHA[t]}
                  </label>
                  <select
                    aria-label={`Nível de ${NOMES_TRILHA[t]}`}
                    value={rascunho.nivelPorTrilha[t] ?? 'base'}
                    onChange={(e) => alterar({ nivelPorTrilha: { ...rascunho.nivelPorTrilha, [t]: e.target.value as Nivel } })}
                  >
                    {(Object.keys(NOMES_NIVEL) as Nivel[]).map((n) => (
                      <option key={n} value={n}>
                        {NOMES_NIVEL[n]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <p className="secundario pequeno-texto">O banco atual tem questões de Base e algumas de Avanço; Desafio ainda não tem questões próprias.</p>
            </div>

            <div className="cartao controle">
              <h3>Mistura de dificuldade (%)</h3>
              <div className="grade-3">
                {(['facil', 'media', 'dificil'] as const).map((k) => (
                  <label key={k} className="campo">
                    {k === 'facil' ? 'Fácil' : k === 'media' ? 'Média' : 'Difícil'}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      value={rascunho.mistura[k]}
                      onChange={(e) => alterar({ mistura: { ...rascunho.mistura, [k]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) } })}
                    />
                  </label>
                ))}
              </div>
              <p className={somaMistura === 100 ? 'secundario pequeno-texto' : 'alerta pequeno-texto'}>Soma: {somaMistura}% (precisa ser 100%)</p>
            </div>

            <div className="cartao controle">
              <h3>Progressão de nível</h3>
              {(
                [
                  ['automatica', 'Automática', 'Sobe após 3 notas seguidas ≥ 8,0 na trilha'],
                  ['manual', 'Manual', 'Só eu mudo o nível; o painel avisa quando ela estiver pronta'],
                  ['travada', 'Travada', 'O nível não muda'],
                ] as const
              ).map(([v, nome, desc]) => (
                <label key={v} className="radio">
                  <input type="radio" name="progressao" checked={rascunho.progressao === v} onChange={() => alterar({ progressao: v })} />
                  <span>
                    <strong>{nome}</strong>
                    <small>{desc}</small>
                  </span>
                </label>
              ))}
            </div>

            <div className="cartao controle">
              <h3>Simulado de prova</h3>
              {(
                [
                  [10, 'Treino de resistência', '10 questões (5 Português + 5 Matemática), 45 minutos'],
                  [20, 'Prova completa', '20 questões (10 + 10), 90 minutos, como no bolsão'],
                ] as const
              ).map(([v, nome, desc]) => (
                <label key={v} className="radio">
                  <input type="radio" name="simulado" checked={rascunho.simulado.questoes === v} onChange={() => alterar({ simulado: { questoes: v } })} />
                  <span>
                    <strong>{nome}</strong>
                    <small>{desc}</small>
                  </span>
                </label>
              ))}
              <p className="secundario pequeno-texto">Sugestão: comece pela resistência e passe para a prova completa quando ela terminar o de 10 com tranquilidade.</p>
            </div>

            <div className="cartao controle">
              <h3>Sessão e tempo de tela</h3>
              <label className="campo">
                Limite diário (minutos, 0 = sem limite)
                <input type="number" min={0} max={240} step={5} value={rascunho.limiteDiarioMin} onChange={(e) => alterar({ limiteDiarioMin: Math.max(0, Number(e.target.value) || 0) })} />
              </label>
              <label className="check">
                <input type="checkbox" checked={rascunho.iaAjustaTamanho} onChange={(e) => alterar({ iaAjustaTamanho: e.target.checked })} />
                O app ajusta o tamanho do treino pelos sinais de cansaço
              </label>
              {!rascunho.iaAjustaTamanho && (
                <label className="campo">
                  Tamanho fixo do treino (questões)
                  <input type="number" min={4} max={20} value={rascunho.tamanhoTreinoFixo} onChange={(e) => alterar({ tamanhoTreinoFixo: Math.max(4, Math.min(20, Number(e.target.value) || 10)) })} />
                </label>
              )}
              {minutosRestantes !== null && <p className="secundario pequeno-texto">Restam {minutosRestantes} min hoje.</p>}
            </div>

            <div className="cartao controle controle-largo">
              <h3>Projeto de Vida</h3>
              <label className="check">
                <input type="checkbox" checked={rascunho.projetoVida.ativo} onChange={(e) => alterar({ projetoVida: { ...rascunho.projetoVida, ativo: e.target.checked } })} />
                Mostrar a trilha Projeto de Vida para ela (fora da nota e do simulado)
              </label>
              {rascunho.projetoVida.ativo && (
                <div className="tabela-pv">
                  {MODULOS_PV.map((m) => {
                    const estado = rascunho.projetoVida.modulos[m.id] ?? 'auto'
                    const licoesModulo = LICOES_POR_MODULO.get(m.id) ?? []
                    const feitas = licoesModulo.filter((l) => dados.pv.concluidas.has(l.id)).length
                    const peloAvanco = liberadoPeloAvanco(m.id, dados.pv)
                    return (
                      <div key={m.id} className="linha-pv">
                        <div>
                          <strong>{m.nome}</strong>
                          <small>
                            {m.tema} · {m.bncc}
                          </small>
                          <small>
                            {feitas} de {licoesModulo.length} lições feitas · {peloAvanco ? 'já liberado pelo avanço' : `regra: ${m.comoLiberar.charAt(0).toLowerCase()}${m.comoLiberar.slice(1).replace(/você/g, 'ela')}`}
                          </small>
                        </div>
                        <select
                          aria-label={`Controle de ${m.nome}`}
                          value={estado}
                          onChange={(e) => alterar({ projetoVida: { ...rascunho.projetoVida, modulos: { ...rascunho.projetoVida.modulos, [m.id as ModuloPV]: e.target.value as EstadoModulo } } })}
                        >
                          {(Object.keys(NOMES_ESTADO) as EstadoModulo[]).map((k) => (
                            <option key={k} value={k}>
                              {NOMES_ESTADO[k]}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>
              )}
              <p className="secundario pequeno-texto">
                Automático: o módulo abre pelo avanço dela e libera uma lição nova por dia. Liberado: abre todas as lições agora. As respostas dela nessas lições não são guardadas, só que a lição foi feita. Na versão para escolas, o professor terá o mesmo controle.
              </p>
            </div>

            <div className="cartao controle">
              <h3>Material Positivo · até onde a turma chegou</h3>
              {TRILHAS_DISPONIVEIS.map((t: Trilha) => (
                <label key={t} className="campo">
                  {NOMES_TRILHA[t]}
                  <input
                    type="text"
                    placeholder="Volume / unidade"
                    value={rascunho.positivoUnidade[t] ?? ''}
                    onChange={(e) => alterar({ positivoUnidade: { ...rascunho.positivoUnidade, [t]: e.target.value } })}
                  />
                </label>
              ))}
              <p className="secundario pequeno-texto">Fica registrado para orientar os próximos lotes de questões. As questões atuais ainda não têm unidade do Positivo, então isso não filtra os treinos.</p>
            </div>
          </div>
        </section>

        <section className="cartao">
          <div className="secao-topo">
            <h2>Fila de revisão de questões</h2>
            <span className="secundario">Contestadas e atípicas primeiro; a amostra semanal é opcional</span>
          </div>
          {dados.fila.length === 0 && <p className="secundario">Nada para revisar.</p>}
          <div className="fila">
            {dados.fila.map(({ questao: q, motivo, detalhe }) => {
              const certa = q.alternativas.find((a) => a.letra === q.gabarito)!
              return (
                <details key={q.id} className="item-fila">
                  <summary>
                    <span className="fila-texto">
                      <strong>{q.enunciado}</strong>
                      <small>
                        {NOMES_TRILHA[q.trilha]} · {q.habilidade} · nível {q.dificuldade} · {q.id}
                      </small>
                    </span>
                    <span className={`etiqueta ${motivo === 'contestada' ? 'laranja' : motivo === 'atipica' ? 'azul' : 'cinza'}`}>{motivo === 'contestada' ? 'Contestada' : motivo === 'atipica' ? 'Acerto atípico' : 'Amostra'}</span>
                  </summary>
                  <div className="fila-detalhe">
                    <p className="secundario">{detalhe}</p>
                    {q.texto_apoio && <p className="fila-apoio">{q.texto_apoio}</p>}
                    <ul>
                      {q.alternativas.map((a) => (
                        <li key={a.letra} className={a.letra === q.gabarito ? 'certa' : ''}>
                          {a.letra}) {a.texto}
                          {a.erro_tipico ? <small> — {a.erro_tipico}</small> : <small> — resposta certa</small>}
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>Explicação:</strong> {q.explicacao}
                    </p>
                    <div className="botoes-linha">
                      <button type="button" className="botao-verde pequeno" onClick={() => void decidir(q.id, 'aprovada_admin')}>
                        Aprovar ({certa.letra} está certa)
                      </button>
                      <button type="button" className="botao-perigo pequeno" onClick={() => void decidir(q.id, 'desativada')}>
                        Desativar
                      </button>
                    </div>
                  </div>
                </details>
              )
            })}
          </div>
          {dados.desativadas.length > 0 && (
            <details className="desativadas">
              <summary>{dados.desativadas.length} questão(ões) desativada(s)</summary>
              {dados.desativadas.map((q) => (
                <div key={q.id} className="linha-controle">
                  <span>{q.enunciado}</span>
                  <button type="button" className="botao-contorno pequeno" onClick={() => void decidir(q.id, 'aprovada_admin')}>
                    Reativar
                  </button>
                </div>
              ))}
            </details>
          )}
        </section>

        <section className="cartao">
          <h2>Dados e cópia de segurança</h2>
          <p className="secundario">O histórico fica só neste tablet. Baixe uma cópia de vez em quando para não perder nada se o tablet for trocado ou o navegador for limpo.</p>
          <div className="botoes-linha">
            <button type="button" className="botao-azul pequeno" onClick={() => void baixar()}>
              Baixar cópia de segurança
            </button>
            <label className="botao-contorno pequeno arquivo">
              Restaurar cópia…
              <input type="file" accept="application/json,.json" onChange={(e) => void restaurar(e.target.files?.[0])} />
            </label>
          </div>
        </section>

        <p className="secundario pequeno-texto rodape-painel">Ainda não disponível: correção de redação, edição de questões e geração automática de novos lotes pelo painel.</p>
      </div>
    </div>
  )
}
