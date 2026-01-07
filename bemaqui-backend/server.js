// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user.js");
const jwt = require("jsonwebtoken");

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








// Middleware: Verificar se está autenticado
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "sua_chave_secreta_aqui");
    req.user = decoded; // Adiciona os dados do usuário na requisição
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

// Middleware: Verificar se é funcionário
const isEmployeeMiddleware = (req, res, next) => {
  if (!req.user.isEmployee) {
    return res.status(403).json({ error: "Acesso negado. Apenas funcionários podem acessar." });
  }
  next();
};

// Middleware: Verificar se é admin
const isAdminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Acesso negado. Apenas admins podem acessar." });
  }
  next();
};









app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nome, email e senha são obrigatórios." });
    }

    if (!role || !["beneficiario", "doador", "parceiro"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Tipo de usuário inválido." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

    // Criar usuário - a senha é criptografada AUTOMATICAMENTE pelo middleware
    const newUser = await User.create({
      name,
      email,
      password, // Passa a senha em texto plano - o middleware cuida do hash
      role,
      isAdmin: false,
      isEmployee: false,
    });

    res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isAdmin: newUser.isAdmin,
        isEmployee: newUser.isEmployee,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar usuário." });
  }
});











//rota de login!!

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Informe e-mail e senha." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    // Usar o método comparePassword
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        isEmployee: user.isEmployee,
      },
      process.env.JWT_SECRET || "sua_chave_secreta_aqui",
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      message: "Login realizado com sucesso.",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor ao fazer login." });
  }
});












//sistema de trocas aqui!


const Recyclable = require("./models/recyclable");
const Benefit = require("./models/benefit");
const Trade = require("./models/trade");

// ======= RECYCLABLES (Admin) =======

// GET all recyclables (público, para seleção)
app.get("/recyclables", async (req, res) => {
  try {
    const recyclables = await Recyclable.find({ status: "ativo" });
    res.json({ recyclables });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar recicláveis." });
  }
});

// POST create recyclable (admin only, depois)
app.post("/admin/recyclables", async (req, res) => {
  try {
    const { name, type, description, pointsValue } = req.body;

    if (!name || !type || !description || !pointsValue) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios." });
    }

    const newRecyclable = await Recyclable.create({
      name,
      type,
      description,
      pointsValue,
    });

    res.status(201).json({
      message: "Reciclável cadastrado com sucesso.",
      recyclable: newRecyclable,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar reciclável." });
  }
});

// ======= BENEFITS (Admin) =======

// GET all benefits (público, para seleção)
app.get("/benefits", async (req, res) => {
  try {
    const benefits = await Benefit.find({ status: "ativo" });
    res.json({ benefits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar benefícios." });
  }
});

// POST create benefit (admin only, depois)
app.post("/admin/benefits", async (req, res) => {
  try {
    const { name, category, description, pointsCost, quantity } = req.body;

    if (!name || !category || !description || !pointsCost) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios." });
    }

    const newBenefit = await Benefit.create({
      name,
      category,
      description,
      pointsCost,
      quantity,
    });

    res.status(201).json({
      message: "Benefício cadastrado com sucesso.",
      benefit: newBenefit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar benefício." });
  }
});





// ======= TRADES (Beneficiário) =======

// POST create trade (beneficiário realiza troca)
app.post("/trades", async (req, res) => {
  try {
    const { beneficiaryId, recyclablesOffered, benefitsRequested } = req.body;

    if (!beneficiaryId || !recyclablesOffered || !benefitsRequested) {
      return res
        .status(400)
        .json({ error: "Dados incompletos para realizar a troca." });
    }

    // Calcular pontos
    const totalPointsOffered = recyclablesOffered.reduce(
      (sum, item) => sum + item.pointsPerUnit * (item.quantity || 1),
      0
    );

    const totalPointsRequested = benefitsRequested.reduce(
      (sum, item) => sum + item.pointsCost * (item.quantity || 1),
      0
    );

    // Validar se pontos batem
    if (totalPointsOffered < totalPointsRequested) {
      return res.status(400).json({
        error: `Pontos insuficientes. Oferecido: ${totalPointsOffered}, Solicitado: ${totalPointsRequested}`,
      });
    }

    const newTrade = await Trade.create({
      beneficiaryId,
      recyclablesOffered,
      benefitsRequested,
      totalPointsOffered,
      totalPointsRequested,
      status: "pendente",
    });

    res.status(201).json({
      message: "Troca solicitada com sucesso. Aguardando aprovação.",
      trade: newTrade,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao realizar troca." });
  }
});

// GET trades do beneficiário
app.get("/trades/user/:beneficiaryId", async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const trades = await Trade.find({ beneficiaryId }).sort({ createdAt: -1 });

    res.json({ trades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar trocas." });
  }
});




// GET all trades (para admin/funcionário ver)
app.get("/trades", async (req, res) => {
  try {
    const trades = await Trade.find()
      .populate("beneficiaryId", "name email")
      .sort({ createdAt: -1 });

    res.json({ trades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar trocas." });
  }
});

// PATCH approve trade
app.patch("/trades/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const trade = await Trade.findByIdAndUpdate(
      id,
      { status: "aprovado" },
      { new: true }
    ).populate("beneficiaryId", "name email");

    if (!trade) {
      return res.status(404).json({ error: "Troca não encontrada." });
    }

    res.json({
      message: "Troca aprovada com sucesso.",
      trade,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao aprovar troca." });
  }
});

// PATCH reject trade
app.patch("/trades/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const trade = await Trade.findByIdAndUpdate(
      id,
      { status: "recusado", rejectionReason: reason },
      { new: true }
    ).populate("beneficiaryId", "name email");

    if (!trade) {
      return res.status(404).json({ error: "Troca não encontrada." });
    }

    res.json({
      message: "Troca recusada.",
      trade,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao recusar troca." });
  }
});
