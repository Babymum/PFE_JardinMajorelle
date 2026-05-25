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

// Récupérer les zones avec pagination, filtrage et tri
const getAllZonesPaginated = async (options = {}) => {
  const { page = 1, limit = 20, search, typeZone, sort = "nom", order = "asc" } = options;
  
  const query = {};
  
  // Recherche textuelle floue sur le nom
  if (search) {
    query.nom = { $regex: search, $options: "i" };
  }
  
  // Filtrage par type
  if (typeZone) {
    query.typeZone = typeZone;
  }
  
  const sortOrder = order === "desc" ? -1 : 1;
  const sortCriteria = { [sort]: sortOrder };
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);
  
  const zones = await Zone.find(query)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limitNum)
    .lean();
    
  const total = await Zone.countDocuments(query);
  
  return {
    zones,
    pagination: {
      total,
      page: parseInt(page),
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  };
};

module.exports = {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
  getAllZonesPaginated,
};