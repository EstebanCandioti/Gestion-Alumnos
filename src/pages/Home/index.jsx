import { useState, useEffect } from 'react'
import { obtenerRecursadasDeHoy } from '../../services/supabase'
import { obtenerDiaActual, formatearHora } from '../../utils/fechas'
import Spinner from '../../components/Spinner'

export default function Home() {
  const [recursadas, setRecursadas] = useState([])
  const [cargando, setCargando] = useState(true)
  const diaHoy = obtenerDiaActual()

  useEffect(() => {
    obtenerRecursadasDeHoy()
      .then(setRecursadas)
      .finally(() => setCargando(false))
  }, [])

  // Agrupar por escuela destino
  const porEscuela = recursadas.reduce((acc, r) => {
    const nombre = r.escuela_destino?.nombre ?? 'Sin escuela'
    if (!acc[nombre]) acc[nombre] = []
    acc[nombre].push(r)
    return acc
  }, {})

  return (
    <div className="p-4 pb-20 md:pb-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-1 capitalize">
        {diaHoy}
      </h1>
      <p className="text-sm text-gray-500 mb-6">Alumnos que recursan hoy</p>

      {cargando && <Spinner />}

      {!cargando && recursadas.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No hay recursadas para hoy</p>
        </div>
      )}

      {!cargando && Object.entries(porEscuela).map(([escuela, items]) => (
        <div key={escuela} className="mb-6">
          <h2 className="text-base font-semibold text-blue-700 mb-2">
            {escuela}
          </h2>
          <div className="flex flex-col gap-3">
            {items.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {r.alumno?.apellido}, {r.alumno?.nombre}
                    </p>
                    <p className="text-sm text-gray-500">{r.alumno?.anio_actual}° año</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-lg">
                    {formatearHora(r.hora_inicio)} – {formatearHora(r.hora_fin)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md">{r.materia}</span>
                  {r.aula && <span className="bg-gray-100 px-2 py-0.5 rounded-md">Aula {r.aula}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
