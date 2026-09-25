function Nosotros() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-6 py-16">
      {/* ENCABEZADO */}
      <section className="max-w-5xl mx-auto text-center">
        <span className="inline-block bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold mb-6">
          ♻️ Transformando materiales, creando oportunidades
        </span>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Conoce <span className="text-green-600">CampoLab</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          CampoLab es una plataforma enfocada en la reutilización de materiales
          reciclables para la creación de nuevos productos, facilitando su
          administración y comercialización mediante herramientas
          tecnológicas.
        </p>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className="max-w-6xl mx-auto mt-16">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-green-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-green-600 font-semibold">
                ♻️ ¿Quiénes somos?
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-3 mb-5">
                Una nueva forma de aprovechar los materiales
              </h2>

              <p className="text-gray-600 leading-relaxed text-lg">
                CampoLab es un proyecto orientado al aprovechamiento de
                materiales reciclables que pueden ser transformados en nuevos
                productos. Nuestra plataforma permite gestionar y
                comercializar estos productos de manera organizada, integrando
                la reutilización de materiales con la tecnología.
              </p>
            </div>

            <div className="bg-green-600 rounded-3xl p-10 text-white text-center">
              <div className="text-6xl mb-5">♻️</div>

              <h3 className="text-3xl font-bold mb-4">
                Reciclaje + Tecnología
              </h3>

              <p className="text-green-50 leading-relaxed">
                Combinamos la reutilización de materiales reciclables con
                herramientas tecnológicas para facilitar la gestión de nuestros
                productos y ofrecer a los clientes una forma sencilla de
                conocerlos y adquirirlos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MISIÓN / VISIÓN / COMPROMISO */}
      <section className="max-w-6xl mx-auto mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* MISIÓN */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-100 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-5">🎯</div>

            <h3 className="text-2xl font-bold text-green-600 mb-4">
              Nuestra misión
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Promover la reutilización de materiales reciclables mediante la
              transformación de estos recursos en nuevos productos y facilitar
              su administración y comercialización a través de una plataforma
              tecnológica.
            </p>
          </div>

          {/* VISIÓN */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-100 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-5">🚀</div>

            <h3 className="text-2xl font-bold text-green-600 mb-4">
              Nuestra visión
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Ser una plataforma que contribuya al aprovechamiento de
              materiales reciclables, impulsando la creación de nuevos
              productos y utilizando la tecnología para facilitar su
              comercialización.
            </p>
          </div>

          {/* COMPROMISO */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-100 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div className="text-5xl mb-5">💚</div>

            <h3 className="text-2xl font-bold text-green-600 mb-4">
              Nuestro compromiso
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Aprovechar de manera responsable los materiales reciclables y
              apoyar la creación de nuevos productos, ofreciendo una
              plataforma que facilite su gestión y comercialización.
            </p>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="max-w-5xl mx-auto mt-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10">
          💡 Lo que nos representa
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">♻️</div>

            <p className="font-semibold text-gray-700">
              Reutilización
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">🌱</div>

            <p className="font-semibold text-gray-700">
              Sostenibilidad
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">💻</div>

            <p className="font-semibold text-gray-700">
              Innovación
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">🤝</div>

            <p className="font-semibold text-gray-700">
              Compromiso
            </p>
          </div>
        </div>
      </section>

      {/* LLAMADO FINAL */}
      <section className="max-w-5xl mx-auto mt-16">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-3xl p-10 md:p-14 text-center shadow-xl">
          <div className="text-5xl mb-5">♻️</div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transformar para construir un futuro sostenible
          </h2>

          <p className="text-lg text-green-50 max-w-2xl mx-auto">
            En CampoLab creemos que los materiales pueden tener una segunda
            oportunidad. Por eso buscamos reutilizar materiales reciclables y
            transformarlos en nuevos productos, apoyándonos en la tecnología
            para facilitar su gestión y acercarlos a nuestros clientes.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Nosotros;