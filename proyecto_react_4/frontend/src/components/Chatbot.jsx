import { useEffect, useRef, useState } from "react";

function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([
    {
      tipo: "bot",
      texto:
        "¡Hola! 👋 Soy el asistente de atención al cliente de CampoLab. ¿En qué puedo ayudarte?",
    },
  ]);
  const [cargando, setCargando] = useState(false);

  const mensajesRef = useRef(null);

  // Mantener el chat automáticamente en el último mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  const enviarMensaje = async (e) => {
    e.preventDefault();

    if (!mensaje.trim() || cargando) {
      return;
    }

    const mensajeUsuario = mensaje.trim();

    setMensajes((anteriores) => [
      ...anteriores,
      {
        tipo: "usuario",
        texto: mensajeUsuario,
      },
    ]);

    setMensaje("");
    setCargando(true);

    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "http://127.0.0.1:8000/chatbot/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            mensaje: mensajeUsuario,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "Error al comunicarse con el chatbot"
        );
      }

      setMensajes((anteriores) => [
        ...anteriores,
        {
          tipo: "bot",
          texto: datos.respuesta,
        },
      ]);
    } catch (error) {
      setMensajes((anteriores) => [
        ...anteriores,
        {
          tipo: "bot",
          texto:
            "❌ No pude conectarme con el asistente. Verifica que el servidor de CampoLab esté funcionando.",
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="
          fixed
          bottom-[92px]
          right-6
          z-[9998]
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-green-700
          text-3xl
          text-white
          shadow-xl
          transition
          duration-300
          hover:scale-110
          hover:bg-green-800
        "
        title="Atención al cliente"
        aria-label="Abrir atención al cliente"
      >
        🌱
      </button>

      {/* Ventana del chatbot */}
      {abierto && (
        <div
          className="
            fixed
            bottom-24
            right-6
            z-[9999]
            flex
            h-[560px]
            w-[380px]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-2xl
          "
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between bg-green-700 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              {/* Icono */}
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-2xl
                "
              >
                🤖
              </div>

              <div>
                <h2 className="font-bold">
                  Atención al cliente
                </h2>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-300"></span>

                  <p className="text-xs text-green-100">
                    Asistente CampoLab · En línea
                  </p>
                </div>
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setAbierto(false)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-2xl
                transition
                hover:bg-green-800
              "
              aria-label="Cerrar chatbot"
            >
              ×
            </button>
          </div>

          {/* Mensajes */}
          <div
            ref={mensajesRef}
            className="
              flex-1
              space-y-4
              overflow-y-auto
              bg-gray-50
              p-4
            "
          >
            {/* Separador */}
            <div className="flex justify-center">
              <span
                className="
                  rounded-full
                  bg-gray-200
                  px-3
                  py-1
                  text-[11px]
                  text-gray-500
                "
              >
                Atención al cliente
              </span>
            </div>

            {mensajes.map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.tipo === "usuario"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%] items-end gap-2 ${
                    item.tipo === "usuario"
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      text-sm
                      ${
                        item.tipo === "usuario"
                          ? "bg-gray-300"
                          : "bg-green-700 text-white"
                      }
                    `}
                  >
                    {item.tipo === "usuario" ? "👤" : "🤖"}
                  </div>

                  {/* Burbuja */}
                  <div
                    className={`
                      rounded-2xl
                      px-4
                      py-3
                      text-sm
                      leading-relaxed
                      shadow-sm
                      ${
                        item.tipo === "usuario"
                          ? "rounded-br-md bg-green-700 text-white"
                          : "rounded-bl-md bg-white text-gray-800"
                      }
                    `}
                  >
                    {item.texto}
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de carga */}
            {cargando && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-green-700
                      text-sm
                    "
                  >
                    🤖
                  </div>

                  <div
                    className="
                      rounded-2xl
                      rounded-bl-md
                      bg-white
                      px-4
                      py-3
                      shadow-sm
                    "
                  >
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>

                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.15s]"></span>

                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.3s]"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campo para escribir */}
          <form
            onSubmit={enviarMensaje}
            className="
              flex
              items-center
              gap-2
              border-t
              border-gray-200
              bg-white
              p-3
            "
          >
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={cargando}
              className="
                min-w-0
                flex-1
                rounded-xl
                border
                border-gray-300
                bg-gray-50
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-green-600
                focus:bg-white
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            <button
              type="submit"
              disabled={cargando || !mensaje.trim()}
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-green-700
                text-lg
                text-white
                transition
                hover:bg-green-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              aria-label="Enviar mensaje"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;