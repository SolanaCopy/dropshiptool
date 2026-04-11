const express = require("express");
const crypto = require("crypto");
const db = require("../services/database");
const { authMiddleware } = require("./auth");

const router = express.Router();

// Ensure payments table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    plan TEXT NOT NULL,
    annual INTEGER DEFAULT 0,
    amount REAL NOT NULL,
    reference TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    lsSubscriptionId TEXT DEFAULT '',
    lsCustomerId TEXT DEFAULT '',
    currentPeriodEnd TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`);

// Add new columns if they don't exist (migration for existing DBs)
try { db.exec("ALTER TABLE payments ADD COLUMN lsSubscriptionId TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE payments ADD COLUMN lsCustomerId TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE payments ADD COLUMN currentPeriodEnd TEXT DEFAULT ''"); } catch (e) {}

// POST /api/payment/webhook — LemonSqueezy webhook
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const secret = process.env.LS_WEBHOOK_SECRET;
  if (!secret) {
    console.error("LS_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  // Verify signature
  const signature = req.headers["x-signature"];
  if (!signature) {
    return res.status(401).json({ error: "No signature" });
  }

  const rawBody = typeof req.body === "string" ? req.body : req.body.toString();
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const sig = Buffer.from(signature, "utf8");

  if (!crypto.timingSafeEqual(digest, sig)) {
    console.error("Webhook signature mismatch");
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Parse payload
  let payload;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const eventName = payload.meta?.event_name;
  const customData = payload.meta?.custom_data || {};
  const data = payload.data?.attributes || {};

  // Zoek user op via user_id (custom_data) of als fallback via email
  let userId = customData.user_id;
  if (!userId && data.user_email) {
    const userByEmail = db.prepare("SELECT id FROM users WHERE email = ?").get(data.user_email);
    if (userByEmail) {
      userId = userByEmail.id;
      console.log(`\nLS Webhook: ${eventName} — found user ${userId} via email ${data.user_email}`);
    }
  }

  console.log(`\nLS Webhook: ${eventName} — user ${userId} (email: ${data.user_email || "n/a"})`);

  switch (eventName) {
    case "subscription_created":
    case "subscription_updated":
    case "subscription_resumed": {
      if (!userId) {
        console.error("No user_id in webhook custom data");
        return res.json({ received: true });
      }

      const status = data.status; // active, paused, cancelled, expired
      const subscriptionId = String(payload.data?.id || "");
      const customerId = String(data.customer_id || "");
      const periodEnd = data.renews_at || "";
      const amount = (data.first_subscription_item?.price || 0) / 100;

      if (status === "active") {
        db.prepare("UPDATE users SET plan = 'pro' WHERE id = ?").run(userId);

        const existing = db.prepare("SELECT id FROM payments WHERE lsSubscriptionId = ?").get(subscriptionId);
        if (existing) {
          db.prepare(`
            UPDATE payments SET status = 'active', currentPeriodEnd = ? WHERE lsSubscriptionId = ?
          `).run(periodEnd, subscriptionId);
        } else {
          db.prepare(`
            INSERT INTO payments (userId, plan, annual, amount, reference, status, lsSubscriptionId, lsCustomerId, currentPeriodEnd)
            VALUES (?, 'pro', 0, ?, ?, 'active', ?, ?, ?)
          `).run(userId, amount, `LS-${subscriptionId}`, subscriptionId, customerId, periodEnd);
        }

        const user = db.prepare("SELECT name, email FROM users WHERE id = ?").get(userId);
        console.log(`  -> ${user?.name} (${user?.email}) upgraded to pro`);
      }
      break;
    }

    case "subscription_cancelled":
    case "subscription_expired":
    case "subscription_paused": {
      if (!userId) {
        // Try to find user by subscription ID
        const subscriptionId = String(payload.data?.id || "");
        const payment = db.prepare("SELECT userId FROM payments WHERE lsSubscriptionId = ?").get(subscriptionId);
        if (payment) {
          db.prepare("UPDATE users SET plan = 'starter' WHERE id = ?").run(payment.userId);
          db.prepare("UPDATE payments SET status = 'cancelled' WHERE lsSubscriptionId = ?").run(subscriptionId);
          console.log(`  -> User ${payment.userId} downgraded to starter`);
        }
      } else {
        db.prepare("UPDATE users SET plan = 'starter' WHERE id = ?").run(userId);
        const subscriptionId = String(payload.data?.id || "");
        if (subscriptionId) {
          db.prepare("UPDATE payments SET status = 'cancelled' WHERE lsSubscriptionId = ?").run(subscriptionId);
        }
        console.log(`  -> User ${userId} downgraded to starter`);
      }
      break;
    }

    case "subscription_payment_success": {
      if (userId) {
        db.prepare("UPDATE users SET plan = 'pro' WHERE id = ?").run(userId);
      }
      console.log(`  -> Payment success for user ${userId}`);
      break;
    }

    case "subscription_payment_failed": {
      // Payment failed — could downgrade or send warning
      console.log(`  -> Payment FAILED for user ${userId}`);
      break;
    }

    default:
      console.log(`  -> Unhandled event: ${eventName}`);
  }

  res.json({ received: true });
});

// GET /api/payment/status — check subscription status
router.get("/status", authMiddleware, (req, res) => {
  try {
    const payment = db.prepare(`
      SELECT * FROM payments WHERE userId = ? AND status = 'active' ORDER BY createdAt DESC LIMIT 1
    `).get(req.user.id);

    res.json({
      success: true,
      data: payment ? {
        plan: payment.plan,
        active: true,
        renewsAt: payment.currentPeriodEnd,
        subscriptionId: payment.lsSubscriptionId,
      } : {
        plan: "starter",
        active: false,
      },
    });
  } catch (e) {
    res.json({ success: true, data: { plan: "starter", active: false } });
  }
});

// GET /api/payment/history — betaalgeschiedenis
router.get("/history", authMiddleware, (req, res) => {
  try {
    const payments = db.prepare(
      "SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC"
    ).all(req.user.id);
    res.json({ success: true, data: payments });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
