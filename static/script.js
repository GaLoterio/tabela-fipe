const selectMarca = document.getElementById("marca");
const selectModelo = document.getElementById("modelo");
const selectAno = document.getElementById("ano");
const divResultado = document.getElementById ("resultado")
const inputBusca = document.getElementById("busca-modelo")

let modelosCarregados = [];


async function buscar(caminho) {
  const resposta = await fetch(caminho);
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }
  return resposta.json();
}

function preencher(select, itens) {
  select.innerHTML = '<option value="">Selecione...</option>';
  for (const item of itens) {
    const opcao = document.createElement("option");
    opcao.value = item.code;
    opcao.textContent = item.name;
    select.appendChild(opcao);
  }
  select.disabled = false;
}

async function carregarMarcas() {
  const marcas = await buscar("/api/marcas");
  preencher(selectMarca, marcas);
}

carregarMarcas();

async function carregarModelos(marcaID) {
    const modelos = await buscar(`/api/marcas/${marcaID}/modelos`);
    modelosCarregados = modelos;
    preencher(selectModelo, modelos);
    inputBusca.disabled = false;
}
selectMarca.addEventListener("change", () => {
    limparResultado();
    limpar(selectModelo);
    limpar(selectAno);
    if(!selectMarca.value) return;
    carregarModelos(selectMarca.value);
});



async function carregarAnos(marcaID, modeloID) {
    const anos = await buscar(`/api/marcas/${marcaID}/modelos/${modeloID}/anos`);
    preencher (selectAno,anos);
}
selectModelo.addEventListener("change",() => {
    limpar(selectAno);
    if(!selectModelo.value) return;
    carregarAnos(selectMarca.value,selectModelo.value);
});

function limparResultado() {
  divResultado.textContent = "";
}

function mostrarPreco(dados) {
  limparResultado();

  const linhas = [
    `${dados.brand} ${dados.model}`,
    `Ano: ${dados.modelYear} (${dados.fuel})`,
    `Valor: ${dados.price}`,
    `Referência: ${dados.referenceMonth}`,
  ];

  for (const texto of linhas) {
    const p = document.createElement("p");
    p.textContent = texto;
    divResultado.appendChild(p);
  }
}

async function carregarPreco(marcaId, modeloId, anoId) {
  const dados = await buscar(
    `/api/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}/preco`
  );
  mostrarPreco(dados);
}

selectAno.addEventListener("change", () => {
  limparResultado();
  if (!selectAno.value) return;
  carregarPreco(selectMarca.value, selectModelo.value, selectAno.value);
});

inputBusca.addEventListener("input",() =>{
    const termo = inputBusca.value.toLowerCase();
    const filtrados = [];
    for (const modelo of modelosCarregados){
        if(modelo.name.toLowerCase().includes(termo)){
            filtrados.push(modelo);
        }
    }
    limparResultado(selectAno);
    limparResultado();
    preencher(selectModelo, filtrados);

});

function limpar(select){
    select.innerHTML = '<option value="">Selecione...</option>';
    select.disabled = true;
}
