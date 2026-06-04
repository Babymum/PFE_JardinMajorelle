const express = require("express");

const router = express.Router();

const {
  textToSpeech,
} = require(
  "../controllers/audio.controller"
);

router.post(
  "/",
  textToSpeech
);

module.exports = router;
