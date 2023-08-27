export default function CircleContent({className, circleTitle, circleChild, titleBgColor, circleSize='normal', contentSize='normal'}) {
    const circlestyleConfig = {
        normal: {
            height: "h-8",
            width: "w-8",
            fontSize: "text-base"
        },
        small: {
            height: "h-5",
            width: "w-5",
            fontSize: "text-[10px]"
        }
    }

    const contentStyleConfig = {
        normal: {
            width: "w-[5.3rem]"
        },
        small: {
            width: "w-9"
        }
    }


    return (
        <div className={`flex ${circlestyleConfig[circleSize].height} ${className}`}>
            <div className={`${titleBgColor} ${circlestyleConfig[circleSize].fontSize} rounded-full flex justify-center items-center ${circlestyleConfig[circleSize].height} ${circlestyleConfig[circleSize].width}`}>{circleTitle}</div>
            <div className={`bg-white bg-opacity-60 ${circlestyleConfig[circleSize].fontSize} rounded-md px-1 flex justify-center items-center ${contentStyleConfig[contentSize].width}`}>
                <span className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap">{circleChild}</span>
            </div>
        </div>
    )
}