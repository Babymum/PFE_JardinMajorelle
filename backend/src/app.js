// Importer Express
const express = require("express");

// Importer CORS et middlewares de sécurité
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// Routes
const zoneRoutes = require("./routes/zone.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.Routes");
const chatRoutes = require("./routes/chat.routes");
const healthRoutes = require("./routes/health.routes");
const audioRoutes = require("./routes/audio.routes");

// Créer l'application
const app = express();

// Sécuriser les en-têtes HTTP avec Helmet
app.use(helmet());

// Activer la compression Gzip des réponses
app.use(compression());

// Configurer CORS
app.use(cors());

// Limiter la taille du corps JSON à 100kb
app.use(express.json({ limit: "100kb" }));

// Définir des limiteurs de débit (Rate Limiters)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requêtes
  message: { message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // max 10 tentatives de connexion
  message: { message: "Trop de tentatives de connexion, veuillez réessayer après 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15,
  message: { message: "Limite de messages atteinte. Veuillez ralentir vos requêtes au chatbot." },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Trop d'images chargées, veuillez réessayer après 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Appliquer les rate limiters spécifiques sur les endpoints sensibles
app.use("/api/admin/login", loginLimiter);
app.use("/api/chat", chatLimiter);
app.use("/api/upload", uploadLimiter);
app.use("/api/zone/:zoneId", uploadLimiter);

// Appliquer le rate limit général
app.use("/api", generalLimiter);

// Routes API
app.use("/health", healthRoutes);
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

const errorHandler = require("./middleware/errorHandler");

// Middleware 404
app.use((req, res) => {
  res.status(404).json({
    message: "Route introuvable",
  });
});

// Gestionnaire global d'erreurs
app.use(errorHandler);

// Export
module.exports = app;
