import Image from "next/image"
import { useEffect, useState } from "react"

function GameCard({ id, name, isSelected, handleMouseUp, handleMouseDown, handleMouseEnter, marginLeft, imageWidth }) {
    const [isMobile, setIsMobile] = useState(false);

    function handleEnter() {
        handleMouseEnter && handleMouseEnter(id)
    }

    function handleDown() {
        handleMouseDown && handleMouseDown(id)
    }

    function handleDownForMobile(e) {
        handleDown()
        e.target.releasePointerCapture(e.pointerId)
    }

    useEffect(() => {
        const checkIsMobile = () => {
          setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };

        checkIsMobile(); // 在组件挂载时执行一次判断

      }, []);

    return (
        <>
            {isMobile ? (
                <Image
                    id={id}
                    src={`/pokers/${name}.svg`}
                    width={20}
                    height={20}
                    className={`shadow-md ${imageWidth} ${marginLeft} h-auto transition-transform ${isSelected ? '-translate-y-3' : ''}`}
                    // onClick={handleSelect}
                    style={{ zIndex: id }}
                    alt=""
                    onPointerDown={(e) => handleDownForMobile(e)}
                    onPointerEnter={handleEnter}
                    onPointerUp={handleMouseUp}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                />
            ) : (
                <Image
                    id={id}
                    src={`/pokers/${name}.svg`}
                    width={20}
                    height={20}
                    className={`shadow-md ${imageWidth} ${marginLeft} h-auto transition-transform ${isSelected ? '-translate-y-3' : ''}`}
                    // onClick={handleSelect}
                    style={{ zIndex: id }}
                    alt=""
                    onMouseDown={handleDown}
                    onMouseEnter={handleEnter}
                    onMouseUp={handleMouseUp}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                />
            )}
        </>
    )
}


export default function CardsPanel({ cards, handleMouseDown, handleMouseUp, handleMouseEnter, size = "normal" }) {
    let cards_len_level = 0
    if (cards.length >= 23) {
        cards_len_level = 4
    }
    else if (cards.length >= 20) {
        cards_len_level = 3
    }
    else if (cards.length >= 15) {
        cards_len_level = 2
    }
    else if (cards.length >= 10) {
        cards_len_level = 1
    }
    else if (cards.length >= 1) {
        cards_len_level = 0
    }

    const imageWidth = {
        normal: "w-16",
        small: "w-9",
    }

    const marginLeft = {
        normal: ["-ml-3", "-ml-5", "-ml-7", "-ml-9", "-ml-10"],
        small: ["-ml-6", "-ml-6", "-ml-7", "-ml-7", "-ml-7"]
    }

    return (
        <div className={"flex flex-wrap justify-center"}>
            {cards.map((card, i) => <GameCard
                key={card.id || i}
                id={i}
                name={card.showName}
                isSelected={card.selected}
                handleMouseUp={handleMouseUp}
                handleMouseDown={handleMouseDown}
                handleMouseEnter={handleMouseEnter}
                marginLeft={i == 0 ? '' : marginLeft[size][cards_len_level]}
                imageWidth={imageWidth[size]}
            />)}
        </div>
    )
}