import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {NavBar} from './components/NavBar.tsx'
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from './components/mode-toggle.tsx'
import { Route, Routes } from 'react-router-dom'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className='items: stretch flex justify-center items-center'>
        <NavBar/>

      </div>
        <App/>
    </ThemeProvider>
  </StrictMode>
);
