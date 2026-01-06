// Dados mockados por enquanto
const mockMaterials = [
  {
    _id: "1",
    name: "Garrafas plásticas",
    type: "plástico",
    description: "200 garrafas de 2L em bom estado.",
    status: "ativo",
    quantity: 200,
  },
  {
    _id: "2",
    name: "Papelão ondulado",
    type: "papel",
    description: "Caixas de papelão para reciclagem.",
    status: "ativo",
    quantity: 50,
  },
  {
    _id: "3",
    name: "Vidros diversos",
    type: "vidro",
    description: "Garrafas, frascos e vidros varios.",
    status: "inativo",
    quantity: 30,
  },
];

let materials = [...mockMaterials];

const materialsContainer = document.getElementById("materials-container");
const emptyState = document.getElementById("empty-state");

function renderMaterials() {
  materialsContainer.innerHTML = "";

  if (materials.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  materials.forEach((material) => {
    const row = document.createElement("div");
    row.className = "material-item";
    row.innerHTML = `
      <div class="material-info">
        <p class="material-name">${material.name}</p>
        <p class="material-type">${material.type}</p>
        <p class="material-description">${material.description}</p>
      </div>
      <div class="material-status">
        <span class="status-badge status-${material.status}">${material.status}</span>
        <div class="material-actions">
          <button class="action-btn" onclick="editMaterial('${material._id}')">Editar</button>
          <button class="action-btn delete" onclick="deleteMaterial('${material._id}')">Deletar</button>
        </div>
      </div>
    `;
    materialsContainer.appendChild(row);
  });
}

function redirectToCadastro() {
  alert("Redirecionar para tela de cadastro de materiais.");
  // window.location.href = "tela_doador_cadastro_material.html";
}

function editMaterial(materialId) {
  alert(`Editar material ${materialId}.`);
  // Implementar depois
}

function deleteMaterial(materialId) {
  if (confirm("Tem certeza que deseja deletar este material?")) {
    materials = materials.filter((m) => m._id !== materialId);
    renderMaterials();
  }
}

renderMaterials();
