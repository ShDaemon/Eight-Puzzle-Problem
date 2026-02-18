'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCcw, Ghost, User, AlertTriangle, CheckCircle2, Footprints, Skull, Info } from 'lucide-react';
import Link from 'next/link';

// --- Constants & Types ---
type Side = 'left' | 'right';
type CharacterType = 'monk' | 'demon';
type GameState = 'playing' | 'won' | 'lost';

interface State {
    mLeft: number;
    dLeft: number;
    boatPos: Side;
    boatLoad: CharacterType[];
}

const INITIAL_STATE: State = {
    mLeft: 3,
    dLeft: 3,
    boatPos: 'left',
    boatLoad: [],
};

// --- Helper Functions ---
const isValidState = (m: number, d: number) => {
    // Rule: If monks are present, they cannot be outnumbered by demons
    if (m > 0 && m < d) return false;
    return true;
};

// --- Solver (BFS) ---
const solveBFS = () => {
    const queue = [{
        m: 3, d: 3, b: 0, // 0=left
        path: [] as { m: number, d: number, b: number }[]
    }];
    const visited = new Set<string>();
    visited.add("3,3,0");

    while (queue.length > 0) {
        const curr = queue.shift()!;
        const { m, d, b } = curr;

        if (m === 0 && d === 0 && b === 1) return curr.path;

        const moves = [
            { dm: 1, dd: 0 }, { dm: 2, dd: 0 },
            { dm: 0, dd: 1 }, { dm: 0, dd: 2 },
            { dm: 1, dd: 1 }
        ];

        for (const move of moves) {
            let nextM, nextD, nextB;
            if (b === 0) {
                nextM = m - move.dm; nextD = d - move.dd; nextB = 1;
            } else {
                nextM = m + move.dm; nextD = d + move.dd; nextB = 0;
            }

            if (nextM < 0 || nextM > 3 || nextD < 0 || nextD > 3) continue;

            // Check both banks including the boat's arrival
            if (!isValidState(nextM, nextD) || !isValidState(3 - nextM, 3 - nextD)) continue;

            const stateStr = `${nextM},${nextD},${nextB}`;
            if (!visited.has(stateStr)) {
                visited.add(stateStr);
                queue.push({
                    m: nextM, d: nextD, b: nextB,
                    path: [...curr.path, { m: nextM, d: nextD, b: nextB }]
                });
            }
        }
    }
    return null;
};

export default function MonksAndDemons() {
    const [state, setState] = useState<State>(INITIAL_STATE);
    const [status, setStatus] = useState<GameState>('playing');
    const [isSolving, setIsSolving] = useState(false);
    const [message, setMessage] = useState("Transport all to the Right Bank.");
    const [movesCount, setMovesCount] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- Derived State (Population-Sum Fix) ---
    const boatM = state.boatLoad.filter(c => c === 'monk').length;
    const boatD = state.boatLoad.filter(c => c === 'demon').length;

    // Total on right = 3 - LeftGround - BoatCount
    const mRightGround = 3 - state.mLeft - boatM;
    const dRightGround = 3 - state.dLeft - boatD;

    // Total counts per bank (Bank + Boat)
    const leftTotalM = state.mLeft + (state.boatPos === 'left' ? boatM : 0);
    const leftTotalD = state.dLeft + (state.boatPos === 'left' ? boatD : 0);
    const rightTotalM = mRightGround + (state.boatPos === 'right' ? boatM : 0);
    const rightTotalD = dRightGround + (state.boatPos === 'right' ? boatD : 0);

    const resetGame = useCallback(() => {
        setState(INITIAL_STATE);
        setStatus('playing');
        setMessage("Transport all to the Right Bank.");
        setIsSolving(false);
        setMovesCount(0);
    }, []);

    const handleCharClick = (type: CharacterType, side: Side) => {
        if (isSolving || status !== 'playing') return;
        if (side !== state.boatPos) return;

        if (state.boatLoad.length < 2) {
            if (side === 'left') {
                if (type === 'monk' && state.mLeft > 0) setState(p => ({ ...p, mLeft: p.mLeft - 1, boatLoad: [...p.boatLoad, 'monk'] }));
                if (type === 'demon' && state.dLeft > 0) setState(p => ({ ...p, dLeft: p.dLeft - 1, boatLoad: [...p.boatLoad, 'demon'] }));
            } else {
                if (type === 'monk' && mRightGround > 0) setState(p => ({ ...p, boatLoad: [...p.boatLoad, 'monk'] }));
                if (type === 'demon' && dRightGround > 0) setState(p => ({ ...p, boatLoad: [...p.boatLoad, 'demon'] }));
            }
        }
    };

    const unloadBoat = (index: number) => {
        if (isSolving || status !== 'playing') return;
        const char = state.boatLoad[index];
        const newLoad = state.boatLoad.filter((_, i) => i !== index);
        if (state.boatPos === 'left') {
            if (char === 'monk') setState(p => ({ ...p, mLeft: p.mLeft + 1, boatLoad: newLoad }));
            else setState(p => ({ ...p, dLeft: p.dLeft + 1, boatLoad: newLoad }));
        } else {
            setState(p => ({ ...p, boatLoad: newLoad }));
        }
    };

    const moveBoat = () => {
        if (state.boatLoad.length === 0) {
            setMessage("Boat cannot move empty!");
            return;
        }

        const newPos = state.boatPos === 'left' ? 'right' : 'left';
        setMovesCount(c => c + 1);

        // Update position
        setState(p => ({ ...p, boatPos: newPos }));

        // Check safety of the banks considering the boat's new position
        const checkLeftM = state.mLeft + (newPos === 'left' ? boatM : 0);
        const checkLeftD = state.dLeft + (newPos === 'left' ? boatD : 0);
        const checkRightM = mRightGround + (newPos === 'right' ? boatM : 0);
        const checkRightD = dRightGround + (newPos === 'right' ? boatD : 0);

        if (!isValidState(checkLeftM, checkLeftD)) {
            setStatus('lost');
            setMessage("Left Bank: Demons are feasting!");
        } else if (!isValidState(checkRightM, checkRightD)) {
            setStatus('lost');
            setMessage("Right Bank: Demons are feasting!");
        } else {
            setMessage("");
        }
    };

    useEffect(() => {
        if (state.mLeft === 0 && state.dLeft === 0 && state.boatLoad.length === 0 && state.boatPos === 'right') {
            setStatus('won');
            setMessage("Safe crossing achieved!");
        }
    }, [state]);

    const runAISolver = async () => {
        setIsSolving(true);
        resetGame();
        await new Promise(r => setTimeout(r, 100));

        const path = solveBFS();
        if (!path) {
            setIsSolving(false);
            return;
        }

        let currentM = 3; let currentD = 3; let currentB = 0;
        for (const step of path) {
            const moveM = currentB === 0 ? currentM - step.m : step.m - currentM;
            const moveD = currentB === 0 ? currentD - step.d : step.d - currentD;

            setState(prev => {
                const load = [];
                for(let i=0; i<moveM; i++) load.push('monk' as CharacterType);
                for(let i=0; i<moveD; i++) load.push('demon' as CharacterType);
                return currentB === 0
                    ? { ...prev, mLeft: prev.mLeft - moveM, dLeft: prev.dLeft - moveD, boatLoad: load }
                    : { ...prev, boatLoad: load };
            });
            await new Promise(r => setTimeout(r, 400));

            setMovesCount(c => c + 1);
            setState(prev => ({ ...prev, boatPos: step.b === 1 ? 'right' : 'left' }));
            await new Promise(r => setTimeout(r, 600));

            setState({ mLeft: step.m, dLeft: step.d, boatPos: step.b === 0 ? 'left' : 'right', boatLoad: [] });
            await new Promise(r => setTimeout(r, 400));
            currentM = step.m; currentD = step.d; currentB = step.b;
        }
        setIsSolving(false);
    };

    const leftLost = status === 'lost' && !isValidState(leftTotalM, leftTotalD);
    const rightLost = status === 'lost' && !isValidState(rightTotalM, rightTotalD);

    return (
        <div className="min-h-screen bg-neutral-950 text-orange-50 p-4 md:p-8 font-sans selection:bg-orange-500/30">
            <Link href="/" className="inline-flex items-center text-neutral-400 mb-8 hover:text-white transition-colors">
                <ArrowLeft className="mr-2" size={20} /> Back to Hub
            </Link>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col gap-6">
                    <div className="relative bg-neutral-900 rounded-[2.5rem] border border-neutral-800 shadow-2xl p-6 min-h-[75vh] lg:min-h-[600px] overflow-hidden flex flex-col-reverse justify-between">

                        <div className="absolute top-8 left-0 w-full text-center z-50 px-4 pointer-events-none">
                            <AnimatePresence mode='wait'>
                                {message && (
                                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                                                className="inline-block px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-sm font-bold text-neutral-300 shadow-lg"
                                    >
                                        {message}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row items-stretch lg:items-end justify-between relative mt-12 pb-4">
                            {/* LEFT BANK */}
                            <div className={`flex-1 lg:flex-none lg:w-[30%] lg:h-[85%] bg-neutral-800/80 rounded-2xl lg:rounded-tr-[3rem] border border-neutral-700/50 relative flex flex-col justify-end p-4 pt-12 gap-4 backdrop-blur-sm transition-colors duration-500 z-10 ${leftLost ? 'bg-red-950/40 border-red-500/50' : ''}`}>
                                <span className="absolute top-4 left-4 font-bold text-neutral-500 text-xs uppercase tracking-widest z-10">Left Bank</span>
                                <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col justify-end">
                                    <div className="grid grid-cols-3 gap-3 w-full max-w-[14rem] mx-auto">
                                        <AnimatePresence mode='popLayout'>
                                            {Array.from({ length: state.mLeft }).map((_, i) => (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={`ml-${i}`}>
                                                    {leftLost ? <div className="w-full aspect-square bg-red-900/50 rounded-xl flex items-center justify-center border border-red-500/50"><Skull className="text-red-400" size={24} /></div> :
                                                        <button onClick={() => handleCharClick('monk', 'left')} disabled={isSolving} className="w-full aspect-square bg-orange-900/30 hover:bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30"><User className="text-orange-400" size={24} fill="currentColor"/></button>}
                                                </motion.div>
                                            ))}
                                            {Array.from({ length: state.dLeft }).map((_, i) => (
                                                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} key={`dl-${i}`} onClick={() => handleCharClick('demon', 'left')} disabled={isSolving}
                                                               className={`w-full aspect-square rounded-xl flex items-center justify-center border ${leftLost ? 'bg-red-600 border-red-400' : 'bg-red-900/30 border-red-500/30'}`}
                                                >
                                                    <Ghost className={leftLost ? 'text-black' : 'text-red-500'} size={24} fill="currentColor" />
                                                </motion.button>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* RIVER AREA */}
                            <div className="w-full lg:w-auto flex-1 lg:h-full relative mx-0 lg:mx-2 flex flex-col lg:flex-row items-center justify-center z-0 my-4 lg:my-0 gap-4">
                                <div className="relative w-full h-[120px] lg:h-full lg:w-[140px] flex items-center justify-center">
                                    <motion.div animate={isMobile ? { y: state.boatPos === 'left' ? '-35%' : '35%' } : { x: state.boatPos === 'left' ? '-35%' : '35%' }}
                                                transition={{ type: "spring", stiffness: 70, damping: 18 }}
                                                className="absolute w-40 h-14 bg-neutral-800 border border-neutral-600 rounded-2xl flex items-center justify-center gap-2 shadow-2xl z-30"
                                    >
                                        {state.boatLoad.map((type, i) => (
                                            <button key={`boat-p-${i}`} onClick={() => unloadBoat(i)} className="p-1.5 bg-black/40 rounded-full">
                                                {type === 'monk' ? <User className="text-orange-400" size={18} fill="currentColor"/> : <Ghost className="text-red-500" size={18} fill="currentColor"/>}
                                            </button>
                                        ))}
                                    </motion.div>
                                </div>
                                <button onClick={moveBoat} disabled={isSolving || status !== 'playing' || state.boatLoad.length === 0}
                                        className="relative lg:absolute lg:bottom-4 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg z-40 text-sm whitespace-nowrap active:scale-95"
                                >
                                    {isMobile ? (state.boatPos === 'left' ? 'Move Down ↓' : 'Move Up ↑') : (state.boatPos === 'left' ? 'Row Right →' : '← Row Left')}
                                </button>
                            </div>

                            {/* RIGHT BANK */}
                            <div className={`flex-1 lg:flex-none lg:w-[30%] lg:h-[85%] bg-neutral-800/80 rounded-2xl lg:rounded-tl-[3rem] border border-neutral-700/50 relative flex flex-col justify-end p-4 pt-12 gap-4 backdrop-blur-sm transition-colors duration-500 z-10 ${rightLost ? 'bg-red-950/40 border-red-500/50' : ''}`}>
                                <span className="absolute top-4 right-4 font-bold text-neutral-500 text-xs uppercase tracking-widest z-10">Right Bank</span>
                                <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col justify-end">
                                    <div className="grid grid-cols-3 gap-3 w-full max-w-[14rem] mx-auto">
                                        <AnimatePresence mode='popLayout'>
                                            {Array.from({ length: mRightGround }).map((_, i) => (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={`mr-${i}`}>
                                                    {rightLost ? <div className="w-full aspect-square bg-red-900/50 rounded-xl flex items-center justify-center border border-red-500/50"><Skull className="text-red-400" size={24} /></div> :
                                                        <button onClick={() => handleCharClick('monk', 'right')} disabled={isSolving} className="w-full aspect-square bg-orange-900/30 hover:bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30"><User className="text-orange-400" size={24} fill="currentColor"/></button>}
                                                </motion.div>
                                            ))}
                                            {Array.from({ length: dRightGround }).map((_, i) => (
                                                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} key={`dr-${i}`} onClick={() => handleCharClick('demon', 'right')} disabled={isSolving}
                                                               className={`w-full aspect-square rounded-xl flex items-center justify-center border ${rightLost ? 'bg-red-600 border-red-400' : 'bg-red-900/30 border-red-500/30'}`}
                                                >
                                                    <Ghost className={rightLost ? 'text-black' : 'text-red-500'} size={24} fill="currentColor" />
                                                </motion.button>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="lg:col-span-4 order-2 lg:order-1 space-y-6">
                    <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-xl">
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                            <Ghost className="text-orange-500" fill="currentColor" size={32} /> Monks & Demons
                        </h1>
                        <p className="text-neutral-400 text-sm">Constraint: Demons cannot outnumber Monks on either bank (including those on the boat).</p>
                    </div>

                    <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-4">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                                <div className="text-neutral-400 text-xs uppercase font-bold mb-1">Moves</div>
                                <div className="text-2xl font-mono text-white">{movesCount}</div>
                            </div>
                            <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                                <div className="text-neutral-400 text-xs uppercase font-bold mb-1">Optimal</div>
                                <div className="text-2xl font-mono text-orange-500/80">11</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={runAISolver} disabled={isSolving || status === 'won'} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                {isSolving ? 'Solving...' : 'AI Solve'} <Play size={18} fill="currentColor" />
                            </button>
                            <button onClick={resetGame} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 p-4 rounded-xl"><RefreshCcw size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}