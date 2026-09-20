from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario


# ============================================================
# CONFIGURACIÓN DE SEGURIDAD
# ============================================================

SECRET_KEY = "campo-lab-clave-secreta"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 120


# ============================================================
# BCRYPT
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def verificar_contrasena(
    contrasena_plana: str,
    contrasena_hash: str
) -> bool:

    return pwd_context.verify(
        contrasena_plana,
        contrasena_hash
    )


def obtener_hash_contrasena(
    contrasena: str
) -> str:

    return pwd_context.hash(contrasena)


# ============================================================
# JWT
# ============================================================

def crear_token_acceso(data: dict) -> str:

    datos = data.copy()

    expiracion = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    datos.update({
        "exp": expiracion
    })

    token = jwt.encode(
        datos,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# ============================================================
# OBTENER TOKEN
# ============================================================

security = HTTPBearer()


# ============================================================
# OBTENER USUARIO ACTUAL
# ============================================================

def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el token",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    token = credenciales.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        id_usuario = payload.get("id")

        if id_usuario is None:
            raise credenciales_invalidas

    except JWTError:

        raise credenciales_invalidas

    usuario = (
        db.query(Usuario)
        .filter(Usuario.id_usuario == id_usuario)
        .first()
    )

    if usuario is None:
        raise credenciales_invalidas

    return usuario


# ============================================================
# CONTROL DE ROLES
# ============================================================

def requiere_roles(*roles_permitidos):

    def verificar_rol(
        usuario_actual: Usuario = Depends(obtener_usuario_actual)
    ):

        if usuario_actual.id_rol not in roles_permitidos:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción"
            )

        return usuario_actual

    return verificar_rol