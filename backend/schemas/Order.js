const crypto = require("crypto");
const mongoose = require("mongoose");

// Order Schema

const OrderSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  hashedOtp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "pending"},
});

// Function to hash OTP before saving
OrderSchema.methods.setOtp = function (otp) {
  this.hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
};

module.exports = mongoose.model("Order", OrderSchema);
