"use client";

import { useCallback, useEffect, useRef, type PointerEvent } from "react";
import { virtualStick } from "@/game/bridge";
import { isOverlayOpen, useUI } from "@/state/ui";
import styles from "./Joystick.module.css";

const DEAD_ZONE = 0.15;

export function Joystick() {
  const enabled = useUI((state) => state.worldReady && !isOverlayOpen(state));
  const base = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);

  const reset = useCallback(() => {
    const pointer = activePointer.current;
    if (pointer === null) return;

    activePointer.current = null;
    virtualStick.x = 0;
    virtualStick.y = 0;
    thumb.current?.style.removeProperty("translate");
    if (base.current?.hasPointerCapture(pointer)) {
      base.current.releasePointerCapture(pointer);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const coarsePointer = window.matchMedia("(pointer: coarse)");
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    coarsePointer.addEventListener("change", reset);
    return () => {
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
      coarsePointer.removeEventListener("change", reset);
      reset();
    };
  }, [enabled, reset]);

  function move(event: PointerEvent<HTMLDivElement>) {
    const knob = thumb.current;
    if (event.pointerId !== activePointer.current || !knob) return;

    const surface = event.currentTarget;
    const bounds = surface.getBoundingClientRect();
    const radius = (surface.clientWidth - knob.offsetWidth) / 2;
    if (radius <= 0) return;

    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(x, y);
    const scale = distance > radius ? radius / distance : 1;

    knob.style.translate = `${x * scale}px ${y * scale}px`;
    const inDeadZone = distance <= radius * DEAD_ZONE;
    virtualStick.x = inDeadZone ? 0 : (x * scale) / radius;
    virtualStick.y = inDeadZone ? 0 : (y * scale) / radius;
  }

  function start(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || activePointer.current !== null) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    activePointer.current = event.pointerId;
    move(event);
  }

  function end(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerId === activePointer.current) reset();
  }

  if (!enabled) return null;

  return (
    <div
      ref={base}
      className={styles.base}
      aria-hidden="true"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <div ref={thumb} className={styles.thumb} />
    </div>
  );
}
