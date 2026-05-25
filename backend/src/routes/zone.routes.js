const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
} = require("../controllers/zone.controller");
const { validateZone } = require("../middleware/validator");

// Visiteur - Routes publiques
// Récupérer toutes les zones
router.get("/", getAllZones);

// Récupérer une zone par ID
router.get("/:id", getZoneById);

// ADMIN - Routes sécurisées (Mutations)
// Ajouter une nouvelle zone
router.post("/", auth, validateZone, createZone);

// Modifier une zone (supporte PUT et PATCH)
router.put("/:id", auth, validateZone, updateZone);
router.patch("/:id", auth, validateZone, updateZone);

// Supprimer une zone
router.delete("/:id", auth, deleteZone);

module.exports = router;