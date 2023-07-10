import Image from "next/image"
import { useState } from "react"


function GameCard({ cardName }) {
    const [isSelect, setIsSelect] = useState(false)

    function handleSelect(e) {
        setIsSelect(!isSelect)
        console.log(e.target.alt)
    }

    return (
        <Image
            src={`/${cardName}.svg`}
            width={60}
            height={60}
            alt={`${cardName}`}
            className={`shadow-md -ml-5 ${isSelect ? '-translate-y-3' : ''}`}
            onClick={(e) => handleSelect(e)}
        />
    )
}


export default function CardsPanel({ cards }) {
    return (
        <div className={"flex"}>
            {cards.map((card, i) => <GameCard key={i} cardName={card} />)}
        </div>
    )
}