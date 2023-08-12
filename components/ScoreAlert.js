import React, { useEffect, useState } from 'react';

const ScoreAlert = ({ scoreObj, duration }) => {
    const [show, setShow] = useState(false);
    const {score, num_rounds} = scoreObj

    useEffect(() => {
        setShow(true);
        const timer = setTimeout(() => {
            setShow(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [score, num_rounds]);

    return (
        <>
            {score > 0 &&
                (<div className={`absolute flex justify-center items-center ${show ? "animate-flash-alert" : "hidden"} scale-0 text-2xl rounded-md opacity-0 font-bold text-green-700 z-[100]`}>
                    +{score}
                </div>
                )
            }
        </>
    )
};

export default ScoreAlert;