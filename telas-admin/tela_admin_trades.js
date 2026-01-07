const API_URL = "http://localhost:3000";
let allTrades = [];
let filteredTrades = [];
let currentTradeId = null;

const tradesContainer = document.getElementById("trades-container");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const tradeModal = document.getElementById("trade-modal");
const tradeDetailsDiv = document.getElementById("trade-details");
const modalActions = document.getElementById("modal-actions");

async function loadTrades() {
  try {
    const response = await fetch(`${API_URL}/trades`);
    const data = await response.json();

    if (response.ok) {
      allTrades = data.trades || [];
      filteredTrades = [...allTrades];
      renderTrades();
    } else {
      alert("Erro ao carregar trocas.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}

function renderTrades() {
  tradesContainer.innerHTML = "";

  if (filteredTrades.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filteredTrades.forEach((trade) => {
    const card = document.createElement("div");
    card.className = "trade-card";

    const recyclablesStr = trade.recyclablesOffered
      .map((r) => `${r.quantity}x ${r.recyclableName}`)
      .join(", ");

    const benefitsStr = trade.benefitsRequested
      .map((b) => `${b.quantity}x ${b.benefitName}`)
      .join(", ");

    const createdDate = new Date(trade.createdAt).toLocaleDateString("pt-BR");

    card.innerHTML = `
      <div class="trade-info">
        <p class="trade-id">${trade._id.substring(0, 8).toUpperCase()}</p>
        <p class="trade-beneficiary">${trade.beneficiaryId.name || "Beneficiário"}</p>
        <p class="trade-items">
          <strong>${recyclablesStr}</strong> → <strong>${benefitsStr}</strong>
        </p>
        <p class="trade-points">
          ${trade.totalPointsOffered} pts oferecidos | ${trade.totalPointsRequested} pts solicitados
        </p>
      </div>
      <div class="trade-status">
        <span class="status-badge status-${trade.status}">${trade.status}</span>
        <span class="trade-date">${createdDate}</span>
      </div>
    `;

    card.onclick = () => openTradeModal(trade);
    tradesContainer.appendChild(card);
  });
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedStatus = statusFilter.value;

  filteredTrades = allTrades.filter((trade) => {
    const matchesSearch =
      trade._id.includes(searchTerm) ||
      (trade.beneficiaryId.name &&
        trade.beneficiaryId.name.toLowerCase().includes(searchTerm));

    const matchesStatus = !selectedStatus || trade.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  renderTrades();
}

function openTradeModal(trade) {
  currentTradeId = trade._id;
  tradeDetailsDiv.innerHTML = `
    <div class="detail-section">
      <h3>📋 Informações da Troca</h3>
      <div class="detail-row">
        <div class="detail-row-item">
          <span>ID da Troca</span>
          <strong>${trade._id.substring(0, 12).toUpperCase()}</strong>
        </div>
        <div class="detail-row-item">
          <span>Status</span>
          <strong>${trade.status}</strong>
        </div>
      </div>
      <div class="detail-row">
        <div class="detail-row-item">
          <span>Beneficiário</span>
          <strong>${trade.beneficiaryId.name}</strong>
        </div>
        <div class="detail-row-item">
          <span>Email</span>
          <strong>${trade.beneficiaryId.email}</strong>
        </div>
      </div>
      <div class="detail-row">
        <div class="detail-row-item">
          <span>Data da Solicitação</span>
          <strong>${new Date(trade.createdAt).toLocaleDateString("pt-BR")}</strong>
        </div>
        <div class="detail-row-item">
          <span>Hora</span>
          <strong>${new Date(trade.createdAt).toLocaleTimeString("pt-BR")}</strong>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3>📦 Materiais Oferecidos</h3>
      ${trade.recyclablesOffered
        .map(
          (item) => `
        <div class="detail-item">
          <span>${item.recyclableName} (x${item.quantity})</span>
          <span>${item.quantity * item.pointsPerUnit} pts</span>
        </div>
      `
        )
        .join("")}
      <div class="detail-item" style="background: #eef2ff; border: 1px solid #c7d2fe;">
        <span><strong>Total Oferecido</strong></span>
        <span><strong>${trade.totalPointsOffered} pts</strong></span>
      </div>
    </div>

    <div class="detail-section">
      <h3>🎁 Benefícios Solicitados</h3>
      ${trade.benefitsRequested
        .map(
          (item) => `
        <div class="detail-item">
          <span>${item.benefitName} (x${item.quantity})</span>
          <span>${item.quantity * item.pointsCost} pts</span>
        </div>
      `
        )
        .join("")}
      <div class="detail-item" style="background: #eef2ff; border: 1px solid #c7d2fe;">
        <span><strong>Total Solicitado</strong></span>
        <span><strong>${trade.totalPointsRequested} pts</strong></span>
      </div>
    </div>
  `;

  // Mostrar botões de ação apenas se o status for pendente
  if (trade.status === "pendente") {
    modalActions.classList.remove("hidden");
  } else {
    modalActions.classList.add("hidden");
  }

  tradeModal.classList.remove("hidden");
}

function closeTradeModal() {
  tradeModal.classList.add("hidden");
  currentTradeId = null;
}

async function approveTrade() {
  if (!currentTradeId) return;

  try {
    const response = await fetch(`${API_URL}/trades/${currentTradeId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      alert("Troca aprovada com sucesso!");
      closeTradeModal();
      loadTrades();
    } else {
      alert(data.error || "Erro ao aprovar troca.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível aprovar a troca.");
  }
}

async function rejectTrade() {
  if (!currentTradeId) return;

  const reason = prompt("Motivo da recusa (opcional):");

  try {
    const response = await fetch(`${API_URL}/trades/${currentTradeId}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Troca recusada.");
      closeTradeModal();
      loadTrades();
    } else {
      alert(data.error || "Erro ao recusar troca.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível recusar a troca.");
  }
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

document.addEventListener("DOMContentLoaded", loadTrades);
