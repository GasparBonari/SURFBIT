import type Phaser from "phaser";
import { isOverlayOpen, useUI } from "@/state/ui";
import { TILE } from "../art/tiles";
import { virtualStick } from "../bridge";
import type { Spawn } from "../maps/types";
import { Character } from "./character";
import { moveWithCollision, type BlockedGrid, type Point } from "./collision";

const WALK_SPEED = 80;
const RUN_MULTIPLIER = 1.6;
const RUN_ANIMATION_RATE = 1.5;

export class Player extends Character {
  private readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null;
  private readonly keys;

  constructor(scene: Phaser.Scene, spawn: Spawn, private readonly blocked: BlockedGrid) {
    super(scene, (spawn.x + 0.5) * TILE, (spawn.y + 0.5) * TILE, "player", spawn.facing);
    this.keyboard = scene.input.keyboard;
    const addKey = (name: string) => this.keyboard?.addKey(name, false);
    this.keys = {
      w: addKey("W"), a: addKey("A"), s: addKey("S"), d: addKey("D"),
      up: addKey("UP"), left: addKey("LEFT"), down: addKey("DOWN"), right: addKey("RIGHT"),
      shift: addKey("SHIFT"),
    };
  }

  update(delta: number, obstacles: readonly Point[], stopAt?: (x: number, y: number) => boolean) {
    if (isOverlayOpen(useUI.getState())) {
      this.keyboard?.resetKeys();
      this.stand();
      return;
    }

    const { w, a, s, d, up, left, down, right, shift } = this.keys;
    let x = Number(!!(d?.isDown || right?.isDown)) - Number(!!(a?.isDown || left?.isDown));
    let y = Number(!!(s?.isDown || down?.isDown)) - Number(!!(w?.isDown || up?.isDown));
    if (x === 0 && y === 0) ({ x, y } = virtualStick);
    if (x === 0 && y === 0) {
      this.stand();
      return;
    }

    this.face(x, y);

    const running = shift?.isDown;
    const distance = WALK_SPEED * (running ? RUN_MULTIPLIER : 1) * delta / 1000;
    const scale = distance / Math.max(1, Math.hypot(x, y));
    const next = moveWithCollision(this.blocked, this.sprite, x * scale, y * scale, obstacles, stopAt);
    if (next.x === this.sprite.x && next.y === this.sprite.y) {
      this.stand();
      return;
    }

    this.walk(next.x, next.y, running ? RUN_ANIMATION_RATE : 1);
  }
}
