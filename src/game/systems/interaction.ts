import type Phaser from "phaser";
import { prefersReducedMotion, useSettings } from "@/state/settings";
import { isOverlayOpen, useUI, type Prompt } from "@/state/ui";
import { CHAR_H, type Dir } from "../art/characters";
import { PROPS } from "../art/props";
import { TILE } from "../art/tiles";
import { gameEvents } from "../bridge";
import { getFootprint } from "../maps/build";
import type { Interaction, MapObject } from "../maps/types";

export const WORLD_INTERACTION = "world-interaction";

const PROBE_OFFSET = 10;
const REACH = 14;
const CLOSE_COOLDOWN = 250;
const FACING: Record<Dir, readonly [number, number]> = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
};

interface Target {
  action: Interaction;
  prompt: Prompt;
  x: number;
  y: number;
  markerY: number;
}

function getAction(object: MapObject): Interaction | undefined {
  switch (object.type) {
    case "display": return { kind: "product", productId: object.productId };
    case "npc": return { kind: "talk", name: object.name, lines: object.lines };
    default: return object.interact;
  }
}

function getPrompt(action: Interaction, object: MapObject): Prompt {
  switch (action.kind) {
    case "enter":
      return { verb: "Enter", label: object.type === "building" ? object.label : action.target };
    case "exit": return { verb: "Exit", label: "" };
    case "product": return { verb: "Inspect", label: action.productId };
    case "read": return { verb: "Read", label: action.title };
    case "talk": return { verb: "Talk", label: action.name };
  }
}

function getTargets(objects: MapObject[]): Target[] {
  return objects.flatMap((object) => {
    const action = getAction(object);
    if (!action) return [];
    const prompt = getPrompt(action, object);
    const { x, y, w, h } = getFootprint(object);
    const center = (x + w / 2) * TILE;
    const bottom = (y + h) * TILE;

    if (object.type === "building") {
      const { door } = object;
      return [{ action, prompt, x: (door.x + 0.5) * TILE, y: (door.y + 0.5) * TILE, markerY: y * TILE }];
    }

    const door = action.kind === "enter" || action.kind === "exit";
    const top = object.type === "npc" ? bottom - TILE / 2 - CHAR_H : bottom - PROPS[object.prop].h;
    return [{ action, prompt, x: center, y: bottom + (door ? -TILE / 2 : TILE / 2), markerY: top }];
  });
}

export class Interactions {
  private readonly targets: Target[];
  private readonly marker: Phaser.GameObjects.Sprite;
  private readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null;
  private readonly unsubscribeInteract: () => void;
  private readonly unsubscribeSettings: () => void;
  private readonly motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  private reduced = prefersReducedMotion();
  private current?: Target;

  constructor(private readonly scene: Phaser.Scene, objects: MapObject[]) {
    this.targets = getTargets(objects);
    this.marker = scene.add.sprite(0, 0, "marker", 0).setOrigin(0.5, 1).setDepth(100000).setVisible(false);
    this.keyboard = scene.input.keyboard;
    this.keyboard?.on("keydown", this.onKeyDown);
    this.unsubscribeInteract = gameEvents.on("interact", this.activate);
    this.motionQuery.addEventListener("change", this.updateMotionPreference);
    this.unsubscribeSettings = useSettings.subscribe(this.updateMotionPreference);
  }

  update(time: number, feet: { x: number; y: number }, facing: Dir) {
    const ui = useUI.getState();
    const [dx, dy] = FACING[facing];
    this.current = isOverlayOpen(ui) ? undefined
      : this.findClosest(feet.x + dx * PROBE_OFFSET, feet.y + dy * PROBE_OFFSET);
    ui.setPrompt(this.current?.prompt ?? null);
    this.marker.setVisible(Boolean(this.current));
    if (this.current) {
      const bob = this.reduced ? 0 : Math.round(2 * Math.sin(time / 160));
      this.marker.setPosition(this.current.x, this.current.markerY - 3 + bob);
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

  private findClosest(x: number, y: number): Target | undefined {
    let closest: Target | undefined;
    let bestDistance = REACH ** 2;
    for (const target of this.targets) {
      const distance = (target.x - x) ** 2 + (target.y - y) ** 2;
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
    this.scene.events.emit(WORLD_INTERACTION, this.current.action);
    return true;
  };
}
