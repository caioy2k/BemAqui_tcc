const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["beneficiario", "doador", "parceiro"],
    default: "beneficiario",
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isEmployee: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware: Criptografar senha ANTES de salvar
userSchema.pre("save", async function () {
  // Se a senha não foi modificada, passa direto
  if (!this.isModified("password")) {
    return;
  }

  try {
    // Hash da senha com salt de 10
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  } catch (err) {
    throw err;
  }
});

// Método: Comparar senha (útil no login)
userSchema.methods.comparePassword = async function (passwordToCompare) {
  return await bcrypt.compare(passwordToCompare, this.password);
};

module.exports = mongoose.model("User", userSchema);
