# Tabela FIPE

Aplicação web para consultar valores de referência de veículos por marca, modelo e ano. A interface consulta a API FIPE da Parallelum e apresenta o preço, o mês de referência e os dados do veículo.

## Conteúdo

- [Requisitos](#requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Como usar](#como-usar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Documentação complementar](#documentação-complementar)
- [Dados e imagens](#dados-e-imagens)

## Requisitos

- Python 3
- `pip`
- Acesso à internet para consultar a API FIPE e carregar as imagens externas

## Instalação e execução

Na raiz do repositório, crie e ative um ambiente virtual:

```bash
python3 -m venv venv
source venv/bin/activate
```

No Windows PowerShell, ative-o com:

```powershell
venv\Scripts\Activate.ps1
```

Instale as dependências e inicie o servidor:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Abra <http://127.0.0.1:8000> no navegador. Encerre o servidor com `Ctrl+C`.

## Como usar

1. Selecione uma marca.
2. Opcionalmente, filtre os modelos pelo campo de busca ou escolha um dos modelos em destaque.
3. Selecione o modelo e o ano.
4. Consulte o valor FIPE e os dados de referência apresentados.

A lista de modelos e anos é carregada sob demanda pela API. A seção de modelos em destaque usa o catálogo local de imagens incluído em `static/data/`.

## Estrutura do projeto

```text
.
├── app/
│   ├── cli.py              # Protótipo de consulta pelo terminal
│   ├── fipe.py             # Cliente da API FIPE
│   └── main.py             # Aplicação FastAPI e rotas HTTP
├── docs/
│   ├── API.md              # Rotas disponibilizadas pela aplicação
│   └── DESENVOLVIMENTO.md  # Comandos e manutenção
├── static/
│   ├── css/
│   │   └── style.css       # Estilos da interface
│   ├── data/
│   │   └── fipe_top3_com_imagens.csv
│   ├── images/             # Ícones e imagens estáticas
│   ├── js/
│   │   └── script.js       # Interações da interface
│   └── index.html          # Documento principal da interface
├── scripts/
│   └── generate_vehicle_images.py  # Gera o catálogo de imagens
├── requirements.txt
└── README.md
```

## Documentação complementar

- [API HTTP](docs/API.md)
- [Desenvolvimento e manutenção](docs/DESENVOLVIMENTO.md)

## Dados e imagens

- Os valores são fornecidos pela [API FIPE da Parallelum](https://fipe.parallelum.com.br/api/v2) e correspondem ao mês de referência informado no resultado. São valores de referência, não ofertas de venda.
- O catálogo local contém modelos em destaque e URLs de imagens do Wikimedia Commons. Consulte a URL `fonte_url` no CSV para verificar a origem e a licença de cada imagem.
- Para gerar novamente o catálogo, use o [script de extração](scripts/generate_vehicle_images.py) com um CSV de entrada separado por ponto e vírgula:

  ```bash
  python scripts/generate_vehicle_images.py /caminho/para/fipe_top3_por_marca.csv
  ```

  Por padrão, o resultado é salvo em `static/data/fipe_top3_com_imagens.csv`. Para escolher outro destino, informe `--saida`:

  ```bash
  python scripts/generate_vehicle_images.py entrada.csv --saida static/data/outro_catalogo.csv
  ```
