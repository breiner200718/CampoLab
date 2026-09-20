import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RegistroModal from '../components/RegistroModal'
import logo from '../assets/img/logo.png'

function Login() {

  // =========================
  // ESTADOS
  // =========================

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [recordarme, setRecordarme] = useState(false)
  const [errorCorreo, setErrorCorreo] = useState('')
  const [errorPassword, setErrorPassword] = useState('')
  const [mostrarRegistro, setMostrarRegistro] = useState(false)

  // ALERTA DE BIENVENIDA
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false)
  const [nombreBienvenida, setNombreBienvenida] = useState('')

  // =========================
  // NAVEGACIÓN
  // =========================

  const navigate = useNavigate()

  // =========================
  // VALIDAR CORREO
  // =========================

  const validarCorreo = (valor) => {

    if (!valor.trim()) {
      return 'El correo electrónico es obligatorio.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      return 'Ingresa un correo electrónico válido.'
    }

    return ''
  }

  // =========================
  // VALIDAR CONTRASEÑA
  // =========================

  const validarPassword = (valor) => {

    if (!valor) {
      return 'La contraseña es obligatoria.'
    }

    if (valor.length < 8) {
      return 'La contraseña debe tener mínimo 8 caracteres.'
    }

    return ''
  }

  // =========================
  // CAMBIO DEL CORREO
  // =========================

  const cambiarCorreo = (e) => {

    const valor = e.target.value

    setCorreo(valor)
    setErrorCorreo(validarCorreo(valor))

  }

  // =========================
  // CAMBIO DE CONTRASEÑA
  // =========================

  const cambiarPassword = (e) => {

    const valor = e.target.value

    setPassword(valor)
    setErrorPassword(validarPassword(valor))

  }

  // =========================
  // INICIAR SESIÓN
  // =========================

  const manejarSubmit = async (e) => {

    e.preventDefault()

    const errorCorreoActual = validarCorreo(correo)
    const errorPasswordActual = validarPassword(password)

    setErrorCorreo(errorCorreoActual)
    setErrorPassword(errorPasswordActual)

    // Si hay errores de validación, no continúa

    if (errorCorreoActual || errorPasswordActual) {
      return
    }

    try {

      // ==========================================
      // ENVIAR CREDENCIALES AL BACKEND FASTAPI
      // ==========================================

      const respuesta = await fetch(
        "https://campolab-production.up.railway.app/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            correo: correo,
            contrasena: password
          })
        }
      )

      const data = await respuesta.json()

      // ==========================================
      // COMPROBAR RESPUESTA
      // ==========================================

      if (!respuesta.ok) {

        throw new Error(
          data.detail ||
          'El correo o la contraseña son incorrectos.'
        )

      }

      // ==========================================
      // GUARDAR TOKEN JWT
      // ==========================================

      localStorage.setItem(
        'token',
        data.access_token
      )

      // ==========================================
      // GUARDAR USUARIO AUTENTICADO
      // ==========================================

      const usuario = data.usuario

      localStorage.setItem(
        'usuarioActivo',
        JSON.stringify({
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          id_rol: usuario.id_rol
        })
      )

      // ==========================================
      // AVISAR AL NAVBAR QUE CAMBIÓ EL USUARIO
      // ==========================================

      window.dispatchEvent(
        new Event('usuarioActualizado')
      )

      // ==========================================
      // RECORDAR SESIÓN
      // ==========================================

      if (recordarme) {

        localStorage.setItem(
          'recordarme',
          'true'
        )

      } else {

        localStorage.removeItem('recordarme')

      }

      // ==========================================
      // DETERMINAR PANEL SEGÚN EL ROL
      // ==========================================

      let rutaDestino = '/'

      switch (Number(usuario.id_rol)) {

        case 1:
          rutaDestino = '/admin'
          break

        case 2:
          rutaDestino = '/empleado'
          break

        case 3:
          rutaDestino = '/cliente'
          break

        default:
          rutaDestino = '/'
          break

      }

      // ==========================================
      // MOSTRAR ALERTA BONITA
      // ==========================================

      setNombreBienvenida(usuario.nombre)
      setMostrarBienvenida(true)

      // ==========================================
      // REDIRECCIONAR DESPUÉS DE LA ALERTA
      // ==========================================

      setTimeout(() => {
        navigate(rutaDestino)
      }, 1500)

    } catch (error) {

      console.error(
        'Error al iniciar sesión:',
        error
      )

      setErrorPassword(
        error.message ||
        'El correo o la contraseña son incorrectos.'
      )

    }

  }

  // =========================
  // CERRAR REGISTRO
  // =========================

  const cerrarRegistro = () => {
    setMostrarRegistro(false)
  }

  // =========================
  // INTERFAZ
  // =========================

  return (

    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-md">

        <div className="bg-[#f5f5dc] rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200">

          {/* =========================
              ENCABEZADO
          ========================= */}

          <div className="text-center mb-8">

            <div className="flex justify-center mb-4">

              <img
                src={logo}
                alt="Logo CampoLab"
                className="w-30 h-40 object-contain"
              />

            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Iniciar sesión
            </h1>

            <p className="text-gray-600 mt-2">
              Ingresa a tu cuenta
            </p>

          </div>

          {/* =========================
              FORMULARIO
          ========================= */}

          <form onSubmit={manejarSubmit}>

            {/* CORREO */}

            <div className="mb-5">

              <label className="block text-gray-800 font-semibold mb-2">
                Correo electrónico
              </label>

              <input
                type="email"
                value={correo}
                onChange={cambiarCorreo}
                placeholder="correo@ejemplo.com"
                maxLength={100}
                className={`w-full px-4 py-3 rounded-xl bg-white border-2 outline-none transition ${
                  errorCorreo
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-200'
                }`}
              />

              {errorCorreo && (

                <p className="text-red-600 text-sm mt-2">
                  {errorCorreo}
                </p>

              )}

            </div>

            {/* CONTRASEÑA */}

            <div className="mb-5">

              <label className="block text-gray-800 font-semibold mb-2">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={cambiarPassword}
                placeholder="Ingresa tu contraseña"
                maxLength={100}
                className={`w-full px-4 py-3 rounded-xl bg-white border-2 outline-none transition ${
                  errorPassword
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-200'
                }`}
              />

              {errorPassword && (

                <p className="text-red-600 text-sm mt-2">
                  {errorPassword}
                </p>

              )}

            </div>

            {/* RECORDARME */}

            <div className="flex items-center justify-between mb-6">

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">

                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) =>
                    setRecordarme(e.target.checked)
                  }
                  className="w-4 h-4 accent-green-700"
                />

                <span>
                  Recordarme
                </span>

              </label>

              {/* RECUPERAR CONTRASEÑA */}

              <Link
                to="/recuperar-password"
                className="text-sm text-green-700 font-semibold hover:text-green-900 transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>

            </div>

            {/* BOTÓN LOGIN */}

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-lg hover:shadow-xl"
            >
              Iniciar sesión
            </button>

          </form>

          {/* =========================
              REGISTRO
          ========================= */}

          <div className="text-center mt-7 pt-6 border-t border-gray-300">

            <p className="text-gray-600 text-sm">

              ¿No tienes una cuenta?

              <button
                type="button"
                onClick={() => setMostrarRegistro(true)}
                className="ml-1 text-green-700 font-bold hover:text-green-900 transition"
              >
                Crear una cuenta
              </button>

            </p>

          </div>

        </div>

      </div>

      {/* =========================
          MODAL REGISTRO
      ========================= */}

      {mostrarRegistro && (

        <RegistroModal
          cerrarModal={cerrarRegistro}
        />

      )}

      {/* =================================================
          ALERTA DE BIENVENIDA
      ================================================= */}

      {mostrarBienvenida && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

          <div className="w-full max-w-sm bg-[#f5f5dc] rounded-3xl shadow-2xl border border-green-200 p-8 text-center animate-[fadeIn_0.3s_ease-out]">

            {/* ICONO */}

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 border-4 border-green-200">

              <span className="text-3xl text-green-700 font-bold">
                ✓
              </span>

            </div>

            {/* TÍTULO */}

            <h2 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido!
            </h2>

            {/* NOMBRE */}

            <p className="text-gray-600 mt-3">
              Hola,{" "}
              <span className="font-bold text-green-700">
                {nombreBienvenida}
              </span>
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Has iniciado sesión correctamente.
            </p>

            {/* INDICADOR */}

            <div className="mt-6">

              <div className="h-1.5 w-full bg-green-100 rounded-full overflow-hidden">

                <div className="h-full bg-green-600 rounded-full animate-[progress_1.5s_linear]"></div>

              </div>

              <p className="text-xs text-gray-400 mt-3">
                Entrando a tu panel...
              </p>

            </div>

          </div>

        </div>

      )}

    </main>

  )
}

export default Login