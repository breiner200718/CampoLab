import { useState } from 'react'
import logo from '../assets/img/logo.png'

// ==========================================
// COMPONENTE INPUT REUTILIZABLE
// ==========================================

function Input({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  onChange,
  maxLength,
  contador = true
}) {
  return (
    <div>
      <label className="block text-gray-800 font-semibold mb-1">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-2.5 rounded-xl bg-white border-2 outline-none transition ${
          error
            ? 'border-red-500'
            : 'border-gray-200 focus:border-green-600'
        }`}
      />

      <div className="flex justify-between items-start mt-1">
        <div>
          {error && (
            <p className="text-red-600 text-xs">
              {error}
            </p>
          )}
        </div>

        {contador && maxLength && (
          <p
            className={`text-xs ml-auto ${
              value.length >= maxLength
                ? 'text-red-600 font-semibold'
                : 'text-gray-500'
            }`}
          >
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}

// ==========================================
// REGISTRO MODAL
// ==========================================

function RegistroModal({ cerrarModal }) {

  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: '',
    numeroDocumento: '',
    direccion: '',
    telefono: '',
    correo: '',
    password: '',
    confirmarPassword: ''
  })

  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)

  // ==========================================
  // VALIDACIONES
  // ==========================================

  const validarCampo = (campo, valor, datos = formulario) => {

    let error = ''

    // ==========================================
    // NOMBRE
    // ==========================================

    if (campo === 'nombre') {

      const valorLimpio = valor.trim()

      if (!valorLimpio) {
        error = 'El nombre es obligatorio.'
      }
      else if (valorLimpio.length < 3) {
        error = 'El nombre debe tener mínimo 3 caracteres.'
      }
      else if (valorLimpio.length > 30) {
        error = 'El nombre no puede superar los 30 caracteres.'
      }
      else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valorLimpio)) {
        error = 'El nombre solo puede contener letras y espacios.'
      }
    }

    // ==========================================
    // APELLIDO
    // ==========================================

    if (campo === 'apellido') {

      const valorLimpio = valor.trim()

      if (!valorLimpio) {
        error = 'El apellido es obligatorio.'
      }
      else if (valorLimpio.length < 3) {
        error = 'El apellido debe tener mínimo 3 caracteres.'
      }
      else if (valorLimpio.length > 30) {
        error = 'El apellido no puede superar los 30 caracteres.'
      }
      else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valorLimpio)) {
        error = 'El apellido solo puede contener letras y espacios.'
      }
    }

    // ==========================================
    // TIPO DOCUMENTO
    // ==========================================

    if (campo === 'tipoDocumento') {

      if (!valor) {
        error = 'Selecciona un tipo de documento.'
      }
    }

    // ==========================================
    // NÚMERO DE DOCUMENTO
    // ==========================================

    if (campo === 'numeroDocumento') {

      if (!valor) {
        error = 'El número de documento es obligatorio.'
      }
      else if (!/^\d+$/.test(valor)) {
        error = 'El documento solo puede contener números.'
      }
      else if (valor.length < 6) {
        error = 'El documento debe tener mínimo 6 números.'
      }
      else if (valor.length > 12) {
        error = 'El documento no puede superar los 12 números.'
      }
    }

    // ==========================================
    // DIRECCIÓN
    // ==========================================

    if (campo === 'direccion') {

      const valorLimpio = valor.trim()

      if (!valorLimpio) {
        error = 'La dirección es obligatoria.'
      }
      else if (valorLimpio.length < 5) {
        error = 'La dirección debe tener mínimo 5 caracteres.'
      }
      else if (valorLimpio.length > 100) {
        error = 'La dirección no puede superar los 100 caracteres.'
      }
    }

    // ==========================================
    // TELÉFONO
    // ==========================================

    if (campo === 'telefono') {

      if (!valor) {
        error = 'El teléfono es obligatorio.'
      }
      else if (!/^\d+$/.test(valor)) {
        error = 'El teléfono solo puede contener números.'
      }
      else if (valor.length !== 10) {
        error = 'El teléfono debe tener exactamente 10 números.'
      }
    }

    // ==========================================
    // CORREO
    // ==========================================

    if (campo === 'correo') {

      const correo = valor.trim()

      if (!correo) {
        error = 'El correo electrónico es obligatorio.'
      }
      else if (correo.length > 80) {
        error = 'El correo no puede superar los 80 caracteres.'
      }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
        error = 'Ingresa un correo electrónico válido.'
      }
    }

    // ==========================================
    // CONTRASEÑA
    // ==========================================

    if (campo === 'password') {

      if (!valor) {
        error = 'La contraseña es obligatoria.'
      }
      else if (valor.length < 9) {
        error = 'La contraseña debe tener mínimo 9 caracteres.'
      }
      else if (valor.length > 20) {
        error = 'La contraseña no puede superar los 20 caracteres.'
      }
      else if (!/[A-Z]/.test(valor)) {
        error = 'Debe contener al menos una letra mayúscula.'
      }
      else if (!/[a-z]/.test(valor)) {
        error = 'Debe contener al menos una letra minúscula.'
      }
      else if (!/[0-9]/.test(valor)) {
        error = 'Debe contener al menos un número.'
      }
      else if (!/[^A-Za-z0-9]/.test(valor)) {
        error = 'Debe contener al menos un carácter especial.'
      }
    }

    // ==========================================
    // CONFIRMAR CONTRASEÑA
    // ==========================================

    if (campo === 'confirmarPassword') {

      if (!valor) {
        error = 'Confirma tu contraseña.'
      }
      else if (valor !== datos.password) {
        error = 'Las contraseñas no coinciden.'
      }
    }

    return error
  }

  // ==========================================
  // CAMBIAR CAMPO
  // ==========================================

  const cambiarCampo = (e) => {

    const { name, value } = e.target

    let nuevoValor = value

    // Solo letras para nombre y apellido
    if (name === 'nombre' || name === 'apellido') {

      nuevoValor = value.replace(
        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
        ''
      )
    }

    // Solo números
    if (
      name === 'numeroDocumento' ||
      name === 'telefono'
    ) {

      nuevoValor = value.replace(/\D/g, '')
    }

    const nuevoFormulario = {
      ...formulario,
      [name]: nuevoValor
    }

    setFormulario(nuevoFormulario)

    // Validar campo actual
    setErrores((anteriores) => ({
      ...anteriores,
      [name]: validarCampo(
        name,
        nuevoValor,
        nuevoFormulario
      )
    }))

    // Si cambia la contraseña,
    // volver a validar la confirmación
    if (name === 'password' && formulario.confirmarPassword) {

      setErrores((anteriores) => ({
        ...anteriores,
        password: validarCampo(
          'password',
          nuevoValor,
          nuevoFormulario
        ),
        confirmarPassword: validarCampo(
          'confirmarPassword',
          formulario.confirmarPassword,
          nuevoFormulario
        )
      }))
    }
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  const manejarSubmit = async (e) => {

    e.preventDefault()

    const nuevosErrores = {}

    Object.keys(formulario).forEach((campo) => {

      nuevosErrores[campo] = validarCampo(
        campo,
        formulario[campo],
        formulario
      )
    })

    setErrores(nuevosErrores)

    const formularioValido = Object.values(nuevosErrores)
      .every((error) => error === '')

    if (!formularioValido) {
      return
    }

    setCargando(true)

    try {

      // ==========================================
      // DATOS PARA FASTAPI
      // ==========================================

      const formData = {
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        tipo_documento: formulario.tipoDocumento,
        numero_documento: formulario.numeroDocumento,
        direccion: formulario.direccion.trim(),
        telefono: formulario.telefono,
        correo: formulario.correo.trim().toLowerCase(),
        contrasena: formulario.password,

        // 3 = Cliente
        id_rol: 3
      }

      // ==========================================
      // CONEXIÓN CON FASTAPI
      // ==========================================

      const response = await fetch(
        'http://127.0.0.1:8000/usuarios/',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      // ==========================================
      // ERRORES DE FASTAPI
      // ==========================================

      if (!response.ok) {

        if (Array.isArray(data.detail)) {

          const mensajes = data.detail
            .map((error) => error.msg)
            .join('\n')

          throw new Error(mensajes)
        }

        throw new Error(
          data.detail ||
          'No fue posible crear la cuenta.'
        )
      }

      // ==========================================
      // REGISTRO EXITOSO
      // ==========================================

      alert('Cuenta creada correctamente.')

      // Limpiar formulario
      setFormulario({
        nombre: '',
        apellido: '',
        tipoDocumento: '',
        numeroDocumento: '',
        direccion: '',
        telefono: '',
        correo: '',
        password: '',
        confirmarPassword: ''
      })

      setErrores({})

      cerrarModal()

    } catch (error) {

      console.error(
        'Error al registrar usuario:',
        error
      )

      alert(
        error.message ||
        'No fue posible conectar con el servidor.'
      )

    } finally {

      setCargando(false)
    }
  }

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#f5f5dc] rounded-3xl shadow-2xl p-6 md:p-8">

        {/* CERRAR */}

        <button
          type="button"
          onClick={cerrarModal}
          disabled={cargando}
          className="absolute top-4 right-5 text-gray-500 hover:text-red-600 text-3xl font-bold disabled:opacity-50"
        >
          ×
        </button>

        {/* TITULO */}

        <div className="text-center mb-7">

          <div className="relative h-16 mb-3 flex justify-center">

            <img
              src={logo}
              alt="Logo CampoLab"
              className="absolute w-28 h-28 object-contain -top-4"
            />

          </div>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-5">
            Crear una cuenta
          </h2>

          <p className="text-gray-600 mt-1">
            Completa tus datos para registrarte
          </p>

        </div>

        {/* FORMULARIO */}

        <form onSubmit={manejarSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* NOMBRE */}

            <Input
              name="nombre"
              label="Nombre"
              placeholder="Ingresa tu nombre"
              value={formulario.nombre}
              error={errores.nombre}
              onChange={cambiarCampo}
              maxLength={30}
            />

            {/* APELLIDO */}

            <Input
              name="apellido"
              label="Apellido"
              placeholder="Ingresa tu apellido"
              value={formulario.apellido}
              error={errores.apellido}
              onChange={cambiarCampo}
              maxLength={30}
            />

            {/* TIPO DOCUMENTO */}

            <div>

              <label className="block text-gray-800 font-semibold mb-1">
                Tipo de documento
              </label>

              <select
                name="tipoDocumento"
                value={formulario.tipoDocumento}
                onChange={cambiarCampo}
                className={`w-full px-4 py-2.5 rounded-xl bg-white border-2 outline-none ${
                  errores.tipoDocumento
                    ? 'border-red-500'
                    : 'border-gray-200 focus:border-green-600'
                }`}
              >

                <option value="">
                  Selecciona una opción
                </option>

                <option value="CC">
                  Cédula de ciudadanía
                </option>

                <option value="TI">
                  Tarjeta de identidad
                </option>

                <option value="CE">
                  Cédula de extranjería
                </option>

              </select>

              {errores.tipoDocumento && (
                <p className="text-red-600 text-xs mt-1">
                  {errores.tipoDocumento}
                </p>
              )}

            </div>

            {/* DOCUMENTO */}

            <Input
              name="numeroDocumento"
              label="Número de documento"
              placeholder="Solo números"
              value={formulario.numeroDocumento}
              error={errores.numeroDocumento}
              onChange={cambiarCampo}
              maxLength={12}
            />

            {/* DIRECCIÓN */}

            <Input
              name="direccion"
              label="Dirección"
              placeholder="Ej: Calle 10 #20-30"
              value={formulario.direccion}
              error={errores.direccion}
              onChange={cambiarCampo}
              maxLength={100}
            />

            {/* TELÉFONO */}

            <Input
              name="telefono"
              label="Teléfono"
              placeholder="10 números"
              type="tel"
              value={formulario.telefono}
              error={errores.telefono}
              onChange={cambiarCampo}
              maxLength={10}
            />

            {/* CORREO */}

            <Input
              name="correo"
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              type="email"
              value={formulario.correo}
              error={errores.correo}
              onChange={cambiarCampo}
              maxLength={80}
            />

            {/* CONTRASEÑA */}

            <Input
              name="password"
              label="Contraseña"
              placeholder="Mínimo 9 caracteres"
              type="password"
              value={formulario.password}
              error={errores.password}
              onChange={cambiarCampo}
              maxLength={20}
            />

            {/* CONFIRMAR CONTRASEÑA */}

            <Input
              name="confirmarPassword"
              label="Confirmar contraseña"
              placeholder="Repite la contraseña"
              type="password"
              value={formulario.confirmarPassword}
              error={errores.confirmarPassword}
              onChange={cambiarCampo}
              maxLength={20}
            />

          </div>

          {/* BOTONES */}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">

            <button
              type="button"
              onClick={cerrarModal}
              disabled={cargando}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
              className="px-6 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default RegistroModal