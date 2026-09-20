from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session
from sqlalchemy import func

from io import BytesIO
from datetime import date

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from openpyxl import Workbook

from app.database import get_db
from app.models import Venta, VentaDetalle, Producto, Usuario
from app.schemas import VentaCreate, VentaResponse
from app.auth import obtener_usuario_actual


router = APIRouter(
    prefix="/ventas",
    tags=["Ventas"]
)


# ============================================================
# REGISTRAR UNA VENTA
# ============================================================

@router.post("/", response_model=VentaResponse)
def registrar_venta(
    venta_data: VentaCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    cliente = db.query(Usuario).filter(
        Usuario.id_usuario == venta_data.id_cliente
    ).first()

    if not cliente:
        raise HTTPException(
            status_code=404,
            detail="El cliente no existe"
        )

    if cliente.id_rol != 3:
        raise HTTPException(
            status_code=400,
            detail="El usuario seleccionado no es un cliente"
        )

    if not venta_data.productos:
        raise HTTPException(
            status_code=400,
            detail="La venta debe contener al menos un producto"
        )

    subtotal_venta = 0
    detalles_temporales = []

    # --------------------------------------------------------
    # Verificar productos y stock
    # --------------------------------------------------------

    for item in venta_data.productos:

        producto = db.query(Producto).filter(
            Producto.id_producto == item.id_producto,
            Producto.estado == True
        ).first()

        if not producto:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"El producto con ID {item.id_producto} "
                    f"no existe o está inactivo"
                )
            )

        if producto.stock < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Stock insuficiente para el producto "
                    f"'{producto.nombre}'. "
                    f"Stock disponible: {producto.stock}"
                )
            )

        subtotal_producto = (
            float(producto.precio) * item.cantidad
        )

        subtotal_venta += subtotal_producto

        detalles_temporales.append({
            "producto": producto,
            "cantidad": item.cantidad,
            "precio_unitario": float(producto.precio),
            "subtotal": subtotal_producto
        })

    # --------------------------------------------------------
    # Crear número de factura
    # --------------------------------------------------------

    ultima_venta = db.query(
        func.max(Venta.id_venta)
    ).scalar()

    siguiente_id = (ultima_venta or 0) + 1

    numero_factura = f"FAC-{siguiente_id:06d}"

    # --------------------------------------------------------
    # Crear la venta
    # --------------------------------------------------------

    nueva_venta = Venta(
        id_cliente=venta_data.id_cliente,
        id_usuario=usuario_actual.id_usuario,
        numero_factura=numero_factura,
        subtotal=subtotal_venta,
        total=subtotal_venta,
        estado=True
    )

    db.add(nueva_venta)

    db.flush()

    # --------------------------------------------------------
    # Crear detalles y descontar stock
    # --------------------------------------------------------

    for detalle in detalles_temporales:

        nuevo_detalle = VentaDetalle(
            id_venta=nueva_venta.id_venta,
            id_producto=detalle["producto"].id_producto,
            cantidad=detalle["cantidad"],
            precio_unitario=detalle["precio_unitario"],
            subtotal=detalle["subtotal"]
        )

        db.add(nuevo_detalle)

        detalle["producto"].stock -= detalle["cantidad"]

    # --------------------------------------------------------
    # Guardar
    # --------------------------------------------------------

    try:

        db.commit()
        db.refresh(nueva_venta)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="No se pudo registrar la venta"
        )

    detalles = db.query(VentaDetalle).filter(
        VentaDetalle.id_venta == nueva_venta.id_venta
    ).all()

    return VentaResponse(
        id_venta=nueva_venta.id_venta,
        id_cliente=nueva_venta.id_cliente,
        id_usuario=nueva_venta.id_usuario,
        numero_factura=nueva_venta.numero_factura,
        subtotal=float(nueva_venta.subtotal),
        total=float(nueva_venta.total),
        estado=nueva_venta.estado,

        # FECHA DE CREACIÓN
        fecha_creacion=nueva_venta.fecha_creacion,

        detalles=[
            {
                "id_detalle": detalle.id_detalle,
                "id_venta": detalle.id_venta,
                "id_producto": detalle.id_producto,
                "cantidad": detalle.cantidad,
                "precio_unitario": float(
                    detalle.precio_unitario
                ),
                "subtotal": float(
                    detalle.subtotal
                )
            }
            for detalle in detalles
        ]
    )


# ============================================================
# LISTAR VENTAS CON FILTROS
# ============================================================

@router.get("/", response_model=list[VentaResponse])
def listar_ventas(
    id_cliente: int | None = None,
    numero_factura: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    consulta = db.query(Venta)

    # --------------------------------------------------------
    # SEGURIDAD POR ROL
    # --------------------------------------------------------

    if usuario_actual.id_rol == 3:

        # El cliente solamente puede ver sus propias ventas
        consulta = consulta.filter(
            Venta.id_cliente == usuario_actual.id_usuario
        )

    else:

        # Administrador y empleado pueden filtrar por cliente
        if id_cliente is not None:

            consulta = consulta.filter(
                Venta.id_cliente == id_cliente
            )

    # --------------------------------------------------------
    # FILTRO POR NÚMERO DE FACTURA
    # --------------------------------------------------------

    if numero_factura is not None:

        consulta = consulta.filter(
            Venta.numero_factura.ilike(
                f"%{numero_factura}%"
            )
        )

    # --------------------------------------------------------
    # Ordenar de más reciente a más antigua
    # --------------------------------------------------------

    ventas = (
        consulta
        .order_by(Venta.id_venta.desc())
        .all()
    )

    resultado = []

    # --------------------------------------------------------
    # Construir respuesta
    # --------------------------------------------------------

    for venta in ventas:

        detalles = db.query(VentaDetalle).filter(
            VentaDetalle.id_venta == venta.id_venta
        ).all()

        resultado.append(
            VentaResponse(
                id_venta=venta.id_venta,
                id_cliente=venta.id_cliente,
                id_usuario=venta.id_usuario,
                numero_factura=venta.numero_factura,
                subtotal=float(venta.subtotal),
                total=float(venta.total),
                estado=venta.estado,

                # FECHA DE CREACIÓN
                fecha_creacion=venta.fecha_creacion,

                detalles=[
                    {
                        "id_detalle": detalle.id_detalle,
                        "id_venta": detalle.id_venta,
                        "id_producto": detalle.id_producto,
                        "cantidad": detalle.cantidad,
                        "precio_unitario": float(
                            detalle.precio_unitario
                        ),
                        "subtotal": float(
                            detalle.subtotal
                        )
                    }
                    for detalle in detalles
                ]
            )
        )

    return resultado


# ============================================================
# REPORTE DE VENTAS DEL DÍA
# ============================================================

@router.get("/reporte-diario")
def reporte_diario(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    fecha_actual = date.today()

    ventas = (
        db.query(Venta)
        .filter(
            func.date(Venta.fecha_creacion) == fecha_actual,
            Venta.estado == True
        )
        .all()
    )

    cantidad_ventas = len(ventas)

    total_vendido = sum(
        float(venta.total or 0)
        for venta in ventas
    )

    return {
        "fecha": fecha_actual.strftime("%Y-%m-%d"),
        "cantidad_ventas": cantidad_ventas,
        "total_vendido": total_vendido
    }


# ============================================================
# RESUMEN DE VENTAS POR FECHA
# ============================================================

@router.get("/resumen")
def resumen_ventas(
    fecha_inicio: str | None = None,
    fecha_fin: str | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    consulta = (
        db.query(
            func.date(Venta.fecha_creacion).label("fecha"),
            func.count(Venta.id_venta).label("cantidad_ventas"),
            func.sum(Venta.total).label("total_vendido")
        )
        .filter(
            Venta.estado == True
        )
    )

    # --------------------------------------------------------
    # FILTRO POR FECHA INICIAL
    # --------------------------------------------------------

    if fecha_inicio:

        consulta = consulta.filter(
            func.date(Venta.fecha_creacion) >= fecha_inicio
        )

    # --------------------------------------------------------
    # FILTRO POR FECHA FINAL
    # --------------------------------------------------------

    if fecha_fin:

        consulta = consulta.filter(
            func.date(Venta.fecha_creacion) <= fecha_fin
        )

    # --------------------------------------------------------
    # AGRUPAR Y ORDENAR
    # --------------------------------------------------------

    ventas = (
        consulta
        .group_by(
            func.date(Venta.fecha_creacion)
        )
        .order_by(
            func.date(Venta.fecha_creacion)
        )
        .all()
    )

    # --------------------------------------------------------
    # RESPUESTA
    # --------------------------------------------------------

    return {
        "ventas": [
            {
                "fecha": str(venta.fecha),
                "cantidad_ventas": int(
                    venta.cantidad_ventas
                ),
                "total_vendido": float(
                    venta.total_vendido or 0
                )
            }
            for venta in ventas
        ]
    }


# ============================================================
# EXPORTAR VENTAS A EXCEL
# ============================================================

@router.get("/exportar/excel")
def exportar_ventas_excel(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    ventas = (
        db.query(Venta)
        .order_by(Venta.id_venta.desc())
        .all()
    )

    libro = Workbook()

    hoja = libro.active
    hoja.title = "Ventas"

    hoja.append([
        "ID Venta",
        "Número de factura",
        "ID Cliente",
        "ID Usuario",
        "Subtotal",
        "Total",
        "Estado",
        "Fecha"
    ])

    for venta in ventas:

        hoja.append([
            venta.id_venta,
            venta.numero_factura,
            venta.id_cliente,
            venta.id_usuario,
            float(venta.subtotal),
            float(venta.total),
            "Activa" if venta.estado else "Inactiva",
            venta.fecha_creacion
        ])

    anchos = {
        "A": 12,
        "B": 20,
        "C": 15,
        "D": 15,
        "E": 15,
        "F": 15,
        "G": 15,
        "H": 22
    }

    for columna, ancho in anchos.items():
        hoja.column_dimensions[columna].width = ancho

    archivo = BytesIO()

    libro.save(archivo)

    archivo.seek(0)

    return StreamingResponse(
        archivo,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                "attachment; filename=ventas_campolab.xlsx"
        }
    )


# ============================================================
# GENERAR FACTURA PDF
# ============================================================

@router.get("/{id_venta}/factura/pdf")
def generar_factura_pdf(
    id_venta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    # --------------------------------------------------------
    # Buscar la venta
    # --------------------------------------------------------

    venta = db.query(Venta).filter(
        Venta.id_venta == id_venta
    ).first()

    if not venta:

        raise HTTPException(
            status_code=404,
            detail="La venta no existe"
        )

    # --------------------------------------------------------
    # SEGURIDAD POR ROL
    # --------------------------------------------------------

    if (
        usuario_actual.id_rol == 3
        and venta.id_cliente != usuario_actual.id_usuario
    ):

        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para descargar esta factura"
        )

    # --------------------------------------------------------
    # Buscar cliente
    # --------------------------------------------------------

    cliente = db.query(Usuario).filter(
        Usuario.id_usuario == venta.id_cliente
    ).first()

    # --------------------------------------------------------
    # Buscar detalles
    # --------------------------------------------------------

    detalles = db.query(VentaDetalle).filter(
        VentaDetalle.id_venta == venta.id_venta
    ).all()

    # --------------------------------------------------------
    # Crear PDF en memoria
    # --------------------------------------------------------

    archivo = BytesIO()

    pdf = canvas.Canvas(
        archivo,
        pagesize=letter
    )

    ancho, alto = letter

    # --------------------------------------------------------
    # ENCABEZADO
    # --------------------------------------------------------

    pdf.setFont("Helvetica-Bold", 20)

    pdf.drawString(
        50,
        alto - 60,
        "CAMPOLAB"
    )

    pdf.setFont("Helvetica-Bold", 14)

    pdf.drawString(
        50,
        alto - 90,
        "FACTURA DE VENTA"
    )

    # --------------------------------------------------------
    # INFORMACIÓN DE LA FACTURA
    # --------------------------------------------------------

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        50,
        alto - 120,
        f"Factura: {venta.numero_factura}"
    )

    pdf.drawString(
        50,
        alto - 140,
        f"Fecha: {venta.fecha_creacion}"
    )

    if cliente:

        nombre_cliente = (
            f"{cliente.nombre} {cliente.apellido}"
        )

        pdf.drawString(
            50,
            alto - 160,
            f"Cliente: {nombre_cliente}"
        )

        pdf.drawString(
            50,
            alto - 180,
            f"Correo: {cliente.correo}"
        )

    # --------------------------------------------------------
    # ENCABEZADOS DE PRODUCTOS
    # --------------------------------------------------------

    posicion_y = alto - 220

    pdf.setFont("Helvetica-Bold", 10)

    pdf.drawString(
        50,
        posicion_y,
        "Producto"
    )

    pdf.drawString(
        300,
        posicion_y,
        "Cantidad"
    )

    pdf.drawString(
        380,
        posicion_y,
        "Precio"
    )

    pdf.drawString(
        470,
        posicion_y,
        "Subtotal"
    )

    # --------------------------------------------------------
    # PRODUCTOS
    # --------------------------------------------------------

    posicion_y -= 25

    pdf.setFont("Helvetica", 9)

    for detalle in detalles:

        producto = db.query(Producto).filter(
            Producto.id_producto == detalle.id_producto
        ).first()

        nombre_producto = (
            producto.nombre
            if producto
            else "Producto no encontrado"
        )

        if len(nombre_producto) > 35:
            nombre_producto = nombre_producto[:35] + "..."

        pdf.drawString(
            50,
            posicion_y,
            nombre_producto
        )

        pdf.drawString(
            300,
            posicion_y,
            str(detalle.cantidad)
        )

        pdf.drawString(
            380,
            posicion_y,
            f"${float(detalle.precio_unitario):,.2f}"
        )

        pdf.drawString(
            470,
            posicion_y,
            f"${float(detalle.subtotal):,.2f}"
        )

        posicion_y -= 20

        if posicion_y < 100:

            pdf.showPage()

            posicion_y = alto - 60

            pdf.setFont(
                "Helvetica",
                9
            )

    # --------------------------------------------------------
    # TOTALES
    # --------------------------------------------------------

    posicion_y -= 20

    pdf.setFont(
        "Helvetica-Bold",
        11
    )

    pdf.drawString(
        350,
        posicion_y,
        "Subtotal:"
    )

    pdf.drawString(
        470,
        posicion_y,
        f"${float(venta.subtotal):,.2f}"
    )

    posicion_y -= 25

    pdf.setFont(
        "Helvetica-Bold",
        13
    )

    pdf.drawString(
        350,
        posicion_y,
        "TOTAL:"
    )

    pdf.drawString(
        470,
        posicion_y,
        f"${float(venta.total):,.2f}"
    )

    # --------------------------------------------------------
    # PIE DE FACTURA
    # --------------------------------------------------------

    posicion_y -= 50

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        50,
        posicion_y,
        "Gracias por comprar en CampoLab."
    )

    # --------------------------------------------------------
    # Finalizar PDF
    # --------------------------------------------------------

    pdf.save()

    archivo.seek(0)

    # --------------------------------------------------------
    # Descargar PDF
    # --------------------------------------------------------

    return StreamingResponse(
        archivo,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f"attachment; "
                f"filename=factura_{venta.numero_factura}.pdf"
            )
        }
    )


# ============================================================
# CONSULTAR UNA VENTA
# ============================================================

@router.get(
    "/{id_venta}",
    response_model=VentaResponse
)
def obtener_venta(
    id_venta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    venta = db.query(Venta).filter(
        Venta.id_venta == id_venta
    ).first()

    if not venta:

        raise HTTPException(
            status_code=404,
            detail="La venta no existe"
        )

    # --------------------------------------------------------
    # Seguridad por rol
    # --------------------------------------------------------

    if (
        usuario_actual.id_rol == 3
        and venta.id_cliente != usuario_actual.id_usuario
    ):

        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para consultar esta venta"
        )

    detalles = db.query(VentaDetalle).filter(
        VentaDetalle.id_venta == venta.id_venta
    ).all()

    return VentaResponse(
        id_venta=venta.id_venta,
        id_cliente=venta.id_cliente,
        id_usuario=venta.id_usuario,
        numero_factura=venta.numero_factura,
        subtotal=float(venta.subtotal),
        total=float(venta.total),
        estado=venta.estado,

        # FECHA DE CREACIÓN
        fecha_creacion=venta.fecha_creacion,

        detalles=[
            {
                "id_detalle": detalle.id_detalle,
                "id_venta": detalle.id_venta,
                "id_producto": detalle.id_producto,
                "cantidad": detalle.cantidad,
                "precio_unitario": float(
                    detalle.precio_unitario
                ),
                "subtotal": float(
                    detalle.subtotal
                )
            }
            for detalle in detalles
        ]
    )