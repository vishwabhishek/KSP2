"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { CopilotSidebar } from "./CopilotSidebar";
import { CommandPalette } from "../ui/CommandPalette";

export const Shell = ({ children }: { children: React.ReactNode }) => {
  const [sidebarWidth, setSidebarWidth] = useState(256); // 16rem default
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex h-screen w-screen bg-bg-base text-text-primary overflow-hidden font-sans">
      <CommandPalette />

      <div style={{ width: `${sidebarWidth}px`, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Draggable Resizer Handle */}
      <div 
        className="w-1 cursor-col-resize hover:bg-brand-primary active:bg-brand-primary transition-colors z-50 h-full flex items-center justify-center relative"
        onMouseDown={handleMouseDown}
      >
        <div className="h-8 w-1 bg-border-focus rounded-full absolute pointer-events-none opacity-0 hover:opacity-100 transition-opacity"></div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Navbar - top cockpit controls */}
        <Navbar />

        {/* Central screen content viewport */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          <div className="flex-1 overflow-auto bg-bg-base relative p-4 flex flex-col">
            {children}
          </div>

          {/* Right AI assistant console */}
          <CopilotSidebar />
        </div>
      </div>
    </div>
  );
};
