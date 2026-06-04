import { createAudioPlayer } from "expo-audio";

let currentPlayer = null;

export const zoneAudios = {
  villa_bleue: require("../../assets/audio/villa-bleue.mp3"),
  allee_jardin: require("../../assets/audio/allees.mp3"),
  bassin: require("../../assets/audio/bassin.mp3"),
  musee_berbere: require("../../assets/audio/musee-berbere.mp3"),
  jardin_cactus: require("../../assets/audio/jardin-cactus.mp3"),
  jardin_bambou: require("../../assets/audio/jardin-bambou.mp3"),
  boutique: require("../../assets/audio/boutique.mp3"),
  librairie: require("../../assets/audio/librairie.mp3"),
  cafe_bousafsaf: require("../../assets/audio/cafe-bousafsaf.mp3"),
  cafe_majorelle: require("../../assets/audio/cafe-majorelle.mp3"),
};

export const playZoneAudio = (typeZone) => {
  const audioFile = zoneAudios[typeZone];
  if (!audioFile) return null;

  currentPlayer?.remove?.();
  currentPlayer = createAudioPlayer(audioFile, {
    downloadFirst: true,
  });
  currentPlayer.play();

  return currentPlayer;
};
