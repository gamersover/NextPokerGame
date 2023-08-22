"use client";
import { useState } from "react";

export default function GameButton({ children, classes, onClick, shouldDisable = false }) {
    const [isLoading, setIsLoading] = useState(false);
    const disabled = shouldDisable || isLoading

    function handleClick() {
        if (!isLoading) {
            setIsLoading(true)
            onClick()
            setIsLoading(false)
        }
    }

    return (
        <button
            disabled={disabled}
            type={"button"}
            className={`w-16 h-9 rounded-xl ${disabled ? '' : "active:scale-95"} text-md flex font-bold justify-center items-center ${classes}`}
            onClick={handleClick}
        >
            {children}
        </button>
    )
}