// src/config/db.js
const mongoose = require("mongoose");
const runMigration = require("./migration");

// Fonction de connexion à la base de données MongoDB
const connectDB = async () => {
  // Vérifier que la variable d'environnement MONGO_URI est définie avant de tenter de se connecter
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("La variable MONGO_URI est manquante dans le fichier .env");
    }
    // Se connecter à MongoDB en utilisant l'URI de connexion définie dans le fichier .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Base de données connectée avec succès");
    
    // Lancer la migration et l'auto-seeding
    await runMigration();
    
    // Si la connexion échoue, une erreur sera attrapée et affichée dans la console
  } catch (error) {
    console.error("Erreur de connexion à la base de données :", error.message);
    process.exit(1);
  }
};
// Exporter la fonction de connexion pour pouvoir l'utiliser dans server.js
module.exports = connectDB;