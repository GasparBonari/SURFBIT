import type { MapDef } from "./maps/types";

export type Ambience = MapDef["ambience"];
export type SoundCue = "interact" | "add-to-cart";

/** Phaser-free events for world controls and audio. */
type Events = {
  /** Mobile action button / tap on the prompt. */
  interact: void;
  /** Store directory "walk me there". */
  travel: { map: string; spawn: string };
  ambience: Ambience | null;
  sound: SoundCue;
};

type Handler<T> = (payload: T) => void;

const handlers: { [K in keyof Events]?: Set<Handler<Events[K]>> } = {};

export const gameEvents = {
  on<K extends keyof Events>(event: K, fn: Handler<Events[K]>) {
    (handlers[event] ??= new Set() as never).add(fn as never);
    return () => handlers[event]?.delete(fn as never);
  },
  emit<K extends keyof Events>(event: K, ...payload: Events[K] extends void ? [] : [Events[K]]) {
    handlers[event]?.forEach((fn) => (fn as Handler<unknown>)(payload[0]));
  },
};

/** Virtual joystick vector, written by React, read every frame by the game. */
export const virtualStick = { x: 0, y: 0 };
