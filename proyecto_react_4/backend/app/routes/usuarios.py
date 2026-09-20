from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario
from app.schemas import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.auth import (
    obtener_hash_contrasena,
    obtener_usuario_actual,
    requiere_roles
)


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


# ============================================================
# REGISTRAR USUARIO
# ============================================================

@router.post(
    "/",
    response_model=UsuarioResponse,
    status_code=201
)
def registrar_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):
    # Verificar si el correo ya existe
    usuario_existente = (
        db.query(Usuario)
        .filter(Usuario.correo == usuario.correo)
        .first()
    )

    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="El correo ya está registrado"
        )

    # Verificar si el documento ya existe
    documento_existente = (
        db.query(Usuario)
        .filter(
            Usuario.numero_documento == usuario.numero_documento
        )
        .first()
    )

    if documento_existente:
        raise HTTPException(
            status_code=400,
            detail="El número de documento ya está registrado"
        )

    # Crear usuario
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        tipo_documento=usuario.tipo_documento,
        numero_documento=usuario.numero_documento,
        direccion=usuario.direccion,
        telefono=usuario.telefono,
        correo=usuario.correo,
        contrasena=obtener_hash_contrasena(
            usuario.contrasena
        ),
        id_rol=usuario.id_rol
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario


# ============================================================
# OBTENER MI USUARIO
# ============================================================

@router.get(
    "/me",
    response_model=UsuarioResponse
)
def obtener_mi_usuario(
    usuario_actual: Usuario = Depends(
        obtener_usuario_actual
    )
):
    return usuario_actual


# ============================================================
# LISTAR USUARIOS
# ============================================================

@router.get(
    "/",
    response_model=list[UsuarioResponse]
)
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(
        requiere_roles(1, 2)
    )
):
    usuarios = db.query(Usuario).all()

    return usuarios


# ============================================================
# OBTENER USUARIO POR ID
# ============================================================

@router.get(
    "/{id_usuario}",
    response_model=UsuarioResponse
)
def obtener_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(
        obtener_usuario_actual
    )
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id_usuario == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    # El cliente solamente puede consultar su propio usuario
    if (
        usuario_actual.id_rol == 3
        and usuario_actual.id_usuario != id_usuario
    ):
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para consultar este usuario"
        )

    return usuario


# ============================================================
# ACTUALIZAR USUARIO
# ============================================================

@router.put(
    "/{id_usuario}",
    response_model=UsuarioResponse
)
def actualizar_usuario(
    id_usuario: int,
    datos: UsuarioUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(
        obtener_usuario_actual
    )
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id_usuario == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    # El cliente solamente puede modificar su propio usuario
    if (
        usuario_actual.id_rol == 3
        and usuario_actual.id_usuario != id_usuario
    ):
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para modificar este usuario"
        )

    datos_actualizados = datos.model_dump(
        exclude_unset=True
    )

    for campo, valor in datos_actualizados.items():

        if campo == "contrasena":
            valor = obtener_hash_contrasena(valor)

        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)

    return usuario

# ============================================================
# CAMBIAR ESTADO DEL USUARIO
# ============================================================

@router.patch("/{id_usuario}/estado")
def cambiar_estado_usuario(
    id_usuario: int,
    estado: bool,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(
        requiere_roles(1)
    )
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id_usuario == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario.estado = estado

    db.commit()
    db.refresh(usuario)

    return {
        "mensaje": "Estado del usuario actualizado correctamente",
        "id_usuario": usuario.id_usuario,
        "estado": usuario.estado
    }


# ============================================================
# ELIMINAR USUARIO
# ============================================================

@router.delete(
    "/{id_usuario}"
)
def eliminar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(
        requiere_roles(1)
    )
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id_usuario == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    db.delete(usuario)
    db.commit()

    return {
        "mensaje": "Usuario eliminado correctamente"
    }