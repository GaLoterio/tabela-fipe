# Tabela FIPE

Programa em Python que consulta o preço médio de carros na Tabela FIPE, escolhendo marca, modelo e ano pelo terminal.

## Como funciona

O programa consulta a [API FIPE da Parallelum](https://fipe.parallelum.com.br/api/v2) em sequência: marca, modelo, ano e preço. Cada resposta traz o código usado na chamada seguinte.

## Como rodar

```bash
git clone https://github.com/GaLoterio/tabela-fipe-python.git
cd tabela-fipe-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## Tecnologias

Python 3 e requests.

## Status

Em desenvolvimento. Próximos passos: escolher marca e ano pelo menu, filtro de modelos e interface gráfica.

## Imagens dos modelos

A interface mostra fotos dos três modelos em destaque de cada marca. As imagens e links de atribuição são gerados a partir do Wikimedia Commons:

```bash
python adicionar_imagens.py /caminho/para/fipe_top3_por_marca.csv
```

O arquivo gerado é salvo em `static/fipe_top3_com_imagens.csv`.

## Observação

Os valores são médias de mercado da Tabela FIPE para o mês de referência, não preços de venda.