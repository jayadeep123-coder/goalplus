"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function LandingPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Add inertia/spring to the mouse follow
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  function handleMouseMove({ clientX, clientY, currentTarget }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const backgroundRadial = useMotionTemplate`radial-gradient(800px circle at ${springX}px ${springY}px, #1A5C45, transparent 80%)`;

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      <nav className="absolute top-0 left-0 right-0 py-6 px-16 flex justify-between items-center z-20">
        <div className="flex items-center gap-10">
          <h1 className="font-headline-md text-headline-md text-[#E8EDE9]">GoalPulse</h1>
          <div className="flex gap-6 ml-10">
            <a href="#" className="font-label-md text-label-md text-[#E8EDE9] border-b-2 border-white/40 pb-1">Solutions</a>
            <a href="#" className="font-label-md text-label-md text-[#9AA79E]">Platform</a>
            <a href="#" className="font-label-md text-label-md text-[#9AA79E]">Insights</a>
            <a href="#" className="font-label-md text-label-md text-[#9AA79E]">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a href="/login" className="font-label-md text-label-md text-[#E8EDE9]">Log In</a>
          <a href="#" className="bg-[#133527] border border-[#1C4836] text-white px-6 py-2 rounded font-body-md font-medium">Get Started</a>
        </div>
      </nav>

      <motion.main 
        onMouseMove={handleMouseMove}
        className="flex-1 flex flex-col pt-40 px-16 pb-20 relative overflow-hidden"
      >
        {/* Interactive Mesh Gradient */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-60 mix-blend-screen"
          style={{ background: backgroundRadial }}
        />
        
        {/* Static Base Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#174232]/50 via-[#062316]/50 to-[#03150D]/50 z-0"></div>
        <div className="absolute -top-48 -right-48 w-[800px] h-[800px] bg-secondary-container/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
        
        <div className="grid grid-cols-2 gap-10 flex-1 items-center relative z-10 pointer-events-none">
          <div className="pr-10 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center bg-white/10 text-[#A3B4AA] mb-6 py-1.5 px-4 border border-white/10 rounded-full font-label-sm text-label-sm"
            >
              <span className="mr-2">●</span> INTRODUCING GOALPULSE 2.0
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-7xl font-headline-lg font-medium text-white mb-6 tracking-tight leading-tight"
            >
              Accelerate your<br />
              team's <span className="text-primary-fixed-dim italic">potential</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body-lg text-body-lg text-[#B0C2B8] mb-12 max-w-lg leading-relaxed"
            >
              The goal management platform built for organizations that mean business. Align execution, track progress, and unlock unprecedented clarity.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-6"
            >
              <a href="#" className="bg-primary text-white font-medium py-3.5 px-7 rounded shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors">Get Started Free →</a>
              <a href="#" className="border border-white/40 text-white font-medium py-3.5 px-7 rounded flex items-center hover:bg-white/10 transition-colors">
                <span className="mr-2">⊙</span> Watch Demo
              </a>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col gap-10 pl-20 border-l border-white/10 pointer-events-auto"
          >
            <div>
              <div className="text-5xl font-headline-lg text-white mb-2">10k+</div>
              <div className="font-label-sm text-label-sm text-[#A3B4AA] uppercase tracking-wider">GOALS TRACKED</div>
            </div>
            <div>
              <div className="text-5xl font-headline-lg text-white mb-2">94%</div>
              <div className="font-label-sm text-label-sm text-[#A3B4AA] uppercase tracking-wider">COMPLETION RATE</div>
            </div>
            <div>
              <div className="text-5xl font-headline-lg text-white mb-2">2.5x</div>
              <div className="font-label-sm text-label-sm text-[#A3B4AA] uppercase tracking-wider">VELOCITY INCREASE</div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-center mt-auto pt-16 relative z-10"
        >
          <div className="font-label-sm text-label-sm text-[#6A7D73] uppercase tracking-[0.1em]">SCROLL</div>
          <div className="w-[1px] h-10 bg-[#6A7D73] mx-auto mt-4"></div>
        </motion.div>
      </motion.main>

      <footer className="bg-[#2B2D29] py-20 px-16 text-[#8A968E] relative z-20">
        <div className="grid grid-cols-4 gap-10">
          <div className="pr-10">
            <h2 className="font-headline-md text-headline-md text-primary-fixed-dim mb-4">GoalPulse</h2>
            <p className="font-body-sm text-body-sm mb-10 leading-relaxed">Elevating organizational performance through clarity, alignment, and execution.</p>
            <p className="text-[11px] text-[#626C65]">© 2024 GoalPulse HR Technologies. All rights reserved.</p>
          </div>
          
          <div>
            <h3 className="font-label-md text-label-md text-white mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Goal Tracking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Performance Reviews</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Continuous Feedback</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Analytics & Insights</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-label-md text-label-md text-white mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Customer Stories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-label-md text-label-md text-white mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
