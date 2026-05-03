"use client";

import { BackIcon } from "@/components";
import { useLocalStorage } from "@/utils/hooks";
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

function ModeIcon() {
    return (
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M4 7.5A3.5 3.5 0 0 1 7.5 4H16a4 4 0 0 1 0 8H8a2 2 0 0 0 0 4h8.1l-2.05-2.05L16 12l5.4 5.4L16 22l-1.95-1.95L16.1 18H8a4 4 0 0 1 0-8h8a2 2 0 0 0 0-4H7.5A1.5 1.5 0 0 0 6 7.5V9H4V7.5Z" fill="currentColor" />
        </svg>
    )
}

function BombIcon() {
    return (
        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 64 64">
            <g transform="translate(32 36)">
                {/* Body glow halo */}
                <circle cx="0" cy="0" r="22" fill="rgba(239,68,68,0)">
                    <animate attributeName="r" values="22;26;22" dur="900ms" repeatCount="indefinite" />
                    <animate attributeName="fill" values="rgba(239,68,68,0);rgba(239,68,68,.12);rgba(239,68,68,0)" dur="900ms" repeatCount="indefinite" />
                </circle>
                {/* Bomb body */}
                <circle cx="0" cy="0" r="19" fill="#1E293B" />
                <circle cx="-6" cy="-6" r="5" fill="#334155" />
                {/* Fuse wire */}
                <line x1="8" y1="-19" x2="14" y2="-28" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                {/* Fuse ember */}
                <circle cx="14" cy="-28" r="3">
                    <animate attributeName="r" values="2.5;4.5;2;3.5;2.5" dur="700ms" repeatCount="indefinite" />
                    <animate attributeName="fill" values="#F59E0B;#FFFFFF;#FCD34D;#EF4444;#F59E0B" dur="700ms" repeatCount="indefinite" />
                </circle>
                {/* Main flame */}
                <line x1="14" y1="-28" x2="19" y2="-36" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round">
                    <animate attributeName="y2" values="-36;-40;-33;-38;-36" dur="280ms" repeatCount="indefinite" />
                    <animate attributeName="x2" values="19;21;17;20;19" dur="320ms" repeatCount="indefinite" />
                    <animate attributeName="stroke" values="#FCD34D;#FFFFFF;#FCD34D;#F97316;#FCD34D" dur="600ms" repeatCount="indefinite" />
                </line>
                {/* Secondary wisp flame */}
                <line x1="14" y1="-29" x2="16" y2="-39" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round">
                    <animate attributeName="opacity" values=".8;.3;.9;.5;.8" dur="240ms" repeatCount="indefinite" />
                    <animate attributeName="y2" values="-39;-35;-42;-37;-39" dur="340ms" repeatCount="indefinite" />
                    <animate attributeName="x2" values="16;20;14;18;16" dur="300ms" repeatCount="indefinite" />
                </line>
                {/* Smoke wisp */}
                <circle cx="17" cy="-42" r="2" fill="rgba(148,163,184,.4)">
                    <animate attributeName="cy" values="-42;-48;-42" dur="800ms" repeatCount="indefinite" />
                    <animate attributeName="r" values="2;4;2" dur="800ms" repeatCount="indefinite" />
                    <animate attributeName="fill" values="rgba(148,163,184,.4);rgba(148,163,184,0);rgba(148,163,184,.4)" dur="800ms" repeatCount="indefinite" />
                </circle>
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

// fx/fy: board-percentage offset from bomb center (board width = 100 units)
// One cell = 100/12 ≈ 8.33 units. Chunks ~2 cells, shards ~2.5, sparks ~3+
const BLAST_FRAGMENTS = [
    // Large chunks (8) — dark green, ~1.8–2.2 cells
    { cls: 'bf-chunk', fx: -15.5, fy: -14.5, fr: '-220deg', w: '3.8%', h: '3.2%', bg: '#059669', delay: 0  },
    { cls: 'bf-chunk', fx:  16.5, fy: -12.5, fr:  '270deg', w: '3.5%', h: '3.8%', bg: '#047857', delay: 18 },
    { cls: 'bf-chunk', fx: -13.0, fy:  16.0, fr: '-165deg', w: '3.8%', h: '3.0%', bg: '#059669', delay: 8  },
    { cls: 'bf-chunk', fx:  14.5, fy:  15.5, fr:  '205deg', w: '3.5%', h: '3.5%', bg: '#065F46', delay: 24 },
    { cls: 'bf-chunk', fx:  -1.0, fy: -19.0, fr: '-310deg', w: '4.0%', h: '3.0%', bg: '#047857', delay: 6  },
    { cls: 'bf-chunk', fx:  19.5, fy:   2.0, fr:  '180deg', w: '3.2%', h: '3.8%', bg: '#059669', delay: 30 },
    { cls: 'bf-chunk', fx: -18.5, fy:  -2.5, fr: '-140deg', w: '3.6%', h: '3.2%', bg: '#065F46', delay: 14 },
    { cls: 'bf-chunk', fx:   2.5, fy:  19.5, fr:  '240deg', w: '3.4%', h: '3.6%', bg: '#047857', delay: 22 },
    // Medium shards (14) — bright green, ~2.2–2.6 cells
    { cls: 'bf-shard', fx:   0.5, fy: -21.5, fr:  '155deg', w: '2.6%', h: '1.8%', bg: '#34D399', delay: 10 },
    { cls: 'bf-shard', fx:  21.0, fy:   1.5, fr: '-315deg', w: '2.2%', h: '2.6%', bg: '#6EE7B7', delay: 5  },
    { cls: 'bf-shard', fx: -20.5, fy:   2.0, fr:  '195deg', w: '2.0%', h: '2.5%', bg: '#34D399', delay: 20 },
    { cls: 'bf-shard', fx:  -1.0, fy:  22.0, fr: '-275deg', w: '2.5%', h: '2.0%', bg: '#6EE7B7', delay: 14 },
    { cls: 'bf-shard', fx:  15.0, fy: -17.5, fr:  '135deg', w: '1.8%', h: '2.2%', bg: '#A7F3D0', delay: 30 },
    { cls: 'bf-shard', fx: -15.0, fy: -17.0, fr: '-125deg', w: '2.0%', h: '1.8%', bg: '#34D399', delay: 6  },
    { cls: 'bf-shard', fx:  17.5, fy:  14.0, fr:  '290deg', w: '2.4%', h: '1.6%', bg: '#6EE7B7', delay: 16 },
    { cls: 'bf-shard', fx: -16.5, fy:  14.5, fr: '-240deg', w: '1.6%', h: '2.4%', bg: '#34D399', delay: 35 },
    { cls: 'bf-shard', fx:   9.0, fy: -22.0, fr:  '340deg', w: '2.2%', h: '1.8%', bg: '#A7F3D0', delay: 8  },
    { cls: 'bf-shard', fx:  -9.5, fy:  21.5, fr: '-200deg', w: '1.8%', h: '2.2%', bg: '#6EE7B7', delay: 25 },
    { cls: 'bf-shard', fx:  22.0, fy: -10.0, fr:  '110deg', w: '2.0%', h: '1.6%', bg: '#34D399', delay: 12 },
    { cls: 'bf-shard', fx: -21.5, fy: -10.5, fr: '-360deg', w: '2.4%', h: '2.0%', bg: '#A7F3D0', delay: 3  },
    { cls: 'bf-shard', fx:  11.0, fy:  19.5, fr:  '420deg', w: '1.6%', h: '2.4%', bg: '#6EE7B7', delay: 42 },
    { cls: 'bf-shard', fx: -10.5, fy: -20.5, fr: '-170deg', w: '2.2%', h: '1.8%', bg: '#34D399', delay: 19 },
    // Hot sparks (20) — fire yellow/orange, ~2.8–3.5 cells, glowing dots
    { cls: 'bf-spark', fx: -26.5, fy: -11.5, fr: '-390deg', w: '1.5%', h: '1.5%', bg: '#FCD34D', delay: 0  },
    { cls: 'bf-spark', fx:  27.5, fy:  -9.5, fr:  '470deg', w: '1.3%', h: '1.3%', bg: '#F59E0B', delay: 12 },
    { cls: 'bf-spark', fx:  12.0, fy: -28.0, fr: '-430deg', w: '1.2%', h: '1.2%', bg: '#FCD34D', delay: 4  },
    { cls: 'bf-spark', fx: -12.5, fy: -27.5, fr:  '395deg', w: '1.4%', h: '1.4%', bg: '#FBBF24', delay: 22 },
    { cls: 'bf-spark', fx:  27.0, fy:  14.5, fr: '-355deg', w: '1.2%', h: '1.2%', bg: '#FCD34D', delay: 8  },
    { cls: 'bf-spark', fx: -26.0, fy:  15.5, fr:  '415deg', w: '1.4%', h: '1.4%', bg: '#F59E0B', delay: 16 },
    { cls: 'bf-spark', fx:   5.5, fy:  28.0, fr:  '375deg', w: '1.1%', h: '1.1%', bg: '#FCD34D', delay: 28 },
    { cls: 'bf-spark', fx:  -7.0, fy: -27.5, fr: '-355deg', w: '1.3%', h: '1.3%', bg: '#FBBF24', delay: 10 },
    { cls: 'bf-spark', fx:  20.0, fy: -22.0, fr:  '500deg', w: '1.0%', h: '1.0%', bg: '#FDE68A', delay: 2  },
    { cls: 'bf-spark', fx: -21.0, fy:  21.5, fr: '-480deg', w: '1.2%', h: '1.2%', bg: '#FCD34D', delay: 18 },
    { cls: 'bf-spark', fx:  29.0, fy:   3.0, fr:  '440deg', w: '1.1%', h: '1.1%', bg: '#F59E0B', delay: 6  },
    { cls: 'bf-spark', fx: -28.5, fy:  -4.5, fr: '-410deg', w: '1.3%', h: '1.3%', bg: '#FBBF24', delay: 26 },
    { cls: 'bf-spark', fx:   3.5, fy: -30.0, fr:  '360deg', w: '1.0%', h: '1.0%', bg: '#FDE68A', delay: 14 },
    { cls: 'bf-spark', fx:  -4.0, fy:  29.5, fr: '-340deg', w: '1.2%', h: '1.2%', bg: '#FCD34D', delay: 32 },
    { cls: 'bf-spark', fx:  24.0, fy:  20.0, fr:  '520deg', w: '1.0%', h: '1.0%', bg: '#F59E0B', delay: 9  },
    { cls: 'bf-spark', fx: -23.5, fy: -20.5, fr: '-500deg', w: '1.1%', h: '1.1%', bg: '#FDE68A', delay: 38 },
    { cls: 'bf-spark', fx:  15.5, fy:  25.0, fr:  '460deg', w: '0.9%', h: '0.9%', bg: '#FCD34D', delay: 5  },
    { cls: 'bf-spark', fx: -16.0, fy: -24.5, fr: '-450deg', w: '1.0%', h: '1.0%', bg: '#FBBF24', delay: 20 },
    { cls: 'bf-spark', fx:  30.0, fy: -14.0, fr:  '390deg', w: '0.9%', h: '0.9%', bg: '#FDE68A', delay: 15 },
    { cls: 'bf-spark', fx: -29.5, fy:  13.0, fr: '-370deg', w: '1.1%', h: '1.1%', bg: '#F59E0B', delay: 40 },
]

// Rendered directly in the board div at board coordinates — avoids the % unit trap
// inside tiny BoardPiece cells where translate % is relative to the fragment itself
function BoardBlast({ bombKey }) {
    const [gx, gy] = bombKey.split(',').map(Number)
    const cx = (gx + 0.5) / GRID_NUM * 100
    const cy = (gy + 0.5) / GRID_NUM * 100
    return BLAST_FRAGMENTS.map((f, i) => (
        <div
            key={i}
            className={f.cls}
            style={{
                position: 'absolute',
                zIndex: 20,
                pointerEvents: 'none',
                borderRadius: f.cls === 'bf-spark' ? '50%' : '2px',
                background: f.bg,
                boxShadow: f.cls === 'bf-spark' ? `0 0 5px ${f.bg}, 0 0 9px ${f.bg}99` : 'none',
                width: f.w,
                height: f.h,
                animationDelay: `${f.delay}ms`,
                '--sx': `${cx}%`,
                '--sy': `${cy}%`,
                '--ex': `${cx + f.fx}%`,
                '--ey': `${cy + f.fy}%`,
                '--fr': f.fr,
            }}
        />
    ))
}

function BombExplosion() {
    return (
        <>
            <div className="be-ring be-ring-1" />
            <div className="be-ring be-ring-2" />
            <div className="be-ring be-ring-3" />
            <div className="be-core" />
        </>
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

function DirectionPad({ activeControl, onMove }) {
    return (
        <div className="relative h-[174px] w-[174px] shrink-0 sm:h-[144px] sm:w-[144px]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2">
                <ControlButton direction="up" active={activeControl === "up"} onClick={() => onMove("up")} />
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <ControlButton direction="left" active={activeControl === "left"} onClick={() => onMove("left")} />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <ControlButton direction="right" active={activeControl === "right"} onClick={() => onMove("right")} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <ControlButton direction="down" active={activeControl === "down"} onClick={() => onMove("down")} />
            </div>
        </div>
    )
}

function TouchPad({ onMove }) {
    const pointerStartRef = useRef(null)
    const canvasRef = useRef(null)
    const visualRef = useRef({ x: 0.5, y: 0.5, strength: 0, angle: 0 })

    const drawTouchPad = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) {
            return
        }

        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        const width = Math.max(1, Math.round(rect.width * dpr))
        const height = Math.max(1, Math.round(rect.height * dpr))

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height
        }

        const ctx = canvas.getContext("2d")
        const visual = visualRef.current
        ctx.clearRect(0, 0, width, height)

        const cx = width / 2
        const cy = height / 2
        const baseRadius = Math.max(width, height) * 0.72
        const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius)
        base.addColorStop(0, "rgba(52, 211, 153, 0.18)")
        base.addColorStop(0.58, "rgba(56, 189, 248, 0.09)")
        base.addColorStop(1, "rgba(52, 211, 153, 0.04)")
        ctx.fillStyle = base
        ctx.fillRect(0, 0, width, height)

        if (visual.strength <= 0.01) {
            return
        }

        const px = visual.x * width
        const py = visual.y * height
        const strength = visual.strength
        const pressureRadius = Math.max(width, height) * (0.32 + strength * 0.08)

        ctx.save()
        ctx.globalCompositeOperation = "screen"
        ctx.translate(px, py)
        ctx.rotate(visual.angle)
        ctx.scale(1 + strength * 0.55, 0.88 + strength * 0.05)
        const pressure = ctx.createRadialGradient(0, 0, 0, 0, 0, pressureRadius)
        pressure.addColorStop(0, `rgba(52, 211, 153, ${0.13 + strength * 0.1})`)
        pressure.addColorStop(0.46, `rgba(56, 189, 248, ${0.06 + strength * 0.08})`)
        pressure.addColorStop(1, "rgba(52, 211, 153, 0)")
        ctx.fillStyle = pressure
        ctx.fillRect(-pressureRadius, -pressureRadius, pressureRadius * 2, pressureRadius * 2)
        ctx.restore()

        ctx.save()
        ctx.globalCompositeOperation = "multiply"
        ctx.translate(px, py)
        ctx.rotate(visual.angle)
        const dent = ctx.createRadialGradient(0, 0, 0, 0, 0, pressureRadius * 0.9)
        dent.addColorStop(0, `rgba(15, 23, 42, ${0.018 + strength * 0.018})`)
        dent.addColorStop(0.5, "rgba(15, 23, 42, 0.01)")
        dent.addColorStop(1, "rgba(15, 23, 42, 0)")
        ctx.fillStyle = dent
        ctx.fillRect(-pressureRadius, -pressureRadius, pressureRadius * 2, pressureRadius * 2)
        ctx.restore()
    }, [])

    useEffect(() => {
        drawTouchPad()
        window.addEventListener("resize", drawTouchPad)
        return () => window.removeEventListener("resize", drawTouchPad)
    }, [drawTouchPad])

    function updateTouchGlow(event) {
        const start = pointerStartRef.current
        if (!start) {
            return
        }

        const rect = event.currentTarget.getBoundingClientRect()
        const dx = event.clientX - start.x
        const dy = event.clientY - start.y
        const distance = Math.hypot(dx, dy)
        const pressure = event.pressure || 0
        visualRef.current = {
            x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
            y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
            strength: Math.min(1, Math.max(distance / Math.max(rect.width, rect.height) * 1.45, pressure)),
            angle: Math.atan2(dy, dx),
        }
        drawTouchPad()
    }

    function handlePointerDown(event) {
        const rect = event.currentTarget.getBoundingClientRect()
        pointerStartRef.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
        }
        event.currentTarget.setPointerCapture(event.pointerId)
        visualRef.current = {
            x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
            y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
            strength: Math.max(0.22, event.pressure || 0),
            angle: 0,
        }
        drawTouchPad()
    }

    function handlePointerMove(event) {
        updateTouchGlow(event)
    }

    function handlePointerUp(event) {
        const start = pointerStartRef.current
        pointerStartRef.current = null
        if (!start || start.id !== event.pointerId) {
            return
        }

        const dx = event.clientX - start.x
        const dy = event.clientY - start.y
        const absX = Math.abs(dx)
        const absY = Math.abs(dy)

        visualRef.current = { x: 0.5, y: 0.5, strength: 0, angle: 0 }
        drawTouchPad()

        if (Math.max(absX, absY) < 24) {
            return
        }

        if (absX > absY) {
            onMove(dx > 0 ? "right" : "left")
        }
        else {
            onMove(dy > 0 ? "down" : "up")
        }

    }

    function handlePointerCancel() {
        pointerStartRef.current = null
        visualRef.current = { x: 0.5, y: 0.5, strength: 0, angle: 0 }
        drawTouchPad()
    }

    return (
        <div
            role="application"
            aria-label="滑动操作区"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className="relative flex h-full w-full touch-none select-none flex-col items-center justify-center gap-2 overflow-hidden rounded-[22px] text-slate-500"
        >
            <canvas
                aria-hidden="true"
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 h-full w-full"
            />
            <div className="relative grid h-16 w-16 grid-cols-3 grid-rows-3 text-slate-400">
                <div className="col-start-2 flex items-center justify-center">
                    <ArrowIcon direction="up" />
                </div>
                <div className="col-start-1 row-start-2 flex items-center justify-center">
                    <ArrowIcon direction="left" />
                </div>
                <div className="col-start-3 row-start-2 flex items-center justify-center">
                    <ArrowIcon direction="right" />
                </div>
                <div className="col-start-2 row-start-3 flex items-center justify-center">
                    <ArrowIcon direction="down" />
                </div>
            </div>
            <div className="relative text-[11px] font-black text-slate-400">
                滑动控制
            </div>
        </div>
    )
}

function ActionButton({ title, onClick, active = false, variant = "default", children }) {
    const variantClass = variant === "primary"
        ? "border-emerald-200 bg-emerald-100 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_10px_18px_rgba(16,185,129,.12)] hover:bg-emerald-50"
        : "border-slate-200 bg-slate-100 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,.90),0_10px_18px_rgba(15,23,42,.10)] hover:bg-white"

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`flex h-[40px] w-full min-w-0 items-center justify-center rounded-full border px-1 text-[11px] font-black transition active:scale-95 sm:h-[38px] sm:text-[12px] ${variantClass} ${active ? "scale-95 brightness-95" : ""}`}
        >
            {children}
        </button>
    )
}

function FailureCard({ onRestart, moves }) {
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
            <div className="failure-aura absolute h-64 w-64 rounded-full bg-rose-300/25 blur-3xl" />
            <div className="failure-card relative flex w-[300px] flex-col items-center rounded-[28px] border border-white/80 bg-white/90 px-8 py-7 text-center shadow-[0_26px_70px_rgba(15,23,42,.16)] backdrop-blur-xl">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_16px_36px_rgba(239,68,68,.36)]">
                    <svg aria-hidden="true" className="h-8 w-8" viewBox="0 0 24 24">
                        <path d="M13 2 4.5 13.5H10L8 22l11.5-13H14L16 2Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="text-3xl font-black tracking-normal text-slate-950">失败</div>
                <div className="mt-2 text-sm font-bold text-slate-500">这次用了 {moves} 步，再试一次</div>
                <button
                    type="button"
                    onClick={onRestart}
                    className="mt-6 rounded-full bg-rose-500 px-8 py-3 text-base font-black text-white shadow-[0_16px_34px_rgba(239,68,68,.28)] transition hover:bg-rose-400 active:scale-95"
                >
                    再来一次
                </button>
            </div>
        </div>
    )
}

function LevelClearCelebration({ onDismiss, onNextLevel }) {
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
            <div className="level-clear-aura absolute h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
            <div className="level-clear-card relative flex w-[300px] flex-col items-center rounded-[28px] border border-white/80 bg-white/90 px-8 py-7 text-center shadow-[0_26px_70px_rgba(15,23,42,.16)] backdrop-blur-xl">
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

function BoardPiece({ grid, children, className = "", motion = false, zIndex = 10 }) {
    return (
        <div
            className="absolute flex items-center justify-center"
            style={{
                left: `${(grid[0] / GRID_NUM) * 100}%`,
                top: `${(grid[1] / GRID_NUM) * 100}%`,
                width: `${100 / GRID_NUM}%`,
                height: `${100 / GRID_NUM}%`,
                zIndex,
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
    const [showFailureCard, setShowFailureCard] = useState(false)
    const [controlMode, setControlMode] = useLocalStorage("sync-blocks-control-mode", "buttons")
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
            createTone(audioContext, { frequency: 420, endFrequency: 720, duration: 0.16, gain: 0.108, type: "sine" })
            createTone(audioContext, { frequency: 720, endFrequency: 1080, duration: 0.18, gain: 0.09, type: "triangle", start: 0.08 })
        }
        else if (sound === "win") {
            createTone(audioContext, { frequency: 392, endFrequency: 588, duration: 0.22, gain: 0.118, type: "sine" })
            createTone(audioContext, { frequency: 523, endFrequency: 784, duration: 0.24, gain: 0.108, type: "triangle", start: 0.08 })
            createTone(audioContext, { frequency: 659, endFrequency: 988, duration: 0.28, gain: 0.098, type: "sine", start: 0.18 })
            createTone(audioContext, { frequency: 1046, endFrequency: 1318, duration: 0.18, gain: 0.068, type: "triangle", start: 0.36 })
        }
        else if (sound === "explode") {
            createTone(audioContext, { frequency: 140, endFrequency: 38, duration: 0.38, gain: 0.055, type: "sawtooth" })
            createTone(audioContext, { frequency: 260, endFrequency: 60, duration: 0.22, gain: 0.04, type: "square", start: 0.02 })
            createTone(audioContext, { frequency: 480, endFrequency: 90, duration: 0.14, gain: 0.024, type: "triangle", start: 0.01 })
        }
        else if (sound === "blocked") {
            createTone(audioContext, { frequency: 95, endFrequency: 62, duration: 0.11, gain: 0.145, type: "triangle" })
        }
        else if (sound === "press") {
            createTone(audioContext, { frequency: 520, endFrequency: 390, duration: 0.055, gain: 0.068, type: "triangle" })
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
        setShowFailureCard(false)
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

    const toggleControlMode = useCallback(() => {
        const nextMode = controlMode === "touchpad" ? "buttons" : "touchpad"
        triggerControlFeedback("mode")
        playSound("press")
        setControlMode(nextMode)
    }, [controlMode, playSound, setControlMode, triggerControlFeedback])

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
            setShowFailureCard(true)
        }, RESULT_DURATION)

        return () => clearTimeout(timer)
    }, [status])

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
                            第 {String(levelIndex + 1).padStart(2, "0")} 关 / 共 {LEVELS.length} 关 · 步数 {moves} · <span className={statusTextClass}>{statusLabel}</span>
                        </p>
                    </div>
                    <div />
                </header>

                <main className="relative flex flex-1 flex-col items-center justify-start gap-3 overflow-hidden pb-4 pt-3 sm:justify-center sm:gap-4 sm:pb-2 sm:pt-3">
                    <section
                        className={`relative mt-12 sm:mt-0 ${playSurfaceWidthClass}${status === "failed" ? " board-shake" : ""}`}
                    >
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
                                {level.bombs.map((grid) => {
                                    const isExploding = status === "failed" && hitBombKeys.includes(gridKey(grid))
                                    return (
                                        <BoardPiece key={`bomb-${gridKey(grid)}`} grid={grid} zIndex={isExploding ? 25 : 10} className={`bomb-piece p-0.5 ${isExploding ? "bomb-explode" : ""}`}>
                                            <BombIcon />
                                            {isExploding && <BombExplosion />}
                                        </BoardPiece>
                                    )
                                })}
                                {level.barriers.map((grid) => (
                                    <BoardPiece key={`barrier-${gridKey(grid)}`} grid={grid} className="p-0">
                                        <WallIcon />
                                    </BoardPiece>
                                ))}
                                {sourcePieces.map((piece) => {
                                    const isBlasted = status === "failed" && hitBombKeys.includes(gridKey(piece.grid))
                                    return (
                                        <BoardPiece key={`source-${piece.id}`} grid={piece.grid} motion zIndex={isBlasted ? 15 : 10} className={`source-piece p-0.5 ${matchedGoalKeys.includes(gridKey(piece.grid)) ? "source-complete" : ""} ${isBlasted ? "source-blasted" : ""} ${mergeKeys.includes(gridKey(piece.grid)) ? (status === "win" ? "source-merge" : "source-touch") : ""}`}>
                                            <PlayerIcon matched={matchedGoalKeys.includes(gridKey(piece.grid))} />
                                        </BoardPiece>
                                    )
                                })}
                                {status === "failed" && hitBombKeys.map(k => (
                                    <BoardBlast key={`blast-${k}`} bombKey={k} />
                                ))}
                        </div>
                    </section>

                    {showFailureCard && (
                        <FailureCard onRestart={handleReset} moves={moves} />
                    )}

                    {status === "win" && !isClearCelebrationHidden && (
                        <LevelClearCelebration
                            onDismiss={() => setIsClearCelebrationHidden(true)}
                            onNextLevel={goNextLevel}
                        />
                    )}

                    <section className={`mt-auto flex shrink-0 flex-col gap-[8px] sm:mt-0 ${playSurfaceWidthClass}`}>
                        <div className="grid grid-cols-4 items-center gap-[8px] rounded-[20px] border border-slate-200 bg-white px-[8px] py-[7px] shadow-[0_14px_32px_rgba(15,23,42,.08)] sm:rounded-[24px]">
                            <ActionButton title={`切换为${controlMode === "touchpad" ? "按键" : "滑板"}操作`} onClick={toggleControlMode} active={activeControl === "mode"}>
                                <span className="flex items-center justify-center gap-1">
                                    <ModeIcon />
                                    {controlMode === "touchpad" ? "按键" : "滑板"}
                                </span>
                            </ActionButton>
                            <ActionButton title="上一关" onClick={handlePrevLevel} active={activeControl === "prev"}>
                                上关
                            </ActionButton>
                            <ActionButton title="下一关" onClick={handleNextLevel} active={activeControl === "next"}>
                                下关
                            </ActionButton>
                            <ActionButton title="重置" onClick={handleReset} active={activeControl === "reset"} variant="primary">
                                <ResetIcon />
                            </ActionButton>
                        </div>
                        <div className={`flex h-[190px] items-center justify-center overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,.10)] sm:h-[160px] sm:rounded-[26px] ${controlMode === "touchpad" ? "p-0" : "px-[10px] py-[8px]"}`}>
                            {controlMode === "touchpad" ? (
                                <TouchPad onMove={handleMove} />
                            ) : (
                                <DirectionPad activeControl={activeControl} onMove={handleMove} />
                            )}
                        </div>
                    </section>
                </main>
                <style jsx global>{`
                    /* ── Board shake on explosion ── */
                    .board-shake {
                        animation: board-shake 420ms cubic-bezier(.36,.07,.19,.97) both;
                    }

                    /* ── Failure card ── */
                    .failure-card {
                        animation: failure-card 600ms cubic-bezier(.18,.9,.2,1) both;
                        animation-delay: 80ms;
                    }
                    .failure-aura {
                        animation: failure-aura 700ms cubic-bezier(.18,.9,.2,1) both;
                    }

                    .source-piece,
                    .goal-piece,
                    .bomb-piece {
                        transform-origin: center;
                    }

                    /* ── Bomb idle: mechanical tick-tock with tension build ── */
                    .bomb-piece {
                        animation: bomb-idle 2.4s cubic-bezier(.36,0,.64,1) infinite;
                    }
                    .bomb-explode {
                        animation: bomb-explode 650ms cubic-bezier(.12,.9,.2,1) both;
                    }

                    /* ── Source piece states ── */
                    .source-complete {
                        filter: drop-shadow(0 0 10px rgba(52,211,153,.36));
                    }
                    .source-blasted {
                        animation: source-blasted 650ms cubic-bezier(.15,.9,.2,1) both;
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

                    /* ── Explosion rings (BombExplosion) ── */
                    .be-ring {
                        position: absolute;
                        top: 50%; left: 50%;
                        width: 100%; height: 100%;
                        border-radius: 50%;
                        background: transparent;
                        pointer-events: none;
                    }
                    .be-ring-1 {
                        border: 4px solid rgba(255,255,255,.95);
                        animation: be-ring 550ms cubic-bezier(.05,.9,.1,1) forwards;
                        animation-delay: 0ms;
                    }
                    .be-ring-2 {
                        border: 3px solid rgba(251,191,36,.85);
                        animation: be-ring 620ms cubic-bezier(.05,.9,.1,1) forwards;
                        animation-delay: 55ms;
                    }
                    .be-ring-3 {
                        border: 2px solid rgba(239,68,68,.65);
                        animation: be-ring 700ms cubic-bezier(.05,.9,.1,1) forwards;
                        animation-delay: 120ms;
                    }
                    /* Central fireball core */
                    .be-core {
                        position: absolute;
                        top: 50%; left: 50%;
                        width: 100%; height: 100%;
                        border-radius: 50%;
                        background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(253,224,71,.9) 30%, rgba(239,68,68,.6) 60%, transparent 80%);
                        pointer-events: none;
                        animation: be-core 480ms cubic-bezier(.05,.92,.1,1) forwards;
                    }

                    /* ── Fragment classes — rendered directly in board div ── */
                    /* left/top animate in board-% coords; transform handles scale+rotation */
                    .bf-chunk {
                        animation: bf-chunk 720ms cubic-bezier(.06,.88,.14,1) both;
                    }
                    .bf-shard {
                        animation: bf-shard 600ms cubic-bezier(.04,.9,.12,1) both;
                    }
                    .bf-spark {
                        animation: bf-spark 490ms cubic-bezier(.02,.96,.08,1) both;
                    }

                    /* ── Win celebration ── */
                    .level-clear-card {
                        animation: level-clear-card 900ms cubic-bezier(.18,.9,.2,1) both;
                    }
                    .level-clear-aura {
                        animation: level-clear-aura 1000ms cubic-bezier(.18,.9,.2,1) both;
                    }
                    .level-clear-spark {
                        position: absolute;
                        left: 50%; top: 50%;
                        width: 9px; height: 9px;
                        border-radius: 999px;
                        background: #34D399;
                        box-shadow: 0 0 18px rgba(52,211,153,.5);
                        animation: level-clear-spark 980ms cubic-bezier(.16,.9,.25,1) both;
                        animation-delay: var(--spark-delay);
                    }
                    .level-clear-spark-1  { --spark-x:-132px; --spark-y: -96px; --spark-delay:  0ms; background:#38BDF8; }
                    .level-clear-spark-2  { --spark-x: -86px; --spark-y:-148px; --spark-delay: 35ms; }
                    .level-clear-spark-3  { --spark-x:   4px; --spark-y:-168px; --spark-delay: 70ms; background:#A78BFA; }
                    .level-clear-spark-4  { --spark-x:  92px; --spark-y:-132px; --spark-delay:100ms; }
                    .level-clear-spark-5  { --spark-x: 144px; --spark-y: -54px; --spark-delay:130ms; background:#38BDF8; }
                    .level-clear-spark-6  { --spark-x: 132px; --spark-y:  68px; --spark-delay:160ms; }
                    .level-clear-spark-7  { --spark-x:  66px; --spark-y: 138px; --spark-delay:190ms; background:#A78BFA; }
                    .level-clear-spark-8  { --spark-x: -20px; --spark-y: 156px; --spark-delay:220ms; }
                    .level-clear-spark-9  { --spark-x:-104px; --spark-y: 116px; --spark-delay:250ms; background:#38BDF8; }
                    .level-clear-spark-10 { --spark-x:-154px; --spark-y:  30px; --spark-delay:280ms; }
                    .level-clear-spark-11 { --spark-x:  52px; --spark-y: -92px; --spark-delay:310ms; background:#A78BFA; }
                    .level-clear-spark-12 { --spark-x: -58px; --spark-y:  72px; --spark-delay:340ms; }

                    /* ════════════════════════════════════════
                       KEYFRAMES
                    ════════════════════════════════════════ */

                    /* Board shake — hits on the first frame, decays rapidly */
                    @keyframes board-shake {
                        0%   { transform: translate(0, 0) rotate(0deg); }
                        8%   { transform: translate(-9px, -6px) rotate(-.6deg); }
                        16%  { transform: translate(10px,  7px) rotate( .5deg); }
                        24%  { transform: translate(-7px,  4px) rotate(-.4deg); }
                        33%  { transform: translate( 8px, -5px) rotate( .35deg); }
                        42%  { transform: translate(-5px,  6px) rotate(-.25deg); }
                        52%  { transform: translate( 5px, -4px) rotate( .2deg); }
                        62%  { transform: translate(-3px,  4px); }
                        73%  { transform: translate( 3px, -2px); }
                        85%  { transform: translate(-1px,  2px); }
                        100% { transform: translate(0, 0); }
                    }

                    /* Failure card entrance */
                    @keyframes failure-card {
                        0%   { transform: translateY(18px) scale(.86); opacity: 0; }
                        30%  { transform: translateY(0) scale(1.04); opacity: 1; }
                        100% { transform: translateY(0) scale(1); opacity: 1; }
                    }

                    @keyframes failure-aura {
                        0%   { transform: scale(.3); opacity: 0; }
                        40%  { transform: scale(1); opacity: 1; }
                        100% { transform: scale(1.15); opacity: .8; }
                    }

                    /* Bomb idle — two uneven mechanical ticks per cycle */
                    @keyframes bomb-idle {
                        0%   { transform: scale(1) rotate(0deg);    filter: drop-shadow(0 2px 4px rgba(0,0,0,.22)); }
                        /* tick 1: sharp snap */
                        4%   { transform: scale(.91) rotate(-7deg); filter: drop-shadow(0 1px 2px rgba(0,0,0,.15)); }
                        8%   { transform: scale(1.06) rotate(4deg); filter: drop-shadow(0 3px 14px rgba(239,68,68,.55)); }
                        13%  { transform: scale(1) rotate(0deg);    filter: drop-shadow(0 2px 8px rgba(239,68,68,.25)); }
                        /* settle */
                        42%  { transform: scale(1) rotate(0deg);    filter: drop-shadow(0 2px 4px rgba(0,0,0,.18)); }
                        /* tick 2: slightly stronger */
                        47%  { transform: scale(.90) rotate(8deg);  filter: drop-shadow(0 1px 2px rgba(0,0,0,.15)); }
                        52%  { transform: scale(1.08) rotate(-4deg);filter: drop-shadow(0 3px 18px rgba(239,68,68,.70)); }
                        58%  { transform: scale(1) rotate(0deg);    filter: drop-shadow(0 2px 10px rgba(239,68,68,.32)); }
                        100% { transform: scale(1) rotate(0deg);    filter: drop-shadow(0 2px 4px rgba(0,0,0,.22)); }
                    }

                    /* Bomb explode — pre-impact shudder → flash → disintegrate */
                    @keyframes bomb-explode {
                        0%   { transform: scale(1) translate(0,0);         opacity: 1; filter: brightness(1); }
                        5%   { transform: scale(.9) translate(-4%,3%);     opacity: 1; filter: brightness(1.4); }
                        10%  { transform: scale(.9) translate(4%,-3%);     opacity: 1; filter: brightness(1.4); }
                        16%  { transform: scale(1.15) translate(-1%,1%);   opacity: 1; filter: brightness(5) saturate(0); }
                        22%  { transform: scale(2.8);                      opacity: 1; filter: brightness(6) saturate(0); }
                        38%  { transform: scale(4.6);                      opacity: .7; filter: brightness(3.5) blur(.5px); }
                        62%  { transform: scale(6.0);                      opacity: .25; filter: brightness(2) blur(1.5px); }
                        100% { transform: scale(6.8);                      opacity: 0;  filter: brightness(1) blur(3px); }
                    }

                    /* Shockwave ring — starts from 0, expands out hard */
                    @keyframes be-ring {
                        0%   { transform: translate(-50%,-50%) scale(0);   opacity: 1; }
                        20%  { opacity: 1; }
                        100% { transform: translate(-50%,-50%) scale(8);   opacity: 0; }
                    }

                    /* Core fireball — burst and dissipate */
                    @keyframes be-core {
                        0%   { transform: translate(-50%,-50%) scale(0);   opacity: 1; }
                        25%  { transform: translate(-50%,-50%) scale(2.2); opacity: 1; }
                        100% { transform: translate(-50%,-50%) scale(5);   opacity: 0; }
                    }

                    /* Source block — impact punch then fragment away */
                    @keyframes source-blasted {
                        0%   { transform: scale(1);        opacity: 1; filter: brightness(1); }
                        7%   { transform: scale(1.65);     opacity: 1; filter: brightness(6) saturate(0); }
                        16%  { transform: scale(.45) rotate(12deg);  opacity: .85; filter: brightness(3); }
                        32%  { transform: scale(.25) rotate(-8deg);  opacity: .5;  filter: brightness(2); }
                        100% { transform: scale(0)  rotate(22deg);   opacity: 0;   filter: brightness(1); }
                    }

                    /* Fragment keyframes: left/top use board-% coords (truly spatial),
                       transform handles scale + spin. Mid-arc keyframe: H at 68% of path,
                       V at 35% — horizontal momentum outruns vertical, simulating arc.
                       Final top adds gravity sag. animation-fill-mode:both freezes start pos during delay. */
                    @keyframes bf-chunk {
                        0% {
                            left: var(--sx); top: var(--sy);
                            transform: translate(-50%,-50%) scale(1.6) rotate(0deg);
                            opacity: 1; filter: brightness(1.8);
                        }
                        10% { filter: brightness(1); }
                        55% {
                            left:  calc(var(--sx) + (var(--ex) - var(--sx)) * .68);
                            top:   calc(var(--sy) + (var(--ey) - var(--sy)) * .35);
                            transform: translate(-50%,-50%) scale(.52) rotate(calc(var(--fr) * .5));
                            opacity: .9;
                        }
                        100% {
                            left: var(--ex);
                            top:  calc(var(--ey) + 3.5%);
                            transform: translate(-50%,-50%) scale(.04) rotate(var(--fr));
                            opacity: 0;
                        }
                    }

                    @keyframes bf-shard {
                        0% {
                            left: var(--sx); top: var(--sy);
                            transform: translate(-50%,-50%) scale(1.5) rotate(0deg);
                            opacity: 1; filter: brightness(2.2);
                        }
                        8%  { filter: brightness(1); }
                        50% {
                            left:  calc(var(--sx) + (var(--ex) - var(--sx)) * .65);
                            top:   calc(var(--sy) + (var(--ey) - var(--sy)) * .30);
                            transform: translate(-50%,-50%) scale(.38) rotate(calc(var(--fr) * .5));
                            opacity: .85;
                        }
                        100% {
                            left: var(--ex);
                            top:  calc(var(--ey) + 4.5%);
                            transform: translate(-50%,-50%) scale(.03) rotate(var(--fr));
                            opacity: 0;
                        }
                    }

                    @keyframes bf-spark {
                        0% {
                            left: var(--sx); top: var(--sy);
                            transform: translate(-50%,-50%) scale(2.4) rotate(0deg);
                            opacity: 1; filter: brightness(3);
                        }
                        12% { filter: brightness(1.5); }
                        45% {
                            left:  calc(var(--sx) + (var(--ex) - var(--sx)) * .62);
                            top:   calc(var(--sy) + (var(--ey) - var(--sy)) * .26);
                            transform: translate(-50%,-50%) scale(.5) rotate(calc(var(--fr) * .6));
                            opacity: .75;
                        }
                        100% {
                            left: var(--ex);
                            top:  calc(var(--ey) + 6%);
                            transform: translate(-50%,-50%) scale(.05) rotate(var(--fr));
                            opacity: 0;
                        }
                    }

                    @keyframes source-merge {
                        0%   { transform: scale(1); opacity: 1; }
                        38%  { transform: scale(1.28); opacity: 1; filter: drop-shadow(0 0 16px rgba(52,211,153,.5)); }
                        100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 10px rgba(52,211,153,.36)); }
                    }

                    @keyframes source-touch {
                        0%   { transform: scale(1); }
                        38%  { transform: scale(1.18); }
                        100% { transform: scale(1); }
                    }

                    @keyframes goal-merge {
                        0%   { transform: scale(1); opacity: 1; }
                        44%  { transform: scale(1.42); opacity: .85; }
                        100% { transform: scale(1); opacity: 1; }
                    }

                    @keyframes level-clear-card {
                        0%   { transform: translateY(14px) scale(.88); opacity: 0; }
                        28%  { transform: translateY(0) scale(1.04); opacity: 1; }
                        100% { transform: translateY(0) scale(1); opacity: 1; }
                    }

                    @keyframes level-clear-aura {
                        0%   { transform: scale(.36); opacity: 0; }
                        35%  { transform: scale(1); opacity: 1; }
                        100% { transform: scale(1.18); opacity: .75; }
                    }

                    @keyframes level-clear-spark {
                        0%   { transform: translate(-50%,-50%) scale(.3); opacity: 0; }
                        18%  { opacity: 1; }
                        100% { transform: translate(calc(-50% + var(--spark-x)), calc(-50% + var(--spark-y))) scale(.95); opacity: 0; }
                    }
                `}</style>
            </div>
        </div>
    )
}
