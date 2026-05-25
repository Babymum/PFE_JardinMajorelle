const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Type physique de la zone
    typeZone: {
      type: String,
      required: true,
      enum: [
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
      ],
    },

    // Type d’expérience VR (optionnel)
    typeExperience: [{
      type: String,
     enum: [
      "audio_ambiance",   // sons naturels (eau, oiseaux…)
      "audio_guide",      // explication vocale
      "interaction",      // clic / action utilisateur
      "signaletique",     // orientation / navigation
      "point_interet"     // élément important à découvrir
    ],
    }],

    // Position 3D
    position3D: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },

    image: {
      type: String,
      trim: true,
    },

    modele3D: {
      type: String,
      trim: true,
    },

    informationsComplementaires: {
      type: String,
      trim: true,
    },

    // Coordonnées géographiques réelles pour la carte
    latitude: {
      type: Number,
      required: false,
      min: [-90, "La latitude doit être supérieure ou égale à -90"],
      max: [90, "La latitude doit être inférieure ou égale à 90"],
    },

    longitude: {
      type: Number,
      required: false,
      min: [-180, "La longitude doit être supérieure ou égale à -180"],
      max: [180, "La longitude doit être inférieure ou égale à 180"],
    },

    // Lien de streaming pour le guide audio
    audioUrl: {
      type: String,
      trim: true,
    },

    // Galerie d'images secondaires pour la vue détaillée de la zone
    gallery: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Index textuel pour la recherche floue sur le nom et la description
zoneSchema.index({ nom: "text", description: "text" });

// Index géographique/coordonnées
zoneSchema.index({ latitude: 1, longitude: 1 });

// Index simple sur le type de zone
zoneSchema.index({ typeZone: 1 });

module.exports = mongoose.model("Zone", zoneSchema);