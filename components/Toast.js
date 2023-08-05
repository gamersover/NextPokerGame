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
            className={` ani fixed top-4 ${show ? 'right-2 animate-slip-in' : '-right-full'}
                } bg-red-600 text-white p-2 rounded shadow`}
        >
            {message.msg}
        </div>
    );
};

export default Toast;