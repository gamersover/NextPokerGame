"use client"


import DataProvider from "@/components/GameContext";
import { useState, useEffect } from "react";
import Home from "./Home";
import Game from "./Game";
import Room from "./Room";

export default function App() {
    const [currPage, setCurrPage] = useState("home")
    const [theme, setTheme] = useState("light")

    function renderPage() {
        if (currPage === "home") {
            return <Home theme={theme} setTheme={setTheme} setCurrPage={setCurrPage}/>
        }
        else if (currPage === "game") {
            return <Game setCurrPage={setCurrPage}/>
        }
        else if (currPage === "room") {
            return <Room setCurrPage={setCurrPage}/>
        }
    }

    return (
        <DataProvider>
            <body className={`${theme}`}>
                <div className="bg-blue-50 fixed w-full h-full overflow-hidde dark:text-gray-200 dark:bg-black">
                    {renderPage()}
                </div>
            </body>
        </DataProvider>
    )
}