import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import ProgramsPage from './ProgramsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProgramsPage />
  </StrictMode>,
)
