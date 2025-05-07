
import React from 'react';

export const CustomWatermark = () => {
  return (
    <div 
      className="fixed bottom-4 right-4 text-sm opacity-70 hover:opacity-100 transition-opacity z-50 pointer-events-none"
    >
      <span className="bg-background/80 px-2 py-1 rounded shadow-sm border border-border/50">
        created by Peterson Oliveira
      </span>
    </div>
  );
};
