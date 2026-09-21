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

    # Cliente: solamente sus ventas
    if usuario_actual.id_rol == 3:

        consulta = consulta.filter(
            Venta.id_cliente == usuario_actual.id_usuario
        )

    else:

        if id_cliente is not None:

            consulta = consulta.filter(
                Venta.id_cliente == id_cliente
            )

    # Filtro por factura
    if numero_factura is not None:

        consulta = consulta.filter(
            Venta.numero_factura.ilike(
                f"%{numero_factura}%"
            )
        )

    ventas = (
        consulta
        .order_by(Venta.id_venta.desc())
        .all()
    )

    resultado = []

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

    if usuario_actual.id_rol not in [1, 2]:

        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para consultar el reporte diario"
        )

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

    if usuario_actual.id_rol not in [1, 2]:

        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para consultar el resumen de ventas"
        )

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

    if fecha_inicio:

        consulta = consulta.filter(
            func.date(Venta.fecha_creacion) >= fecha_inicio
        )

    if fecha_fin:

        consulta = consulta.filter(
            func.date(Venta.fecha_creacion) <= fecha_fin
        )

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

    if usuario_actual.id_rol not in [1, 2]:

        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para exportar las ventas"
        )

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
# EXPORTAR TODAS LAS VENTAS A PDF
# ============================================================

@router.get("/exportar/pdf")
def exportar_ventas_pdf(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    if usuario_actual.id_rol not in [1, 2]:

        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para exportar las ventas"
        )

    ventas = (
        db.query(Venta)
        .order_by(Venta.id_venta.desc())
        .all()
    )

    archivo = BytesIO()

    pdf = canvas.Canvas(
        archivo,
        pagesize=letter
    )

    ancho, alto = letter

    # --------------------------------------------------------
    # Encabezado
    # --------------------------------------------------------

    pdf.setFont("Helvetica-Bold", 20)

    pdf.drawString(
        50,
        alto - 50,
        "CAMPOLAB"
    )

    pdf.setFont("Helvetica-Bold", 14)

    pdf.drawString(
        50,
        alto - 75,
        "REPORTE GENERAL DE VENTAS"
    )

    pdf.setFont("Helvetica", 9)

    pdf.drawString(
        50,
        alto - 95,
        f"Fecha de generación: {date.today()}"
    )

    # --------------------------------------------------------
    # Encabezados de tabla
    # --------------------------------------------------------

    posicion_y = alto - 130

    pdf.setFont(
        "Helvetica-Bold",
        8
    )

    pdf.drawString(40, posicion_y, "Factura")
    pdf.drawString(130, posicion_y, "Cliente")
    pdf.drawString(210, posicion_y, "Fecha")
    pdf.drawString(300, posicion_y, "Subtotal")
    pdf.drawString(395, posicion_y, "Total")
    pdf.drawString(475, posicion_y, "Estado")

    posicion_y -= 18

    pdf.setFont(
        "Helvetica",
        8
    )

    total_general = 0
    cantidad_ventas = 0

    # --------------------------------------------------------
    # Ventas
    # --------------------------------------------------------

    for venta in ventas:

        cliente = db.query(Usuario).filter(
            Usuario.id_usuario == venta.id_cliente
        ).first()

        if cliente:

            nombre_cliente = (
                f"{cliente.nombre} {cliente.apellido}"
            )

        else:

            nombre_cliente = "Sin cliente"

        if len(nombre_cliente) > 18:
            nombre_cliente = nombre_cliente[:18] + "..."

        factura = venta.numero_factura or "Sin factura"

        fecha_venta = (
            venta.fecha_creacion.strftime("%Y-%m-%d")
            if venta.fecha_creacion
            else "N/A"
        )

        subtotal = float(
            venta.subtotal or 0
        )

        total = float(
            venta.total or 0
        )

        estado = (
            "Activa"
            if venta.estado
            else "Inactiva"
        )

        pdf.drawString(
            40,
            posicion_y,
            factura
        )

        pdf.drawString(
            130,
            posicion_y,
            nombre_cliente
        )

        pdf.drawString(
            210,
            posicion_y,
            fecha_venta
        )

        pdf.drawString(
            300,
            posicion_y,
            f"${subtotal:,.2f}"
        )

        pdf.drawString(
            395,
            posicion_y,
            f"${total:,.2f}"
        )

        pdf.drawString(
            475,
            posicion_y,
            estado
        )

        total_general += total
        cantidad_ventas += 1

        posicion_y -= 18

        # ----------------------------------------------------
        # Nueva página
        # ----------------------------------------------------

        if posicion_y < 80:

            pdf.showPage()

            pdf.setFont(
                "Helvetica-Bold",
                12
            )

            pdf.drawString(
                40,
                alto - 50,
                "CAMPOLAB - REPORTE DE VENTAS"
            )

            posicion_y = alto - 80

            pdf.setFont(
                "Helvetica",
                8
            )

    # --------------------------------------------------------
    # Resumen
    # --------------------------------------------------------

    posicion_y -= 15

    pdf.setFont(
        "Helvetica-Bold",
        10
    )

    pdf.drawString(
        40,
        posicion_y,
        f"Cantidad total de ventas: {cantidad_ventas}"
    )

    posicion_y -= 20

    pdf.drawString(
        40,
        posicion_y,
        f"Total recaudado: ${total_general:,.2f}"
    )

    # --------------------------------------------------------
    # Pie
    # --------------------------------------------------------

    posicion_y -= 40

    pdf.setFont(
        "Helvetica",
        9
    )

    pdf.drawString(
        40,
        posicion_y,
        "Reporte generado por el sistema CampoLab."
    )

    pdf.save()

    archivo.seek(0)

    return StreamingResponse(
        archivo,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; filename=reporte_ventas_campolab.pdf"
        }
    )


# ============================================================
# EXPORTAR REPORTE DIARIO A PDF
# ============================================================

@router.get("/reporte-diario/pdf")
def exportar_reporte_diario_pdf(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):

    if usuario_actual.id_rol not in [1, 2]:

        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para exportar el reporte diario"
        )

    fecha_actual = date.today()

    ventas = (
        db.query(Venta)
        .filter(
            func.date(Venta.fecha_creacion) == fecha_actual,
            Venta.estado == True
        )
        .order_by(Venta.id_venta.desc())
        .all()
    )

    cantidad_ventas = len(ventas)

    total_vendido = sum(
        float(venta.total or 0)
        for venta in ventas
    )

    archivo = BytesIO()

    pdf = canvas.Canvas(
        archivo,
        pagesize=letter
    )

    ancho, alto = letter

    # --------------------------------------------------------
    # Encabezado
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica-Bold",
        20
    )

    pdf.drawString(
        50,
        alto - 50,
        "CAMPOLAB"
    )

    pdf.setFont(
        "Helvetica-Bold",
        14
    )

    pdf.drawString(
        50,
        alto - 75,
        "REPORTE DIARIO DE VENTAS"
    )

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        50,
        alto - 100,
        f"Fecha: {fecha_actual}"
    )

    # --------------------------------------------------------
    # Resumen
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica-Bold",
        11
    )

    pdf.drawString(
        50,
        alto - 135,
        f"Cantidad de ventas: {cantidad_ventas}"
    )

    pdf.drawString(
        50,
        alto - 155,
        f"Total vendido: ${total_vendido:,.2f}"
    )

    # --------------------------------------------------------
    # Tabla
    # --------------------------------------------------------

    posicion_y = alto - 195

    pdf.setFont(
        "Helvetica-Bold",
        9
    )

    pdf.drawString(
        50,
        posicion_y,
        "Factura"
    )

    pdf.drawString(
        180,
        posicion_y,
        "Cliente"
    )

    pdf.drawString(
        330,
        posicion_y,
        "Hora"
    )

    pdf.drawString(
        420,
        posicion_y,
        "Total"
    )

    posicion_y -= 20

    pdf.setFont(
        "Helvetica",
        9
    )

    for venta in ventas:

        cliente = db.query(Usuario).filter(
            Usuario.id_usuario == venta.id_cliente
        ).first()

        if cliente:

            nombre_cliente = (
                f"{cliente.nombre} {cliente.apellido}"
            )

        else:

            nombre_cliente = "Sin cliente"

        if len(nombre_cliente) > 25:
            nombre_cliente = nombre_cliente[:25] + "..."

        hora = (
            venta.fecha_creacion.strftime("%H:%M:%S")
            if venta.fecha_creacion
            else "N/A"
        )

        total = float(
            venta.total or 0
        )

        pdf.drawString(
            50,
            posicion_y,
            venta.numero_factura or "N/A"
        )

        pdf.drawString(
            180,
            posicion_y,
            nombre_cliente
        )

        pdf.drawString(
            330,
            posicion_y,
            hora
        )

        pdf.drawString(
            420,
            posicion_y,
            f"${total:,.2f}"
        )

        posicion_y -= 20

        if posicion_y < 80:

            pdf.showPage()

            pdf.setFont(
                "Helvetica-Bold",
                12
            )

            pdf.drawString(
                50,
                alto - 50,
                "CAMPOLAB - REPORTE DIARIO"
            )

            posicion_y = alto - 80

            pdf.setFont(
                "Helvetica",
                9
            )

    # --------------------------------------------------------
    # Pie
    # --------------------------------------------------------

    posicion_y -= 20

    pdf.setFont(
        "Helvetica",
        9
    )

    pdf.drawString(
        50,
        posicion_y,
        "Reporte generado por el sistema CampoLab."
    )

    pdf.save()

    archivo.seek(0)

    return StreamingResponse(
        archivo,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f"attachment; filename=reporte_diario_{fecha_actual}.pdf"
        }
    )


# ============================================================
# GENERAR FACTURA PDF INDIVIDUAL
# ============================================================

@router.get("/{id_venta}/factura/pdf")
def generar_factura_pdf(
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

    # Cliente solamente puede ver su propia factura
    if (
        usuario_actual.id_rol == 3
        and venta.id_cliente != usuario_actual.id_usuario
    ):

        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para descargar esta factura"
        )

    cliente = db.query(Usuario).filter(
        Usuario.id_usuario == venta.id_cliente
    ).first()

    detalles = db.query(VentaDetalle).filter(
        VentaDetalle.id_venta == venta.id_venta
    ).all()

    archivo = BytesIO()

    pdf = canvas.Canvas(
        archivo,
        pagesize=letter
    )

    ancho, alto = letter

    # --------------------------------------------------------
    # Encabezado
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica-Bold",
        20
    )

    pdf.drawString(
        50,
        alto - 60,
        "CAMPOLAB"
    )

    pdf.setFont(
        "Helvetica-Bold",
        14
    )

    pdf.drawString(
        50,
        alto - 90,
        "FACTURA DE VENTA"
    )

    # --------------------------------------------------------
    # Información
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica",
        10
    )

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
    # Encabezados de productos
    # --------------------------------------------------------

    posicion_y = alto - 220

    pdf.setFont(
        "Helvetica-Bold",
        10
    )

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

    posicion_y -= 25

    pdf.setFont(
        "Helvetica",
        9
    )

    # --------------------------------------------------------
    # Productos
    # --------------------------------------------------------

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
            nombre_producto = (
                nombre_producto[:35] + "..."
            )

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
    # Totales
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
    # Pie
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

    pdf.save()

    archivo.seek(0)

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

    # Cliente solamente puede consultar sus ventas
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