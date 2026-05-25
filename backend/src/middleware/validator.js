// middleware/validator.js pour valider les requêtesentrantes
const validator = {
  // Validation de la tentative de connexion
  validateLogin: (req, res, next) => {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ message: "Adresse email invalide ou manquante." });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit comporter au moins 6 caractères." });
    }

    next();
  },

  // Validation de la création et mise à jour de zones
  validateZone: (req, res, next) => {
    const { nom, description, typeZone, position3D, latitude, longitude } = req.body;

    // Si c'est une création de zone, valider les champs requis
    if (req.method === "POST") {
      if (!nom || typeof nom !== "string" || nom.trim().length === 0) {
        return res.status(400).json({ message: "Le nom de la zone est requis et doit être textuel." });
      }

      if (!description || typeof description !== "string" || description.trim().length === 0) {
        return res.status(400).json({ message: "La description de la zone est requise." });
      }

      const validTypes = [
        "bassin",
        "jardin_cactus",
        "jardin_bambou",
        "villa_bleue",
        "musee_berbere",
        "allee_jardin",
        "cafe_majorelle",
        "cafe_bousafsaf",
        "boutique",
        "librairie"
      ];
      if (!typeZone || !validTypes.includes(typeZone)) {
        return res.status(400).json({ message: `Le type de zone doit être l'un des suivants : ${validTypes.join(", ")}` });
      }

      if (!position3D || typeof position3D.x !== "number" || typeof position3D.y !== "number" || typeof position3D.z !== "number") {
        return res.status(400).json({ message: "La position 3D (x, y, z) est requise et doit être numérique." });
      }
    }

    // Validation des coordonnées géographiques réelles (facultatives mais validées si fournies)
    if (latitude !== undefined) {
      if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
        return res.status(400).json({ message: "La latitude doit être un nombre compris entre -90 et 90 degrés." });
      }
    }

    if (longitude !== undefined) {
      if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: "La longitude doit être un nombre compris entre -180 et 180 degrés." });
      }
    }

    next();
  }
};

module.exports = validator;
