"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

export default function AppIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Sequence the animation stages
    const t1 = setTimeout(() => setStage(1), 800); // Orb expands
    const t2 = setTimeout(() => setStage(2), 2200); // Text reveals
    const t3 = setTimeout(() => setStage(3), 4000); // Fade out whole screen
    const t4 = setTimeout(onComplete, 4800); // Unmount

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg)] overflow-hidden transition-opacity duration-1000 ${
        stage === 3 ? "opacity-0" : "opacity-100"
      }`}
      onClick={onComplete} // Allow click to skip
    >
      {/* Glowing Orb Background (Moved outside relative container to prevent square clipping) */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px] md:blur-[100px] transition-all duration-[1500ms] ease-out pointer-events-none ${
          stage >= 1 ? "w-[280px] h-[280px] md:w-[500px] md:h-[500px] opacity-30 scale-100" : "w-10 h-10 opacity-0 scale-50"
        }`}
        style={{ background: "var(--brand)", willChange: "transform, opacity" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-4">
        {/* Icon & Brand */}
        <div 
          className={`flex flex-col items-center gap-4 md:gap-6 transition-all duration-1000 ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div 
            className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center"
            style={{ 
              background: "linear-gradient(to bottom right, var(--brand), var(--brand-2))",
              boxShadow: "0 0 40px rgba(99,102,241,0.4)"
            }}
          >
            <Zap className="text-white animate-pulse w-8 h-8 md:w-10 md:h-10 fill-white" />
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-center uppercase"
            style={{
              background: "linear-gradient(to right, var(--fg), var(--brand-3))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(165,180,252,0.3))"
            }}
          >
            AI Assistant
          </h1>
          <p className="font-medium tracking-[0.1em] md:tracking-[0.2em] text-[10px] sm:text-xs md:text-sm uppercase text-center max-w-[85vw] md:max-w-[70vw] leading-relaxed" style={{ color: "var(--muted)" }}>
            Intelligent Career & Research Assistant
          </p>
        </div>
      </div>
      
      {/* Skip Hint */}
      <div className={`absolute bottom-8 md:bottom-12 text-[10px] md:text-xs font-semibold tracking-widest uppercase transition-opacity duration-1000 ${stage >= 1 && stage < 3 ? "opacity-100" : "opacity-0"}`} style={{ color: "var(--faint)" }}>
        Click anywhere to skip
      </div>
    </div>
  );
}
