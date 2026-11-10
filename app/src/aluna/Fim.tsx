import { formatarNota, type ResumoTrilha } from '../motor/pontuacao'
import { NOMES_TRILHA, type Trilha } from '../tipos'
import { Mascote } from './Mascote'

interface Props {
  nota: number
  resumo: ResumoTrilha[]
  xpGanho: number
  sequencia: number
  novosRecordes: Trilha[]
  subiuDeNivel: Trilha[]
  erros: number
  sugeridas: { habilidade: string; titulo: string }[]
  aprendeu: string | null
  modo: 'treino' | 'caca_erros' | 'pilula'
  onCacaAosErros: () => void
  onEstudar: (habilidade: string) => void
  onInicio: () => void
}

export function Fim({ nota, resumo, xpGanho, sequencia, novosRecordes, subiuDeNivel, erros, sugeridas, aprendeu, modo, onCacaAosErros, onEstudar, onInicio }: Props) {
  return (
    <div className="tela fim">
      <section className="celebracao">
        <Mascote tamanho={120} feliz claro />
        <h1>Missão cumprida!</h1>
        <p>{modo === 'pilula' ? (aprendeu ? `Você aprendeu: ${aprendeu}!` : 'Boa prática! Leia a explicação de novo e tente mais uma vez.') : modo === 'caca_erros' ? 'Você revisou seus erros.' : 'Você terminou o treino.'}</p>
        <div className="nota">
          <span className="nota-valor">{formatarNota(nota)}</span>
          <span className="nota-legenda">nota com peso por dificuldade</span>
        </div>
        {novosRecordes.map((t) => (
          <span key={t} className="selo-recorde">
            Novo recorde em {NOMES_TRILHA[t]}!
          </span>
        ))}
        {subiuDeNivel.map((t) => (
          <span key={`n-${t}`} className="selo-recorde">
            Você subiu de nível em {NOMES_TRILHA[t]}!
          </span>
        ))}
      </section>

      <aside className="lateral-fim">
        <div className="cartao">
          <h2>Acertos por trilha</h2>
          {resumo.map((r) => (
            <div key={r.trilha} className="linha-acerto">
              <div className="linha-acerto-texto">
                <span>{NOMES_TRILHA[r.trilha]}</span>
                <span>
                  {r.acertos} de {r.total}
                </span>
              </div>
              <div className="barra">
                <div style={{ width: `${Math.round((r.acertos / r.total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="numeros">
          <div className="cartao numero">
            <small>XP ganho</small>
            <strong>+{xpGanho}</strong>
          </div>
          <div className="cartao numero">
            <small>Sequência</small>
            <strong>
              {sequencia} {sequencia === 1 ? 'dia' : 'dias'}
            </strong>
          </div>
        </div>
        <div className="botoes-coluna">
          {sugeridas.map((s) => (
            <button key={s.habilidade} type="button" className="botao-contorno pequeno" onClick={() => onEstudar(s.habilidade)}>
              Estudar: {s.titulo}
            </button>
          ))}
          {erros > 0 && modo !== 'pilula' && (
            <button type="button" className="botao-laranja" onClick={onCacaAosErros}>
              Revisar {erros} {erros === 1 ? 'erro' : 'erros'} · XP em dobro
            </button>
          )}
          <button type="button" className="botao-contorno" onClick={onInicio}>
            {modo === 'pilula' ? 'Voltar para Estudar' : 'Voltar ao início'}
          </button>
        </div>
      </aside>
    </div>
  )
}
