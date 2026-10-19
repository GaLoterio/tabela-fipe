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


marcas = buscar_marcas()
volvo = filtrar(marcas, "volvo")[0]

modelos = buscar_modelos(volvo["code"])
modelo = filtrar(modelos, "xc 60 t-8 ultra")[0]

anos = buscar_anos(volvo["code"], modelo["code"])
print("Anos disponíveis:", anos)

preco = buscar_preco(volvo["code"], modelo["code"], anos[0]["code"])

print(f"{preco['brand']} {preco['model']} ({preco['modelYear']}, {preco['fuel']})")
print(f"Valor: {preco['price']}  |  Referência: {preco['referenceMonth']}")