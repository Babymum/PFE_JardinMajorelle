const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  uploadImage,
  uploadZoneImage,
} = require("../controllers/upload.Controller");

router.post(
  "/upload",
  upload.single("image"),
  uploadImage
);

router.post(
  "/zone/:zoneId",
  upload.single("image"),
  uploadZoneImage
);

module.exports = router;