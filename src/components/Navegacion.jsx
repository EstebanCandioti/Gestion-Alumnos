import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const enlaces = [
  { to: '/', etiqueta: 'Hoy' },
  { to: '/alumnos', etiqueta: 'Alumnos' },
  { to: '/recursadas', etiqueta: 'Recursadas' },
  { to: '/escuelas', etiqueta: 'Escuelas' },
]

export default function Navegacion() {
  const { cerrarSesion } = useAuth()

  const claseEnlace = ({ isActive }) =>
    `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
      isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
    }`

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-gray-200 p-4 gap-2">
        <h1 className="text-lg font-bold text-blue-700 mb-4">Gestion Recursantes</h1>
        {enlaces.map(({ to, etiqueta }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {etiqueta}
          </NavLink>
        ))}
        <div className="mt-auto">
          <button
            onClick={cerrarSesion}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Navbar mobile (bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-4 z-50">
        {enlaces.map(({ to, etiqueta }) => (
          <NavLink key={to} to={to} end={to === '/'} className={claseEnlace}>
            <span className="px-4">{etiqueta}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
