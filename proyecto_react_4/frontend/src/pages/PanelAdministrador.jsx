import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const API_URL = "https://campolab-production.up.railway.app";

function PanelAdministrador() {
    // ==========================================
    // ESTADOS
    // ==========================================

    const [usuarios, setUsuarios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [reporteDiario, setReporteDiario] = useState(null);
    const [resumenVentas, setResumenVentas] = useState([]);

    // PQR
    const [pqr, setPqr] = useState([]);
    const [cargandoPqr, setCargandoPqr] = useState(false);
    const [pqrEditando, setPqrEditando] = useState(null);

    // FILTROS DE FECHA
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const [seccionActiva, setSeccionActiva] = useState("dashboard");

    const [mostrarFormularioProducto, setMostrarFormularioProducto] =
        useState(false);

    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [productoEditando, setProductoEditando] = useState(null);

    const [busquedaFactura, setBusquedaFactura] = useState("");

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // ==========================================
    // TOKEN
    // ==========================================

    const obtenerToken = () => {
        return localStorage.getItem("token");
    };

    // ==========================================
    // CARGAR USUARIOS
    // ==========================================

    const cargarUsuarios = async () => {
        try {
            const token = obtenerToken();

            const respuesta = await fetch(`${API_URL}/usuarios/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || "No se pudieron obtener los usuarios."
                );
            }

            setUsuarios(datos);
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    // ==========================================
    // CARGAR PRODUCTOS
    // ==========================================

    const cargarProductos = async () => {
        try {
            const token = obtenerToken();

            const respuesta = await fetch(`${API_URL}/productos/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || "No se pudieron obtener los productos."
                );
            }

            setProductos(datos);
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    // ==========================================
    // CARGAR VENTAS
    // ==========================================

    const cargarVentas = async () => {
        try {
            const token = obtenerToken();

            const respuesta = await fetch(`${API_URL}/ventas/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || "No se pudieron obtener las ventas."
                );
            }

            setVentas(datos);
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    // ==========================================
    // CARGAR PQR
    // ==========================================

    const cargarPqr = async () => {
        try {
            setCargandoPqr(true);
            const token = obtenerToken();

            if (!token) {
                throw new Error("No se encontró el token de autenticación.");
            }

            const respuesta = await fetch(`${API_URL}/pqr/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || "No se pudieron obtener las PQR."
                );
            }

            setPqr(Array.isArray(datos) ? datos : []);
            setError("");
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setCargandoPqr(false);
        }
    };

    // ==========================================
    // ACTUALIZAR PQR
    // ==========================================

    const actualizarPqr = async (e) => {
        e.preventDefault();

        try {
            const token = obtenerToken();

            if (!pqrEditando) return;

            const respuesta = await fetch(
                `${API_URL}/pqr/${pqrEditando.id_pqr}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        estado: pqrEditando.estado,
                        respuesta: pqrEditando.respuesta?.trim() || null,
                    }),
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || "No se pudo actualizar la PQR."
                );
            }

            setMensaje("PQR actualizada correctamente.");
            setError("");
            setPqrEditando(null);
            await cargarPqr();
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // CARGAR REPORTE DIARIO
    // ==========================================

    const cargarReporteDiario = async () => {
        try {
            const token = obtenerToken();

            const respuesta = await fetch(
                `${API_URL}/ventas/reporte-diario`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail ||
                        "No se pudo obtener el reporte diario."
                );
            }

            setReporteDiario(datos);
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    // ==========================================
    // CARGAR RESUMEN DE VENTAS
    // ==========================================

    const cargarResumenVentas = async (
        inicio = fechaInicio,
        fin = fechaFin
    ) => {
        try {
            const token = obtenerToken();

            let url = `${API_URL}/ventas/resumen`;

            const parametros = new URLSearchParams();

            if (inicio) {
                parametros.append("fecha_inicio", inicio);
            }

            if (fin) {
                parametros.append("fecha_fin", fin);
            }

            if (parametros.toString()) {
                url += `?${parametros.toString()}`;
            }

            const respuesta = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail ||
                        "No se pudo obtener el resumen de ventas."
                );
            }

            setResumenVentas(datos.ventas || []);
            setError("");
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    // ==========================================
    // APLICAR FILTRO DE FECHAS
    // ==========================================

    const aplicarFiltroFechas = () => {
        setMensaje("");

        if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
            setError(
                "La fecha de inicio no puede ser posterior a la fecha final."
            );
            return;
        }

        setError("");

        cargarResumenVentas(fechaInicio, fechaFin);
    };

    // ==========================================
    // LIMPIAR FILTRO DE FECHAS
    // ==========================================

    const limpiarFiltroFechas = () => {
        setFechaInicio("");
        setFechaFin("");
        setError("");
        setMensaje("");

        cargarResumenVentas("", "");
    };

    // ==========================================
    // CARGAR DATOS
    // ==========================================

    useEffect(() => {
        cargarUsuarios();
        cargarProductos();
        cargarVentas();
        cargarReporteDiario();
        cargarResumenVentas("", "");
        cargarPqr();
    }, []);

    // ==========================================
    // CAMBIAR ESTADO DEL USUARIO
    // ==========================================

    const cambiarEstadoUsuario = async (usuario) => {
        const nuevoEstado = !usuario.estado;

        const confirmar = window.confirm(
            nuevoEstado
                ? `¿Deseas activar al usuario ${usuario.nombre} ${usuario.apellido}?`
                : `¿Deseas desactivar al usuario ${usuario.nombre} ${usuario.apellido}?`
        );

        if (!confirmar) return;

        try {
            const token = obtenerToken();

            const respuesta = await fetch(
                `${API_URL}/usuarios/${usuario.id_usuario}/estado?estado=${nuevoEstado}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail ||
                        "No se pudo cambiar el estado del usuario."
                );
            }

            setMensaje(
                nuevoEstado
                    ? "Usuario activado correctamente."
                    : "Usuario desactivado correctamente."
            );

            setError("");

            cargarUsuarios();
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // ELIMINAR USUARIO
    // ==========================================

    const eliminarUsuario = async (id) => {
        const confirmar = window.confirm(
            "¿Seguro que deseas eliminar este usuario?"
        );

        if (!confirmar) {
            return;
        }

        try {
            const token = obtenerToken();

            const respuesta = await fetch(`${API_URL}/usuarios/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || "No se pudo eliminar el usuario."
                );
            }

            setMensaje("Usuario eliminado correctamente.");
            setError("");

            cargarUsuarios();
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // EDITAR USUARIO
    // ==========================================

    const editarUsuario = async (e) => {
        e.preventDefault();

        try {
            const token = obtenerToken();

            const datosUsuario = {
                nombre: usuarioEditando.nombre,
                apellido: usuarioEditando.apellido,
                tipo_documento: usuarioEditando.tipo_documento,
                numero_documento: usuarioEditando.numero_documento,
                direccion: usuarioEditando.direccion,
                telefono: usuarioEditando.telefono,
                correo: usuarioEditando.correo,
                id_rol: usuarioEditando.id_rol,
                estado: usuarioEditando.estado,
            };

            const respuesta = await fetch(
                `${API_URL}/usuarios/${usuarioEditando.id_usuario}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(datosUsuario),
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || "No se pudo actualizar el usuario."
                );
            }

            setMensaje("Usuario actualizado correctamente.");
            setError("");
            setUsuarioEditando(null);

            cargarUsuarios();
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // CREAR PRODUCTO
    // ==========================================

    const crearProducto = async (e) => {
        e.preventDefault();

        try {
            const token = obtenerToken();

            const formulario = new FormData();

            formulario.append(
                "nombre",
                productoEditando.nombre
            );

            formulario.append(
                "descripcion",
                productoEditando.descripcion || ""
            );

            formulario.append(
                "precio",
                Number(productoEditando.precio)
            );

            formulario.append(
                "stock",
                Number(productoEditando.stock)
            );

            if (productoEditando.imagen) {
                formulario.append(
                    "imagen",
                    productoEditando.imagen
                );
            }

            const respuesta = await fetch(
                `${API_URL}/productos/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formulario,
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail ||
                        "No se pudo crear el producto."
                );
            }

            setMensaje("Producto creado correctamente.");
            setError("");

            setProductoEditando(null);
            setMostrarFormularioProducto(false);

            cargarProductos();
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // EDITAR PRODUCTO
    // ==========================================

    const editarProducto = async (e) => {
        e.preventDefault();

        try {
            const token = obtenerToken();

            const datosProducto = {
                nombre: productoEditando.nombre,
                descripcion: productoEditando.descripcion,
                precio: Number(productoEditando.precio),
                stock: Number(productoEditando.stock),
                imagen:
                    typeof productoEditando.imagen === "string"
                        ? productoEditando.imagen
                        : null,
                estado: productoEditando.estado,
            };

            const respuesta = await fetch(
                `${API_URL}/productos/${productoEditando.id_producto}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(datosProducto),
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail ||
                        "No se pudo actualizar el producto."
                );
            }

            setMensaje("Producto actualizado correctamente.");
            setError("");

            setProductoEditando(null);
            setMostrarFormularioProducto(false);

            cargarProductos();
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // ELIMINAR PRODUCTO
    // ==========================================

    const eliminarProducto = async (id) => {
        const confirmar = window.confirm(
            "¿Seguro que deseas eliminar este producto?"
        );

        if (!confirmar) {
            return;
        }

        try {
            const token = obtenerToken();

            const respuesta = await fetch(
                `${API_URL}/productos/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail ||
                        "No se pudo eliminar el producto."
                );
            }

            setMensaje("Producto eliminado correctamente.");
            setError("");

            cargarProductos();
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // NUEVO PRODUCTO
    // ==========================================

    const abrirNuevoProducto = () => {
        setProductoEditando({
            nombre: "",
            descripcion: "",
            precio: "",
            stock: "",
            imagen: null,
            estado: true,
        });

        setMostrarFormularioProducto(true);
    };

    // ==========================================
    // EDITAR PRODUCTO
    // ==========================================

    const abrirEditarProducto = (producto) => {
        setProductoEditando({
            ...producto,
        });

        setMostrarFormularioProducto(true);
    };

    // ==========================================
    // EDITAR USUARIO
    // ==========================================

    const abrirEditarUsuario = (usuario) => {
        setUsuarioEditando({
            ...usuario,
        });
    };

    // ==========================================
    // DESCARGAR FACTURA PDF
    // ==========================================

    const descargarFactura = async (idVenta, numeroFactura) => {
        try {
            const token = obtenerToken();

            const respuesta = await fetch(
                `${API_URL}/ventas/${idVenta}/factura/pdf`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!respuesta.ok) {
                const datos = await respuesta.json();

                throw new Error(
                    datos.detail ||
                        "No se pudo descargar la factura."
                );
            }

            const archivo = await respuesta.blob();

            const url = window.URL.createObjectURL(archivo);

            const enlace = document.createElement("a");

            enlace.href = url;

            enlace.download = `factura_${numeroFactura}.pdf`;

            document.body.appendChild(enlace);

            enlace.click();

            enlace.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // EXPORTAR EXCEL
    // ==========================================

    const exportarExcel = async () => {
        try {
            const token = obtenerToken();

            const respuesta = await fetch(
                `${API_URL}/ventas/exportar/excel`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!respuesta.ok) {
                const datos = await respuesta.json();

                throw new Error(
                    datos.detail ||
                        "No se pudo exportar el archivo Excel."
                );
            }

            const archivo = await respuesta.blob();

            const url = window.URL.createObjectURL(archivo);

            const enlace = document.createElement("a");

            enlace.href = url;

            enlace.download = "ventas_campolab.xlsx";

            document.body.appendChild(enlace);

            enlace.click();

            enlace.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // EXPORTAR TODAS LAS VENTAS A PDF
    // ==========================================

    const exportarVentasPDF = async () => {
        try {
            const token = obtenerToken();

            const respuesta = await fetch(
                `${API_URL}/ventas/exportar/pdf`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!respuesta.ok) {
                const datos = await respuesta.json();

                throw new Error(
                    datos.detail ||
                        "No se pudo exportar el reporte en PDF."
                );
            }

            const archivo = await respuesta.blob();
            const url = window.URL.createObjectURL(archivo);
            const enlace = document.createElement("a");

            enlace.href = url;
            enlace.download = "reporte_ventas_campolab.pdf";

            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // EXPORTAR REPORTE DIARIO A PDF
    // ==========================================

    const exportarReporteDiarioPDF = async () => {
        try {
            const token = obtenerToken();

            const respuesta = await fetch(
                `${API_URL}/ventas/reporte-diario/pdf`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!respuesta.ok) {
                const datos = await respuesta.json();

                throw new Error(
                    datos.detail ||
                        "No se pudo exportar el reporte diario en PDF."
                );
            }

            const archivo = await respuesta.blob();
            const url = window.URL.createObjectURL(archivo);
            const enlace = document.createElement("a");

            enlace.href = url;
            enlace.download = "reporte_diario_campolab.pdf";

            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            setError(error.message);
            setMensaje("");
        }
    };

    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioActivo");
        localStorage.removeItem("recordarme");

        navigate("/login");
    };

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    const usuariosActivos = usuarios.filter(
        (usuario) => usuario.estado
    ).length;

    const productosActivos = productos.filter(
        (producto) => producto.estado
    ).length;

    const productosStockBajo = productos.filter(
        (producto) => Number(producto.stock) <= 5
    ).length;

    const totalVentas = ventas.length;

    const totalVendido = ventas.reduce(
        (total, venta) =>
            total + Number(venta.total || 0),
        0
    );

    const ventasFiltradas = ventas.filter((venta) =>
        (venta.numero_factura || "")
            .toLowerCase()
            .includes(busquedaFactura.toLowerCase())
    );

    // ==========================================
    // FORMATO DE DINERO
    // ==========================================

    const formatoDinero = (valor) => {
        return Number(valor || 0).toLocaleString(
            "es-CO",
            {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }
        );
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 flex flex-col">

                <div className="px-6 py-7 border-b border-gray-700">

                    <h1 className="text-2xl font-bold text-green-400">
                        CampoLab
                    </h1>

                    <p className="text-gray-400 text-sm mt-1">
                        Panel administrativo
                    </p>

                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">

                    {/* DASHBOARD */}

                    <button
                        onClick={() =>
                            setSeccionActiva("dashboard")
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                            seccionActiva === "dashboard"
                                ? "bg-green-700 text-white"
                                : "text-gray-300 hover:bg-gray-800"
                        }`}
                    >
                        📊
                        <span>Dashboard</span>
                    </button>

                    {/* USUARIOS */}

                    <button
                        onClick={() =>
                            setSeccionActiva("usuarios")
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                            seccionActiva === "usuarios"
                                ? "bg-green-700 text-white"
                                : "text-gray-300 hover:bg-gray-800"
                        }`}
                    >
                        👥
                        <span>Usuarios</span>
                    </button>

                    {/* PRODUCTOS */}

                    <button
                        onClick={() =>
                            setSeccionActiva("productos")
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                            seccionActiva === "productos"
                                ? "bg-green-700 text-white"
                                : "text-gray-300 hover:bg-gray-800"
                        }`}
                    >
                        📦
                        <span>Productos</span>
                    </button>

                    {/* VENTAS */}

                    <button
                        onClick={() => {
                            setSeccionActiva("ventas");
                            cargarVentas();
                            cargarReporteDiario();
                            cargarResumenVentas();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                            seccionActiva === "ventas"
                                ? "bg-green-700 text-white"
                                : "text-gray-300 hover:bg-gray-800"
                        }`}
                    >
                        🧾
                        <span>Ventas</span>
                    </button>

                    {/* PQR */}

                    <button
                        onClick={() => {
                            setSeccionActiva("pqr");
                            setUsuarioEditando(null);
                            setProductoEditando(null);
                            setMostrarFormularioProducto(false);
                            setPqrEditando(null);
                            setMensaje("");
                            setError("");
                            cargarPqr();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                            seccionActiva === "pqr"
                                ? "bg-green-700 text-white"
                                : "text-gray-300 hover:bg-gray-800"
                        }`}
                    >
                        📝
                        <span>PQR</span>
                    </button>

                    {/* VER PÁGINA */}

                    <button
                        onClick={() => navigate("/")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-300 hover:bg-gray-800 transition"
                    >
                        🌐
                        <span>Ver página</span>
                    </button>

                </nav>

                <div className="p-4 border-t border-gray-700">

                    <div className="px-4 py-3 mb-3 bg-gray-800 rounded-xl">

                        <p className="text-sm text-gray-400">
                            Sesión iniciada como
                        </p>

                        <p className="font-semibold mt-1">
                            Administrador
                        </p>

                    </div>

                    <button
                        onClick={cerrarSesion}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
                    >
                        🚪
                        <span>Cerrar sesión</span>
                    </button>

                </div>

            </aside>

            {/* ==========================================
                CONTENIDO PRINCIPAL
            ========================================== */}

            <main className="ml-64 flex-1 min-h-screen p-8">

                <header className="mb-8">

                    <p className="text-sm text-green-700 font-semibold uppercase tracking-wide">
                        Administración
                    </p>

                    <h2 className="text-3xl font-bold text-gray-900 mt-1">
                        {seccionActiva === "ventas"
                            ? "Ventas"
                            : seccionActiva === "usuarios"
                                ? "Usuarios"
                                : seccionActiva === "productos"
                                    ? "Productos"
                                    : "Dashboard"}
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Bienvenido al panel administrativo de CampoLab.
                    </p>

                </header>

                {/* MENSAJES */}

                {mensaje && (
                    <div className="mb-6 bg-green-100 border border-green-300 text-green-800 px-5 py-3 rounded-xl">
                        {mensaje}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-300 text-red-800 px-5 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {/* ==========================================
                    DASHBOARD
                ========================================== */}

                {seccionActiva === "dashboard" && (
                    <>

                        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

                            {/* USUARIOS */}

                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-gray-500 text-sm">
                                            Usuarios registrados
                                        </p>

                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {usuarios.length}
                                        </p>

                                    </div>

                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                        👥
                                    </div>

                                </div>

                                <p className="text-green-600 text-sm mt-4">
                                    {usuariosActivos} usuarios activos
                                </p>

                            </div>

                            {/* PRODUCTOS */}

                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-gray-500 text-sm">
                                            Productos
                                        </p>

                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {productos.length}
                                        </p>

                                    </div>

                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                                        📦
                                    </div>

                                </div>

                                <p className="text-green-600 text-sm mt-4">
                                    {productosActivos} productos activos
                                </p>

                            </div>

                            {/* STOCK */}

                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-gray-500 text-sm">
                                            Stock bajo
                                        </p>

                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {productosStockBajo}
                                        </p>

                                    </div>

                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                                        ⚠️
                                    </div>

                                </div>

                                <p className="text-gray-500 text-sm mt-4">
                                    Productos con 5 unidades o menos
                                </p>

                            </div>

                            {/* VENTAS */}

                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-gray-500 text-sm">
                                            Total recaudado
                                        </p>

                                        <p className="text-2xl font-bold text-green-600 mt-2">
                                            {formatoDinero(totalVendido)}
                                        </p>

                                    </div>

                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                                        💰
                                    </div>

                                </div>

                                <p className="text-gray-500 text-sm mt-4">
                                    {totalVentas} ventas registradas
                                </p>

                            </div>

                        </section>

                        {/* ==========================================
                            FILTRO DE FECHAS
                        ========================================== */}

                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">

                            <div className="mb-5">

                                <h3 className="text-xl font-bold text-gray-900">
                                    🔎 Filtrar estadísticas
                                </h3>

                                <p className="text-gray-500 text-sm mt-1">
                                    Selecciona un rango de fechas para
                                    consultar las ventas.
                                </p>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

                                {/* FECHA INICIO */}

                                <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fecha de inicio
                                    </label>

                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) =>
                                            setFechaInicio(
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                                    />

                                </div>

                                {/* FECHA FIN */}

                                <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fecha de fin
                                    </label>

                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) =>
                                            setFechaFin(
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                                    />

                                </div>

                                {/* APLICAR */}

                                <button
                                    type="button"
                                    onClick={aplicarFiltroFechas}
                                    className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-3 rounded-xl transition"
                                >
                                    🔍 Aplicar filtro
                                </button>

                                {/* LIMPIAR */}

                                <button
                                    type="button"
                                    onClick={limpiarFiltroFechas}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-3 rounded-xl transition"
                                >
                                    🔄 Limpiar filtro
                                </button>

                            </div>

                            {(fechaInicio || fechaFin) && (
                                <p className="text-sm text-gray-500 mt-4">
                                    {fechaInicio && (
                                        <>
                                            Desde:{" "}
                                            <strong>
                                                {fechaInicio}
                                            </strong>
                                        </>
                                    )}

                                    {fechaInicio && fechaFin && " — "}

                                    {fechaFin && (
                                        <>
                                            Hasta:{" "}
                                            <strong>
                                                {fechaFin}
                                            </strong>
                                        </>
                                    )}
                                </p>
                            )}

                        </section>

                        {/* ==========================================
                            GRÁFICOS DE VENTAS
                        ========================================== */}

                        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

                            {/* GRÁFICO DE BARRAS */}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                                <div className="mb-6">

                                    <h3 className="text-xl font-bold text-gray-900">
                                        📊 Ventas por día
                                    </h3>

                                    <p className="text-gray-500 text-sm mt-1">
                                        Cantidad de ventas registradas por fecha.
                                    </p>

                                </div>

                                <div className="w-full h-80">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart data={resumenVentas}>

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />

                                            <XAxis
                                                dataKey="fecha"
                                            />

                                            <YAxis />

                                            <Tooltip />

                                            <Legend />

                                            <Bar
                                                dataKey="cantidad_ventas"
                                                name="Ventas"
                                                fill="#16a34a"
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>

                            {/* GRÁFICO DE LÍNEA */}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                                <div className="mb-6">

                                    <h3 className="text-xl font-bold text-gray-900">
                                        📈 Total recaudado
                                    </h3>

                                    <p className="text-gray-500 text-sm mt-1">
                                        Evolución del Total recaudado por día.
                                    </p>

                                </div>

                                <div className="w-full h-80">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <LineChart data={resumenVentas}>

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />

                                            <XAxis
                                                dataKey="fecha"
                                            />

                                            <YAxis />

                                            <Tooltip
                                                formatter={(valor) =>
                                                    formatoDinero(valor)
                                                }
                                            />

                                            <Legend />

                                            <Line
                                                type="monotone"
                                                dataKey="total_vendido"
                                                name="Total recaudado"
                                                stroke="#16a34a"
                                                strokeWidth={3}
                                            />

                                        </LineChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>

                        </section>

                        {/* ACCESOS RÁPIDOS */}

                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <button
                                onClick={() =>
                                    setSeccionActiva("usuarios")
                                }
                                className="bg-white rounded-2xl shadow-sm p-8 text-left hover:shadow-md transition border border-gray-100"
                            >

                                <div className="text-4xl mb-4">
                                    👥
                                </div>

                                <h3 className="text-xl font-bold text-gray-900">
                                    Gestionar usuarios
                                </h3>

                                <p className="text-gray-500 mt-2">
                                    Consulta, edita, cambia el estado y elimina
                                    usuarios registrados en CampoLab.
                                </p>

                                <p className="text-green-700 font-semibold mt-5">
                                    Ver usuarios →
                                </p>

                            </button>

                            <button
                                onClick={() =>
                                    setSeccionActiva("productos")
                                }
                                className="bg-white rounded-2xl shadow-sm p-8 text-left hover:shadow-md transition border border-gray-100"
                            >

                                <div className="text-4xl mb-4">
                                    📦
                                </div>

                                <h3 className="text-xl font-bold text-gray-900">
                                    Gestionar productos
                                </h3>

                                <p className="text-gray-500 mt-2">
                                    Administra el inventario y los productos
                                    disponibles.
                                </p>

                                <p className="text-green-700 font-semibold mt-5">
                                    Ver productos →
                                </p>

                            </button>

                            <button
                                onClick={() => {
                                    setSeccionActiva("pqr");
                                    setPqrEditando(null);
                                    setMensaje("");
                                    setError("");
                                    cargarPqr();
                                }}
                                className="bg-white rounded-2xl shadow-sm p-8 text-left hover:shadow-md transition border border-gray-100"
                            >
                                <div className="text-4xl mb-4">
                                    📝
                                </div>

                                <h3 className="text-xl font-bold text-gray-900">
                                    Gestionar PQR
                                </h3>

                                <p className="text-gray-500 mt-2">
                                    Atiende peticiones, quejas, reclamos y
                                    sugerencias de los clientes.
                                </p>

                                <p className="text-green-700 font-semibold mt-5">
                                    Ver PQR →
                                </p>
                            </button>

                            <button
                                onClick={() => {
                                    setSeccionActiva("ventas");
                                    cargarVentas();
                                    cargarReporteDiario();
                                    cargarResumenVentas();
                                }}
                                className="bg-white rounded-2xl shadow-sm p-8 text-left hover:shadow-md transition border border-gray-100"
                            >

                                <div className="text-4xl mb-4">
                                    🧾
                                </div>

                                <h3 className="text-xl font-bold text-gray-900">
                                    Gestionar ventas
                                </h3>

                                <p className="text-gray-500 mt-2">
                                    Consulta las ventas, facturas y reportes
                                    realizados en CampoLab.
                                </p>

                                <p className="text-green-700 font-semibold mt-5">
                                    Ver ventas →
                                </p>

                            </button>

                        </section>

                    </>
                )}

                {/* ==========================================
                    USUARIOS
                ========================================== */}

                {seccionActiva === "usuarios" && (
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100">

                        <div className="p-6 border-b border-gray-100">

                            <h3 className="text-2xl font-bold text-gray-900">
                                👥 Gestión de usuarios
                            </h3>

                            <p className="text-gray-500 mt-1">
                                Administra los usuarios registrados.
                            </p>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead>

                                    <tr className="bg-gray-50 text-left">

                                        <th className="p-4">ID</th>
                                        <th className="p-4">Nombre</th>
                                        <th className="p-4">Correo</th>
                                        <th className="p-4">Documento</th>
                                        <th className="p-4">Rol</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4">Acciones</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {usuarios.map((usuario) => (

                                        <tr
                                            key={usuario.id_usuario}
                                            className="border-t border-gray-100 hover:bg-gray-50"
                                        >

                                            <td className="p-4">
                                                {usuario.id_usuario}
                                            </td>

                                            <td className="p-4 font-semibold">
                                                {usuario.nombre}{" "}
                                                {usuario.apellido}
                                            </td>

                                            <td className="p-4">
                                                {usuario.correo}
                                            </td>

                                            <td className="p-4">
                                                {usuario.tipo_documento}{" "}
                                                {usuario.numero_documento}
                                            </td>

                                            <td className="p-4">

                                                {usuario.id_rol === 1
                                                    ? "Administrador"
                                                    : usuario.id_rol === 2
                                                        ? "Empleado"
                                                        : "Cliente"}

                                            </td>

                                            <td className="p-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        usuario.estado
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {usuario.estado
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </span>

                                            </td>

                                            <td className="p-4">

                                                <div className="flex gap-2 flex-wrap">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirEditarUsuario(
                                                                usuario
                                                            )
                                                        }
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            cambiarEstadoUsuario(
                                                                usuario
                                                            )
                                                        }
                                                        className={`text-white px-3 py-2 rounded-lg ${
                                                            usuario.estado
                                                                ? "bg-yellow-600 hover:bg-yellow-700"
                                                                : "bg-green-600 hover:bg-green-700"
                                                        }`}
                                                    >
                                                        {usuario.estado
                                                            ? "Desactivar"
                                                            : "Activar"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            eliminarUsuario(
                                                                usuario.id_usuario
                                                            )
                                                        }
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                                                    >
                                                        Eliminar
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </section>
                )}

                {/* ==========================================
                    FORMULARIO EDITAR USUARIO
                ========================================== */}

                {seccionActiva === "usuarios" &&
                    usuarioEditando && (
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">

                            <div className="flex justify-between items-center mb-6">

                                <div>

                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Editar usuario
                                    </h3>

                                    <p className="text-gray-500 mt-1">
                                        Modifica la información del usuario.
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        setUsuarioEditando(null)
                                    }
                                    className="text-red-600 font-semibold"
                                >
                                    ✕ Cerrar
                                </button>

                            </div>

                            <form
                                onSubmit={editarUsuario}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >

                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={usuarioEditando.nombre || ""}
                                    onChange={(e) =>
                                        setUsuarioEditando({
                                            ...usuarioEditando,
                                            nombre: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Apellido"
                                    value={usuarioEditando.apellido || ""}
                                    onChange={(e) =>
                                        setUsuarioEditando({
                                            ...usuarioEditando,
                                            apellido: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Tipo de documento"
                                    value={
                                        usuarioEditando.tipo_documento || ""
                                    }
                                    onChange={(e) =>
                                        setUsuarioEditando({
                                            ...usuarioEditando,
                                            tipo_documento: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Número de documento"
                                    value={
                                        usuarioEditando.numero_documento || ""
                                    }
                                    onChange={(e) =>
                                        setUsuarioEditando({
                                            ...usuarioEditando,
                                            numero_documento: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Dirección"
                                    value={usuarioEditando.direccion || ""}
                                    onChange={(e) =>
                                        setUsuarioEditando({
                                            ...usuarioEditando,
                                            direccion: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                />

                                <input
                                    type="text"
                                    placeholder="Teléfono"
                                    value={usuarioEditando.telefono || ""}
                                    onChange={(e) =>
                                        setUsuarioEditando({
                                            ...usuarioEditando,
                                            telefono: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                />

                                <input
                                    type="email"
                                    placeholder="Correo"
                                    value={usuarioEditando.correo || ""}
                                    onChange={(e) =>
                                        setUsuarioEditando({
                                            ...usuarioEditando,
                                            correo: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                    required
                                />

                                <select
                                    value={usuarioEditando.id_rol || ""}
                                    onChange={(e) =>
                                        setUsuarioEditando({
                                            ...usuarioEditando,
                                            id_rol: Number(e.target.value),
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                    required
                                >
                                    <option value="">
                                        Seleccionar rol
                                    </option>

                                    <option value="1">
                                        Administrador
                                    </option>

                                    <option value="2">
                                        Empleado
                                    </option>

                                    <option value="3">
                                        Cliente
                                    </option>
                                </select>

                                <select
                                    value={
                                        usuarioEditando.estado
                                            ? "true"
                                            : "false"
                                    }
                                    onChange={(e) =>
                                        setUsuarioEditando({
                                            ...usuarioEditando,
                                            estado:
                                                e.target.value === "true",
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                >
                                    <option value="true">
                                        Activo
                                    </option>

                                    <option value="false">
                                        Inactivo
                                    </option>
                                </select>

                                <div className="md:col-span-2">

                                    <button
                                        type="submit"
                                        className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl"
                                    >
                                        Guardar cambios
                                    </button>

                                </div>

                            </form>

                        </section>
                    )}

                {/* ==========================================
                    PRODUCTOS
                ========================================== */}

                {seccionActiva === "productos" && (
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100">

                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                            <div>

                                <h3 className="text-2xl font-bold text-gray-900">
                                    📦 Gestión de productos
                                </h3>

                                <p className="text-gray-500 mt-1">
                                    Administra el inventario de CampoLab.
                                </p>

                            </div>

                            <button
                                onClick={abrirNuevoProducto}
                                className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl font-semibold"
                            >
                                + Nuevo producto
                            </button>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead>

                                    <tr className="bg-gray-50 text-left">

                                        <th className="p-4">ID</th>
                                        <th className="p-4">Producto</th>
                                        <th className="p-4">Descripción</th>
                                        <th className="p-4">Precio</th>
                                        <th className="p-4">Stock</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4">Acciones</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {productos.map((producto) => (

                                        <tr
                                            key={producto.id_producto}
                                            className="border-t border-gray-100 hover:bg-gray-50"
                                        >

                                            <td className="p-4">
                                                {producto.id_producto}
                                            </td>

                                            <td className="p-4 font-semibold">
                                                {producto.nombre}
                                            </td>

                                            <td className="p-4 max-w-xs">
                                                {producto.descripcion}
                                            </td>

                                            <td className="p-4 font-semibold">
                                                $
                                                {Number(
                                                    producto.precio
                                                ).toLocaleString("es-CO")}
                                            </td>

                                            <td className="p-4">

                                                <span
                                                    className={`font-semibold ${
                                                        Number(
                                                            producto.stock
                                                        ) <= 5
                                                            ? "text-yellow-600"
                                                            : "text-gray-800"
                                                    }`}
                                                >
                                                    {producto.stock}
                                                </span>

                                            </td>

                                            <td className="p-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        producto.estado
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {producto.estado
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </span>

                                            </td>

                                            <td className="p-4">

                                                <div className="flex gap-2 flex-wrap">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/productos/${producto.id_producto}`
                                                            )
                                                        }
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
                                                    >
                                                        Ver producto
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirEditarProducto(
                                                                producto
                                                            )
                                                        }
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            eliminarProducto(
                                                                producto.id_producto
                                                            )
                                                        }
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                                                    >
                                                        Eliminar
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </section>
                )}

                {/* ==========================================
                    FORMULARIO PRODUCTO
                ========================================== */}

                {seccionActiva === "productos" &&
                    mostrarFormularioProducto &&
                    productoEditando && (

                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">

                            <div className="flex justify-between items-center mb-6">

                                <div>

                                    <h3 className="text-2xl font-bold text-gray-900">

                                        {productoEditando.id_producto
                                            ? "Editar producto"
                                            : "Nuevo producto"}

                                    </h3>

                                    <p className="text-gray-500 mt-1">
                                        Completa la información del producto.
                                    </p>

                                </div>

                                <button
                                    onClick={() => {
                                        setMostrarFormularioProducto(false);
                                        setProductoEditando(null);
                                    }}
                                    className="text-red-600 font-semibold"
                                >
                                    ✕ Cerrar
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    productoEditando.id_producto
                                        ? editarProducto
                                        : crearProducto
                                }
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >

                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={
                                        productoEditando.nombre || ""
                                    }
                                    onChange={(e) =>
                                        setProductoEditando({
                                            ...productoEditando,
                                            nombre: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                    required
                                />

                                <input
                                    type="number"
                                    placeholder="Precio"
                                    min="0"
                                    step="0.01"
                                    value={
                                        productoEditando.precio || ""
                                    }
                                    onChange={(e) =>
                                        setProductoEditando({
                                            ...productoEditando,
                                            precio: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                    required
                                />

                                <input
                                    type="number"
                                    placeholder="Stock"
                                    min="0"
                                    value={
                                        productoEditando.stock || ""
                                    }
                                    onChange={(e) =>
                                        setProductoEditando({
                                            ...productoEditando,
                                            stock: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                    required
                                />

                                <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Imagen del producto
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setProductoEditando({
                                                ...productoEditando,
                                                imagen:
                                                    e.target.files[0] ||
                                                    null,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-xl p-3"
                                    />

                                    {productoEditando.imagen &&
                                        typeof productoEditando.imagen !==
                                            "string" && (

                                            <p className="text-sm text-green-700 mt-2">
                                                Imagen seleccionada:{" "}
                                                {
                                                    productoEditando
                                                        .imagen.name
                                                }
                                            </p>

                                        )}

                                    {productoEditando.id_producto &&
                                        typeof productoEditando.imagen ===
                                            "string" &&
                                        productoEditando.imagen && (

                                            <p className="text-sm text-gray-500 mt-2">
                                                Imagen actual:{" "}
                                                {
                                                    productoEditando
                                                        .imagen
                                                }
                                            </p>

                                        )}

                                </div>

                                <textarea
                                    placeholder="Descripción"
                                    value={
                                        productoEditando.descripcion ||
                                        ""
                                    }
                                    onChange={(e) =>
                                        setProductoEditando({
                                            ...productoEditando,
                                            descripcion: e.target.value,
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3 md:col-span-2"
                                    rows="4"
                                />

                                <select
                                    value={
                                        productoEditando.estado
                                            ? "true"
                                            : "false"
                                    }
                                    onChange={(e) =>
                                        setProductoEditando({
                                            ...productoEditando,
                                            estado:
                                                e.target.value ===
                                                "true",
                                        })
                                    }
                                    className="border border-gray-300 rounded-xl p-3"
                                >

                                    <option value="true">
                                        Activo
                                    </option>

                                    <option value="false">
                                        Inactivo
                                    </option>

                                </select>

                                <div className="md:col-span-2">

                                    <button
                                        type="submit"
                                        className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl"
                                    >
                                        {productoEditando.id_producto
                                            ? "Guardar cambios"
                                            : "Crear producto"}
                                    </button>

                                </div>

                            </form>

                        </section>
                    )}

                {/* ==========================================
                    VENTAS
                ========================================== */}

                {seccionActiva === "ventas" && (
                    <section>

                        {/* ==========================================
                            TARJETAS DE VENTAS
                        ========================================== */}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                            {/* TOTAL VENTAS */}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-gray-500 text-sm">
                                            Ventas registradas
                                        </p>

                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {totalVentas}
                                        </p>

                                    </div>

                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                        🧾
                                    </div>

                                </div>

                            </div>

                            {/* TOTAL RECAUDADO*/}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-gray-500 text-sm">
                                            Total recaudado
                                        </p>

                                        <p className="text-2xl font-bold text-green-600 mt-2">
                                            {formatoDinero(totalVendido)}
                                        </p>

                                    </div>

                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                                        💰
                                    </div>

                                </div>

                            </div>

                            {/* REPORTE DIARIO */}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-gray-500 text-sm">
                                            Ventas de hoy
                                        </p>

                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {reporteDiario
                                                ? reporteDiario.cantidad_ventas
                                                : 0}
                                        </p>

                                    </div>

                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                                        📅
                                    </div>

                                </div>

                                <p className="text-green-600 text-sm mt-4">
                                    {reporteDiario
                                        ? formatoDinero(
                                              reporteDiario.total_vendido
                                          )
                                        : "$0"}
                                </p>

                            </div>

                        </div>

                        {/* ==========================================
                            REPORTE DEL DÍA
                        ========================================== */}

                        {reporteDiario && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

                                    <div>

                                        <h3 className="text-xl font-bold text-gray-900">
                                            📊 Reporte de ventas del día
                                        </h3>

                                        <p className="text-gray-500 mt-1">
                                            Resumen de las ventas registradas
                                            durante el día.
                                        </p>

                                    </div>

                                    <div className="text-sm text-gray-500">
                                        Fecha:{" "}
                                        <span className="font-semibold text-gray-800">
                                            {reporteDiario.fecha}
                                        </span>
                                    </div>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="bg-gray-50 rounded-xl p-5">

                                        <p className="text-gray-500 text-sm">
                                            Cantidad de ventas
                                        </p>

                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {reporteDiario.cantidad_ventas}
                                        </p>

                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-5">

                                        <p className="text-gray-500 text-sm">
                                           Total recaudado hoy
                                        </p>

                                        <p className="text-2xl font-bold text-green-600 mt-2">
                                            {formatoDinero(
                                                reporteDiario.total_vendido
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* ==========================================
                            LISTA DE VENTAS
                        ========================================== */}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

                            <div className="p-6 border-b border-gray-100">

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                                    <div>

                                        <h3 className="text-2xl font-bold text-gray-900">
                                            🧾 Historial de ventas
                                        </h3>

                                        <p className="text-gray-500 mt-1">
                                            Consulta las ventas y descarga sus
                                            facturas.
                                        </p>

                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">

                                        {/* BUSCAR FACTURA */}

                                        <input
                                            type="text"
                                            placeholder="Buscar factura..."
                                            value={busquedaFactura}
                                            onChange={(e) =>
                                                setBusquedaFactura(
                                                    e.target.value
                                                )
                                            }
                                            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                                        />

                                        {/* ACTUALIZAR */}

                                        <button
                                            onClick={() => {
                                                cargarVentas();
                                                cargarReporteDiario();
                                                cargarResumenVentas();
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                                        >
                                            🔄 Actualizar
                                        </button>

                                        {/* EXCEL */}

                                        <button
                                            onClick={exportarExcel}
                                            className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl font-semibold"
                                        >
                                            📥 Excel
                                        </button>

                                        <button
                                            onClick={exportarVentasPDF}
                                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
                                        >
                                            📄 PDF
                                        </button>

                                        <button
                                            onClick={exportarReporteDiarioPDF}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-semibold"
                                        >
                                            📅 PDF Diario
                                        </button>

                                    </div>

                                </div>

                            </div>

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead>

                                        <tr className="bg-gray-50 text-left">

                                            <th className="p-4">
                                                ID
                                            </th>

                                            <th className="p-4">
                                                Factura
                                            </th>

                                            <th className="p-4">
                                                Cliente
                                            </th>

                                            <th className="p-4">
                                                Usuario
                                            </th>

                                            <th className="p-4">
                                                Subtotal
                                            </th>

                                            <th className="p-4">
                                                Total
                                            </th>

                                            <th className="p-4">
                                                Estado
                                            </th>

                                            <th className="p-4">
                                                Acciones
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {ventasFiltradas.length > 0 ? (

                                            ventasFiltradas.map(
                                                (venta) => (

                                                    <tr
                                                        key={
                                                            venta.id_venta
                                                        }
                                                        className="border-t border-gray-100 hover:bg-gray-50"
                                                    >

                                                        <td className="p-4">
                                                            {
                                                                venta.id_venta
                                                            }
                                                        </td>

                                                        <td className="p-4 font-semibold text-green-700">
                                                            {
                                                                venta.numero_factura
                                                            }
                                                        </td>

                                                        <td className="p-4">
                                                            Cliente #{" "}
                                                            {
                                                                venta.id_cliente
                                                            }
                                                        </td>

                                                        <td className="p-4">
                                                            Usuario #{" "}
                                                            {
                                                                venta.id_usuario
                                                            }
                                                        </td>

                                                        <td className="p-4">
                                                            {formatoDinero(
                                                                venta.subtotal
                                                            )}
                                                        </td>

                                                        <td className="p-4 font-bold">
                                                            {formatoDinero(
                                                                venta.total
                                                            )}
                                                        </td>

                                                        <td className="p-4">

                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                    venta.estado
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-red-100 text-red-700"
                                                                }`}
                                                            >
                                                                {venta.estado
                                                                    ? "Activa"
                                                                    : "Inactiva"}
                                                            </span>

                                                        </td>

                                                        <td className="p-4">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    descargarFactura(
                                                                        venta.id_venta,
                                                                        venta.numero_factura
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                                                            >
                                                                📄 PDF
                                                            </button>

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        ) : (

                                            <tr>

                                                <td
                                                    colSpan="8"
                                                    className="p-8 text-center text-gray-500"
                                                >
                                                    No se encontraron ventas.
                                                </td>

                                            </tr>

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </section>
                )}

                {/* ==========================================
                    PQR
                ========================================== */}

                {seccionActiva === "pqr" && (
                    <section>
                        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p className="text-sm text-green-700 font-semibold uppercase tracking-wide">
                                    Administración / PQR
                                </p>

                                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                    Gestión de PQR
                                </h3>

                                <p className="text-gray-500 mt-2">
                                    Atiende y responde las peticiones, quejas,
                                    reclamos y sugerencias de los clientes.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cargarPqr}
                                disabled={cargandoPqr}
                                className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold"
                            >
                                {cargandoPqr
                                    ? "Actualizando..."
                                    : "🔄 Actualizar PQR"}
                            </button>
                        </div>

                        {cargandoPqr ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                                <p className="text-gray-500">
                                    Cargando PQR...
                                </p>
                            </div>
                        ) : pqr.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                                <div className="text-5xl mb-4">📝</div>

                                <h4 className="text-xl font-bold text-gray-900">
                                    No hay PQR registradas
                                </h4>

                                <p className="text-gray-500 mt-2">
                                    Las PQR creadas por los clientes aparecerán
                                    aquí.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {pqr.map((solicitud) => (
                                    <div
                                        key={solicitud.id_pqr}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                                    >
                                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h4 className="text-xl font-bold text-gray-900">
                                                        {solicitud.asunto}
                                                    </h4>

                                                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                                        {solicitud.tipo}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-500 mt-2">
                                                    PQR #{solicitud.id_pqr}
                                                </p>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Cliente #{solicitud.id_usuario}
                                                </p>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {solicitud.fecha_creacion
                                                        ? new Date(
                                                              solicitud.fecha_creacion
                                                          ).toLocaleString("es-CO")
                                                        : "Sin fecha"}
                                                </p>
                                            </div>

                                            <span
                                                className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                                                    solicitud.estado === "Pendiente"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : solicitud.estado === "En proceso"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : solicitud.estado === "Resuelto"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {solicitud.estado}
                                            </span>
                                        </div>

                                        <div className="mt-5">
                                            <p className="text-sm font-semibold text-gray-800 mb-2">
                                                Descripción del cliente
                                            </p>

                                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 whitespace-pre-wrap">
                                                {solicitud.descripcion}
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <p className="text-sm font-semibold text-gray-800 mb-2">
                                                Respuesta
                                            </p>

                                            {solicitud.respuesta ? (
                                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 whitespace-pre-wrap">
                                                    {solicitud.respuesta}
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700">
                                                    Esta PQR todavía no tiene
                                                    respuesta.
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPqrEditando({
                                                        ...solicitud,
                                                        respuesta:
                                                            solicitud.respuesta || "",
                                                    })
                                                }
                                                className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl font-semibold"
                                            >
                                                ✏️ Responder / Gestionar
                                            </button>
                                        </div>

                                        {pqrEditando?.id_pqr === solicitud.id_pqr && (
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <h4 className="text-xl font-bold text-gray-900 mb-5">
                                                    Gestionar PQR #{solicitud.id_pqr}
                                                </h4>

                                                <form
                                                    onSubmit={actualizarPqr}
                                                    className="space-y-5"
                                                >
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Estado
                                                        </label>

                                                        <select
                                                            value={pqrEditando.estado}
                                                            onChange={(e) =>
                                                                setPqrEditando({
                                                                    ...pqrEditando,
                                                                    estado: e.target.value,
                                                                })
                                                            }
                                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                                                        >
                                                            <option value="Pendiente">
                                                                Pendiente
                                                            </option>
                                                            <option value="En proceso">
                                                                En proceso
                                                            </option>
                                                            <option value="Resuelto">
                                                                Resuelto
                                                            </option>
                                                            <option value="Cerrado">
                                                                Cerrado
                                                            </option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Respuesta al cliente
                                                        </label>

                                                        <textarea
                                                            rows="6"
                                                            value={pqrEditando.respuesta || ""}
                                                            onChange={(e) =>
                                                                setPqrEditando({
                                                                    ...pqrEditando,
                                                                    respuesta: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Escribe la respuesta para el cliente..."
                                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                                        />
                                                    </div>

                                                    <div className="flex flex-wrap gap-3">
                                                        <button
                                                            type="submit"
                                                            className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold"
                                                        >
                                                            💾 Guardar cambios
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setPqrEditando(null)}
                                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

            </main>

        </div>
    );
}

export default PanelAdministrador;