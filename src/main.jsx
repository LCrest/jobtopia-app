import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import JobtopiaBoothDesign from './JobtopiaBoothDesign.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <JobtopiaBoothDesign />
  </StrictMode>,
)

