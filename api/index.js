// ╔══════════════════════════════════════════╗
// ║   WhiteListThread API                    ║
// ║   Author  : Rocky Chowdhury              ║
// ║   Version : 1.0.0                        ║
// ║   Platform: Vercel (Node.js + Express)   ║
// ╚══════════════════════════════════════════╝

const express = require("express");
const app = express();

app.use(express.json());

// ─── In-memory store (Vercel serverless = no file system write) ───
let whiteListThreadIds = [];
let whiteListModeEnabled = false;
let notiEnabled = true;

// ─── API Key Middleware ───────────────────────────────────────────
const API_KEY = process.env.API_KEY || "rocky-secret-key";

function authMiddleware(req, res, next) {
  const key = req.headers["x-api-key"] || req.query.api_key;
  if (key !== API_KEY) {
    return res.status(401).json({
      success: false,
      message: "⚠️ Unauthorized: Invalid API Key",
    });
  }
  next();
}

// ─── Root Route ───────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    author: "Rocky Chowdhury",
    project: "WhiteListThread API",
    version: "1.0.0",
    status: "🟢 Online",
    endpoints: {
      "GET  /api/list":              "List all whitelisted thread IDs",
      "POST /api/add":               "Add thread ID(s) { tids: ['123', '456'] }",
      "POST /api/remove":            "Remove thread ID(s) { tids: ['123'] }",
      "GET  /api/mode":              "Get current mode status",
      "POST /api/mode":              "Set mode { enable: true/false }",
      "POST /api/mode/noti":         "Set noti { enable: true/false }",
    },
    note: "All routes require header: x-api-key: <your_key>",
  });
});

// ─── GET /api/list ────────────────────────────────────────────────
app.get("/api/list", authMiddleware, (req, res) => {
  return res.json({
    success: true,
    count: whiteListThreadIds.length,
    whiteListThreadIds,
  });
});

// ─── POST /api/add ────────────────────────────────────────────────
app.post("/api/add", authMiddleware, (req, res) => {
  const { tids } = req.body;

  if (!tids || !Array.isArray(tids) || tids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "⚠️ Please provide 'tids' as an array of thread IDs",
    });
  }

  const added = [];
  const alreadyExists = [];

  for (const tid of tids) {
    const tidStr = String(tid);
    if (whiteListThreadIds.includes(tidStr)) {
      alreadyExists.push(tidStr);
    } else {
      whiteListThreadIds.push(tidStr);
      added.push(tidStr);
    }
  }

  return res.json({
    success: true,
    message: `✅ Added ${added.length} thread(s)`,
    added,
    alreadyExists,
    currentList: whiteListThreadIds,
  });
});

// ─── POST /api/remove ─────────────────────────────────────────────
app.post("/api/remove", authMiddleware, (req, res) => {
  const { tids } = req.body;

  if (!tids || !Array.isArray(tids) || tids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "⚠️ Please provide 'tids' as an array of thread IDs",
    });
  }

  const removed = [];
  const notFound = [];

  for (const tid of tids) {
    const tidStr = String(tid);
    const index = whiteListThreadIds.indexOf(tidStr);
    if (index !== -1) {
      whiteListThreadIds.splice(index, 1);
      removed.push(tidStr);
    } else {
      notFound.push(tidStr);
    }
  }

  return res.json({
    success: true,
    message: `✅ Removed ${removed.length} thread(s)`,
    removed,
    notFound,
    currentList: whiteListThreadIds,
  });
});

// ─── GET /api/mode ────────────────────────────────────────────────
app.get("/api/mode", authMiddleware, (req, res) => {
  return res.json({
    success: true,
    whiteListModeEnabled,
    notiEnabled,
  });
});

// ─── POST /api/mode ───────────────────────────────────────────────
app.post("/api/mode", authMiddleware, (req, res) => {
  const { enable } = req.body;

  if (typeof enable !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "⚠️ Please provide 'enable' as true or false",
    });
  }

  whiteListModeEnabled = enable;

  return res.json({
    success: true,
    message: enable
      ? "✅ WhiteList Mode turned ON — only whitelisted threads can use bot"
      : "❎ WhiteList Mode turned OFF",
    whiteListModeEnabled,
  });
});

// ─── POST /api/mode/noti ──────────────────────────────────────────
app.post("/api/mode/noti", authMiddleware, (req, res) => {
  const { enable } = req.body;

  if (typeof enable !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "⚠️ Please provide 'enable' as true or false",
    });
  }

  notiEnabled = enable;

  return res.json({
    success: true,
    message: enable
      ? "✅ Notification turned ON for non-whitelisted threads"
      : "❎ Notification turned OFF for non-whitelisted threads",
    notiEnabled,
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "❌ Route not found",
    author: "Rocky Chowdhury",
  });
});

module.exports = app;
