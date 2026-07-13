"use client";

import { useState, useEffect } from "react";
import AppIntro from "./AppIntro";

export default function AppIntroWrapper() {
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const played = sessionStorage.getItem("velora_intro_played");
    if (!played) {
      setShowIntro(true);
    }
  }, []);

  if (!mounted || !showIntro) return null;

  return (
    <AppIntro
      onComplete={() => {
        sessionStorage.setItem("velora_intro_played", "true");
        setShowIntro(false);
      }}
    />
  );
}
