let filteredProducts = [];
const API_URL = "http://localhost:3000";

const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const productsContainer = document.getElementById("products-container");
const emptyState = document.getElementById("empty-state");

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();

    if (response.ok) {
      filteredProducts = data.products;
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

  if (filteredProducts.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filteredProducts.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image">🎁</div>
      <div class="product-info">
        <p class="product-name">${product.name}</p>
        <p class="product-category">${product.category}</p>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-points">${product.points} pts</span>
          <button class="trade-btn" onclick="tradeProduct('${product._id}')">Trocar</button>
        </div>
      </div>
    `;
    productsContainer.appendChild(card);
  });
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  // Recarregar todos os produtos e filtrar
  loadProducts();

  // Aplicar filtros locais
  const allProducts = filteredProducts;
  filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  renderProducts();
}

function tradeProduct(productId) {
  const storedUser = localStorage.getItem("bemaquiUser");
  if (!storedUser) {
    alert("Você precisa estar logado para fazer uma troca.");
    return;
  }

  alert(
    `Você escolheu trocar o produto ${productId}. Implementar fluxo de troca.`
  );
  // Implementar depois: redirecionar para tela de confirmação
}

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

// Carregar produtos ao abrir a página
document.addEventListener("DOMContentLoaded", loadProducts);
