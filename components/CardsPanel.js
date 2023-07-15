function GameCard({ id, cardName, isSelected, onCardSelect, marginLeft, imageWidth }) {

    function handleSelect() {
        onCardSelect && onCardSelect(id)
    }

    return (
        <>
            <img
                id={id}
                src={`/${cardName}.svg`}
                className={`shadow-md ${imageWidth} ${marginLeft} ${isSelected ? '-translate-y-3' : ''}`}
                onClick={handleSelect}
                style={{zIndex:  id}}
            />
        </>
    )
}


export default function CardsPanel({ cards, onCardSelect = null, size="normal"}) {
    let imageWidth = null;
    if (size == "normal") {
        imageWidth = "w-16"
    }
    else if (size == "small"){
        imageWidth = "w-10"
    }

    let marginLeft = "-ml-0"
    if (cards.length >= 23) {
        marginLeft = "-ml-10"
    }
    else if (cards.length >= 20) {
        marginLeft = "-ml-9"
    }
    else if (cards.length >= 15) {
        marginLeft = "-ml-7"
    }
    else if (cards.length >= 10) {
        marginLeft = "-ml-5"
    }
    else if (cards.length >= 1) {
        marginLeft = "-ml-3"
    }

    return (
        <div className={"flex ml-12"}>
            {cards.map((card, i) => <GameCard
                key={i}
                id={i}
                cardName={card.cardName}
                isSelected={card.selected}
                onCardSelect={onCardSelect}
                marginLeft={marginLeft}
                imageWidth={imageWidth}
            />)}
        </div>
    )
}