require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const trendsRoutes = require("./routes/trends");
const productsRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const favoritesRoutes = require("./routes/favorites");
const socialRoutes = require("./routes/social");
const historyRoutes = require("./routes/history");
const alertsRoutes = require("./routes/alerts");
const paymentRoutes = require("./routes/payment");

const app = express();
const PORT = process.env.PORT || 3005;

// CORS — in productie alleen eigen domein toestaan
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:3003", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    // Sta requests zonder origin toe (bv curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Webhook route needs raw body for signature verification — must be before express.json()
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 20, // max 20 login/register pogingen per 15 min
  message: { success: false, error: "Te veel pogingen. Probeer het over 15 minuten opnieuw." },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuut
  max: 30, // max 30 API calls per minuut
  message: { success: false, error: "Te veel verzoeken. Wacht even." },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/favorites", apiLimiter, favoritesRoutes);
app.use("/api/trends", apiLimiter, trendsRoutes);
app.use("/api/products", apiLimiter, productsRoutes);
app.use("/api/social", apiLimiter, socialRoutes);
app.use("/api/history", apiLimiter, historyRoutes);
app.use("/api/alerts", apiLimiter, alertsRoutes);
app.use("/api/payment", apiLimiter, paymentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Check verplichte env variabelen
const required = ["RAPIDAPI_KEY", "CJ_API_KEY", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`WAARSCHUWING: ${key} niet ingesteld in .env`);
  }
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DropShip API draait op poort ${PORT}`);
});
