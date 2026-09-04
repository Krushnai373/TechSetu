import React, { useEffect, useRef } from 'react';

export const AudioWaveform = ({ isActive = false, color = '#F59E0B', height = 60 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;

      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.beginPath();

      const numBars = 36;
      const spacing = width / numBars;

      for (let i = 0; i < numBars; i++) {
        const x = i * spacing + spacing / 2;
        let amplitude = 4;
        if (isActive) {
          // Dynamic sine + noise audio wave simulation
          amplitude = Math.sin(phase + i * 0.4) * (h * 0.35) + Math.cos(phase * 1.5 + i * 0.2) * (h * 0.15);
          amplitude = Math.max(6, Math.abs(amplitude));
        }

        const y1 = centerY - amplitude;
        const y2 = centerY + amplitude;

        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.lineCap = 'round';
        ctx.strokeStyle = isActive 
          ? `hsla(${(i * 10 + phase * 20) % 360}, 90%, 65%, 0.85)`
          : 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
      }

      if (isActive) {
        phase += 0.12;
      }
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isActive, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={360} 
      height={height} 
      className="w-full h-full max-h-16 rounded-xl"
    />
  );
};
