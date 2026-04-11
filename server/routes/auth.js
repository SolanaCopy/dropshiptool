const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../services/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.warn("WAARSCHUWING: JWT_SECRET niet ingesteld!");

// Middleware: check JWT token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, error: "Niet ingelogd" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: "Ongeldige sessie" });
  }
}

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: "Vul alle velden in" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: "Wachtwoord moet minimaal 6 tekens zijn" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(400).json({ success: false, error: "Dit e-mailadres is al geregistreerd" });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, hash, name);

  const token = jwt.sign({ id: result.lastInsertRowid, email, name, plan: "starter" }, JWT_SECRET, { expiresIn: "30d" });

  res.json({
    success: true,
    data: {
      token,
      user: { id: result.lastInsertRowid, email, name, plan: "starter" },
    },
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Vul e-mail en wachtwoord in" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ success: false, error: "Onjuiste inloggegevens" });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, error: "Onjuiste inloggegevens" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, plan: user.plan }, JWT_SECRET, { expiresIn: "30d" });

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    },
  });
});

// GET /api/auth/me
router.get("/me", authMiddleware, (req, res) => {
  const user = db.prepare("SELECT id, email, name, plan, searchesToday, lastSearchDate, createdAt FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ success: false, error: "Gebruiker niet gevonden" });

  const { checkSearchLimit, getLimits } = require("../services/planLimits");
  const searchStatus = checkSearchLimit(req.user.id);
  const planLimits = getLimits(user.plan);

  res.json({
    success: true,
    data: {
      ...user,
      searchesRemaining: searchStatus.remaining,
      searchLimit: searchStatus.limit,
      planLimits,
    },
  });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
