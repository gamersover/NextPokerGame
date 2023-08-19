import React, { useEffect, useState } from 'react';

const Toast = ({ message, duration }) => {
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
            className={`fixed z-[101] top-1 ${show ? 'right-2 animate-right-in' : '-right-full'}
                } bg-red-600 text-sm text-white p-2 rounded shadow`}
        >
            {message.msg}
        </div>
    );
};

export default Toast;