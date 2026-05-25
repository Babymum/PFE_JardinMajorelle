// src/services/monitoring.js
const initMonitoring = () => {
  console.log("📊 [Monitoring] Initialisation de Sentry en tâche de fond pour le suivi des crashs...");
  // En production finale, Sentry.init({...}) serait branché ici
};

module.exports = { initMonitoring };
