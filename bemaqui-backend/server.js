// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user.js");

const app = express();
app.use(cors());
app.use(express.json());

// SUA URI DO ATLAS
const MONGO_URI = "mongodb+srv://bemaqui_user:PUAfTKsVRAmah5x3@cluster0.yzudoxj.mongodb.net/bemaqui?appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Conectado ao MongoDB Atlas");
    app.listen(3000, () => {
      console.log("Servidor rodando na porta 3000");
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err);
  });

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API BemAqui funcionando" });
});





app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "A senha deve ter pelo menos 8 caracteres." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Já existe um usuário cadastrado com este e-mail." });
    }

    const newUser = await User.create({
      name,
      email,
      role,
      password,
      isAdmin: false,
    });

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor ao cadastrar usuário." });
  }
});





//
// Rota de login de usuário
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Informe e-mail e senha." });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      message: "Login realizado com sucesso.",
      user: userWithoutPassword, // inclui role e isAdmin
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor ao fazer login." });
  }
});





//
//produtos
//

const Product = require("./models/product"); // importar no topo

// GET all products (para beneficiário ver)
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({ status: "ativo" })
      .populate("partnerId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      message: "Produtos listados com sucesso.",
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar produtos." });
  }
});

// GET products by partner (para parceiro ver seus próprios)
app.get("/products/partner/:partnerId", async (req, res) => {
  try {
    const { partnerId } = req.params;

    const products = await Product.find({ partnerId })
      .sort({ createdAt: -1 });

    res.json({
      message: "Produtos do parceiro listados.",
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar produtos." });
  }
});

// POST create product
app.post("/products", async (req, res) => {
  try {
    const { name, category, description, points, quantity, partnerId } =
      req.body;

    if (!name || !category || !description || !points || !partnerId) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios." });
    }

    const newProduct = await Product.create({
      name,
      category,
      description,
      points,
      quantity,
      partnerId,
      status: "ativo",
    });

    res.status(201).json({
      message: "Produto cadastrado com sucesso.",
      product: newProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar produto." });
  }
});

// PUT update product
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, points, quantity, status } =
      req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, category, description, points, quantity, status },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json({
      message: "Produto atualizado com sucesso.",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar produto." });
  }
});

// DELETE product
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json({
      message: "Produto deletado com sucesso.",
      product: deletedProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar produto." });
  }
});
