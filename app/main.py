import requests
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.fipe import buscar_marcas, buscar_modelos, buscar_anos, buscar_preco

app = FastAPI(title="Tabela FIPE")

@app.exception_handler(requests.exceptions.RequestException)
async def erro_api_fipe(request: Request, erro: requests.exceptions.RequestException):
    return JSONResponse(
        status_code=502,
        content={"detail": "API FIPE indisponível. Tente novamente."},
    )

@app.get("/api/marcas")
def listar_marcas():
    return buscar_marcas()

@app.get("/api/marcas/{marca_id}/modelos")
def listar_modelos(marca_id:str):
    return buscar_modelos(marca_id)

@app.get("/api/marcas/{marca_id}/modelos/{modelos_id}/anos")
def listar_anos(marca_id:str,modelos_id:str):
    return buscar_anos(marca_id,modelos_id)

@app.get("/api/marcas/{marca_id}/modelos/{modelos_id}/anos/{ano_id}/preco")
def listar_preco(marca_id:str,modelos_id:str,ano_id:str):
    return buscar_preco(marca_id,modelos_id,ano_id)

from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="static",html=True), name="static")
