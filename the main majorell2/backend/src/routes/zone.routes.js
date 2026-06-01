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

//Visiteur
// Récupérer toutes les zones
router.get("/", getAllZones);

// Récupérer une zone par ID
router.get("/:id", getZoneById);

// Ajouter une nouvelle zone
router.post("/", createZone);

// Modifier une zone
router.patch("/:id", updateZone);

// Supprimer une zone
router.delete("/:id", deleteZone);

// ADMIN
router.post("/", auth, createZone);
router.put("/:id", auth, updateZone);
router.delete("/:id", auth, deleteZone);

module.exports = router;