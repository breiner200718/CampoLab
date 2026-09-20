from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ============================================================
# USUARIO - DATOS PARA REGISTRAR
# ============================================================

class UsuarioCreate(BaseModel):

    nombre: str = Field(
        ...,
        min_length=2,
        max_length=50
    )

    apellido: str = Field(
        ...,
        min_length=2,
        max_length=50
    )

    tipo_documento: str = Field(
        ...,
        min_length=2,
        max_length=20
    )

    numero_documento: str = Field(
        ...,
        min_length=5,
        max_length=20
    )

    direccion: Optional[str] = Field(
        None,
        max_length=150
    )

    telefono: Optional[str] = Field(
        None,
        max_length=20
    )

    correo: EmailStr

    contrasena: str = Field(
        ...,
        min_length=8,
        max_length=100
    )

    id_rol: int


# ============================================================
# LOGIN
# ============================================================

class LoginRequest(BaseModel):

    correo: EmailStr

    contrasena: str = Field(
        ...,
        min_length=8,
        max_length=100
    )


# ============================================================
# USUARIO - DATOS PARA ACTUALIZAR
# ============================================================

class UsuarioUpdate(BaseModel):

    nombre: Optional[str] = Field(
        None,
        min_length=2,
        max_length=50
    )

    apellido: Optional[str] = Field(
        None,
        min_length=2,
        max_length=50
    )

    tipo_documento: Optional[str] = Field(
        None,
        min_length=2,
        max_length=20
    )

    numero_documento: Optional[str] = Field(
        None,
        min_length=5,
        max_length=20
    )

    direccion: Optional[str] = Field(
        None,
        max_length=150
    )

    telefono: Optional[str] = Field(
        None,
        max_length=20
    )

    correo: Optional[EmailStr] = None

    contrasena: Optional[str] = Field(
        None,
        min_length=8,
        max_length=100
    )

    id_rol: Optional[int] = None

    estado: Optional[bool] = None


# ============================================================
# USUARIO - RESPUESTA
# ============================================================

class UsuarioResponse(BaseModel):

    id_usuario: int
    nombre: str
    apellido: str
    tipo_documento: str
    numero_documento: str
    direccion: Optional[str]
    telefono: Optional[str]
    correo: EmailStr
    id_rol: int
    estado: bool

    class Config:
        from_attributes = True


# ============================================================
# SCHEMAS DE PRODUCTOS
# ============================================================

class ProductoCreate(BaseModel):

    nombre: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    descripcion: Optional[str] = None

    precio: float = Field(
        ...,
        gt=0
    )

    stock: int = Field(
        0,
        ge=0
    )

    imagen: Optional[str] = Field(
        None,
        max_length=255
    )


class ProductoUpdate(BaseModel):

    nombre: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100
    )

    descripcion: Optional[str] = None

    precio: Optional[float] = Field(
        None,
        gt=0
    )

    stock: Optional[int] = Field(
        None,
        ge=0
    )

    imagen: Optional[str] = Field(
        None,
        max_length=255
    )

    estado: Optional[bool] = None


class ProductoResponse(BaseModel):

    id_producto: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    stock: int
    imagen: Optional[str]
    estado: bool

    class Config:
        from_attributes = True


# ============================================================
# VENTAS - DETALLE
# ============================================================

class VentaDetalleCreate(BaseModel):

    id_producto: int

    cantidad: int = Field(
        ...,
        gt=0
    )


class VentaDetalleResponse(BaseModel):

    id_detalle: int
    id_venta: int
    id_producto: int
    cantidad: int
    precio_unitario: float
    subtotal: float

    class Config:
        from_attributes = True


# ============================================================
# VENTAS - REGISTRAR
# ============================================================

class VentaCreate(BaseModel):

    id_cliente: int

    productos: List[VentaDetalleCreate] = Field(
        ...,
        min_length=1
    )


# ============================================================
# VENTAS - RESPUESTA
# ============================================================

class VentaResponse(BaseModel):

    id_venta: int
    id_cliente: int
    id_usuario: int
    numero_factura: Optional[str]
    subtotal: float
    total: float
    estado: bool
    fecha_creacion: datetime
    detalles: List[VentaDetalleResponse] = []

    class Config:
        from_attributes = True


# ============================================================
# RECUPERACIÓN DE CONTRASEÑA
# ============================================================

class RecuperarPasswordRequest(BaseModel):

    correo: EmailStr


class RestablecerPasswordRequest(BaseModel):

    token: str

    nueva_contrasena: str = Field(
        ...,
        min_length=8,
        max_length=100
    )

# ==========================================
# ESQUEMAS PQR
# ==========================================

class PQRCreate(BaseModel):
    tipo: str
    asunto: str
    descripcion: str


class PQRUpdate(BaseModel):
    estado: str
    respuesta: Optional[str] = None


class PQRResponse(BaseModel):
    id_pqr: int
    id_usuario: int
    tipo: str
    asunto: str
    descripcion: str
    estado: str
    respuesta: Optional[str] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    class Config:
        from_attributes = True