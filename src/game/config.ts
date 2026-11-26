import type Phaser from "phaser";
import { P } from "./art/palette";
import { createBootScene } from "./scenes/bootScene";
import { createMapScene } from "./scenes/mapScene";

export function createGameConfig(
  phaser: typeof Phaser,
  parent: HTMLDivElement,
  reportError: (error: unknown) => void,
): Phaser.Types.Core.GameConfig {
  return {
    type: phaser.AUTO,
    parent,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: P.water,
    scale: { mode: phaser.Scale.RESIZE, width: "100%", height: "100%" },
    callbacks: {
      postBoot(game) {
        game.canvas.id = "world-canvas";
        game.canvas.tabIndex = -1;
        game.canvas.setAttribute("role", "img");
        game.canvas.setAttribute("aria-label", "SURFBIT beach town map");
      },
    },
    scene: [createBootScene(phaser, reportError), createMapScene(phaser, reportError)],
  };
}
