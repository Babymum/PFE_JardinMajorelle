const Zone = require("../models/zone.model");

const uploadImage = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Image uploadée avec succès",
      imageUrl: req.file.location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const uploadZoneImage = async (req, res) => {
  try {
    const { zoneId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Aucune image fournie",
      });
    }

    const imageUrl = req.file.location;

    const updatedZone = await Zone.findByIdAndUpdate(
      zoneId,
      { image: imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedZone) {
      return res.status(404).json({
        success: false,
        error: "Zone non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image de zone uploadée avec succès",
      zone: updatedZone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
  uploadZoneImage,
};