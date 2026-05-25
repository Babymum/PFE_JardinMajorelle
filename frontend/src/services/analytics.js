// src/services/analytics.js
export const trackScreen = (screenName) => {
  console.log(`📈 [Analytics] Visite écran : ${screenName}`);
  // En production: PostHog.capture('$screenview', { name: screenName })
};

export const trackZoneEngagement = (zoneId, zoneName, action) => {
  console.log(`📈 [Analytics] Action sur la Zone "${zoneName}" : ${action}`);
  // En production: Mixpanel.track('zone_engagement', { zoneId, zoneName, action })
};

export const trackAudioCompletion = (zoneName, completionPercent) => {
  console.log(`📈 [Analytics] Guide Audio "${zoneName}" : ${completionPercent}% écoutés`);
};
