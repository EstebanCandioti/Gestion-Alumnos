import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import RutaProtegida from './components/RutaProtegida'
import Navegacion from './components/Navegacion'
import Login from './pages/Login'
import Home from './pages/Home'
import Alumnos from './pages/Alumnos'
import Recursadas from './pages/Recursadas'
import Escuelas from './pages/Escuelas'

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navegacion />
      <main className="flex-1 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <RutaProtegida>
            <Layout><Home /></Layout>
          </RutaProtegida>
        } />
        <Route path="/alumnos" element={
          <RutaProtegida>
            <Layout><Alumnos /></Layout>
          </RutaProtegida>
        } />
        <Route path="/recursadas" element={
          <RutaProtegida>
            <Layout><Recursadas /></Layout>
          </RutaProtegida>
        } />
        <Route path="/escuelas" element={
          <RutaProtegida>
            <Layout><Escuelas /></Layout>
          </RutaProtegida>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
