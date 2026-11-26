import { useSettings } from "@/state/settings";
import { gameEvents, type Ambience, type SoundCue } from "./bridge";

const HALF_BEAT = 0.28;
const MELODY = [
  72, 76, 79, 0, 76, 74, 72, 0,
  69, 72, 76, 0, 79, 76, 72, 0,
  65, 69, 72, 0, 77, 76, 72, 0,
  67, 71, 74, 0, 79, 74, 71, 0,
];
const BASS = [48, 55, 45, 52, 41, 48, 43, 50];

function frequency(note: number) {
  return 440 * 2 ** ((note - 69) / 12);
}

function makeShopLoop(context: AudioContext) {
  const rate = context.sampleRate;
  const buffer = context.createBuffer(1, Math.round(MELODY.length * HALF_BEAT * rate), rate);
  const samples = buffer.getChannelData(0);

  function writeNote(note: number, start: number, duration: number, volume: number) {
    const offset = Math.round(start * rate);
    const length = Math.round(duration * rate);
    const step = 2 * Math.PI * frequency(note) / rate;

    for (let i = 0; i < length; i++) {
      const envelope = Math.min(1, i / (rate * 0.012), (length - i) / (rate * 0.09));
      const phase = step * i;
      samples[offset + i] += volume * envelope * (Math.sin(phase) + 0.18 * Math.sin(phase * 3));
    }
  }

  MELODY.forEach((note, index) => {
    if (note) writeNote(note, index * HALF_BEAT, HALF_BEAT * 0.88, 0.11);
  });
  BASS.forEach((note, index) => writeNote(note, index * 4 * HALF_BEAT, HALF_BEAT * 2.4, 0.08));
  return buffer;
}

function makeNoise(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  return buffer;
}

function createSoundscape(context: AudioContext, master: GainNode) {
  const noise = context.createBufferSource();
  noise.buffer = makeNoise(context);
  noise.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0;

  const swell = context.createGain();
  swell.gain.value = 0;
  const tide = context.createOscillator();
  tide.frequency.value = 0.16;
  const depth = context.createGain();
  depth.gain.value = 0;
  tide.connect(depth).connect(swell.gain);

  const ambienceGain = context.createGain();
  ambienceGain.gain.value = 0;
  noise.connect(filter).connect(swell).connect(ambienceGain).connect(master);

  const music = context.createBufferSource();
  music.buffer = makeShopLoop(context);
  music.loop = true;
  const musicGain = context.createGain();
  musicGain.gain.value = 0;
  music.connect(musicGain).connect(master);

  noise.start();
  tide.start();
  music.start();

  return {
    update(ambience: Ambience, { ambienceVolume, musicVolume }: ReturnType<typeof useSettings.getState>) {
      const now = context.currentTime;
      const beach = ambience === "beach";
      filter.frequency.setTargetAtTime(beach ? 950 : 360, now, 0.08);
      swell.gain.setTargetAtTime(beach ? 0.46 : 0.14, now, 0.08);
      depth.gain.setTargetAtTime(beach ? 0.34 : 0, now, 0.08);
      ambienceGain.gain.setTargetAtTime(ambienceVolume, now, 0.03);
      musicGain.gain.setTargetAtTime(beach ? 0 : musicVolume, now, 0.08);
    },
    stop() {
      const now = context.currentTime;
      ambienceGain.gain.setTargetAtTime(0, now, 0.025);
      musicGain.gain.setTargetAtTime(0, now, 0.025);
      for (const source of [noise, tide, music]) source.stop(now + 0.15);
      noise.onended = () => {
        ambienceGain.disconnect();
        musicGain.disconnect();
      };
    },
  };
}

function playCue(context: AudioContext, master: GainNode, cue: SoundCue) {
  const now = context.currentTime;
  const notes = cue === "interact" ? [76] : [72, 79];

  notes.forEach((note, index) => {
    const start = now + index * 0.07;
    const end = start + 0.11;
    const tone = context.createOscillator();
    tone.type = "triangle";
    tone.frequency.value = frequency(note);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.09, start + 0.008);
    gain.gain.linearRampToValueAtTime(0, end);
    tone.connect(gain).connect(master);
    tone.start(start);
    tone.stop(end);
    tone.onended = () => gain.disconnect();
  });
}

export function mountAudio() {
  if (typeof AudioContext === "undefined") return;

  let output: { context: AudioContext; master: GainNode } | undefined;
  let soundscape: ReturnType<typeof createSoundscape> | undefined;
  let ambience: Ambience | null = null;
  let settings = useSettings.getState();

  function updateSoundscape() {
    if (!output) return;
    if (ambience === null) {
      soundscape?.stop();
      soundscape = undefined;
      return;
    }
    soundscape ??= createSoundscape(output.context, output.master);
    soundscape.update(ambience, settings);
  }

  function unlock(event: Event) {
    if (!event.isTrusted || (event instanceof KeyboardEvent && event.key === "Escape")) return;

    if (!output) {
      let context: AudioContext;
      try {
        context = new AudioContext();
      } catch {
        return;
      }
      const master = context.createGain();
      master.gain.value = settings.muted ? 0 : 1;
      master.connect(context.destination);
      output = { context, master };
      updateSoundscape();
    }
    if (output.context.state !== "running") void output.context.resume().catch(() => {});
  }

  const unsubscribeSettings = useSettings.subscribe((next, previous) => {
    settings = next;
    if (output && next.muted !== previous.muted) {
      output.master.gain.setTargetAtTime(next.muted ? 0 : 1, output.context.currentTime, 0.015);
    }
    if (next.musicVolume !== previous.musicVolume || next.ambienceVolume !== previous.ambienceVolume) {
      updateSoundscape();
    }
  });
  const unsubscribeAmbience = gameEvents.on("ambience", (next) => {
    if (ambience === next) return;
    ambience = next;
    updateSoundscape();
  });
  const unsubscribeSound = gameEvents.on("sound", (cue) => {
    if (output && !settings.muted) playCue(output.context, output.master, cue);
  });

  // Capture activation before handlers dispatch sounds, including on the first gesture.
  const gestures = ["keydown", "mousedown", "pointerup", "touchend", "click"] as const;
  for (const gesture of gestures) window.addEventListener(gesture, unlock, true);

  return () => {
    for (const gesture of gestures) window.removeEventListener(gesture, unlock, true);
    unsubscribeSettings();
    unsubscribeAmbience();
    unsubscribeSound();
    if (output) void output.context.close().catch(() => {});
  };
}
