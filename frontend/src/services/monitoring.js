// src/services/monitoring.js
export const logError = (error, context) => {
  console.warn("📊 [Sentry Tracking] Exception interceptée :", error.message, context);
  // En production, Sentry.captureException(error, { extra: context })
};
