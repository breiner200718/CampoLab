import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    const manejarSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMensaje("");

        if (!token) {
            setError("El enlace de recuperación no es válido.");
            return;
        }

        if (nuevaContrasena.length < 8) {
            setError("La contraseña debe tener mínimo 8 caracteres.");
            return;
        }

        if (nuevaContrasena !== confirmarContrasena) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            setCargando(true);

            const respuesta = await fetch(
                "https://campolab-production.up.railway.app/auth/restablecer-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: token,
                        nueva_contrasena: nuevaContrasena,
                    }),
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || "No se pudo cambiar la contraseña."
                );
            }

            setMensaje(datos.mensaje);

            setNuevaContrasena("");
            setConfirmarContrasena("");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-4 py-12">

            <div className="w-full max-w-md">

                <div className="bg-[#f5f5dc] rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200">

                    <div className="text-center mb-8">

                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-3xl">
                            🔐
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Nueva contraseña
                        </h1>

                        <p className="text-gray-600 mt-2">
                            Ingresa tu nueva contraseña para recuperar el acceso.
                        </p>

                    </div>

                    {error && (
                        <div className="mb-5 p-4 rounded-xl bg-red-100 border border-red-300 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    {mensaje && (
                        <div className="mb-5 p-4 rounded-xl bg-green-100 border border-green-300 text-green-800 text-sm">
                            {mensaje}
                        </div>
                    )}

                    <form onSubmit={manejarSubmit}>

                        <div className="mb-5">

                            <label className="block text-gray-800 font-semibold mb-2">
                                Nueva contraseña
                            </label>

                            <input
                                type="password"
                                value={nuevaContrasena}
                                onChange={(e) =>
                                    setNuevaContrasena(e.target.value)
                                }
                                placeholder="Mínimo 8 caracteres"
                                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none"
                                disabled={cargando}
                            />

                        </div>

                        <div className="mb-6">

                            <label className="block text-gray-800 font-semibold mb-2">
                                Confirmar contraseña
                            </label>

                            <input
                                type="password"
                                value={confirmarContrasena}
                                onChange={(e) =>
                                    setConfirmarContrasena(e.target.value)
                                }
                                placeholder="Repite tu contraseña"
                                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none"
                                disabled={cargando}
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={cargando || !token}
                            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-lg"
                        >
                            {cargando
                                ? "Actualizando..."
                                : "Cambiar contraseña"}
                        </button>

                    </form>

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
    );
}

export default ResetPassword;