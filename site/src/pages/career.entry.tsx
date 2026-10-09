import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import CareerPage from './CareerPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CareerPage />
  </StrictMode>,
)
