import { useState } from 'react'
import { Link } from 'react-router-dom'

function RecoverPassword() {

    const [correo, setCorreo] = useState('')
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [cargando, setCargando] = useState(false)

    // =========================
    // VALIDAR CORREO
    // =========================

    const validarCorreo = (valor) => {

        if (valor.trim() === '') {
            return 'El correo electrónico es obligatorio.'
        }

        if (!/\S+@\S+\.\S+/.test(valor)) {
            return 'Ingresa un correo electrónico válido.'
        }

        return ''
    }

    // =========================
    // CAMBIO DEL CORREO
    // =========================

    const cambiarCorreo = (e) => {

        const valor = e.target.value

        setCorreo(valor)
        setError(validarCorreo(valor))
        setMensaje('')
    }

    // =========================
    // RECUPERAR CONTRASEÑA
    // =========================

    const manejarSubmit = async (e) => {

        e.preventDefault()

        const errorCorreo = validarCorreo(correo)

        setError(errorCorreo)
        setMensaje('')

        if (errorCorreo) {
            return
        }

        try {

            setCargando(true)

            const respuesta = await fetch(
                'https://campolab-production.up.railway.app/auth/recuperar-password',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        correo: correo.trim().toLowerCase()
                    })
                }
            )

            const datos = await respuesta.json()

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail ||
                    'No se pudo procesar la solicitud.'
                )
            }

            setMensaje(
                datos.mensaje
            )

            setError('')

        } catch (error) {

            console.error(error)

            setError(
                error.message ||
                'Ocurrió un error al intentar recuperar la contraseña.'
            )

        } finally {

            setCargando(false)

        }
    }

    return (

        <main className="min-h-screen bg-white flex items-center justify-center px-4 py-12">

            <div className="w-full max-w-md">

                {/* TARJETA */}

                <div className="bg-[#f5f5dc] rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200">

                    {/* ENCABEZADO */}

                    <div className="text-center mb-8">

                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-3xl">
                            🔑
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Recuperar contraseña
                        </h1>

                        <p className="text-gray-600 mt-2">
                            Ingresa tu correo para recuperar el acceso a tu cuenta.
                        </p>

                    </div>

                    {/* MENSAJE EXITOSO */}

                    {mensaje && (

                        <div className="mb-5 p-4 rounded-xl bg-green-100 border border-green-300 text-green-800 text-sm">

                            {mensaje}

                        </div>

                    )}

                    {/* FORMULARIO */}

                    <form onSubmit={manejarSubmit}>

                        {/* CORREO */}

                        <div className="mb-6">

                            <label className="block text-gray-800 font-semibold mb-2">
                                Correo electrónico
                            </label>

                            <input
                                type="email"
                                value={correo}
                                onChange={cambiarCorreo}
                                placeholder="correo@ejemplo.com"
                                disabled={cargando}
                                className={`w-full px-4 py-3 rounded-xl bg-white border-2 outline-none transition ${
                                    error
                                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-200'
                                }`}
                            />

                            {/* ERROR */}

                            {error && (

                                <p className="text-red-600 text-sm mt-2">
                                    {error}
                                </p>

                            )}

                        </div>

                        {/* BOTÓN */}

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-lg hover:shadow-xl"
                        >

                            {cargando
                                ? 'Enviando...'
                                : 'Recuperar contraseña'}

                        </button>

                    </form>

                    {/* VOLVER AL LOGIN */}

                    <div className="text-center mt-7 pt-6 border-t border-gray-300">

                        <Link
                            to="/login"
                            className="text-green-700 font-bold hover:text-green-900 transition"
                        >
                            ← Volver al inicio de sesión
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    )
}

export default RecoverPassword