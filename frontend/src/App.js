import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css';


const Home = lazy(() => import('./pages/home'))

function App() {
  return (
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route index path="/" element={<Home />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
  )
}

export default App
