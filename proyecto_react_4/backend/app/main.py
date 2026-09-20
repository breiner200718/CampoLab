from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine
from app.routes import usuarios, auth, productos, ventas, pqr, chatbot

from fastapi.staticfiles import StaticFiles


app = FastAPI(
    title="CampoLab API",
    description="API del proyecto CampoLab",
    version="1.0.0"
)


app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# ============================================================
# CONFIGURACIÓN CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# RUTAS
# ============================================================

app.include_router(usuarios.router)
app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(ventas.router)
app.include_router(pqr.router)
app.include_router(chatbot.router)


# ============================================================
# RUTA PRINCIPAL
# ============================================================

@app.get("/")
def inicio():

    return {
        "mensaje": "API CampoLab funcionando correctamente"
    }


# ============================================================
# PROBAR CONEXIÓN A MYSQL
# ============================================================

@app.get("/probar-db")
def probar_db():

    with engine.connect() as connection:

        connection.execute(text("SELECT 1"))

    return {
        "mensaje": "Conexión a MySQL exitosa"
    }