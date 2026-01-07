const API_URL = "http://localhost:3000";
let recyclables = [];
let benefits = [];
let selectedRecyclables = []; // agora com quantidade
let selectedBenefits = [];    // agora com quantidade

const recyclablesContainer = document.getElementById("recyclables-container");
const benefitsContainer = document.getElementById("benefits-container");
const selectedRecyclablesList = document.getElementById("selected-recyclables");
const selectedBenefitsList = document.getElementById("selected-benefits");
const offeredPointsSpan = document.getElementById("offered-points");
const requestedPointsSpan = document.getElementById("requested-points");
const comparisonOfferedSpan = document.getElementById("comparison-offered");
const comparisonRequestedSpan = document.getElementById("comparison-requested");
const comparisonStatus = document.getElementById("comparison-status");
const confirmBtn = document.getElementById("confirm-trade-btn");

async function loadItems() {
  try {
    const recyclablesRes = await fetch(`${API_URL}/recyclables`);
    const benefitsRes = await fetch(`${API_URL}/benefits`);

    const recyclablesData = await recyclablesRes.json();
    const benefitsData = await benefitsRes.json();

    recyclables = recyclablesData.recyclables || [];
    benefits = benefitsData.benefits || [];

    renderRecyclables();
    renderBenefits();
  } catch (error) {
    console.error("Erro ao carregar itens:", error);
    alert("Erro ao carregar itens para troca.");
  }
}

function renderRecyclables() {
  recyclablesContainer.innerHTML = "";
  recyclables.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.id = `recyclable-${item._id}`;
    card.innerHTML = `
      <div class="item-emoji">♻️</div>
      <div class="item-name">${item.name}</div>
      <div class="item-type">${item.type}</div>
      <div class="item-points">${item.pointsValue} pts</div>
    `;
    card.onclick = () => toggleRecyclable(item);
    recyclablesContainer.appendChild(card);
  });
}

function renderBenefits() {
  benefitsContainer.innerHTML = "";
  benefits.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.id = `benefit-${item._id}`;
    card.innerHTML = `
      <div class="item-emoji">🎁</div>
      <div class="item-name">${item.name}</div>
      <div class="item-type">${item.category}</div>
      <div class="item-points">${item.pointsCost} pts</div>
    `;
    card.onclick = () => toggleBenefit(item);
    benefitsContainer.appendChild(card);
  });
}

function toggleRecyclable(item) {
  const index = selectedRecyclables.findIndex((r) => r._id === item._id);
  
  if (index > -1) {
    // Remove se já existe
    selectedRecyclables.splice(index, 1);
  } else {
    // Adiciona com quantidade padrão 1
    selectedRecyclables.push({
      _id: item._id,
      name: item.name,
      pointsValue: item.pointsValue,
      quantity: 1,
    });
  }
  
  updateRecyclablesDisplay();
  updateUI();
}

function toggleBenefit(item) {
  const index = selectedBenefits.findIndex((b) => b._id === item._id);
  
  if (index > -1) {
    selectedBenefits.splice(index, 1);
  } else {
    selectedBenefits.push({
      _id: item._id,
      name: item.name,
      pointsCost: item.pointsCost,
      quantity: 1,
    });
  }
  
  updateBenefitsDisplay();
  updateUI();
}

function updateRecyclablesDisplay() {
  const card = document.getElementById(`recyclable-${selectedRecyclables.length > 0 ? selectedRecyclables[0]._id : ""}`);
  document.querySelectorAll(".item-card").forEach((c) => c.classList.remove("selected"));
  selectedRecyclables.forEach((item) => {
    const c = document.getElementById(`recyclable-${item._id}`);
    if (c) c.classList.add("selected");
  });

  selectedRecyclablesList.innerHTML = "";
  
  if (selectedRecyclables.length === 0) {
    selectedRecyclablesList.innerHTML = '<p class="placeholder">Nenhum item selecionado</p>';
    return;
  }

  selectedRecyclables.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "selected-item";
    row.innerHTML = `
      <span class="selected-item-name">${item.name}</span>
      <div class="selected-item-qty">
        <button class="qty-btn" onclick="changeQty('recyclable', ${index}, -1)">−</button>
        <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="setQty('recyclable', ${index}, this.value)" />
        <button class="qty-btn" onclick="changeQty('recyclable', ${index}, 1)">+</button>
        <button class="remove-btn" onclick="removeItem('recyclable', ${index})">✕</button>
      </div>
    `;
    selectedRecyclablesList.appendChild(row);
  });
}

function updateBenefitsDisplay() {
  document.querySelectorAll(".item-card").forEach((c) => c.classList.remove("selected"));
  selectedBenefits.forEach((item) => {
    const c = document.getElementById(`benefit-${item._id}`);
    if (c) c.classList.add("selected");
  });

  selectedBenefitsList.innerHTML = "";
  
  if (selectedBenefits.length === 0) {
    selectedBenefitsList.innerHTML = '<p class="placeholder">Nenhum item selecionado</p>';
    return;
  }

  selectedBenefits.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "selected-item";
    row.innerHTML = `
      <span class="selected-item-name">${item.name}</span>
      <div class="selected-item-qty">
        <button class="qty-btn" onclick="changeQty('benefit', ${index}, -1)">−</button>
        <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="setQty('benefit', ${index}, this.value)" />
        <button class="qty-btn" onclick="changeQty('benefit', ${index}, 1)">+</button>
        <button class="remove-btn" onclick="removeItem('benefit', ${index})">✕</button>
      </div>
    `;
    selectedBenefitsList.appendChild(row);
  });
}

function changeQty(type, index, change) {
  const array = type === "recyclable" ? selectedRecyclables : selectedBenefits;
  array[index].quantity = Math.max(1, array[index].quantity + change);
  type === "recyclable" ? updateRecyclablesDisplay() : updateBenefitsDisplay();
  updateUI();
}

function setQty(type, index, value) {
  const qty = Math.max(1, parseInt(value) || 1);
  const array = type === "recyclable" ? selectedRecyclables : selectedBenefits;
  array[index].quantity = qty;
  updateUI();
}

function removeItem(type, index) {
  if (type === "recyclable") {
    selectedRecyclables.splice(index, 1);
    updateRecyclablesDisplay();
  } else {
    selectedBenefits.splice(index, 1);
    updateBenefitsDisplay();
  }
  updateUI();
}

function updateUI() {
  const offeredPoints = selectedRecyclables.reduce(
    (sum, item) => sum + item.pointsValue * item.quantity,
    0
  );
  const requestedPoints = selectedBenefits.reduce(
    (sum, item) => sum + item.pointsCost * item.quantity,
    0
  );

  offeredPointsSpan.textContent = offeredPoints;
  requestedPointsSpan.textContent = requestedPoints;
  comparisonOfferedSpan.textContent = offeredPoints;
  comparisonRequestedSpan.textContent = requestedPoints;

  if (offeredPoints === 0 || requestedPoints === 0) {
    comparisonStatus.textContent = "Selecione itens em ambos os lados";
    comparisonStatus.className = "status-warning";
    confirmBtn.disabled = true;
  } else if (offeredPoints >= requestedPoints) {
    comparisonStatus.textContent = "✓ Você pode fazer essa troca!";
    comparisonStatus.className = "status-ok";
    confirmBtn.disabled = false;
  } else {
    comparisonStatus.textContent = "✗ Pontos insuficientes";
    comparisonStatus.className = "status-error";
    confirmBtn.disabled = true;
  }
}










confirmBtn.addEventListener("click", async () => {
  const storedUser = localStorage.getItem("bemaquiUser");
  if (!storedUser) {
    alert("Você precisa estar logado.");
    return;
  }

  const user = JSON.parse(storedUser);

  const tradeData = {
    beneficiaryId: user._id,
    recyclablesOffered: selectedRecyclables.map((item) => ({
      recyclableId: item._id,
      recyclableName: item.name,
      quantity: item.quantity,
      pointsPerUnit: item.pointsValue,
    })),
    benefitsRequested: selectedBenefits.map((item) => ({
      benefitId: item._id,
      benefitName: item.name,
      quantity: item.quantity,
      pointsCost: item.pointsCost,
    })),
  };

  try {
    const response = await fetch(`${API_URL}/trades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tradeData),
    });

    const data = await response.json();

    if (response.ok) {
      showConfirmationModal(data.trade);
      selectedRecyclables = [];
      selectedBenefits = [];
      updateRecyclablesDisplay();
      updateBenefitsDisplay();
      updateUI();
    } else {
      alert(data.error || "Erro ao realizar troca.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível realizar a troca.");
  }
});

function showConfirmationModal(trade) {
  const modal = document.createElement("div");
  modal.className = "confirmation-modal";
  modal.innerHTML = `
    <div class="confirmation-card">
      <div class="confirmation-header">
        <div class="success-icon">✓</div>
        <h2>Troca Registrada com Sucesso!</h2>
      </div>

      <div class="confirmation-body">
        <div class="trade-info">
          <div class="info-section">
            <h3>📦 Você está ofertando:</h3>
            <div class="items-list">
              ${trade.recyclablesOffered
                .map(
                  (item) =>
                    `<div class="item"><span>${item.recyclableName}</span><span class="qty">x${item.quantity}</span></div>`
                )
                .join("")}
            </div>
            <p class="points-info">Total: <strong>${trade.totalPointsOffered} pontos</strong></p>
          </div>

          <div class="exchange-arrow">↓ TROCA POR ↓</div>

          <div class="info-section">
            <h3>🎁 Você vai receber:</h3>
            <div class="items-list">
              ${trade.benefitsRequested
                .map(
                  (item) =>
                    `<div class="item"><span>${item.benefitName}</span><span class="qty">x${item.quantity}</span></div>`
                )
                .join("")}
            </div>
            <p class="points-info">Total: <strong>${trade.totalPointsRequested} pontos</strong></p>
          </div>
        </div>

        <div class="confirmation-details">
          <div class="detail">
            <span>ID da Troca:</span>
            <strong>${trade._id.substring(0, 8).toUpperCase()}</strong>
          </div>
          <div class="detail">
            <span>Status:</span>
            <strong class="status-pending">Aguardando Aprovação</strong>
          </div>
        </div>

        <div class="next-steps">
          <h4>Próximos passos:</h4>
          <ol>
            <li>Aguarde a aprovação do administrador</li>
            <li>Compareça a um de nossos pontos de coleta</li>
            <li>Apresente o ID da troca ao funcionário</li>
            <li>Realize a troca pessoalmente</li>
          </ol>
        </div>
      </div>

      <div class="confirmation-footer">
        <button onclick="closeConfirmationModal()" class="btn-close">
          Fechar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeConfirmationModal() {
  const modal = document.querySelector(".confirmation-modal");
  if (modal) {
    modal.remove();
  }
}










  const user = JSON.parse(storedUser);

  const tradeData = {
    beneficiaryId: user._id,
    recyclablesOffered: selectedRecyclables.map((item) => ({
      recyclableId: item._id,
      recyclableName: item.name,
      quantity: item.quantity,
      pointsPerUnit: item.pointsValue,
    })),
    benefitsRequested: selectedBenefits.map((item) => ({
      benefitId: item._id,
      benefitName: item.name,
      quantity: item.quantity,
      pointsCost: item.pointsCost,
    })),
  };

  try {
    const response = await fetch(`${API_URL}/trades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tradeData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Troca realizada com sucesso! Aguardando aprovação do administrador.");
      selectedRecyclables = [];
      selectedBenefits = [];
      updateRecyclablesDisplay();
      updateBenefitsDisplay();
      updateUI();
    } else {
      alert(data.error || "Erro ao realizar troca.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível realizar a troca.");
  }
;

document.addEventListener("DOMContentLoaded", loadItems);
