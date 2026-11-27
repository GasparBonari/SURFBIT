import type Phaser from "phaser";
import { preloadTextures, registerTextures } from "../textures";
import { MAP_SCENE_KEY, type MapSceneData } from "./mapScene";

export function createBootScene(phaser: typeof Phaser, reportError: (error: unknown) => void) {
  return class BootScene extends phaser.Scene {
    constructor() {
      super("BootScene");
    }

    preload() {
      preloadTextures(this);
    }

    create() {
      try {
        registerTextures(this);
        const data: MapSceneData = { map: "town", spawn: "default" };
        this.scene.start(MAP_SCENE_KEY, data);
      } catch (error) {
        reportError(error);
      }
    }
  };
}
