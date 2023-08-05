"use client";

export default function GameButton({ title, classes, onClick, shouldDisable = false }) {
    return (
        <button
            disabled={shouldDisable}
            type={"button"}
            className={`w-16 h-9 rounded-xl ${shouldDisable ? '' : "active:scale-[0.9]"} text-md flex justify-center items-center ${classes}`}
            onClick={onClick}
        >
            {title}
        </button>
    )
}