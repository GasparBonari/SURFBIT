import type Phaser from "phaser";
import { TILE } from "../art/tiles";
import { MAPS } from "../maps";
import { buildGround } from "../maps/build";
import type { MapKey } from "../maps/types";
import { TILESET_KEY } from "../textures";

export const MAP_SCENE_KEY = "MapScene";

export interface MapSceneData {
  map: MapKey;
  spawn: string;
}

export function createMapScene(phaser: typeof Phaser, reportError: (error: unknown) => void) {
  return class MapScene extends phaser.Scene {
    constructor() {
      super(MAP_SCENE_KEY);
    }

    async create({ map, spawn }: MapSceneData) {
      const { events, scale } = this;
      const { DESTROY, SHUTDOWN } = phaser.Scenes.Events;
      const { RESIZE } = phaser.Scale.Events;
      let active = true;
      let frameGround: (() => void) | undefined;

      const cleanup = () => {
        active = false;
        if (frameGround) scale.off(RESIZE, frameGround);
        events.off(SHUTDOWN, cleanup);
        events.off(DESTROY, cleanup);
      };

      events.once(SHUTDOWN, cleanup);
      events.once(DESTROY, cleanup);

      try {
        const loadMap = MAPS[map];
        if (!loadMap) throw new Error(`No map loader for "${map}"`);

        const def = await loadMap();
        if (!active) return;
        const start = def.spawns[spawn];
        if (!start) throw new Error(`Map "${map}" has no spawn "${spawn}"`);

        const tilemap = this.make.tilemap({
          data: buildGround(def),
          tileWidth: TILE,
          tileHeight: TILE,
        });
        const tileset = tilemap.addTilesetImage(TILESET_KEY);
        if (!tileset) throw new Error(`Missing texture "${TILESET_KEY}"`);
        tilemap.createLayer(0, tileset);

        const camera = this.cameras.main;
        camera.setZoom(2).setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
        frameGround = () => {
          // Leave more room below the plaza for the beach and shoreline.
          const plazaX = (start.x + 0.5) * TILE;
          const plazaY = (start.y + 0.5) * TILE;
          camera.centerOn(plazaX, plazaY + camera.height / (4 * camera.zoom));
        };
        frameGround();
        scale.on(RESIZE, frameGround);
      } catch (error) {
        if (!active) return;
        cleanup();
        reportError(error);
      }
    }
  };
}
