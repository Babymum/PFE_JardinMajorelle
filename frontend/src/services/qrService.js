// src/services/qrService.js
export const parseQRContent = (content) => {
  if (!content) return null;
  
  // Gère les URLs d'accès direct type "https://jardinmajorelle.com/zone/65abc123..."
  // ou un ID de zone brut type "65abc123..."
  const match = content.match(/zone\/([a-f\d]{24})/i) || content.match(/^([a-f\d]{24})$/i);
  
  return match ? match[1] : null;
};
