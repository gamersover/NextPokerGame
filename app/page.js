"use client"


import { useMemo, useState, useRef, useEffect } from "react";
import { Lobby } from "@/features/lobby";
import { PokerGame, PokerProvider, PokerRoom } from "@/features/poker";
import { SyncBlocksGame } from "@/features/sync-blocks";
import { useLocalStorage } from "@/utils/hooks";

export default function App() {
    const [currPage, setCurrPage] = useState("home")
    const [themeOption, setThemeOption] = useLocalStorage("theme", "light")
    const [isMusicOn, setIsMusicOn] = useLocalStorage("music", false)
    const bgm = useRef(null)

    useEffect(() => {
        const pageTitles = {
            home: "游戏大厅",
            game: "四人纸牌-找朋友",
            room: "四人纸牌-找朋友",
            tvGame: "同步方块"
        }

        document.title = pageTitles[currPage] || "游戏大厅"
    }, [currPage])

    function handleStart(gameId = "cards") {
        const audio = bgm.current
        if (gameId === "cards" && isMusicOn) {
            audio.src = "/bgm.mp3"
            audio.loop = true
            audio.addEventListener("timeupdate", () => {
                if (audio.currentTime >= 32) {
                    audio.currentTime = 0
                }
            })
            audio.currentTime = 0
            audio.play().catch((error) => {
                console.log(error)
            })
        }
        else {
            audio.pause()
        }
        setCurrPage(gameId === "tv" ? "tvGame" : "game")
    }

    function handleBack() {
        const audio = bgm.current
        audio.pause()
        audio.src = ""
        audio.load()
        setCurrPage("home")
    }

    function renderPage() {
        if (currPage === "home") {
            return <Lobby
                themeOption={themeOption}
                setThemeOption={setThemeOption}
                isMusicOn={isMusicOn}
                setIsMusicOn={setIsMusicOn}
                handleStart={handleStart}
            />
        }
        else if (currPage === "game") {
            return <PokerGame
                setCurrPage={setCurrPage}
                handleBack={handleBack}
                themeOption={themeOption}
                setThemeOption={setThemeOption}
                isMusicOn={isMusicOn}
                setIsMusicOn={setIsMusicOn}
            />
        }
        else if (currPage === "tvGame") {
            return <SyncBlocksGame handleBack={handleBack}/>
        }
        else if (currPage === "room") {
            return <PokerRoom setCurrPage={setCurrPage}/>
        }
    }

    const theme = useMemo(() => {
        if (themeOption !== 'follow') {
            return themeOption
        }
        else {
            if (matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark'
            }
            else {
                return 'light'
            }
        }
    }, [themeOption])

    return (
        <PokerProvider>
            <body className={`${theme}`}>
                <div className="bg-blue-50 fixed w-full h-full overflow-hidde dark:text-gray-200 dark:bg-black">
                    {renderPage()}
                </div>
                <audio ref={bgm}></audio>
            </body>
        </PokerProvider>
    )
}
