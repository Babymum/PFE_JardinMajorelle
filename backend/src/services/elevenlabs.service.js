const axios = require("axios");

const generateSpeech = async (text) => {
  try {
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/HuLbOdhRlvQQN8oPP0AJ",
      {
        text: text,
        model_id: "eleven_multilingual_v2",
      },
      {
        responseType: "arraybuffer",
        headers: {
          "xi-api-key":
            process.env.ELEVENLABS_API_KEY,
          "Content-Type":
            "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Erreur ElevenLabs :",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  generateSpeech,
};