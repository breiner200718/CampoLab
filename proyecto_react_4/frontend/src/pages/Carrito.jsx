import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Carrito() {
    const navigate = useNavigate();

    const [carrito, setCarrito] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [comprando, setComprando] = useState(false);

    useEffect(() => {
        cargarCarrito();
    }, []);

    const cargarCarrito = () => {
        const carritoGuardado =
            JSON.parse(localStorage.getItem("carrito")) || [];

        setCarrito(carritoGuardado);
    };

    const actualizarCantidad = (idProducto, nuevaCantidad) => {
        if (nuevaCantidad < 1) {
            return;
        }

        const nuevoCarrito = carrito.map((producto) => {
            if (producto.id_producto === idProducto) {
                const cantidadFinal = Math.min(
                    nuevaCantidad,
                    producto.stock
                );

                return {
                    ...producto,
                    cantidad: cantidadFinal,
                };
            }

            return producto;
        });

        setCarrito(nuevoCarrito);

        localStorage.setItem(
            "carrito",
            JSON.stringify(nuevoCarrito)
        );
    };

    const eliminarProducto = (idProducto) => {
        const nuevoCarrito = carrito.filter(
            (producto) => producto.id_producto !== idProducto
        );

        setCarrito(nuevoCarrito);

        localStorage.setItem(
            "carrito",
            JSON.stringify(nuevoCarrito)
        );
    };

    const calcularTotal = () => {
        return carrito.reduce(
            (total, producto) =>
                total +
                Number(producto.precio) * producto.cantidad,
            0
        );
    };

    const obtenerUsuario = () => {
        const usuarioGuardado =
            localStorage.getItem("usuarioActivo");

        if (!usuarioGuardado) {
            return null;
        }

        try {
            return JSON.parse(usuarioGuardado);
        } catch {
            return null;
        }
    };

    const confirmarCompra = async () => {
        setMensaje("");
        setError("");

        const usuario = obtenerUsuario();

        if (!usuario) {
            setError(
                "Debes iniciar sesión para realizar una compra."
            );

            return;
        }

        if (carrito.length === 0) {
            setError("El carrito está vacío.");

            return;
        }

        try {
            setComprando(true);

            const token = localStorage.getItem("token");

            if (!token) {
                setError(
                    "No se encontró el token de autenticación."
                );

                return;
            }

            const productos = carrito.map((producto) => ({
                id_producto: producto.id_producto,
                cantidad: producto.cantidad,
            }));

            const respuesta = await fetch(
                "https://campolab-production.up.railway.app/ventas/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id_cliente: usuario.id_usuario,
                        productos: productos,
                    }),
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail ||
                        "No se pudo realizar la compra."
                );
            }

            localStorage.removeItem("carrito");

            setCarrito([]);

            setMensaje(
                `Compra realizada correctamente. Factura: ${
                    datos.numero_factura
                }`
            );
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                    "Ocurrió un error al realizar la compra."
            );
        } finally {
            setComprando(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f5dc] px-5 sm:px-8 py-12">
            <div className="max-w-6xl mx-auto">

                {/* ENCABEZADO */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">

                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">
                            🛒 Mi carrito
                        </h1>

                        <p className="text-gray-600 mt-2">
                            Revisa tus productos antes de realizar
                            la compra.
                        </p>
                    </div>

                    <Link
                        to="/productos"
                        className="inline-block bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl transition"
                    >
                        ← Seguir comprando
                    </Link>
                </div>

                {/* MENSAJE DE ÉXITO */}
                {mensaje && (
                    <div className="mb-8 rounded-xl border border-green-500/40 bg-green-100 px-5 py-4 text-green-800">
                        <p className="font-semibold">
                            {mensaje}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/productos")}
                            className="mt-3 text-green-900 underline font-semibold"
                        >
                            Volver a productos
                        </button>
                    </div>
                )}

                {/* MENSAJE DE ERROR */}
                {error && (
                    <div className="mb-8 rounded-xl border border-red-500/40 bg-red-100 px-5 py-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* CARRITO VACÍO */}
                {carrito.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center">

                        <div className="text-7xl mb-6">
                            🛒
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Tu carrito está vacío
                        </h2>

                        <p className="text-gray-500 mb-7">
                            Agrega algunos productos de CampoLab
                            para comenzar tu compra.
                        </p>

                        <Link
                            to="/productos"
                            className="inline-block bg-green-700 hover:bg-green-800 text-white font-bold px-7 py-3 rounded-xl transition"
                        >
                            Ver productos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* PRODUCTOS */}
                        <div className="lg:col-span-2 space-y-5">

                            {carrito.map((producto) => (
                                <div
                                    key={producto.id_producto}
                                    className="bg-white rounded-2xl shadow-lg p-5"
                                >
                                    <div className="flex flex-col sm:flex-row gap-5">

                                        {/* IMAGEN */}
                                        <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">

                                            {producto.imagen ? (
                                                <img
                                                    src={`https://campolab-production.up.railway.app/uploads/${producto.imagen}`}
                                                    alt={producto.nombre}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-5xl">
                                                    ♻️
                                                </span>
                                            )}
                                        </div>

                                        {/* INFORMACIÓN */}
                                        <div className="flex-1">

                                            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">

                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-800">
                                                        {producto.nombre}
                                                    </h2>

                                                    <p className="text-green-700 font-bold text-lg mt-1">
                                                        $
                                                        {Number(
                                                            producto.precio
                                                        ).toLocaleString(
                                                            "es-CO"
                                                        )}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        eliminarProducto(
                                                            producto.id_producto
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-800 font-semibold"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>

                                            {/* CANTIDAD */}
                                            <div className="flex items-center gap-3 mt-5">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        actualizarCantidad(
                                                            producto.id_producto,
                                                            producto.cantidad -
                                                                1
                                                        )
                                                    }
                                                    disabled={
                                                        producto.cantidad <=
                                                        1
                                                    }
                                                    className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-40 font-bold text-lg"
                                                >
                                                    -
                                                </button>

                                                <span className="w-10 text-center font-bold">
                                                    {producto.cantidad}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        actualizarCantidad(
                                                            producto.id_producto,
                                                            producto.cantidad +
                                                                1
                                                        )
                                                    }
                                                    disabled={
                                                        producto.cantidad >=
                                                        producto.stock
                                                    }
                                                    className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-40 font-bold text-lg"
                                                >
                                                    +
                                                </button>

                                                <span className="text-sm text-gray-500 ml-2">
                                                    Máximo:{" "}
                                                    {producto.stock}
                                                </span>
                                            </div>

                                            {/* SUBTOTAL */}
                                            <p className="mt-4 text-gray-600">
                                                Subtotal:{" "}
                                                <span className="font-bold text-gray-800">
                                                    $
                                                    {(
                                                        Number(
                                                            producto.precio
                                                        ) *
                                                        producto.cantidad
                                                    ).toLocaleString(
                                                        "es-CO"
                                                    )}
                                                </span>
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* RESUMEN */}
                        <div className="lg:col-span-1">

                            <div className="bg-white rounded-3xl shadow-xl p-7 sticky top-8">

                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Resumen de compra
                                </h2>

                                <div className="space-y-4 border-b border-gray-200 pb-6">

                                    <div className="flex justify-between text-gray-600">
                                        <span>
                                            Productos
                                        </span>

                                        <span>
                                            {carrito.reduce(
                                                (total, producto) =>
                                                    total +
                                                    producto.cantidad,
                                                0
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>
                                            Subtotal
                                        </span>

                                        <span>
                                            $
                                            {calcularTotal().toLocaleString(
                                                "es-CO"
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>
                                            Envío
                                        </span>

                                        <span className="text-green-700 font-semibold">
                                            Gratis
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-6 mb-7">

                                    <span className="text-xl font-bold text-gray-800">
                                        Total
                                    </span>

                                    <span className="text-2xl font-bold text-green-700">
                                        $
                                        {calcularTotal().toLocaleString(
                                            "es-CO"
                                        )}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={confirmarCompra}
                                    disabled={comprando}
                                    className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition"
                                >
                                    {comprando
                                        ? "Procesando compra..."
                                        : "✅ Confirmar compra"}
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    La compra será registrada en
                                    CampoLab.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Carrito;