import Image from "next/image"

function GameCard({ id, name, isSelected, handleMouseUp, handleMouseDown, handleMouseEnter, marginLeft, imageWidth }) {
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
                className={`shadow-md ${imageWidth} ${marginLeft} h-auto transition-transform ${isSelected ? '-translate-y-3' : ''}`}
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
        normal: "w-[3.9rem]",
        small: "w-[2.8rem]",
    }

    const marginLeft = {
        normal: "-ml-10",
        small: "-ml-8"
    }

    return (
        <div className="flex flex-wrap justify-center">
            {cards.map((card, i) => <GameCard
                key={card.id || i}
                id={i}
                name={card.showName}
                isSelected={card.selected}
                handleMouseUp={handleMouseUp}
                handleMouseDown={handleMouseDown}
                handleMouseEnter={handleMouseEnter}
                marginLeft={i == 0 ? '' : marginLeft[size]}
                imageWidth={imageWidth[size]}
            />)}
        </div>
    )
}