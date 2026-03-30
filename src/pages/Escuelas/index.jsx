import { useState } from 'react'
import toast from 'react-hot-toast'
import { useEscuelas } from '../../hooks/useEscuelas'
import { crearEscuela, actualizarEscuela, eliminarEscuela } from '../../services/supabase'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import Boton from '../../components/Boton'

const VACIA = { nombre: '', direccion: '', telefono: '' }

export default function Escuelas() {
  const { escuelas, cargando, recargar } = useEscuelas()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIA)
  const [guardando, setGuardando] = useState(false)

  function abrirCrear() {
    setEditando(null)
    setForm(VACIA)
    setModalAbierto(true)
  }

  function abrirEditar(escuela) {
    setEditando(escuela)
    setForm({ nombre: escuela.nombre, direccion: escuela.direccion ?? '', telefono: escuela.telefono ?? '' })
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
    try {
      if (editando) {
        await actualizarEscuela(editando.id, form)
        toast.success('Escuela actualizada')
      } else {
        await crearEscuela(form)
        toast.success('Escuela creada')
      }
      recargar()
      cerrarModal()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(escuela) {
    if (!confirm(`¿Eliminar "${escuela.nombre}"?`)) return
    try {
      await eliminarEscuela(escuela.id)
      toast.success('Escuela eliminada')
      recargar()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="p-4 pb-20 md:pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Escuelas</h1>
        <Boton onClick={abrirCrear}>+ Nueva</Boton>
      </div>

      {cargando && <Spinner />}

      {!cargando && escuelas.length === 0 && (
        <p className="text-center text-gray-400 py-12">No hay escuelas cargadas</p>
      )}

      <div className="flex flex-col gap-3">
        {escuelas.map((e) => (
          <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-800">{e.nombre}</p>
              {e.direccion && <p className="text-sm text-gray-500">{e.direccion}</p>}
              {e.telefono && <p className="text-sm text-gray-400">{e.telefono}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <Boton variante="secundario" onClick={() => abrirEditar(e)}>Editar</Boton>
              <Boton variante="peligro" onClick={() => borrar(e)}>Borrar</Boton>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <Modal titulo={editando ? 'Editar escuela' : 'Nueva escuela'} onCerrar={cerrarModal}>
          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={cambiarCampo} required
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Dirección</label>
              <input name="direccion" value={form.direccion} onChange={cambiarCampo}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={cambiarCampo}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
