import React from "react"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from "./components/home-page"

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App