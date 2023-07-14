export default function CircleContent({circleTitle, circleChild, titleBgColor, size='normal'}) {
    const styleConfig = {
        normal: {
            cicleHeight: "h-6",
            circleWidth: "w-6",
            contentWidth: "w-16",
            fontSize: "text-sm"
        },
        small: {
            cicleHeight: "h-5",
            circleWidth: "w-5",
            contentWidth: "w-8",
            fontSize: "text-xs"
        }
    }


    return (
        <div className={`flex ${styleConfig[size].cicleHeight}`}>
            <div className={`${titleBgColor} ${styleConfig[size].fontSize} rounded-full flex justify-center items-center ${styleConfig[size].cicleHeight} ${styleConfig[size].circleWidth} text-sm`}>{circleTitle}</div>
            <div className={`bg-white bg-opacity-60 ${styleConfig[size].fontSize} rounded-md px-1 flex justify-center items-center ${styleConfig[size].contentWidth}`}>{circleChild}</div>
        </div>
    )
}