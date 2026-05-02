"use client";

import { useEffect, useState } from "react"
import NextImage from "next/image"

function HomeTitle() {
    return (
        <div className="flex w-full max-w-5xl items-end justify-between gap-4 px-5 pt-8 sm:px-8">
            <div>
                <p className="text-sm font-black uppercase tracking-[.24em] text-slate-500 dark:text-slate-400">Game Lobby</p>
                <h1 className="mt-2 text-4xl font-black tracking-normal text-slate-950 dark:text-white sm:text-5xl">游戏大厅</h1>
            </div>
            <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-neutral-900 dark:text-slate-400 sm:block">
                2 Games
            </div>
        </div>
    )
}

function TvGamePreview() {
    const sources = [[1, 1], [4, 1]]
    const goals = [[1, 4], [4, 4]]
    const walls = [[1, 3], [2, 3], [3, 3], [4, 3]]
    const monsters = [[3, 2]]

    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#E9F8F3,#EFF6FF_48%,#FFF7ED)]">
            <div className="relative grid h-44 w-44 grid-cols-6 grid-rows-6 border border-slate-300/70 bg-white/60 shadow-[0_18px_42px_rgba(15,23,42,.14)]">
                {Array.from({ length: 36 }).map((_, index) => {
                    const x = index % 6
                    const y = Math.floor(index / 6)
                    const isSource = sources.some(([cx, cy]) => cx === x && cy === y)
                    const isGoal = goals.some(([cx, cy]) => cx === x && cy === y)
                    const isWall = walls.some(([cx, cy]) => cx === x && cy === y)
                    const isMonster = monsters.some(([cx, cy]) => cx === x && cy === y)
                    return (
                        <div
                            key={index}
                            className="relative flex items-center justify-center border-r border-b border-slate-300/70"
                        >
                            {isGoal && <div className="h-4 w-4 rounded-full border-[3px] border-emerald-400" />}
                            {isWall && <div className="h-5 w-5 rounded-full bg-slate-400" />}
                            {isMonster && (
                                <div className="relative h-6 w-6 rounded-full bg-rose-500">
                                    <div className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                                    <div className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                                </div>
                            )}
                            {isSource && <div className="h-5 w-5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.18)]" />}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function PokerGamePreview() {
    const cards = [
        { src: "/pokers/A_红桃.svg", className: "-rotate-12 translate-y-4" },
        { src: "/pokers/K_黑桃.svg", className: "-rotate-3" },
        { src: "/pokers/Q_方块.svg", className: "rotate-7 translate-y-5" },
    ]

    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#FFF7ED,#FEE2E2_46%,#EEF2FF)]">
            <div className="absolute bottom-0 h-24 w-full bg-white/35" />
            <div className="relative flex items-center justify-center">
                {cards.map((card, index) => (
                    <NextImage
                        key={card.src}
                        src={card.src}
                        alt=""
                        width={130}
                        height={180}
                        className={`-mx-4 h-36 w-auto rounded-md shadow-[0_18px_34px_rgba(15,23,42,.20)] ${card.className}`}
                        priority={index === 1}
                    />
                ))}
            </div>
        </div>
    )
}

function GameSelectCard({ title, subtitle, meta, tone, onClick, preview }) {
    const isTvGame = title === "同步方块"
    const toneClass = tone === "cards"
        ? "from-rose-500 to-amber-400"
        : "from-emerald-400 to-sky-400"

    return (
        <article
            className="group relative flex h-[430px] w-full max-w-[440px] flex-col overflow-hidden rounded-lg border border-white/80 bg-white text-left shadow-[0_22px_60px_rgba(15,23,42,.12)] transition active:scale-[.99] hover:-translate-y-1 hover:shadow-[0_28px_72px_rgba(15,23,42,.16)] dark:border-slate-800 dark:bg-neutral-900"
        >
            <div className="relative h-[58%] overflow-hidden">
                <button type="button" aria-label={`开始${title}`} onClick={onClick} className="absolute inset-0 z-10 h-full w-full" />
                {preview}
                <div className={`pointer-events-none absolute left-5 top-5 z-20 rounded-full bg-gradient-to-r ${toneClass} px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-white shadow-lg`}>
                    {meta}
                </div>
            </div>
            <button type="button" onClick={onClick} className="flex flex-1 flex-col justify-between p-6 text-left">
                <div>
                    <h2 className="text-3xl font-black tracking-normal text-slate-950 dark:text-white">{title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{subtitle}</p>
                </div>
                <div className="mt-5 flex items-center justify-between">
                    <span className={`text-sm font-black ${isTvGame ? "text-emerald-600" : "text-rose-600"}`}>
                        开始游戏
                    </span>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${toneClass} text-lg font-black text-white shadow-lg transition group-hover:translate-x-1`}>
                        →
                    </span>
                </div>
            </button>
        </article>
    )
}

function HomeButton({ handleStart }) {
    return (
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 px-5 pb-8 sm:grid-cols-2 sm:px-8">
            <GameSelectCard
                title="四人纸牌-找朋友"
                subtitle="四人组局，叫分找朋友，和队友配合赢下牌局。"
                meta="Poker"
                tone="cards"
                onClick={() => handleStart("cards")}
                preview={<PokerGamePreview />}
            />
            <GameSelectCard
                title="同步方块"
                subtitle="同步移动红色方块，避开怪物陷阱，点亮全部目标。"
                meta="Puzzle"
                tone="sync"
                onClick={() => handleStart("tv")}
                preview={<TvGamePreview />}
            />
        </div>
    )
}

export default function Home({ handleStart }) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {isLoading && (
                <div className="fixed left-0 top-0 z-[200] flex h-full w-full items-center justify-center bg-slate-100 dark:bg-neutral-950">
                    <div className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[.18em] text-slate-500 shadow-lg dark:bg-neutral-900 dark:text-slate-400">Loading</div>
                </div>
            )}
            <div className="relative h-screen w-screen overflow-y-auto bg-[#F3F6FA] dark:bg-neutral-950">
                <div className="pointer-events-none fixed inset-0">
                    <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,.95),rgba(243,246,250,0))] dark:bg-[linear-gradient(180deg,rgba(15,23,42,.55),rgba(10,10,10,0))]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(251,146,60,.16),transparent_32%),radial-gradient(circle_at_82%_24%,rgba(45,212,191,.18),transparent_34%)]" />
                </div>
                <div className="relative mx-auto flex min-h-full w-full flex-col items-center gap-8">
                    <HomeTitle />
                    <HomeButton handleStart={handleStart} />
                </div>
            </div>
        </>
    )
}
