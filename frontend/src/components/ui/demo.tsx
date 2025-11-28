"use client";

import React from "react";
import { WavyBackground } from "@/components/ui/wavy-background";

export function WavyBackgroundDemo() {
  return (
    <WavyBackground
      className="max-w-4xl mx-auto pb-40"
      containerClassName="bg-[#0F172A]"
      colors={["#FF6600", "#FF924A", "#FEC16B", "#FBBF24", "#38A169"]}
      backgroundFill="#0F172A"
      waveOpacity={0.35}
    >
      <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold text-center">
        Hero waves are cool
      </p>
      <p className="text-base md:text-lg mt-4 text-white text-center">
        Leverage the power of canvas to create a beautiful hero section
      </p>
    </WavyBackground>
  );
}
