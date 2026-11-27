import type Phaser from "phaser";
import { prefersReducedMotion, useSettings } from "@/state/settings";
import { isOverlayOpen, useUI } from "@/state/ui";
import { reportClientError } from "@/telemetry/client";
import { P } from "../art/palette";
import { TILE } from "../art/tiles";
import { gameEvents, type Ambience } from "../bridge";
import { MAPS } from "../maps";
import { buildBlocked, buildGround } from "../maps/build";
import type { Interaction, MapDef, MapKey } from "../maps/types";
import { Ambient } from "../systems/ambient";
import type { BlockedGrid } from "../systems/collision";
import { Daylight } from "../systems/daylight";
import { Interactions, WORLD_INTERACTION } from "../systems/interaction";
import { Npc } from "../systems/Npc";
import { Player } from "../systems/Player";
import { spawnObjects } from "../systems/objects";
import { loadMapAtlas, TILESET_KEY } from "../textures";

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

export function createMapScene(
  phaser: typeof Phaser,
  reportError: (error: unknown) => void,
  setAmbience: (ambience: Ambience) => void,
) {
  const { red, green, blue } = phaser.Display.Color.HexStringToColor(P.outline);
  const { FADE_IN_COMPLETE, FADE_OUT_COMPLETE } = phaser.Cameras.Scene2D.Events;

  return class MapScene extends phaser.Scene {
    private player?: Player;
    private npcs: Npc[] = [];
    private blocked: BlockedGrid = [];
    private ambient?: Ambient;
    private daylight?: Daylight;
    private worldElapsed = 0;
    private interactions?: Interactions;
    private transitioning = false;
    private readonly loadedAtlases = new Set<MapKey>(["town"]);

    constructor() {
      super(MAP_SCENE_KEY);
    }

    async create({ map, spawn, destination }: MapSceneData) {
      const { events, scale } = this;
      const { DESTROY, SHUTDOWN } = phaser.Scenes.Events;
      const { RESIZE } = phaser.Scale.Events;
      const lifecycle = new AbortController();
      const { signal } = lifecycle;
      let updateZoom: (() => void) | undefined;
      let stopTravel: (() => void) | undefined;
      let stopAppearance: (() => void) | undefined;

      const cleanup = () => {
        lifecycle.abort();
        stopTravel?.();
        stopAppearance?.();
        this.transitioning = false;
        this.ambient?.destroy();
        this.ambient = undefined;
        this.daylight = undefined;
        this.interactions?.destroy();
        this.interactions = undefined;
        const ui = useUI.getState();
        ui.setWorldReady(false);
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
        if (signal.aborted) return;
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

        const { animated, lights } = spawnObjects(this, def);
        this.blocked = buildBlocked(def);
        const player = new Player(this, start, this.blocked);
        player.setAppearance(useSettings.getState().appearance);
        stopAppearance = useSettings.subscribe(({ appearance }, previous) => {
          if (appearance !== previous.appearance) player.setAppearance(appearance);
        });
        this.npcs = def.objects.flatMap((object) => object.type === "npc" ? [new Npc(this, def.key, object)] : []);
        this.interactions = new Interactions(this, def.objects, this.npcs);
        this.ambient = new Ambient(this, def, ground, animated, player.sprite);
        const camera = this.cameras.main;
        const interior = def.kind === "interior";
        const { widthInPixels, heightInPixels } = tilemap;
        if (!interior) {
          this.daylight = new Daylight(this, lights);
          this.daylight.update(this.worldElapsed, useSettings.getState().townLighting, prefersReducedMotion());
        }
        camera.setBackgroundColor(interior ? P.outline : P.water);
        updateZoom = () => {
          const { width, height } = scale;
          const zoom = interior
            ? Math.ceil(Math.max(width / widthInPixels, height / heightInPixels))
            : Math.floor(height / 240);
          camera.setZoom(Math.max(2, zoom));
          this.daylight?.resize(width, height);
        };
        updateZoom();
        camera.setBounds(0, 0, widthInPixels, heightInPixels);
        camera.startFollow(player.sprite, true);
        scale.on(RESIZE, updateZoom);
        this.player = player;

        const finishTransition = () => {
          this.transitioning = false;
          useUI.getState().setWorldReady(true);
        };

        const reveal = () => {
          if (prefersReducedMotion()) {
            camera.fadeEffect.reset();
            finishTransition();
            return;
          }
          this.transitioning = true;
          camera.once(FADE_IN_COMPLETE, finishTransition);
          camera.fadeIn(FADE_MS, red, green, blue);
        };

        const travel = ({ map, spawn }: { map: string; spawn: string }) => {
          const loadMap = getMapLoader(map);
          if (this.transitioning || !loadMap) return;

          this.transitioning = true;
          this.interactions?.clearTarget();
          const ui = useUI.getState();
          ui.setWorldReady(false);
          if (ui.dialog || ui.product) ui.closeAll();
          const fade = !prefersReducedMotion();

          const loadDestination = async () => {
            try {
              const def = await loadMap();
              if (signal.aborted) return;
              getSpawn(def, spawn);
              if (!this.loadedAtlases.has(def.key)) {
                await loadMapAtlas(this, def.key, signal);
                if (signal.aborted) return;
                this.loadedAtlases.add(def.key);
              }
              const data: MapSceneData = { map: def.key, spawn, destination: { def, fadeIn: fade } };
              this.scene.restart(data);
            } catch (error) {
              if (signal.aborted) return;
              console.error(`Could not travel to "${map}"`, error);
              reportClientError("world_travel", error);
              if (fade) reveal();
              else finishTransition();
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

        const ui = useUI.getState();
        ui.setLocation(def.key, def.name);
        setAmbience(def.ambience);
        if (def.key === "town") {
          ui.setUpcomingStores(def.objects.flatMap((object) =>
            object.type === "building" && object.upcomingStoreName
              ? [{ id: object.id, name: object.upcomingStoreName }]
              : []
          ));
        }
        if (destination?.fadeIn) reveal();
        else finishTransition();
      } catch (error) {
        if (signal.aborted) return;
        cleanup();
        reportError(error);
      }
    }

    update(time: number, delta: number) {
      if (!this.player) return;
      this.worldElapsed += delta;
      const reduced = prefersReducedMotion();
      if (!this.transitioning) {
        const npcSprites = this.npcs.map((npc) => npc.sprite);
        this.player.update(delta, npcSprites, this.interactions?.reachesDoorway);
        const pauseNpcs = isOverlayOpen(useUI.getState()) || reduced;
        for (const npc of this.npcs) {
          const obstacles = [this.player.sprite, ...npcSprites.filter((sprite) => sprite !== npc.sprite)];
          npc.update(delta, this.blocked, obstacles, pauseNpcs);
        }
        this.interactions?.update(time, this.player.sprite, this.player.direction);
      }
      this.ambient?.update(delta, this.player.sprite);
      this.daylight?.update(this.worldElapsed, useSettings.getState().townLighting, reduced);
    }
  };
}
