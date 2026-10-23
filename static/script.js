const selectMarca = document.getElementById("marca");
const selectModelo = document.getElementById("modelo");
const selectAno = document.getElementById("ano");

async function buscar(caminho) {
  const resposta = await fetch(caminho);
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }
  return resposta.json();
}

function preencher(select, itens) {
  select.innerHTML = '<option value="">Selecione...';
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
    preencher(selectModelo, modelos);
}
selectMarca.addEventListener("change", () => {
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

function limpar(select){
    select.innerHTML = '<option value="">Selecione...</option>';
    select.disabled = true;
}
