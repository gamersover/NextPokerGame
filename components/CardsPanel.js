import Image from "next/image"

function GameCard({ id, name, isSelected, isFriendCard, handleMouseUp, handleMouseDown, handleMouseEnter, marginLeft, imageWidth }) {
    function handleEnter() {
        handleMouseEnter && handleMouseEnter(id)
    }

    function handleDown(e) {
        handleMouseDown && handleMouseDown(id)
        e.target.releasePointerCapture(e.pointerId)
    }

    return (
        <>
            <Image
                id={id}
                src={`/pokers/${name}.svg`}
                width={20}
                height={20}
                className={`shadow-md ${imageWidth} ${marginLeft} h-auto transition-transform ${isFriendCard ? 'border-red-400 border-[1px]' : ''} ${isSelected ? '-translate-y-3' : ''}`}
                style={{ zIndex: id }}
                alt=""
                onPointerDown={(e) => handleDown(e)}
                onPointerEnter={handleEnter}
                onPointerUp={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
            />
        </>
    )
}


export default function CardsPanel({ cards, handleMouseDown, handleMouseUp, handleMouseEnter, size = "normal" }) {
    const imageWidth = {
        normal: "w-[4rem]",
        small: "w-[2.75rem]",
    }

    const marginLeft = {
        normal: "-ml-10",
        small: "-ml-8"
    }

    function handleMoveEnd(e) {
        const fromElement = e.relatedTarget
        if(!e.currentTarget.contains(fromElement)) {
            handleMouseUp(e)
        }
    }

    function handleTouchEnd(e) {
        handleMouseUp(e)
    }

    return (
        <div className="flex flex-wrap justify-center" onMouseOut={e => handleMoveEnd(e)} onTouchEnd={e => handleTouchEnd(e)}>
            {cards.map((card, i) => <GameCard
                key={card.id || i}
                id={i}
                name={card.showName}
                isSelected={card.selected}
                isFriendCard={card.isFriendCard}
                handleMouseUp={handleMouseUp}
                handleMouseDown={handleMouseDown}
                handleMouseEnter={handleMouseEnter}
                marginLeft={i == 0 ? '' : marginLeft[size]}
                imageWidth={imageWidth[size]}
            />)}
        </div>
    )
}