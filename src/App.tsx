import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import DetectiveBoard from './pages/DetectiveBoard'
import Purchases from './pages/Purchases'
import Debug from './pages/Debug'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board" element={<DetectiveBoard />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/debug" element={<Debug />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
