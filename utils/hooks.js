import { useCallback, useEffect, useState } from "react";

const storage = {
    getItem(key, initialValue) {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const unparsedValue = window.localStorage[key];
            if (typeof unparsedValue === "undefined") {
                return initialValue;
            }
            return JSON.parse(unparsedValue);
        } catch (error) {
            return initialValue;
        }
    },

    setItem(key, value) {
        if (typeof window === "undefined") {
            return;
        }
        window.localStorage.setItem(key, JSON.stringify(value))
    },
};


export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(initialValue)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        setValue(storage.getItem(key, initialValue))
        setIsInitialized(true)
    }, [key, initialValue])

    const setItem = useCallback((newValue) => {
        setValue((currentValue) => {
            const valueToStore = typeof newValue === "function" ? newValue(currentValue) : newValue
            storage.setItem(key, valueToStore);
            return valueToStore;
        });
    }, [key]);

    return [value, setItem, isInitialized];
}
