import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import JapaneseInvitation from './JapaneseInvitation.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <JapaneseInvitation />
  </StrictMode>,
)
