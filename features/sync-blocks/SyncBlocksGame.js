"use client";

import { BackIcon } from "@/components";
import { useCallback, useEffect, useRef, useState } from "react";

const GRID_NUM = 12
const MOVE_DURATION = 180
const RESULT_DURATION = 650

const LEVELS = [
    {
        name: "双星启航",
        source: [[3, 2], [8, 2]],
        bombs: [],
        barriers: [[3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5]],
        destination: [[3, 8], [8, 8]],
    },
    {
        name: "三点校准",
        source: [[2, 2], [8, 2], [5, 7]],
        bombs: [[5, 5], [6, 5]],
        barriers: [[4, 3], [7, 3], [4, 7], [7, 7], [3, 5], [8, 5]],
        destination: [[2, 8], [7, 8], [5, 3]],
    },
    {
        name: "四点校准",
        source: [[1, 1], [10, 1], [1, 10], [10, 10]],
        bombs: [[5, 5], [6, 5], [5, 6], [6, 6]],
        barriers: [[4, 0], [4, 1], [4, 2], [7, 9], [7, 10], [7, 11], [0, 4], [1, 4], [2, 4], [9, 7], [10, 7], [11, 7], [5, 3], [6, 8]],
        destination: [[2, 3], [8, 2], [3, 9], [9, 8]],
    },
    {
        name: "整列迁移",
        source: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10], [0, 11], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11]],
        bombs: [],
        barriers: [[5, 5], [5, 6], [6, 5], [6, 6]],
        destination: [[10, 0], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9], [10, 10], [10, 11], [11, 0], [11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6], [11, 7], [11, 8], [11, 9], [11, 10], [11, 11]],
    },
    {
        name: "双锁预演",
        source: [[1, 2], [7, 10], [8, 4]],
        bombs: [[5, 5], [6, 6], [5, 6], [6, 5], [2, 9]],
        barriers: [[1, 6], [2, 6], [3, 6], [8, 6], [9, 6], [10, 6], [6, 1], [6, 2], [6, 3], [6, 8], [6, 9], [6, 10], [4, 4], [7, 7], [4, 7], [7, 4]],
        destination: [[3, 3], [3, 8], [8, 8]],
    },
    {
        name: "炸弹门廊",
        source: [[1, 1], [9, 4], [5, 9]],
        bombs: [[5, 4], [6, 4], [5, 7], [6, 7]],
        barriers: [[3, 3], [4, 3], [7, 3], [8, 3], [3, 8], [4, 8], [7, 8], [8, 8], [3, 4], [3, 5], [3, 6], [3, 7], [8, 4], [8, 5], [8, 6], [8, 7]],
        destination: [[2, 10], [6, 1], [10, 10]],
    },
    {
        name: "中庭",
        source: [[1, 10], [10, 1], [10, 10]],
        bombs: [[5, 5], [6, 5], [5, 6], [6, 6]],
        barriers: [[3, 3], [4, 3], [7, 3], [8, 3], [3, 8], [4, 8], [7, 8], [8, 8], [3, 4], [3, 7], [8, 4], [8, 7], [4, 5], [7, 6]],
        destination: [[1, 1], [5, 8], [10, 6]],
    },
    {
        name: "双锁终局",
        source: [[0, 9], [1, 2], [7, 10], [8, 4]],
        bombs: [[5, 5], [6, 6], [5, 6], [6, 5], [2, 9]],
        barriers: [[1, 6], [2, 6], [3, 6], [8, 6], [9, 6], [10, 6], [6, 1], [6, 2], [6, 3], [6, 8], [6, 9], [6, 10], [4, 4], [7, 7], [4, 7], [7, 4]],
        destination: [[3, 3], [8, 3], [3, 8], [8, 8]],
    },
    {
        name: "双门终局",
        source: [[2, 8], [5, 2], [9, 9]],
        bombs: [[6, 5], [5, 6]],
        barriers: [[4, 1], [4, 2], [4, 3], [4, 8], [4, 9], [4, 10], [8, 1], [8, 2], [8, 3], [8, 8], [8, 9], [8, 10]],
        destination: [[1, 3], [6, 8], [10, 3]],
    },
]

function gridKey(grid) {
    return `${grid[0]},${grid[1]}`
}

function sortGrids(grids) {
    return [...grids].sort((a, b) => a[0] - b[0] || a[1] - b[1])
}

function sameGrids(a, b) {
    const left = sortGrids(a).map(gridKey).join("|")
    const right = sortGrids(b).map(gridKey).join("|")
    return left === right
}

function createCellSet(grids) {
    return new Set(grids.map(gridKey))
}

function createSourcePieces(grids) {
    return grids.map((grid, index) => ({
        id: index,
        grid: [...grid],
    }))
}

function sourcePieceGrids(sourcePieces) {
    return sourcePieces.map((piece) => piece.grid)
}

function getMatchedGoalKeys(sourceGrids, destination) {
    const destinationSet = createCellSet(destination)
    return sourceGrids.map(gridKey).filter((key) => destinationSet.has(key))
}

function getOrderedSourcePieces(sourcePieces, action) {
    const next = sourcePieces.map((piece) => ({
        id: piece.id,
        grid: [...piece.grid],
    }))
    if (action === "up") {
        return next.sort((a, b) => a.grid[1] - b.grid[1])
    }
    if (action === "down") {
        return next.sort((a, b) => b.grid[1] - a.grid[1])
    }
    if (action === "left") {
        return next.sort((a, b) => a.grid[0] - b.grid[0])
    }
    return next.sort((a, b) => b.grid[0] - a.grid[0])
}

function nextGrid(grid, action) {
    const [x, y] = grid
    if (action === "up") {
        return [x, y - 1]
    }
    if (action === "down") {
        return [x, y + 1]
    }
    if (action === "left") {
        return [x - 1, y]
    }
    return [x + 1, y]
}

function isInsideBoard(grid) {
    return grid[0] >= 0 && grid[0] < GRID_NUM && grid[1] >= 0 && grid[1] < GRID_NUM
}

function moveSourcePieces(sourcePieces, level, action) {
    const ordered = getOrderedSourcePieces(sourcePieces, action)
    const barriers = createCellSet(level.barriers)
    const bombs = createCellSet(level.bombs)
    let failed = false
    let blocked = false
    const hitBombKeys = []

    for (let i = 0; i < ordered.length; i += 1) {
        const candidate = nextGrid(ordered[i].grid, action)
        if (!isInsideBoard(candidate)) {
            blocked = true
            continue
        }

        if (bombs.has(gridKey(candidate))) {
            ordered[i].grid = candidate
            failed = true
            hitBombKeys.push(gridKey(candidate))
            continue
        }

        const occupiedByMoved = createCellSet(ordered.slice(0, i).map((piece) => piece.grid))
        if (!barriers.has(gridKey(candidate)) && !occupiedByMoved.has(gridKey(candidate))) {
            ordered[i].grid = candidate
        }
        else if (barriers.has(gridKey(candidate))) {
            blocked = true
        }
    }

    return {
        sourcePieces: [...ordered].sort((a, b) => a.id - b.id),
        failed,
        blocked,
        hitBombKeys,
    }
}

function ArrowIcon({ direction }) {
    const rotation = {
        up: "rotate(0deg)",
        right: "rotate(90deg)",
        down: "rotate(180deg)",
        left: "rotate(270deg)",
    }[direction]

    return (
        <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" style={{ transform: rotation }}>
            <path d="M12 4 5 11h4v8h6v-8h4L12 4Z" fill="currentColor" />
        </svg>
    )
}

function ResetIcon() {
    return (
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M12 5a7 7 0 1 1-6.19 3.74l-2.2.57A9.01 9.01 0 1 0 12 3V1L7.8 4.25 12 7.5V5Z" fill="currentColor" />
        </svg>
    )
}

function BombIcon() {
    return (
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 64 64">
            <g transform="translate(32 36)">
                <circle cx="0" cy="0" r="19" fill="#1E293B" />
                <circle cx="-6" cy="-6" r="5" fill="#334155" />
                <line x1="8" y1="-19" x2="14" y2="-28" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="14" cy="-28" r="2.5" fill="#F59E0B">
                    <animate attributeName="r" values="2.5;3.5;2.5" dur="600ms" repeatCount="indefinite" />
                    <animate attributeName="fill" values="#F59E0B;#FCD34D;#F59E0B" dur="600ms" repeatCount="indefinite" />
                </circle>
                <line x1="14" y1="-28" x2="18" y2="-34" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" opacity=".8">
                    <animate attributeName="opacity" values=".8;1;.8" dur="600ms" repeatCount="indefinite" />
                    <animate attributeName="y2" values="-34;-37;-34" dur="600ms" repeatCount="indefinite" />
                </line>
            </g>
        </svg>
    )
}

function PlayerIcon({ matched = false }) {
    return (
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="22" fill="#34D399" />
            {matched && (
                <path d="M21 32 29 40 44 24" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            )}
        </svg>
    )
}

function GoalIcon({ matched = false }) {
    return (
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 64 64">
            {matched && <circle cx="32" cy="32" r="18" fill="#34D399" opacity=".16" />}
            <circle cx="32" cy="32" r="18" fill="none" stroke="#34D399" strokeWidth="6" />
        </svg>
    )
}

function WallIcon() {
    return (
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="22" fill="#64748B" />
        </svg>
    )
}

function createTone(audioContext, { frequency, endFrequency, duration, gain = 0.08, type = "sine", start = 0 }) {
    const now = audioContext.currentTime + start
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, now)
    if (endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration)
    }

    gainNode.gain.setValueAtTime(0.001, now)
    gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.015)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + duration + 0.03)
}

function createGameAudio() {
    if (typeof window === "undefined") {
        return null
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) {
        return null
    }

    return new AudioContext()
}

function ControlButton({ direction, onClick, active = false }) {
    return (
        <button
            type="button"
            title={direction}
            onClick={onClick}
            className={`flex h-[68px] w-[68px] items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_9px_18px_rgba(15,23,42,.10)] transition hover:bg-white active:scale-95 sm:h-[56px] sm:w-[56px] ${active ? "scale-95 bg-white text-emerald-600 shadow-[inset_0_2px_5px_rgba(15,23,42,.08)]" : ""}`}
        >
            <ArrowIcon direction={direction} />
        </button>
    )
}

function ActionButton({ title, onClick, active = false, variant = "default", children }) {
    const variantClass = variant === "primary"
        ? "border-emerald-200 bg-emerald-300 text-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_12px_22px_rgba(16,185,129,.20)] hover:bg-emerald-200"
        : "border-slate-200 bg-slate-100 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,.90),0_10px_18px_rgba(15,23,42,.10)] hover:bg-white"
    const sizeClass = variant === "primary"
        ? "h-[62px] w-[62px] rounded-full sm:h-[54px] sm:w-[54px]"
        : "h-[36px] min-w-[72px] rounded-full px-4 text-[12px] font-black sm:h-[34px] sm:min-w-[64px]"

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`flex items-center justify-center border transition active:scale-95 ${sizeClass} ${variantClass} ${active ? "scale-95 brightness-95" : ""}`}
        >
            {children}
        </button>
    )
}

function LevelClearCelebration({ onDismiss, onNextLevel }) {
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
            <div className="level-clear-aura absolute h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
            <div className="level-clear-card relative flex flex-col items-center rounded-[28px] border border-white/80 bg-white/90 px-8 py-7 text-center shadow-[0_26px_70px_rgba(15,23,42,.16)] backdrop-blur-xl">
                <button
                    type="button"
                    title="关闭"
                    onClick={onDismiss}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 active:scale-95"
                >
                    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                    </svg>
                </button>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-white shadow-[0_16px_36px_rgba(52,211,153,.36)]">
                    <svg aria-hidden="true" className="h-8 w-8" viewBox="0 0 24 24">
                        <path d="M5 12.5 9.5 17 19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="text-3xl font-black tracking-normal text-slate-950">你已通关</div>
                <div className="mt-2 text-sm font-bold text-slate-500">可以继续观察棋盘，或进入下一关</div>
                <button
                    type="button"
                    onClick={onNextLevel}
                    className="mt-6 rounded-full bg-emerald-400 px-8 py-3 text-base font-black text-emerald-950 shadow-[0_16px_34px_rgba(52,211,153,.28)] transition hover:bg-emerald-300 active:scale-95"
                >
                    开启下一关
                </button>
            </div>
            {Array.from({ length: 12 }).map((_, index) => (
                <span key={index} className={`level-clear-spark level-clear-spark-${index + 1}`} />
            ))}
        </div>
    )
}

function BoardPiece({ grid, children, className = "", motion = false }) {
    return (
        <div
            className="absolute z-10 flex items-center justify-center"
            style={{
                left: `${(grid[0] / GRID_NUM) * 100}%`,
                top: `${(grid[1] / GRID_NUM) * 100}%`,
                width: `${100 / GRID_NUM}%`,
                height: `${100 / GRID_NUM}%`,
                transition: motion ? "left 180ms cubic-bezier(.2,.9,.2,1), top 180ms cubic-bezier(.2,.9,.2,1)" : undefined,
            }}
        >
            <div className={`h-full w-full ${className}`}>
                {children}
            </div>
        </div>
    )
}

export default function TvGame({ handleBack }) {
    const [levelIndex, setLevelIndex] = useState(0)
    const [sourcePieces, setSourcePieces] = useState(createSourcePieces(LEVELS[0].source))
    const [moves, setMoves] = useState(0)
    const [status, setStatus] = useState("playing")
    const [pendingStatus, setPendingStatus] = useState(null)
    const [hitBombKeys, setHitBombKeys] = useState([])
    const [pendingMergeKeys, setPendingMergeKeys] = useState([])
    const [mergeKeys, setMergeKeys] = useState([])
    const [activeControl, setActiveControl] = useState(null)
    const [isClearCelebrationHidden, setIsClearCelebrationHidden] = useState(false)
    const audioContextRef = useRef(null)
    const controlFeedbackTimerRef = useRef(null)
    const level = LEVELS[levelIndex]

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = createGameAudio()
        }

        if (audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume()
        }

        return audioContextRef.current
    }, [])

    const playSound = useCallback((sound) => {
        const audioContext = getAudioContext()
        if (!audioContext) {
            return
        }

        if (sound === "merge") {
            createTone(audioContext, { frequency: 420, endFrequency: 720, duration: 0.16, gain: 0.055, type: "sine" })
            createTone(audioContext, { frequency: 720, endFrequency: 1080, duration: 0.18, gain: 0.045, type: "triangle", start: 0.08 })
        }
        else if (sound === "win") {
            createTone(audioContext, { frequency: 392, endFrequency: 588, duration: 0.22, gain: 0.06, type: "sine" })
            createTone(audioContext, { frequency: 523, endFrequency: 784, duration: 0.24, gain: 0.055, type: "triangle", start: 0.08 })
            createTone(audioContext, { frequency: 659, endFrequency: 988, duration: 0.28, gain: 0.05, type: "sine", start: 0.18 })
            createTone(audioContext, { frequency: 1046, endFrequency: 1318, duration: 0.18, gain: 0.035, type: "triangle", start: 0.36 })
        }
        else if (sound === "explode") {
            createTone(audioContext, { frequency: 140, endFrequency: 38, duration: 0.38, gain: 0.12, type: "sawtooth" })
            createTone(audioContext, { frequency: 260, endFrequency: 60, duration: 0.22, gain: 0.09, type: "square", start: 0.02 })
            createTone(audioContext, { frequency: 480, endFrequency: 90, duration: 0.14, gain: 0.055, type: "triangle", start: 0.01 })
        }
        else if (sound === "blocked") {
            createTone(audioContext, { frequency: 95, endFrequency: 62, duration: 0.11, gain: 0.075, type: "triangle" })
        }
        else if (sound === "press") {
            createTone(audioContext, { frequency: 520, endFrequency: 390, duration: 0.055, gain: 0.03, type: "triangle" })
        }
    }, [getAudioContext])

    const triggerControlFeedback = useCallback((control) => {
        setActiveControl(control)
        if (controlFeedbackTimerRef.current) {
            clearTimeout(controlFeedbackTimerRef.current)
        }

        controlFeedbackTimerRef.current = setTimeout(() => {
            setActiveControl(null)
        }, 120)
    }, [])

    const resetLevel = useCallback((nextIndex = levelIndex) => {
        setLevelIndex(nextIndex)
        setSourcePieces(createSourcePieces(LEVELS[nextIndex].source))
        setMoves(0)
        setStatus("playing")
        setPendingStatus(null)
        setHitBombKeys([])
        setPendingMergeKeys([])
        setMergeKeys([])
        setIsClearCelebrationHidden(false)
    }, [levelIndex])

    const handleReset = useCallback(() => {
        triggerControlFeedback("reset")
        playSound("press")
        resetLevel()
    }, [playSound, resetLevel, triggerControlFeedback])

    const handlePrevLevel = useCallback(() => {
        triggerControlFeedback("prev")
        playSound("press")
        resetLevel(levelIndex === 0 ? LEVELS.length - 1 : levelIndex - 1)
    }, [levelIndex, playSound, resetLevel, triggerControlFeedback])

    const handleNextLevel = useCallback(() => {
        triggerControlFeedback("next")
        playSound("press")
        resetLevel(levelIndex === LEVELS.length - 1 ? 0 : levelIndex + 1)
    }, [levelIndex, playSound, resetLevel, triggerControlFeedback])

    const goNextLevel = useCallback(() => {
        if (levelIndex === LEVELS.length - 1) {
            resetLevel(0)
        }
        else {
            resetLevel(levelIndex + 1)
        }
    }, [levelIndex, resetLevel])

    function handleMove(action) {
        if (status !== "playing") {
            return
        }

        triggerControlFeedback(action)
        playSound("press")
        const previousMatchedKeys = getMatchedGoalKeys(sourcePieceGrids(sourcePieces), level.destination)
        const next = moveSourcePieces(sourcePieces, level, action)
        const nextSourceGrids = sourcePieceGrids(next.sourcePieces)
        const nextMatchedKeys = getMatchedGoalKeys(nextSourceGrids, level.destination)
        const newMatchedKeys = nextMatchedKeys.filter((key) => !previousMatchedKeys.includes(key))
        setSourcePieces(next.sourcePieces)
        setMoves((current) => current + 1)
        setStatus("moving")

        if (next.failed) {
            setHitBombKeys(next.hitBombKeys)
            setPendingMergeKeys([])
            setPendingStatus("failed")
        }
        else if (sameGrids(nextSourceGrids, level.destination)) {
            setIsClearCelebrationHidden(false)
            setPendingMergeKeys(nextMatchedKeys)
            setPendingStatus("win")
        }
        else {
            if (next.blocked) {
                playSound("blocked")
            }
            setPendingMergeKeys(newMatchedKeys)
            setPendingStatus("playing")
        }
    }

    useEffect(() => {
        function handleKeyDown(event) {
            const keyMap = {
                ArrowUp: "up",
                ArrowDown: "down",
                ArrowLeft: "left",
                ArrowRight: "right",
                w: "up",
                s: "down",
                a: "left",
                d: "right",
            }
            const action = keyMap[event.key]
            if (action) {
                event.preventDefault()
                handleMove(action)
            }
            else if (event.key === "r" || event.key === "R") {
                handleReset()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    })

    useEffect(() => {
        if (status !== "moving") {
            return
        }

        const timer = setTimeout(() => {
            setMergeKeys(pendingMergeKeys)
            setStatus(pendingStatus || "playing")
            if (pendingStatus === "win") {
                playSound("win")
            }
            else if (pendingMergeKeys.length > 0) {
                playSound("merge")
            }
            else if (pendingStatus === "failed") {
                playSound("explode")
            }
            setPendingStatus(null)
            setPendingMergeKeys([])
            if (pendingStatus !== "failed") {
                setHitBombKeys([])
            }
        }, MOVE_DURATION)

        return () => clearTimeout(timer)
    }, [pendingMergeKeys, pendingStatus, playSound, status])

    useEffect(() => {
        if (mergeKeys.length === 0 || status === "win") {
            return
        }

        const timer = setTimeout(() => {
            setMergeKeys([])
        }, RESULT_DURATION)

        return () => clearTimeout(timer)
    }, [mergeKeys, status])

    useEffect(() => {
        if (status !== "failed") {
            return
        }

        const timer = setTimeout(() => {
            resetLevel()
        }, RESULT_DURATION)

        return () => clearTimeout(timer)
    }, [resetLevel, status])

    useEffect(() => {
        return () => {
            if (controlFeedbackTimerRef.current) {
                clearTimeout(controlFeedbackTimerRef.current)
            }
        }
    }, [])

    const boardBackground = {
        backgroundImage: "linear-gradient(180deg, #FFFFFF, #F8FAFC)",
    }
    const statusLabel = status === "win" ? "已同步" : status === "failed" ? "爆炸" : "进行中"
    const statusTextClass = status === "win"
        ? "text-sky-600"
        : status === "failed"
            ? "text-rose-600"
            : "text-emerald-600"
    const matchedGoalKeys = getMatchedGoalKeys(sourcePieceGrids(sourcePieces), level.destination)
    const playSurfaceWidthClass = "w-[min(94vw,calc(100dvh-360px),680px)] sm:w-[min(82vw,calc(100dvh-300px),580px)]"

    return (
        <div className="relative h-full w-full overflow-hidden bg-[#F3F6FA] text-slate-950">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,.9),rgba(243,246,250,0)_50%)]" />
            </div>

            <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-3 sm:px-6">
                <header className="grid shrink-0 grid-cols-[3rem_1fr_3rem] items-center">
                    <button type="button" onClick={handleBack} title="返回" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,.10)] active:scale-95">
                        <BackIcon className="h-5 w-5 fill-current" />
                    </button>
                    <div className="min-w-0 px-4 text-center">
                        <h1 className="truncate text-2xl font-black tracking-normal text-slate-950 sm:text-3xl">{level.name}</h1>
                        <p className="mt-1 whitespace-nowrap text-[10px] font-black uppercase tracking-[.08em] text-slate-500 sm:tracking-[.18em]">
                            LEVEL {String(levelIndex + 1).padStart(2, "0")} / {LEVELS.length} · MOVES {moves} · <span className={statusTextClass}>{statusLabel}</span>
                        </p>
                    </div>
                    <div />
                </header>

                <main className="relative flex flex-1 flex-col items-center justify-start gap-4 overflow-hidden pb-4 pt-3 sm:justify-center sm:pb-2 sm:pt-3">
                    <section className={`relative mt-16 sm:mt-0 ${playSurfaceWidthClass}`}>
                        <div className="relative aspect-square w-full overflow-hidden border border-slate-200 bg-white shadow-[0_22px_54px_rgba(15,23,42,.10)]" style={boardBackground}>
                                <div
                                    className="absolute inset-0 z-0 opacity-100"
                                    style={{
                                        backgroundImage: "linear-gradient(rgba(15,23,42,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.12) 1px, transparent 1px)",
                                        backgroundSize: `${100 / GRID_NUM}% ${100 / GRID_NUM}%`,
                                    }}
                                />
                                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.45),transparent_48%)]" />
                                {level.destination.map((grid) => (
                                    <BoardPiece key={`destination-${gridKey(grid)}`} grid={grid} className={`goal-piece p-0.5 ${mergeKeys.includes(gridKey(grid)) ? "goal-merge" : ""}`}>
                                        <GoalIcon matched={matchedGoalKeys.includes(gridKey(grid))} />
                                    </BoardPiece>
                                ))}
                                {level.bombs.map((grid) => (
                                    <BoardPiece key={`bomb-${gridKey(grid)}`} grid={grid} className={`bomb-piece p-0.5 ${status === "failed" && hitBombKeys.includes(gridKey(grid)) ? "bomb-explode" : ""}`}>
                                        <BombIcon />
                                    </BoardPiece>
                                ))}
                                {level.barriers.map((grid) => (
                                    <BoardPiece key={`barrier-${gridKey(grid)}`} grid={grid} className="p-0">
                                        <WallIcon />
                                    </BoardPiece>
                                ))}
                                {sourcePieces.map((piece) => (
                                    <BoardPiece key={`source-${piece.id}`} grid={piece.grid} motion className={`source-piece p-0.5 ${matchedGoalKeys.includes(gridKey(piece.grid)) ? "source-complete" : ""} ${status === "failed" && hitBombKeys.includes(gridKey(piece.grid)) ? "source-blasted" : ""} ${mergeKeys.includes(gridKey(piece.grid)) ? (status === "win" ? "source-merge" : "source-touch") : ""}`}>
                                        <PlayerIcon matched={matchedGoalKeys.includes(gridKey(piece.grid))} />
                                    </BoardPiece>
                                ))}
                        </div>
                    </section>

                    {status === "win" && !isClearCelebrationHidden && (
                        <LevelClearCelebration
                            onDismiss={() => setIsClearCelebrationHidden(true)}
                            onNextLevel={goNextLevel}
                        />
                    )}

                    <section className={`mt-auto flex shrink-0 items-center justify-between gap-[14px] rounded-[24px] border border-slate-200 bg-white px-[10px] py-[6px] shadow-[0_18px_42px_rgba(15,23,42,.10)] min-[520px]:gap-[16px] sm:mt-0 sm:rounded-[28px] sm:gap-[16px] sm:px-[14px] sm:py-[8px] ${playSurfaceWidthClass}`}>
                        <div className="relative h-[174px] w-[174px] shrink-0 sm:h-[144px] sm:w-[144px]">
                            <div className="absolute left-1/2 top-0 -translate-x-1/2">
                                <ControlButton direction="up" active={activeControl === "up"} onClick={() => handleMove("up")} />
                            </div>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                                <ControlButton direction="left" active={activeControl === "left"} onClick={() => handleMove("left")} />
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                <ControlButton direction="right" active={activeControl === "right"} onClick={() => handleMove("right")} />
                            </div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                                <ControlButton direction="down" active={activeControl === "down"} onClick={() => handleMove("down")} />
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-center justify-center gap-[8px] min-[780px]:flex-row min-[780px]:gap-[10px]">
                            <ActionButton title="重置" onClick={handleReset} active={activeControl === "reset"} variant="primary">
                                <ResetIcon />
                            </ActionButton>
                            <div className="flex flex-col gap-[8px] min-[780px]:flex-row min-[780px]:gap-[10px]">
                                <ActionButton title="上一关" onClick={handlePrevLevel} active={activeControl === "prev"}>
                                    上关
                                </ActionButton>
                                <ActionButton title="下一关" onClick={handleNextLevel} active={activeControl === "next"}>
                                    下关
                                </ActionButton>
                            </div>
                        </div>
                    </section>
                </main>
                <style jsx global>{`
                    .source-piece,
                    .goal-piece,
                    .bomb-piece {
                        transform-origin: center;
                    }

                    .source-complete {
                        filter: drop-shadow(0 0 10px rgba(52, 211, 153, .36));
                    }

                    .source-blasted {
                        animation: source-blasted 650ms cubic-bezier(.2,.9,.2,1) both;
                    }

                    .bomb-explode {
                        animation: bomb-explode 650ms cubic-bezier(.2,.9,.2,1) both;
                    }

                    .source-merge {
                        animation: source-merge 650ms cubic-bezier(.2,.9,.2,1) both;
                    }

                    .source-touch {
                        animation: source-touch 520ms cubic-bezier(.2,.9,.2,1) both;
                    }

                    .goal-merge {
                        animation: goal-merge 650ms cubic-bezier(.2,.9,.2,1) both;
                    }

                    .level-clear-card {
                        animation: level-clear-card 900ms cubic-bezier(.18,.9,.2,1) both;
                    }

                    .level-clear-aura {
                        animation: level-clear-aura 1000ms cubic-bezier(.18,.9,.2,1) both;
                    }

                    .level-clear-spark {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        width: 9px;
                        height: 9px;
                        border-radius: 999px;
                        background: #34D399;
                        box-shadow: 0 0 18px rgba(52, 211, 153, .5);
                        animation: level-clear-spark 980ms cubic-bezier(.16,.9,.25,1) both;
                        animation-delay: var(--spark-delay);
                    }

                    .level-clear-spark-1 { --spark-x: -132px; --spark-y: -96px; --spark-delay: 0ms; background: #38BDF8; }
                    .level-clear-spark-2 { --spark-x: -86px; --spark-y: -148px; --spark-delay: 35ms; }
                    .level-clear-spark-3 { --spark-x: 4px; --spark-y: -168px; --spark-delay: 70ms; background: #A78BFA; }
                    .level-clear-spark-4 { --spark-x: 92px; --spark-y: -132px; --spark-delay: 100ms; }
                    .level-clear-spark-5 { --spark-x: 144px; --spark-y: -54px; --spark-delay: 130ms; background: #38BDF8; }
                    .level-clear-spark-6 { --spark-x: 132px; --spark-y: 68px; --spark-delay: 160ms; }
                    .level-clear-spark-7 { --spark-x: 66px; --spark-y: 138px; --spark-delay: 190ms; background: #A78BFA; }
                    .level-clear-spark-8 { --spark-x: -20px; --spark-y: 156px; --spark-delay: 220ms; }
                    .level-clear-spark-9 { --spark-x: -104px; --spark-y: 116px; --spark-delay: 250ms; background: #38BDF8; }
                    .level-clear-spark-10 { --spark-x: -154px; --spark-y: 30px; --spark-delay: 280ms; }
                    .level-clear-spark-11 { --spark-x: 52px; --spark-y: -92px; --spark-delay: 310ms; background: #A78BFA; }
                    .level-clear-spark-12 { --spark-x: -58px; --spark-y: 72px; --spark-delay: 340ms; }

                    @keyframes source-blasted {
                        0% { transform: scale(1); opacity: 1; filter: none; }
                        18% { transform: scale(1.35); opacity: 1; filter: brightness(2) saturate(0); }
                        45% { transform: scale(.55); opacity: .7; filter: brightness(1.5); }
                        100% { transform: scale(.06); opacity: 0; filter: brightness(1); }
                    }

                    @keyframes bomb-explode {
                        0% { transform: scale(1); filter: none; }
                        20% { transform: scale(1.45); filter: brightness(2.2) saturate(0); }
                        42% { transform: scale(.85); filter: brightness(1.4); }
                        65% { transform: scale(1.12); filter: brightness(1.1); }
                        100% { transform: scale(1); filter: none; }
                    }

                    @keyframes source-merge {
                        0% { transform: scale(1); opacity: 1; }
                        38% { transform: scale(1.28); opacity: 1; filter: drop-shadow(0 0 16px rgba(52, 211, 153, .5)); }
                        100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 10px rgba(52, 211, 153, .36)); }
                    }

                    @keyframes source-touch {
                        0% { transform: scale(1); }
                        38% { transform: scale(1.18); }
                        100% { transform: scale(1); }
                    }

                    @keyframes goal-merge {
                        0% { transform: scale(1); opacity: 1; }
                        44% { transform: scale(1.42); opacity: .85; }
                        100% { transform: scale(1); opacity: 1; }
                    }

                    @keyframes level-clear-card {
                        0% { transform: translateY(14px) scale(.88); opacity: 0; }
                        28% { transform: translateY(0) scale(1.04); opacity: 1; }
                        100% { transform: translateY(0) scale(1); opacity: 1; }
                    }

                    @keyframes level-clear-aura {
                        0% { transform: scale(.36); opacity: 0; }
                        35% { transform: scale(1); opacity: 1; }
                        100% { transform: scale(1.18); opacity: .75; }
                    }

                    @keyframes level-clear-spark {
                        0% {
                            transform: translate(-50%, -50%) scale(.3);
                            opacity: 0;
                        }
                        18% {
                            opacity: 1;
                        }
                        100% {
                            transform: translate(calc(-50% + var(--spark-x)), calc(-50% + var(--spark-y))) scale(.95);
                            opacity: 0;
                        }
                    }
                `}</style>
            </div>
        </div>
    )
}
