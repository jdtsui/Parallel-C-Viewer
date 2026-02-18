import React, { useState } from 'react';
import { Play, Pause, Settings2, X, Maximize, Minimize } from 'lucide-react';

interface ControlsProps {
  visible: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (val: number) => void;
  endSizePct: number;
  onEndSizePctChange: (val: number) => void;
  separation: number;
  onSeparationChange: (val: number) => void;
  rotationSpeed: number;
  onRotationSpeedChange: (val: number) => void;
  phaseInterval: number;
  onPhaseIntervalChange: (val: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  visible,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  endSizePct,
  onEndSizePctChange,
  separation,
  onSeparationChange,
  rotationSpeed,
  onRotationSpeedChange,
  phaseInterval,
  onPhaseIntervalChange,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  // If settings modal is open, we force the UI logic to behave nicely, 
  // though the parent 'visible' prop controls the fading of the triggers.
  // Added pointer-events-none when hidden to prevent interaction with invisible controls
  const containerClass = `transition-opacity duration-500 ${visible || showSettings ? 'opacity-100' : 'opacity-0 pointer-events-none'}`;

  // Common button styles
  const iconBtnClass = "fixed top-6 z-40 p-3 rounded-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white backdrop-blur-sm border border-white/10 transition-all duration-300";

  return (
    <>
      {/* Top Right Buttons: Fullscreen & Settings */}
      <div className={containerClass}>
        {/* Fullscreen Button */}
        <button 
          onClick={onToggleFullscreen}
          className={`${iconBtnClass} right-24 ${showSettings ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>

        {/* Settings Button */}
        <button 
          onClick={() => setShowSettings(true)}
          className={`${iconBtnClass} right-6 ${showSettings ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          title="Settings"
        >
          <Settings2 size={24} />
        </button>
      </div>

      {/* Floating Play/Pause Button (Bottom Center) */}
      <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-40 ${containerClass}`}>
        <button
          onClick={onTogglePlay}
          className="group flex items-center justify-center w-20 h-20 bg-white text-black rounded-full hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/20"
        >
          {isPlaying ? (
            <Pause size={32} className="fill-current" />
          ) : (
            // Adjusted transform: Changed to -translate-x-1 for better optical alignment
            <Play size={32} className="fill-current -translate-x" />
          )}
        </button>
      </div>

      {/* Settings Panel (Modal) */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${showSettings ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
        />
        
        {/* Card */}
        <div className={`relative bg-zinc-900 border border-zinc-700 p-8 rounded-3xl w-[90%] max-w-sm shadow-2xl transform transition-all duration-300 ${showSettings ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-lg font-semibold tracking-wide">Configuration</h2>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Speed Control */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-zinc-400 font-medium">
                <span>Cycle Speed</span>
                <span className="text-white">{speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.02"
                value={speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300"
              />
            </div>

            {/* Rotation Control */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-zinc-400 font-medium">
                <span>Rotation Speed</span>
                <span className="text-white">{rotationSpeed === 0 ? 'Off' : `${rotationSpeed.toFixed(2)}x`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.02"
                value={rotationSpeed}
                onChange={(e) => onRotationSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300"
              />
            </div>

            {/* Phase Interval Control */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-zinc-400 font-medium">
                <span>Cycles per Mode</span>
                <span className="text-white">{phaseInterval}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={phaseInterval}
                onChange={(e) => onPhaseIntervalChange(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300"
              />
              <p className="text-xs text-zinc-600">Switch mode every {phaseInterval} cycles</p>
            </div>

            <div className="h-px bg-zinc-800 my-4" />

            {/* Separation (Start Size) */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-zinc-400 font-medium">
                <span>Start Separation</span>
                <span className="text-white">{Math.round(separation)}px</span>
              </div>
              <input
                type="range"
                min="150"
                max="1000"
                step="10"
                value={separation}
                onChange={(e) => onSeparationChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300"
              />
              <p className="text-xs text-zinc-600">Max width (fits to screen)</p>
            </div>

            {/* End Size % */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-zinc-400 font-medium">
                <span>End Size</span>
                <span className="text-white">{Math.round(endSizePct * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={endSizePct}
                onChange={(e) => onEndSizePctChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300"
              />
              <p className="text-xs text-zinc-600">Percentage of max size</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};