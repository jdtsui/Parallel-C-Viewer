export interface AppState {
  isPlaying: boolean;
  speed: number;
  endSizePct: number;
  separation: number;
}

export interface AnimationFrameData {
  scale: number;
  separation: number;
}