// Importer Express
const express = require("express");

// Importer CORS
const cors = require("cors");

// Routes
const zoneRoutes = require("./routes/zone.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.Routes");
const chatRoutes = require("./routes/chat.routes");
const audioRoutes = require("./routes/audio.routes");

// Créer l'application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
app.use("/api/admin", adminRoutes);

app.use("/api/zones", zoneRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api", uploadRoutes);

app.use("/api/audio", audioRoutes);

// Route principale
app.get("/", (req, res) => {
  res.json({
    message: "Backend Jardin Majorelle en marche",
  });
});

// Middleware 404
app.use((req, res) => {
  res.status(404).json({
    message: "Route introuvable",
  });
});

// Export
module.exports = app;
