function Nosotros() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-6 py-16">

      {/* ENCABEZADO */}
      <section className="max-w-5xl mx-auto text-center">

        <span className="inline-block bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold mb-6">
          🌱 Conectando tecnología y campo
        </span>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Conoce <span className="text-green-600">CampoLab</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Somos una plataforma creada para facilitar el acceso a productos
          y soluciones agrícolas, utilizando la tecnología para conectar
          las necesidades del campo con herramientas modernas y eficientes.
        </p>

      </section>

      {/* QUIÉNES SOMOS */}
      <section className="max-w-6xl mx-auto mt-16">

        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-green-100">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            <div>
              <span className="text-green-600 font-semibold">
                🌾 ¿Quiénes somos?
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-3 mb-5">
                Una nueva forma de acercarse al campo
              </h2>

              <p className="text-gray-600 leading-relaxed text-lg">
                CampoLab es un proyecto enfocado en facilitar la
                comercialización y consulta de productos relacionados
                con el sector agrícola. Nuestra plataforma integra
                tecnología y gestión para ofrecer una experiencia
                sencilla, organizada y accesible.
              </p>
            </div>

            <div className="bg-green-600 rounded-3xl p-10 text-white text-center">

              <div className="text-6xl mb-5">
                🌱
              </div>

              <h3 className="text-3xl font-bold mb-4">
                Campo + Tecnología
              </h3>

              <p className="text-green-50 leading-relaxed">
                Utilizamos herramientas digitales para construir
                soluciones que aporten al crecimiento y desarrollo
                del sector agrícola.
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

            <div className="text-5xl mb-5">
              🎯
            </div>

            <h3 className="text-2xl font-bold text-green-600 mb-4">
              Nuestra misión
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Facilitar el acceso a productos agrícolas mediante
              una plataforma tecnológica sencilla, organizada y
              pensada para las necesidades de nuestros usuarios.
            </p>

          </div>

          {/* VISIÓN */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-100 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">

            <div className="text-5xl mb-5">
              🚀
            </div>

            <h3 className="text-2xl font-bold text-green-600 mb-4">
              Nuestra visión
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Convertirnos en una plataforma digital que contribuya
              a modernizar la forma en que las personas encuentran
              y gestionan productos relacionados con el campo.
            </p>

          </div>

          {/* COMPROMISO */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-100 text-center transition duration-300 hover:-translate-y-2 hover:shadow-xl">

            <div className="text-5xl mb-5">
              💚
            </div>

            <h3 className="text-2xl font-bold text-green-600 mb-4">
              Nuestro compromiso
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Ofrecer una experiencia confiable y fácil de utilizar,
              promoviendo el uso de la tecnología como herramienta
              para apoyar al sector agrícola.
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
              Confianza
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
            <div className="text-3xl mb-3">🌾</div>
            <p className="font-semibold text-gray-700">
              Compromiso
            </p>
          </div>

        </div>

      </section>

      {/* LLAMADO FINAL */}
      <section className="max-w-5xl mx-auto mt-16">

        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-3xl p-10 md:p-14 text-center shadow-xl">

          <div className="text-5xl mb-5">
            🌾
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            El futuro del campo también es digital
          </h2>

          <p className="text-lg text-green-50 max-w-2xl mx-auto">
            En CampoLab creemos que la tecnología puede ayudar a
            construir un sector agrícola más conectado, eficiente
            y preparado para el futuro.
          </p>

        </div>

      </section>

    </main>
  );
}

export default Nosotros;