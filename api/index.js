// ╔══════════════════════════════════════════╗
// ║   WhiteListThread API                    ║
// ║   Author  : Rocky Chowdhury              ║
// ║   Version : 1.1.0                        ║
// ║   Platform: Vercel (Node.js + Express)   ║
// ╚══════════════════════════════════════════╝

const express = require("express");
const app = express();

app.use(express.json());

// ─── In-memory store ──────────────────────────────────────────────
let whiteListThreadIds = [];
let whiteListModeEnabled = false;
let notiEnabled = true;

// ─── Root Route ───────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    author: "Rocky Chowdhury",
    project: "WhiteListThread API",
    version: "1.1.0",
    status: "🟢 Online",
    endpoints: {
      "GET  /api/list":      "List all whitelisted thread IDs",
      "POST /api/add":       "Add thread ID(s) { tids: ['123', '456'] }",
      "POST /api/remove":    "Remove thread ID(s) { tids: ['123'] }",
      "GET  /api/mode":      "Get current mode status",
      "POST /api/mode":      "Set mode { enable: true/false }",
      "POST /api/mode/noti": "Set noti { enable: true/false }",
    },
  });
});

// ─── GET /api/list ────────────────────────────────────────────────
app.get("/api/list", (req, res) => {
  return res.json({
    success: true,
    count: whiteListThreadIds.length,
    whiteListThreadIds,
  });
});

// ─── POST /api/add ────────────────────────────────────────────────
app.post("/api/add", (req, res) => {
  const { tids } = req.body;
  if (!tids || !Array.isArray(tids) || tids.length === 0) {
    return res.status(400).json({ success: false, message: "⚠️ Please provide 'tids' as an array" });
  }
  const added = [], alreadyExists = [];
  for (const tid of tids) {
    const tidStr = String(tid);
    if (whiteListThreadIds.includes(tidStr)) alreadyExists.push(tidStr);
    else { whiteListThreadIds.push(tidStr); added.push(tidStr); }
  }
  return res.json({ success: true, message: `✅ Added ${added.length} thread(s)`, added, alreadyExists, currentList: whiteListThreadIds });
});

// ─── POST /api/remove ─────────────────────────────────────────────
app.post("/api/remove", (req, res) => {
  const { tids } = req.body;
  if (!tids || !Array.isArray(tids) || tids.length === 0) {
    return res.status(400).json({ success: false, message: "⚠️ Please provide 'tids' as an array" });
  }
  const removed = [], notFound = [];
  for (const tid of tids) {
    const tidStr = String(tid);
    const index = whiteListThreadIds.indexOf(tidStr);
    if (index !== -1) { whiteListThreadIds.splice(index, 1); removed.push(tidStr); }
    else notFound.push(tidStr);
  }
  return res.json({ success: true, message: `✅ Removed ${removed.length} thread(s)`, removed, notFound, currentList: whiteListThreadIds });
});

// ─── GET /api/mode ────────────────────────────────────────────────
app.get("/api/mode", (req, res) => {
  return res.json({ success: true, whiteListModeEnabled, notiEnabled });
});

// ─── POST /api/mode ───────────────────────────────────────────────
app.post("/api/mode", (req, res) => {
  const { enable } = req.body;
  if (typeof enable !== "boolean") {
    return res.status(400).json({ success: false, message: "⚠️ Please provide 'enable' as true or false" });
  }
  whiteListModeEnabled = enable;
  return res.json({ success: true, message: enable ? "✅ WhiteList Mode ON" : "❎ WhiteList Mode OFF", whiteListModeEnabled });
});

// ─── POST /api/mode/noti ──────────────────────────────────────────
app.post("/api/mode/noti", (req, res) => {
  const { enable } = req.body;
  if (typeof enable !== "boolean") {
    return res.status(400).json({ success: false, message: "⚠️ Please provide 'enable' as true or false" });
  }
  notiEnabled = enable;
  return res.json({ success: true, message: enable ? "✅ Noti ON" : "❎ Noti OFF", notiEnabled });
});

// ─── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "❌ Route not found", author: "Rocky Chowdhury" });
});

module.exports = app;
