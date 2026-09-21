import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


def enviar_correo_recuperacion(correo_destino: str, token: str):

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    enlace = (
        f"{frontend_url}/restablecer-password?token={token}"
    )

    mensaje = EmailMessage()

    mensaje["Subject"] = "Recuperación de contraseña - CampoLab"
    mensaje["From"] = smtp_user
    mensaje["To"] = correo_destino

    mensaje.set_content(
        f"""
Hola,

Recibimos una solicitud para recuperar la contraseña de tu cuenta de CampoLab.

Para establecer una nueva contraseña, entra al siguiente enlace:

{enlace}

Este enlace tiene una duración limitada.

Si tú no solicitaste recuperar tu contraseña, puedes ignorar este correo.

Saludos,

Equipo CampoLab
"""
    )

    with smtplib.SMTP(smtp_host, smtp_port) as servidor:
        servidor.starttls()

        servidor.login(
            smtp_user,
            smtp_password
        )

        servidor.send_message(mensaje)