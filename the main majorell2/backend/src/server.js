const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

console.log("🔍 TEST DE DIAGNOSTIC");
console.log("=====================");

// Test 1 : DNS
dns.resolveSrv('_mongodb._tcp.cluster0.x9tbyox.mongodb.net', (err, result) => {
  if (err) {
    console.log("❌ DNS MongoDB ÉCHOUÉ :", err.message);
  } else {
    console.log("✅ DNS MongoDB OK :", result);
  }
});

// Test 2 : Internet
dns.resolve4('8.8.8.8', (err, result) => {
  if (err) {
    console.log("❌ Internet ÉCHOUÉ :", err.message);
  } else {
    console.log("✅ Internet OK");
  }
});

require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté avec succès !");
  })
  .catch((error) => {
    console.log("❌ Erreur MongoDB :", error.message);
  });

// Importer l'application Express et la fonction de connexion à la base de données
const app = require("./app");

// Importer la fonction de connexion à la base de données
const connectDB = require("./config/db");

// Définir le port sur lequel le serveur va écouter
const PORT = process.env.PORT || 5000;

// Fonction pour démarrer le serveur après s'être connecté à la base de données
const startServer = async () => {
  // Essayer de se connecter à la base de données avant de lancer le serveur
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT}`);
    });
    // Si la connexion à la base de données échoue, une erreur sera attrapée et affichée dans la console  
  } catch (error) {
    console.error("Erreur au démarrage du serveur :", error.message);
    process.exit(1);
  }
};
// Afficher la variable d'environnement pour vérifier qu'elle est correctement chargée
console.log("ENV TEST:", process.env.MONGO_URI);
// Démarrer le serveur
startServer();