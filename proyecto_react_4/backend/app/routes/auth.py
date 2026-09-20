from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.database import get_db
from app.models import Usuario
from app.email import enviar_correo_recuperacion
from app.schemas import (
    LoginRequest,
    RecuperarPasswordRequest,
    RestablecerPasswordRequest
)
from app.auth import (
    verificar_contrasena,
    crear_token_acceso,
    obtener_hash_contrasena,
    SECRET_KEY,
    ALGORITHM
)


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):

    # Buscar usuario por correo
    usuario = (
        db.query(Usuario)
        .filter(Usuario.correo == datos.correo)
        .first()
    )

    # Verificar que el usuario exista
    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    # Verificar contraseña
    if not verificar_contrasena(
        datos.contrasena,
        usuario.contrasena
    ):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    # Verificar estado del usuario
    if not usuario.estado:
        raise HTTPException(
            status_code=403,
            detail="El usuario está inactivo"
        )

    # Crear JWT
    token = crear_token_acceso({
        "id": usuario.id_usuario,
        "correo": usuario.correo,
        "id_rol": usuario.id_rol
    })

    # Respuesta
    return {
        "access_token": token,
        "token_type": "bearer",
        "mensaje": "Inicio de sesión exitoso",
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo,
            "id_rol": usuario.id_rol
        }
    }


# ============================================================
# RECUPERAR CONTRASEÑA
# ============================================================

@router.post("/recuperar-password")
def recuperar_password(
    datos: RecuperarPasswordRequest,
    db: Session = Depends(get_db)
):

    usuario = (
        db.query(Usuario)
        .filter(Usuario.correo == datos.correo)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="No existe una cuenta registrada con este correo."
        )

    # Crear token de recuperación
    token = crear_token_acceso({
        "id": usuario.id_usuario,
        "tipo": "recuperacion"
    })

    # Enviar correo
    enviar_correo_recuperacion(
        usuario.correo,
        token
    )

    return {
        "mensaje": "Hemos enviado las instrucciones de recuperación a tu correo."
    }


# ============================================================
# RESTABLECER CONTRASEÑA
# ============================================================

@router.post("/restablecer-password")
def restablecer_password(
    datos: RestablecerPasswordRequest,
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            datos.token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # Verificar que sea un token de recuperación
        if payload.get("tipo") != "recuperacion":
            raise HTTPException(
                status_code=400,
                detail="El token no es válido para recuperar la contraseña."
            )

        id_usuario = payload.get("id")

        if not id_usuario:
            raise HTTPException(
                status_code=400,
                detail="Token de recuperación inválido."
            )

    except JWTError:

        raise HTTPException(
            status_code=400,
            detail="El token es inválido o ha expirado."
        )

    # Buscar usuario
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id_usuario == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado."
        )

    # Actualizar contraseña y cifrarla
    usuario.contrasena = obtener_hash_contrasena(
        datos.nueva_contrasena
    )

    db.commit()

    return {
        "mensaje": "Contraseña actualizada correctamente."
    }