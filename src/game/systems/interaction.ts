import type Phaser from "phaser";
import { prefersReducedMotion, useSettings } from "@/state/settings";
import { isOverlayOpen, useUI, type Prompt } from "@/state/ui";
import { CHAR_H, type Dir } from "../art/characters";
import { PROPS } from "../art/props";
import { TILE } from "../art/tiles";
import { gameEvents } from "../bridge";
import { getFootprint } from "../maps/build";
import type { Interaction, MapObject } from "../maps/types";
import type { Npc } from "./Npc";

export const WORLD_INTERACTION = "world-interaction";

const PROBE_OFFSET = 10;
const REACH = 14;
const CLOSE_COOLDOWN = 250;
const FACING: Record<Dir, readonly [number, number]> = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
};

type TravelAction = Extract<Interaction, { kind: "enter" | "exit" }>;
type PromptAction = Exclude<Interaction, TravelAction>;
type Doorway = ReturnType<typeof getFootprint> & { action: TravelAction };

type Target = {
  action: PromptAction;
  prompt: Prompt;
} & ({ x: number; y: number; markerY: number; npc?: never } | { npc: Npc });

type StaticObject = Exclude<MapObject, { type: "npc" }>;

function getAction(object: StaticObject): Interaction | undefined {
  switch (object.type) {
    case "display": return { kind: "product", productId: object.productId };
    default: return object.interact;
  }
}

function getPrompt(action: PromptAction): Prompt {
  switch (action.kind) {
    case "product": return { verb: "Inspect", label: action.productId };
    case "read": return { verb: "Read", label: action.title };
    case "talk": return { verb: "Talk", label: action.name };
  }
}

function getTargets(objects: MapObject[]) {
  const targets: Target[] = [];
  const doorways: Doorway[] = [];
  for (const object of objects) {
    if (object.type === "npc") continue;
    const action = getAction(object);
    if (!action) continue;
    const footprint = getFootprint(object);
    if (action.kind === "enter" || action.kind === "exit") {
      const threshold = object.type === "building" ? { ...object.door, w: 1, h: 1 } : footprint;
      doorways.push({ ...threshold, action });
      continue;
    }

    const prompt = getPrompt(action);
    const { x, y, w, h } = footprint;
    const center = (x + w / 2) * TILE;
    const bottom = (y + h) * TILE;

    if (object.type === "building") {
      const { door } = object;
      targets.push({ action, prompt, x: (door.x + 0.5) * TILE, y: (door.y + 0.5) * TILE, markerY: y * TILE });
    } else {
      targets.push({ action, prompt, x: center, y: bottom + TILE / 2, markerY: bottom - PROPS[object.prop].h });
    }
  }
  return { targets, doorways };
}

export class Interactions {
  private readonly targets: Target[];
  private readonly doorways: Doorway[];
  private readonly marker: Phaser.GameObjects.Sprite;
  private readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null;
  private readonly unsubscribeInteract: () => void;
  private readonly unsubscribeSettings: () => void;
  private readonly motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  private reduced = prefersReducedMotion();
  private current?: Target;
  private occupiedDoorway?: Doorway;

  constructor(private readonly scene: Phaser.Scene, objects: MapObject[], npcs: readonly Npc[]) {
    const { targets, doorways } = getTargets(objects);
    this.targets = targets;
    this.doorways = doorways;
    for (const npc of npcs) {
      const { name, lines } = npc.definition;
      this.targets.push({ action: { kind: "talk", name, lines }, prompt: { verb: "Talk", label: name }, npc });
    }
    this.marker = scene.add.sprite(0, 0, "marker", 0).setOrigin(0.5, 1).setDepth(100000).setVisible(false);
    this.keyboard = scene.input.keyboard;
    this.keyboard?.on("keydown", this.onKeyDown);
    this.unsubscribeInteract = gameEvents.on("interact", this.activate);
    this.motionQuery.addEventListener("change", this.updateMotionPreference);
    this.unsubscribeSettings = useSettings.subscribe(this.updateMotionPreference);
  }

  update(time: number, feet: { x: number; y: number }, facing: Dir) {
    const ui = useUI.getState();
    if (isOverlayOpen(ui)) {
      this.clearTarget();
      return;
    }

    const doorway = this.findDoorway(feet.x, feet.y);
    const enteredDoorway = doorway && doorway !== this.occupiedDoorway;
    this.occupiedDoorway = doorway;
    if (enteredDoorway) {
      this.scene.events.emit(WORLD_INTERACTION, doorway.action);
      return;
    }

    const [dx, dy] = FACING[facing];
    this.current = this.findClosest(feet.x + dx * PROBE_OFFSET, feet.y + dy * PROBE_OFFSET);
    ui.setPrompt(this.current?.prompt ?? null);
    this.marker.setVisible(Boolean(this.current));
    if (this.current) {
      const bob = this.reduced ? 0 : Math.round(2 * Math.sin(time / 160));
      const { npc } = this.current;
      if (npc) this.marker.setPosition(npc.sprite.x, npc.sprite.y - CHAR_H - 3 + bob);
      else this.marker.setPosition(this.current.x, this.current.markerY - 3 + bob);
    }
  }

  clearTarget() {
    this.current = undefined;
    this.marker.setVisible(false);
    useUI.getState().setPrompt(null);
  }

  destroy() {
    this.keyboard?.off("keydown", this.onKeyDown);
    this.unsubscribeInteract();
    this.motionQuery.removeEventListener("change", this.updateMotionPreference);
    this.unsubscribeSettings();
    this.marker.destroy();
    useUI.getState().setPrompt(null);
  }

  readonly reachesDoorway = (x: number, y: number): boolean => {
    const doorway = this.findDoorway(x, y);
    return doorway !== undefined && doorway !== this.occupiedDoorway;
  };

  private findDoorway(x: number, y: number): Doorway | undefined {
    const col = Math.floor(x / TILE);
    // The hitbox stops at the feet. Match collision's tile-edge convention.
    const row = Math.ceil(y / TILE) - 1;
    return this.doorways.find(({ x, y, w, h }) => col >= x && col < x + w && row >= y && row < y + h);
  }

  private findClosest(x: number, y: number): Target | undefined {
    let closest: Target | undefined;
    let bestDistance = REACH ** 2;
    for (const target of this.targets) {
      const { npc } = target;
      const point = npc ? npc.sprite : target;
      // Let customers talk across a counter while keeping the marker on the sprite.
      const targetY = point.y + (npc ? TILE / 2 : 0);
      const distance = (point.x - x) ** 2 + (targetY - y) ** 2;
      if (distance > bestDistance || (closest && distance === bestDistance)) continue;
      closest = target;
      bestDistance = distance;
    }
    return closest;
  }

  private readonly updateMotionPreference = () => {
    this.reduced = prefersReducedMotion();
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.repeat || event.defaultPrevented || event.isComposing ||
      event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key !== "e" && event.key !== "E" && event.key !== " " && event.key !== "Enter") return;
    if (event.target instanceof Element &&
      event.target.closest("input, textarea, select, button, a[href], [contenteditable]")) return;
    if (this.activate()) event.preventDefault();
  };

  private readonly activate = () => {
    const ui = useUI.getState();
    if (!this.current || isOverlayOpen(ui) || Date.now() - ui.lastClosedAt < CLOSE_COOLDOWN) return false;
    this.scene.events.emit(WORLD_INTERACTION, this.current.action, this.current.npc);
    return true;
  };
}
