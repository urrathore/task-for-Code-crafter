import React from "react";

function CanvasArea({
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
  gameState,
  activeTool,
  setActiveTool
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Drawing Board</h2>
        {isDrawer && gameState === "DRAWING" && (
          <div className="flex space-x-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 cursor-pointer"
            />
            <select
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="bg-gray-700 text-white rounded px-2"
            >
              <option value={2}>Thin</option>
              <option value={4}>Medium</option>
              <option value={8}>Thick</option>
              <option value={12}>X-Thick</option>
            </select>
            <button
              onClick={clearCanvas}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-96 bg-white rounded-lg cursor-crosshair touch-none"
          width={800}
          height={400}
        />
        
        {!isDrawer && gameState === "DRAWING" && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
            <p className="text-xl">Waiting for the drawing...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CanvasArea;