"use client";

export default function GameButton({ title, classes, handleClick, shouldDisable = false }) {
    return (
        <button
            disabled={shouldDisable}
            type={"button"}
            className={`game-button ${classes}`}
            onClick={handleClick}
        >
            <span className="flex-1 font-normal">
                {title}
            </span>
        </button>
    )
}