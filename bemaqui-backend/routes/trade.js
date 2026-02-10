const express = require('express');
const jwt = require('jsonwebtoken');
const Trade = require('../models/trade');
const User = require('../models/user.js');
const Recyclable = require('../models/recyclable');
const Benefit = require('../models/benefit');
const Transaction = require('../models/transaction');
const router = express.Router();

// ✅ MIDDLEWARES
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "sua_chave_secreta_aqui");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

const isEmployeeMiddleware = (req, res, next) => {
  if (!req.user.isEmployee) {
    return res.status(403).json({ error: "Acesso negado. Apenas funcionários podem acessar." });
  }
  next();
};

// === ROTAS ANTIGAS (COMPATIBILIDADE) ===
router.post("/trades", authMiddleware, async (req, res) => {
  try {
    const { beneficiaryId, recyclablesOffered, benefitsRequested } = req.body;

    if (!beneficiaryId || !recyclablesOffered || !benefitsRequested) {
      return res.status(400).json({ error: "Dados incompletos para realizar a troca." });
    }

    const totalPointsOffered = recyclablesOffered.reduce(
      (sum, item) => sum + item.pointsPerUnit * (item.quantity || 1),
      0
    );

    const totalPointsRequested = benefitsRequested.reduce(
      (sum, item) => sum + item.pointsCost * (item.quantity || 1),
      0
    );

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

router.get("/trades/user/:beneficiaryId", authMiddleware, async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const trades = await Trade.find({ beneficiaryId }).sort({ createdAt: -1 });
    res.json({ trades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar trocas." });
  }
});

router.get("/trades", authMiddleware, isEmployeeMiddleware, async (req, res) => {
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

router.patch("/trades/:id/approve", authMiddleware, isEmployeeMiddleware, async (req, res) => {
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

router.patch("/trades/:id/reject", authMiddleware, isEmployeeMiddleware, async (req, res) => {
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

// === NOVAS ROTAS DE MOEDAS ===
router.post("/create-trade-type1", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { recyclables, benefits, coinsFromWallet = 0 } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // 🔢 CALCULAR PONTOS DA RECICLAGEM
    let totalRecyclingPoints = 0;
    let recyclablesData = [];
    
    for (let item of recyclables) {
      const recyclable = await Recyclable.findById(item.recyclableId);
      if (!recyclable) {
        return res.status(404).json({ error: `Reciclável ${item.recyclableId} não encontrado` });
      }
      
      const points = recyclable.pointsValue * item.quantity;
      totalRecyclingPoints += points;
      
      recyclablesData.push({
        recyclableId: recyclable._id,
        recyclableName: recyclable.name,
        quantity: item.quantity,
        pointsPerUnit: recyclable.pointsValue,
      });
    }

    // 💰 CALCULAR CUSTO DOS BENEFÍCIOS
    let totalBenefitCost = 0;
    let benefitsData = [];
    
    for (let item of benefits) {
      const benefit = await Benefit.findById(item.benefitId);
      if (!benefit) {
        return res.status(404).json({ error: `Benefício ${item.benefitId} não encontrado` });
      }
      
      const cost = benefit.pointsCost * item.quantity;
      totalBenefitCost += cost;
      
      benefitsData.push({
        benefitId: benefit._id,
        benefitName: benefit.name,
        quantity: item.quantity,
        pointsCost: benefit.pointsCost,
      });
    }

    // ✅ VALIDAR SALDO DA CARTEIRA
    const coinsUsed = coinsFromWallet;
    if (user.wallet.balance < coinsUsed) {
      return res.status(400).json({ 
        error: "Saldo insuficiente", 
        available: user.wallet.balance,
        needed: coinsUsed 
      });
    }

    // 💸 CÁLCULO FINAL
    const totalAvailable = totalRecyclingPoints + coinsUsed;
    const coinsSurplus = Math.max(0, totalAvailable - totalBenefitCost);

    // ✅ SALVAR COM TODOS CAMPOS OBRIGATÓRIOS
    const trade = new Trade({
      beneficiaryId: userId,
      recyclablesOffered: recyclablesData,
      benefitsRequested: benefitsData,
      coinsOfferedFromWallet: coinsUsed,
      totalRecyclingPoints: totalRecyclingPoints,
      totalBenefitCost: totalBenefitCost,
      coinsSurplus: coinsSurplus,
      tradeType: "with_benefit",
      status: "pendente",
    });

    await trade.save();

    res.json({
      success: true,
      tradeId: trade._id,
      summary: {
        recyclablesPoints: totalRecyclingPoints,
        coinsFromWallet: coinsUsed,
        benefitsCost: totalBenefitCost,
        coinsSurplus: coinsSurplus,
        totalAvailable: totalAvailable
      },
      message: "Trade criada! Confirme para receber moedas."
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/create-trade-type2", authMiddleware, async (req, res) => {
  // ... seu código type2 igual
});

router.post("/confirm-trade/:tradeId", authMiddleware, async (req, res) => {
  // ... seu código confirm igual
});

router.post("/cancel-trade/:tradeId", authMiddleware, async (req, res) => {
  // ... seu código cancel igual
});

module.exports = router;
