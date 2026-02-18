'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCcw, Crown, User, Cpu, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';

// --- Types ---
type Mode = 'ai' | 'user';
type Queen = { r: number; c: number };

export default function NQueens() {
    // --- State: Common ---
    const [n, setN] = useState(4);
    const [mode, setMode] = useState<Mode>('ai');

    // --- State: AI Solver ---
    const [aiBoard, setAiBoard] = useState<number[]>([]); // index = row, value = col
    const [isSolving, setIsSolving] = useState(false);
    const [speed, setSpeed] = useState(100);
    const stopRef = useRef(false);

    // --- State: User Game ---
    const [userQueens, setUserQueens] = useState<Queen[]>([]);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');

    // --- Effect: Reset on changes ---
    useEffect(() => {
        resetBoard(n);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [n, mode]);

    // --- Logic: Reset ---
    const resetBoard = (size: number) => {
        // Reset AI
        stopRef.current = true;
        setIsSolving(false);
        setAiBoard(Array(size).fill(-1));

        // Reset User
        setUserQueens([]);
        setGameStatus('playing');
    };

    // --- Logic: Conflict Detection (User Mode) ---
    const getConflicts = (queens: Queen[]) => {
        const conflicts = new Set<string>(); // Stores "r,c" strings

        for (let i = 0; i < queens.length; i++) {
            for (let j = i + 1; j < queens.length; j++) {
                const q1 = queens[i];
                const q2 = queens[j];

                const isRowConflict = q1.r === q2.r;
                const isColConflict = q1.c === q2.c;
                const isDiagConflict = Math.abs(q1.r - q2.r) === Math.abs(q1.c - q2.c);

                if (isRowConflict || isColConflict || isDiagConflict) {
                    conflicts.add(`${q1.r},${q1.c}`);
                    conflicts.add(`${q2.r},${q2.c}`);
                }
            }
        }
        return conflicts;
    };

    const activeConflicts = mode === 'user' ? getConflicts(userQueens) : new Set();

    // --- Logic: User Interaction ---
    const toggleUserCell = (r: number, c: number) => {
        if (mode !== 'user' || gameStatus === 'won') return;

        setUserQueens(prev => {
            const existingIdx = prev.findIndex(q => q.r === r && q.c === c);
            let newQueens;

            if (existingIdx >= 0) {
                // Remove queen
                newQueens = prev.filter((_, idx) => idx !== existingIdx);
            } else {
                // Add queen (Auto-remove other queens in same row for better UX)
                const filtered = prev.filter(q => q.r !== r);
                newQueens = [...filtered, { r, c }];
            }

            // Check Win Condition
            const hasConflicts = getConflicts(newQueens).size > 0;
            if (newQueens.length === n && !hasConflicts) {
                setGameStatus('won');
            } else {
                setGameStatus('playing');
            }

            return newQueens;
        });
    };

    // --- Logic: AI Backtracking ---
    const isSafeAI = (currentBoard: number[], row: number, col: number) => {
        for (let prevRow = 0; prevRow < row; prevRow++) {
            const prevCol = currentBoard[prevRow];
            // Check col and diag
            if (prevCol === col || Math.abs(prevCol - col) === Math.abs(prevRow - row)) return false;
        }
        return true;
    };

    const solveAI = async () => {
        if (isSolving) return;
        setIsSolving(true);
        stopRef.current = false;
        const newBoard = Array(n).fill(-1);
        setAiBoard([...newBoard]);

        await backtrack(newBoard, 0);
        setIsSolving(false);
    };

    const backtrack = async (currentBoard: number[], row: number): Promise<boolean> => {
        if (stopRef.current) return false;
        if (row === n) return true; // Solution Found

        for (let col = 0; col < n; col++) {
            if (isSafeAI(currentBoard, row, col)) {
                currentBoard[row] = col;
                setAiBoard([...currentBoard]);

                await new Promise(r => setTimeout(r, speed));

                if (await backtrack(currentBoard, row + 1)) return true;

                // Backtrack
                currentBoard[row] = -1;
                setAiBoard([...currentBoard]);
            }
        }
        return false;
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">
            <Link href="/" className="inline-flex items-center text-neutral-400 mb-8 hover:text-white transition-colors">
                <ArrowLeft className="mr-2" size={20} /> Back to Hub
            </Link>

            {/* Layout Grid:
                Mobile: Flex Column (Controls -> Board -> Algo).
                Desktop: Grid (Controls Left Top, Algo Left Bottom, Board Right Spanning 2 Rows)
            */}
            <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12">

                {/* --- 1. CONTROLS (Top Left) --- */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Header */}
                    <div className="bg-neutral-900/80 backdrop-blur-sm p-6 rounded-3xl border border-neutral-800 shadow-xl">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            <Crown className="text-purple-500 shrink-0" fill="currentColor" size={32} /> N-Queens
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            Place <strong className="text-purple-400">{n}</strong> queens so none attack each other.
                        </p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="bg-neutral-900/50 p-1.5 rounded-2xl flex gap-1 border border-neutral-800 overflow-hidden">
                        <button
                            onClick={() => setMode('ai')}
                            className={`flex-1 py-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${mode === 'ai' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            <Cpu size={16} className="shrink-0" /> AI Solver
                        </button>
                        <button
                            onClick={() => setMode('user')}
                            className={`flex-1 py-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${mode === 'user' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            <User size={16} className="shrink-0" /> Play Yourself
                        </button>
                    </div>

                    {/* Settings Panel */}
                    <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                        {/* N Slider */}
                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-4">
                                <label className="text-sm font-medium text-neutral-300">Grid Size (N)</label>
                                <span className="text-2xl font-bold text-purple-400">{n}</span>
                            </div>
                            <input
                                type="range" min="4" max="12" value={n}
                                onChange={(e) => setN(parseInt(e.target.value))}
                                disabled={isSolving || (mode === 'user' && userQueens.length > 0)}
                                className="w-full accent-purple-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                            />
                        </div>

                        {mode === 'ai' ? (
                            // AI Controls
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Visualization Speed</label>
                                    <input
                                        type="range" min="10" max="500" step="10" value={speed}
                                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                                        className="w-full accent-emerald-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={solveAI}
                                        disabled={isSolving}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 whitespace-nowrap"
                                    >
                                        {isSolving ? 'Solving...' : 'Start AI'} <Play size={18} fill="currentColor" />
                                    </button>
                                    <button onClick={() => resetBoard(n)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 p-4 rounded-xl transition-colors">
                                        <RefreshCcw size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // User Controls
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl border ${gameStatus === 'won' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-neutral-950 border-neutral-800'}`}>
                                    {gameStatus === 'won' ? (
                                        <div className="flex items-center gap-3 text-emerald-400">
                                            <CheckCircle2 size={24} />
                                            <span className="font-bold">Puzzle Solved!</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-400">Queens Placed:</span>
                                            <span className={`font-mono font-bold ${userQueens.length === n ? 'text-yellow-400' : 'text-white'}`}>
                        {userQueens.length} / {n}
                      </span>
                                        </div>
                                    )}
                                </div>

                                {activeConflicts.size > 0 && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm animate-pulse">
                                        <AlertCircle size={16} />
                                        <span>Attack Detected!</span>
                                    </div>
                                )}

                                <button
                                    onClick={() => resetBoard(n)}
                                    className="w-full bg-neutral-800 hover:bg-neutral-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <RefreshCcw size={18} /> Reset Board
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 2. BOARD (Right Column / Middle on Mobile) --- */}
                <div className="lg:col-span-8 lg:row-span-2 flex flex-col items-center justify-start min-h-[500px]">
                    <div className="relative w-full max-w-[600px] bg-neutral-900 p-4 md:p-8 rounded-[2rem] border border-neutral-800 shadow-2xl">

                        {/* Grid Container */}
                        <div
                            className="grid gap-1 bg-neutral-800/50 p-2 rounded-xl border border-neutral-700 mx-auto"
                            style={{
                                gridTemplateColumns: `repeat(${n}, 1fr)`,
                                width: '100%',
                                aspectRatio: '1/1'
                            }}
                        >
                            {Array.from({ length: n * n }).map((_, i) => {
                                const r = Math.floor(i / n);
                                const c = i % n;
                                const isDark = (r + c) % 2 === 1;

                                let hasQueen = false;
                                let isConflict = false;

                                if (mode === 'ai') {
                                    hasQueen = aiBoard[r] === c;
                                } else {
                                    hasQueen = userQueens.some(q => q.r === r && q.c === c);
                                    isConflict = activeConflicts.has(`${r},${c}`);
                                }

                                return (
                                    <motion.div
                                        key={`${r}-${c}`}
                                        onClick={() => toggleUserCell(r, c)}
                                        whileHover={mode === 'user' ? { scale: 0.95 } : {}}
                                        whileTap={mode === 'user' ? { scale: 0.9 } : {}}
                                        className={`
                                          relative w-full aspect-square rounded-md flex items-center justify-center transition-all duration-200 overflow-hidden
                                          ${mode === 'user' ? 'cursor-pointer hover:ring-2 hover:ring-white/20' : 'cursor-default'}
                                          ${isDark ? 'bg-neutral-900' : 'bg-neutral-700'}
                                          ${isConflict ? 'bg-red-900/50 ring-2 ring-red-500 z-10' : ''}
                                          ${!isConflict && hasQueen && mode === 'user' ? 'ring-2 ring-purple-500 z-10' : ''}
                                          ${gameStatus === 'won' && hasQueen ? 'bg-emerald-900/50 ring-2 ring-emerald-500' : ''}
                                        `}
                                    >
                                        <AnimatePresence>
                                            {hasQueen && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                    className={`w-[70%] h-[70%] ${isConflict ? 'text-red-500' : gameStatus === 'won' ? 'text-emerald-400' : 'text-purple-500'}`}
                                                >
                                                    <Crown className="w-full h-full drop-shadow-lg" fill="currentColor" strokeWidth={1.5} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {mode === 'user' && !hasQueen && (
                                            <div className="absolute w-2 h-2 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-neutral-400 bg-neutral-900/50 px-6 py-3 rounded-full border border-neutral-800">
                        <div className="flex items-center gap-2">
                            <Crown size={16} className="text-purple-500" /> <span>Queen</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-neutral-900 border border-neutral-700" /> <span>Dark</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-neutral-700 border border-neutral-600" /> <span>Light</span>
                        </div>
                        {mode === 'user' && (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-red-900/50 border border-red-500" /> <span className="text-red-400">Conflict</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 3. ALGO INSIGHT (Bottom Left) --- */}
                <div className="lg:col-span-4">
                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
                        <h3 className="text-lg font-semibold mb-2 text-purple-300 flex items-center gap-2">
                            <Info size={16} /> Algorithm Insight
                        </h3>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                            The AI uses <strong>Backtracking</strong>. It places queens column by column, checking for safety.
                        </p>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            If a safe placement is found, it moves to the next row. If it hits a dead end, it <em>backtracks</em> to the previous row and tries a different column.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}