const API_BASE = "https://sistema-boletos-7tfv.onrender.com";

// main.js
let boletoIdObs = null;
let boletoIdEdicao = null;

// === Função com filtros adicionados ===
let dadosBoletos = [];

async function carregarBoletos() {
  const res = await fetch(`${API_BASE}/boletos/`);
  dadosBoletos = await res.json();

  if (dadosBoletos.length > 0) {
    preencherSelects();
    aplicarFiltros();
  } else {
    document.getElementById("tabelaBoletosBody").innerHTML = "<tr><td colspan='11'>Nenhum boleto cadastrado.</td></tr>";
  }

  const tbody = document.getElementById("tabelaBoletosBody");
  tbody.innerHTML = "";

  dadosBoletos.forEach(b => {
    let row = `
      <tr>
        <td><a href="#" onclick="abrirFichaEmpresa('${b.empresa}')">${b.empresa}</a></td>
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
  const res = await fetch(`${API_BASE}/boletos/`);
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
  await fetch(`${API_BASE}/boletos/${boletoIdEdicao}`, {
    method: "PUT", 
    headers: {"Content-Type": "application/json"},
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
  await fetch(`${API_BASE}/boletos/`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  this.reset();
  carregarBoletos();
});

async function marcarCobrado(id) {
  await fetch(`${API_BASE}/boletos/${id}/cobrado`, { method: "POST" });
  carregarBoletos();
}

async function excluirBoleto(id) {
  if (!confirm("Confirma a exclusão?")) return;
  await fetch(`${API_BASE}/boletos/${id}`, { method: "DELETE" });
  carregarBoletos();
}

async function abrirObs(id) {
  boletoIdObs = id;
  const res = await fetch(`${API_BASE}/boletos/${id}/observacoes/`);
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

  await fetch(`${API_BASE}/observacoes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: hoje, descricao: nova })
  });

  bootstrap.Modal.getInstance(document.getElementById("modalObs")).hide();
  abrirObs(boletoIdObs);
}

async function excluirObs(id) {
  if (!confirm("Excluir esta observação?")) return;
  await fetch(`${API_BASE}/observacoes/${id}`, { method: "DELETE" });
  bootstrap.Modal.getInstance(document.getElementById("modalObs")).hide();
  abrirObs(boletoIdObs);
}

document.getElementById("btnSalvarObs").addEventListener("click", async function () {
  const texto = document.getElementById("novaObs").value;
  const hoje = new Date().toISOString().split("T")[0];
  if (!texto.trim()) return;
  await fetch(`${API_BASE}/boletos/${boletoIdObs}/observacoes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: hoje, descricao: texto })
  });
  document.getElementById("novaObs").value = "";
  bootstrap.Modal.getInstance(document.getElementById("modalObs")).hide();
  abrirObs(boletoIdObs);
});

async function abrirFichaEmpresa(nome) {
  const res = await fetch(`${API_BASE}/empresas/?nome=${encodeURIComponent(nome)}`);
  const empresas = await res.json();
  if (!empresas.length) {
    alert("Ficha não encontrada.");
    return;
  }
  const e = empresas[0];
  let html = `
    <h5>${e.nome}</h5>
    <p><strong>CNPJ:</strong> ${e.cnpj || "-"}</p>
    <p><strong>QSA:</strong> ${e.qsa || "-"}</p>
    <p><strong>Endereço Receita:</strong> ${e.endereco_receita || "-"}</p>
    <p><strong>Telefone Receita:</strong> ${e.telefone_receita || "-"}</p>
    <p><strong>Email Receita:</strong> ${e.email_receita || "-"}</p>
    <p><strong>Telefones:</strong> ${e.telefones || "-"}</p>
    <p><strong>E-mails:</strong> ${e.emails || "-"}</p>
    <p><strong>Sócios:</strong> ${e.socios || "-"}</p>
    <p><strong>Endereços:</strong> ${e.enderecos || "-"}</p>
    <p><strong>Empresas Ligadas:</strong> ${e.empresas_ligadas || "-"}</p>
    <p><strong>Pessoas Ligadas:</strong> ${e.pessoas_ligadas || "-"}</p>
    <p><strong>Ex-sócios:</strong> ${e.ex_socios || "-"}</p>
    <p><strong>Observações:</strong> ${e.observacoes || "-"}</p>
  `;
  document.getElementById("modalEmpresaBody").innerHTML = html;
  new bootstrap.Modal(document.getElementById("modalEmpresa")).show();
}
window.abrirModalEmpresa = function () {
  document.getElementById("formEmpresa").reset();
  new bootstrap.Modal(document.getElementById("modalCadastroEmpresa")).show();
}

document.getElementById("formEmpresa").addEventListener("submit", async function (e) {
  e.preventDefault();
  const dados = {};
  [...this.elements].forEach(el => {
    if (el.name) dados[el.name] = el.value;
  });

  try {
    const res = await fetch(`${API_BASE}/empresas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (!res.ok) {
      const erro = await res.text();
      alert("Erro ao cadastrar: " + erro);
      return;
    }

    alert("Empresa cadastrada com sucesso!");
    bootstrap.Modal.getInstance(document.getElementById("modalCadastroEmpresa")).hide();

  } catch (err) {
    alert("Erro inesperado.");
    console.error(err);
  }
});
window.onload = function () {
  carregarBoletos();
};
