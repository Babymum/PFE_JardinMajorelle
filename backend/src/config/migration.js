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
      "bassin": {
        latitude: 31.6415,
        longitude: -8.0025,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600",
          "https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=600",
          "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600",
          "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=600",
          "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?q=80&w=600",
          "https://images.unsplash.com/photo-1533038590840-1cde6e66b0a2?q=80&w=600"
        ]
      },
      "jardin_cactus": {
        latitude: 31.6422,
        longitude: -8.0022,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=600",
          "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=600",
          "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?q=80&w=600",
          "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=600",
          "https://images.unsplash.com/photo-1509423350716-97f9360b4e5f?q=80&w=600",
          "https://images.unsplash.com/photo-1551893478-d726eaf06427?q=80&w=600"
        ]
      },
      "cafe_bousafsaf": {
        latitude: 31.6419,
        longitude: -8.0023,
        audioUrl: "",
        gallery: [
          "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600",
          "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600",
          "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600",
          "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600",
          "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=600",
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600"
        ]
      },
      "allee_jardin": {
        latitude: 31.6412,
        longitude: -8.0020,
        audioUrl: "",
        gallery: [
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
          "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=600",
          "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600",
          "https://images.unsplash.com/photo-1472214222541-d510753a4907?q=80&w=600",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600",
          "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=600"
        ]
      },
      "jardin_bambou": {
        latitude: 31.6412,
        longitude: -8.0026,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600",
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600",
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
          "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=600",
          "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600",
          "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=600"
        ]
      },
      "villa_bleue": {
        latitude: 31.6418,
        longitude: -8.0028,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=600",
          "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600",
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600"
        ]
      },
      "musee_berbere": {
        latitude: 31.6418,
        longitude: -8.0024,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        gallery: [
          "https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=600",
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
          "https://images.unsplash.com/photo-1566121318599-27b055928d10?q=80&w=600",
          "https://images.unsplash.com/photo-1503174971373-b1f69850bdf4?q=80&w=600",
          "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600",
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600"
        ]
      },
      "cafe_majorelle": {
        latitude: 31.6415,
        longitude: -8.0030,
        audioUrl: "",
        gallery: [
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600",
          "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600",
          "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=600",
          "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600",
          "https://images.unsplash.com/photo-1522336572241-9946d7913b91?q=80&w=600",
          "https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?q=80&w=600"
        ]
      },
      "boutique": {
        latitude: 31.6417,
        longitude: -8.0029,
        audioUrl: "",
        gallery: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600",
          "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=600",
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
          "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600",
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600"
        ]
      },
      "librairie": {
        latitude: 31.6417,
        longitude: -8.0027,
        audioUrl: "",
        gallery: [
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600",
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600",
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600",
          "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600",
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=600",
          "https://images.unsplash.com/photo-1505664194779-8bebcb95c557?q=80&w=600"
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
        if (!zone.gallery || zone.gallery.length < 6) {
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
