import { useState } from 'react'

import './App.css'
import Header from './Components/Header.tsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header></Header>
    </>
  )
}

export default App
