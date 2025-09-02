import { useState } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from './components/mode-toggle'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ModeToggle></ModeToggle>
    </>
  )
}

export default App
