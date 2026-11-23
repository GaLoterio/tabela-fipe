# Desenvolvimento

## Ambiente local

Ative o ambiente virtual e instale as dependências:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Inicie o servidor de desenvolvimento:

```bash
uvicorn app.main:app --reload
```

A aplicação fica disponível em <http://127.0.0.1:8000>. O modo `--reload` reinicia o servidor quando arquivos Python são alterados.

## Fluxo da aplicação

1. `app/main.py` define as rotas HTTP e serve os arquivos estáticos.
2. `app/fipe.py` faz as requisições ao serviço FIPE da Parallelum.
3. `static/js/script.js` coordena os campos de marca, modelo e ano e monta a ficha do resultado.
4. `static/index.html` define a estrutura e `static/css/style.css` controla a apresentação responsiva.

Mantenha os IDs usados pelo JavaScript no HTML ao alterar a interface. A seleção segue a sequência marca → modelo → ano → preço.

## Catálogo de imagens

O arquivo `static/data/fipe_top3_com_imagens.csv` é lido pela interface e associa marca/modelo a uma imagem. Para atualizá-lo, forneça ao script `scripts/generate_vehicle_images.py` um arquivo CSV separado por ponto e vírgula com as colunas `marca`, `modelo` e `ano`:

```bash
python scripts/generate_vehicle_images.py /caminho/para/entrada.csv
```

O script busca miniaturas e páginas de origem no Wikimedia Commons e grava `imagem_src` e `fonte_url`. A busca faz uma pausa entre modelos para respeitar o serviço; a atualização pode levar alguns minutos. Verifique a origem, a licença e as atribuições de cada arquivo antes de redistribuí-lo.

## Protótipo de terminal

`app/cli.py` é um protótipo separado da interface web. Para executá-lo:

```bash
python -m app.cli
```

O script usa uma seleção predefinida de marca/modelo, com opção de escolher o modelo manualmente. A execução requer acesso à API FIPE.
