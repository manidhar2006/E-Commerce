const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(iiit\.ac\.in)$/, "Only IIIT emails allowed!"]
  },
  age: { type: Number, required: true },
  contactNumber: { type: String, required: true },
  password: { type: String, required: true },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
  items: [
    {
      name: { type: String, required: true },
      description: { type: String },
      price: { type: Number, required: true },
      category: { type: String },
    }
  ]
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
