import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function PanelCliente() {
  const navigate = useNavigate();

  // =========================
  // ESTADOS
  // =========================

  const [seccionActiva, setSeccionActiva] = useState("dashboard");

  const [usuario, setUsuario] = useState(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");

  const [ventas, setVentas] = useState([]);

  // =========================
  // ESTADOS PQR
  // =========================

  const [pqr, setPqr] = useState([]);

  const [tipoPqr, setTipoPqr] = useState("Petición");
  const [asuntoPqr, setAsuntoPqr] = useState("");
  const [descripcionPqr, setDescripcionPqr] = useState("");

  const [cargandoPqr, setCargandoPqr] = useState(false);
  const [enviandoPqr, setEnviandoPqr] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // =========================
  // OBTENER ID DEL TOKEN
  // =========================

  const obtenerIdDesdeToken = () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return null;
      }

      const partes = token.split(".");

      if (partes.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(partes[1]));

      return payload.sub || payload.id_usuario || payload.id;
    } catch (error) {
      console.error("Error al obtener el ID del token:", error);
      return null;
    }
  };

  // =========================
  // CARGAR USUARIO
  // =========================

  const cargarUsuario = async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");
      const idUsuario = obtenerIdDesdeToken();

      if (!token || !idUsuario) {
        setError("No se pudo identificar al usuario.");
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/usuarios/${idUsuario}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => null);

        throw new Error(
          data?.detail ||
          "No se pudo cargar la información del usuario."
        );
      }

      const data = await respuesta.json();

      setUsuario(data);

      setNombre(data.nombre || "");
      setApellido(data.apellido || "");
      setTipoDocumento(data.tipo_documento || "");
      setNumeroDocumento(data.numero_documento || "");
      setDireccion(data.direccion || "");
      setTelefono(data.telefono || "");
      setCorreo(data.correo || "");
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // CARGAR FACTURAS
  // =========================

  const cargarVentas = async () => {
    try {
      setCargandoVentas(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("No se encontró el token de autenticación.");
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/ventas/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data?.detail ||
          "No se pudieron cargar las facturas."
        );
      }

      setVentas(data);
    } catch (error) {
      console.error("Error al cargar las ventas:", error);
      setError(error.message);
    } finally {
      setCargandoVentas(false);
    }
  };

  // =========================
  // DESCARGAR FACTURA PDF
  // =========================

  const descargarFactura = async (idVenta, numeroFactura) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("No se encontró el token de autenticación.");
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/ventas/${idVenta}/factura/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => null);

        throw new Error(
          data?.detail ||
          "No se pudo generar la factura."
        );
      }

      const blob = await respuesta.blob();

      const url = window.URL.createObjectURL(blob);

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
    }
  };

  // =========================
  // CARGAR PQR
  // =========================

  const cargarPqr = async () => {
    try {
      setCargandoPqr(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("No se encontró el token de autenticación.");
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/pqr/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data?.detail ||
          "No se pudieron cargar las PQR."
        );
      }

      setPqr(data);
    } catch (error) {
      console.error("Error al cargar las PQR:", error);
      setError(error.message);
    } finally {
      setCargandoPqr(false);
    }
  };

  // =========================
  // CREAR PQR
  // =========================

  const crearPqr = async (e) => {
    e.preventDefault();

    try {
      setEnviandoPqr(true);
      setMensaje("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("No se encontró el token de autenticación.");
        return;
      }

      if (!asuntoPqr.trim() || !descripcionPqr.trim()) {
        setError(
          "Debes completar el asunto y la descripción."
        );
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/pqr/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tipo: tipoPqr,
            asunto: asuntoPqr.trim(),
            descripcion: descripcionPqr.trim(),
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data?.detail ||
          "No se pudo enviar la PQR."
        );
      }

      setMensaje(
        "PQR enviada correctamente. Su estado inicial es Pendiente."
      );

      setTipoPqr("Petición");
      setAsuntoPqr("");
      setDescripcionPqr("");

      await cargarPqr();
    } catch (error) {
      console.error("Error al crear la PQR:", error);
      setError(error.message);
    } finally {
      setEnviandoPqr(false);
    }
  };

  // =========================
  // CARGAR DATOS AL INICIAR
  // =========================

  useEffect(() => {
    cargarUsuario();
  }, []);

  // =========================
  // GUARDAR CAMBIOS
  // =========================

  const manejarSubmit = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);
      setMensaje("");
      setError("");

      const token = localStorage.getItem("token");
      const idUsuario = obtenerIdDesdeToken();

      if (!token || !idUsuario) {
        setError("No se pudo identificar al usuario.");
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/usuarios/${idUsuario}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            apellido,
            tipo_documento: tipoDocumento,
            numero_documento: numeroDocumento,
            direccion,
            telefono,
            correo,
          }),
        }
      );

      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => null);

        throw new Error(
          data?.detail ||
          "No se pudo actualizar la información."
        );
      }

      const data = await respuesta.json();

      setUsuario(data);

      // Actualizar información guardada de la sesión
      const usuarioActivo = JSON.parse(
        localStorage.getItem("usuarioActivo") || "{}"
      );

      localStorage.setItem(
        "usuarioActivo",
        JSON.stringify({
          ...usuarioActivo,
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
        })
      );

      window.dispatchEvent(
        new Event("usuarioActualizado")
      );

      setMensaje(
        "Información actualizada correctamente."
      );

      await cargarUsuario();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  // =========================
  // CERRAR SESIÓN
  // =========================

  const cerrarSesion = () => {
    localStorage.removeItem("usuarioActivo");
    localStorage.removeItem("token");
    localStorage.removeItem("recordarme");

    window.dispatchEvent(
      new Event("usuarioActualizado")
    );

    navigate("/login");
  };

  // =========================
  // USUARIO DE LA SESIÓN
  // =========================

  const usuarioSesion = JSON.parse(
    localStorage.getItem("usuarioActivo") || "null"
  );

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">

          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>

          <p className="text-gray-500">
            Cargando información...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 flex flex-col z-50">

        {/* LOGO */}

        <div className="p-6 border-b border-gray-800">

          <h1 className="text-2xl font-bold text-green-400">
            CampoLab
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Panel de Cliente
          </p>

        </div>

        {/* MENÚ */}

        <nav className="flex-1 p-4 space-y-2">

          {/* DASHBOARD */}

          <button
            onClick={() => {
              setSeccionActiva("dashboard");
              setMensaje("");
              setError("");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${seccionActiva === "dashboard"
                ? "bg-green-700 text-white"
                : "text-gray-300 hover:bg-gray-800"
              }`}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </button>

          {/* MI PERFIL */}

          <button
            onClick={() => {
              setSeccionActiva("perfil");
              setMensaje("");
              setError("");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${seccionActiva === "perfil"
                ? "bg-green-700 text-white"
                : "text-gray-300 hover:bg-gray-800"
              }`}
          >
            <span>👤</span>
            <span>Mi perfil</span>
          </button>

          {/* CARRITO */}

          <button
            onClick={() => navigate("/carrito")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-300 hover:bg-gray-800 transition"
          >
            <span>🛒</span>
            <span>Carrito</span>
          </button>

          {/* MIS FACTURAS */}

          <button
            onClick={() => {
              setSeccionActiva("facturas");
              setMensaje("");
              setError("");
              cargarVentas();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${seccionActiva === "facturas"
                ? "bg-green-700 text-white"
                : "text-gray-300 hover:bg-gray-800"
              }`}
          >
            <span>🧾</span>
            <span>Mis facturas</span>
          </button>

          {/* PQR */}

          <button
            onClick={() => {
              setSeccionActiva("pqr");
              setMensaje("");
              setError("");
              cargarPqr();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${seccionActiva === "pqr"
                ? "bg-green-700 text-white"
                : "text-gray-300 hover:bg-gray-800"
              }`}
          >
            <span>📝</span>
            <span>PQR</span>
          </button>

          {/* PRODUCTOS */}

          <button
            onClick={() => navigate("/productos")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-300 hover:bg-gray-800 transition"
          >
            <span>📦</span>
            <span>Productos</span>
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

        {/* USUARIO */}

        <div className="p-4 border-t border-gray-800">

          <div className="mb-4">

            <p className="text-sm font-semibold text-white">

              {usuarioSesion?.nombre ||
                nombre ||
                "Cliente"}

              {usuarioSesion?.apellido ||
                apellido
                ? ` ${usuarioSesion?.apellido ||
                apellido
                }`
                : ""}

            </p>

            <p className="text-xs text-gray-400 mt-1">
              Cliente
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
                Cliente / Dashboard
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                Panel de Cliente
              </h2>

              <p className="text-gray-500 mt-2">
                Bienvenido a tu panel de CampoLab.
              </p>

            </div>

            {/* TARJETAS */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* NOMBRE */}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Cliente
                    </p>

                    <p className="text-xl font-bold text-gray-900 mt-2">
                      {nombre} {apellido}
                    </p>

                  </div>

                  <div className="text-3xl">
                    👤
                  </div>

                </div>

              </div>

              {/* ESTADO */}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Estado
                    </p>

                    <p className="text-xl font-bold text-green-600 mt-2">
                      Activo
                    </p>

                  </div>

                  <div className="text-3xl">
                    ✅
                  </div>

                </div>

              </div>

              {/* PERFIL */}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Mi perfil
                    </p>

                    <p className="text-xl font-bold text-gray-900 mt-2">
                      Información
                    </p>

                  </div>

                  <div className="text-3xl">
                    📝
                  </div>

                </div>

              </div>

              {/* PRODUCTOS */}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Catálogo
                    </p>

                    <p className="text-xl font-bold text-gray-900 mt-2">
                      Productos
                    </p>

                  </div>

                  <div className="text-3xl">
                    📦
                  </div>

                </div>

              </div>

            </div>

            {/* INFORMACIÓN */}

            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bienvenido a CampoLab
              </h3>

              <p className="text-gray-500 mb-5">
                Desde este panel puedes consultar tus datos personales,
                acceder al catálogo, revisar tu carrito, consultar
                tus facturas y enviar PQR.
              </p>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() => navigate("/productos")}
                  className="px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Ver productos
                </button>

                <button
                  onClick={() => navigate("/carrito")}
                  className="px-5 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition"
                >
                  🛒 Ver carrito
                </button>

                <button
                  onClick={() => {
                    setSeccionActiva("facturas");
                    setMensaje("");
                    setError("");
                    cargarVentas();
                  }}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  🧾 Mis facturas
                </button>

                <button
                  onClick={() => {
                    setSeccionActiva("pqr");
                    setMensaje("");
                    setError("");
                    cargarPqr();
                  }}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  📝 Crear PQR
                </button>

              </div>

            </div>
          </>
        )}

        {/* =================================================
            MI PERFIL
        ================================================== */}

        {seccionActiva === "perfil" && (
          <>
            <div className="mb-8">

              <p className="text-sm text-green-600 mb-1">
                Cliente / Mi perfil
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                Mi perfil
              </h2>

              <p className="text-gray-500 mt-2">
                Consulta y actualiza tu información personal.
              </p>

            </div>

            {/* MENSAJE */}

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

            {/* FORMULARIO */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

              <form
                onSubmit={manejarSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >

                {/* NOMBRE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>

                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) =>
                      setNombre(e.target.value)
                    }
                    required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                </div>

                {/* APELLIDO */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>

                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) =>
                      setApellido(e.target.value)
                    }
                    required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                </div>

                {/* TIPO DOCUMENTO */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de documento
                  </label>

                  <input
                    type="text"
                    value={tipoDocumento}
                    onChange={(e) =>
                      setTipoDocumento(e.target.value)
                    }
                    required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                </div>

                {/* NÚMERO DOCUMENTO */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de documento
                  </label>

                  <input
                    type="text"
                    value={numeroDocumento}
                    onChange={(e) =>
                      setNumeroDocumento(e.target.value)
                    }
                    required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                </div>

                {/* DIRECCIÓN */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>

                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) =>
                      setDireccion(e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                </div>

                {/* TELÉFONO */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>

                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) =>
                      setTelefono(e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                </div>

                {/* CORREO */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    value={correo}
                    onChange={(e) =>
                      setCorreo(e.target.value)
                    }
                    required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                </div>

                {/* BOTÓN */}

                <div className="md:col-span-2">

                  <button
                    type="submit"
                    disabled={guardando}
                    className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {guardando
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </button>

                </div>

              </form>

            </div>
          </>
        )}

        {/* =================================================
            MIS FACTURAS
        ================================================== */}

        {seccionActiva === "facturas" && (
          <>
            <div className="mb-8">

              <p className="text-sm text-green-600 mb-1">
                Cliente / Mis facturas
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                Mis facturas
              </h2>

              <p className="text-gray-500 mt-2">
                Consulta tus compras y descarga tus facturas.
              </p>

            </div>

            {/* MENSAJES */}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {mensaje}
              </div>
            )}

            {/* CARGANDO */}

            {cargandoVentas ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">

                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>

                <p className="text-gray-500">
                  Cargando tus facturas...
                </p>

              </div>
            ) : ventas.length === 0 ? (
              /* SIN FACTURAS */

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">

                <div className="text-6xl mb-5">
                  🧾
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No tienes facturas todavía
                </h3>

                <p className="text-gray-500 mb-6">
                  Cuando realices una compra, aquí aparecerá
                  tu factura.
                </p>

                <button
                  onClick={() => navigate("/productos")}
                  className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Ver productos
                </button>

              </div>
            ) : (
              /* LISTA DE FACTURAS */

              <div className="space-y-5">

                {ventas.map((venta) => (
                  <div
                    key={venta.id_venta}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      {/* INFORMACIÓN */}

                      <div>

                        <div className="flex flex-wrap items-center gap-3 mb-3">

                          <h3 className="text-xl font-bold text-gray-900">
                            {venta.numero_factura}
                          </h3>

                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                            {venta.estado
                              ? "Completada"
                              : "Inactiva"}
                          </span>

                        </div>

                        <p className="text-gray-500">
                          Venta #{venta.id_venta}
                        </p>

                        <p className="text-gray-500 mt-1">
                          Fecha:{" "}
                          {venta.fecha_creacion
                            ? new Date(venta.fecha_creacion).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                            : "No disponible"}
                        </p>

                        <p className="text-2xl font-bold text-green-700 mt-3">
                          $
                          {Number(
                            venta.total
                          ).toLocaleString("es-CO")}
                        </p>

                      </div>

                      {/* ACCIONES */}

                      <div className="flex flex-wrap gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            descargarFactura(
                              venta.id_venta,
                              venta.numero_factura
                            )
                          }
                          className="px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition font-semibold"
                        >
                          📄 Descargar factura
                        </button>

                      </div>

                    </div>

                    {/* PRODUCTOS */}

                    {venta.detalles &&
                      venta.detalles.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-gray-200">

                          <p className="font-semibold text-gray-800 mb-3">
                            Productos comprados
                          </p>

                          <div className="space-y-2">

                            {venta.detalles.map(
                              (detalle) => (
                                <div
                                  key={
                                    detalle.id_detalle
                                  }
                                  className="flex justify-between text-sm text-gray-600"
                                >
                                  <span>
                                    Producto #
                                    {
                                      detalle.id_producto
                                    }{" "}
                                    ×{" "}
                                    {
                                      detalle.cantidad
                                    }
                                  </span>

                                  <span className="font-semibold">
                                    $
                                    {Number(
                                      detalle.subtotal
                                    ).toLocaleString(
                                      "es-CO"
                                    )}
                                  </span>
                                </div>
                              )
                            )}

                          </div>

                        </div>
                      )}

                  </div>
                ))}

              </div>
            )}

          </>
        )}

        {/* =================================================
            PQR
        ================================================== */}

        {seccionActiva === "pqr" && (
          <>
            <div className="mb-8">

              <p className="text-sm text-green-600 mb-1">
                Cliente / PQR
              </p>

              <h2 className="text-3xl font-bold text-gray-900">
                Peticiones, Quejas, Reclamos y Sugerencias
              </h2>

              <p className="text-gray-500 mt-2">
                Envía una PQR y consulta el estado de tus solicitudes.
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

            {/* CREAR PQR */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">

              <div className="mb-6">

                <h3 className="text-xl font-semibold text-gray-900">
                  Crear nueva PQR
                </h3>

                <p className="text-gray-500 mt-1">
                  Describe tu solicitud para que el equipo de CampoLab pueda atenderla.
                </p>

              </div>

              <form
                onSubmit={crearPqr}
                className="space-y-5"
              >

                {/* TIPO */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de solicitud
                  </label>

                  <select
                    value={tipoPqr}
                    onChange={(e) =>
                      setTipoPqr(e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  >
                    <option value="Petición">
                      Petición
                    </option>

                    <option value="Queja">
                      Queja
                    </option>

                    <option value="Reclamo">
                      Reclamo
                    </option>

                    <option value="Sugerencia">
                      Sugerencia
                    </option>
                  </select>

                </div>

                {/* ASUNTO */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto
                  </label>

                  <input
                    type="text"
                    value={asuntoPqr}
                    onChange={(e) =>
                      setAsuntoPqr(e.target.value)
                    }
                    placeholder="Escribe el asunto de tu solicitud"
                    maxLength={150}
                    required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                  />

                </div>

                {/* DESCRIPCIÓN */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>

                  <textarea
                    value={descripcionPqr}
                    onChange={(e) =>
                      setDescripcionPqr(e.target.value)
                    }
                    placeholder="Describe detalladamente tu solicitud..."
                    rows={6}
                    required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none focus:border-green-500 resize-none"
                  />

                </div>

                {/* INFORMACIÓN DEL ESTADO */}

                <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">

                  <p className="text-sm text-yellow-800">
                    <strong>Estado inicial:</strong> Pendiente
                  </p>

                  <p className="text-xs text-yellow-700 mt-1">
                    El estado será actualizado posteriormente por el personal autorizado de CampoLab.
                  </p>

                </div>

                {/* BOTÓN */}

                <div>

                  <button
                    type="submit"
                    disabled={enviandoPqr}
                    className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {enviandoPqr
                      ? "Enviando..."
                      : "📝 Enviar PQR"}
                  </button>

                </div>

              </form>

            </div>

            {/* LISTADO DE PQR */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                <div>

                  <h3 className="text-xl font-semibold text-gray-900">
                    Mis PQR
                  </h3>

                  <p className="text-gray-500 mt-1">
                    Consulta las solicitudes que has enviado.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={cargarPqr}
                  disabled={cargandoPqr}
                  className="px-5 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50"
                >
                  🔄 Actualizar
                </button>

              </div>

              {/* CARGANDO */}

              {cargandoPqr ? (
                <div className="py-10 text-center">

                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>

                  <p className="text-gray-500">
                    Cargando tus PQR...
                  </p>

                </div>
              ) : pqr.length === 0 ? (

                /* SIN PQR */

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">

                  <div className="text-6xl mb-5">
                    📝
                  </div>

                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    No tienes PQR todavía
                  </h4>

                  <p className="text-gray-500">
                    Cuando envíes una petición, queja, reclamo
                    o sugerencia, aparecerá aquí.
                  </p>

                </div>
              ) : (

                /* LISTA */

                <div className="space-y-5">

                  {pqr.map((solicitud) => (

                    <div
                      key={solicitud.id_pqr}
                      className="border border-gray-200 rounded-2xl p-6 bg-gray-50"
                    >

                      {/* CABECERA */}

                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                        <div>

                          <div className="flex flex-wrap items-center gap-3 mb-2">

                            <h4 className="text-lg font-bold text-gray-900">
                              {solicitud.asunto}
                            </h4>

                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                              {solicitud.tipo}
                            </span>

                          </div>

                          <p className="text-sm text-gray-500">
                            PQR #{solicitud.id_pqr}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Fecha:{" "}
                            {solicitud.fecha_creacion
                              ? new Date(
                                solicitud.fecha_creacion
                              ).toLocaleDateString(
                                "es-CO"
                              )
                              : "No disponible"}
                          </p>

                        </div>

                        {/* ESTADO */}

                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${solicitud.estado === "Pendiente"
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
                          Descripción
                        </p>

                        <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-600 whitespace-pre-wrap">
                          {solicitud.descripcion}
                        </div>

                      </div>

                      {/* RESPUESTA */}

                      <div className="mt-5">

                        <p className="text-sm font-semibold text-gray-800 mb-2">
                          Respuesta de CampoLab
                        </p>

                        {solicitud.respuesta ? (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 whitespace-pre-wrap">
                            {solicitud.respuesta}
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700">
                            Aún no hay una respuesta para esta solicitud.
                          </div>
                        )}

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </>
        )}

      </main>
    </div>
  );
}

export default PanelCliente;