export default function CircleContent({circleTitle, circleChild, titleBgColor, circleSize='normal', contentSize='normal'}) {
    const circlestyleConfig = {
        normal: {
            height: "h-6",
            width: "w-6",
            fontSize: "text-sm"
        },
        small: {
            height: "h-5",
            width: "w-5",
            fontSize: "text-xs"
        }
    }

    const contentStyleConfig = {
        normal: {
            width: "w-16"
        },
        small: {
            width: "w-8"
        }
    }


    return (
        <div className={`flex ${circlestyleConfig[circleSize].height}`}>
            <div className={`${titleBgColor} ${circlestyleConfig[circleSize].fontSize} rounded-full flex justify-center items-center ${circlestyleConfig[circleSize].height} ${circlestyleConfig[circleSize].width} text-sm`}>{circleTitle}</div>
            <div className={`bg-white bg-opacity-60 ${circlestyleConfig[circleSize].fontSize} rounded-md px-1 flex justify-center items-center ${contentStyleConfig[contentSize].width}`}>{circleChild}</div>
        </div>
    )
}