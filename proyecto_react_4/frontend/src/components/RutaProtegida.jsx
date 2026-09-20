import { Navigate } from "react-router-dom";

function RutaProtegida({ rolesPermitidos, children }) {

    console.log("🔥 RUTAPROTEGIDA");
    console.log("rolesPermitidos:", rolesPermitidos);

    const usuarioGuardado = localStorage.getItem("usuarioActivo");

    console.log("usuarioGuardado:", usuarioGuardado);

    // No hay sesión
    if (!usuarioGuardado) {
        console.log("❌ No existe usuarioActivo");
        return <Navigate to="/login" replace />;
    }

    const usuario = JSON.parse(usuarioGuardado);

    console.log("usuario:", usuario);
    console.log("id_rol:", usuario.id_rol);

    // El usuario no tiene el rol permitido
    if (
        rolesPermitidos &&
        !rolesPermitidos.includes(usuario.id_rol)
    ) {
        console.log("❌ Rol no permitido");

        // Lo enviamos a su panel correspondiente
        if (usuario.id_rol === 1) {
            return <Navigate to="/admin" replace />;
        }

        if (usuario.id_rol === 2) {
            return <Navigate to="/empleado" replace />;
        }

        if (usuario.id_rol === 3) {
            return <Navigate to="/cliente" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    // Tiene permiso
    console.log("✅ Rol permitido");

    return children;
}

export default RutaProtegida;