from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google import genai
from dotenv import load_dotenv
import os
import time

from app.database import get_db
from app.auth import obtener_usuario_actual
from app.models import Usuario, Producto


# Cargar variables del archivo .env
load_dotenv()


router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)


class MensajeChatbot(BaseModel):
    mensaje: str


# Obtener API Key de Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "No se encontró GEMINI_API_KEY en el archivo .env"
    )


# Configurar Gemini
cliente_gemini = genai.Client(
    api_key=GEMINI_API_KEY
)


@router.post("/")
def atender_cliente(
    datos: MensajeChatbot,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    mensaje = datos.mensaje.strip()

    if not mensaje:
        raise HTTPException(
            status_code=400,
            detail="El mensaje no puede estar vacío"
        )

    try:

        # ============================================================
        # CONSULTAR PRODUCTOS DISPONIBLES
        # ============================================================

        productos = (
            db.query(Producto)
            .filter(
                Producto.estado == True,
                Producto.stock > 0
            )
            .order_by(Producto.nombre.asc())
            .all()
        )

        informacion_productos = []

        for producto in productos:

            informacion_productos.append({
                "nombre": producto.nombre,
                "descripcion": producto.descripcion or "Sin descripción",
                "precio": float(producto.precio),
                "stock": producto.stock
            })


        # ============================================================
        # CREAR INFORMACIÓN DE PRODUCTOS PARA GEMINI
        # ============================================================

        if informacion_productos:

            productos_texto = "\n".join(
                [
                    f"- {producto['nombre']} | "
                    f"Precio: ${producto['precio']:,.0f} | "
                    f"Stock disponible: {producto['stock']} | "
                    f"Descripción: {producto['descripcion']}"
                    for producto in informacion_productos
                ]
            )

        else:

            productos_texto = (
                "Actualmente no hay productos disponibles."
            )


        # ============================================================
        # INSTRUCCIONES DEL ASISTENTE
        # ============================================================

        instrucciones = f"""
        Eres el asistente virtual de atención al cliente de CampoLab.

        CampoLab es una plataforma relacionada con la reutilización
        de materiales reciclables.

        Tu función es brindar atención al cliente de manera amable,
        clara, breve y profesional.

        Puedes ayudar con:

        - Productos.
        - Catálogo.
        - Compras.
        - Carrito.
        - Facturas.
        - PQR.
        - Peticiones.
        - Quejas.
        - Reclamos.
        - Sugerencias.
        - Problemas con la plataforma.
        - Funcionamiento general de CampoLab.

        ============================================================
        PRODUCTOS ACTUALMENTE DISPONIBLES
        ============================================================

        {productos_texto}

        ============================================================

        REGLAS IMPORTANTES:

        1. Cuando el cliente pregunte por productos, utiliza
           exclusivamente la información de productos proporcionada
           anteriormente.

        2. No inventes productos, precios, stock ni características.

        3. Si un producto no aparece en la información proporcionada,
           indica que no tienes información sobre su disponibilidad.

        4. Si el cliente pregunta por el precio de un producto,
           utiliza el precio proporcionado.

        5. Si el cliente pregunta cuánto stock hay, utiliza el stock
           proporcionado.

        6. Los precios deben mostrarse en pesos colombianos (COP).

        7. No solicites contraseñas, API keys ni información sensible.

        8. Si el cliente tiene un problema que no puedes solucionar,
           indícale que puede registrar una PQR.

        9. Si la pregunta no está relacionada con CampoLab o atención
           al cliente, indica amablemente que estás especializado
           en ayudar con CampoLab.

        10. Responde siempre en español.

        11. No afirmes que realizaste una compra, modificaste una
            factura o cambiaste información si realmente no se realizó
            esa operación.

        """

        # ============================================================
        # PROMPT
        # ============================================================

        prompt = f"""
        {instrucciones}

        Mensaje del cliente:

        {mensaje}

        Responde directamente al cliente.
        """


        # ============================================================
        # CONEXIÓN CON GEMINI
        # ============================================================

        respuesta = None

        for intento in range(3):

            try:

                respuesta = cliente_gemini.models.generate_content(
                    model="gemini-3.6-flash",
                    contents=prompt
                )

                break

            except Exception as error:

                print(
                    f"Intento {intento + 1} de Gemini fallido: {error}"
                )

                if intento < 2:

                    tiempo_espera = 5 * (2 ** intento)

                    print(
                        f"Gemini está temporalmente ocupado. "
                        f"Reintentando en {tiempo_espera} segundos..."
                    )

                    time.sleep(tiempo_espera)

                else:

                    print(
                        "Se agotaron los intentos de conexión con Gemini."
                    )

                    raise HTTPException(
                        status_code=503,
                        detail=(
                            "El servicio de inteligencia artificial "
                            "está temporalmente ocupado. "
                            "Intenta nuevamente en unos segundos."
                        )
                    )


        # ============================================================
        # VALIDAR RESPUESTA
        # ============================================================

        if respuesta is None or not respuesta.text:

            raise HTTPException(
                status_code=503,
                detail="Gemini no devolvió una respuesta."
            )


        return {
            "respuesta": respuesta.text
        }


    except HTTPException:
        raise

    except Exception as error:

        print(f"Error en el chatbot: {error}")

        raise HTTPException(
            status_code=500,
            detail="Ocurrió un error al procesar la solicitud."
        )