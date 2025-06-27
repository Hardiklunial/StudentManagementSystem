const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit")
const publicKeyRoute = require("./routes/auth/publicKeyRoute");
const loginRoute = require("./routes/auth/loginRoute");
const {correlationIdMiddleware } = require("../correlationId");
dotenv.config();

const limiter = rateLimit({
  windowsMs : 60*1000,
  max: 5,
  message: "Too many requests",
  headers: true,
});

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(correlationIdMiddleware)

app.use(correlationIdMiddleware);


// Public Key
app.use("/.well-known/jwks.json", publicKeyRoute);

// Routes
app.use("/api/login", limiter, loginRoute);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Auth Server running on port ${PORT}`);
});
