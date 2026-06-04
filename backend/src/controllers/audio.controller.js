const {
  generateSpeech,
} = require("../services/elevenlabs.service");

const textToSpeech = async (
  req,
  res
) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Texte requis",
      });
    }

    const audioBuffer =
      await generateSpeech(text);

    res.json({
      success: true,
      mimeType: "audio/mpeg",
      audioContent:
        Buffer.from(audioBuffer).toString("base64"),
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Erreur génération audio",
    });
  }
};

module.exports = {
  textToSpeech,
};
