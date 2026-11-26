/**
 * Tiny, Phaser-free channel from React to the game. React UI imports this
 * without pulling Phaser into its bundle.
 */

type Events = {
  /** Mobile action button / tap on the prompt. */
  interact: void;
  /** Store directory "walk me there". */
  travel: { map: string; spawn: string };
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
