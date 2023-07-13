import Image from "next/image"
import { useContext, useEffect, useState } from "react"
import { UserInfoContext } from "./GameContext"


function GameCard({ id, cardName, isSelected, onCardSelect }) {

    function handleSelect() {
        onCardSelect(id)
    }

    return (
        <Image
            src={`/${cardName}.svg`}
            id={id}
            width={60}
            height={60}
            alt={`${cardName}`}
            className={`shadow-md -ml-5 ${isSelected ? '-translate-y-3' : ''}`}
            onClick={(e) => handleSelect(e)}
        />
    )
}


export default function CardsPanel({ cards, onCardSelect }) {
    return (
        <div className={"flex"}>
            {cards.map((card, i) => <GameCard
                                        key={i}
                                        id={i}
                                        cardName={card.cardName}
                                        isSelected={card.selected}
                                        onCardSelect={onCardSelect}
                                    />)}
        </div>
    )
}