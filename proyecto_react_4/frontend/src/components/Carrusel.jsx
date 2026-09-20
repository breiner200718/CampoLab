import { useState, useEffect } from 'react'

import imagen1 from '../assets/img/imagen1.jpg'
import imagen2 from '../assets/img/imagen2.jpg'
import imagen3 from '../assets/img/imagen3.jpg'
import imagen4 from '../assets/img/imagen4.jpg'
import imagen5 from '../assets/img/imagen5.jpg'
import imagen6 from '../assets/img/imagen6.jpg'
import imagen7 from '../assets/img/imagen7.jpg'
import imagen8 from '../assets/img/imagen8.jpg'
import imagen9 from '../assets/img/imagen9.jpg'
import imagen10 from '../assets/img/imagen10.jpg'

function Carrusel() {

  const imagenes = [
    imagen1,
    imagen2,
    imagen3,
    imagen4,
    imagen5,
    imagen6,
    imagen7,
    imagen8,
    imagen9,
    imagen10
  ]

  const informacion = [
    {
      titulo: 'Paisajes naturales',
      descripcion: 'Descubre la belleza de los paisajes y la naturaleza.'
    },
    {
      titulo: 'Atardeceres',
      descripcion: 'Momentos únicos donde el cielo se llena de color.'
    },
    {
      titulo: 'Montañas',
      descripcion: 'Explora increíbles paisajes rodeados de montañas.'
    },
    {
      titulo: 'Aventura',
      descripcion: 'Nuevos lugares para descubrir y disfrutar.'
    },
    {
      titulo: 'Naturaleza',
      descripcion: 'Conecta con la tranquilidad y belleza del entorno.'
    },
    {
      titulo: 'Viajes',
      descripcion: 'Cada lugar tiene una historia diferente por contar.'
    },
    {
      titulo: 'Exploración',
      descripcion: 'Atrévete a conocer nuevos lugares y experiencias.'
    },
    {
      titulo: 'Horizontes',
      descripcion: 'Mira más allá y descubre nuevos horizontes.'
    },
    {
      titulo: 'Momentos',
      descripcion: 'Guarda recuerdos de lugares especiales.'
    },
    {
      titulo: 'Descubre',
      descripcion: 'Siempre hay un nuevo lugar esperando ser descubierto.'
    }
  ]

  const [imagenActual, setImagenActual] = useState(0)

  const siguiente = () => {
    setImagenActual((actual) =>
      actual === imagenes.length - 1 ? 0 : actual + 1
    )
  }

  const anterior = () => {
    setImagenActual((actual) =>
      actual === 0 ? imagenes.length - 1 : actual - 1
    )
  }

  useEffect(() => {

    const intervalo = setInterval(() => {
      siguiente()
    }, 4000)

    return () => clearInterval(intervalo)

  }, [])

  return (
    <section className="relative w-[95%] sm:w-[92%] md:w-[90%] max-w-[1200px] h-[300px] sm:h-[350px] md:h-[400px] mx-auto my-6 md:my-[35px] overflow-hidden rounded-[20px] bg-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">

      {/* IMAGEN */}
      <img
        src={imagenes[imagenActual]}
        alt={informacion[imagenActual].titulo}
        className="w-full h-full object-cover block transition-transform duration-500 ease-in-out"
      />

      {/* CAPA OSCURA */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/10"></div>

      {/* CONTENIDO */}
      <div className="absolute top-1/2 left-[6%] md:left-[8%] -translate-y-1/2 z-[2] text-white max-w-[80%] sm:max-w-[70%] md:max-w-[500px]">

        <h1 className="text-2xl sm:text-3xl md:text-[45px] mb-3 md:mb-[15px] font-bold">
          {informacion[imagenActual].titulo}
        </h1>

        <p className="text-sm sm:text-base md:text-[19px] mb-4 md:mb-[25px] text-gray-200">
          {informacion[imagenActual].descripcion}
        </p>

      </div>

      {/* FLECHA IZQUIERDA */}
      <button
        className="absolute top-1/2 left-3 md:left-[20px] -translate-y-1/2 z-[3] w-9 h-9 md:w-[45px] md:h-[45px] border-none rounded-full bg-white/25 text-white text-base md:text-xl cursor-pointer transition duration-300 hover:bg-white/50 hover:scale-110"
        onClick={anterior}
        aria-label="Imagen anterior"
      >
        ❮
      </button>

      {/* FLECHA DERECHA */}
      <button
        className="absolute top-1/2 right-3 md:right-[20px] -translate-y-1/2 z-[3] w-9 h-9 md:w-[45px] md:h-[45px] border-none rounded-full bg-white/25 text-white text-base md:text-xl cursor-pointer transition duration-300 hover:bg-white/50 hover:scale-110"
        onClick={siguiente}
        aria-label="Imagen siguiente"
      >
        ❯
      </button>

      {/* INDICADORES */}
      <div className="absolute bottom-4 md:bottom-[20px] left-1/2 -translate-x-1/2 z-[4] flex gap-2">

        {imagenes.map((_, index) => (
          <button
            key={index}
            className={`w-[8px] h-[8px] md:w-[9px] md:h-[9px] p-0 border-none rounded-full bg-white cursor-pointer transition duration-300 hover:opacity-80 ${
              index === imagenActual
                ? 'opacity-100 scale-125'
                : 'opacity-50'
            }`}
            onClick={() => setImagenActual(index)}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}

      </div>

    </section>
  )
}

export { Carrusel }