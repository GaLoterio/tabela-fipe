import requests 
BASE_URL = "https://fipe.parallelum.com.br/api/v2"

resposta = requests.get(f"{BASE_URL}/cars/brands", timeout=10)

resposta.raise_for_status()
marcas = resposta.json()


for numero, marca in enumerate(marcas):
    print(f"{numero + 1} - {marca['name']}")  # Exibe o índice e o nome da marca de carro

def buscar(caminho):
    resposta = requests.get(caminho, timeout=10)
    resposta.raise_for_status()
    return resposta.json()

def buscar_marcas():
    return buscar(f"{BASE_URL}/cars/brands")

def buscar_modelos(marca_id):
    return buscar(f"{BASE_URL}/cars/brands/{marca_id}/models")

def filtrar(lista, termo):
    return [item for item in lista if termo.lower() in item['name'].lower()]

marcas = buscar_marcas()
modelos = buscar_modelos(1)  # Exemplo de busca de modelos da marca com ID 1
resultado = filtrar(marcas, 'Volvo')  # Exemplo de filtragem de marcas pelo nome
print(resultado)  # Exemplo de busca de modelos da marca com ID 1

