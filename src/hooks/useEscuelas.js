import { useState, useEffect } from 'react'
import { obtenerEscuelas } from '../services/supabase'

export function useEscuelas() {
  const [escuelas, setEscuelas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  async function cargar() {
    setCargando(true)
    try {
      const data = await obtenerEscuelas()
      setEscuelas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return { escuelas, cargando, error, recargar: cargar }
}
