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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Zone", zoneSchema);