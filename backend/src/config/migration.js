const Zone = require("../models/zone.model");
const Admin = require("../models/admin.model");

const runMigration = async () => {
  try {
    console.log("🔄 Lancement de la migration et de l'auto-seeding des données...");

    // Seeding Admin s'il n'existe pas
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultAdmin = new Admin({
        email: "admin@majorelle.com",
        password: "adminPassword123" // Haché automatiquement par le pre-save hook !
      });
      await defaultAdmin.save();
      console.log("👤 Compte Admin par défaut créé (admin@majorelle.com / adminPassword123)");
    } else {
      console.log(`👤 Comptes admins trouvés en base : ${adminCount}`);
    }

    // Récupérer et mettre à jour les zones existantes
    const zones = await Zone.find({});
    console.log(`📍 Nombre de zones trouvées pour migration : ${zones.length}`);
    
    // Définir la configuration des coordonnées pour chaque type de zone
    const geodata = {
      "villa_bleue": {
        latitude: 31.6418,
        longitude: -8.0028,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=600",
          "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600"
        ]
      },
      "jardin_cactus": {
        latitude: 31.6422,
        longitude: -8.0022,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=600"
        ]
      },
      "bassin": {
        latitude: 31.6415,
        longitude: -8.0025,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600"
        ]
      },
      "musee_berbere": {
        latitude: 31.6418,
        longitude: -8.0024,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600"
        ]
      },
      "jardin_bambou": {
        latitude: 31.6412,
        longitude: -8.0026,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600"
        ]
      }
    };

    for (const zone of zones) {
      const data = geodata[zone.typeZone];
      if (data) {
        let updated = false;
        if (!zone.latitude || !zone.longitude) {
          zone.latitude = data.latitude;
          zone.longitude = data.longitude;
          updated = true;
        }
        if (!zone.audioUrl) {
          zone.audioUrl = data.audioUrl;
          updated = true;
        }
        if (!zone.gallery || zone.gallery.length === 0) {
          zone.gallery = data.gallery;
          updated = true;
        }
        if (updated) {
          await zone.save();
          console.log(`✅ Zone mise à jour avec succès : ${zone.nom} (${zone.typeZone})`);
        }
      }
    }

    console.log("✅ Migration et auto-seeding terminés.");
  } catch (error) {
    console.error("❌ Échec lors de la migration/auto-seeding :", error.message);
  }
};

module.exports = runMigration;
