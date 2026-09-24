import os
import resend
from dotenv import load_dotenv

load_dotenv()


def enviar_correo_recuperacion(correo_destino: str, token: str):

    resend.api_key = os.getenv("RESEND_API_KEY")

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    enlace = f"{frontend_url}/restablecer-password?token={token}"

    params = {
        "from": "CampoLab <onboarding@resend.dev>",
        "to": [correo_destino],
        "subject": "Recuperación de contraseña - CampoLab",
        "text": f"""
Hola,

Recibimos una solicitud para recuperar la contraseña de tu cuenta de CampoLab.

Para establecer una nueva contraseña, entra al siguiente enlace:

{enlace}

Este enlace tiene una duración limitada.

Si tú no solicitaste recuperar tu contraseña, puedes ignorar este correo.

Saludos,

Equipo CampoLab
"""
    }

    resend.Emails.send(params)