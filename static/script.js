const selectMarca = document.getElementById("marca");
const selectModelo = document.getElementById("modelo");
const selectAno = document.getElementById("ano");
const divResultado = document.getElementById("resultado");
const inputBusca = document.getElementById("busca-modelo");
const secaoModelosFotos = document.getElementById("modelos-com-fotos");
const listaModelos = document.getElementById("lista-modelos");
const estadoModelos = document.getElementById("estado-modelos");
const statusConsulta = document.getElementById("status-consulta");
const loadingIndicator = document.getElementById("loading-indicator");
const loadingText = document.getElementById("loading-text");
const progressTrack = document.querySelector(".progress-track");
const heroPhoto = document.getElementById("hero-photo");

let modelosCarregados = [];
let imagensModelos = [];
let erroImagensModelos = "";

async function buscar(caminho) {
  const resposta = await fetch(caminho);
  if (!resposta.ok) {
    let detalhe = "";
    try {
      detalhe = (await resposta.json()).detail || "";
    } catch {
      detalhe = "";
    }
    throw new Error(detalhe || `Erro ${resposta.status}`);
  }
  return resposta.json();
}

function definirCarregamento(carregando, texto = "Carregando dados...") {
  loadingIndicator.hidden = !carregando;
  loadingText.textContent = texto;
  document.body.classList.toggle("is-loading", carregando);
}

function definirStatus(mensagem = "", tipo = "") {
  statusConsulta.textContent = mensagem;
  statusConsulta.dataset.state = tipo;
}

function preencher(select, itens, textoVazio = "Selecione...") {
  select.replaceChildren(new Option(textoVazio, ""));
  for (const item of itens) {
    select.add(new Option(item.name, item.code));
  }
  select.disabled = itens.length === 0;
  select.closest(".field")?.classList.toggle("is-ready", itens.length > 0);
}

function atualizarProgresso() {
  const etapa = selectAno.value ? 3 : selectModelo.value ? 2 : selectMarca.value ? 1 : 0;
  progressTrack.setAttribute("aria-valuenow", String(etapa));
  progressTrack.setAttribute(
    "aria-valuetext",
    etapa === 0 ? "Consulta não iniciada" : `Etapa ${etapa} de 3`
  );
  progressTrack.style.setProperty("--progress", `${(etapa / 3) * 100}%`);

  document.querySelectorAll("[data-progress-step]").forEach((item) => {
    const numero = Number(item.dataset.progressStep);
    item.classList.toggle("is-complete", numero < etapa);
    item.classList.toggle("is-current", numero === etapa || (etapa === 0 && numero === 1));
  });
}

async function carregarMarcas() {
  definirCarregamento(true, "Carregando marcas...");
  try {
    const marcas = await buscar("/api/marcas");
    preencher(selectMarca, marcas, "Selecione uma marca");
    definirStatus();
  } catch (erro) {
    definirStatus(`Não foi possível carregar as marcas. ${erro.message}`, "error");
  } finally {
    definirCarregamento(false);
    atualizarProgresso();
  }
}

function normalizar(texto) {
  return texto.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizarMarca(marca) {
  return normalizar(marca).replace(/^(gm|vw) /, "");
}

function imagemDoModelo(marca, modelo) {
  const marcaNormalizada = normalizarMarca(marca);
  const modeloNormalizado = normalizar(modelo);
  return imagensModelos.find((item) =>
    normalizarMarca(item.marca) === marcaNormalizada &&
    (normalizar(item.modelo) === modeloNormalizado ||
      normalizar(modelo).startsWith(`${normalizar(item.modelo)} `))
  );
}

function definirImagemHero(marca) {
  const imagem = imagensModelos.find((item) =>
    normalizarMarca(item.marca) === normalizarMarca(marca)
  ) || imagensModelos[0];
  if (imagem) heroPhoto.src = imagem.imagem;
}

async function carregarImagensModelos() {
  const resposta = await fetch("/fipe_top3_com_imagens.csv");
  if (!resposta.ok) {
    throw new Error(`Erro ao carregar imagens: ${resposta.status}`);
  }

  const linhas = (await resposta.text()).replace(/^\uFEFF/, "").split(/\r?\n/);
  const modelosUnicos = new Map();
  for (const linha of linhas.slice(1).filter(Boolean)) {
    const [marca, modelo, , imagem] = linha.split(";");
    if (!imagem) continue;
    const chave = `${normalizarMarca(marca)}|${normalizar(modelo)}`;
    if (!modelosUnicos.has(chave)) modelosUnicos.set(chave, { marca, modelo, imagem });
  }
  imagensModelos = [...modelosUnicos.values()];
  definirImagemHero(selectMarca.value
    ? selectMarca.options[selectMarca.selectedIndex].textContent
    : "");

  if (selectMarca.value) {
    mostrarModelosComFotos(selectMarca.options[selectMarca.selectedIndex].textContent);
  }
}

carregarImagensModelos().catch((erro) => {
  erroImagensModelos = "As imagens dos modelos não puderam ser carregadas.";
  secaoModelosFotos.hidden = false;
  listaModelos.textContent = erroImagensModelos;
  console.error(erro);
});

async function carregarModelos(marcaID) {
  definirCarregamento(true, "Carregando modelos...");
  definirStatus();
  modelosCarregados = [];
  try {
    const modelos = await buscar(`/api/marcas/${marcaID}/modelos`);
    if (selectMarca.value !== marcaID) return;
    modelosCarregados = modelos;
    inputBusca.disabled = false;
    inputBusca.closest(".field")?.classList.add("is-ready");
    preencher(selectModelo, modelos, "Selecione um modelo");
    mostrarModelosComFotos(selectMarca.options[selectMarca.selectedIndex].textContent);
    estadoModelos.textContent = modelos.length ? "" : "Nenhum modelo disponível para esta marca.";
    if (!modelos.length) definirStatus("Nenhum modelo encontrado para a marca selecionada.", "empty");
  } catch (erro) {
    if (selectMarca.value === marcaID) {
      definirStatus(`Não foi possível carregar os modelos. ${erro.message}`, "error");
      estadoModelos.textContent = "Tente selecionar a marca novamente.";
    }
  } finally {
    definirCarregamento(false);
    atualizarProgresso();
  }
}

selectMarca.addEventListener("change", () => {
  limparResultado();
  definirStatus();
  estadoModelos.textContent = "";
  inputBusca.value = "";
  inputBusca.disabled = true;
  inputBusca.closest(".field")?.classList.remove("is-ready");
  limpar(selectModelo, "Selecione uma marca primeiro");
  limpar(selectAno, "Selecione um modelo primeiro");
  secaoModelosFotos.hidden = true;
  if (selectMarca.value) {
    definirImagemHero(selectMarca.options[selectMarca.selectedIndex].textContent);
    carregarModelos(selectMarca.value);
  } else {
    definirImagemHero("");
    modelosCarregados = [];
    atualizarProgresso();
  }
});

async function carregarAnos(marcaID, modeloID) {
  definirCarregamento(true, "Carregando anos disponíveis...");
  definirStatus();
  try {
    const anos = await buscar(`/api/marcas/${marcaID}/modelos/${modeloID}/anos`);
    if (selectMarca.value !== marcaID || selectModelo.value !== modeloID) return;
    preencher(selectAno, anos, "Selecione um ano");
    estadoModelos.textContent = anos.length ? "" : "Não há anos disponíveis para este modelo.";
    if (!anos.length) definirStatus("Nenhum ano encontrado para o modelo selecionado.", "empty");
  } catch (erro) {
    definirStatus(`Não foi possível carregar os anos. ${erro.message}`, "error");
  } finally {
    definirCarregamento(false);
    atualizarProgresso();
  }
}

selectModelo.addEventListener("change", () => {
  limparResultado();
  limpar(selectAno, "Carregando anos...");
  atualizarProgresso();
  if (!selectModelo.value) {
    preencher(selectAno, [], "Selecione um modelo primeiro");
    atualizarProgresso();
    return;
  }
  carregarAnos(selectMarca.value, selectModelo.value);
});

function limparResultado() {
  divResultado.replaceChildren();
  divResultado.classList.remove("is-visible", "is-loading");
  divResultado.setAttribute("aria-busy", "false");
}

function mostrarModelosComFotos(marca) {
  listaModelos.replaceChildren();
  if (erroImagensModelos) {
    secaoModelosFotos.hidden = false;
    listaModelos.textContent = erroImagensModelos;
    return;
  }

  const modelos = imagensModelos.filter(
    (item) => normalizarMarca(item.marca) === normalizarMarca(marca)
  );
  if (!modelos.length) {
    secaoModelosFotos.hidden = true;
    return;
  }

  secaoModelosFotos.hidden = false;
  for (const item of modelos) {
    const cartao = document.createElement("article");
    cartao.className = "cartao-modelo";

    const imagem = document.createElement("img");
    imagem.src = item.imagem;
    imagem.alt = `${item.marca} ${item.modelo}`;
    imagem.loading = "lazy";

    const titulo = document.createElement("h3");
    titulo.textContent = item.modelo;

    const nomeNormalizado = normalizar(item.modelo);
    const modeloFipe = modelosCarregados.find((modelo) => {
      const nome = normalizar(modelo.name);
      return nome === nomeNormalizado || nome.startsWith(`${nomeNormalizado} `);
    });

    cartao.append(imagem, titulo);
    if (modeloFipe) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.textContent = "Consultar este modelo";
      botao.addEventListener("click", () => {
        inputBusca.value = "";
        inputBusca.dispatchEvent(new Event("input"));
        selectModelo.value = modeloFipe.code;
        selectModelo.dispatchEvent(new Event("change"));
        selectModelo.focus();
      });
      cartao.appendChild(botao);
    }
    listaModelos.appendChild(cartao);
  }
}

function elemento(tag, classe, texto) {
  const node = document.createElement(tag);
  if (classe) node.className = classe;
  if (texto !== undefined) node.textContent = texto;
  return node;
}

function adicionarDado(container, rotulo, valor, classe = "") {
  const item = elemento("div", `result-data${classe ? ` ${classe}` : ""}`);
  item.append(elemento("dt", "", rotulo), elemento("dd", "", valor || "—"));
  container.appendChild(item);
}

function formatarPreco(valor) {
  const texto = String(valor ?? "");
  const numero = Number(texto.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", "."));
  return Number.isFinite(numero) ? numero : null;
}

function animarPreco(node, numero, valorOriginal) {
  if (numero === null) {
    node.textContent = valorOriginal;
    return;
  }

  const formatador = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
  node.textContent = formatador.format(numero);
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduzirMovimento) return;
  const duracao = 700;
  let inicio;

  function atualizar(agora) {
    inicio ??= agora;
    const progresso = duracao ? Math.min((agora - inicio) / duracao, 1) : 1;
    const suavizado = 1 - (1 - progresso) ** 3;
    node.textContent = formatador.format(numero * suavizado);
    if (progresso < 1) requestAnimationFrame(atualizar);
  }

  requestAnimationFrame(atualizar);
}

function mostrarPreco(dados) {
  limparResultado();
  const cartao = elemento("article", "result-card__inner");
  const marca = dados.brand || selectMarca.options[selectMarca.selectedIndex]?.textContent || "";
  const modelo = dados.model || selectModelo.options[selectModelo.selectedIndex]?.textContent || "";
  const imagemVeiculo = imagemDoModelo(marca, modelo);

  const visual = elemento("div", "result-visual");
  if (imagemVeiculo) {
    const imagem = elemento("img", "result-visual__image");
    imagem.src = imagemVeiculo.imagem;
    imagem.alt = `${marca} ${modelo}`;
    imagem.loading = "lazy";
    visual.appendChild(imagem);
  } else {
    visual.appendChild(elemento("span", "result-visual__placeholder", "FOTO NÃO DISPONÍVEL"));
  }
  visual.appendChild(elemento("span", "result-visual__caption", "REGISTRO FIPE / VEÍCULO"));

  const detalhes = elemento("div", "result-details");
  detalhes.append(
    elemento("p", "section-heading__index", "VEÍCULO SELECIONADO"),
    elemento("h3", "result-details__title", `${marca} ${modelo}`.trim()),
    elemento("p", "result-details__subtitle", "DADOS DE REFERÊNCIA / BRASIL")
  );

  const preco = elemento("div", "result-price");
  preco.append(
    elemento("span", "result-price__label", "VALOR DE REFERÊNCIA"),
    elemento("strong", "result-price__value", "")
  );
  animarPreco(preco.querySelector("strong"), formatarPreco(dados.price), dados.price);

  const dadosTecnicos = elemento("dl", "result-data-grid");
  adicionarDado(dadosTecnicos, "ANO / COMBUSTÍVEL", `${dados.modelYear || "—"} / ${dados.fuel || "—"}`);
  adicionarDado(dadosTecnicos, "CÓDIGO FIPE", dados.codeFipe);
  adicionarDado(dadosTecnicos, "MÊS DE REFERÊNCIA", dados.referenceMonth);

  detalhes.append(preco, dadosTecnicos);
  cartao.append(visual, detalhes);
  divResultado.appendChild(cartao);
  divResultado.classList.add("is-visible");
  divResultado.setAttribute("aria-busy", "false");
}

async function carregarPreco(marcaId, modeloId, anoId) {
  definirCarregamento(true, "Consultando valor FIPE...");
  divResultado.replaceChildren(
    elemento("div", "result-skeleton", "Consultando valor de referência...")
  );
  divResultado.classList.add("is-loading");
  divResultado.setAttribute("aria-busy", "true");
  try {
    const dados = await buscar(
      `/api/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}/preco`
    );
    if (
      selectMarca.value !== marcaId ||
      selectModelo.value !== modeloId ||
      selectAno.value !== anoId
    ) return;
    divResultado.classList.remove("is-loading");
    mostrarPreco(dados);
    definirStatus();
  } catch (erro) {
    limparResultado();
    definirStatus(`Não foi possível consultar o preço. ${erro.message}`, "error");
  } finally {
    definirCarregamento(false);
    atualizarProgresso();
  }
}

selectAno.addEventListener("change", () => {
  limparResultado();
  atualizarProgresso();
  if (!selectAno.value) return;
  carregarPreco(selectMarca.value, selectModelo.value, selectAno.value);
});

inputBusca.addEventListener("input", () => {
  const termo = inputBusca.value.toLowerCase();
  const filtrados = modelosCarregados.filter((modelo) =>
    modelo.name.toLowerCase().includes(termo)
  );
  limparResultado();
  limpar(selectAno, "Selecione um modelo primeiro");
  preencher(selectModelo, filtrados, "Selecione um modelo");
  estadoModelos.textContent = filtrados.length ? "" : "Nenhum modelo encontrado. Revise sua busca.";
  atualizarProgresso();
});

function limpar(select, texto = "Selecione...") {
  select.replaceChildren(new Option(texto, ""));
  select.disabled = true;
  select.closest(".field")?.classList.remove("is-ready");
}

carregarMarcas();
atualizarProgresso();
