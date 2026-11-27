"use client";

import type { Game } from "phaser";
import { useEffect, useRef, useState } from "react";
import { reportClientError } from "@/telemetry/client";
import { gameEvents, type Ambience } from "./bridge";

export function WorldClient({ className }: { className: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const parent = host.current;
    if (!parent) return;

    let cancelled = false;
    let game: Game | undefined;

    function reportError(error: unknown) {
      if (cancelled) return;
      gameEvents.emit("ambience", null);
      console.error("Could not load the SURFBIT beach town", error);
      reportClientError("world_load", error);
      setFailed(true);
    }

    async function mount(parent: HTMLDivElement) {
      try {
        const [Phaser, { createGameConfig }] = await Promise.all([
          import("phaser"),
          import("./config"),
        ]);
        if (cancelled) return;
        game = new Phaser.Game(createGameConfig(Phaser, parent, reportError, (ambience: Ambience) => {
          if (!cancelled) gameEvents.emit("ambience", ambience);
        }));
      } catch (error) {
        reportError(error);
      }
    }

    // Animation callbacks run before paint. Leave a frame for the page shell before loading Phaser.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => void mount(parent));
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      gameEvents.emit("ambience", null);
      // A fullscreen change can arrive after the host is detached and before Phaser's next frame.
      game?.scale.stopListeners();
      game?.destroy(true);
    };
  }, []);

  return (
    <div ref={host} className={className}>
      {failed && (
        <p className="sb-panel" role="alert">
          The beach town couldn’t load. Reload the page to try again.
        </p>
      )}
    </div>
  );
}
