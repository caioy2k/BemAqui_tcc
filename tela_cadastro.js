const form = document.getElementById("register-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;
  const password = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("passwordConfirm").value;

  if (password !== passwordConfirm) {
    alert("As senhas não conferem.");
    return;
  }

  const userData = { name, email, role, password };

  try {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erro ao cadastrar usuário.");
      return;
    }

    alert("Cadastro realizado com sucesso!");
    console.log("Usuário retornado pela API:", data.user);
    form.reset();
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Não foi possível se conectar ao servidor.");
  }
});
