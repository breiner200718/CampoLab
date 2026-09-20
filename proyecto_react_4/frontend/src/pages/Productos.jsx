import { useEffect, useState } from 'react'

function Productos() {

  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    cargarProductos()
  }, [])


  const cargarProductos = async () => {

    try {

      setCargando(true)
      setError("")

      const respuesta = await fetch(
        "http://127.0.0.1:8000/productos/"
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudieron cargar los productos."
        )
      }

      setProductos(datos)

    } catch (error) {

      console.error(error)
      setError(error.message)

    } finally {

      setCargando(false)

    }

  }


  return (

    <main className="min-h-screen w-full overflow-x-hidden bg-[#f5f5dc]">


      {/* =========================
          HERO
      ========================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-700 text-white">

        <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 md:w-72 md:h-72 bg-green-500/20 rounded-full blur-3xl"></div>

        <div className="absolute -bottom-20 -left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-green-400/10 rounded-full blur-3xl"></div>


        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 md:py-28 text-center">

          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 text-3xl sm:text-4xl mb-6">
            ♻️
          </div>


          <p className="text-green-300 font-semibold uppercase tracking-[2px] sm:tracking-[3px] text-xs sm:text-sm mb-4">
            CampoLab
          </p>


          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Nuestros Productos
          </h1>


          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-green-100 leading-7 sm:leading-relaxed">
            Descubre productos creados con creatividad, reutilización
            y compromiso con el medio ambiente.
          </p>

        </div>

      </section>



      {/* =========================
          INTRODUCCIÓN
      ========================== */}

      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16 text-center">

        <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-5">
          🌱 Productos responsables
        </span>


        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-5">
          Dale una segunda oportunidad a los materiales
        </h2>


        <p className="text-gray-600 text-base sm:text-lg leading-7 sm:leading-8 max-w-3xl mx-auto">
          En CampoLab creemos que muchos materiales pueden volver a ser útiles.
          Por eso buscamos transformar ideas en productos funcionales,
          creativos y amigables con nuestro planeta.
        </p>

      </section>



      {/* =========================
          PRODUCTOS
      ========================== */}

      <section className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 sm:pb-20">

        {cargando && (

          <div className="text-center py-10">

            <p className="text-gray-600 text-lg">
              Cargando productos...
            </p>

          </div>

        )}


        {error && (

          <div className="text-center py-10">

            <p className="text-red-600 text-lg font-semibold">
              {error}
            </p>

          </div>

        )}


        {!cargando && !error && productos.length === 0 && (

          <div className="text-center py-10">

            <p className="text-gray-600 text-lg">
              No hay productos disponibles actualmente.
            </p>

          </div>

        )}


        {!cargando && !error && productos.length > 0 && (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {productos.map((producto) => (

              <article
                key={producto.id_producto}
                className="
                  group
                  flex
                  flex-col
                  h-full
                  bg-[#fffff5]
                  rounded-3xl
                  overflow-hidden
                  border
                  border-green-100
                  shadow-md
                  hover:shadow-2xl
                  hover:-translate-y-2
                  transition-all
                  duration-300
                "
              >

                {/* IMAGEN */}

                <div className="relative w-full h-56 overflow-hidden bg-gray-100">

                  {producto.imagen ? (
                    <img
                      src={`http://127.0.0.1:8000/uploads/${producto.imagen}`}
                      alt={producto.nombre}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-5xl">
                      ♻️
                    </div>
                  )}

                  ) : (

                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    ♻️
                  </div>

                  )


                  {/* ESTADO */}

                  <span
                    className="
                      absolute
                      top-4
                      left-4
                      bg-white/95
                      backdrop-blur-sm
                      text-green-800
                      text-xs
                      font-bold
                      px-3
                      py-1.5
                      rounded-full
                      shadow-sm
                    "
                  >
                    ♻️ CampoLab
                  </span>

                </div>



                {/* CONTENIDO */}

                <div className="flex flex-col flex-1 p-6">

                  {/* TÍTULO */}

                  <h3 className="text-xl font-bold text-gray-800 mb-3 min-h-[56px]">

                    {producto.nombre}

                  </h3>



                  {/* DESCRIPCIÓN */}

                  <p className="text-gray-600 text-sm leading-6 mb-4 flex-1">

                    {producto.descripcion || "Producto de CampoLab."}

                  </p>



                  {/* PRECIO */}

                  <p className="text-green-700 text-xl font-bold mb-2">

                    ${Number(producto.precio).toLocaleString("es-CO")}

                  </p>



                  {/* STOCK */}

                  <p className="text-gray-500 text-sm mb-5">

                    {producto.stock > 0
                      ? `Stock disponible: ${producto.stock}`
                      : "Producto agotado"}

                  </p>



                  {/* SEPARADOR */}

                  <div className="border-t border-gray-100 pt-5">


                    {/* BOTÓN */}

                    <button
                      onClick={() => {
                        window.location.href = `/productos/${producto.id_producto}`;
                      }}
                      className="
        w-full
        bg-green-700
        hover:bg-green-800
        text-white
        font-semibold
        py-3
        rounded-xl
        transition
        duration-300
        hover:shadow-lg
    "
                    >
                      Ver producto →
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>



      {/* =========================
          PROPÓSITO
      ========================== */}

      <section className="bg-green-950 text-white">

        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">


            {/* TEXTO */}

            <div className="text-center md:text-left">

              <span className="text-green-300 font-semibold text-sm">
                ♻️ NUESTRO PROPÓSITO
              </span>


              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-5">
                Convertimos materiales en nuevas oportunidades
              </h2>


              <p className="text-green-100 leading-7 sm:leading-8 text-base sm:text-lg">
                Cada material reutilizado representa una oportunidad
                para crear algo nuevo. En CampoLab queremos demostrar
                que la creatividad y el cuidado del medio ambiente
                pueden ir de la mano.
              </p>


              <button
                className="mt-7 bg-white text-green-900 font-bold px-6 sm:px-7 py-3 rounded-xl hover:bg-green-100 transition duration-300"
              >
                Conoce CampoLab
              </button>

            </div>



            {/* ELEMENTO VISUAL */}

            <div className="flex justify-center">

              <div className="w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full bg-green-800 border-4 sm:border-8 border-green-700 flex items-center justify-center">

                <div className="text-center">

                  <div className="text-5xl sm:text-6xl md:text-7xl mb-3">
                    🌎
                  </div>

                  <p className="text-lg sm:text-xl font-bold">
                    Cuidemos
                  </p>

                  <p className="text-green-300 font-semibold">
                    nuestro planeta
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* =========================
          BENEFICIOS
      ========================== */}

      <section className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">

        <div className="text-center mb-10 sm:mb-12">

          <span className="text-green-700 font-semibold text-sm">
            CAMPO LAB
          </span>


          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-3">
            ¿Por qué elegir nuestros productos?
          </h2>

        </div>



        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">


          <div className="bg-[#fffff5] rounded-2xl p-6 sm:p-8 text-center shadow-md hover:shadow-xl transition duration-300">

            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto flex items-center justify-center bg-green-100 rounded-full text-2xl sm:text-3xl mb-5">
              🌱
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
              Ecológicos
            </h3>

            <p className="text-sm sm:text-base text-gray-600 leading-6 sm:leading-7">
              Promovemos el aprovechamiento de materiales y la reducción
              de residuos.
            </p>

          </div>



          <div className="bg-[#fffff5] rounded-2xl p-6 sm:p-8 text-center shadow-md hover:shadow-xl transition duration-300">

            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto flex items-center justify-center bg-green-100 rounded-full text-2xl sm:text-3xl mb-5">
              💡
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
              Innovadores
            </h3>

            <p className="text-sm sm:text-base text-gray-600 leading-6 sm:leading-7">
              Buscamos nuevas ideas para convertir materiales en productos
              útiles y creativos.
            </p>

          </div>



          <div className="bg-[#fffff5] rounded-2xl p-6 sm:p-8 text-center shadow-md hover:shadow-xl transition duration-300">

            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto flex items-center justify-center bg-green-100 rounded-full text-2xl sm:text-3xl mb-5">
              💚
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
              Sostenibles
            </h3>

            <p className="text-sm sm:text-base text-gray-600 leading-6 sm:leading-7">
              Apostamos por una forma más responsable de utilizar
              y reutilizar los recursos.
            </p>

          </div>

        </div>

      </section>



      {/* =========================
          FINAL
      ========================== */}

      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white">

        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-16 text-center">

          <div className="text-4xl sm:text-5xl mb-5">
            💚
          </div>


          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
            Juntos podemos hacer la diferencia
          </h2>


          <p className="text-green-50 text-base sm:text-lg max-w-2xl mx-auto leading-7 sm:leading-8">
            Cada producto reutilizado es un pequeño paso hacia un futuro
            más responsable y sostenible.
          </p>

        </div>

      </section>

    </main>

  )
}

export default Productos