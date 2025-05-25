const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, required: true },
    sellerId: { type: String, required: true },
    dateAdded: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("Item", ItemSchema);
  