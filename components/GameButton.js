"use client";

export default function GameButton({ children, classes, onClick, shouldDisable = false }) {
    return (
        <button
            disabled={shouldDisable}
            type={"button"}
            className={`w-16 h-9 rounded-xl ${shouldDisable ? '' : "active:scale-95"} text-md flex justify-center items-center ${classes}`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}