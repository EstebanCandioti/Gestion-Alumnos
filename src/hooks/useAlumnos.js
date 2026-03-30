import { useState, useEffect } from 'react'
import { obtenerAlumnos } from '../services/supabase'

export function useAlumnos() {
  const [alumnos, setAlumnos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  async function cargar() {
    setCargando(true)
    try {
      const data = await obtenerAlumnos()
      setAlumnos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return { alumnos, cargando, error, recargar: cargar }
}
