from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PQR, Usuario
from app.schemas import PQRCreate, PQRUpdate, PQRResponse
from app.auth import obtener_usuario_actual


router = APIRouter(
    prefix="/pqr",
    tags=["PQR"]
)


# ==========================================
# CREAR PQR
# ==========================================

@router.post("/", response_model=PQRResponse)
def crear_pqr(
    datos: PQRCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    nuevo_pqr = PQR(
        id_usuario=usuario_actual.id_usuario,
        tipo=datos.tipo,
        asunto=datos.asunto,
        descripcion=datos.descripcion,
        estado="Pendiente"
    )

    db.add(nuevo_pqr)
    db.commit()
    db.refresh(nuevo_pqr)

    return nuevo_pqr


# ==========================================
# LISTAR PQR
# ==========================================

@router.get("/", response_model=list[PQRResponse])
def listar_pqr(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    # Cliente: solamente puede ver sus propios PQR
    if usuario_actual.id_rol == 3:
        pqr = (
            db.query(PQR)
            .filter(PQR.id_usuario == usuario_actual.id_usuario)
            .order_by(PQR.fecha_creacion.desc())
            .all()
        )

    # Administrador y empleado: pueden ver todos
    else:
        pqr = (
            db.query(PQR)
            .order_by(PQR.fecha_creacion.desc())
            .all()
        )

    return pqr


# ==========================================
# CONSULTAR UN PQR
# ==========================================

@router.get("/{id_pqr}", response_model=PQRResponse)
def obtener_pqr(
    id_pqr: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    pqr = (
        db.query(PQR)
        .filter(PQR.id_pqr == id_pqr)
        .first()
    )

    if not pqr:
        raise HTTPException(
            status_code=404,
            detail="PQR no encontrado"
        )

    # El cliente solamente puede consultar sus propios PQR
    if (
        usuario_actual.id_rol == 3
        and pqr.id_usuario != usuario_actual.id_usuario
    ):
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para consultar este PQR"
        )

    return pqr


# ==========================================
# ACTUALIZAR PQR
# ==========================================

@router.put("/{id_pqr}", response_model=PQRResponse)
def actualizar_pqr(
    id_pqr: int,
    datos: PQRUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    # Solamente administrador y empleado pueden responder
    if usuario_actual.id_rol not in [1, 2]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para actualizar PQR"
        )

    pqr = (
        db.query(PQR)
        .filter(PQR.id_pqr == id_pqr)
        .first()
    )

    if not pqr:
        raise HTTPException(
            status_code=404,
            detail="PQR no encontrado"
        )

    pqr.estado = datos.estado
    pqr.respuesta = datos.respuesta

    db.commit()
    db.refresh(pqr)

    return pqr