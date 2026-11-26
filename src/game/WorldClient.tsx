"use client";

import type { Game } from "phaser";
import { useEffect, useRef, useState } from "react";

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
      console.error("Could not load the SURFBIT beach town", error);
      setFailed(true);
    }

    async function mount(parent: HTMLDivElement) {
      try {
        const [Phaser, { createGameConfig }] = await Promise.all([
          import("phaser"),
          import("./config"),
        ]);
        if (cancelled) return;
        game = new Phaser.Game(createGameConfig(Phaser, parent, reportError));
      } catch (error) {
        reportError(error);
      }
    }

    void mount(parent);

    return () => {
      cancelled = true;
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
