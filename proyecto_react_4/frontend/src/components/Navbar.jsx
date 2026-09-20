import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/img/logo.png'

function Navbar() {
  const [usuario, setUsuario] = useState(null)
  const navigate = useNavigate()

  // Comprobar si existe una sesión
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioActivo')

    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado))
    }
  }, [])

  // Determinar el panel según el rol
  const obtenerRutaPanel = () => {
    if (!usuario) return '/'

    switch (Number(usuario.id_rol)) {
      case 1:
        return '/admin'
      case 2:
        return '/empleado'
      case 3:
        return '/cliente'
      default:
        return '/'
    }
  }

  // Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActivo')
    localStorage.removeItem('token')
    localStorage.removeItem('recordarme')

    setUsuario(null)
    navigate('/login')
  }

  return (
    <nav className="w-full min-h-[70px] flex flex-col md:flex-row items-center justify-between px-6 md:px-[50px] py-4 md:py-0 bg-[#f5f5dc] shadow-[0_3px_15px_rgba(0,0,0,0.15)] sticky top-0 z-[1000]">

      {/* =========================
          LOGO
      ========================== */}
      <div className="flex items-center">
        <img
          src={logo}
          alt="Logo CampoLab"
          className="
            w-16 h-16
            sm:w-20 sm:h-20
            md:w-24 md:h-24
            lg:w-28 lg:h-28
            object-contain
            flex-shrink-0
          "
        />

        <span className="ml-2 md:ml-3 text-xl md:text-2xl font-bold text-gray-900">
          CampoLab
        </span>
      </div>

      {/* =========================
          ENLACES
      ========================== */}
      <ul className="flex flex-wrap justify-center items-center gap-4 md:gap-[35px] list-none">

        {/* INICIO */}
        <li>
          <Link
            to="/"
            className="text-gray-700 no-underline text-base transition duration-300 hover:text-green-600"
          >
            Inicio
          </Link>
        </li>

        {/* PRODUCTOS */}
        <li>
          <Link
            to="/productos"
            className="text-gray-700 no-underline text-base transition duration-300 hover:text-green-600"
          >
            Productos
          </Link>
        </li>

        {/* NOSOTROS */}
        <li>
          <Link
            to="/nosotros"
            className="text-gray-700 no-underline text-base transition duration-300 hover:text-green-600"
          >
            Nosotros
          </Link>
        </li>

        {/* CONTACTO */}
        <li>
          <Link
            to="/contacto"
            className="text-gray-700 no-underline text-base transition duration-300 hover:text-green-600"
          >
            Contacto
          </Link>
        </li>

        {/* =========================
            SI NO HA INICIADO SESIÓN
        ========================== */}
        {!usuario && (
          <li>
            <Link
              to="/login"
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-lg transition duration-300"
            >
              🔐 Iniciar sesión
            </Link>
          </li>
        )}

        {/* =========================
            USUARIO Y MENÚ DESPLEGABLE
        ========================== */}
        {usuario && (
          <li className="relative group">

            {/* Nombre del usuario */}
            <div className="text-gray-800 font-semibold cursor-pointer px-2 py-2">
              👤 Hola, {usuario.nombre}
            </div>

            {/* Menú desplegable */}
            <div className="
              absolute
              right-0
              top-full
              mt-1
              w-52
              bg-white
              rounded-lg
              shadow-lg
              border
              border-gray-200
              overflow-hidden
              opacity-0
              invisible
              group-hover:opacity-100
              group-hover:visible
              transition-all
              duration-200
            ">

              {/* Ir al panel */}
              <button
                onClick={() => navigate(obtenerRutaPanel())}
                className="
                  w-full
                  text-left
                  px-4
                  py-3
                  text-gray-700
                  hover:bg-green-50
                  hover:text-green-700
                  transition
                  duration-200
                "
              >
                🏠 Ir a mi panel
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={cerrarSesion}
                className="
                  w-full
                  text-left
                  px-4
                  py-3
                  text-red-600
                  hover:bg-red-50
                  transition
                  duration-200
                  border-t
                  border-gray-100
                "
              >
                🚪 Cerrar sesión
              </button>

            </div>
          </li>
        )}

      </ul>
    </nav>
  )
}

export { Navbar }