const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb+srv://bemaqui_user:PUAfTKsVRAmah5x3@cluster0.yzudoxj.mongodb.net/bemaqui?appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Conectado ao MongoDB Atlas");
    app.listen(3000, () => {
      console.log("🚀 Servidor rodando na porta 3000");
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
  });

app.get("/", (req, res) => {
  res.json({ message: "API BemAqui funcionando ✅" });
});

// ✅ ROTAS SIMPLES
app.use('/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/recyclables', require('./routes/recyclables'));
app.use('/benefits', require('./routes/benefits'));
app.use('/trade', require('./routes/trade'));

app.use('/trades', require('./routes/trade'));

console.log("✅ Server.js funcionando!");
