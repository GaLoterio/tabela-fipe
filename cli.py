from app.fipe import buscar_marcas, buscar_modelos, buscar_anos, buscar_preco, filtrar

def main():
    def escolher(itens, titulo):
        if not itens:
            raise ValueError(f"Nenhum item disponível para: {titulo}")
        print(titulo)
        for i, item in enumerate(itens):
            print(f"{i + 1}. {item['name']}")
        while True:
            try:
                escolha = int(input("Escolha uma opção: ")) - 1
            except ValueError:
                print("Entrada inválida. Digite um número.")
                continue
            if 0 <= escolha < len(itens):
                return itens[escolha]
            print(f"Escolha inválida. Digite um número entre 1 e {len(itens)}.")


    marcas = buscar_marcas()
    volvo = filtrar(marcas, "volvo")[0]

    modelos = buscar_modelos(volvo["code"])
    escolha_manual = input("Deseja escolher o modelo manualmente? (s/n): ").strip().lower() == "s"
    if escolha_manual:
        modelo = escolher(modelos, "Modelos disponíveis:")
    else:
        modelos_padrao = filtrar(modelos, "xc 60 t-8 ultra")
        if not modelos_padrao:
            raise ValueError("O modelo padrão 'XC 60 T-8 Ultra' não foi encontrado.")
        modelo = modelos_padrao[0]

    anos = buscar_anos(volvo["code"], modelo["code"])
    print("Anos disponíveis:", anos)

    preco = buscar_preco(volvo["code"], modelo["code"], anos[0]["code"])

    print(f"{preco['brand']} {preco['model']} ({preco['modelYear']}, {preco['fuel']})")
    print(f"Valor: {preco['price']}  |  Referência: {preco['referenceMonth']}")
if __name__ == "__main__":
    main()