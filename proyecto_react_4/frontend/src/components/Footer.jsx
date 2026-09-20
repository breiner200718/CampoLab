import { Link } from 'react-router-dom'
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa'
import logo from '../assets/img/logo_blanco.png'


function Footer() {

  // 📱 CAMBIA ESTE NÚMERO POR EL TUYO
  // Colombia = 57 + número
  // No pongas +, espacios ni guiones
  const numeroWhatsApp = '573146524784'

  const mensajeWhatsApp = encodeURIComponent(
    'Hola CampoLab, quiero obtener más información sobre sus productos.'
  )

  const enlaceWhatsApp =
    `https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`


  return (

    <footer className="w-full bg-gray-900 text-white mt-[50px]">


      {/* =========================
          CONTENIDO PRINCIPAL
      ========================== */}

      <div
        className="
          w-[90%]
          max-w-7xl
          mx-auto
          py-10
          md:py-14
          flex
          flex-col
          md:flex-row
          justify-between
          items-center
          md:items-start
          gap-10
          md:gap-16
        "
      >


        {/* =========================
            INFORMACIÓN
        ========================== */}

        <div className="flex-[2] text-center md:text-left">

          {/* LOGO */}

          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">

            <img
              src={logo}
              alt="Logo CampoLab"
              className="
                w-20
                h-20
                md:w-24
                md:h-24
                object-contain
              "
            />

            <h2 className="text-2xl md:text-3xl font-bold text-white">
              CampoLab
            </h2>

          </div>


          {/* DESCRIPCIÓN */}

          <p
            className="
              text-gray-400
              leading-7
              max-w-md
              mx-auto
              md:mx-0
            "
          >
            Una aplicación creada con React, pensada para promover
            la reutilización de materiales y contribuir al cuidado
            del medio ambiente.
          </p>

        </div>



        {/* =========================
            ENLACES
        ========================== */}

        <div className="flex-1 text-center md:text-left">

          <h3 className="text-lg mb-5 font-semibold text-white">
            Enlaces
          </h3>


          <Link
            to="/"
            className="
              block
              text-gray-400
              no-underline
              mb-3
              transition
              duration-300
              hover:text-green-400
              hover:translate-x-1
            "
          >
            Inicio
          </Link>


          <Link
            to="/productos"
            className="
              block
              text-gray-400
              no-underline
              mb-3
              transition
              duration-300
              hover:text-green-400
              hover:translate-x-1
            "
          >
            Productos
          </Link>


          <Link
            to="/nosotros"
            className="
              block
              text-gray-400
              no-underline
              mb-3
              transition
              duration-300
              hover:text-green-400
              hover:translate-x-1
            "
          >
            Nosotros
          </Link>


          <Link
            to="/contacto"
            className="
              block
              text-gray-400
              no-underline
              mb-3
              transition
              duration-300
              hover:text-green-400
              hover:translate-x-1
            "
          >
            Contacto
          </Link>


          <Link
            to="/login"
            className="
              block
              text-gray-400
              no-underline
              mb-3
              transition
              duration-300
              hover:text-green-400
              hover:translate-x-1
            "
          >
            Iniciar sesión
          </Link>

        </div>



        {/* =========================
            CONTACTO
        ========================== */}

        <div className="flex-1 text-center md:text-left">

          <h3 className="text-lg mb-5 font-semibold text-white">
            Contacto
          </h3>


          <p className="text-gray-400 leading-7">
            📧 reciclaje@gmail.com
          </p>


          <p className="text-gray-400 leading-7">
            📱 +57 300 000 0000
          </p>


          <p className="text-gray-400 leading-7">
            📍 Colombia
          </p>


         {/* =========================
    REDES SOCIALES
========================== */}

<div className="flex items-center justify-center md:justify-start gap-4 mt-5">

  {/* WHATSAPP */}

  <a
    href={enlaceWhatsApp}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="WhatsApp"
    title="WhatsApp"
    className="
      w-12 h-12
      flex items-center justify-center
      rounded-full
      bg-green-600
      hover:bg-green-500
      text-white
      transition
      duration-300
      hover:scale-110
      shadow-lg
    "
  >
    <FaWhatsapp className="text-2xl" />
  </a>


  {/* FACEBOOK */}

  <a
    href="https://www.facebook.com/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    title="Facebook"
    className="
      w-12 h-12
      flex items-center justify-center
      rounded-full
      bg-blue-600
      hover:bg-blue-500
      text-white
      transition
      duration-300
      hover:scale-110
      shadow-lg
    "
  >
    <FaFacebookF className="text-xl" />
  </a>


  {/* INSTAGRAM */}

  <a
    href="https://www.instagram.com/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    title="Instagram"
    className="
      w-12 h-12
      flex items-center justify-center
      rounded-full
      bg-pink-600
      hover:bg-pink-500
      text-white
      transition
      duration-300
      hover:scale-110
      shadow-lg
    "
  >
    <FaInstagram className="text-2xl" />
  </a>

</div>

        </div>

      </div>
          


      {/* =========================
          PARTE INFERIOR
      ========================== */}

      <div
        className="
          border-t
          border-gray-700
          text-center
          py-5
          px-4
          text-gray-400
        "
      >

        <p className="text-sm">
          © 2026 CampoLab. Todos los derechos reservados.
        </p>

      </div>


    </footer>

  )
}


export { Footer }
