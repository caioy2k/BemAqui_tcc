const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recyclablesOffered: [
      {
        recyclableId: mongoose.Schema.Types.ObjectId,
        recyclableName: String,
        quantity: Number,
        pointsPerUnit: Number,
      },
    ],
    benefitsRequested: [
      {
        benefitId: mongoose.Schema.Types.ObjectId,
        benefitName: String,
        quantity: Number,
        pointsCost: Number,
      },
    ],
    totalPointsOffered: {
      type: Number,
      required: true,
    },
    totalPointsRequested: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pendente", "aprovado", "concluido", "recusado"],
      default: "pendente",
    },
  },
  { timestamps: true }
);

const Trade = mongoose.model("Trade", tradeSchema);

module.exports = Trade;
