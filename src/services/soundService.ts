/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Sound asset URLs
const SOUNDS = {
  CLICK: "https://www.soundjay.com/buttons/sounds/button-16.mp3",
  CORRECT: "https://www.soundjay.com/buttons/sounds/button-3.mp3",
  INCORRECT: "https://www.soundjay.com/buttons/sounds/button-10.mp3",
  SUCCESS: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
  GAME_TICK: "https://www.soundjay.com/buttons/sounds/button-09.mp3",
};

export const playSound = (type: keyof typeof SOUNDS) => {
  try {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.5;
    audio.play().catch(e => console.warn("Audio play blocked by browser:", e));
  } catch (err) {
    console.error("Error playing sound:", err);
  }
};
