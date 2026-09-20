from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    File,
    UploadFile,
    Form
)

from sqlalchemy.orm import Session

import os
import shutil

from app.database import get_db
from app.models import Producto
from app.schemas import ProductoResponse
from app.auth import requiere_roles


# ============================================================
# CARPETA DE IMÁGENES
# ============================================================

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


# ============================================================
# CREAR PRODUCTO
# ============================================================

@router.post(
    "/",
    response_model=ProductoResponse,
    status_code=201
)
def crear_producto(
    nombre: str = Form(...),
    descripcion: str = Form(""),
    precio: float = Form(...),
    stock: int = Form(...),
    imagen: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    usuario_actual=Depends(requiere_roles(1, 2))
):

    nombre_archivo = None

    # --------------------------------------------------------
    # GUARDAR IMAGEN
    # --------------------------------------------------------

    if imagen:

        extension = os.path.splitext(
            imagen.filename
        )[1]

        nombre_archivo = (
            f"producto_{os.urandom(8).hex()}{extension}"
        )

        ruta_archivo = os.path.join(
            UPLOAD_DIR,
            nombre_archivo
        )

        with open(ruta_archivo, "wb") as archivo:

            shutil.copyfileobj(
                imagen.file,
                archivo
            )

    # --------------------------------------------------------
    # CREAR PRODUCTO
    # --------------------------------------------------------

    nuevo_producto = Producto(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        stock=stock,
        imagen=nombre_archivo
    )

    db.add(nuevo_producto)

    db.commit()

    db.refresh(nuevo_producto)

    return nuevo_producto


# ============================================================
# LISTAR PRODUCTOS
# ============================================================

@router.get(
    "/",
    response_model=list[ProductoResponse]
)
def listar_productos(
    db: Session = Depends(get_db)
):

    productos = (
        db.query(Producto)
        .filter(Producto.estado == True)
        .all()
    )

    return productos


# ============================================================
# OBTENER PRODUCTO POR ID
# ============================================================

@router.get(
    "/{id_producto}",
    response_model=ProductoResponse
)
def obtener_producto(
    id_producto: int,
    db: Session = Depends(get_db)
):

    producto = (
        db.query(Producto)
        .filter(
            Producto.id_producto == id_producto,
            Producto.estado == True
        )
        .first()
    )

    if not producto:

        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return producto


# ============================================================
# ACTUALIZAR PRODUCTO
# ============================================================

@router.put(
    "/{id_producto}",
    response_model=ProductoResponse
)
def actualizar_producto(
    id_producto: int,

    nombre: str = Form(...),

    descripcion: str = Form(""),

    precio: float = Form(...),

    stock: int = Form(...),

    imagen: UploadFile | None = File(None),

    estado: bool = Form(True),

    db: Session = Depends(get_db),

    usuario_actual=Depends(requiere_roles(1, 2))
):

    # --------------------------------------------------------
    # BUSCAR PRODUCTO
    # --------------------------------------------------------

    producto = (
        db.query(Producto)
        .filter(
            Producto.id_producto == id_producto
        )
        .first()
    )

    if not producto:

        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )


    # --------------------------------------------------------
    # ACTUALIZAR INFORMACIÓN
    # --------------------------------------------------------

    producto.nombre = nombre

    producto.descripcion = descripcion

    producto.precio = precio

    producto.stock = stock

    producto.estado = estado


    # --------------------------------------------------------
    # ACTUALIZAR IMAGEN
    # --------------------------------------------------------

    if imagen:

        # Guardar nombre de la imagen anterior
        imagen_anterior = producto.imagen


        # Obtener extensión
        extension = os.path.splitext(
            imagen.filename
        )[1]


        # Crear nuevo nombre
        nuevo_nombre = (
            f"producto_{os.urandom(8).hex()}{extension}"
        )


        # Ruta de la nueva imagen
        ruta_nueva = os.path.join(
            UPLOAD_DIR,
            nuevo_nombre
        )


        # Guardar nueva imagen
        with open(
            ruta_nueva,
            "wb"
        ) as archivo:

            shutil.copyfileobj(
                imagen.file,
                archivo
            )


        # Actualizar BD
        producto.imagen = nuevo_nombre


        # ----------------------------------------------------
        # ELIMINAR IMAGEN ANTERIOR
        # ----------------------------------------------------

        if imagen_anterior:

            ruta_anterior = os.path.join(
                UPLOAD_DIR,
                imagen_anterior
            )

            if os.path.exists(ruta_anterior):

                os.remove(ruta_anterior)


    # --------------------------------------------------------
    # GUARDAR CAMBIOS
    # --------------------------------------------------------

    db.commit()

    db.refresh(producto)

    return producto


# ============================================================
# ELIMINAR PRODUCTO
# ============================================================

@router.delete(
    "/{id_producto}"
)
def eliminar_producto(
    id_producto: int,

    db: Session = Depends(get_db),

    usuario_actual=Depends(requiere_roles(1, 2))
):

    # --------------------------------------------------------
    # BUSCAR PRODUCTO
    # --------------------------------------------------------

    producto = (
        db.query(Producto)
        .filter(
            Producto.id_producto == id_producto
        )
        .first()
    )

    if not producto:

        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )


    # --------------------------------------------------------
    # ELIMINAR IMAGEN DEL SERVIDOR
    # --------------------------------------------------------

    if producto.imagen:

        ruta_imagen = os.path.join(
            UPLOAD_DIR,
            producto.imagen
        )

        if os.path.exists(ruta_imagen):

            os.remove(ruta_imagen)


    # --------------------------------------------------------
    # ELIMINAR PRODUCTO
    # --------------------------------------------------------

    db.delete(producto)

    db.commit()


    return {
        "mensaje": "Producto eliminado correctamente"
    }