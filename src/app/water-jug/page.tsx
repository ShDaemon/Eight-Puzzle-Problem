'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCcw, Settings2, Info, Droplets } from 'lucide-react';
import Link from 'next/link';

// --- Types ---
interface JugState { a: number; b: number; }
interface Step { a: number; b: number; action: string; }

export default function WaterJug() {
    // --- Configuration ---
    const [capA, setCapA] = useState(3);
    const [capB, setCapB] = useState(5);
    const [target, setTarget] = useState(4);

    // --- Game State ---
    const [state, setState] = useState<JugState>({ a: 0, b: 0 });
    const [isSolving, setIsSolving] = useState(false);
    const [message, setMessage] = useState("Measure the target amount.");
    const [status, setStatus] = useState<'playing' | 'won'>('playing');
    const [moves, setMoves] = useState(0);

    const resetGame = useCallback(() => {
        setState({ a: 0, b: 0 });
        setStatus('playing');
        setMoves(0);
        setMessage(`Measure exactly ${target}L in either jug.`);
    }, [target]);

    useEffect(() => { resetGame(); }, [capA, capB, target, resetGame]);

    const performAction = (action: string) => {
        if (isSolving || status === 'won') return;
        let nextA = state.a;
        let nextB = state.b;
        let desc = "";

        switch (action) {
            case 'fillA': nextA = capA; desc = "Filled Jug A"; break;
            case 'fillB': nextB = capB; desc = "Filled Jug B"; break;
            case 'emptyA': nextA = 0; desc = "Emptied Jug A"; break;
            case 'emptyB': nextB = 0; desc = "Emptied Jug B"; break;
            case 'pourAB':
                const amountAB = Math.min(state.a, capB - state.b);
                nextA -= amountAB; nextB += amountAB; desc = "Poured A into B"; break;
            case 'pourBA':
                const amountBA = Math.min(state.b, capA - state.a);
                nextB -= amountBA; nextA += amountBA; desc = "Poured B into A"; break;
        }

        setState({ a: nextA, b: nextB });
        setMoves(m => m + 1);
        if (nextA === target || nextB === target) {
            setStatus('won');
            setMessage(`Success! Found ${target}L.`);
        } else { setMessage(desc); }
    };

    const solveBFS = async () => {
        if (target > Math.max(capA, capB) || (target % gcd(capA, capB) !== 0)) {
            setMessage("Impossible with these capacities!");
            return;
        }
        setIsSolving(true);
        resetGame();
        await new Promise(r => setTimeout(r, 200));

        const queue: { a: number, b: number, path: Step[] }[] = [{ a: 0, b: 0, path: [] }];
        const visited = new Set<string>();
        visited.add("0,0");
        let solution: Step[] | null = null;

        while (queue.length > 0) {
            const curr = queue.shift()!;
            if (curr.a === target || curr.b === target) { solution = curr.path; break; }
            const nextStates = [
                { a: capA, b: curr.b, act: 'fillA' },
                { a: curr.a, b: capB, act: 'fillB' },
                { a: 0, b: curr.b, act: 'emptyA' },
                { a: curr.a, b: 0, act: 'emptyB' },
                { a: curr.a - Math.min(curr.a, capB - curr.b), b: curr.b + Math.min(curr.a, capB - curr.b), act: 'pourAB' },
                { a: curr.a + Math.min(curr.b, capA - curr.a), b: curr.b - Math.min(curr.b, capA - curr.a), act: 'pourBA' },
            ];
            for (const next of nextStates) {
                const key = `${next.a},${next.b}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ a: next.a, b: next.b, path: [...curr.path, { a: next.a, b: next.b, action: next.act }] });
                }
            }
        }

        if (solution) {
            for (const step of solution) {
                setState({ a: step.a, b: step.b });
                setMoves(m => m + 1);
                setMessage(formatAction(step.action));
                await new Promise(r => setTimeout(r, 600));
            }
            setStatus('won');
            setMessage(`Solved in ${solution.length} moves!`);
        }
        setIsSolving(false);
    };

    const gcd = (a: number, b: number): number => (!b ? a : gcd(b, a % b));
    const formatAction = (act: string) => {
        switch(act) {
            case 'fillA': return "Fill Jug A";
            case 'fillB': return "Fill Jug B";
            case 'emptyA': return "Empty Jug A";
            case 'emptyB': return "Empty Jug B";
            case 'pourAB': return "Pour A → B";
            case 'pourBA': return "Pour B → A";
            default: return "";
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-blue-50 p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <Link href="/" className="inline-flex items-center text-neutral-400 mb-8 hover:text-white transition-colors">
                <ArrowLeft className="mr-2" size={20} /> Back to Hub
            </Link>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12">

                {/* --- 1. NAME SECTION (Mobile: 1, Desktop: Top Left) --- */}
                <div className="lg:col-span-4 order-1">
                    <div className="bg-neutral-900/80 backdrop-blur-sm p-6 rounded-3xl border border-neutral-800 shadow-xl">
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            <Droplets className="text-blue-500" fill="currentColor" size={32} /> Water Jugs
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            Use two jugs to measure exactly <strong className="text-white">{target}L</strong>.
                        </p>
                    </div>
                </div>

                {/* --- 2. INPUT COUNTER SECTION (Mobile: 2, Desktop: Mid Left) --- */}
                <div className="lg:col-span-4 order-2 space-y-6">
                    <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <label className="text-neutral-400 flex items-center gap-2"><Settings2 size={14}/> Capacities</label>
                                <span className="text-blue-500 font-mono text-xs">GCD: {gcd(capA, capB)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-neutral-500 block text-center">Jug A</label>
                                    <input type="number" min="1" max="99" value={capA} onChange={(e) => setCapA(Number(e.target.value))} disabled={isSolving} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-center text-white font-mono" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-neutral-500 block text-center">Jug B</label>
                                    <input type="number" min="1" max="99" value={capB} onChange={(e) => setCapB(Number(e.target.value))} disabled={isSolving} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-center text-white font-mono" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-blue-400 font-bold block text-center">Target</label>
                                    <input type="number" min="1" max="99" value={target} onChange={(e) => setTarget(Number(e.target.value))} disabled={isSolving} className="w-full bg-blue-900/20 border border-blue-500/50 rounded-lg p-2 text-center text-blue-200 font-mono" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 flex justify-between items-center">
                            <div className="text-sm text-neutral-400">Moves Used</div>
                            <div className="text-2xl font-mono text-white">{moves}</div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={solveBFS} disabled={isSolving || status === 'won'} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                {isSolving ? 'Solving...' : 'AI Solve (BFS)'} <Play size={18} fill="currentColor" />
                            </button>
                            <button onClick={resetGame} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 p-4 rounded-xl"><RefreshCcw size={20} /></button>
                        </div>
                    </div>
                </div>

                {/* --- 3. VISUALIZATION AREA (Mobile: 3, Desktop: Right Column) --- */}
                <div className="lg:col-span-8 lg:row-start-1 lg:row-span-3 order-3 flex flex-col gap-6">
                    <div className="relative bg-neutral-900 rounded-[2.5rem] border border-neutral-800 shadow-2xl p-8 min-h-[500px] lg:min-h-[600px] flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-8 left-0 w-full text-center z-20 px-4">
                            <AnimatePresence mode='wait'>
                                <motion.div key={message} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className={`inline-block px-6 py-2 rounded-full border text-sm font-bold shadow-lg ${status === 'won' ? 'bg-blue-500/20 border-blue-500 text-blue-200' : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'}`}>
                                    {message}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="flex-1 flex items-end justify-center gap-4 md:gap-12 pb-20 mt-16">
                            {/* Jug A */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-24 md:w-32 h-64 border-4 border-neutral-600 rounded-b-2xl border-t-0 bg-neutral-800/30 overflow-hidden">
                                    <motion.div className="absolute bottom-0 w-full bg-blue-500/80" initial={{ height: 0 }} animate={{ height: `${(state.a / capA) * 100}%` }} transition={{ type: 'spring', stiffness: 60, damping: 15 }} />
                                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white z-10">{state.a}L</div>
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex gap-2">
                                        <button onClick={() => performAction('fillA')} disabled={isSolving} className="flex-1 py-2 bg-neutral-800 rounded-lg text-xs font-bold">Fill</button>
                                        <button onClick={() => performAction('emptyA')} disabled={isSolving} className="flex-1 py-2 bg-neutral-800 rounded-lg text-xs font-bold">Empty</button>
                                    </div>
                                    <button onClick={() => performAction('pourAB')} disabled={isSolving} className="w-full py-2 bg-blue-900/30 border border-blue-500/30 rounded-lg text-xs font-bold">Pour → B</button>
                                </div>
                            </div>
                            {/* Jug B */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-32 md:w-40 h-80 border-4 border-neutral-600 rounded-b-2xl border-t-0 bg-neutral-800/30 overflow-hidden">
                                    <motion.div className="absolute bottom-0 w-full bg-cyan-500/80" initial={{ height: 0 }} animate={{ height: `${(state.b / capB) * 100}%` }} transition={{ type: 'spring', stiffness: 60, damping: 15 }} />
                                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white z-10">{state.b}L</div>
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex gap-2">
                                        <button onClick={() => performAction('fillB')} disabled={isSolving} className="flex-1 py-2 bg-neutral-800 rounded-lg text-xs font-bold">Fill</button>
                                        <button onClick={() => performAction('emptyB')} disabled={isSolving} className="flex-1 py-2 bg-neutral-800 rounded-lg text-xs font-bold">Empty</button>
                                    </div>
                                    <button onClick={() => performAction('pourBA')} disabled={isSolving} className="w-full py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-xs font-bold">← Pour to A</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 4. ALGORITHM INSIGHT (Mobile: 4, Desktop: Bottom Left) --- */}
                <div className="lg:col-span-4 order-4">
                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
                        <h3 className="text-lg font-semibold mb-2 text-blue-300 flex items-center gap-2">
                            <Info size={16} /> Algorithm Insight: BFS
                        </h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">

                            Since we want the <strong>minimum number of pours</strong>, Breadth-First Search is ideal. The state space is defined by <code>(Amount A, Amount B)</code>. We explore all 6 possible actions from every state until we hit the target.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}