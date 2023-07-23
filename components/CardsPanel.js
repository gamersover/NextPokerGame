function GameCard({ id, name, isSelected, onCardSelect, marginLeft, imageWidth }) {

    function handleSelect() {
        onCardSelect && onCardSelect(id)
    }

    return (
        <>
            <img
                id={id}
                src={`/${name}.svg`}
                className={`shadow-md ${imageWidth} ${marginLeft} h-auto ${isSelected ? '-translate-y-3' : ''}`}
                onClick={handleSelect}
                style={{ zIndex: id }}
            />
        </>
    )
}


export default function CardsPanel({ cards, onCardSelect = null, size = "normal" }) {
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
        small: ["-ml-6", "-ml-6", "-ml-7", "-ml-7", "-ml-18"]
    }

    return (
        <div className={"flex"}>
            {cards.map((card, i) => <GameCard
                key={card.id || i}
                id={i}
                name={card.showName}
                isSelected={card.selected}
                onCardSelect={onCardSelect}
                marginLeft={i == 0 ? '' : marginLeft[size][cards_len_level]}
                imageWidth={imageWidth[size]}
            />)}
        </div>
    )
}