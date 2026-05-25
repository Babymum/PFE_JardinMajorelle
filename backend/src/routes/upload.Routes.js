const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  uploadImage,
  uploadZoneImage,
} = require("../controllers/upload.Controller");

router.post(
  "/upload",
  auth,
  upload.single("image"),
  uploadImage
);

router.post(
  "/zone/:zoneId",
  auth,
  upload.single("image"),
  uploadZoneImage
);

module.exports = router;