import type Phaser from "phaser";
import { prefersReducedMotion } from "@/state/settings";
import { isOverlayOpen, useUI } from "@/state/ui";
import { P } from "../art/palette";
import { TILE } from "../art/tiles";
import { gameEvents } from "../bridge";
import { MAPS } from "../maps";
import { buildBlocked, buildGround } from "../maps/build";
import type { Interaction, MapDef, MapKey } from "../maps/types";
import { Ambient } from "../systems/ambient";
import type { BlockedGrid } from "../systems/collision";
import { Interactions, WORLD_INTERACTION } from "../systems/interaction";
import { Npc } from "../systems/Npc";
import { Player } from "../systems/Player";
import { spawnObjects } from "../systems/objects";
import { TILESET_KEY } from "../textures";

export const MAP_SCENE_KEY = "MapScene";
const FADE_MS = 180;

export interface MapSceneData {
  map: MapKey;
  spawn: string;
  destination?: { def: MapDef; fadeIn: boolean };
}

function getMapLoader(map: string) {
  return Object.hasOwn(MAPS, map) ? MAPS[map as MapKey] : undefined;
}

function getSpawn(def: MapDef, spawn: string) {
  if (!Object.hasOwn(def.spawns, spawn)) {
    throw new Error(`Map "${def.key}" has no spawn "${spawn}"`);
  }
  return def.spawns[spawn];
}

export function createMapScene(phaser: typeof Phaser, reportError: (error: unknown) => void) {
  const { red, green, blue } = phaser.Display.Color.HexStringToColor(P.outline);
  const { FADE_IN_COMPLETE, FADE_OUT_COMPLETE } = phaser.Cameras.Scene2D.Events;

  return class MapScene extends phaser.Scene {
    private player?: Player;
    private npcs: Npc[] = [];
    private blocked: BlockedGrid = [];
    private ambient?: Ambient;
    private interactions?: Interactions;
    private transitioning = false;

    constructor() {
      super(MAP_SCENE_KEY);
    }

    async create({ map, spawn, destination }: MapSceneData) {
      const { events, scale } = this;
      const { DESTROY, SHUTDOWN } = phaser.Scenes.Events;
      const { RESIZE } = phaser.Scale.Events;
      let active = true;
      let updateZoom: (() => void) | undefined;
      let stopTravel: (() => void) | undefined;

      const cleanup = () => {
        active = false;
        stopTravel?.();
        this.transitioning = false;
        this.ambient?.destroy();
        this.ambient = undefined;
        this.interactions?.destroy();
        this.interactions = undefined;
        const ui = useUI.getState();
        if (ui.dialog || ui.product) ui.closeAll();
        this.player = undefined;
        this.npcs = [];
        this.blocked = [];
        if (updateZoom) scale.off(RESIZE, updateZoom);
        events.off(SHUTDOWN, cleanup);
        events.off(DESTROY, cleanup);
      };

      events.once(SHUTDOWN, cleanup);
      events.once(DESTROY, cleanup);

      try {
        const loadMap = getMapLoader(map);
        if (!loadMap) throw new Error(`No map loader for "${map}"`);

        // The destination is already loaded on restart so the camera can fade in on its first frame.
        const def = destination?.def ?? await loadMap();
        if (!active) return;
        const start = getSpawn(def, spawn);

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
        this.blocked = buildBlocked(def);
        const player = new Player(this, start, this.blocked);
        this.npcs = def.objects.flatMap((object) => object.type === "npc" ? [new Npc(this, def.key, object)] : []);
        this.interactions = new Interactions(this, def.objects, this.npcs);
        this.ambient = new Ambient(this, def, ground, animatedProps, player.sprite);
        const camera = this.cameras.main;
        const interior = def.kind === "interior";
        const { widthInPixels, heightInPixels } = tilemap;
        camera.setBackgroundColor(interior ? P.outline : P.water);
        updateZoom = () => {
          const { width, height } = scale;
          const zoom = interior
            ? Math.ceil(Math.max(width / widthInPixels, height / heightInPixels))
            : Math.floor(height / 240);
          camera.setZoom(Math.max(2, zoom));
        };
        updateZoom();
        camera.setBounds(0, 0, widthInPixels, heightInPixels);
        camera.startFollow(player.sprite, true);
        scale.on(RESIZE, updateZoom);
        this.player = player;

        const reveal = () => {
          if (prefersReducedMotion()) {
            camera.fadeEffect.reset();
            this.transitioning = false;
            return;
          }
          this.transitioning = true;
          camera.once(FADE_IN_COMPLETE, () => {
            this.transitioning = false;
          });
          camera.fadeIn(FADE_MS, red, green, blue);
        };

        const travel = ({ map, spawn }: { map: string; spawn: string }) => {
          const loadMap = getMapLoader(map);
          if (this.transitioning || !loadMap) return;

          this.transitioning = true;
          this.interactions?.clearTarget();
          const ui = useUI.getState();
          if (ui.dialog || ui.product) ui.closeAll();
          const fade = !prefersReducedMotion();

          const loadDestination = async () => {
            try {
              const def = await loadMap();
              if (!active) return;
              getSpawn(def, spawn);
              const data: MapSceneData = { map: def.key, spawn, destination: { def, fadeIn: fade } };
              this.scene.restart(data);
            } catch (error) {
              if (!active) return;
              console.error(`Could not travel to "${map}"`, error);
              if (fade) reveal();
              else this.transitioning = false;
            }
          };

          if (fade) {
            camera.once(FADE_OUT_COMPLETE, () => void loadDestination());
            camera.fadeOut(FADE_MS, red, green, blue);
          } else {
            void loadDestination();
          }
        };

        const onInteraction = (action: Interaction, npc?: Npc) => {
          if (action.kind === "enter" || action.kind === "exit") {
            travel({ map: action.target, spawn: action.spawn });
          } else if (action.kind === "product") {
            useUI.getState().openProduct(action.productId);
          } else if (action.kind === "talk") {
            npc?.turnToward(player.sprite);
            useUI.getState().openDialog(action.name, action.lines);
          } else if (action.kind === "read") {
            useUI.getState().openDialog(action.title, action.text);
          }
        };
        events.on(WORLD_INTERACTION, onInteraction);
        const unsubscribeTravel = gameEvents.on("travel", travel);
        stopTravel = () => {
          unsubscribeTravel();
          events.off(WORLD_INTERACTION, onInteraction);
        };

        if (destination?.fadeIn) reveal();
        this.game.canvas.setAttribute("aria-label", def.name);
        useUI.getState().setLocation(def.key, def.name);
      } catch (error) {
        if (!active) return;
        cleanup();
        reportError(error);
      }
    }

    update(time: number, delta: number) {
      if (!this.player) return;
      if (!this.transitioning) {
        const npcSprites = this.npcs.map((npc) => npc.sprite);
        this.player.update(delta, npcSprites, this.interactions?.reachesDoorway);
        const pauseNpcs = isOverlayOpen(useUI.getState()) || prefersReducedMotion();
        for (const npc of this.npcs) {
          const obstacles = [this.player.sprite, ...npcSprites.filter((sprite) => sprite !== npc.sprite)];
          npc.update(delta, this.blocked, obstacles, pauseNpcs);
        }
        this.interactions?.update(time, this.player.sprite, this.player.direction);
      }
      this.ambient?.update(delta, this.player.sprite);
    }
  };
}
