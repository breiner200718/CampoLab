import './App.css'

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import { Navbar } from './components/Navbar'

import { Carrusel } from './components/Carrusel'

import { Footer } from './components/Footer'

import Login from './components/Login'

import Nosotros from './pages/Nosotros'

import Contacto from './pages/Contacto'

import RecoverPassword from './pages/RecoverPassword'

import ResetPassword from './pages/ResetPassword'

import Productos from './pages/Productos'

import DetalleProducto from './pages/DetalleProducto'

import PanelAdministrador from './pages/PanelAdministrador'

import PanelEmpleado from './pages/PanelEmpleado'

import PanelCliente from './pages/PanelCliente'

import RutaProtegida from './components/RutaProtegida'

import WhatsAppButton from './components/WhatsAppButton'

import Chatbot from './components/Chatbot'

import Carrito from "./pages/Carrito"


function Layout() {
  const location = useLocation()

  // El Navbar y el chatbot público no aparecerán en los paneles
  const mostrarNavbar =
    location.pathname !== "/admin" &&
    location.pathname !== "/empleado" &&
    location.pathname !== "/cliente"

  return (
    <>
      {mostrarNavbar && <Navbar />}

      <WhatsAppButton />

      {mostrarNavbar && <Chatbot />}

      <Routes>

        {/* ==========================================
            PÁGINA PRINCIPAL
        ========================================== */}
        <Route
          path="/"
          element={
            <>
              <main>
                <Carrusel />

                <section className="max-w-6xl mx-auto px-6 py-16 text-center">

                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Nuestros servicios
                  </h2>

                  <p className="text-gray-600 mb-10">
                    Reutilización de materiales reciclables
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div className="bg-[#f5f5dc] p-6 rounded-2xl shadow-md">
                      <h3 className="text-xl font-bold mb-3">
                        ♻️ Reutilización
                      </h3>

                      <p className="text-gray-600">
                        Una aplicación creada para reutilizar materiales
                        reciclables y ayudar al medio ambiente.
                      </p>
                    </div>

                    <div className="bg-[#f5f5dc] p-6 rounded-2xl shadow-md">
                      <h3 className="text-xl font-bold mb-3">
                        ✨ Diseño moderno
                      </h3>

                      <p className="text-gray-600">
                        Diseñada utilizando tecnologías actuales.
                      </p>
                    </div>

                    <div className="bg-[#f5f5dc] p-6 rounded-2xl shadow-md">
                      <h3 className="text-xl font-bold mb-3">
                        💚 Interfaz intuitiva
                      </h3>

                      <p className="text-gray-600">
                        Una interfaz fácil de utilizar.
                      </p>
                    </div>

                  </div>
                </section>
              </main>

              <Footer />
            </>
          }
        />

        {/* ==========================================
            NOSOTROS
        ========================================== */}
        <Route
          path="/nosotros"
          element={<Nosotros />}
        />

        {/* ==========================================
            CONTACTO
        ========================================== */}
        <Route
          path="/contacto"
          element={<Contacto />}
        />

        {/* ==========================================
            LOGIN
        ========================================== */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* ==========================================
            RECUPERAR CONTRASEÑA
        ========================================== */}
        <Route
          path="/recuperar-password"
          element={<RecoverPassword />}
        />

        {/* ==========================================
            RESTABLECER CONTRASEÑA
        ========================================== */}
        <Route
          path="/restablecer-password"
          element={<ResetPassword />}
        />

        {/* ==========================================
            PRODUCTOS
        ========================================== */}
        <Route
          path="/productos"
          element={<Productos />}
        />

        {/* ==========================================
            DETALLE DEL PRODUCTO
        ========================================== */}
        <Route
          path="/productos/:id"
          element={<DetalleProducto />}
        />

        {/* ==========================================
            PANEL ADMINISTRADOR
        ========================================== */}
        <Route
          path="/admin"
          element={
            <RutaProtegida rolesPermitidos={[1]}>
              <PanelAdministrador />
            </RutaProtegida>
          }
        />

        {/* ==========================================
            PANEL EMPLEADO
        ========================================== */}
        <Route
          path="/empleado"
          element={
            <RutaProtegida rolesPermitidos={[2]}>
              <PanelEmpleado />
            </RutaProtegida>
          }
        />

        {/* ==========================================
            PANEL CLIENTE
        ========================================== */}
        <Route
          path="/cliente"
          element={
            <RutaProtegida rolesPermitidos={[3]}>
              <PanelCliente />
            </RutaProtegida>
          }
        />

        {/* ==========================================
            CARRITO
        ========================================== */}
        <Route
          path="/carrito"
          element={<Carrito />}
        />

      </Routes>
    </>
  )
}


function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App  