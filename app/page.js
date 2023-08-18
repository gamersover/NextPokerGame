"use client"


import DataProvider from "@/components/GameContext";
import { useState } from "react";
import Home from "./Home";
import Game from "./Game";
import Room from "./Room";

export default function App() {
    const [currPage, setCurrPage] = useState("home")

    function renderPage() {
        if (currPage === "home") {
            return <Home setCurrPage={setCurrPage}/>
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
            <>
                {renderPage()}
            </>
        </DataProvider>
    )
}