'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Image as ImageIcon } from 'lucide-react';

interface ExamImagePanelProps {
  imageUrl: string | null;
  studentName?: string;
}

export const ExamImagePanel: React.FC<ExamImagePanelProps> = ({ imageUrl, studentName }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Floating Toolbar */}
      <div className="absolute top-3 left-3 z-10 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 flex items-center space-x-1.5 shadow-none">
        <span className="text-xs font-medium text-slate-300 mr-1.5">Documento</span>
        <button
          onClick={handleZoomIn}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
          title="Acercar"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
          title="Alejar"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleRotate}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
          title="Rotar 90°"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
          title="Restablecer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-blue-400 font-mono pl-1">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Image container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {imageUrl ? (
          <div
            className="transition-transform duration-200 ease-out origin-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Examen de ${studentName || 'Estudiante'}`}
              className="max-h-[80vh] w-auto object-contain rounded border border-slate-700 bg-white"
            />
          </div>
        ) : (
          <div className="text-center text-slate-600">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Selecciona una entrega para ver el examen</p>
          </div>
        )}
      </div>
    </div>
  );
};

