#!/usr/bin/env python3
import argparse
import csv
import re
import time
import unicodedata
from pathlib import Path

import requests

API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {
    "User-Agent": "TabelaFIPE/1.0 (https://github.com/GaLoterio/tabela-fipe)"
}
TERMOS_NAO_FOTO = ("interior", "dashboard", "engine", "logo", "emblem")
TERMOS_PREFERIDOS = {
    ("Fiat", "Strada"): "2020",
    ("Renault", "Duster"): "2022",
    ("Jeep", "Commander"): "2022",
}


def normalizar(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", texto.lower()).strip()


def consultar(sessao, parametros):
    for tentativa in range(4):
        resposta = sessao.get(API, params=parametros, headers=HEADERS, timeout=30)
        if resposta.status_code == 429:
            if tentativa == 3:
                resposta.raise_for_status()
            espera = int(resposta.headers.get("Retry-After", "60"))
            time.sleep(espera)
            continue
        resposta.raise_for_status()
        return resposta.json()
    raise RuntimeError("Não foi possível consultar o Wikimedia Commons.")


def selecionar_imagem(paginas, marca, modelo, preferencia):
    termo_modelo = normalizar(modelo)
    termo_marca = normalizar(marca)
    termo_preferido = normalizar(preferencia) if preferencia else ""
    candidatos = []

    for pagina in paginas:
        titulo = normalizar(pagina.get("title", ""))
        if termo_modelo not in titulo:
            continue
        info = pagina.get("imageinfo", [{}])[0]
        if not info.get("thumburl"):
            continue
        pontuacao = 10 + (10 if termo_marca in titulo else 0)
        if termo_preferido and termo_preferido in titulo:
            pontuacao += 10
        if "front" in titulo:
            pontuacao += 5
        if (marca, modelo) == ("Jeep", "Commander") and re.search(
            r"\b202[1-9]\b", titulo
        ):
            pontuacao += 10
        if any(termo in titulo for termo in TERMOS_NAO_FOTO):
            pontuacao -= 20
        if modelo == "Strada" and any(
            termo in titulo for termo in ("abarth", "130tc")
        ):
            pontuacao -= 30
        if modelo == "Duster" and "oroch" in titulo:
            pontuacao -= 30
        candidatos.append((pontuacao, info))

    return max(candidatos, key=lambda candidato: candidato[0])[1] if candidatos else None


def buscar_imagem(sessao, marca, modelo):
    preferencia = TERMOS_PREFERIDOS.get((marca, modelo), "")
    busca = f'filetype:bitmap "{marca} {modelo}" {preferencia}'.strip()
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": busca,
        "gsrnamespace": 6,
        "gsrlimit": 20,
        "prop": "imageinfo",
        "iiprop": "url",
        "iiurlwidth": 800,
    }

    dados = consultar(sessao, params)
    paginas = list(dados.get("query", {}).get("pages", {}).values())
    imagem = selecionar_imagem(paginas, marca, modelo, preferencia)

    if not imagem:
        busca_params = {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": busca,
            "srnamespace": 6,
            "srlimit": 20,
        }
        resultados = consultar(sessao, busca_params)
        titulos = [
            item["title"]
            for item in resultados.get("query", {}).get("search", [])
        ]
        if not titulos:
            return "", ""
        imagem_params = {
            "action": "query",
            "format": "json",
            "titles": "|".join(titulos),
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": 800,
        }
        paginas = list(consultar(sessao, imagem_params).get("query", {}).get("pages", {}).values())
        imagem = selecionar_imagem(paginas, marca, modelo, preferencia)

    if not imagem:
        return "", ""
    return imagem.get("thumburl", ""), imagem.get("descriptionurl", "")


def main():
    parser = argparse.ArgumentParser(
        description="Busca imagens de veículos no Wikimedia Commons."
    )
    parser.add_argument("entrada", type=Path, help="CSV FIPE separado por ponto e vírgula")
    parser.add_argument(
        "--saida",
        type=Path,
        default=Path("static/fipe_top3_com_imagens.csv"),
        help="CSV de saída (padrão: static/fipe_top3_com_imagens.csv)",
    )
    args = parser.parse_args()

    with args.entrada.open(newline="", encoding="utf-8-sig") as arquivo:
        linhas = list(csv.DictReader(arquivo, delimiter=";"))

    cache = {}
    sessao = requests.Session()
    args.saida.parent.mkdir(parents=True, exist_ok=True)
    saida_temporaria = args.saida.with_suffix(args.saida.suffix + ".tmp")

    with saida_temporaria.open("w", newline="", encoding="utf-8-sig") as arquivo:
        escritor = csv.writer(arquivo, delimiter=";")
        escritor.writerow(["marca", "modelo", "ano", "imagem_src", "fonte_url"])

        for linha in linhas:
            chave = (linha["marca"], linha["modelo"])
            if chave not in cache:
                cache[chave] = buscar_imagem(sessao, *chave)
                imagem, fonte = cache[chave]
                print(f"{chave[0]} {chave[1]}: {imagem or 'NÃO ENCONTRADA'}")
                time.sleep(6)
            imagem, fonte = cache[chave]
            escritor.writerow(
                [linha["marca"], linha["modelo"], linha["ano"], imagem, fonte]
            )

    saida_temporaria.replace(args.saida)
    encontrados = sum(bool(imagem) for imagem, _ in cache.values())
    print(
        f"\nPronto! {encontrados}/{len(cache)} modelos com imagem. "
        f"Arquivo salvo em: {args.saida}"
    )


if __name__ == "__main__":
    main()
