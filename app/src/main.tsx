import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'
import './caderno.css'
import { definirTema } from './tema'

// O caderno é o visual padrão; a escolha salva é aplicada assim que a configuração carrega.
definirTema('caderno')

// Service worker: guarda o app no tablet para funcionar sem internet e se atualiza sozinho.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
