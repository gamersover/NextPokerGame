export default function CircleContent({className, circleTitle, children, titleBgColor, circleSize='normal', contentSize='normal'}) {
    const circlestyleConfig = {
        normal: {
            height: "h-8",
            width: "w-8",
            fontSize: "text-base"
        },
        small: {
            height: "h-5",
            width: "w-5",
            fontSize: "text-sm"
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
        <div className={`flex ${circlestyleConfig[circleSize].height} ${className ?? ''}`}>
            <div className={`${titleBgColor} ${circlestyleConfig[circleSize].fontSize} rounded-full flex justify-center items-center ${circlestyleConfig[circleSize].height} ${circlestyleConfig[circleSize].width}`}>{circleTitle}</div>
            <div className={`bg-white dark:bg-neutral-600 bg-opacity-60 ${circlestyleConfig[circleSize].fontSize} rounded-md px-1 flex justify-center items-center ${contentStyleConfig[contentSize].width}`}>
                {children}
            </div>
        </div>
    )
}