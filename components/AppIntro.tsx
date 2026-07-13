"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

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
      <div className="relative flex flex-col items-center justify-center w-full max-w-5xl px-4">
        {/* Glowing Orb Background */}
        <div 
          className={`absolute rounded-full blur-[60px] md:blur-[80px] transition-all duration-[1500ms] ease-out ${
            stage >= 1 ? "w-72 h-72 md:w-96 md:h-96 opacity-40 scale-100" : "w-10 h-10 opacity-0 scale-50"
          }`}
          style={{ background: "var(--brand)" }}
        />
        
        {/* Icon & Brand */}
        <div 
          className={`relative z-10 flex flex-col items-center gap-4 md:gap-6 transition-all duration-1000 ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div 
            className="w-16 h-16 md:w-20 md:h-20 rounded-3xl md:rounded-[2rem] flex items-center justify-center"
            style={{ 
              background: "linear-gradient(to bottom right, var(--brand), var(--brand-2))",
              boxShadow: "0 0 50px rgba(99,102,241,0.5)"
            }}
          >
            <Sparkles className="text-white animate-pulse w-8 h-8 md:w-9 md:h-9" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-center uppercase"
            style={{
              background: "linear-gradient(to right, var(--fg), var(--brand-3))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(165,180,252,0.3))"
            }}
          >
            AI Assistant
          </h1>
          <p className="font-medium tracking-[0.15em] md:tracking-[0.2em] text-xs md:text-sm uppercase text-center max-w-[90vw] md:max-w-[80vw]" style={{ color: "var(--muted)" }}>
            Intelligent Career & Research Assistant
          </p>
        </div>
      </div>
      
      {/* Skip Hint */}
      <div className={`absolute bottom-8 md:bottom-10 text-[10px] md:text-xs font-medium tracking-widest uppercase transition-opacity duration-1000 ${stage >= 1 && stage < 3 ? "opacity-100" : "opacity-0"}`} style={{ color: "var(--faint)" }}>
        Click anywhere to skip
      </div>
    </div>
  );
}
