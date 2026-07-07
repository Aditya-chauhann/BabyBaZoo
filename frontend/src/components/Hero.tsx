"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Story stages: Newborn (0-0.33), Toddler (0.33-0.66), Preschooler (0.66-1)
  
  // Opacities for the images (crossfades)
  const newbornOpacity = useTransform(scrollYProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const toddlerOpacity = useTransform(scrollYProgress, [0.25, 0.35, 0.65, 0.75], [0, 1, 1, 0]);
  const preschoolerOpacity = useTransform(scrollYProgress, [0.65, 0.75, 1], [0, 1, 1]);

  // Scales for a gentle parallax effect
  const newbornScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.1]);
  const toddlerScale = useTransform(scrollYProgress, [0.25, 0.75], [1, 1.1]);
  const preschoolerScale = useTransform(scrollYProgress, [0.65, 1], [1, 1.1]);

  // Text opacities explicitly mapped from 0 to 1
  const text1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.3, 1], [1, 1, 0, 0]);
  const text2Opacity = useTransform(scrollYProgress, [0, 0.25, 0.35, 0.55, 0.65, 1], [0, 0, 1, 1, 0, 0]);
  const text3Opacity = useTransform(scrollYProgress, [0, 0.65, 0.75, 1], [0, 0, 1, 1]);

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-[var(--background)]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Images */}
        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ opacity: newbornOpacity, scale: newbornScale }}
          initial={{ opacity: 1 }}
        >
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1600" 
            alt="Newborn baby" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ opacity: toddlerOpacity, scale: toddlerScale }}
          initial={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1600" 
            alt="Toddler playing" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ opacity: preschoolerOpacity, scale: preschoolerScale }}
          initial={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1600" 
            alt="Preschooler" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Text Content */}
        <div className="relative z-20 w-full h-full pointer-events-none">
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            style={{ opacity: text1Opacity }}
            initial={{ opacity: 1 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl mb-4 text-[#FFF9F5] drop-shadow-md">For Their First Breaths</h1>
            <p className="font-sans text-xl md:text-2xl font-light text-[#FFF9F5] drop-shadow-md">Softest organic essentials for newborns.</p>
          </motion.div>

          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            style={{ opacity: text2Opacity }}
            initial={{ opacity: 0 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl mb-4 text-[#FFF9F5] drop-shadow-md">For Their First Steps</h1>
            <p className="font-sans text-xl md:text-2xl font-light text-[#FFF9F5] drop-shadow-md">Toys and gear that grow with them.</p>
          </motion.div>

          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-auto"
            style={{ opacity: text3Opacity }}
            initial={{ opacity: 0 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl mb-4 text-[#FFF9F5] drop-shadow-md">For Their First Adventures</h1>
            <p className="font-sans text-xl md:text-2xl font-light text-[#FFF9F5] mb-8 drop-shadow-md">Premium quality for every milestone.</p>
            <button className="bg-[var(--gold)] text-white px-8 py-4 rounded-full font-sans font-medium text-lg hover:scale-105 transition-transform shadow-lg">
              Shop Collection
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <p className="text-[#FFF9F5] text-sm tracking-widest uppercase mb-2">Scroll to explore</p>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-px h-16 bg-[#FFF9F5]"
          />
        </div>
      </div>
    </div>
  );
}
