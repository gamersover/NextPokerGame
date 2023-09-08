import React, { useEffect, useState } from 'react';
import { ErrorIcon } from './Icons';

const Toast = ({ message, color = "primary", duration = 2000 }) => {
    const colorStyle = {
        error: "border-red-600 text-red-600",
        primary: "border-sky-600 text-sky-600"
    }

    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
        const timer = setTimeout(() => {
            setShow(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [message]);

    return (
        <div

            className={`fixed flex items-center gap-1 z-[200] top-2 transition-transform ${show ? 'animate-top-in' : 'animate-top-out'} bg-slate-100 border-[1px] p-2 rounded-full drop-shadow-md ${colorStyle[color]}`}
        >
            {color === "error" && <ErrorIcon className={"h-6 w-6"} />}{message.msg}
        </div>
    );
};

export default Toast;