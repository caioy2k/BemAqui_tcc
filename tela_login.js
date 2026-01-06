const form = document.getElementById("login-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const userData = { email, password };

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erro ao fazer login.");
      return;
    }

    const user = data.user;

    alert("Login realizado com sucesso!");
    console.log("Usuário logado:", user);

    // salvar usuário no navegador
    localStorage.setItem("bemaquiUser", JSON.stringify(user));

    // decidir para qual menu ir
    if (user.isAdmin) {
      window.location.href = "telas-admin/tela_admin_menu.html";
    } else if (user.role === "beneficiario") {
      window.location.href = "telas-beneficiario/tela_beneficiario.html";
    } else if (user.role === "doador") {
      window.location.href = "telas-doador/tela_doador.html";
    } else if (user.role === "parceiro") {
      window.location.href = "telas-parceiro/tela_parceiro.html";
    } else {
      window.location.href = "tela_inicial.html";
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Não foi possível se conectar ao servidor.");
  }
});
