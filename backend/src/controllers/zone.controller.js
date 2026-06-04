const mongoose = require("mongoose");
const zoneService = require("../services/zone.service");

// Récupérer toutes les zones
const getAllZones = async (req, res) => {
  try {
    const zones = await zoneService.getAllZones();
    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des zones",
      error: error.message,
    });
  }
};

// Récupérer une zone par ID
const getZoneById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID invalide",
      });
    }

    const zone = await zoneService.getZoneById(req.params.id);

    if (!zone) {
      return res.status(404).json({
        message: "Zone non trouvée",
      });
    }

    res.status(200).json(zone);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la zone",
      error: error.message,
    });
  }
};

// Créer une nouvelle zone
const createZone = async (req, res) => {
  try {
    const savedZone = await zoneService.createZone(req.body);

    res.status(201).json({
      message: "Zone créée avec succès",
      zone: savedZone,
    });
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la création de la zone",
      error: error.message,
    });
  }
};

// Mettre à jour une zone
const updateZone = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID invalide",
      });
    }

    const updatedZone = await zoneService.updateZone(req.params.id, req.body);

    if (!updatedZone) {
      return res.status(404).json({
        message: "Zone non trouvée",
      });
    }

    res.status(200).json({
      message: "Zone mise à jour avec succès",
      zone: updatedZone,
    });
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour de la zone",
      error: error.message,
    });
  }
};

// Supprimer une zone
const deleteZone = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID invalide",
      });
    }

    const deletedZone = await zoneService.deleteZone(req.params.id);

    if (!deletedZone) {
      return res.status(404).json({
        message: "Zone non trouvée",
      });
    }

    res.status(200).json({
      message: "Zone supprimée avec succès",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la zone",
      error: error.message,
    });
  }
};

module.exports = {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
};