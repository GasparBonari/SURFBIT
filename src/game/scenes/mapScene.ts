import type Phaser from "phaser";
import { TILE } from "../art/tiles";
import { MAPS } from "../maps";
import { buildBlocked, buildGround } from "../maps/build";
import type { MapKey } from "../maps/types";
import { Ambient } from "../systems/ambient";
import { Interactions } from "../systems/interaction";
import { Player } from "../systems/Player";
import { spawnObjects } from "../systems/objects";
import { TILESET_KEY } from "../textures";

export const MAP_SCENE_KEY = "MapScene";

export interface MapSceneData {
  map: MapKey;
  spawn: string;
}

export function createMapScene(phaser: typeof Phaser, reportError: (error: unknown) => void) {
  return class MapScene extends phaser.Scene {
    private player?: Player;
    private ambient?: Ambient;
    private interactions?: Interactions;

    constructor() {
      super(MAP_SCENE_KEY);
    }

    async create({ map, spawn }: MapSceneData) {
      const { events, scale } = this;
      const { DESTROY, SHUTDOWN } = phaser.Scenes.Events;
      const { RESIZE } = phaser.Scale.Events;
      let active = true;
      let updateZoom: (() => void) | undefined;

      const cleanup = () => {
        active = false;
        this.ambient?.destroy();
        this.ambient = undefined;
        this.interactions?.destroy();
        this.interactions = undefined;
        this.player = undefined;
        if (updateZoom) scale.off(RESIZE, updateZoom);
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
        const ground = tilemap.createLayer(0, tileset);
        if (!ground) throw new Error(`Could not create the ground layer for "${map}"`);

        const animatedProps = spawnObjects(this, def);
        const player = new Player(this, start, buildBlocked(def));
        this.interactions = new Interactions(this, def.objects);
        if (def.kind === "outdoor") {
          this.ambient = new Ambient(this, def.ground, ground, animatedProps, player.sprite);
        }
        const camera = this.cameras.main;
        updateZoom = () => camera.setZoom(Math.max(2, Math.floor(scale.height / 240)));
        updateZoom();
        camera.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
        camera.startFollow(player.sprite, true);
        scale.on(RESIZE, updateZoom);
        this.player = player;
      } catch (error) {
        if (!active) return;
        cleanup();
        reportError(error);
      }
    }

    update(time: number, delta: number) {
      if (!this.player) return;
      this.player.update(delta);
      this.interactions?.update(time, this.player.sprite, this.player.direction);
      this.ambient?.update(delta, this.player.sprite);
    }
  };
}
