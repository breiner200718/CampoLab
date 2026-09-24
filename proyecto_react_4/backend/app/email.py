import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()


def enviar_correo_recuperacion(correo_destino: str, token: str):
    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    enlace = f"{frontend_url}/restablecer-password?token={token}"

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    mensaje = MIMEMultipart()

    mensaje["From"] = f"CampoLab <{smtp_user}>"
    mensaje["To"] = correo_destino
    mensaje["Subject"] = "Recuperación de contraseña - CampoLab"

    contenido = f"""
Hola,

Recibimos una solicitud para recuperar la contraseña de tu cuenta de CampoLab.

Para establecer una nueva contraseña, entra al siguiente enlace:

{enlace}

Este enlace tiene una duración limitada.

Si tú no solicitaste recuperar tu contraseña, puedes ignorar este correo.

Saludos,

Equipo CampoLab
"""

    mensaje.attach(
        MIMEText(contenido, "plain", "utf-8")
    )

    with smtplib.SMTP(smtp_host, smtp_port) as servidor:
        servidor.starttls()

        servidor.login(
            smtp_user,
            smtp_password
        )

        servidor.sendmail(
            smtp_user,
            correo_destino,
            mensaje.as_string()
        )