const Zone = require("../models/zone.model");

// Récupérer toutes les zones
const getAllZones = async () => {
  return await Zone.find().lean();
};

// Récupérer une zone par son identifiant
const getZoneById = async (id) => {
  return await Zone.findById(id).lean();
};

// Créer une nouvelle zone
const createZone = async (zoneData) => {
  const newZone = new Zone(zoneData);
  return await newZone.save();
};

// Mettre à jour une zone existante
const updateZone = async (id, zoneData) => {
  return await Zone.findByIdAndUpdate(id, zoneData, {
    new: true,
    runValidators: true,
  });
};

// Supprimer une zone
const deleteZone = async (id) => {
  return await Zone.findByIdAndDelete(id);
};

module.exports = {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
};