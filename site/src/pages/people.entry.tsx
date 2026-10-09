import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import PeoplePage from './PeoplePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PeoplePage />
  </StrictMode>,
)
