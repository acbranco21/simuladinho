import { Figura } from '../figuras/Figura'
import { formatarNota, type ResumoTrilha } from '../motor/pontuacao'
import { NOMES_TRILHA, type Letra, type Questao, type Trilha } from '../tipos'
import { Mascote } from './Mascote'

interface Props {
  questoes: Questao[]
  escolhas: (Letra | null)[]
  nota: number
  resumo: ResumoTrilha[]
  minutosUsados: number
  minutosTotal: number
  porTempo: boolean
  xpGanho: number
  novosRecordes: Trilha[]
  sugeridas: { habilidade: string; titulo: string }[]
  onEstudar: (habilidade: string) => void
  onInicio: () => void
}

export function SimuladoResultado({ questoes, escolhas, nota, resumo, minutosUsados, minutosTotal, porTempo, xpGanho, novosRecordes, sugeridas, onEstudar, onInicio }: Props) {
  const acertos = questoes.filter((q, i) => escolhas[i] === q.gabarito).length
  const brancos = escolhas.filter((e) => e === null).length
  return (
    <div className="tela resultado-simulado">
      <section className="celebracao compacta">
        <Mascote tamanho={88} feliz claro desenhar />
        <h1>Prova entregue!</h1>
        <div className="nota">
          <span className="nota-valor">{formatarNota(nota)}</span>
          <span className="nota-legenda">
            {acertos} de {questoes.length} acertos
          </span>
        </div>
        <p>
          {porTempo ? 'O tempo acabou e a prova foi entregue.' : `Você usou ${minutosUsados} de ${minutosTotal} minutos.`}
          {brancos > 0 && ` ${brancos} em branco.`}
        </p>
        {novosRecordes.map((t) => (
          <span key={t} className="selo-recorde">
            Novo recorde em {NOMES_TRILHA[t]}!
          </span>
        ))}
        <div className="linha-resumo">
          {resumo.map((r) => (
            <span key={r.trilha}>
              {NOMES_TRILHA[r.trilha]}: {r.acertos}/{r.total}
            </span>
          ))}
          <span>+{xpGanho} XP</span>
        </div>
      </section>

      <section className="cartao">
        <h2>Correção</h2>
        <p className="secundario">Toque numa questão para ver a explicação.</p>
        <div className="lista-correcao">
          {questoes.map((q, i) => {
            const e = escolhas[i]
            const ok = e === q.gabarito
            const certa = q.alternativas.find((a) => a.letra === q.gabarito)!
            const dela = q.alternativas.find((a) => a.letra === e)
            return (
              <details key={q.id} className={`item-correcao ${ok ? 'ok' : e ? 'erro' : 'branco'}`}>
                <summary>
                  <span className="num">{i + 1}</span>
                  <span className="enun">{q.enunciado}</span>
                  <span className="estado">{ok ? 'Certa' : e ? `Marcou ${e}` : 'Em branco'}</span>
                </summary>
                <div className="detalhe-correcao">
                  {q.texto_apoio && <p className="texto-apoio">{q.texto_apoio}</p>}
                  {q.figura && (
                    <div className="area-figura">
                      <Figura figura={q.figura} />
                    </div>
                  )}
                  {dela && !ok && (
                    <p>
                      <strong>Sua resposta:</strong> {dela.letra} · {dela.texto}
                      {dela.erro_tipico && <span className="secundario"> — {dela.erro_tipico}</span>}
                    </p>
                  )}
                  <p>
                    <strong>Resposta certa:</strong> {certa.letra} · {certa.texto}
                  </p>
                  <p>{q.explicacao}</p>
                </div>
              </details>
            )
          })}
        </div>
      </section>

      <section className="botoes-fim-simulado">
        {sugeridas.map((s) => (
          <button key={s.habilidade} type="button" className="botao-contorno pequeno" onClick={() => onEstudar(s.habilidade)}>
            Estudar: {s.titulo}
          </button>
        ))}
        <button type="button" className="botao-azul" onClick={onInicio}>
          Voltar ao início
        </button>
      </section>
    </div>
  )
}
