import React, { useState, useEffect, useRef } from 'react';
import { Visualizer } from './components/Visualizer';
import { Controls } from './components/Controls';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [separation, setSeparation] = useState(1000);
  const [endSizePct, setEndSizePct] = useState(0.4);
  const [rotationSpeed, setRotationSpeed] = useState(0.5); 
  const [phaseInterval, setPhaseInterval] = useState(3); // How many cycles before switching mode
  
  const [isUiVisible, setIsUiVisible] = useState(true);
  const uiTimeoutRef = useRef<number>(0);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  // Keyboard Control (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
        // Show UI briefly when interacting via keyboard
        setIsUiVisible(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle UI visibility based on mouse movement and play state
  useEffect(() => {
    const showUi = () => {
      setIsUiVisible(true);
      
      // Clear existing timeout
      if (uiTimeoutRef.current) {
        window.clearTimeout(uiTimeoutRef.current);
      }

      // If playing, set a timeout to hide UI
      if (isPlaying) {
        uiTimeoutRef.current = window.setTimeout(() => {
          setIsUiVisible(false);
        }, 2000); // Hide after 2 seconds of inactivity
      }
    };

    // If not playing, UI should always be visible
    if (!isPlaying) {
      if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);
      setIsUiVisible(true);
      return;
    }

    // Attach listener
    window.addEventListener('mousemove', showUi);
    
    // Initial trigger to start the timer if we just started playing
    showUi();

    return () => {
      window.removeEventListener('mousemove', showUi);
      if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);
    };
  }, [isPlaying]);

  const handleBackgroundClick = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div 
      className={`relative w-screen h-screen bg-black overflow-hidden select-none ${isPlaying && !isUiVisible ? 'cursor-none' : ''}`}
      onClick={handleBackgroundClick}
    >
      
      {/* Background/Canvas */}
      <Visualizer 
        isPlaying={isPlaying}
        speed={speed}
        endSizePct={endSizePct}
        separation={separation}
        rotationSpeed={rotationSpeed}
        phaseInterval={phaseInterval}
      />

      {/* UI Overlay */}
      <Controls 
        visible={isUiVisible}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        speed={speed}
        onSpeedChange={setSpeed}
        endSizePct={endSizePct}
        onEndSizePctChange={setEndSizePct}
        separation={separation}
        onSeparationChange={setSeparation}
        rotationSpeed={rotationSpeed}
        onRotationSpeedChange={setRotationSpeed}
        phaseInterval={phaseInterval}
        onPhaseIntervalChange={setPhaseInterval}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      
      {/* Optional Title/Info overlay (fades out when playing) */}
      {!isPlaying && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-50">
           <h1 className="text-white/30 text-lg tracking-[0.3em] font-light uppercase">Parallel C Trainer</h1>
        </div>
      )}

    </div>
  );
};

export default App;