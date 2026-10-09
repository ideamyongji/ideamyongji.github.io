import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import NewsPage from './NewsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NewsPage />
  </StrictMode>,
)
