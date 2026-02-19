import React, { useEffect, useRef, useState } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  speed: number;
  endSizePct: number;
  separation: number;
  rotationSpeed: number;
  phaseInterval: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  isPlaying,
  speed,
  endSizePct,
  separation,
  rotationSpeed,
  phaseInterval,
}) => {
  const requestRef = useRef<number>(0);
  
  // Timing refs
  const startTimeRef = useRef<number | null>(null); // For Scale (Deterministic cycle)
  const pausedTimeRef = useRef<number>(0);          // For Scale
  const lastFrameTimeRef = useRef<number>(0);       // For Rotation (Delta time)

  // Rotation State Refs (Physics)
  const currentRotationRef = useRef(0);
  const targetDirectionRef = useRef(1); // 1 or -1
  const smoothedDirectionRef = useRef(0); // Interpolates towards targetDirection
  const nextDirectionChangeTimeRef = useRef(0); 

  // Landolt C Geometry Constants
  const R_OUT = 100;
  const R_IN = 60;
  const GAP_HALF_HEIGHT = 20;

  // Calculate intersection points for the gap
  const xOut = Math.sqrt(R_OUT * R_OUT - GAP_HALF_HEIGHT * GAP_HALF_HEIGHT);
  const xIn = Math.sqrt(R_IN * R_IN - GAP_HALF_HEIGHT * GAP_HALF_HEIGHT);

  const landoltPathData = `
    M ${xOut} ${GAP_HALF_HEIGHT}
    A ${R_OUT} ${R_OUT} 0 1 1 ${xOut} -${GAP_HALF_HEIGHT}
    L ${xIn} -${GAP_HALF_HEIGHT}
    A ${R_IN} ${R_IN} 0 1 0 ${xIn} ${GAP_HALF_HEIGHT}
    Z
  `;

  // Scale calculations
  const maxScale = separation / (2 * R_OUT);
  const minScale = maxScale * endSizePct;
  // Ensure exactly 1px gap between the two Cs at max size (0.5px offset per side from the touching point)
  const baseOffset = (separation / 2) + 0.5;
  
  // State for rendering
  const [scale, setScale] = useState(maxScale);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(baseOffset);
  const [phaseMode, setPhaseMode] = useState<'parallel' | 'global'>('parallel');

  const animate = (time: number) => {
    // 1. Init Start Time for Scale Cycle
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }
    
    // 2. Handle Delta Time for Physics (Rotation)
    if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = time;
    }
    const dt = time - lastFrameTimeRef.current;
    lastFrameTimeRef.current = time;

    // --- Scaling & Positioning Logic ---
    const elapsedTotal = time - startTimeRef.current;
    const cycleDuration = 4000 / speed; 
    
    // Determine which cycle we are in (0, 1, 2...)
    const cycleCount = Math.floor(elapsedTotal / cycleDuration);
    
    // Determine phase group based on phaseInterval
    // e.g., if phaseInterval = 2:
    // Cycles 0,1 -> Group 0 (Parallel)
    // Cycles 2,3 -> Group 1 (Global)
    const phaseGroup = Math.floor(cycleCount / phaseInterval);
    
    // Even groups: Phase 1 - Parallel (Individual Scale, Fixed Position)
    // Odd groups: Phase 2 - Global (Center Scale, Moving Position)
    const isGlobalPhase = phaseGroup % 2 !== 0; 
    const currentMode = isGlobalPhase ? 'global' : 'parallel';

    // Calculate Scale (Oscillate Max -> Min -> Max)
    const t = (elapsedTotal % cycleDuration) / cycleDuration; 
    const phase = (Math.cos(t * Math.PI * 2) + 1) / 2; // 1 -> 0 -> 1
    const currentScale = minScale + (maxScale - minScale) * phase;
    
    // Calculate Position (Offset from center)
    let currentOffset = baseOffset;
    if (isGlobalPhase) {
      // In Global phase, the position scales relative to the screen center (0,0)
      // along with the size.
      // Ratio represents how "large" the scene is relative to max size.
      const ratio = currentScale / maxScale;
      currentOffset = baseOffset * ratio;
    } 
    // In Parallel phase, currentOffset remains baseOffset

    // --- Rotation Logic (Stochastic/Physics) ---
    if (rotationSpeed > 0) {
      if (time > nextDirectionChangeTimeRef.current) {
        targetDirectionRef.current = Math.random() > 0.5 ? 1 : -1;
        nextDirectionChangeTimeRef.current = time + 2000 + Math.random() * 4000;
      }

      const lerpFactor = 0.02;
      smoothedDirectionRef.current += (targetDirectionRef.current - smoothedDirectionRef.current) * lerpFactor;

      const baseSpeedMs = (rotationSpeed * 90) / 1000;
      const deltaRotation = baseSpeedMs * smoothedDirectionRef.current * dt;

      currentRotationRef.current = (currentRotationRef.current + deltaRotation) % 360;
    }

    // Update React State
    setScale(currentScale);
    setOffsetX(currentOffset);
    setRotation(currentRotationRef.current);
    setPhaseMode(currentMode);

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      const now = performance.now();
      
      if (startTimeRef.current === null) {
        startTimeRef.current = now - pausedTimeRef.current;
      } else {
        startTimeRef.current = now - pausedTimeRef.current;
      }

      lastFrameTimeRef.current = now;
      
      if (nextDirectionChangeTimeRef.current < now) {
         nextDirectionChangeTimeRef.current = now + 1000;
      }

      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      if (startTimeRef.current !== null) {
        pausedTimeRef.current = performance.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
      
      // Compute static frame for pause state
      const cycleDuration = 4000 / speed;
      const cycleCount = Math.floor(pausedTimeRef.current / cycleDuration);
      const phaseGroup = Math.floor(cycleCount / phaseInterval);
      const isGlobalPhase = phaseGroup % 2 !== 0;
      
      const t = (pausedTimeRef.current % cycleDuration) / cycleDuration;
      const phase = (Math.cos(t * Math.PI * 2) + 1) / 2;
      const currentScale = minScale + (maxScale - minScale) * phase;
      
      let currentOffset = baseOffset;
      if (isGlobalPhase) {
        const ratio = currentScale / maxScale;
        currentOffset = baseOffset * ratio;
      }

      setScale(currentScale);
      setOffsetX(currentOffset);
      setPhaseMode(isGlobalPhase ? 'global' : 'parallel');
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, speed, endSizePct, separation, rotationSpeed, phaseInterval]); 
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
      <svg 
        viewBox="-1000 -600 2000 1200" 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <path 
            id="c-shape-path" 
            d={landoltPathData} 
            fill="white" 
          />
        </defs>

        {/* Left C */}
        <g transform={`translate(-${offsetX}, 0) scale(${scale}) rotate(${rotation})`}>
             <use href="#c-shape-path" />
        </g>
          
        {/* Right C */}
        <g transform={`translate(${offsetX}, 0) scale(${scale}) rotate(${rotation})`}>
            <use href="#c-shape-path" />
        </g>
      </svg>
      
      {/* Phase Indicator (Optional but helpful) */}
      <div className={`absolute bottom-8 text-white/20 text-xs font-mono tracking-widest uppercase transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        Mode: {phaseMode === 'parallel' ? 'Parallel Scaling' : 'Global Scaling'}
      </div>
    </div>
  );
};