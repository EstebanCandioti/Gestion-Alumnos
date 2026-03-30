import { useState, useEffect } from 'react'
import { obtenerRecursadas } from '../services/supabase'

export function useRecursadas() {
  const [recursadas, setRecursadas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  async function cargar() {
    setCargando(true)
    try {
      const data = await obtenerRecursadas()
      setRecursadas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return { recursadas, cargando, error, recargar: cargar }
}
