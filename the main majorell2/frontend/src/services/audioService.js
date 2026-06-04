import { createAudioPlayer } from "expo-audio";

let currentPlayer = null;

export const playAudio = async (audioFile) => {
  try {
    currentPlayer?.remove?.();

    currentPlayer = createAudioPlayer(audioFile, {
      downloadFirst: true,
    });

    currentPlayer.play();
    return currentPlayer;
  } catch (error) {
    console.log("Erreur audio :", error);
  }
};
