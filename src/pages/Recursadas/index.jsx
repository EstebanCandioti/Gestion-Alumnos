import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRecursadas } from '../../hooks/useRecursadas'
import { useAlumnos } from '../../hooks/useAlumnos'
import { useEscuelas } from '../../hooks/useEscuelas'
import { crearRecursada, actualizarRecursada, eliminarRecursada, toggleRecursadaActiva } from '../../services/supabase'
import { DIAS_SEMANA } from '../../constants'
import { formatearHora } from '../../utils/fechas'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import Boton from '../../components/Boton'

const VACIA = {
  alumno_id: '',
  escuela_destino_id: '',
  materia: '',
  dia_semana: 'lunes',
  hora_inicio: '',
  hora_fin: '',
  aula: '',
  activa: true,
}

function FilaFiltros({ label, children }) {
  return (
    <div className="mb-2">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">{children}</div>
    </div>
  )
}

export default function Recursadas() {
  const { recursadas, cargando, recargar } = useRecursadas()
  const { alumnos } = useAlumnos()
  const { escuelas } = useEscuelas()
  const [filtroDia, setFiltroDia] = useState('')
  const [filtroEscuela, setFiltroEscuela] = useState('')
  const [filtroAnio, setFiltroAnio] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIA)
  const [guardando, setGuardando] = useState(false)

  // Años presentes en las recursadas cargadas
  const aniosDisponibles = [...new Set(
    recursadas.map((r) => r.alumno?.anio_actual).filter(Boolean)
  )].sort()

  const recursadasFiltradas = recursadas.filter((r) => {
    if (filtroDia && r.dia_semana !== filtroDia) return false
    if (filtroEscuela && r.escuela_destino_id !== filtroEscuela) return false
    if (filtroAnio && String(r.alumno?.anio_actual) !== filtroAnio) return false
    return true
  })

  function abrirCrear() {
    setEditando(null)
    setForm(VACIA)
    setModalAbierto(true)
  }

  function abrirEditar(r) {
    setEditando(r)
    setForm({
      alumno_id: r.alumno_id,
      escuela_destino_id: r.escuela_destino_id,
      materia: r.materia,
      dia_semana: r.dia_semana,
      hora_inicio: r.hora_inicio?.slice(0, 5) ?? '',
      hora_fin: r.hora_fin?.slice(0, 5) ?? '',
      aula: r.aula ?? '',
      activa: r.activa,
    })
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setEditando(null)
  }

  function cambiarCampo(e) {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: valor }))
  }

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      if (editando) {
        await actualizarRecursada(editando.id, form)
        toast.success('Recursada actualizada')
      } else {
        await crearRecursada(form)
        toast.success('Recursada creada')
      }
      recargar()
      cerrarModal()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(r) {
    if (!confirm(`¿Eliminar recursada de ${r.alumno?.apellido}?`)) return
    try {
      await eliminarRecursada(r.id)
      toast.success('Recursada eliminada')
      recargar()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  async function toggleActiva(r) {
    try {
      await toggleRecursadaActiva(r.id, !r.activa)
      recargar()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const chip = (activo) =>
    `px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
      activo ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
    }`

  const inputClase = "mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="p-4 pb-24 md:pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Recursadas</h1>
        <Boton onClick={abrirCrear}>+ Nueva</Boton>
      </div>

      <FilaFiltros label="Día">
        <button className={chip(!filtroDia)} onClick={() => setFiltroDia('')}>Todos</button>
        {DIAS_SEMANA.map((dia) => (
          <button key={dia} className={`${chip(filtroDia === dia)} capitalize`} onClick={() => setFiltroDia(dia)}>
            {dia}
          </button>
        ))}
      </FilaFiltros>

      <FilaFiltros label="Escuela destino">
        <button className={chip(!filtroEscuela)} onClick={() => setFiltroEscuela('')}>Todas</button>
        {escuelas.map((e) => (
          <button key={e.id} className={chip(filtroEscuela === e.id)} onClick={() => setFiltroEscuela(e.id)}>
            {e.nombre}
          </button>
        ))}
      </FilaFiltros>

      <FilaFiltros label="Año del alumno">
        <button className={chip(!filtroAnio)} onClick={() => setFiltroAnio('')}>Todos</button>
        {aniosDisponibles.map((anio) => (
          <button key={anio} className={chip(filtroAnio === String(anio))} onClick={() => setFiltroAnio(String(anio))}>
            {anio}° año
          </button>
        ))}
      </FilaFiltros>

      {cargando && <Spinner />}

      {!cargando && recursadasFiltradas.length === 0 && (
        <p className="text-center text-gray-400 py-12">No hay recursadas para el filtro seleccionado</p>
      )}

      <div className="flex flex-col gap-3 mt-2">
        {recursadasFiltradas.map((r) => (
          <div key={r.id} className={`bg-white rounded-xl shadow-sm border p-4 transition-opacity ${r.activa ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{r.alumno?.apellido}, {r.alumno?.nombre}</p>
                <p className="text-sm text-gray-500">{r.materia} · <span className="capitalize">{r.dia_semana}</span> · {r.alumno?.anio_actual}° año</p>
                <p className="text-sm text-gray-400">{formatearHora(r.hora_inicio)} – {formatearHora(r.hora_fin)} · {r.escuela_destino?.nombre}</p>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <button
                  onClick={() => toggleActiva(r)}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {r.activa ? 'Activa' : 'Inactiva'}
                </button>
                <div className="flex gap-1 mt-1">
                  <Boton variante="secundario" className="!px-2 !py-1 text-xs" onClick={() => abrirEditar(r)}>Editar</Boton>
                  <Boton variante="peligro" className="!px-2 !py-1 text-xs" onClick={() => borrar(r)}>Borrar</Boton>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <Modal titulo={editando ? 'Editar recursada' : 'Nueva recursada'} onCerrar={cerrarModal}>
          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Alumno *</label>
              <select name="alumno_id" value={form.alumno_id} onChange={cambiarCampo} required className={inputClase}>
                <option value="">— Seleccionar —</option>
                {alumnos.map((a) => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Escuela destino *</label>
              <select name="escuela_destino_id" value={form.escuela_destino_id} onChange={cambiarCampo} required className={inputClase}>
                <option value="">— Seleccionar —</option>
                {escuelas.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Materia *</label>
              <input name="materia" value={form.materia} onChange={cambiarCampo} required className={inputClase} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Día *</label>
              <select name="dia_semana" value={form.dia_semana} onChange={cambiarCampo} required className={inputClase}>
                {DIAS_SEMANA.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Hora inicio *</label>
                <input name="hora_inicio" type="time" value={form.hora_inicio} onChange={cambiarCampo} required className={inputClase} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Hora fin *</label>
                <input name="hora_fin" type="time" value={form.hora_fin} onChange={cambiarCampo} required className={inputClase} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Aula</label>
              <input name="aula" value={form.aula} onChange={cambiarCampo} className={inputClase} />
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
