# CLAUDE.md — RecursaApp

## Descripción del proyecto

Sistema web para gestionar qué alumnos deben concurrir a recursar materias en otras escuelas.
Al abrir la app, muestra automáticamente los alumnos que recursan el día de hoy con su horario y escuela destino.
Uso personal de un único administrador. Debe funcionar bien en celular y computadora.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS v3 |
| Backend / DB | Supabase (PostgreSQL + REST API automática) |
| Autenticación | Supabase Auth (email/password) |

| Deploy frontend | Vercel |

---

## Estructura de carpetas

```
src/
├── components/        # Componentes reutilizables (botones, modales, cards, etc.)
├── pages/             # Una carpeta por vista principal
│   ├── Home/          # Vista del día
│   ├── Alumnos/       # ABM alumnos
│   ├── Recursadas/    # ABM recursadas
│   ├── Escuelas/      # ABM escuelas
│   └── Login/         # Pantalla de login
├── hooks/             # Custom hooks (useAlumnos, useRecursadas, etc.)
├── services/          # Lógica de acceso a datos
│   └── supabase.js    # Cliente de Supabase + funciones por entidad
├── utils/             # Funciones auxiliares (fechas, días, formateo)
├── constants/         # Constantes (DIAS_SEMANA, etc.)
└── App.jsx            # Rutas principales
```

---

## Modelo de datos (Supabase / PostgreSQL)

### Tabla: `escuelas`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
nombre      text NOT NULL
direccion   text
telefono    text
```

### Tabla: `alumnos`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
nombre       text NOT NULL
apellido     text NOT NULL
anio_actual  integer NOT NULL  -- ej: 4 = "4to año"
escuela_id   uuid REFERENCES escuelas(id)
```

### Tabla: `recursadas`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
alumno_id           uuid REFERENCES alumnos(id)
escuela_destino_id  uuid REFERENCES escuelas(id)
materia             text NOT NULL
dia_semana          text NOT NULL  -- 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes'
hora_inicio         time NOT NULL
hora_fin            time NOT NULL
aula                text
activa              boolean DEFAULT true
```

---

## Variables de entorno

Crear `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nunca hardcodear estas claves en el código.
El archivo `.env` debe estar en `.gitignore`.

---

## Convenciones de código

- **Idioma**: comentarios, nombres de variables, funciones y componentes en **español**
- **Componentes**: PascalCase → `TarjetaAlumno.jsx`
- **Funciones y variables**: camelCase → `obtenerAlumnosDeHoy()`
- **Archivos no-componentes**: camelCase → `supabase.js`, `googleSheets.js`
- **Constantes**: SCREAMING_SNAKE_CASE → `DIAS_SEMANA`
- **Commits**: en español, descriptivos → `feat: agregar vista del día`, `fix: corrección en filtro por día`
- Sin comentarios obvios. Comentar solo lógica no evidente.

---

## Páginas y funcionalidades

### `/` — Vista del día (Home)
- Detecta automáticamente el día actual
- Muestra cards de alumnos que recursan hoy (recursadas con `activa = true`)
- Cada card muestra: nombre completo, año, materia, horario, escuela destino, aula
- Agrupa por escuela destino
- Estado vacío si no hay recursadas hoy

### `/alumnos` — ABM Alumnos
- Listado de alumnos con nombre, año y escuela de origen
- Crear / editar / eliminar alumno
- Campos: nombre, apellido, anio_actual, escuela_id (select)

### `/recursadas` — ABM Recursadas
- Listado con nombre del alumno, materia, día, horario, escuela destino
- Filtro por día de la semana
- Crear / editar / eliminar recursada
- Toggle activa/inactiva sin borrar el registro
- Campos: alumno_id (buscador), materia, dia_semana, hora_inicio, hora_fin, escuela_destino_id, aula

### `/escuelas` — ABM Escuelas
- Listado de las 3 escuelas
- Crear / editar / eliminar escuela
- Campos: nombre, direccion, telefono



## Navegación

- **Mobile**: barra de navegación inferior con íconos (Home, Alumnos, Recursadas, Escuelas)
- **Desktop**: sidebar izquierdo con las mismas secciones
- Usar `react-router-dom` para el enrutamiento
- Redirigir a `/login` si no hay sesión activa

---

## Autenticación

- Login con email y password usando `supabase.auth.signInWithPassword()`
- Logout disponible en la navegación
- Proteger todas las rutas con un componente `<RutaProtegida>`
- No hay registro de usuarios desde la app (el usuario se crea directamente en el dashboard de Supabase)

---

## Consideraciones de UX / responsive

- Diseño mobile-first
- Vite genera un build optimizado para móvil por defecto
- Usar unidades relativas (`rem`, `%`) y clases responsive de Tailwind (`sm:`, `md:`, `lg:`)
- Mostrar estados de carga (`loading`) en cada fetch
- Mostrar estados vacíos con mensaje descriptivo
- Confirmar antes de eliminar cualquier registro (modal o `confirm()`)
- Mostrar feedback visual al guardar (toast o mensaje inline)

---

## Notas para Claude Code

- Siempre usar el cliente de Supabase centralizado en `src/services/supabase.js`
- Las variables de entorno se acceden con `import.meta.env.VITE_*` (Vite, no process.env)
- Nunca hacer fetches directos a la API REST de Supabase desde los componentes; usar los hooks o el service
- Al trabajar con días, usar el array constante `DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']`
- Para obtener el día actual en español usar `new Date().toLocaleDateString('es-AR', { weekday: 'long' }).toLowerCase()`
- El proyecto tiene exactamente 3 escuelas; no es un sistema multiescuela genérico
- Priorizar simplicidad: sin Redux, sin librerías de formularios externas, sin over-engineering
