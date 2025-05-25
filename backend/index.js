const express = require("express");
const connectDB = require("./db");
const routes = require("./routes/routes");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require('connect-mongo'); // For cookie handling

const app = express();
connectDB();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser()); // For parsing cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure express-session
app.use(
  session({
    secret: "yourSecretKey", // Make sure to set a secret key
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/your_db' }),
    cookie: {
      httpOnly: true, // Make sure the cookie is sent only to HTTP requests
      secure: process.env.NODE_ENV === "production", // Set to true in production if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day expiration time for the session cookie
    },
  })
);

app.use("/api", routes);

// add a route to end point /
app.get('/', (req, res) => res.send('Hello World!'));

app.listen(5000, () => console.log('Server running on port 5000'));