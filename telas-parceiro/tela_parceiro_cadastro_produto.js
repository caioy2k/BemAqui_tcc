const form = document.getElementById("product-form");
const API_URL = "http://localhost:3000";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const storedUser = localStorage.getItem("bemaquiUser");
  if (!storedUser) {
    alert("Você precisa estar logado.");
    return;
  }

  const user = JSON.parse(storedUser);
  const partnerId = user._id;

  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const points = parseInt(document.getElementById("points").value);
  const quantity = parseInt(document.getElementById("quantity").value);

  const productData = {
    name,
    category,
    description,
    points,
    quantity,
    partnerId,
  };

  try {
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erro ao cadastrar produto.");
      return;
    }

    alert("Produto cadastrado com sucesso!");
    window.location.href = "tela_parceiro_produtos.html";
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Não foi possível se conectar ao servidor.");
  }
});
