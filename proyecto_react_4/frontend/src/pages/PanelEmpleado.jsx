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

function PanelEmpleado() {
  const navigate = useNavigate();

  // =========================
  // ESTADOS
  // =========================

  const [seccionActiva, setSeccionActiva] = useState("dashboard");

  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);

  // VENTAS
  const [ventas, setVentas] = useState([]);
  const [reporteDiario, setReporteDiario] = useState(null);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [busquedaFactura, setBusquedaFactura] = useState("");

  // RESUMEN DE VENTAS
  const [resumenVentas, setResumenVentas] = useState([]);
  const [cargandoResumenVentas, setCargandoResumenVentas] = useState(false);

  // FILTROS DE FECHA
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // PQR
  const [pqr, setPqr] = useState([]);
  const [cargandoPqr, setCargandoPqr] = useState(false);
  const [pqrEditando, setPqrEditando] = useState(null);

  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);

  const [mostrarFormularioProducto, setMostrarFormularioProducto] =
    useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  // =========================
  // TOKEN
  // =========================

  const obtenerToken = () => {
    return localStorage.getItem("token");
  };

  // =========================
  // MENSAJES DE ERROR
  // =========================

  const obtenerMensajeError = async (respuesta) => {
    try {
      const data = await respuesta.json();

      if (typeof data.detail === "string") {
        return data.detail;
      }

      if (Array.isArray(data.detail)) {
        return data.detail
          .map((error) => error.msg || "Error de validación")
          .join(", ");
      }

      return "Ocurrió un error en la solicitud.";
    } catch {
      return "Ocurrió un error en la solicitud.";
    }
  };

  // =========================
  // CARGAR USUARIOS
  // =========================

  const cargarUsuarios = async () => {
    try {
      setCargandoUsuarios(true);
      setError("");

      const token = obtenerToken();

      const respuesta = await fetch(`${API_URL}/usuarios/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const data = await respuesta.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  // =========================
  // CARGAR PRODUCTOS
  // =========================

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);
      setError("");

      const token = obtenerToken();

      const respuesta = await fetch(`${API_URL}/productos/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const data = await respuesta.json();
      setProductos(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setCargandoProductos(false);
    }
  };

  // =========================
  // CARGAR VENTAS
  // =========================

  const cargarVentas = async () => {
    try {
      setCargandoVentas(true);
      setError("");

      const token = obtenerToken();

      const respuesta = await fetch(`${API_URL}/ventas/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const data = await respuesta.json();

      setVentas(Array.isArray(data) ? data : data.ventas || []);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setCargandoVentas(false);
    }
  };

  // =========================
  // CARGAR PQR
  // =========================

  const cargarPqr = async () => {
    try {
      setCargandoPqr(true);
      setError("");

      const token = obtenerToken();

      if (!token) {
        setError("No se encontró el token de autenticación.");
        return;
      }

      const respuesta = await fetch(`${API_URL}/pqr/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const data = await respuesta.json();

      setPqr(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar las PQR:", error);
      setError(error.message);
    } finally {
      setCargandoPqr(false);
    }
  };

  // =========================
  // ACTUALIZAR PQR
  // =========================

  const actualizarPqr = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMensaje("");

      const token = obtenerToken();

      if (!token) {
        setError("No se encontró el token de autenticación.");
        return;
      }

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
            respuesta: pqrEditando.respuesta || null,
          }),
        }
      );

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      setMensaje("PQR actualizada correctamente.");
      setPqrEditando(null);

      await cargarPqr();
    } catch (error) {
      console.error("Error al actualizar la PQR:", error);
      setError(error.message);
    }
  };

  // =========================
  // CARGAR REPORTE DIARIO
  // =========================

  const cargarReporteDiario = async () => {
    try {
      setCargandoReporte(true);

      const token = obtenerToken();

      const respuesta = await fetch(
        `${API_URL}/ventas/reporte-diario`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const data = await respuesta.json();

      setReporteDiario(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setCargandoReporte(false);
    }
  };

  // =========================
  // CARGAR RESUMEN DE VENTAS
  // =========================

  const cargarResumenVentas = async (
    inicio = fechaInicio,
    fin = fechaFin
  ) => {
    try {
      setCargandoResumenVentas(true);
      setError("");

      const token = obtenerToken();

      const parametros = new URLSearchParams();

      if (inicio) {
        parametros.append("fecha_inicio", inicio);
      }

      if (fin) {
        parametros.append("fecha_fin", fin);
      }

      const url = parametros.toString()
        ? `${API_URL}/ventas/resumen?${parametros.toString()}`
        : `${API_URL}/ventas/resumen`;

      const respuesta = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const data = await respuesta.json();

      setResumenVentas(data.ventas || []);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setCargandoResumenVentas(false);
    }
  };

  // =========================
  // APLICAR FILTRO
  // =========================

  const aplicarFiltroFechas = () => {
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      setError(
        "La fecha inicial no puede ser posterior a la fecha final."
      );
      return;
    }

    setError("");
    cargarResumenVentas(fechaInicio, fechaFin);
  };

  // =========================
  // LIMPIAR FILTRO
  // =========================

  const limpiarFiltroFechas = () => {
    setFechaInicio("");
    setFechaFin("");
    setError("");
    cargarResumenVentas("", "");
  };

  // =========================
  // DESCARGAR FACTURA PDF
  // =========================

  const descargarFacturaPDF = async (idVenta) => {
    try {
      setError("");

      const token = obtenerToken();

      const respuesta = await fetch(
        `${API_URL}/ventas/${idVenta}/factura/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const blob = await respuesta.blob();

      const url = window.URL.createObjectURL(blob);

      const enlace = document.createElement("a");

      enlace.href = url;
      enlace.download = `factura-${idVenta}.pdf`;

      document.body.appendChild(enlace);

      enlace.click();

      enlace.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // =========================
  // EXPORTAR VENTAS A EXCEL
  // =========================

  const exportarVentasExcel = async () => {
    try {
      setError("");

      const token = obtenerToken();

      const respuesta = await fetch(
        `${API_URL}/ventas/exportar/excel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const blob = await respuesta.blob();

      const url = window.URL.createObjectURL(blob);

      const enlace = document.createElement("a");

      enlace.href = url;
      enlace.download = "ventas-campolab.xlsx";

      document.body.appendChild(enlace);

      enlace.click();

      enlace.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // =========================
  // EXPORTAR VENTAS A PDF
  // =========================

  const exportarVentasPDF = async () => {
    try {
      setError("");

      const token = obtenerToken();

      const respuesta = await fetch(
        `${API_URL}/ventas/exportar/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const blob = await respuesta.blob();

      const url = window.URL.createObjectURL(blob);

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
    }
  };

  // =========================
  // EXPORTAR REPORTE DIARIO A PDF
  // =========================

  const exportarReporteDiarioPDF = async () => {
    try {
      setError("");

      const token = obtenerToken();

      const respuesta = await fetch(
        `${API_URL}/ventas/reporte-diario/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      const blob = await respuesta.blob();

      const url = window.URL.createObjectURL(blob);

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
    }
  };

  // =========================
  // CARGAR DATOS
  // =========================

  useEffect(() => {
    cargarUsuarios();
    cargarProductos();
    cargarResumenVentas("", "");
  }, []);

  // =========================
  // EDITAR USUARIO
  // =========================

  const editarUsuario = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMensaje("");

      const token = obtenerToken();

      const respuesta = await fetch(
        `${API_URL}/usuarios/${usuarioEditando.id_usuario}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: usuarioEditando.nombre,
            apellido: usuarioEditando.apellido,
            tipo_documento: usuarioEditando.tipo_documento,
            numero_documento: usuarioEditando.numero_documento,
            direccion: usuarioEditando.direccion,
            telefono: usuarioEditando.telefono,
            correo: usuarioEditando.correo,
          }),
        }
      );

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      setMensaje("Usuario actualizado correctamente.");
      setUsuarioEditando(null);

      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // =========================
  // CREAR PRODUCTO
  // =========================

  const crearProducto = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMensaje("");

      const token = obtenerToken();
      const formulario = new FormData(e.target);

      const respuesta = await fetch(`${API_URL}/productos/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formulario,
      });

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      setMensaje("Producto creado correctamente.");
      setMostrarFormularioProducto(false);

      e.target.reset();

      await cargarProductos();
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // =========================
  // EDITAR PRODUCTO
  // =========================

  const editarProducto = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMensaje("");

      const token = obtenerToken();
      const formulario = new FormData();

      formulario.append("nombre", productoEditando.nombre);
      formulario.append("descripcion", productoEditando.descripcion);
      formulario.append("precio", productoEditando.precio);
      formulario.append("stock", productoEditando.stock);

      if (productoEditando.imagenArchivo) {
        formulario.append("imagen", productoEditando.imagenArchivo);
      }

      const respuesta = await fetch(
        `${API_URL}/productos/${productoEditando.id_producto}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formulario,
        }
      );

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      setMensaje("Producto actualizado correctamente.");
      setProductoEditando(null);

      await cargarProductos();
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // =========================
  // ELIMINAR PRODUCTO
  // =========================

  const eliminarProducto = async (id) => {
    const confirmar = window.confirm(
      "¿Está seguro de que desea eliminar este producto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const token = obtenerToken();

      const respuesta = await fetch(`${API_URL}/productos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        const mensajeError = await obtenerMensajeError(respuesta);
        throw new Error(mensajeError);
      }

      setMensaje("Producto eliminado correctamente.");

      await cargarProductos();
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // =========================
  // ABRIR EDITAR USUARIO
  // =========================

  const abrirEditarUsuario = (usuario) => {
    setUsuarioEditando({ ...usuario });
    setSeccionActiva("usuarios");
    setMensaje("");
    setError("");
  };

  // =========================
  // NUEVO PRODUCTO
  // =========================

  const abrirNuevoProducto = () => {
    setProductoEditando(null);
    setMostrarFormularioProducto(true);
    setSeccionActiva("productos");
    setMensaje("");
    setError("");
  };

  // =========================
  // EDITAR PRODUCTO
  // =========================

  const abrirEditarProducto = (producto) => {
    setProductoEditando({
      ...producto,
      imagenArchivo: null,
    });

    setMostrarFormularioProducto(false);
    setSeccionActiva("productos");
    setMensaje("");
    setError("");
  };

  // =========================
  // CERRAR SESIÓN
  // =========================

  const cerrarSesion = () => {
    localStorage.removeItem("usuarioActivo");
    localStorage.removeItem("token");
    localStorage.removeItem("recordarme");

    window.dispatchEvent(new Event("usuarioActualizado"));

    navigate("/login");
  };

  // =========================
  // USUARIO ACTUAL
  // =========================

  const usuarioActual = JSON.parse(
    localStorage.getItem("usuarioActivo") || "null"
  );

  // =========================
  // ESTADÍSTICAS
  // =========================

  const usuariosActivos = usuarios.filter(
    (usuario) => usuario.estado === true || usuario.estado === 1
  ).length;

  const productosStockBajo = productos.filter(
    (producto) => Number(producto.stock) <= 5
  ).length;

  // =========================
  // VENTAS FILTRADAS
  // =========================

  const ventasFiltradas = ventas.filter((venta) => {
    if (!busquedaFactura.trim()) {
      return true;
    }

    return String(venta.numero_factura || "")
      .toLowerCase()
      .includes(busquedaFactura.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white flex">

      {/* =====================================================
          SIDEBAR VERTICAL
      ====================================================== */}

      <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 flex flex-col z-50">

        {/* LOGO */}

        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-green-400">
            CampoLab
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Panel de Empleado
          </p>
        </div>

        {/* MENÚ */}

        <nav className="flex-1 p-4 space-y-2">

          {/* DASHBOARD */}

          <button
            onClick={() => {
              setSeccionActiva("dashboard");
              setUsuarioEditando(null);
              setProductoEditando(null);
              setMostrarFormularioProducto(false);
              setPqrEditando(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
              seccionActiva === "dashboard"
                ? "bg-green-700 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </button>

          {/* USUARIOS */}

          <button
            onClick={() => {
              setSeccionActiva("usuarios");
              setUsuarioEditando(null);
              setProductoEditando(null);
              setMostrarFormularioProducto(false);
              setPqrEditando(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
              seccionActiva === "usuarios"
                ? "bg-green-700 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span>👥</span>
            <span>Usuarios</span>
          </button>

          {/* PRODUCTOS */}

          <button
            onClick={() => {
              setSeccionActiva("productos");
              setUsuarioEditando(null);
              setProductoEditando(null);
              setMostrarFormularioProducto(false);
              setPqrEditando(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
              seccionActiva === "productos"
                ? "bg-green-700 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span>📦</span>
            <span>Productos</span>
          </button>

          {/* VENTAS */}

          <button
            onClick={() => {
              setSeccionActiva("ventas");
              setUsuarioEditando(null);
              setProductoEditando(null);
              setMostrarFormularioProducto(false);
              setPqrEditando(null);
              setMensaje("");
              setError("");

              cargarVentas();
              cargarReporteDiario();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
              seccionActiva === "ventas"
                ? "bg-green-700 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span>🧾</span>
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
            <span>📝</span>
            <span>PQR</span>
          </button>

          {/* VER PÁGINA */}

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-300 hover:bg-gray-800 transition"
          >
            <span>🌐</span>
            <span>Ver página</span>
          </button>

        </nav>

        {/* USUARIO Y SESIÓN */}

        <div className="p-4 border-t border-gray-800">

          <div className="mb-4">

            <p className="text-sm font-semibold text-white">
              {usuarioActual?.nombre || "Empleado"}

              {usuarioActual?.apellido
                ? ` ${usuarioActual.apellido}`
                : ""}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Empleado
            </p>

          </div>

          <button
            onClick={cerrarSesion}
            className="w-full px-4 py-3 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition"
          >
            Cerrar sesión
          </button>

        </div>

      </aside>

      {/* =====================================================
          CONTENIDO DERECHO
      ====================================================== */}

      <main className="ml-64 flex-1 min-h-screen bg-white p-8 text-gray-900">

        {/* =================================================
            DASHBOARD
        ================================================== */}

        {seccionActiva === "dashboard" && (
          <>
            <div className="mb-8">

              <p className="text-sm text-green-600 mb-1">
                Empleado / Dashboard
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                Panel de Empleado
              </h2>

              <p className="text-gray-500 mt-2">
                Bienvenido al panel de empleado de CampoLab.
              </p>

            </div>

            {/* TARJETAS */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* TOTAL USUARIOS */}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Total usuarios
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {usuarios.length}
                    </p>

                  </div>

                  <div className="text-3xl">
                    👥
                  </div>

                </div>

              </div>

              {/* USUARIOS ACTIVOS */}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Usuarios activos
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {usuariosActivos}
                    </p>

                  </div>

                  <div className="text-3xl">
                    ✅
                  </div>

                </div>

              </div>

              {/* TOTAL PRODUCTOS */}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Total productos
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {productos.length}
                    </p>

                  </div>

                  <div className="text-3xl">
                    📦
                  </div>

                </div>

              </div>

              {/* STOCK BAJO */}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Stock bajo
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {productosStockBajo}
                    </p>

                  </div>

                  <div className="text-3xl">
                    ⚠️
                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                GRÁFICAS DE VENTAS
            ================================================== */}

            <div className="mt-8">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-2xl font-bold text-gray-900">
                    Estadísticas de ventas
                  </h3>

                  <p className="text-gray-500 mt-1">
                    Resumen de las ventas registradas en CampoLab.
                  </p>

                </div>

                <button
                  onClick={() => cargarResumenVentas()}
                  disabled={cargandoResumenVentas}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                >
                  {cargandoResumenVentas
                    ? "Actualizando..."
                    : "🔄 Actualizar"}
                </button>

              </div>

              {/* FILTROS */}

              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-5">

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha inicial
                    </label>

                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-green-500"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha final
                    </label>

                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-green-500"
                    />

                  </div>

                  <button
                    onClick={aplicarFiltroFechas}
                    className="px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    🔎 Aplicar filtro
                  </button>

                  <button
                    onClick={limpiarFiltroFechas}
                    className="px-5 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  >
                    🧹 Limpiar filtro
                  </button>

                </div>

                {(fechaInicio || fechaFin) && (
                  <p className="text-sm text-gray-500 mt-4">

                    <span className="font-medium text-gray-700">
                      Filtro:
                    </span>{" "}

                    {fechaInicio || "Desde el inicio"}

                    {" → "}

                    {fechaFin || "Hasta hoy"}

                  </p>
                )}

              </div>

              {/* GRÁFICAS */}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* CANTIDAD */}

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    Cantidad de ventas
                  </h4>

                  <div className="w-full h-80">

                    <ResponsiveContainer width="100%" height="100%">

                      <BarChart data={resumenVentas}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="fecha" />

                        <YAxis allowDecimals={false} />

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

                {/* TOTAL RECAUDADO */}

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    Total recaudado
                  </h4>

                  <div className="w-full h-80">

                    <ResponsiveContainer width="100%" height="100%">

                      <LineChart data={resumenVentas}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="fecha" />

                        <YAxis />

                        <Tooltip
                          formatter={(value) =>
                            `$${Number(value).toLocaleString("es-CO")}`
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

              </div>

            </div>

            {/* RESUMEN */}

            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Resumen
              </h3>

              <p className="text-gray-500">
                Desde este panel puedes consultar usuarios,
                administrar productos y revisar las ventas de
                CampoLab.
              </p>

            </div>

          </>
        )}

        {/* =================================================
            USUARIOS
        ================================================== */}

        {seccionActiva === "usuarios" && (
          <>
            <div className="mb-8">

              <p className="text-sm text-green-600 mb-1">
                Empleado / Usuarios
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                Gestión de usuarios
              </h2>

              <p className="text-gray-500 mt-2">
                Consulta y actualiza la información de los usuarios.
              </p>

            </div>

            {mensaje && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {mensaje}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

              <div className="p-6 border-b border-gray-200">

                <h3 className="text-xl font-semibold text-gray-900">
                  Usuarios registrados
                </h3>

              </div>

              {cargandoUsuarios ? (

                <div className="p-6 text-gray-500">
                  Cargando usuarios...
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Nombre
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Documento
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Correo
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Teléfono
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Acción
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {usuarios.map((usuario) => (

                        <tr
                          key={usuario.id_usuario}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >

                          <td className="px-6 py-4 text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {usuario.numero_documento}
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {usuario.correo}
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {usuario.telefono}
                          </td>

                          <td className="px-6 py-4">

                            <button
                              onClick={() =>
                                abrirEditarUsuario(usuario)
                              }
                              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                              Editar
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

            {usuarioEditando && (
              <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between mb-6">

                  <div>

                    <h3 className="text-xl font-semibold text-gray-900">
                      Editar usuario
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      Actualiza la información del usuario.
                    </p>

                  </div>

                  <button
                    onClick={() => setUsuarioEditando(null)}
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>

                </div>

                <form
                  onSubmit={editarUsuario}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                  <input
                    type="text"
                    value={usuarioEditando.nombre || ""}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        nombre: e.target.value,
                      })
                    }
                    placeholder="Nombre"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    type="text"
                    value={usuarioEditando.apellido || ""}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        apellido: e.target.value,
                      })
                    }
                    placeholder="Apellido"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    type="text"
                    value={usuarioEditando.tipo_documento || ""}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        tipo_documento: e.target.value,
                      })
                    }
                    placeholder="Tipo de documento"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    type="text"
                    value={usuarioEditando.numero_documento || ""}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        numero_documento: e.target.value,
                      })
                    }
                    placeholder="Número de documento"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    type="text"
                    value={usuarioEditando.direccion || ""}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        direccion: e.target.value,
                      })
                    }
                    placeholder="Dirección"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    type="text"
                    value={usuarioEditando.telefono || ""}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        telefono: e.target.value,
                      })
                    }
                    placeholder="Teléfono"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    type="email"
                    value={usuarioEditando.correo || ""}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        correo: e.target.value,
                      })
                    }
                    placeholder="Correo"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500 md:col-span-2"
                  />

                  <div className="md:col-span-2 flex gap-3">

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Guardar cambios
                    </button>

                    <button
                      type="button"
                      onClick={() => setUsuarioEditando(null)}
                      className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>

                  </div>

                </form>

              </div>
            )}

          </>
        )}

        {/* =================================================
            PRODUCTOS
        ================================================== */}

        {seccionActiva === "productos" && (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <p className="text-sm text-green-600 mb-1">
                  Empleado / Productos
                </p>

                <h2 className="text-3xl font-bold text-gray-900">
                  Gestión de productos
                </h2>

                <p className="text-gray-500 mt-2">
                  Administra los productos disponibles en CampoLab.
                </p>

              </div>

              <button
                onClick={abrirNuevoProducto}
                className="px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
              >
                + Nuevo producto
              </button>

            </div>

            {mensaje && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {mensaje}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {mostrarFormularioProducto && (
              <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between mb-6">

                  <div>

                    <h3 className="text-xl font-semibold text-gray-900">
                      Nuevo producto
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      Registra un nuevo producto.
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setMostrarFormularioProducto(false)
                    }
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>

                </div>

                <form
                  onSubmit={crearProducto}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                  <input
                    name="nombre"
                    type="text"
                    placeholder="Nombre del producto"
                    required
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    required
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    name="stock"
                    type="number"
                    placeholder="Stock"
                    required
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    name="imagen"
                    type="file"
                    accept="image/*"
                    className="bg-white border border-gray-300 text-gray-700 rounded-xl px-4 py-3"
                  />

                  <textarea
                    name="descripcion"
                    placeholder="Descripción"
                    rows="4"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500 md:col-span-2"
                  />

                  <div className="md:col-span-2 flex gap-3">

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Crear producto
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarFormularioProducto(false)
                      }
                      className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>

                  </div>

                </form>

              </div>
            )}

            {productoEditando && (
              <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between mb-6">

                  <div>

                    <h3 className="text-xl font-semibold text-gray-900">
                      Editar producto
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      Actualiza la información del producto.
                    </p>

                  </div>

                  <button
                    onClick={() => setProductoEditando(null)}
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>

                </div>

                <form
                  onSubmit={editarProducto}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                  <input
                    type="text"
                    value={productoEditando.nombre || ""}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        nombre: e.target.value,
                      })
                    }
                    placeholder="Nombre"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    type="number"
                    step="0.01"
                    value={productoEditando.precio || ""}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        precio: e.target.value,
                      })
                    }
                    placeholder="Precio"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    type="number"
                    value={productoEditando.stock || ""}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        stock: e.target.value,
                      })
                    }
                    placeholder="Stock"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        imagenArchivo: e.target.files[0],
                      })
                    }
                    className="bg-white border border-gray-300 text-gray-700 rounded-xl px-4 py-3"
                  />

                  <textarea
                    value={productoEditando.descripcion || ""}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        descripcion: e.target.value,
                      })
                    }
                    placeholder="Descripción"
                    rows="4"
                    className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500 md:col-span-2"
                  />

                  <div className="md:col-span-2 flex gap-3">

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Guardar cambios
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductoEditando(null)}
                      className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>

                  </div>

                </form>

              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

              <div className="p-6 border-b border-gray-200">

                <h3 className="text-xl font-semibold text-gray-900">
                  Productos registrados
                </h3>

              </div>

              {cargandoProductos ? (

                <div className="p-6 text-gray-500">
                  Cargando productos...
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Producto
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Precio
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Stock
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Acciones
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {productos.map((producto) => (

                        <tr
                          key={producto.id_producto}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-4">

                              {producto.imagen && (
                                <img
                                  src={`${API_URL}/uploads/${producto.imagen}`}
                                  alt={producto.nombre}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}

                              <div>

                                <p className="font-medium text-gray-900">
                                  {producto.nombre}
                                </p>

                                <p className="text-sm text-gray-500">
                                  {producto.descripcion}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-4 text-gray-900">
                            $
                            {Number(producto.precio).toLocaleString(
                              "es-CO"
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={
                                Number(producto.stock) <= 5
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600 font-semibold"
                              }
                            >
                              {producto.stock}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  navigate(
                                    `/productos/${producto.id_producto}`
                                  )
                                }
                                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                              >
                                Ver
                              </button>

                              <button
                                onClick={() =>
                                  abrirEditarProducto(producto)
                                }
                                className="px-3 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                              >
                                Editar
                              </button>

                              <button
                                onClick={() =>
                                  eliminarProducto(
                                    producto.id_producto
                                  )
                                }
                                className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
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

              )}

            </div>

          </>
        )}

        {/* =================================================
            VENTAS
        ================================================== */}

        {seccionActiva === "ventas" && (
          <>
            <div className="mb-8">

              <p className="text-sm text-green-600 mb-1">
                Empleado / Ventas
              </p>

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                <div>

                  <h2 className="text-3xl font-bold text-gray-900">
                    Gestión de ventas
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Consulta las ventas, facturas y reportes de CampoLab.
                  </p>

                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() => {
                      cargarVentas();
                      cargarReporteDiario();
                      cargarResumenVentas();
                    }}
                    disabled={
                      cargandoVentas ||
                      cargandoReporte ||
                      cargandoResumenVentas
                    }
                    className="px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                  >
                    🔄 Actualizar
                  </button>

                  <button
                    onClick={exportarVentasExcel}
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    📊 Exportar Excel
                  </button>

                  <button
                    onClick={exportarVentasPDF}
                    className="px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    📄 Exportar PDF
                  </button>

                  <button
                    onClick={exportarReporteDiarioPDF}
                    className="px-5 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
                  >
                    📅 PDF Diario
                  </button>

                </div>

              </div>

            </div>

            {/* MENSAJES */}

            {mensaje && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {mensaje}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {/* TARJETAS */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <p className="text-sm text-gray-500">
                  Ventas registradas
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {ventas.length}
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  Historial disponible
                </p>

              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <p className="text-sm text-gray-500">
                  Total recaudado
                </p>

                <p className="text-3xl font-bold text-green-600 mt-2">
                  $
                  {ventas
                    .reduce(
                      (total, venta) =>
                        total + Number(venta.total || 0),
                      0
                    )
                    .toLocaleString("es-CO")}
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  Según las ventas cargadas
                </p>

              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <p className="text-sm text-gray-500">
                  Ventas de hoy
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {reporteDiario?.cantidad_ventas || 0}
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  Reporte diario
                </p>

              </div>

            </div>

            {/* BUSCAR FACTURA */}

            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Buscar factura
              </h3>

              <div className="flex flex-col md:flex-row gap-4">

                <input
                  type="text"
                  value={busquedaFactura}
                  onChange={(e) =>
                    setBusquedaFactura(e.target.value)
                  }
                  placeholder="Ejemplo: FAC-000001"
                  className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                />

                <button
                  onClick={() => setBusquedaFactura("")}
                  className="px-5 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  Limpiar
                </button>

              </div>

            </div>

            {/* REPORTE DIARIO */}

            <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                <div>

                  <h3 className="text-xl font-semibold text-gray-900">
                    Reporte diario
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    Resumen de las ventas realizadas durante el día.
                  </p>

                </div>

                <button
                  onClick={cargarReporteDiario}
                  disabled={cargandoReporte}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {cargandoReporte
                    ? "Cargando..."
                    : "🔄 Actualizar reporte"}
                </button>

              </div>

              {reporteDiario ? (

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="bg-gray-50 rounded-xl p-5">

                    <p className="text-sm text-gray-500">
                      Fecha
                    </p>

                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {reporteDiario.fecha}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-5">

                    <p className="text-sm text-gray-500">
                      Cantidad de ventas
                    </p>

                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {reporteDiario.cantidad_ventas || 0}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-5">

                    <p className="text-sm text-gray-500">
                      Total vendido
                    </p>

                    <p className="text-2xl font-bold text-green-600 mt-2">
                      $
                      {Number(
                        reporteDiario.total_vendido || 0
                      ).toLocaleString("es-CO")}
                    </p>

                  </div>

                </div>

              ) : (

                <p className="text-gray-500">
                  No hay información del reporte diario.
                </p>

              )}

            </div>

            {/* HISTORIAL DE VENTAS */}

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

              <div className="p-6 border-b border-gray-200">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <h3 className="text-xl font-semibold text-gray-900">
                      Historial de ventas
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      Consulta las facturas y productos vendidos.
                    </p>

                  </div>

                  <span className="text-sm text-gray-500">
                    {ventasFiltradas.length} venta(s)
                  </span>

                </div>

              </div>

              {cargandoVentas ? (

                <div className="p-8 text-gray-500">
                  Cargando ventas...
                </div>

              ) : ventasFiltradas.length === 0 ? (

                <div className="p-8 text-center">

                  <div className="text-5xl mb-4">
                    🧾
                  </div>

                  <p className="text-gray-500">
                    No se encontraron ventas.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Factura
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Cliente
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Fecha
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Total
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Estado
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Acción
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {ventasFiltradas.map((venta) => (

                        <tr
                          key={venta.id_venta}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >

                          <td className="px-6 py-4">

                            <span className="font-semibold text-gray-900">
                              {venta.numero_factura ||
                                `VENTA-${venta.id_venta}`}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            Cliente #{venta.id_cliente}
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {venta.fecha_creacion
                              ? new Date(
                                  venta.fecha_creacion
                                ).toLocaleString("es-CO")
                              : "Sin fecha"}
                          </td>

                          <td className="px-6 py-4">

                            <span className="font-semibold text-green-600">
                              $
                              {Number(
                                venta.total || 0
                              ).toLocaleString("es-CO")}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={
                                venta.estado
                                  ? "inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium"
                                  : "inline-flex px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium"
                              }
                            >
                              {venta.estado
                                ? "Completada"
                                : "Inactiva"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <button
                              onClick={() =>
                                descargarFacturaPDF(
                                  venta.id_venta
                                )
                              }
                              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                              📄 PDF
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>
        )}

        {/* =================================================
            PQR
        ================================================== */}

        {seccionActiva === "pqr" && (
          <>
            <div className="mb-8">

              <p className="text-sm text-green-600 mb-1">
                Empleado / PQR
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                Gestión de PQR
              </h2>

              <p className="text-gray-500 mt-2">
                Atiende las peticiones, quejas, reclamos y sugerencias
                de los clientes.
              </p>

            </div>

            {/* MENSAJES */}

            {mensaje && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {mensaje}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {/* ENCABEZADO */}

            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h3 className="text-xl font-semibold text-gray-900">
                  PQR recibidas
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Consulta y responde las solicitudes de los clientes.
                </p>

              </div>

              <button
                onClick={cargarPqr}
                disabled={cargandoPqr}
                className="px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
              >
                {cargandoPqr
                  ? "Actualizando..."
                  : "🔄 Actualizar"}
              </button>

            </div>

            {/* CARGANDO */}

            {cargandoPqr ? (

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">

                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>

                <p className="text-gray-500">
                  Cargando PQR...
                </p>

              </div>

            ) : pqr.length === 0 ? (

              /* SIN PQR */

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">

                <div className="text-6xl mb-5">
                  📝
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No hay PQR registradas
                </h3>

                <p className="text-gray-500">
                  Cuando un cliente cree una PQR aparecerá aquí.
                </p>

              </div>

            ) : (

              /* LISTA DE PQR */

              <div className="space-y-6">

                {pqr.map((solicitud) => (

                  <div
                    key={solicitud.id_pqr}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                  >

                    {/* INFORMACIÓN */}

                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-3 mb-3">

                          <h3 className="text-xl font-bold text-gray-900">
                            {solicitud.asunto}
                          </h3>

                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                            {solicitud.tipo}
                          </span>

                        </div>

                        <p className="text-sm text-gray-500">
                          PQR #{solicitud.id_pqr}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Cliente #{solicitud.id_usuario}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Fecha:{" "}
                          {solicitud.fecha_creacion
                            ? new Date(
                                solicitud.fecha_creacion
                              ).toLocaleString("es-CO")
                            : "No disponible"}
                        </p>

                      </div>

                      {/* ESTADO */}

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

                    {/* DESCRIPCIÓN */}

                    <div className="mt-5">

                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Descripción del cliente
                      </p>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-600 whitespace-pre-wrap">
                        {solicitud.descripcion}
                      </div>

                    </div>

                    {/* RESPUESTA ACTUAL */}

                    <div className="mt-5">

                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Respuesta actual
                      </p>

                      {solicitud.respuesta ? (

                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 whitespace-pre-wrap">
                          {solicitud.respuesta}
                        </div>

                      ) : (

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700">
                          Esta PQR todavía no tiene una respuesta.
                        </div>

                      )}

                    </div>

                    {/* BOTÓN RESPONDER */}

                    <div className="mt-5">

                      <button
                        type="button"
                        onClick={() =>
                          setPqrEditando({
                            ...solicitud,
                            respuesta: solicitud.respuesta || "",
                          })
                        }
                        className="px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-semibold"
                      >
                        ✏️ Responder / Gestionar
                      </button>

                    </div>

                    {/* FORMULARIO */}

                    {pqrEditando?.id_pqr === solicitud.id_pqr && (

                      <div className="mt-6 pt-6 border-t border-gray-200">

                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Gestionar PQR #{solicitud.id_pqr}
                        </h4>

                        <form
                          onSubmit={actualizarPqr}
                          className="space-y-5"
                        >

                          {/* ESTADO */}

                          <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
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

                          {/* RESPUESTA */}

                          <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Respuesta al cliente
                            </label>

                            <textarea
                              value={pqrEditando.respuesta || ""}
                              onChange={(e) =>
                                setPqrEditando({
                                  ...pqrEditando,
                                  respuesta: e.target.value,
                                })
                              }
                              rows={6}
                              placeholder="Escribe la respuesta para el cliente..."
                              className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500 resize-none"
                            />

                          </div>

                          {/* BOTONES */}

                          <div className="flex flex-wrap gap-3">

                            <button
                              type="submit"
                              className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-semibold"
                            >
                              💾 Guardar cambios
                            </button>

                            <button
                              type="button"
                              onClick={() => setPqrEditando(null)}
                              className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
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

          </>
        )}

      </main>
    </div>
  );
}

export default PanelEmpleado;