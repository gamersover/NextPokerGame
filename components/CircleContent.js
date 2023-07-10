export default function CircleContent({circleTitle, circleChild, titleBgColor, size='normal'}) {
    const styleConfig = {
        normal: {
            cicleHeight: "h-6",
            circleWidth: "w-6",
            contentWidth: "w-16"
        },
        small: {
            cicleHeight: "h-6",
            circleWidth: "w-6",
            contentWidth: "w-8"
        }
    }


    // TODO: 这种动态tailwindcss，最终打包生成的css没办法覆盖到
    return (
        <div className={`flex ${styleConfig[size].cicleHeight}`}>
            <div className={`${titleBgColor} rounded-full flex justify-center items-center ${styleConfig[size].cicleHeight} ${styleConfig[size].circleWidth} text-sm`}>{circleTitle}</div>
            <div className={`bg-white bg-opacity-60 rounded-md px-1 flex justify-center items-center ${styleConfig[size].contentWidth}`}>{circleChild}</div>
        </div>
    )
}