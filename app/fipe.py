import requests

BASE_URL = "https://fipe.parallelum.com.br/api/v2"


def buscar(caminho):
    resposta = requests.get(f"{BASE_URL}{caminho}", timeout=10)
    resposta.raise_for_status()
    return resposta.json()


def buscar_marcas():
    return buscar("/cars/brands")


def buscar_modelos(marca_id):
    return buscar(f"/cars/brands/{marca_id}/models")


def buscar_anos(marca_id, modelo_id):
    return buscar(f"/cars/brands/{marca_id}/models/{modelo_id}/years")


def buscar_preco(marca_id, modelo_id, ano_id):
    return buscar(f"/cars/brands/{marca_id}/models/{modelo_id}/years/{ano_id}")


def filtrar(lista, termo):
    return [item for item in lista if termo.lower() in item["name"].lower()]