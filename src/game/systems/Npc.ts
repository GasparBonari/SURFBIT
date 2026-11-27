import type Phaser from "phaser";
import { TILE } from "../art/tiles";
import type { MapKey, MapObject } from "../maps/types";
import { npcTextureKey, requireTexture } from "../textures";
import { Character } from "./character";
import { moveWithCollision, type BlockedGrid, type Point } from "./collision";

type NpcDefinition = Extract<MapObject, { type: "npc" }>;

const WANDER_SPEED = 28;
const HOME_RADIUS = 3 * TILE;
const DIRECTIONS = [[0, 1], [-1, 0], [1, 0], [0, -1]] as const;

export class Npc extends Character {
  private readonly home: Point;
  private destination?: Point;
  private pauseMs = 0;

  constructor(scene: Phaser.Scene, map: MapKey, readonly definition: NpcDefinition) {
    const { id, x, y } = definition;
    const home = { x: (x + 0.5) * TILE, y: (y + 0.5) * TILE };
    super(scene, home.x, home.y, requireTexture(scene, npcTextureKey(map, id)), "down");
    this.home = home;
    this.pause();
  }

  turnToward(player: Point) {
    this.face(player.x - this.sprite.x, player.y - this.sprite.y);
    this.pause();
  }

  update(delta: number, blocked: BlockedGrid, obstacles: readonly Point[], paused: boolean) {
    if (this.definition.behavior === "idle") return;
    if (paused) {
      this.stand();
      return;
    }

    const { x, y } = this.sprite;
    if (!this.destination) {
      this.pauseMs -= delta;
      if (this.pauseMs > 0) return;

      const [dx, dy] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const length = TILE * (1 + Math.random());
      const goal = { x: x + dx * length, y: y + dy * length };
      if (Math.hypot(goal.x - this.home.x, goal.y - this.home.y) > HOME_RADIUS) {
        this.pause();
        return;
      }
      this.destination = goal;
      this.face(dx, dy);
    }

    const dx = this.destination.x - x;
    const dy = this.destination.y - y;
    const distance = Math.hypot(dx, dy);
    const scale = Math.min(1, WANDER_SPEED * delta / 1000 / distance);
    const next = moveWithCollision(blocked, this.sprite, dx * scale, dy * scale, obstacles);
    if (next.x === x && next.y === y) {
      this.pause();
      return;
    }

    this.walk(next.x, next.y);
    if (next.x === this.destination.x && next.y === this.destination.y) this.pause();
  }

  private pause() {
    this.destination = undefined;
    this.pauseMs = 900 + Math.random() * 1300;
    this.stand();
  }
}
