export default function Boton({ children, variante = 'primario', className = '', ...props }) {
  const estilos = {
    primario: 'bg-blue-600 text-white hover:bg-blue-700',
    secundario: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    peligro: 'bg-red-500 text-white hover:bg-red-600',
  }

  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
