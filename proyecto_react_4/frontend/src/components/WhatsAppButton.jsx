import { FaWhatsapp } from "react-icons/fa";

function WhatsAppButton() {
  const numero = "573001234567";

  const mensaje =
    "Hola, quiero obtener más información sobre CampoLab.";

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="
        fixed
        bottom-6
        right-6
        z-[9999]
        w-16
        h-16
        bg-green-600
        hover:bg-green-700
        text-white
        rounded-full
        flex
        items-center
        justify-center
        shadow-2xl
        transition
        duration-300
        hover:scale-110
      "
    >
      <FaWhatsapp className="text-4xl" />
    </a>
  );
}

export default WhatsAppButton;