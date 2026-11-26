"use client";

import { useEffect } from "react";
import { mountAudio } from "@/game/audio";

export function StoreAudio() {
  useEffect(mountAudio, []);
  return null;
}
