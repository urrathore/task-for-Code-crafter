// CanvasArea.jsx
import React from "react";

export default function CanvasArea({
  canvasRef,
  startDrawing,
  stopDrawing,
  draw,
  clearCanvas,
  color,
  setColor,
  brushSize,
  setBrushSize,
  isDrawer,
  roundActive,
}) {
  return (
    <div className="md:w-3/5 w-full bg-black rounded-2xl shadow-[0_0_20px_rgba(255,0,255,0.5)] p-4 flex flex-col items-center relative">
      <h2 className="text-2xl font-bold mb-4 text-pink-400">Drawing Canvas</h2>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className={`border border-pink-400 rounded-lg ${isDrawer ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseDown={isDrawer ? startDrawing : undefined}
        onMouseUp={isDrawer ? stopDrawing : undefined}
        onMouseMove={isDrawer ? draw : undefined}
        onMouseLeave={isDrawer ? stopDrawing : undefined}
        style={{ pointerEvents: isDrawer ? 'auto' : 'none' }}
      />
      <div className="flex flex-col md:flex-row gap-4 mt-4 w-full items-center justify-center">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-8 rounded"
          disabled={!isDrawer}
        />
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          disabled={!isDrawer}
        />
        <button 
          onClick={clearCanvas} 
          className="px-4 py-2 bg-red-500 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={!isDrawer}
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
}