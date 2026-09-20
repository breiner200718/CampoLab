function Contacto() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-6 py-16">
      
      {/* ENCABEZADO */}
      <section className="max-w-4xl mx-auto text-center">
        <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold mb-5">
          🌱 Estamos para ayudarte
        </span>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Contáctate con <span className="text-green-600">CampoLab</span>
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          ¿Tienes preguntas sobre nuestros productos agrícolas?
          Escríbenos y nuestro equipo estará encantado de ayudarte.
        </p>
      </section>

      {/* INFORMACIÓN */}
      <section className="max-w-5xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* TARJETA CONTACTO */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            📞 Información de contacto
          </h2>

          <div className="space-y-6">

            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-xl text-xl">
                📧
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  Correo electrónico
                </p>
                <p className="text-gray-600">
                  contacto@campolab.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-xl text-xl">
                📱
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  Teléfono
                </p>
                <p className="text-gray-600">
                  +57 604 444 2025
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-xl text-xl">
                📍
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  Ubicación
                </p>
                <p className="text-gray-600">
                  Medellín, Antioquia, Colombia
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-xl text-xl">
                🕐
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  Horario de atención
                </p>
                <p className="text-gray-600">
                  Lunes a viernes: 8:00 AM - 5:00 PM
                </p>
                <p className="text-gray-600">
                  Sábados: 8:00 AM - 12:00 PM
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* TARJETA WHATSAPP */}
        <div className="bg-green-600 rounded-3xl shadow-lg p-8 text-white flex flex-col justify-between">

          <div>
            <div className="text-5xl mb-6">
              💬
            </div>

            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas ayuda?
            </h2>

            <p className="text-green-50 leading-relaxed mb-8">
              Comunícate directamente con nuestro equipo de CampoLab
              para resolver tus dudas sobre nuestros productos.
            </p>
          </div>

          <a
            href="https://wa.me/573001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-center bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition"
          >
            💬 Escribir por WhatsApp
          </a>

        </div>
      </section>

      {/* MENSAJE FINAL */}
      <section className="max-w-4xl mx-auto text-center mt-14">
        <div className="bg-white rounded-2xl shadow-md p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            🌾 CampoLab
          </h2>

          <p className="text-gray-600">
            Tecnología y soluciones para una agricultura más eficiente,
            conectando productos y personas en un solo lugar.
          </p>
        </div>
      </section>

    </main>
  );
}

export default Contacto;