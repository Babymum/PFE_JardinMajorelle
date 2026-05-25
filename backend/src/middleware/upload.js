const multer = require("multer");
const multerS3 = require("multer-s3");
const crypto = require("crypto");
const s3 = require("../services/s3.Service");

// Configuration du filtre de fichiers
const fileFilter = (req, file, cb) => {
  // Types MIME autorisés
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error("Format invalide. Seuls les formats JPEG, PNG et WEBP sont acceptés."),
      false
    );
  }

  // Double vérification des extensions interdites (fichiers exécutables/scripts)
  const ext = file.originalname.substring(file.originalname.lastIndexOf(".")).toLowerCase();
  const bannedExtensions = [".exe", ".sh", ".bat", ".cmd", ".msi", ".js", ".ts", ".py", ".php", ".vbs", ".scr", ".pif"];
  
  if (bannedExtensions.includes(ext) || file.originalname.match(/\.(exe|sh|bat|cmd|msi|vbs|com|scr|pif|js|ts|py|pl|rb|php)$/i)) {
    return cb(
      new Error("Sécurité : Les fichiers exécutables ou de script sont interdits."),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5 Mo
  },
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
      });
    },
    key: function (req, file, cb) {
      // Générer un nom de fichier unique avec un UUID
      const ext = file.originalname.substring(file.originalname.lastIndexOf(".")).toLowerCase();
      const uuid = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
      const fileName = `${uuid}${ext}`;
      cb(null, fileName);
    },
  }),
});

module.exports = upload;
