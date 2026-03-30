import { DIAS_SEMANA } from '../constants'

export function obtenerDiaActual() {
  return new Date().toLocaleDateString('es-AR', { weekday: 'long' }).toLowerCase()
}

export function esDiaLaboral() {
  return DIAS_SEMANA.includes(obtenerDiaActual())
}

export function formatearHora(hora) {
  if (!hora) return ''
  return hora.slice(0, 5) // "08:30:00" → "08:30"
}
