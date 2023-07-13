"use client";

export default function GameButton({ title, classes, onClick, shouldDisable = false }) {
    return (
        <button
            disabled={shouldDisable}
            type={"button"}
            className={`game-button ${classes}`}
            onClick={onClick}
        >
            <span className="flex-1 font-normal">
                {title}
            </span>
        </button>
    )
}