const elementos = {
    arquivo: document.querySelector("#arquivo"),
    areaUpload: document.querySelector("#areaUpload"),
    selecionarFoto: document.querySelector("#selecionarFoto"),
    previsualizacao: document.querySelector("#previsualizacao"),
    imagem: document.querySelector("#imagemComprovante"),
    descricao: document.querySelector("#descricao"),
    categoria: document.querySelector("#categoria"),
    filtroCategoria: document.querySelector("#filtroCategoria"),
    valor: document.querySelector("#valor"),
    salvar: document.querySelector("#salvar"),
    cancelar: document.querySelector("#cancelar"),
    lista: document.querySelector("#listaComprovantes"),
    estadoVazio: document.querySelector("#estadoVazio"),
    totalGasto: document.querySelector("#totalGasto"),
    totalAlimentacao: document.querySelector("#totalAlimentacao"),
    totalComprovantes: document.querySelector("#totalComprovantes"),
    mediaGastos: document.querySelector("#mediaGastos"),
    limparTudo: document.querySelector("#limparTudo"),
    alternarTema: document.querySelector("#alternarTema"),
    toast: document.querySelector("#toast")
};

let imagemAtual = "";
let comprovantes = carregarComprovantes();


const categorias = [
    "Alimentação",
    "Transporte",
    "Casa",
    "Lazer",
    "Saúde",
    "Educação",
    "Outros"
];
const moeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

function carregarComprovantes() {
    try {
        return JSON.parse(localStorage.getItem("comprovantes")) || [];
    } catch {
        return [];
    }
}

function salvarComprovantes() {
    localStorage.setItem("comprovantes", JSON.stringify(comprovantes));
}

function abrirSeletor(evento) {
    if (evento) {
        evento.stopPropagation();
    }

    elementos.arquivo.click();
}

function lerImagem(arquivo) {
    if (!arquivo || !arquivo.type.startsWith("image/")) {
        mostrarToast("Selecione uma imagem válida.");
        return;
    }

    const leitor = new FileReader();

    leitor.onload = evento => {
        imagemAtual = evento.target.result;
        elementos.imagem.src = imagemAtual;
        elementos.areaUpload.hidden = true;
        elementos.previsualizacao.hidden = false;
        elementos.descricao.focus();
    };

    leitor.readAsDataURL(arquivo);
}

function converterValor(valor) {
    const normalizado = valor
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "");

    return Number(normalizado);
}

function cadastrarComprovante() {
    const valor = converterValor(elementos.valor.value);
    const descricao =
        elementos.descricao.value.trim() || "Comprovante sem descrição";
    const categoria = elementos.categoria.value;

    if (!Number.isFinite(valor) || valor <= 0) {
        mostrarToast("Informe um valor válido.");
        elementos.valor.focus();
        return;
    }

    comprovantes.unshift({
        id: Date.now(),
        descricao,
        categoria,
        valor,
        imagem: imagemAtual,
        data: new Date().toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        })
    });

    salvarComprovantes();
    renderizar();
    cancelarCadastro();
    mostrarToast("Gasto salvo com sucesso.");
}

function cancelarCadastro() {
    imagemAtual = "";
    elementos.arquivo.value = "";
    elementos.imagem.removeAttribute("src");
    elementos.descricao.value = "";
    elementos.valor.value = "";
    elementos.previsualizacao.hidden = true;
    elementos.areaUpload.hidden = false;
}

function excluirComprovante(id) {
    comprovantes = comprovantes.filter(item => item.id !== id);
    salvarComprovantes();
    renderizar();
    mostrarToast("Comprovante excluído.");
}

function limparComprovantes() {
    if (comprovantes.length === 0) {
        mostrarToast("Não existem lançamentos para excluir.");
        return;
    }

    const confirmou = window.confirm(
        "Deseja excluir todos os comprovantes?"
    );

    if (!confirmou) {
        return;
    }

    comprovantes = [];
    salvarComprovantes();
    renderizar();
    mostrarToast("Histórico limpo.");
}

function criarItem(comprovante) {
    const categoria = document.createElement("span");
    categoria.className = "item-categoria";
    categoria.textContent = comprovante.categoria;
    const artigo = document.createElement("article");
    artigo.className = "item";

    const imagem = document.createElement("img");
    imagem.src = comprovante.imagem;
    imagem.alt = "";

    const informacoes = document.createElement("div");
    informacoes.className = "item-info";

    const descricao = document.createElement("strong");
    descricao.textContent = comprovante.descricao;

    const data = document.createElement("span");
    data.textContent = comprovante.data;

    informacoes.append(descricao, data);

    const valor = document.createElement("span");
    valor.className = "item-valor";
    valor.textContent = moeda.format(comprovante.valor);

    const excluir = document.createElement("button");
    excluir.className = "excluir";
    excluir.type = "button";
    excluir.textContent = "🗑";
    excluir.title = "Excluir comprovante";
    excluir.setAttribute(
        "aria-label",
        `Excluir ${comprovante.descricao}`
    );

    excluir.addEventListener("click", () => {
        excluirComprovante(comprovante.id);
    });

    artigo.append(imagem, informacoes, valor, excluir);
    return artigo;
}
function calcularTotalCategoria(nomeCategoria) {
    let total = 0;

    comprovantes.forEach(comprovante => {
        if (comprovante.categoria === nomeCategoria) {
            total += comprovante.valor;
        }
    });

    return total;
}
function renderizar() {
    elementos.lista.replaceChildren(); const categoriaSelecionada = elementos.filtroCategoria.value;

    const comprovantesFiltrados =
        categoriaSelecionada === "Todas"
            ? comprovantes
            : comprovantes.filter(
                comprovante =>
                    comprovante.categoria === categoriaSelecionada
            );

    comprovantesFiltrados.forEach(comprovante => {
        elementos.lista.appendChild(criarItem(comprovante));
    });

    comprovantes.forEach(comprovante => {
        elementos.lista.appendChild(criarItem(comprovante));
    });

    const total = comprovantes.reduce(
        (soma, comprovante) => soma + comprovante.valor,
        0
    );

    const media =
        comprovantes.length > 0 ? total / comprovantes.length : 0;
    let totalAlimentacao = 0;
    console.log("A função renderizar() foi executada!");
    categorias.forEach(categoria => {
    const totalCategoria = calcularTotalCategoria(categoria);

   
    comprovantes.forEach(comprovante => {
        if (comprovante.categoria === "Alimentação") {
            totalAlimentacao += comprovante.valor;
        }
 });
    elementos.totalGasto.textContent = moeda.format(total);
    elementos.totalAlimentacao.textContent =
        moeda.format(totalAlimentacao);
    elementos.totalComprovantes.textContent = comprovantes.length;
    elementos.mediaGastos.textContent = moeda.format(media);

    elementos.estadoVazio.hidden = comprovantes.length > 0;
    elementos.limparTudo.hidden = comprovantes.length === 0;
}

function mostrarToast(mensagem) {
    elementos.toast.textContent = mensagem;
    elementos.toast.classList.add("visivel");

    clearTimeout(mostrarToast.tempo);

    mostrarToast.tempo = setTimeout(() => {
        elementos.toast.classList.remove("visivel");
    }, 2600);
}

function alternarTema() {
    document.body.classList.toggle("tema-escuro");

    const temaEscuro = document.body.classList.contains("tema-escuro");

    elementos.alternarTema.textContent = temaEscuro ? "🌙" : "☀️";
    localStorage.setItem("temaEscuro", temaEscuro);
}

elementos.selecionarFoto.addEventListener("click", abrirSeletor);

elementos.areaUpload.addEventListener("click", evento => {
    if (evento.target !== elementos.selecionarFoto) {
        abrirSeletor();
    }
});

elementos.areaUpload.addEventListener("keydown", evento => {
    if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrirSeletor();
    }
});

elementos.arquivo.addEventListener("change", evento => {
    lerImagem(evento.target.files[0]);
});

elementos.areaUpload.addEventListener("dragover", evento => {
    evento.preventDefault();
    elementos.areaUpload.classList.add("arrastando");
});

elementos.areaUpload.addEventListener("dragleave", () => {
    elementos.areaUpload.classList.remove("arrastando");
});

elementos.areaUpload.addEventListener("drop", evento => {
    evento.preventDefault();
    elementos.areaUpload.classList.remove("arrastando");
    lerImagem(evento.dataTransfer.files[0]);
});

elementos.valor.addEventListener("input", evento => {
    let numeros = evento.target.value.replace(/\D/g, "");

    if (!numeros) {
        evento.target.value = "";
        return;
    }

    numeros = (Number(numeros) / 100).toFixed(2);
    evento.target.value = numeros
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
});

elementos.salvar.addEventListener("click", cadastrarComprovante);
elementos.cancelar.addEventListener("click", cancelarCadastro);
elementos.limparTudo.addEventListener("click", limparComprovantes);
elementos.alternarTema.addEventListener("click", alternarTema);

if (localStorage.getItem("temaEscuro") === "true") {
    document.body.classList.add("tema-escuro");
    elementos.alternarTema.textContent = "🌙";
    elementos.filtroCategoria.addEventListener("change", renderizar);
}

renderizar();
