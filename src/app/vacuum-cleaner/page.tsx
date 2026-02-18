'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCcw, Settings2, Info, Sparkles, Trash2, Wind, Zap } from 'lucide-react';
import Link from 'next/link';

// --- Constants & Types ---
type Position = { r: number; c: number };
type CellState = 'clean' | 'dirty';

const GRID_SIZE = 3;

export default function VacuumWorld() {
    // --- State ---
    const [grid, setGrid] = useState<CellState[][]>(
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('dirty'))
    );
    const [agentPos, setAgentPos] = useState<Position>({ r: 0, c: 0 });
    const [direction, setDirection] = useState(0);
    const [moves, setMoves] = useState(0);
    const [cleanedCount, setCleanedCount] = useState(0);
    const [isSolving, setIsSolving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'cleaning' | 'done'>('idle');
    const [message, setMessage] = useState("Place dirt or start the AI.");

    // --- Helpers ---
    const totalDirt = grid.flat().filter(c => c === 'dirty').length;

    const toggleDirt = (r: number, c: number) => {
        if (isSolving) return;
        setGrid(prev => {
            const newGrid = prev.map(row => [...row]);
            newGrid[r][c] = newGrid[r][c] === 'dirty' ? 'clean' : 'dirty';
            return newGrid;
        });
    };

    const randomizeDirt = () => {
        if (isSolving) return;
        setGrid(
            Array(GRID_SIZE).fill(null).map(() =>
                Array(GRID_SIZE).fill(null).map(() => Math.random() > 0.4 ? 'dirty' : 'clean')
            )
        );
        setStatus('idle');
        setMoves(0);
        setCleanedCount(0);
        setMessage("Environment randomized.");
    };

    const resetRoom = () => {
        if (isSolving) return;
        setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('clean')));
        setAgentPos({ r: 0, c: 0 });
        setMoves(0);
        setCleanedCount(0);
        setStatus('idle');
        setMessage("Room clean. Add dirt to start.");
    };

    const getNearestDirt = (start: Position, currentGrid: CellState[][]) => {
        let minDist = Infinity;
        let target: Position | null = null;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (currentGrid[r][c] === 'dirty') {
                    const dist = Math.abs(start.r - r) + Math.abs(start.c - c);
                    if (dist < minDist) {
                        minDist = dist;
                        target = { r, c };
                    }
                }
            }
        }
        return target;
    };

    const runAI = async () => {
        if (totalDirt === 0) {
            setMessage("Room is already clean!");
            return;
        }
        setIsSolving(true);
        setStatus('cleaning');
        setMessage("AI scanning for dirt...");
    };

    useEffect(() => {
        if (!isSolving) return;

        const performStep = async () => {
            if (grid[agentPos.r][agentPos.c] === 'dirty') {
                setMessage("Sucking dirt...");
                await new Promise(r => setTimeout(r, 500));

                setGrid(prev => {
                    const nw = prev.map(row => [...row]);
                    nw[agentPos.r][agentPos.c] = 'clean';
                    return nw;
                });
                setCleanedCount(p => p + 1);

                const remaining = grid.flat().filter(c => c === 'dirty').length - 1;
                if (remaining <= 0) {
                    setStatus('done');
                    setIsSolving(false);
                    setMessage("Room Cleaned!");
                    return;
                }
            }

            const tempGrid = grid.map(row => [...row]);
            tempGrid[agentPos.r][agentPos.c] = 'clean';
            const target = getNearestDirt(agentPos, tempGrid);

            if (!target) {
                setStatus('done');
                setIsSolving(false);
                setMessage("All Clear!");
                return;
            }

            await new Promise(r => setTimeout(r, 400));

            let nextR = agentPos.r;
            let nextC = agentPos.c;
            let moveDir = direction;

            if (target.r > agentPos.r) { nextR++; moveDir = 180; }
            else if (target.r < agentPos.r) { nextR--; moveDir = 0; }
            else if (target.c > agentPos.c) { nextC++; moveDir = 90; }
            else if (target.c < agentPos.c) { nextC--; moveDir = -90; }

            setDirection(moveDir);
            setAgentPos({ r: nextR, c: nextC });
            setMoves(p => p + 1);
        };

        const timer = setTimeout(performStep, 100);
        return () => clearTimeout(timer);
    }, [isSolving, agentPos, grid, direction]);

    return (
        <div className="min-h-screen bg-neutral-950 text-amber-50 p-4 md:p-8 font-sans selection:bg-amber-500/30">
            <Link href="/" className="inline-flex items-center text-neutral-400 mb-8 hover:text-white transition-colors">
                <ArrowLeft className="mr-2" size={20} /> Back to Hub
            </Link>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12">

                {/* --- 1. NAME SECTION (Mobile: 1st, Desktop: Top-Left) --- */}
                <div className="lg:col-span-4 order-1 lg:order-1">
                    <div className="bg-neutral-900/80 backdrop-blur-sm p-6 rounded-3xl border border-neutral-800 shadow-xl">
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
                            <Zap className="text-amber-500" fill="currentColor" size={32} /> Vacuum World
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            An intelligent agent that perceives its environment and acts to clean it efficiently.
                        </p>
                    </div>
                </div>

                {/* --- 2. GAME SECTION (Mobile: 2nd, Desktop: Right Column) --- */}
                <div className="lg:col-span-8 lg:row-span-3 order-2 lg:order-2 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[600px] aspect-square bg-neutral-900 rounded-[2.5rem] border border-neutral-800 shadow-2xl p-8 flex flex-col justify-between">

                        {/* Overlay Message */}
                        <div className="absolute top-8 left-0 w-full text-center z-20 pointer-events-none">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={message}
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    className={`inline-block px-6 py-2 rounded-full border text-sm font-bold shadow-lg backdrop-blur-md
                                     ${status === 'done'
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'}`}
                                >
                                    {message}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* GRID */}
                        <div className="flex-1 grid grid-cols-3 gap-3 md:gap-4 mt-12">
                            {grid.map((row, r) => (
                                row.map((cell, c) => {
                                    const isAgentHere = agentPos.r === r && agentPos.c === c;
                                    return (
                                        <div
                                            key={`${r}-${c}`}
                                            onClick={() => toggleDirt(r, c)}
                                            className={`relative rounded-2xl flex items-center justify-center cursor-pointer transition-colors duration-300 border-2
                                             ${cell === 'dirty'
                                                ? 'bg-amber-900/20 border-amber-900/50 hover:bg-amber-900/30'
                                                : 'bg-neutral-800/50 border-neutral-800 hover:border-neutral-700'}`}
                                        >
                                            <AnimatePresence>
                                                {cell === 'dirty' && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                    >
                                                        <div className="w-16 h-16 md:w-24 md:h-24 bg-amber-600/20 rounded-full blur-xl absolute" />
                                                        <Trash2 className="text-amber-700/60 w-1/2 h-1/2" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {isAgentHere && (
                                                <motion.div
                                                    layoutId="agent"
                                                    className="absolute z-20 w-[70%] h-[70%] bg-amber-500 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center border-4 border-amber-300"
                                                    animate={{ rotate: direction }}
                                                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                                                >
                                                    <div className="relative w-full h-full flex items-center justify-center text-amber-950">
                                                        <div className="absolute -top-3 w-4 h-8 bg-amber-300 rounded-full" />
                                                        <Wind size={32} strokeWidth={2.5} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                })
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-8 flex justify-center gap-6 text-xs font-medium text-neutral-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-500 rounded-full" /> Agent
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-900/50 border border-amber-900 rounded-sm" /> Dirt
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. COUNTER & SOLVE SECTION (Mobile: 3rd, Desktop: Middle-Left) --- */}
                <div className="lg:col-span-4 order-3 lg:order-3 space-y-6">
                    <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                                <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase font-bold mb-1">
                                    <Wind size={14} /> Moves
                                </div>
                                <div className="text-2xl font-mono text-white">{moves}</div>
                            </div>
                            <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                                <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase font-bold mb-1">
                                    <Trash2 size={14} /> Dirt Left
                                </div>
                                <div className={`text-2xl font-mono ${totalDirt === 0 ? 'text-emerald-400' : 'text-amber-500/80'}`}>
                                    {totalDirt}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => !isSolving && runAI()}
                                disabled={isSolving || totalDirt === 0}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:grayscale"
                            >
                                {isSolving ? 'Cleaning...' : 'Start Smart Agent'} <Play size={18} fill="currentColor" />
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={randomizeDirt} disabled={isSolving}
                                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                    <Settings2 size={16} /> Randomize
                                </button>
                                <button
                                    onClick={resetRoom} disabled={isSolving}
                                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 rounded-xl transition-colors"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 4. INSIGHT SECTION (Mobile: 4th, Desktop: Bottom-Left) --- */}
                <div className="lg:col-span-4 order-4 lg:order-4">
                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
                        <h3 className="text-lg font-semibold mb-2 text-amber-300 flex items-center gap-2">
                            <Info size={16} /> Agent Logic
                        </h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            This is a <strong>Goal-Based Agent</strong>. Unlike a simple reflex agent, this agent uses a <strong>Nearest Neighbor</strong> heuristic to actively scan the grid and move toward the closest dirt patch.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}