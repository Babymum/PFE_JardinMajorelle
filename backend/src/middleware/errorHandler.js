// middleware/errorHandler.js pour la gestion globale des erreurs
module.exports = (err, req, res, next) => {
  console.error("❌ ERREUR SERVEUR INTERCEPTÉE :", err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Une erreur interne du serveur est survenue.";

  res.status(statusCode).json({
    success: false,
    message: message,
    // Masquer la stack trace technique en production pour des raisons de sécurité
    error: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
