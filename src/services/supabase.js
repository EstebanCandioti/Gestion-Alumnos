import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Escuelas ---

export async function obtenerEscuelas() {
  const { data, error } = await supabase.from('escuelas').select('*').order('nombre')
  if (error) throw error
  return data
}

export async function crearEscuela(escuela) {
  const { data, error } = await supabase.from('escuelas').insert(escuela).select().single()
  if (error) throw error
  return data
}

export async function actualizarEscuela(id, cambios) {
  const { data, error } = await supabase.from('escuelas').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function eliminarEscuela(id) {
  const { error } = await supabase.from('escuelas').delete().eq('id', id)
  if (error) throw error
}

// --- Alumnos ---

export async function obtenerAlumnos() {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*, escuela:escuelas(id, nombre)')
    .order('apellido')
  if (error) throw error
  return data
}

export async function crearAlumno(alumno) {
  const { data, error } = await supabase.from('alumnos').insert(alumno).select().single()
  if (error) throw error
  return data
}

export async function actualizarAlumno(id, cambios) {
  const { data, error } = await supabase.from('alumnos').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function eliminarAlumno(id) {
  const { error } = await supabase.from('alumnos').delete().eq('id', id)
  if (error) throw error
}

// --- Recursadas ---

export async function obtenerRecursadas() {
  const { data, error } = await supabase
    .from('recursadas')
    .select('*, alumno:alumnos(id, nombre, apellido, anio_actual), escuela_destino:escuelas(id, nombre)')
    .order('hora_inicio')
  if (error) throw error
  return data
}

export async function obtenerRecursadasDeHoy() {
  const diaHoy = new Date().toLocaleDateString('es-AR', { weekday: 'long' }).toLowerCase()
  const { data, error } = await supabase
    .from('recursadas')
    .select('*, alumno:alumnos(id, nombre, apellido, anio_actual), escuela_destino:escuelas(id, nombre)')
    .eq('dia_semana', diaHoy)
    .eq('activa', true)
    .order('hora_inicio')
  if (error) throw error
  return data
}

export async function crearRecursada(recursada) {
  const { data, error } = await supabase.from('recursadas').insert(recursada).select().single()
  if (error) throw error
  return data
}

export async function actualizarRecursada(id, cambios) {
  const { data, error } = await supabase.from('recursadas').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function eliminarRecursada(id) {
  const { error } = await supabase.from('recursadas').delete().eq('id', id)
  if (error) throw error
}

export async function toggleRecursadaActiva(id, activa) {
  const { data, error } = await supabase.from('recursadas').update({ activa }).eq('id', id).select().single()
  if (error) throw error
  return data
}
