'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Grid3X3, Crown, Ghost, Droplets, Sparkles, Zap, BrainCircuit, Network, Eraser, MoreHorizontal, Construction } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Home() {
  return (
      <div className="min-h-screen bg-black text-white selection:bg-amber-500/30 font-sans relative overflow-x-hidden">

        {/* --- Tech Background --- */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]" />
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <main className="container mx-auto px-6 py-24 max-w-7xl relative z-10">

          {/* --- HERO SECTION --- */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center text-center mb-32"
          >
            <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-neutral-300 backdrop-blur-xl">
              <Sparkles size={12} className="text-amber-400" />
              <span>Algorithm Visualizer v2.2</span>
            </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-bold tracking-tight mb-8">
              Master Complexity <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 animate-gradient-x">
              Through Interaction
            </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-10">
              Dive into the logic of AI. Visualize search strategies, constraint satisfaction, and optimization problems in a beautiful, real-time environment.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-8 text-neutral-500 text-sm font-medium border-t border-white/5 pt-8 w-full max-w-4xl">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-400" /> Real-Time Solving
              </div>
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-blue-400" /> Heuristic Analysis
              </div>
              <div className="flex items-center gap-2">
                <Network size={16} className="text-purple-400" /> State Space Search
              </div>
            </motion.div>
          </motion.div>


          {/* --- BENTO GRID SECTION --- */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >

            <Card
                href="/8-puzzle"
                icon={<Grid3X3 size={32} />}
                title="8-Puzzle Solver"
                desc="Sliding tile puzzle using A* Search with Manhattan Distance heuristics."
                algo="A* Search"
                color="emerald"
            />

            <Card
                href="/n-queens"
                icon={<Crown size={32} />}
                title="N-Queens Visualizer"
                desc="Constraint satisfaction problem. Place N queens safely on an NxN board."
                algo="Backtracking"
                color="purple"
            />

            <Card
                href="/monks-demons"
                icon={<Ghost size={32} />}
                title="River Crossing"
                desc="Transport Monks & Demons across a river without violating safety constraints."
                algo="BFS (Shortest Path)"
                color="orange"
            />

            <Card
                href="/water-jug"
                icon={<Droplets size={32} />}
                title="Water Jug Problem"
                desc="Measure exact liquid amounts using two jugs of differing dynamic capacities."
                algo="BFS (State Space)"
                color="blue"
            />

            <Card
                href="/vacuum-cleaner"
                icon={<Eraser size={32} />}
                title="Vacuum World"
                desc="Classic AI Agent problem. Clean a dirty grid using Reflex or Search agents."
                algo="Reflex / BFS"
                color="amber"
            />

            {/* Coming Soon Block (Dashed Style) */}
            <motion.div
                variants={itemVariants}
                className="group relative flex flex-col p-8 rounded-3xl bg-neutral-900/30 border border-dashed border-neutral-800 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-neutral-900/50"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/5 text-neutral-500 bg-white/5 group-hover:text-white group-hover:bg-white/10 transition-colors">
                <Construction size={32} />
              </div>

              <h3 className="text-2xl font-bold text-neutral-400 mb-3 group-hover:text-white transition-colors">
                More Coming Soon
              </h3>

              <p className="text-neutral-500 text-sm leading-relaxed mb-8 flex-grow">
                We are working on adding <span className="text-neutral-300">Tic-Tac-Toe (Minimax)</span>, <span className="text-neutral-300">Sudoku Solver</span>, and <span className="text-neutral-300">Pathfinding Visualizers</span>.
              </p>

              <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 uppercase tracking-wider group-hover:text-neutral-400 transition-colors">
                  <Sparkles size={14} /> In Development
                </div>
              </div>
            </motion.div>

          </motion.div>
        </main>
      </div>
  );
}

// --- Reusable Card Component ---
const Card = ({ href, icon, title, desc, algo, color, className = "" }: any) => {

  // Define styles based on color
  const colors: Record<string, { border: string, iconBg: string, iconText: string, glow: string }> = {
    emerald: {
      border: "hover:border-emerald-500/30",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      iconText: "text-emerald-400",
      glow: "hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]"
    },
    purple: {
      border: "hover:border-purple-500/30",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      iconText: "text-purple-400",
      glow: "hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)]"
    },
    orange: {
      border: "hover:border-orange-500/30",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      iconText: "text-orange-400",
      glow: "hover:shadow-[0_0_30px_-10px_rgba(249,115,22,0.2)]"
    },
    blue: {
      border: "hover:border-blue-500/30",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      iconText: "text-blue-400",
      glow: "hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]"
    },
    amber: {
      border: "hover:border-amber-500/30",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      iconText: "text-amber-400",
      glow: "hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]"
    }
  };

  const current = colors[color];

  return (
      <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className={`
        group relative flex flex-col p-8 rounded-3xl 
        bg-neutral-900/30 border border-neutral-800 backdrop-blur-sm 
        transition-all duration-300 
        hover:bg-neutral-900/50 
        ${current.border} ${current.glow}
        ${className}
      `}
      >
        <Link href={href} className="absolute inset-0 z-10" />

        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-colors ${current.iconBg} ${current.iconText}`}>
          {icon}
        </div>

        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
          {title}
        </h3>

        <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-grow">
          {desc}
        </p>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-wider group-hover:text-neutral-300 transition-colors">
            <Cpu size={14} /> {algo}
          </div>

          <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:bg-white/10 group-hover:text-white`}>
            <ArrowRight size={18} />
          </div>
        </div>
      </motion.div>
  );
};