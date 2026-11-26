import type Phaser from "phaser";
import { P } from "./art/palette";
import type { Ambience } from "./bridge";
import { createBootScene } from "./scenes/bootScene";
import { createMapScene } from "./scenes/mapScene";

export function createGameConfig(
  phaser: typeof Phaser,
  parent: HTMLDivElement,
  reportError: (error: unknown) => void,
  setAmbience: (ambience: Ambience) => void,
): Phaser.Types.Core.GameConfig {
  return {
    type: phaser.AUTO,
    parent,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: P.water,
    audio: { noAudio: true },
    scale: { mode: phaser.Scale.RESIZE, width: "100%", height: "100%" },
    callbacks: {
      postBoot(game) {
        game.canvas.id = "world-canvas";
        game.canvas.tabIndex = 0;
        game.canvas.setAttribute("role", "application");
        game.canvas.setAttribute("aria-label", "SURFBIT world");
        game.canvas.setAttribute("aria-describedby", "world-instructions");
      },
    },
    scene: [createBootScene(phaser, reportError), createMapScene(phaser, reportError, setAmbience)],
  };
}
