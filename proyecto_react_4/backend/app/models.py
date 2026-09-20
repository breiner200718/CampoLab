from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
    Text,
    DECIMAL,
    func
)

from sqlalchemy.sql import func
from app.database import Base


# ============================================================
# TABLA INTERMEDIA: roles <-> permisos
# ============================================================

rol_permisos = Table(
    "rol_permisos",
    Base.metadata,

    Column(
        "id_rol",
        Integer,
        ForeignKey("roles.id_rol"),
        primary_key=True
    ),

    Column(
        "id_permiso",
        Integer,
        ForeignKey("permisos.id_permiso"),
        primary_key=True
    )
)


# ============================================================
# MODELO ROL
# ============================================================

class Rol(Base):

    __tablename__ = "roles"

    id_rol = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    nombre = Column(
        String(50),
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=True
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )


# ============================================================
# MODELO PERMISO
# ============================================================

class Permiso(Base):

    __tablename__ = "permisos"

    id_permiso = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    nombre = Column(
        String(100),
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=True
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )


# ============================================================
# MODELO USUARIO
# ============================================================

class Usuario(Base):

    __tablename__ = "usuarios"

    id_usuario = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    nombre = Column(
        String(50),
        nullable=False
    )

    apellido = Column(
        String(50),
        nullable=False
    )

    tipo_documento = Column(
        String(20),
        nullable=False
    )

    numero_documento = Column(
        String(20),
        unique=True,
        nullable=False
    )

    direccion = Column(
        String(150),
        nullable=True
    )

    telefono = Column(
        String(20),
        nullable=True
    )

    correo = Column(
        String(100),
        unique=True,
        nullable=False
    )

    contrasena = Column(
        String(255),
        nullable=False
    )

    id_rol = Column(
        Integer,
        ForeignKey("roles.id_rol"),
        nullable=False
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )

    fecha_creacion = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    fecha_actualizacion = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )


# ============================================================
# MODELO PRODUCTO
# ============================================================

class Producto(Base):

    __tablename__ = "productos"

    id_producto = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    nombre = Column(
        String(100),
        nullable=False
    )

    descripcion = Column(
        Text,
        nullable=True
    )

    precio = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    stock = Column(
        Integer,
        nullable=False,
        default=0
    )

    imagen = Column(
        String(255),
        nullable=True
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )

    fecha_creacion = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    fecha_actualizacion = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )


# ============================================================
# MODELO VENTA
# ============================================================

class Venta(Base):

    __tablename__ = "ventas"

    id_venta = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    # Cliente que realiza la compra
    id_cliente = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    # Usuario que registra la venta
    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    # Número de factura
    numero_factura = Column(
        String(30),
        unique=True,
        nullable=True
    )

    subtotal = Column(
        DECIMAL(10, 2),
        nullable=False,
        default=0
    )

    total = Column(
        DECIMAL(10, 2),
        nullable=False,
        default=0
    )

    estado = Column(
        Boolean,
        nullable=False,
        default=True
    )

    fecha_creacion = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )


# ============================================================
# MODELO DETALLE DE VENTA
# ============================================================

class VentaDetalle(Base):

    __tablename__ = "venta_detalle"

    id_detalle = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    id_venta = Column(
        Integer,
        ForeignKey("ventas.id_venta"),
        nullable=False
    )

    id_producto = Column(
        Integer,
        ForeignKey("productos.id_producto"),
        nullable=False
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    precio_unitario = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    subtotal = Column(
        DECIMAL(10, 2),
        nullable=False
    )

class PQR(Base):
    __tablename__ = "pqr"

    id_pqr = Column(Integer, primary_key=True, index=True)

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    tipo = Column(String(20), nullable=False)

    asunto = Column(String(150), nullable=False)

    descripcion = Column(Text, nullable=False)

    estado = Column(
        String(20),
        nullable=False,
        default="Pendiente"
    )

    respuesta = Column(Text, nullable=True)

    fecha_creacion = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    fecha_actualizacion = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )