"use client"


import DataProvider from "@/components/GameContext";
import { useMemo, useState, useRef, useEffect } from "react";
import Home from "./Home";
import Game from "./Game";
import Room from "./Room";
import { useLocalStorage } from "@/utils/hooks";

export default function App() {
    const [currPage, setCurrPage] = useState("home")
    const [themeOption, setThemeOption] = useLocalStorage("theme", "light")
    const [isMusicOn, setIsMusicOn] = useLocalStorage("music", false)
    const bgm = useRef(null)

    function handleStart() {
        const audio = bgm.current
        if (isMusicOn) {
            audio.src = "/bgm.mp3"
            audio.loop = true
            audio.addEventListener("timeupdate", () => {
                if (audio.currentTime >= 30) {
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
        setCurrPage("game")
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
            return <Home
                themeOption={themeOption}
                setThemeOption={setThemeOption}
                isMusicOn={isMusicOn}
                setIsMusicOn={setIsMusicOn}
                handleStart={handleStart}
            />
        }
        else if (currPage === "game") {
            return <Game setCurrPage={setCurrPage} handleBack={handleBack}/>
        }
        else if (currPage === "room") {
            return <Room setCurrPage={setCurrPage}/>
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
        <DataProvider>
            <body className={`${theme}`}>
                <div className="bg-blue-50 fixed w-full h-full overflow-hidde dark:text-gray-200 dark:bg-black">
                    {renderPage()}
                </div>
                <audio ref={bgm}></audio>
            </body>
        </DataProvider>
    )
}