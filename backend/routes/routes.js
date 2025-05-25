const express = require("express");
const crypto = require("crypto");
const User = require("../schemas/User");
const Item = require("../schemas/Item");
const Order = require("../schemas/Order");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();

const OPENAI_API_KEY =
  "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";

// 📌 REGISTER USER
router.post("/users/register", async (req, res) => {
  try {
    const { firstName, lastName, email, age, contactNumber, password } =
      req.body;

    // Validate IIIT email
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(iiit\.ac\.in)$/.test(email)) {
      return res.status(400).json({ error: "Only IIIT emails allowed!" });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      age,
      contactNumber,
      password,
    });
    await user.save();
    const logged_user = await User.findOne({ email });

    req.session.userId = logged_user._id;
    const token = jwt.sign(
      {
        userId: logged_user._id,
        email: logged_user.email,
        firstName: logged_user.firstName,
        lastName: logged_user.lastName,
      },
      process.env.JWT_SECRET, // Use a strong secret key from environment variables
      { expiresIn: "1d" }
    );

    // Set a cookie with the session information
    res.cookie("token", token, {
      httpOnly: true, // Helps to protect from XSS
      secure: process.env.NODE_ENV === "production", // Only sends cookie over HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
      sameSite: "Strict", // Restrict cookie to same-site requests
    });
    res.status(200).json({ message: "User registered successfully!", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 LOGIN USER
// backend/routes/routes.js
router.post("/users/login", async (req, res) => {
  try {
    console.log("inside login");
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Store user ID in session
    req.session.userId = user._id;

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "Strict",
    });

    console.log("Login successful, session userId:", req.session.userId);
    res.status(200).json({ message: "Login successful!", userId: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 LOGOUT USER
router.get("/users/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully!" });
});

// 📌 ADD ITEM
router.post("/item/add", async (req, res) => {
  try {
    // Ensure the user is logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: Please log in." });
    }

    const sellerId = req.session.userId; // Get seller ID from session
    const { name, price, description, category } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new item
    const newItem = new Item({ name, price, description, category, sellerId });
    await newItem.save();

    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    console.error("Error adding item:", error);
    res
      .status(500)
      .json({ message: "Failed to add item", error: error.message });
  }
});

// 📌 GET ITEM BY ID
router.get("/item/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ADD TO CART
router.post("/addCart", async (req, res) => {
  try {
    console.log("inside cart");
    const { itemId } = req.body;

    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let userId = req.session.userId;
    console.log("User ID: " + userId);

    if (!userId || !itemId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if the item's seller ID matches the session user ID
    if (item.sellerId.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You cannot add your own item to the cart" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add item to cart
    user.cart.push(itemId);
    await user.save();

    return res
      .status(200)
      .json({ message: "Item added to cart", cart: user.cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

// 📌 GET CART ITEMS
router.get("/cart/:userId", async (req, res) => {
  try {
    console.log("cart");
    const { userId } = req.params;

    const user = await User.findById(userId).populate("cart");
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ cart: user.cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

router.post("/orders/create", async (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || orders.length === 0) {
      return res.status(400).json({ message: "No orders to process" });
    }

    const hash = crypto.createHash("sha256").update("orders.otp").digest("hex");

    const processedOrders = orders.map((order) => ({
      transactionId: order.transactionId || crypto.randomUUID(),
      itemId: order.itemId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      amount: order.amount,
      hashedOtp: hash,
    }));

    // Save all orders to DB
    await Order.insertMany(processedOrders);

    // Remove ordered items from the user's cart
    for (const order of orders) {
      await User.findByIdAndUpdate(order.buyerId, {
        $pull: { cart: order.itemId },
      });
    }

    res
      .status(201)
      .json({ message: "Order placed successfully", orders: processedOrders });
  } catch (error) {
    console.error("Error processing order:", error);
    res
      .status(500)
      .json({ message: "Error processing order", error: error.message });
  }
});

// 📌 GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 GET ALL ITEMS
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 GET ALL ORDERS
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    console.log("profile");
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(req.session.userId);
    const user = await User.findOne({ _id: req.session.userId });
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/profile/edit", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { firstName, lastName, age, contactNumber } = req.body;
    user.firstName = firstName;
    user.lastName = lastName;
    user.age = age;
    user.contactNumber = contactNumber;
    await user.save();

    res.status(200).json({ message: "Profile updated successfully!", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/orders/create", async (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || orders.length === 0) {
      return res.status(400).json({ message: "No orders to process" });
    }

    const hash = crypto.createHash("sha256").update("orders.otp").digest("hex");

    const processedOrders = orders.map((order) => ({
      transactionId: order.transactionId || crypto.randomUUID(),
      itemId: order.itemId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      amount: order.amount,
      hashedOtp: hash,
    }));

    // Save all orders to DB
    await Order.insertMany(processedOrders);

    // Remove ordered items from the user's cart
    for (const order of orders) {
      await User.findByIdAndUpdate(order.buyerId, {
        $pull: { cart: order.itemId },
      });
    }

    res
      .status(201)
      .json({ message: "Order placed successfully", orders: processedOrders });
  } catch (error) {
    console.error("Error processing order:", error);
    res
      .status(500)
      .json({ message: "Error processing order", error: error.message });
  }
});

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    res.clearCookie("sessionId", { path: "/" });

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed", error: err });
        }
        return res.status(200).json({ message: "Logout successful" });
      });
    } else {
      return res.status(200).json({ message: "Logout successful" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const Queue = require('better-queue');

// Create a queue for API requests
const requestQueue = new Queue(async (task, cb) => {
  try {
    const response = await axios(task);
    cb(null, response);
  } catch (err) {
    cb(err);
  }
}, {
  concurrent: 1,
  interval: 3000, // 3 seconds between requests
  maxRetries: 3,
  retryDelay: 5000
});

router.post("/support", async (req, res) => {
  try {
    const { messages } = req.body;
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    const response = await new Promise((resolve, reject) => {
      requestQueue.push({
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        data: {
          model: "gpt-3.5-turbo",
          messages: formattedMessages,
        },
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    });

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    const status = error.response?.status || 500;
    console.log(error)
    res.status(status).json({
      error: "Failed to fetch response from chatbot",
      details: error.response?.data?.error || error.message
    });
  }
});

router.get("/orders/history", async (req, res) => {
  try {
    const userId = req.session.userId; // Get logged-in user's ID
    // Fetch orders where the user is the buyer
    console.log(userId);
    const boughtOrders = await Order.find({
      buyerId: userId,
      status: "delivered",
    });

    // Fetch orders where the user is the seller
    const soldOrders = await Order.find({ sellerId: userId });

    // Fetch orders that are pending
    const pendingOrders = await Order.find({
      buyerId: userId,
      status: "pending",
    });
    // Extract unique item IDs from all orders
    const itemIds = [
      ...new Set([
        ...boughtOrders.map((order) => order.itemId),
        ...soldOrders.map((order) => order.itemId),
        ...pendingOrders.map((order) => order.itemId),
      ]),
    ];

    // Fetch item details from the Item collection
    const items = await Item.find({ _id: { $in: itemIds } });
    const itemMap = items.reduce((map, item) => {
      map[item._id.toString()] = item.name; // Convert ObjectId to string for easy lookup
      return map;
    }, {});

    // Format response with item names
    res.json({
      bought: boughtOrders.map((order) => ({
        transactionId: order.transactionId,
        itemName: itemMap[order.itemId.toString()] || "Unknown Item",
        amount: order.amount,
      })),
      sold: soldOrders.map((order) => ({
        transactionId: order.transactionId,
        itemName: itemMap[order.itemId.toString()] || "Unknown Item",
        buyerName: order.buyerId?.firstName || "Unknown Buyer",
        amount: order.amount,
      })),
      pending: pendingOrders.map((order) => ({
        transactionId: order.transactionId,
        itemName: itemMap[order.itemId.toString()] || "Unknown Item",
      })),
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ message: "Error fetching order history" });
  }
});

router.get("/orders/pending-deliveries", async (req, res) => {
  try {
    const userId = req.session.userId; // Get logged-in user's ID

    // Fetch pending deliveries where the user is the seller and status is "pending"
    const pendingDeliveries = await Order.find({
      sellerId: userId,
      status: "pending",
    });

    // Extract unique item and buyer IDs
    const itemIds = [
      ...new Set(pendingDeliveries.map((order) => order.itemId)),
    ];
    const buyerIds = [
      ...new Set(pendingDeliveries.map((order) => order.buyerId)),
    ];

    // Fetch item and buyer details
    const items = await Item.find({ _id: { $in: itemIds } });
    const buyers = await User.find({ _id: { $in: buyerIds } });

    // Create lookup maps
    const itemMap = Object.fromEntries(
      items.map((item) => [item._id.toString(), item.name])
    );
    const buyerMap = Object.fromEntries(
      buyers.map((user) => [
        user._id.toString(),
        { name: user.firstName, email: user.email },
      ])
    );

    // Format response with required details
    res.json({
      pendingDeliveries: pendingDeliveries.map((order) => ({
        transactionId: order.transactionId,
        itemName: itemMap[order.itemId.toString()] || "Unknown Item",
        buyerName: buyerMap[order.buyerId.toString()]?.name || "Unknown Buyer",
        buyerEmail:
          buyerMap[order.buyerId.toString()]?.email || "Unknown Email",
        amount: order.amount,
      })),
    });
  } catch (error) {
    console.error("Error fetching pending deliveries:", error);
    res.status(500).json({ message: "Error fetching pending deliveries" });
  }
});

// Endpoint to generate and return OTP

router.post("/otp", async (req, res) => {
  try {
    console.log("hi");
    let { transactionId } = req.body;
    // console.log(itemId, buyerId, sellerId);
    console.log(req.body);

    // if (!transactionId || !itemId || !buyerId || !sellerId || !amount) {
    //   return res.status(400).json({ error: "Missing required fields" });
    // }

    // // Validate MongoDB ObjectIds
    // if (![itemId, buyerId, sellerId].every(mongoose.Types.ObjectId.isValid)) {
    //   return res.status(400).json({ error: "Invalid ObjectId format" });
    // }
    // Parse amount as a number
    // amount = parseFloat(amount);
    // // console.log(amount)
    // if (isNaN(amount) || amount <= 0) {
    //   return res.status(400).json({ error: "Invalid amount" });
    // }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    console.log(otp);

    // Update or create order
    const order = await Order.findOneAndUpdate(
      { transactionId },
      { hashedOtp, status: "pending" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: "OTP generated successfully", order, otp });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { orderId, otp } = req.body;

  if (!orderId || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Order ID and OTP are required." });
  }

  try {
    const order = await Order.findOne({ transactionId: orderId });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (order.hashedOtp !== hashedOtp) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // Update order status to "delivered"
    order.status = "delivered";
    await order.save();

    res.json({
      success: true,
      message: "OTP verified successfully. Delivery confirmed!",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

module.exports = router;
