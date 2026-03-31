import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAlumnos } from '../../hooks/useAlumnos'
import { useEscuelas } from '../../hooks/useEscuelas'
import { useRecursadas } from '../../hooks/useRecursadas'
import { crearAlumno, actualizarAlumno, eliminarAlumno } from '../../services/supabase'
import { DIAS_SEMANA } from '../../constants'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import Boton from '../../components/Boton'

const VACIO = { nombre: '', apellido: '', anio_actual: '', escuela_id: '' }

export default function Alumnos() {
  const { alumnos, cargando, recargar } = useAlumnos()
  const { escuelas } = useEscuelas()
  const { recursadas } = useRecursadas()
  const [filtroEscuela, setFiltroEscuela] = useState('')
  const [filtroDia, setFiltroDia] = useState('')
  const [filtroAnio, setFiltroAnio] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)

  // Años presentes entre los alumnos cargados
  const aniosDisponibles = [...new Set(alumnos.map((a) => a.anio_actual))].sort()

  const alumnosFiltrados = alumnos.filter((a) => {
    if (filtroEscuela && a.escuela_id !== filtroEscuela) return false
    if (filtroAnio && String(a.anio_actual) !== filtroAnio) return false
    if (filtroDia) {
      const tieneRecursadaEseDia = recursadas.some(
        (r) => r.alumno_id === a.id && r.dia_semana === filtroDia
      )
      if (!tieneRecursadaEseDia) return false
    }
    return true
  })

  function abrirCrear() {
    setEditando(null)
    setForm(VACIO)
    setModalAbierto(true)
  }

  function abrirEditar(alumno) {
    setEditando(alumno)
    setForm({
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      anio_actual: alumno.anio_actual,
      escuela_id: alumno.escuela_id ?? '',
    })
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setEditando(null)
  }

  function cambiarCampo(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    const datos = { ...form, anio_actual: Number(form.anio_actual), escuela_id: form.escuela_id || null }
    try {
      if (editando) {
        await actualizarAlumno(editando.id, datos)
        toast.success('Alumno actualizado')
      } else {
        await crearAlumno(datos)
        toast.success('Alumno creado')
      }
      recargar()
      cerrarModal()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(alumno) {
    if (!confirm(`¿Eliminar a ${alumno.apellido}, ${alumno.nombre}?`)) return
    try {
      await eliminarAlumno(alumno.id)
      toast.success('Alumno eliminado')
      recargar()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const claseFiltro = (activo) =>
    `px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
      activo ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
    }`

  return (
    <div className="p-4 pb-24 md:pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Alumnos</h1>
        <Boton onClick={abrirCrear}>+ Nuevo</Boton>
      </div>

      {/* Filtro por escuela */}
      <div className="mb-1">
        <p className="text-xs text-gray-400 mb-1">Escuela de origen</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
        <button className={claseFiltro(!filtroEscuela)} onClick={() => setFiltroEscuela('')}>
          Todas las escuelas
        </button>
        {escuelas.map((e) => (
          <button key={e.id} className={claseFiltro(filtroEscuela === e.id)} onClick={() => setFiltroEscuela(e.id)}>
            {e.nombre}
          </button>
        ))}
      </div>

      {/* Filtro por año */}
      <div className="mb-1">
        <p className="text-xs text-gray-400 mb-1">Año</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          <button className={claseFiltro(!filtroAnio)} onClick={() => setFiltroAnio('')}>Todos</button>
          {aniosDisponibles.map((anio) => (
            <button key={anio} className={claseFiltro(filtroAnio === String(anio))} onClick={() => setFiltroAnio(String(anio))}>
              {anio}° año
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por día */}
      <div className="mb-1">
        <p className="text-xs text-gray-400 mb-1">Día que recursa</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button className={claseFiltro(!filtroDia)} onClick={() => setFiltroDia('')}>
          Todos los días
        </button>
        {DIAS_SEMANA.map((dia) => (
          <button key={dia} className={`${claseFiltro(filtroDia === dia)} capitalize`} onClick={() => setFiltroDia(dia)}>
            {dia}
          </button>
        ))}
      </div>

      {cargando && <Spinner />}

      {!cargando && alumnosFiltrados.length === 0 && (
        <p className="text-center text-gray-400 py-12">No hay alumnos para el filtro seleccionado</p>
      )}

      <div className="flex flex-col gap-3">
        {alumnosFiltrados.map((a) => (
          <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-800">{a.apellido}, {a.nombre}</p>
              <p className="text-sm text-gray-500">{a.anio_actual}° año</p>
              {a.escuela && <p className="text-sm text-gray-400">{a.escuela.nombre}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <Boton variante="secundario" onClick={() => abrirEditar(a)}>Editar</Boton>
              <Boton variante="peligro" onClick={() => borrar(a)}>Borrar</Boton>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <Modal titulo={editando ? 'Editar alumno' : 'Nuevo alumno'} onCerrar={cerrarModal}>
          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Apellido *</label>
                <input name="apellido" value={form.apellido} onChange={cambiarCampo} required
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre *</label>
                <input name="nombre" value={form.nombre} onChange={cambiarCampo} required
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Año actual *</label>
              <input name="anio_actual" type="number" min="1" max="6" value={form.anio_actual} onChange={cambiarCampo} required
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Escuela de origen</label>
              <select name="escuela_id" value={form.escuela_id} onChange={cambiarCampo}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Sin asignar —</option>
                {escuelas.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Boton type="button" variante="secundario" onClick={cerrarModal}>Cancelar</Boton>
              <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</Boton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
