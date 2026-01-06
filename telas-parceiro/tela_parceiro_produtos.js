let products = [];
const API_URL = "http://localhost:3000";

const productsContainer = document.getElementById("products-container");
const emptyState = document.getElementById("empty-state");

async function loadPartnerProducts() {
  try {
    const storedUser = localStorage.getItem("bemaquiUser");
    if (!storedUser) {
      alert("Você precisa estar logado.");
      return;
    }

    const user = JSON.parse(storedUser);
    const partnerId = user._id;

    const response = await fetch(`${API_URL}/products/partner/${partnerId}`);
    const data = await response.json();

    if (response.ok) {
      products = data.products;
      renderProducts();
    } else {
      alert(data.error || "Erro ao carregar produtos.");
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Não foi possível conectar ao servidor.");
  }
}

function renderProducts() {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  products.forEach((product) => {
    const row = document.createElement("div");
    row.className = "product-item";
    row.innerHTML = `
      <div class="product-info">
        <p class="product-name">${product.name}</p>
        <p class="product-category">${product.category}</p>
        <div class="product-details">
          <span>${product.points} pontos</span>
          <span>${product.quantity} unidades</span>
        </div>
      </div>
      <div class="product-status">
        <span class="status-badge status-${product.status}">${product.status}</span>
        <div class="product-actions">
          <button class="action-btn" onclick="editProduct('${product._id}')">Editar</button>
          <button class="action-btn delete" onclick="deleteProduct('${product._id}')">Deletar</button>
        </div>
      </div>
    `;
    productsContainer.appendChild(row);
  });
}

function redirectToCadastro() {
  window.location.href = "tela_parceiro_cadastro_produto.html";
}

function editProduct(productId) {
  alert(`Editar produto ${productId}. Implementar depois.`);
  // Redirecionar para tela de edição
}

async function deleteProduct(productId) {
  if (!confirm("Tem certeza que deseja deletar este produto?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      alert("Produto deletado com sucesso.");
      loadPartnerProducts();
    } else {
      alert(data.error || "Erro ao deletar produto.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível deletar o produto.");
  }
}

document.addEventListener("DOMContentLoaded", loadPartnerProducts);
