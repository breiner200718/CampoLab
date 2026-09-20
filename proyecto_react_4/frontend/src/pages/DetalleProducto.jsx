import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function DetalleProducto() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [cantidad, setCantidad] = useState(1);

    useEffect(() => {
        cargarProducto();
    }, [id]);

    const cargarProducto = async () => {
        try {
            setCargando(true);
            setError("");

            const respuesta = await fetch(
                `http://127.0.0.1:8000/productos/${id}`
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || "No se pudo cargar el producto."
                );
            }

            setProducto(datos);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    const agregarAlCarrito = () => {
        if (!producto || producto.stock <= 0) {
            return;
        }

        const carritoActual =
            JSON.parse(localStorage.getItem("carrito")) || [];

        const productoExistente = carritoActual.find(
            (item) => item.id_producto === producto.id_producto
        );

        if (productoExistente) {
            const nuevaCantidad =
                productoExistente.cantidad + cantidad;

            if (nuevaCantidad > producto.stock) {
                alert(
                    `No puedes agregar más de ${producto.stock} unidades.`
                );
                return;
            }

            productoExistente.cantidad = nuevaCantidad;
        } else {
            carritoActual.push({
                id_producto: producto.id_producto,
                nombre: producto.nombre,
                precio: Number(producto.precio),
                imagen: producto.imagen,
                stock: producto.stock,
                cantidad: cantidad,
            });
        }

        localStorage.setItem(
            "carrito",
            JSON.stringify(carritoActual)
        );

        alert("Producto agregado al carrito correctamente.");

        navigate("/carrito");
    };

    if (cargando) {
        return (
            <main className="min-h-screen bg-[#f5f5dc] flex items-center justify-center">
                <p className="text-gray-600 text-lg">
                    Cargando producto...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#f5f5dc] flex flex-col items-center justify-center px-6">
                <p className="text-red-600 text-lg font-semibold mb-6">
                    {error}
                </p>

                <Link
                    to="/productos"
                    className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl"
                >
                    ← Volver a productos
                </Link>
            </main>
        );
    }

    if (!producto) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#f5f5dc] px-5 sm:px-8 py-12">
            <div className="max-w-5xl mx-auto">

                <Link
                    to="/productos"
                    className="inline-block mb-8 text-green-700 font-bold hover:text-green-900"
                >
                    ← Volver a productos
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

                    <div className="grid grid-cols-1 md:grid-cols-2">

                        {/* IMAGEN */}
                        <div className="bg-gray-100 min-h-[350px] flex items-center justify-center">
                            {producto.imagen ? (
                                <img
                                    src={`http://127.0.0.1:8000/uploads/${producto.imagen}`}
                                    alt={producto.nombre}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center">
                                    <div className="text-8xl mb-4">
                                        ♻️
                                    </div>

                                    <p className="text-gray-500">
                                        Este producto no tiene imagen
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* INFORMACIÓN */}
                        <div className="p-8 sm:p-10">

                            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-5">
                                ♻️ Producto CampoLab
                            </span>

                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-5">
                                {producto.nombre}
                            </h1>

                            <p className="text-gray-600 leading-7 mb-7">
                                {producto.descripcion ||
                                    "Este producto no tiene una descripción."}
                            </p>

                            <div className="border-t border-gray-200 pt-6">

                                {/* PRECIO */}
                                <p className="text-gray-500 text-sm mb-2">
                                    Precio
                                </p>

                                <p className="text-3xl font-bold text-green-700 mb-6">
                                    $
                                    {Number(
                                        producto.precio
                                    ).toLocaleString("es-CO")}
                                </p>

                                {/* STOCK */}
                                <p className="text-gray-500 text-sm mb-2">
                                    Disponibilidad
                                </p>

                                <p
                                    className={`font-bold mb-6 ${
                                        producto.stock > 0
                                            ? "text-green-700"
                                            : "text-red-600"
                                    }`}
                                >
                                    {producto.stock > 0
                                        ? `${producto.stock} unidades disponibles`
                                        : "Producto agotado"}
                                </p>

                                {/* ESTADO */}
                                <p className="text-gray-500 text-sm mb-2">
                                    Estado
                                </p>

                                <p
                                    className={`font-bold ${
                                        producto.estado
                                            ? "text-green-700"
                                            : "text-red-600"
                                    }`}
                                >
                                    {producto.estado
                                        ? "Producto disponible"
                                        : "Producto inactivo"}
                                </p>

                                {/* COMPRA */}
                                {producto.estado && producto.stock > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-200">

                                        <p className="text-gray-700 font-semibold mb-3">
                                            Cantidad
                                        </p>

                                        <div className="flex items-center gap-3 mb-5">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCantidad(
                                                        Math.max(
                                                            1,
                                                            cantidad - 1
                                                        )
                                                    )
                                                }
                                                className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold text-xl"
                                            >
                                                -
                                            </button>

                                            <span className="w-12 text-center text-lg font-bold">
                                                {cantidad}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCantidad(
                                                        Math.min(
                                                            producto.stock,
                                                            cantidad + 1
                                                        )
                                                    )
                                                }
                                                className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold text-xl"
                                            >
                                                +
                                            </button>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={agregarAlCarrito}
                                            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-6 rounded-xl transition"
                                        >
                                            🛒 Agregar al carrito
                                        </button>

                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}

export default DetalleProducto;