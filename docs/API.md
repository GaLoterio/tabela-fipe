# API HTTP

A aplicação FastAPI oferece endpoints próprios para consultar a API FIPE da Parallelum. Com o servidor em execução local, a base é `http://127.0.0.1:8000`.

## Endpoints

| Método | Rota | Resposta |
|---|---|---|
| `GET` | `/api/marcas` | Marcas disponíveis |
| `GET` | `/api/marcas/{marca_id}/modelos` | Modelos da marca |
| `GET` | `/api/marcas/{marca_id}/modelos/{modelo_id}/anos` | Anos disponíveis para o modelo |
| `GET` | `/api/marcas/{marca_id}/modelos/{modelo_id}/anos/{ano_id}/preco` | Preço e dados de referência do veículo |

Os códigos recebidos nas respostas são usados como identificadores nas rotas seguintes. As respostas são JSON e seguem o formato retornado pelo serviço FIPE.

## Erros

Se a API externa estiver indisponível, a aplicação responde com HTTP `502` e uma mensagem indicando que a API FIPE não está disponível. Outros erros HTTP são propagados pelo FastAPI.

## Interface

O FastAPI também serve os arquivos de `static/` na raiz:

- `/` — página web
- `/js/script.js` e `/css/style.css` — interface
- `/data/fipe_top3_com_imagens.csv` — dados locais das imagens em destaque
- `/images/icon.svg` — favicon
