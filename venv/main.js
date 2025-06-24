// main.js
let boletoIdObs = null;
let boletoIdEdicao = null;

// === Função com filtros adicionados ===
let dadosBoletos = [];

async function carregarBoletos() {
  const res = await fetch("http://127.0.0.1:8000/boletos/");
  dadosBoletos = await res.json();

  if (dadosBoletos.length > 0) {
    preencherSelects();
    aplicarFiltros();
  } else {
    document.getElementById("tabelaBoletosBody").innerHTML = "<tr><td colspan='11'>Nenhum boleto cadastrado.</td></tr>";
  }
}
  const res = await fetch("http://127.0.0.1:8000/boletos/");
  const dados = await res.json();
  const tbody = document.getElementById("tabelaBoletosBody");
  tbody.innerHTML = "";

  dados.forEach(b => {
    let row = `
      <tr>
        <td>${b.empresa}</td>
        <td>${b.devedor}</td>
        <td>${b.localidade}</td>
        <td>R$ ${parseFloat(b.valor_parcela).toFixed(2)}</td>
        <td>R$ ${parseFloat(b.valor_total).toFixed(2)}</td>
        <td>${b.parcela_atual}</td>
        <td>${b.qtd_parcelas}</td>
        <td>${b.data_geracao}</td>
        <td>${b.data_vencimento}</td>
        <td>${b.status}</td>
        <td>
          <button class='btn btn-outline-success btn-sm me-1' onclick='marcarCobrado(${b.id})'><i class='bi bi-check-circle'></i></button>
          <button class='btn btn-outline-warning btn-sm me-1' onclick='abrirEditar(${b.id})'><i class='bi bi-pencil-square'></i></button>
          <button class='btn btn-outline-info btn-sm me-1' onclick='abrirObs(${b.id})'><i class='bi bi-chat-dots'></i></button>
          <button class='btn btn-outline-danger btn-sm' onclick='excluirBoleto(${b.id})'><i class='bi bi-trash'></i></button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

async function abrirEditar(id) {
  const res = await fetch("http://127.0.0.1:8000/boletos/");
  const dados = await res.json();
  const boleto = dados.find(b => b.id === id);
  const form = document.getElementById("formEditar");
  boletoIdEdicao = id;
  form.innerHTML = "";
  for (let [key, value] of Object.entries(boleto)) {
    if (key === "id" || key === "observacoes") continue;
    form.innerHTML += `<div class='col-md-6'><label class='form-label'>${key}</label><input class='form-control' name='${key}' value='${value}' required></div>`;
  }
  new bootstrap.Modal(document.getElementById("modalEditar")).show();
}

document.getElementById("formEditar").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const dados = {};
  [...form.elements].forEach(el => {
    if (el.name) dados[el.name] = el.value;
  });
  await fetch(`http://127.0.0.1:8000/boletos/${boletoIdEdicao}`, {
    method: "PUT", headers: {"Content-Type": "application/json"},
    body: JSON.stringify(dados)
  });
  bootstrap.Modal.getInstance(document.getElementById("modalEditar")).hide();
  carregarBoletos();
});

document.getElementById("boletoForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const campos = ["empresa", "devedor", "localidade", "valor_parcela", "valor_total", "qtd_parcelas", "parcela_atual", "data_geracao", "data_vencimento", "status"];
  const data = {};
  campos.forEach(id => data[id] = document.getElementById(id).value);
  await fetch("http://127.0.0.1:8000/boletos/", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  this.reset();
  carregarBoletos();
});

async function marcarCobrado(id) {
  await fetch(`http://127.0.0.1:8000/boletos/${id}/cobrado`, { method: "POST" });
  carregarBoletos();
}

async function excluirBoleto(id) {
  if (!confirm("Confirma a exclusão?")) return;
  await fetch(`http://127.0.0.1:8000/boletos/${id}`, { method: "DELETE" });
  carregarBoletos();
}

async function abrirObs(id) {
  boletoIdObs = id;
  const res = await fetch(`http://127.0.0.1:8000/boletos/${id}/observacoes/`);
  const obs = await res.json();
  const lista = document.getElementById("listaObs");
  lista.innerHTML = "";
  obs.forEach(o => {
    lista.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">
      <span><strong>${o.data}</strong> - <span id='obs-desc-${o.id}'>${o.descricao}</span></span>
      <span>
        <button class='btn btn-sm btn-light border me-1' onclick='editarObs(${o.id}, \"${o.descricao.replace(/"/g, '&quot;')}\")'><i class='bi bi-pencil-square'></i></button>
        <button class='btn btn-sm btn-light border' onclick='excluirObs(${o.id})'><i class='bi bi-trash'></i></button>
      </span></li>`;
  });
  new bootstrap.Modal(document.getElementById("modalObs")).show();
}

async function editarObs(id, descAtual) {
  const nova = prompt("Editar observação:", descAtual);
  if (!nova) return;
  const hoje = new Date().toISOString().split("T")[0];

  await fetch(`http://127.0.0.1:8000/observacoes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: hoje, descricao: nova })
  });

  bootstrap.Modal.getInstance(document.getElementById("modalObs")).hide();
  abrirObs(boletoIdObs);
}

async function excluirObs(id) {
  if (!confirm("Excluir esta observação?")) return;
  await fetch(`http://127.0.0.1:8000/observacoes/${id}`, { method: "DELETE" });
  bootstrap.Modal.getInstance(document.getElementById("modalObs")).hide();
  abrirObs(boletoIdObs);
}

document.getElementById("btnSalvarObs").addEventListener("click", async function () {
  const texto = document.getElementById("novaObs").value;
  const hoje = new Date().toISOString().split("T")[0];
  if (!texto.trim()) return;
  await fetch(`http://127.0.0.1:8000/boletos/${boletoIdObs}/observacoes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: hoje, descricao: texto })
  });
  document.getElementById("novaObs").value = "";
  bootstrap.Modal.getInstance(document.getElementById("modalObs")).hide();
  abrirObs(boletoIdObs);
});

window.onload = function () {
  carregarBoletos();
};
